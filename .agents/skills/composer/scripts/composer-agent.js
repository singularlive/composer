#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const tinycolor = require('tinycolor2');
const uuid = require('uuid');
const WebSocket = require('ws');
const credentialSelection = require('./credential-selection');
const {
  captureCompositionPreview,
  createCaptureError,
  MAX_CAPTURE_BYTES
} = require('./capture-composition-preview');
const {
  createPreparedManifest,
  readPreparedManifest,
  finalizeManifest,
  failManifest,
  writeExistingManifest
} = require('./browser-capture-artifact');

const DEFAULT_DEVICE_NAME = 'AI Agent';
const DEFAULT_SERVER_URL = 'https://beta.singular.live/';
const SKILL_VERSION = 2;
const DEFAULT_TIMEOUT_MS = 15000;
const MAX_MEASUREMENT_BYTES = 1024 * 1024;
const PAIRING_INTENT_WAIT_MS = 2 * 60 * 1000;
const PAIRING_INTENT_RETRY_MS = 1100;
const CREDENTIALS_OVERRIDE_PATH = process.env.COMPOSER_AGENT_CREDENTIALS || null;
const DEFAULT_CREDENTIALS_PATH = path.join(os.homedir(), '.singular', 'composer-agent.json');
const CREDENTIALS_SCOPE_PATH = path.resolve(__dirname, '..', '..', '..', '..');
const TEMPORARY_CREDENTIALS_PATH = path.join(
  os.tmpdir(),
  'singular-composer-agent',
  crypto.createHash('sha256').update(CREDENTIALS_SCOPE_PATH).digest('hex').slice(0, 16) + '.json'
);
let activeCredentialsPath = CREDENTIALS_OVERRIDE_PATH || DEFAULT_CREDENTIALS_PATH;
let skillUpdateWarningWritten = false;
const TABLE_WIDGET_ID = 1182;
const MAX_TABLE_ROWS = 1000;
const MAX_TABLE_CONTENT_BYTES = 32 * 1024;
const TABLE_OPTION_FIELDS = [
  'layoutDirection',
  'elementsPerPage',
  'lineSpacing',
  'updateStyle',
  'pageTransitionStyle',
  'pageTransitionOffset',
  'showLayout',
  'currentPage'
];

// Flags that may be passed with no value (default true) or with an explicit
// true/false value.
const BOOLEAN_OPTIONS = new Set([
  'compact',
  'selected',
  'selection',
  'summary',
  'italic',
  'underline',
  'always-execute',
  'create',
  'remove'
]);
const GLOBAL_COMMAND_OPTIONS = ['server', 'compact'];

function parseArguments(argv) {
  const command = argv[0];
  const options = {};
  for (let index = 1; index < argv.length; index++) {
    const argument = argv[index];
    if (!argument.startsWith('--')) {
      throw new Error(`Unexpected argument "${argument}"`);
    }
    const name = argument.slice(2);
    if (BOOLEAN_OPTIONS.has(name)) {
      const booleanValue = argv[index + 1];
      if (booleanValue === 'true' || booleanValue === 'false') {
        options[name] = booleanValue === 'true';
        index++;
      } else {
        options[name] = true;
      }
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${name}`);
    }

    options[name] = value;
    index++;
  }
  return { command, options };
}

function readJsonFile(filePath, description) {
  const inputPath = path.resolve(filePath);
  try {
    return JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  } catch (err) {
    throw new Error(`Unable to read ${description}: ${err.message}`);
  }
}

function readJsonOptionFile(options, name, description, required) {
  const filePath = required
    ? requireOption(options, name)
    : options[name];
  if (filePath === undefined) return undefined;
  return readJsonFile(filePath, description);
}

function parseIds(value) {
  if (value.trim().startsWith('[')) {
    throw new Error('--ids accepts comma-separated IDs only; JSON arrays are not supported');
  }
  const ids = value.split(',').map(function (id) {
    return id.trim();
  }).filter(Boolean);
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('--ids must be a comma-separated list');
  }
  return ids;
}

function compactResult(command, result) {
  if (command === 'get' && result && result.widget) {
    return {
      elementType: result.elementType,
      managed: result.managed,
      element: {
        id: result.element.id,
        name: result.element.name,
        type: result.element.type,
        widget: result.element.widget,
        version: result.element.version,
        layout: result.element.layout,
        effects: result.element.effects,
        keyframes: result.element.keyframes
      },
      values: result.data,
      fields: (result.widget.fields || []).map(function (field) {
        return {
          id: field.id,
          title: field.title,
          type: field.type,
          runtime: field.runtime
        };
      }),
      subCompositions: result.widget.subCompositions || []
    };
  }
  return result;
}

function writeWorkLifecycleReminder(command, succeeded) {
  if (!command || command === 'pair' || command === 'pair-intent') return;

  if (command === 'finish-work' && succeeded) {
    console.error('COMPOSER_WORK_RELEASED: Composer input is unlocked.');
    return;
  }

  if (command === 'complete' && succeeded) {
    console.error('COMPOSER_AUTHORIZATION_REVOKED: Composer work is released and the saved authorization is revoked.');
    return;
  }

  console.error(
    'COMPOSER_FINALIZATION_REQUIRED: If start-work succeeded in this task, run finish-work before yielding.'
  );
}

function requireOption(options, name) {
  if (!options[name]) {
    throw new Error(`--${name} is required`);
  }
  return options[name];
}

function assertAllowedOptions(options, allowed, command) {
  Object.keys(options).forEach(function (name) {
    if (!allowed.includes(name) && !GLOBAL_COMMAND_OPTIONS.includes(name)) {
      throw new Error(`--${name} is not available for ${command}`);
    }
  });
}

function requireBooleanOption(options, name) {
  const value = requireOption(options, name);
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`--${name} must be "true" or "false"`);
}

// Directional effects take a named direction; dial effects take a numeric angle.
function parseAnimationProperty(raw) {
  const numeric = Number(raw);
  return raw.trim() !== '' && Number.isFinite(numeric) ? numeric : raw;
}

function normalizeServerUrl(value) {
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('--server must use http or https');
  }
  parsed.pathname = '/';
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString().replace(/\/$/, '');
}

function validatePairedServerOption(options) {
  if (options.server === undefined) return;
  const requestedServer = normalizeServerUrl(options.server);
  const pairedServer = normalizeServerUrl(readCredentials().server);
  if (requestedServer !== pairedServer) {
    throw new Error('--server must match the paired Composer server. Pair with the requested server first.');
  }
}

function readCredentials() {
  const candidates = CREDENTIALS_OVERRIDE_PATH
    ? [CREDENTIALS_OVERRIDE_PATH]
    : [DEFAULT_CREDENTIALS_PATH, TEMPORARY_CREDENTIALS_PATH];
  const availableCredentials = [];
  let expiredCredentialsFound = false;
  let incompleteCredentialsFound = false;
  for (const candidate of candidates) {
    let candidateCredentials;
    try {
      candidateCredentials = JSON.parse(fs.readFileSync(candidate, 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') continue;
      if (!CREDENTIALS_OVERRIDE_PATH && candidate === DEFAULT_CREDENTIALS_PATH &&
          isCredentialPermissionError(err)) continue;
      const credentialCategory = CREDENTIALS_OVERRIDE_PATH
        ? 'configured'
        : candidate === TEMPORARY_CREDENTIALS_PATH ? 'temporary' : 'default';
      const readError = new Error(
        `Unable to read Composer credentials from the ${credentialCategory} credential location. ` +
        'Pair again or select a valid writable COMPOSER_AGENT_CREDENTIALS file.'
      );
      readError.code = 'CREDENTIAL_READ_FAILED';
      throw readError;
    }

    if (candidateCredentials.expiresAt &&
        new Date(candidateCredentials.expiresAt).getTime() <= Date.now()) {
      expiredCredentialsFound = true;
      if (candidate === TEMPORARY_CREDENTIALS_PATH) {
        activeCredentialsPath = candidate;
        removeTemporaryCredentials();
      }
      continue;
    }

    if (!credentialSelection.isCompleteCredential(candidateCredentials)) {
      incompleteCredentialsFound = true;
      continue;
    }
    availableCredentials.push({ path: candidate, credentials: candidateCredentials });
  }
  const selected = credentialSelection.selectNewestCredentialCandidate(availableCredentials);
  if (!selected) {
    if (expiredCredentialsFound) {
      throw new Error('Stored Composer credentials have expired. Pair again.');
    }
    if (incompleteCredentialsFound) {
      throw new Error('Stored Composer credentials are incomplete. Pair again.');
    }
    throw new Error('Composer is not paired. Run the pair command first.');
  }

  activeCredentialsPath = selected.path;
  return selected.credentials;
}

function isCredentialPermissionError(error) {
  return error && ['EACCES', 'EPERM', 'EROFS'].includes(error.code);
}

function writeCredentials(filePath, credentials) {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.writeFileSync(
    filePath,
    JSON.stringify(credentials, null, 2),
    { encoding: 'utf8', mode: 0o600 }
  );
}

function saveCredentials(credentials) {
  const requestedPath = CREDENTIALS_OVERRIDE_PATH || DEFAULT_CREDENTIALS_PATH;
  try {
    writeCredentials(requestedPath, credentials);
    activeCredentialsPath = requestedPath;
    return CREDENTIALS_OVERRIDE_PATH ? 'override' : 'default';
  } catch (error) {
    if (CREDENTIALS_OVERRIDE_PATH || !isCredentialPermissionError(error)) {
      const writeError = new Error(
        'Unable to write Composer credentials to the configured credential path. ' +
        'Choose a writable COMPOSER_AGENT_CREDENTIALS location and pair again.'
      );
      writeError.code = 'CREDENTIAL_WRITE_FAILED';
      throw writeError;
    }
  }

  try {
    writeCredentials(TEMPORARY_CREDENTIALS_PATH, credentials);
    activeCredentialsPath = TEMPORARY_CREDENTIALS_PATH;
    return 'temporary';
  } catch (error) {
    const writeError = new Error(
      'Unable to write Composer credentials to the default or temporary credential location. ' +
      'Set COMPOSER_AGENT_CREDENTIALS to a writable file and pair again.'
    );
    writeError.code = 'CREDENTIAL_WRITE_FAILED';
    throw writeError;
  }
}

function removeTemporaryCredentials() {
  if (activeCredentialsPath !== TEMPORARY_CREDENTIALS_PATH) return;
  try {
    fs.unlinkSync(TEMPORARY_CREDENTIALS_PATH);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      const cleanupError = new Error('Unable to remove temporary Composer credentials after completion.');
      cleanupError.code = 'CREDENTIAL_CLEANUP_FAILED';
      throw cleanupError;
    }
  }
}

async function parseErrorResponse(response) {
  let body;
  try {
    body = await response.json();
  } catch (err) {
    return `Request failed with status ${response.status}`;
  }
  return body && body.error && body.error.message
    ? body.error.message
    : `Request failed with status ${response.status}`;
}

async function pair(options) {
  const server = normalizeServerUrl(options.server || DEFAULT_SERVER_URL);
  const code = requireOption(options, 'code').toUpperCase();
  const response = await fetch(server + '/composer-agent/pairing/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code,
      deviceName: options['device-name'] || DEFAULT_DEVICE_NAME
    })
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return finishPairing(server, await response.json());
}

async function pairIntent(options) {
  const server = normalizeServerUrl(options.server || DEFAULT_SERVER_URL);
  const intentId = requireOption(options, 'intent-id');
  const intentSecret = readIntentSecret(options);
  const deadline = Date.now() + PAIRING_INTENT_WAIT_MS;

  while (true) {
    const response = await fetch(server + '/composer-agent/pairing/claim-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intentId: intentId,
        intentSecret: intentSecret,
        deviceName: options['device-name'] || DEFAULT_DEVICE_NAME
      })
    });

    if (response.ok) {
      return finishPairing(server, await response.json());
    }
    if (response.status !== 409 && response.status !== 429) {
      throw new Error(await parseErrorResponse(response));
    }
    if (Date.now() + PAIRING_INTENT_RETRY_MS > deadline) {
      throw new Error('Timed out waiting for Composer to bind the pairing intent');
    }
    await new Promise(function (resolve) {
      setTimeout(resolve, PAIRING_INTENT_RETRY_MS);
    });
  }
}

// The intent secret is a credential. Only accept inputs that keep it out of
// the process argument list and shell history: COMPOSER_AGENT_INTENT_SECRET or
// `--intent-secret -` with the secret piped through stdin.
function readIntentSecret(options) {
  const flagValue = options['intent-secret'];
  if (flagValue === '-') {
    const stdinValue = fs.readFileSync(0, 'utf8').trim();
    if (!stdinValue) {
      throw new Error('--intent-secret - requires the intent secret on stdin');
    }
    return stdinValue;
  }
  if (flagValue !== undefined) {
    throw new Error('--intent-secret only accepts "-"; use stdin or COMPOSER_AGENT_INTENT_SECRET');
  }
  const envValue = process.env.COMPOSER_AGENT_INTENT_SECRET;
  if (envValue) return envValue;
  throw new Error(
    'intent secret is required: set COMPOSER_AGENT_INTENT_SECRET or pass --intent-secret - with the secret on stdin'
  );
}

async function finishPairing(server, pairing) {
  const credentialStorage = saveCredentials({
    server: server,
    accessToken: pairing.accessToken,
    socketPath: pairing.socketPath,
    sceneId: pairing.sceneId,
    sceneName: pairing.sceneName,
    capabilities: pairing.capabilities,
    pairedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + pairing.expiresIn * 1000).toISOString()
  });

  let acknowledged = false;
  try {
    await sendSessionMessage(null, 'pairing_acknowledged');
    acknowledged = true;
  } catch (err) {
    // Pair credentials are still useful if the editor is reconnecting. The
    // caller can see that the Composer acknowledgement was not delivered.
  }

  console.log(JSON.stringify({
    paired: true,
    acknowledged: acknowledged,
    sceneId: pairing.sceneId,
    sceneName: pairing.sceneName,
    capabilities: pairing.capabilities,
    credentialStorage: credentialStorage,
    expiresIn: pairing.expiresIn
  }, null, 2));
}

function createSocketUrl(credentials) {
  const socketUrl = new URL(credentials.socketPath, credentials.server);
  socketUrl.protocol = socketUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  return socketUrl.toString();
}

function warnIfSkillUpdateAvailable(authentication) {
  const serverVersion = authentication && authentication.composerAgentVersion;
  if (
    skillUpdateWarningWritten ||
    !Number.isInteger(serverVersion) ||
    serverVersion <= SKILL_VERSION
  ) {
    return;
  }
  skillUpdateWarningWritten = true;
  console.error(
    `COMPOSER_SKILL_UPDATE_AVAILABLE: Composer server version ${serverVersion} is newer than downloaded skill version ${SKILL_VERSION}. Download the latest Composer skill.`
  );
}

function sendSessionMessage(message, acknowledgementType) {
  const credentials = readCredentials();
  const activityId = message && message.type === 'activity' ? uuid.v4() : null;
  const outgoingMessage = activityId
    ? Object.assign({}, message, { activityId: activityId })
    : message;

  return new Promise(function (resolve, reject) {
    const socket = new WebSocket(createSocketUrl(credentials));
    let settled = false;
    const timeout = setTimeout(function () {
      finish(new Error('Timed out waiting for the open Composer session'));
    }, DEFAULT_TIMEOUT_MS);

    function finish(err, result) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000);
      }
      if (err) reject(err);
      else resolve(result);
    }

    socket.on('open', function () {
      socket.send(JSON.stringify({
        type: 'authenticate',
        token: credentials.accessToken
      }));
    });

    socket.on('message', function (rawMessage) {
      let response;
      try {
        response = JSON.parse(rawMessage.toString());
      } catch (err) {
        finish(new Error('Composer relay returned invalid JSON'));
        return;
      }
      if (response.type === 'authenticated') {
        warnIfSkillUpdateAvailable(response);
        if (outgoingMessage) socket.send(JSON.stringify(outgoingMessage));
      } else if (
        response.type === acknowledgementType &&
        (!activityId || response.activityId === activityId)
      ) {
        finish(null, { sent: true });
      } else if (response.type === 'session_cancelled') {
        const cancelledError = new Error('Composer operation was canceled by the user. Pair again.');
        cancelledError.code = 'SESSION_CANCELLED';
        finish(cancelledError);
      } else if (response.type === 'operation_cancelled') {
        const interruptedError = new Error('Composer operation was canceled by the user.');
        interruptedError.code = 'OPERATION_CANCELLED';
        finish(interruptedError);
      } else if (response.type === 'error') {
        finish(new Error(response.error && response.error.message
          ? response.error.message
          : 'Composer relay error'));
      }
    });

    socket.on('error', function (err) {
      finish(new Error(`Unable to connect to Composer: ${err.message}`));
    });

    socket.on('close', function (code, reason) {
      if (!settled) {
        const detail = reason ? `: ${reason.toString()}` : '';
        finish(new Error('Composer connection closed' + detail + ` (code ${code})`));
      }
    });
  });
}

function executeCommand(method, params, commandTimeoutMs) {
  const credentials = readCredentials();
  const request = {
    id: uuid.v4(),
    method: method,
    params: params || {}
  };

  return new Promise(function (resolve, reject) {
    const socket = new WebSocket(createSocketUrl(credentials));
    let authenticated = false;
    let settled = false;
    const timeout = setTimeout(function () {
      finish(new Error('Timed out waiting for the open Composer session'));
    }, commandTimeoutMs || DEFAULT_TIMEOUT_MS);

    function finish(err, result) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000);
      }
      if (err) reject(err);
      else resolve(result);
    }

    socket.on('open', function () {
      socket.send(JSON.stringify({
        type: 'authenticate',
        token: credentials.accessToken
      }));
    });

    socket.on('message', function (rawMessage) {
      let message;
      try {
        message = JSON.parse(rawMessage.toString());
      } catch (err) {
        finish(new Error('Composer relay returned invalid JSON'));
        return;
      }

      if (message.type === 'authenticated') {
        authenticated = true;
        warnIfSkillUpdateAvailable(message);
        socket.send(JSON.stringify({ type: 'command', request: request }));
      } else if (
        message.type === 'response' &&
        message.response &&
        message.response.id === request.id
      ) {
        if (message.response.error) {
          const commandError = new Error(message.response.error.message || 'Composer command failed');
          commandError.code = message.response.error.code;
          finish(commandError);
        } else {
          finish(null, message.response.result);
        }
      } else if (
        message.type === 'editor_status' &&
        message.status === 'disconnected'
      ) {
        finish(new Error('The paired Composer session is not open'));
      } else if (message.type === 'session_cancelled') {
        const cancelledError = new Error('Composer operation was canceled by the user. Pair again.');
        cancelledError.code = 'SESSION_CANCELLED';
        finish(cancelledError);
      } else if (message.type === 'operation_cancelled') {
        const interruptedError = new Error('Composer operation was canceled by the user.');
        interruptedError.code = 'OPERATION_CANCELLED';
        finish(interruptedError);
      } else if (message.type === 'error') {
        finish(new Error(message.error && message.error.message
          ? message.error.message
          : 'Composer relay error'));
      }
    });

    socket.on('error', function (err) {
      finish(new Error(`Unable to connect to Composer: ${err.message}`));
    });

    socket.on('close', function (code, reason) {
      if (!settled) {
        const detail = reason ? `: ${reason.toString()}` : '';
        const prefix = authenticated
          ? 'Composer connection closed'
          : 'Composer authentication failed';
        finish(new Error(prefix + detail + ` (code ${code})`));
      }
    });
  });
}

function getElementParams(options) {
  const elementType = requireOption(options, 'type');
  if (elementType !== 'tile' && elementType !== 'group') {
    throw new Error('--type must be "tile" or "group"');
  }
  return {
    elementType: elementType,
    id: requireOption(options, 'id')
  };
}

function requireWidgetTile(result, id) {
  if (!result || result.elementType !== 'tile' || !result.element || result.element.type !== 'widget') {
    throw new Error(`tile "${id}" is not a widget`);
  }
  return result;
}

function selectWidgetSubComposition(result, options, allowUnassigned) {
  const subCompositions = result.widget && Array.isArray(result.widget.subCompositions)
    ? result.widget.subCompositions
    : [];
  const fieldId = options.field;
  const matches = fieldId
    ? subCompositions.filter(function (item) { return item.fieldId === fieldId; })
    : subCompositions;
  if (matches.length === 0) {
    throw new Error(fieldId
      ? `widget tile "${result.element.id}" has no sub-composition field "${fieldId}"`
      : `widget tile "${result.element.id}" has no sub-compositions`);
  }
  if (matches.length > 1) {
    throw new Error(`widget tile "${result.element.id}" has multiple sub-compositions; pass --field`);
  }
  const selected = matches[0];
  if (selected.compositionId && !selected.exists) {
    throw new Error(
      `widget sub-composition "${selected.fieldId}" on tile "${result.element.id}" references a missing composition`
    );
  }
  if (!selected.compositionId && !allowUnassigned) {
    throw new Error(
      `widget sub-composition "${selected.fieldId}" on tile "${result.element.id}" is not assigned`
    );
  }
  return selected;
}

async function inspectWidgetSubCompositions(options) {
  const id = requireOption(options, 'id');
  const result = requireWidgetTile(await executeCommand('element.get', {
    elementType: 'tile',
    id: id
  }), id);
  return {
    tile: {
      id: result.element.id,
      name: result.element.name,
      widget: result.widget && result.widget.id,
      version: result.widget && result.widget.version
    },
    subCompositions: result.widget && result.widget.subCompositions || []
  };
}

async function openWidgetSubComposition(options) {
  const id = requireOption(options, 'id');
  const result = requireWidgetTile(await executeCommand('element.get', {
    elementType: 'tile',
    id: id
  }), id);
  const subComposition = selectWidgetSubComposition(result, options, options.create === true);
  if (!subComposition.compositionId) {
    return executeCommand('composition.open', {
      widgetTileId: result.element.id,
      fieldId: subComposition.fieldId,
      createIfMissing: true
    });
  }
  return {
    widgetSubComposition: subComposition,
    navigation: await executeCommand('composition.open', { id: subComposition.compositionId })
  };
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function validateTableControlValue(control, value, pathLabel) {
  if (!['text', 'image', 'number', 'color'].includes(control.type)) {
    throw new Error(`table template control "${control.id}" has unsupported type "${control.type}"`);
  }
  if ((control.type === 'text' || control.type === 'image') && typeof value !== 'string') {
    throw new Error(`${pathLabel} must be a string for ${control.type} control "${control.id}"`);
  }
  if (control.type === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) {
    throw new Error(`${pathLabel} must be a finite number for control "${control.id}"`);
  }
  if (
    control.type === 'color' &&
    !tinycolor(value).isValid()
  ) {
    throw new Error(`${pathLabel} must be a tinycolor2-compatible value for control "${control.id}"`);
  }
}

function validateTableOption(name, value) {
  if (name === 'layoutDirection' && !['horizontal', 'vertical'].includes(value)) {
    throw new Error('options.layoutDirection must be "horizontal" or "vertical"');
  }
  if (name === 'updateStyle' && !['update', 'timeline'].includes(value)) {
    throw new Error('options.updateStyle must be "update" or "timeline"');
  }
  if (
    name === 'pageTransitionStyle' &&
    !['topToBottom', 'bottomToTop', 'random'].includes(value)
  ) {
    throw new Error('options.pageTransitionStyle is invalid');
  }
  if (name === 'showLayout' && typeof value !== 'boolean') {
    throw new Error('options.showLayout must be a boolean');
  }
  if (name === 'elementsPerPage') {
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric < 1 || numeric > 100) {
      throw new Error('options.elementsPerPage must be an integer from 1 to 100');
    }
  }
  if (name === 'lineSpacing' || name === 'pageTransitionOffset') {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      throw new Error(`options.${name} must be a non-negative number`);
    }
  }
  if (name === 'currentPage') {
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric < 0) {
      throw new Error('options.currentPage must be a non-negative integer');
    }
  }
}

function normalizeTableOption(currentValue, value, name) {
  validateTableOption(name, value);
  if (typeof currentValue === 'string') return String(value);
  if (typeof currentValue === 'boolean' && typeof value === 'boolean') return value;
  if (typeof currentValue === 'number' && typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  throw new Error(`options.${name} must preserve the table widget's current runtime type`);
}

async function updateTable(options) {
  const id = requireOption(options, 'id');
  const specification = readJsonFile(requireOption(options, 'file'), 'table specification');
  if (!isPlainObject(specification) || !Array.isArray(specification.rows)) {
    throw new Error('table specification must contain a rows array');
  }
  if (specification.rows.length > MAX_TABLE_ROWS) {
    throw new Error(`table specification supports at most ${MAX_TABLE_ROWS} rows`);
  }
  const table = requireWidgetTile(await executeCommand('element.get', {
    elementType: 'tile',
    id: id
  }), id);
  if (!table.widget || (table.widget.id !== TABLE_WIDGET_ID && table.widget.name !== 'Table')) {
    throw new Error(`widget tile "${id}" is not a supported Table widget`);
  }
  const subComposition = selectWidgetSubComposition(table, { field: 'composition' });
  const controls = Array.isArray(subComposition.controls) ? subComposition.controls : [];
  const controlsById = new Map();
  controls.forEach(function (control) {
    if (!control.id || controlsById.has(control.id)) {
      throw new Error('the table template exposes duplicate or unnamed control nodes');
    }
    controlsById.set(control.id, control);
  });
  specification.rows.forEach(function (row, rowIndex) {
    if (!isPlainObject(row)) {
      throw new Error(`rows[${rowIndex}] must be an object`);
    }
    const keys = Object.keys(row);
    keys.forEach(function (key) {
      if (!controlsById.has(key)) {
        throw new Error(`rows[${rowIndex}].${key} is not exposed by the table template`);
      }
      validateTableControlValue(controlsById.get(key), row[key], `rows[${rowIndex}].${key}`);
    });
    controls.forEach(function (control) {
      if (!Object.prototype.hasOwnProperty.call(row, control.id)) {
        throw new Error(`rows[${rowIndex}] is missing template control "${control.id}"`);
      }
    });
  });

  const tableContent = JSON.stringify({ content: specification.rows }, null, 2);
  if (Buffer.byteLength(tableContent, 'utf8') > MAX_TABLE_CONTENT_BYTES) {
    throw new Error('serialized table content exceeds the 32 KB widget-data limit');
  }
  const requestedOptions = specification.options === undefined ? {} : specification.options;
  if (!isPlainObject(requestedOptions)) {
    throw new Error('table specification options must be an object');
  }
  Object.keys(requestedOptions).forEach(function (name) {
    if (!TABLE_OPTION_FIELDS.includes(name)) {
      throw new Error(`unsupported table option "${name}"`);
    }
  });
  const updates = Object.keys(requestedOptions).map(function (name) {
    if (!Object.prototype.hasOwnProperty.call(table.data, name)) {
      throw new Error(`table widget has no data field "${name}"`);
    }
    return {
      name: name,
      previous: table.data[name],
      value: normalizeTableOption(table.data[name], requestedOptions[name], name)
    };
  });
  updates.push({
    name: 'tableContent',
    previous: table.data.tableContent,
    value: tableContent
  });

  const applied = [];
  try {
    for (const update of updates) {
      await executeCommand('element.update', {
        elementType: 'tile',
        id: id,
        namespace: 'data',
        path: update.name,
        value: update.value
      });
      applied.push(update);
    }
  } catch (err) {
    const rollbackErrors = [];
    for (const update of applied.reverse()) {
      try {
        await executeCommand('element.update', {
          elementType: 'tile',
          id: id,
          namespace: 'data',
          path: update.name,
          value: update.previous
        });
      } catch (rollbackError) {
        rollbackErrors.push(update.name);
      }
    }
    if (rollbackErrors.length) {
      throw new Error(`${err.message}; rollback failed for: ${rollbackErrors.join(', ')}`);
    }
    throw err;
  }

  const verified = await executeCommand('element.get', { elementType: 'tile', id: id });
  return {
    table: { id: id, name: verified.element.name, widget: verified.widget.id },
    widgetSubComposition: subComposition,
    rows: specification.rows.length,
    options: Object.keys(requestedOptions).reduce(function (result, name) {
      result[name] = verified.data[name];
      return result;
    }, {}),
    tableContent: verified.data.tableContent
  };
}

function savePreparedCaptureMeasurements(result, outputPath) {
  const snapshot = result && result.measurementSnapshot;
  if (!snapshot) {
    throw createCaptureError(
      'MEASUREMENT_WRITE_FAILED',
      'Browser capture preparation did not return the requested measurement snapshot'
    );
  }
  const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
  const sizeBytes = Buffer.byteLength(serialized, 'utf8');
  if (sizeBytes > MAX_MEASUREMENT_BYTES) {
    throw createCaptureError(
      'MEASUREMENT_TOO_LARGE',
      'Browser capture measurement snapshot exceeds the 1 MB limit'
    );
  }
  const resolvedPath = path.resolve(outputPath);
  try {
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    fs.writeFileSync(resolvedPath, serialized);
  } catch (error) {
    throw createCaptureError(
      'MEASUREMENT_WRITE_FAILED',
      'Unable to write the Browser capture measurement snapshot'
    );
  }
  delete result.measurementSnapshot;
  result.measurements = {
    output: resolvedPath,
    schemaVersion: snapshot.schemaVersion,
    elementCount: snapshot.summary && snapshot.summary.elementCount || 0,
    truncated: snapshot.summary && snapshot.summary.truncated === true,
    sizeBytes: sizeBytes
  };
  return result;
}

function parseCaptureSeconds(options, name, defaultValue, allowZero) {
  if (options[name] === undefined) return defaultValue;
  const value = Number(options[name]);
  if (!Number.isFinite(value) || (allowZero ? value < 0 : value <= 0)) {
    throw new Error(`--${name} must be ${allowZero ? 'a non-negative' : 'a positive'} number of seconds`);
  }
  return value;
}

function normalizeCaptureTarget(options) {
  const target = options.target || 'root';
  if (target !== 'root' && target !== 'active') {
    throw createCaptureError('INVALID_CAPTURE_TARGET', '--target must be "root" or "active"');
  }
  return target;
}

function validateCaptureServer(serverValue) {
  if (serverValue === undefined) return null;
  const requestedServer = normalizeServerUrl(serverValue);
  const pairedServer = normalizeServerUrl(readCredentials().server);
  if (requestedServer !== pairedServer) {
    throw createCaptureError(
      'CAPTURE_SERVER_MISMATCH',
      '--server must match the paired Composer server. Pair with the requested server before capturing.'
    );
  }
  return requestedServer;
}

function normalizeCaptureOptions(options) {
  assertAllowedOptions(
    options,
    ['target', 'output', 'measurements', 'timeout', 'settle', 'wait-mode', 'timeline', 'at', 'server', 'compact'],
    'capture'
  );
  validateCaptureServer(options.server);
  const target = normalizeCaptureTarget(options);
  const waitMode = options['wait-mode'] || 'smart';
  if (waitMode !== 'smart' && waitMode !== 'timed') {
    throw createCaptureError(
      'INVALID_CAPTURE_WAIT_MODE',
      '--wait-mode must be "smart" or "timed"'
    );
  }
  const hasTimeline = options.timeline !== undefined;
  const hasAt = options.at !== undefined;
  if (hasTimeline !== hasAt) {
    throw createCaptureError(
      'INVALID_CAPTURE_TIMELINE',
      '--timeline and --at must be provided together'
    );
  }
  let timeline = null;
  let atSeconds = null;
  if (hasTimeline) {
    timeline = options.timeline;
    if (timeline !== 'In' && timeline !== 'Out') {
      throw createCaptureError('INVALID_CAPTURE_TIMELINE', '--timeline must be "In" or "Out"');
    }
    atSeconds = parseCaptureSeconds(options, 'at', null, true);
    if (waitMode !== 'smart') {
      throw createCaptureError(
        'INVALID_CAPTURE_TIMELINE',
        'Timeline-position capture requires --wait-mode smart'
      );
    }
  }
  return {
    target: target,
    outputPath: requireOption(options, 'output'),
    measurementsPath: options.measurements || null,
    waitMode: waitMode,
    timeoutMs: parseCaptureSeconds(options, 'timeout', 30, false) * 1000,
    settleMs: parseCaptureSeconds(
      options,
      'settle',
      waitMode === 'timed' ? 2 : 0,
      true
    ) * 1000,
    timeline: timeline,
    atSeconds: atSeconds
  };
}

function normalizePreparedCaptureOptions(options) {
  assertAllowedOptions(
    options,
    ['target', 'restore-after', 'measurements', 'artifact-manifest', 'timeout', 'settle', 'wait-mode', 'timeline', 'at', 'compact'],
    'prepare-capture'
  );
  const target = normalizeCaptureTarget(options);
  const waitMode = options['wait-mode'] || 'smart';
  if (waitMode !== 'smart' && waitMode !== 'timed') {
    throw createCaptureError(
      'INVALID_CAPTURE_WAIT_MODE',
      '--wait-mode must be "smart" or "timed"'
    );
  }
  const hasTimeline = options.timeline !== undefined;
  const hasAt = options.at !== undefined;
  if (hasTimeline !== hasAt) {
    throw createCaptureError(
      'INVALID_CAPTURE_TIMELINE',
      '--timeline and --at must be provided together'
    );
  }
  let timeline = null;
  let atSeconds = null;
  if (hasTimeline) {
    timeline = options.timeline;
    if (timeline !== 'In' && timeline !== 'Out') {
      throw createCaptureError('INVALID_CAPTURE_TIMELINE', '--timeline must be "In" or "Out"');
    }
    if (waitMode !== 'smart') {
      throw createCaptureError(
        'INVALID_CAPTURE_TIMELINE',
        'Timeline-position capture requires --wait-mode smart'
      );
    }
    atSeconds = parseCaptureSeconds(options, 'at', null, true);
  }
  const restoreAfter = parseCaptureSeconds(options, 'restore-after', 30, false);
  if (restoreAfter < 5 || restoreAfter > 120) {
    throw new Error('--restore-after must be between 5 and 120 seconds');
  }
  if (
    options.measurements &&
    options['artifact-manifest'] &&
    path.resolve(options.measurements) === path.resolve(options['artifact-manifest'])
  ) {
    throw createCaptureError(
      'CAPTURE_ARTIFACT_INVALID',
      '--measurements and --artifact-manifest must use different paths'
    );
  }
  return {
    target: target,
    restoreAfterMs: restoreAfter * 1000,
    measurementsPath: options.measurements || null,
    artifactManifestPath: options['artifact-manifest'] || null,
    waitMode: waitMode,
    timeoutMs: parseCaptureSeconds(options, 'timeout', 30, false) * 1000,
    settleMs: parseCaptureSeconds(
      options,
      'settle',
      waitMode === 'timed' ? 2 : 0,
      true
    ) * 1000,
    timeline: timeline,
    atSeconds: atSeconds
  };
}

async function finalizePreparedCapture(options) {
  assertAllowedOptions(
    options,
    ['capture-id', 'artifact-manifest', 'output', 'evidence', 'browser', 'compact'],
    'finalize-capture'
  );
  const captureId = requireOption(options, 'capture-id');
  const manifestPath = requireOption(options, 'artifact-manifest');
  const outputPath = requireOption(options, 'output');
  const evidencePath = requireOption(options, 'evidence');
  const distinctPaths = [manifestPath, outputPath, evidencePath].map(function (value) {
    return path.resolve(value);
  });
  let prepared;
  try {
    if (new Set(distinctPaths).size !== distinctPaths.length) {
      throw createCaptureError(
        'CAPTURE_ARTIFACT_INVALID',
        '--artifact-manifest, --output, and --evidence must use different paths'
      );
    }
    prepared = readPreparedManifest(manifestPath, captureId);
  } catch (error) {
    try {
      await executeCommand('preview.restoreCapture', { captureId });
    } catch (restoreError) {
      // The manifest error remains authoritative; automatic recovery is the final fallback.
    }
    throw error;
  }
  let artifact;
  let artifactError = null;
  try {
    artifact = finalizeManifest(prepared.manifest, {
      outputPath,
      evidencePath,
      browser: options.browser
    });
  } catch (error) {
    artifactError = error;
    artifact = failManifest(prepared.manifest, error);
  }

  let restoration;
  try {
    restoration = await executeCommand('preview.restoreCapture', { captureId });
  } catch (error) {
    restoration = {
      restored: false,
      error: {
        code: error.code || 'CAPTURE_RESTORE_FAILED',
        message: 'Composer capture restoration failed'
      }
    };
    if (!artifactError) artifactError = error;
  }
  artifact.restoration = restoration;
  writeExistingManifest(prepared.resolvedPath, artifact);
  if (artifactError) throw artifactError;
  return {
    artifactManifest: {
      output: prepared.resolvedPath,
      schemaVersion: artifact.schemaVersion,
      status: artifact.status
    },
    screenshot: artifact.screenshot,
    evidence: artifact.evidence,
    restoration: artifact.restoration
  };
}

function getActiveCaptureTarget(inspection) {
  const activeComposition = inspection && inspection.activeComposition;
  const stack = activeComposition && activeComposition.stack;
  if (!Array.isArray(stack) || stack.length <= 1) {
    return { compositionId: null, widgetTileId: null };
  }
  const activeEntry = stack[stack.length - 1];
  return {
    compositionId: activeComposition.id || (activeEntry && activeEntry.id) || null,
    widgetTileId: activeComposition.widgetSubComposition &&
      activeComposition.widgetSubComposition.widgetTileId || null
  };
}

function validateCaptureFile(result) {
  if (!result || !result.output || !fs.existsSync(result.output)) {
    throw createCaptureError('CAPTURE_FAILED', 'Capture did not create the requested PNG');
  }
  const sizeBytes = fs.statSync(result.output).size;
  if (sizeBytes <= 0) {
    throw createCaptureError('CAPTURE_FAILED', 'Capture created an empty PNG');
  }
  if (sizeBytes > MAX_CAPTURE_BYTES) {
    throw createCaptureError('CAPTURE_TOO_LARGE', 'Composer preview capture exceeds the 8 MB limit');
  }
  result.sizeBytes = sizeBytes;
  return result;
}

async function captureStandalone(options) {
  const inspection = await executeCommand('composition.inspect');
  const preview = inspection && inspection.preview;
  if (!preview || !preview.compositionToken) {
    throw createCaptureError(
      'COMPOSITION_TOKEN_REQUIRED',
      'Standalone capture requires a Composition API token. Generate one in Composer and inspect again.'
    );
  }
  const activeTarget = options.target === 'active'
    ? getActiveCaptureTarget(inspection)
    : { compositionId: null, widgetTileId: null };
  const result = await captureCompositionPreview({
    endpoint: preview.endpoint,
    width: preview.width,
    height: preview.height,
    compositionToken: preview.compositionToken,
    outputPath: options.outputPath,
    measurementsPath: options.measurementsPath,
    target: options.target,
    compositionId: activeTarget.compositionId,
    widgetTileId: activeTarget.widgetTileId,
    waitMode: options.waitMode,
    timeoutMs: options.timeoutMs,
    settleMs: options.settleMs,
    timeline: options.timeline,
    atSeconds: options.atSeconds
  });
  result.editorResolution = { width: preview.width, height: preview.height };
  return validateCaptureFile(result);
}

async function captureWithSource(options) {
  return captureStandalone(options);
}

function createActiveCompositionStructure(inspection) {
  const tiles = Array.isArray(inspection.tiles) ? inspection.tiles : [];
  const tileById = {};
  tiles.forEach(function (tile) {
    tileById[tile.id] = tile;
  });

  return {
    compName: inspection.activeComposition.name,
    compId: inspection.activeComposition.id,
    children: [],
    groups: (inspection.groups || []).map(function (group) {
      return {
        id: group.id,
        name: group.name,
        tiles: (group.itemIds || []).map(function (tileId) {
          return tileById[tileId];
        }).filter(Boolean)
      };
    }),
    tiles: tiles
  };
}

function createScriptControlContext(inspection, controlInspection) {
  const controlNode = controlInspection && controlInspection.controlNode;
  const fields = controlNode && Array.isArray(controlNode.fields)
    ? controlNode.fields
    : [];
  const links = controlInspection && Array.isArray(controlInspection.links)
    ? controlInspection.links
    : [];

  return {
    compName: inspection.activeComposition.name,
    compId: inspection.activeComposition.id,
    models: fields.map(function (field) {
      return {
        keyId: field.keyId,
        id: field.id,
        title: field.title || field.id,
        type: field.type,
        index: field.index,
        value: field.value
      };
    }),
    datalinks: links.map(function (link) {
      return {
        tileId: link.tileId,
        property: link.propertyId,
        link: {
          location: link.location,
          locationId: link.locationId,
          index: link.index,
          key: link.key,
          keyId: link.keyId,
          type: link.type
        }
      };
    }),
    noderefs: controlInspection && Array.isArray(controlInspection.nodeRefs)
      ? controlInspection.nodeRefs
      : []
  };
}

async function createScriptHandoff() {
  const credentials = readCredentials();
  const inspection = await executeCommand('composition.inspect', {
    scriptHandoff: true
  });
  const preview = inspection && inspection.preview;
  const activeComposition = inspection && inspection.activeComposition;
  if (!preview || !preview.endpoint || !preview.compositionToken) {
    throw new Error('The open composition does not expose a Composition API token');
  }
  if (!activeComposition || !activeComposition.id) {
    throw new Error('Composer did not report an active composition for script handoff');
  }

  const controlInspection = inspection.scriptControlContext ||
    await executeCommand('controlNode.inspect', {});
  const isRoot = Array.isArray(activeComposition.stack) &&
    activeComposition.stack.length === 1;
  const scriptNames = {
    global: 'Global Script',
    overlay: 'Overlay Script'
  };
  scriptNames[activeComposition.id] = activeComposition.name ||
    (isRoot ? 'Root Composition' : activeComposition.id);

  return {
    version: 1,
    kind: 'composer-agent-script-handoff',
    host: preview.endpoint,
    compositionToken: preview.compositionToken,
    composerAgentAccessToken: credentials.accessToken,
    scene: inspection.scene,
    preview: {
      width: preview.width,
      height: preview.height
    },
    activeComposition: activeComposition,
    mainComposition: isRoot ? activeComposition.id : null,
    suggestedScript: {
      id: activeComposition.id,
      name: scriptNames[activeComposition.id],
      type: isRoot ? 'root' : 'composition'
    },
    scriptIds: [activeComposition.id],
    scriptNames: scriptNames,
    compositionStructure: createActiveCompositionStructure(inspection),
    modelsDataLinksNodeRefs: [
      createScriptControlContext(inspection, controlInspection)
    ],
    scope: 'active-composition'
  };
}

let invokedCommand;

async function run() {
  const parsed = parseArguments(process.argv.slice(2));
  invokedCommand = parsed.command;
  let result;
  if (!['pair', 'pair-intent', 'capture'].includes(parsed.command)) {
    validatePairedServerOption(parsed.options);
  }

  switch (parsed.command) {
    case 'pair':
      await pair(parsed.options);
      return;
    case 'pair-intent':
      await pairIntent(parsed.options);
      return;
    case 'status':
      result = await sendSessionMessage({
        type: 'activity',
        message: requireOption(parsed.options, 'message')
      }, 'activity_sent');
      break;
    case 'start-work':
      result = await sendSessionMessage({ type: 'work_start' }, 'work_started');
      break;
    case 'finish-work':
      result = await sendSessionMessage({ type: 'work_finish' }, 'work_finished');
      break;
    case 'complete':
      result = await sendSessionMessage({ type: 'session_complete' }, 'session_completed');
      removeTemporaryCredentials();
      break;
    case 'inspect': {
      const params = {};
      if (parsed.options.selection) params.selection = true;
      if (parsed.options.summary) params.summary = true;
      result = await executeCommand('composition.inspect', params);
      // Fallback filtering keeps the flags working against servers that return
      // the full inspection payload instead of honoring the params.
      if (parsed.options.selection && result && result.selection) {
        result = { selection: result.selection };
      } else if (parsed.options.summary && result && result.summary) {
        result = { summary: result.summary };
      }
      break;
    }
    case 'script-handoff':
      result = await createScriptHandoff();
      break;
    case 'control-composition': {
      const state = requireOption(parsed.options, 'state').toLowerCase();
      if (state !== 'in' && state !== 'out') {
        throw new Error('--state must be "in" or "out"');
      }
      result = await executeCommand('composition.control', {
        id: requireOption(parsed.options, 'id'),
        state: state === 'in' ? 'In' : 'Out'
      });
      break;
    }
    case 'create-composition': {
      const params = { name: requireOption(parsed.options, 'name') };
      if (parsed.options['group-id']) {
        params.groupId = parsed.options['group-id'];
      }
      result = await executeCommand('composition.create', params);
      break;
    }
    case 'orchestrate':
      result = await executeCommand(
        'composition.orchestrate',
        readJsonFile(requireOption(parsed.options, 'file'), 'composition orchestration manifest')
      );
      break;
    case 'create-revision':
      result = await executeCommand('composition.revision.create', {
        description: requireOption(parsed.options, 'description')
      });
      break;
    case 'delete-composition':
      result = await executeCommand('composition.delete', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    case 'open-composition':
      result = await executeCommand('composition.open', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    case 'widget-subcompositions':
      result = await inspectWidgetSubCompositions(parsed.options);
      break;
    case 'open-widget-subcomposition':
      result = await openWidgetSubComposition(parsed.options);
      break;
    case 'update-table':
      result = await updateTable(parsed.options);
      break;
    case 'timeline2':
      result = await executeCommand('composition.timeline2.set', {
        active: requireBooleanOption(parsed.options, 'active')
      });
      break;
    case 'control-nodes':
      result = await executeCommand('controlNode.inspect');
      break;
    case 'set-control-value': {
      assertAllowedOptions(parsed.options, ['id', 'value-file', 'compact'], 'set-control-value');
      result = await executeCommand('controlNode.value.set', {
        id: requireOption(parsed.options, 'id'),
        value: readJsonOptionFile(
          parsed.options,
          'value-file',
          'control-node value file',
          true
        )
      });
      break;
    }
    case 'update-control': {
      const patch = readJsonFile(
        requireOption(parsed.options, 'file'),
        'control node metadata patch'
      );
      result = await executeCommand('controlNode.metadata.update', {
        id: requireOption(parsed.options, 'id'),
        patch: patch
      });
      break;
    }
    case 'create-control': {
      assertAllowedOptions(parsed.options, [
        'name', 'node-type', 'target', 'tile-id', 'element-type',
        'element-id', 'property', 'value-file', 'info-mode', 'replace', 'compact'
      ], 'create-control');
      const type = requireOption(parsed.options, 'node-type');
      if (![
        'text', 'textarea', 'number', 'normalizednumber', 'counter', 'color',
        'image', 'checkbox', 'audio', 'video', 'data', 'jsonfile', 'infotext'
      ].includes(type)) {
        throw new Error(
          '--node-type must be "text", "textarea", "number", "normalizednumber", ' +
          '"counter", "color", "image", "checkbox", "audio", "video", "data", ' +
          '"jsonfile", or "infotext"'
        );
      }
      const target = parsed.options.target || (parsed.options['element-id'] ? 'layout' : 'data');
      if (!['data', 'layout', 'standalone'].includes(target)) {
        throw new Error('--target must be "data", "layout", or "standalone"');
      }
      if (target === 'standalone') {
        requireOption(parsed.options, 'value-file');
      }
      if (type === 'infotext') {
        if (target !== 'standalone') throw new Error('Info Text requires --target standalone');
        requireOption(parsed.options, 'info-mode');
      } else if (parsed.options['info-mode'] !== undefined) {
        throw new Error('--info-mode is only supported for Info Text controls');
      }
      result = await executeCommand('controlNode.createAndLink', {
        name: requireOption(parsed.options, 'name'),
        type: type,
        target: target,
        tileId: target === 'data' ? requireOption(parsed.options, 'tile-id') : undefined,
        elementType: target === 'layout' ? requireOption(parsed.options, 'element-type') : undefined,
        elementId: target === 'layout' ? requireOption(parsed.options, 'element-id') : undefined,
        propertyId: target === 'standalone' ? undefined : requireOption(parsed.options, 'property'),
        value: target === 'standalone'
          ? readJsonOptionFile(
            parsed.options,
            'value-file',
            'standalone control value file',
            true
          )
          : undefined,
        mode: type === 'infotext' ? parsed.options['info-mode'] : undefined,
        replace: parsed.options.replace === 'true'
      });
      break;
    }
    case 'create-controls': {
      const controlsFile = readJsonFile(
        requireOption(parsed.options, 'file'),
        'control-node specification'
      );
      const controls = Array.isArray(controlsFile)
        ? controlsFile
        : controlsFile.controls;
      result = await executeCommand('controlNode.createMany', {
        controls: Array.isArray(controls)
          ? controls.map(function (control) {
            return {
              name: control.name,
              type: control.type,
              target: control.target || (control.elementId ? 'layout' : 'data'),
              tileId: control.tileId,
              elementType: control.elementType,
              elementId: control.elementId,
              propertyId: control.propertyId || control.property,
              value: control.value,
              mode: control.mode,
              replace: control.replace === true
            };
          })
          : controls
      });
      break;
    }
    case 'delete-control':
      result = await executeCommand('controlNode.delete', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    case 'get':
      if (parsed.options.selected) {
        const inspected = await executeCommand('composition.inspect', { selection: true });
        const selection = inspected && inspected.selection;
        if (!selection || !selection.id) {
          throw new Error('Nothing is selected in Composer; select a tile or group first');
        }
        result = await executeCommand('element.get', {
          elementType: selection.type === 'group' ? 'group' : 'tile',
          id: selection.id
        });
      } else {
        result = await executeCommand('element.get', getElementParams(parsed.options));
      }
      break;
    case 'get-many':
      assertAllowedOptions(parsed.options, ['type', 'ids', 'compact'], 'get-many');
      result = await executeCommand('element.getMany', {
        elementType: parsed.options.type || 'tile',
        ids: parseIds(requireOption(parsed.options, 'ids'))
      });
      break;
    case 'select':
      result = await executeCommand('element.select', getElementParams(parsed.options));
      break;
    case 'move': {
      const params = {
        id: requireOption(parsed.options, 'id'),
        groupId: requireOption(parsed.options, 'group-id')
      };
      if (parsed.options.index !== undefined) {
        const index = Number(parsed.options.index);
        if (!Number.isInteger(index)) {
          throw new Error('--index must be an integer');
        }
        params.index = index;
      }
      result = await executeCommand('element.move', params);
      break;
    }
    case 'update': {
      assertAllowedOptions(parsed.options, [
        'type', 'id', 'namespace', 'path', 'value-file', 'compact'
      ], 'update');
      const params = getElementParams(parsed.options);
      params.path = requireOption(parsed.options, 'path');
      if (parsed.options.namespace) {
        params.namespace = parsed.options.namespace;
      }
      params.value = readJsonOptionFile(
        parsed.options,
        'value-file',
        'element update value file',
        true
      );
      result = await executeCommand('element.update', params);
      break;
    }
    case 'fonts': {
      const params = {};
      if (parsed.options.source) params.source = parsed.options.source;
      if (parsed.options.family) params.family = parsed.options.family;
      result = await executeCommand('fonts.list', params);
      break;
    }
    case 'set-font': {
      const params = { id: requireOption(parsed.options, 'id') };
      ['family', 'source', 'weight', 'alignment'].forEach(function (option) {
        if (parsed.options[option] !== undefined) params[option] = parsed.options[option];
      });
      ['italic', 'underline'].forEach(function (option) {
        if (parsed.options[option] !== undefined) params[option] = parsed.options[option];
      });
      result = await executeCommand('text.font.set', params);
      break;
    }
    case 'timeline-animations':
      result = await executeCommand('timelineAnimations.list', {});
      break;
    case 'set-timeline-animation': {
      assertAllowedOptions(parsed.options, [
        'type', 'id', 'timeline', 'effect', 'property', 'params-file',
        'easing-file', 'start', 'duration', 'compact'
      ], 'set-timeline-animation');
      const params = {
        elementType: parsed.options.type || 'tile',
        id: requireOption(parsed.options, 'id'),
        timeline: requireOption(parsed.options, 'timeline'),
        effect: requireOption(parsed.options, 'effect')
      };
      if (parsed.options.property !== undefined) {
        params.property = parseAnimationProperty(parsed.options.property);
      }
      if (parsed.options['params-file'] !== undefined) {
        params.params = readJsonOptionFile(
          parsed.options,
          'params-file',
          'Timeline-animation parameters file'
        );
      }
      if (parsed.options['easing-file'] !== undefined) {
        params.easing = readJsonOptionFile(
          parsed.options,
          'easing-file',
          'Timeline-animation easing file'
        );
      }
      ['start', 'duration'].forEach(function (option) {
        if (parsed.options[option] === undefined) return;
        const value = Number(parsed.options[option]);
        if (!Number.isFinite(value)) {
          throw new Error(`--${option} must be a number of seconds`);
        }
        params[option] = value;
      });
      result = await executeCommand('timelineAnimation.set', params);
      break;
    }
    case 'set-timeline-animations':
      assertAllowedOptions(parsed.options, ['file', 'compact'], 'set-timeline-animations');
      result = await executeCommand(
        'timelineAnimation.setMany',
        readJsonFile(requireOption(parsed.options, 'file'), 'Timeline-animation choreography')
      );
      break;
    case 'update-animations':
      result = await executeCommand('updateAnimations.list', {});
      break;
    case 'set-update-animation': {
      assertAllowedOptions(parsed.options, [
        'id', 'phase', 'effect', 'property', 'params-file', 'easing-file',
        'duration', 'active', 'always-execute', 'offset', 'compact'
      ], 'set-update-animation');
      const params = {
        id: requireOption(parsed.options, 'id'),
        phase: requireOption(parsed.options, 'phase'),
        effect: requireOption(parsed.options, 'effect')
      };
      if (parsed.options.property !== undefined) {
        params.property = parseAnimationProperty(parsed.options.property);
      }
      if (parsed.options['params-file'] !== undefined) {
        params.params = readJsonOptionFile(
          parsed.options,
          'params-file',
          'Update-animation parameters file'
        );
      }
      if (parsed.options['easing-file'] !== undefined) {
        params.easing = readJsonOptionFile(
          parsed.options,
          'easing-file',
          'Update-animation easing file'
        );
      }
      if (parsed.options.active !== undefined) {
        params.active = requireBooleanOption(parsed.options, 'active');
      }
      if (parsed.options['always-execute'] !== undefined) {
        params.alwaysExecute = parsed.options['always-execute'];
      }
      ['duration', 'offset'].forEach(function (option) {
        if (parsed.options[option] === undefined) return;
        const value = Number(parsed.options[option]);
        if (!Number.isFinite(value)) throw new Error(`--${option} must be a number of seconds`);
        params[option] = value;
      });
      result = await executeCommand('updateAnimation.set', params);
      break;
    }
    case 'set-update-animations':
      assertAllowedOptions(parsed.options, ['file', 'compact'], 'set-update-animations');
      result = await executeCommand(
        'updateAnimation.setMany',
        readJsonFile(requireOption(parsed.options, 'file'), 'Update-animation assignments')
      );
      break;
    case 'behaviors':
      result = parsed.options.id
        ? await executeCommand('behavior.inspect', { id: parsed.options.id })
        : await executeCommand('behaviors.list', {});
      break;
    case 'set-behavior': {
      assertAllowedOptions(parsed.options, [
        'id', 'property', 'effect', 'active', 'remove', 'easing-file',
        'value-min', 'value-max', 'duration', 'duration-range', 'delay',
        'delay-range', 'compact'
      ], 'set-behavior');
      const params = {
        id: requireOption(parsed.options, 'id'),
        property: requireOption(parsed.options, 'property')
      };
      if (parsed.options.effect !== undefined) params.effect = parsed.options.effect;
      if (parsed.options.active !== undefined) params.active = requireBooleanOption(parsed.options, 'active');
      if (parsed.options.remove !== undefined) params.remove = parsed.options.remove;
      if (parsed.options['easing-file'] !== undefined) {
        params.easing = readJsonOptionFile(
          parsed.options,
          'easing-file',
          'continuous-behavior easing file'
        );
      }
      [
        ['value-min', 'valueMin'],
        ['value-max', 'valueMax'],
        ['duration', 'duration'],
        ['duration-range', 'durationRange'],
        ['delay', 'delay'],
        ['delay-range', 'delayRange']
      ].forEach(function (entry) {
        if (parsed.options[entry[0]] === undefined) return;
        const value = Number(parsed.options[entry[0]]);
        if (!Number.isFinite(value)) throw new Error(`--${entry[0]} must be a finite number`);
        params[entry[1]] = value;
      });
      result = await executeCommand('behavior.set', params);
      break;
    }
    case 'set-behaviors':
      assertAllowedOptions(parsed.options, ['file', 'compact'], 'set-behaviors');
      result = await executeCommand(
        'behavior.setMany',
        readJsonFile(requireOption(parsed.options, 'file'), 'continuous-behavior assignments')
      );
      break;
    case 'create-group': {
      assertAllowedOptions(parsed.options, ['name', 'layout-file', 'compact'], 'create-group');
      const params = { name: requireOption(parsed.options, 'name') };
      if (parsed.options['layout-file'] !== undefined) {
        params.layout = readJsonOptionFile(
          parsed.options,
          'layout-file',
          'group layout file'
        );
      }
      result = await executeCommand('group.create', params);
      break;
    }
    case 'configure-group':
      assertAllowedOptions(parsed.options, ['id', 'layout-file', 'compact'], 'configure-group');
      result = await executeCommand('group.configure', {
        id: requireOption(parsed.options, 'id'),
        layout: readJsonOptionFile(
          parsed.options,
          'layout-file',
          'group layout file',
          true
        )
      });
      break;
    case 'move-group': {
      const index = Number(requireOption(parsed.options, 'index'));
      if (!Number.isInteger(index)) {
        throw new Error('--index must be an integer');
      }
      result = await executeCommand('group.move', {
        id: requireOption(parsed.options, 'id'),
        index: index
      });
      break;
    }
    case 'delete-group':
      result = await executeCommand('group.delete', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    case 'capture':
      result = await captureWithSource(normalizeCaptureOptions(parsed.options));
      break;
    case 'prepare-capture': {
      const captureOptions = normalizePreparedCaptureOptions(parsed.options);
      result = await executeCommand('preview.prepareCapture', {
        target: captureOptions.target,
        restoreAfterMs: captureOptions.restoreAfterMs,
        waitMode: captureOptions.waitMode,
        timeoutMs: captureOptions.timeoutMs,
        settleMs: captureOptions.settleMs,
        timeline: captureOptions.timeline,
        atSeconds: captureOptions.atSeconds,
        includeMeasurements: Boolean(captureOptions.measurementsPath)
      }, Math.max(DEFAULT_TIMEOUT_MS, captureOptions.timeoutMs + 5000));
      if (captureOptions.measurementsPath) {
        try {
          result = savePreparedCaptureMeasurements(result, captureOptions.measurementsPath);
        } catch (error) {
          try {
            await executeCommand('preview.restoreCapture', { captureId: result && result.captureId });
          } catch (restoreError) {
            // The editor's automatic deadline remains the final recovery path.
          }
          throw error;
        }
      }
      if (captureOptions.artifactManifestPath) {
        try {
          const preparedArtifact = createPreparedManifest(result, captureOptions.artifactManifestPath);
          result.artifactManifest = preparedArtifact.metadata;
        } catch (error) {
          try {
            await executeCommand('preview.restoreCapture', { captureId: result && result.captureId });
          } catch (restoreError) {
            // The editor's automatic deadline remains the final recovery path.
          }
          throw error;
        }
      }
      break;
    }
    case 'finalize-capture':
      result = await finalizePreparedCapture(parsed.options);
      break;
    case 'restore-capture':
      assertAllowedOptions(parsed.options, ['capture-id', 'compact'], 'restore-capture');
      result = await executeCommand('preview.restoreCapture', {
        captureId: requireOption(parsed.options, 'capture-id')
      });
      break;
    case 'primitives':
      result = await executeCommand('primitives.list');
      if (parsed.options.primitive) {
        const match = (result.primitives || []).find(function (entry) {
          return entry.primitive === parsed.options.primitive;
        });
        if (!match) {
          throw new Error(`primitive "${parsed.options.primitive}" is not available`);
        }
        result = { primitives: [match] };
      }
      break;
    case 'ensure-group':
      result = await executeCommand('managedGroup.ensure');
      break;
    case 'create': {
      const params = {
        primitive: requireOption(parsed.options, 'primitive')
      };
      if (parsed.options.name) {
        params.name = parsed.options.name;
      }
      result = await executeCommand('primitive.create', params);
      break;
    }
    case 'delete':
      result = await executeCommand('primitive.delete', {
        id: requireOption(parsed.options, 'id')
      });
      break;
    case 'apply': {
      const specification = readJsonFile(
        requireOption(parsed.options, 'file'),
        'graphics specification'
      );
      result = await executeCommand('graphics.apply', specification);
      break;
    }
    case 'validate': {
      const specification = readJsonFile(
        requireOption(parsed.options, 'file'),
        'graphics specification'
      );
      result = await executeCommand('graphics.validate', specification);
      break;
    }
    default:
      throw new Error(
        'Usage: composer-agent.js <pair|pair-intent|start-work|finish-work|status|complete|inspect|script-handoff|control-composition|create-composition|orchestrate|create-revision|delete-composition|open-composition|widget-subcompositions|open-widget-subcomposition|update-table|timeline2|control-nodes|set-control-value|update-control|create-control|create-controls|delete-control|get|get-many|select|move|update|fonts|set-font|timeline-animations|set-timeline-animation|set-timeline-animations|update-animations|set-update-animation|set-update-animations|behaviors|set-behavior|set-behaviors|create-group|configure-group|move-group|delete-group|capture|prepare-capture|finalize-capture|restore-capture|primitives|ensure-group|create|delete|validate|apply> [options]'
      );
  }

  const output = parsed.options.compact
    ? compactResult(parsed.command, result)
    : result;
  console.log(JSON.stringify(output, null, parsed.options.compact ? 0 : 2));
}

run().then(function () {
  writeWorkLifecycleReminder(invokedCommand, true);
}).catch(function (err) {
  const prefix = err.code ? `${err.code}: ` : '';
  console.error(prefix + err.message);
  writeWorkLifecycleReminder(invokedCommand, false);
  process.exitCode = 1;
});
