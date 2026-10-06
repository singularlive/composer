'use strict';

const fs = require('fs');
const path = require('path');

const MAX_CAPTURE_BYTES = 8 * 1024 * 1024;
const MAX_SEQUENCE_BYTES = 256 * 1024;
const MAX_SEQUENCE_STEPS = 60;
const MAX_SEQUENCE_DURATION = 10000;
const MAX_SEQUENCE_CAPTURES = 10;
const MAX_TOTAL_CAPTURE_BYTES = 32 * 1024 * 1024;

function commandError(code, message, result) {
  const error = new Error(message);
  error.code = code;
  if (result) error.result = result;
  return error;
}

function requireOption(options, name) {
  if (!options[name]) throw commandError('INVALID_AI_GRAPHICS_OPTION', '--' + name + ' is required');
  return options[name];
}

function assertAllowedOptions(options, allowed, command) {
  Object.keys(options).forEach(function (name) {
    if (!allowed.includes(name)) {
      throw commandError('INVALID_AI_GRAPHICS_OPTION', '--' + name + ' is not available for ai-graphics ' + command);
    }
  });
}

function readText(filePath, description) {
  try {
    return fs.readFileSync(path.resolve(filePath), 'utf8');
  } catch (error) {
    throw commandError('AI_GRAPHICS_FILE_ERROR', 'Unable to read ' + description + ': ' + error.message);
  }
}

function readValues(options) {
  if (!options.values) return {};
  try {
    const values = JSON.parse(readText(options.values, 'AI Graphics sample values'));
    if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error('expected a JSON object');
    return values;
  } catch (error) {
    if (error.code) throw error;
    throw commandError('AI_GRAPHICS_VALUES_INVALID', 'Unable to read AI Graphics sample values: ' + error.message);
  }
}

function parseInteger(options, name) {
  const value = Number(requireOption(options, name));
  if (!Number.isInteger(value) || value <= 0 || value > 8192) {
    throw commandError('INVALID_AI_GRAPHICS_OPTION', '--' + name + ' must be an integer from 1 to 8192');
  }
  return value;
}

function parseProgress(options) {
  const value = options.progress === undefined ? 1 : Number(options.progress);
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw commandError('INVALID_AI_GRAPHICS_OPTION', '--progress must be between 0 and 1');
  }
  return value;
}

function readUpdates(options, definition, values) {
  if (options.updates === undefined) return null;
  const invalid = () => commandError('AI_GRAPHICS_UPDATES_INVALID',
    'Expected version 1 updates with 1-60 ordered steps, integer at milliseconds in 0-10000, ' +
    'declared typed values and at most 10 unique capture names (letters, digits, hyphens; 1-64 characters).');
  let sequence;
  try {
    const filePath = path.resolve(requireOption(options, 'updates'));
    if (fs.statSync(filePath).size > MAX_SEQUENCE_BYTES) throw invalid();
    sequence = JSON.parse(readText(filePath, 'AI Graphics updates'));
  } catch (error) {
    if (error.code === 'AI_GRAPHICS_UPDATES_INVALID' || error.code === 'AI_GRAPHICS_FILE_ERROR') throw error;
    throw invalid();
  }
  const isObject = value => !!value && typeof value === 'object' && !Array.isArray(value);
  if (!isObject(sequence) || sequence.version !== 1 ||
      Object.keys(sequence).some(key => !['version', 'steps'].includes(key)) ||
      !Array.isArray(sequence.steps) || !sequence.steps.length || sequence.steps.length > MAX_SEQUENCE_STEPS) throw invalid();
  let previous = 0;
  let merged = Object.assign({}, values);
  const names = new Set();
  const fields = new Set(Object.keys(loadContract().validateDefinitionSource(definition, {}).projectedData));
  for (const step of sequence.steps) {
    if (!isObject(step) || Object.keys(step).some(key => !['at', 'values', 'capture'].includes(key)) ||
        !Number.isInteger(step.at) || step.at < previous || step.at > MAX_SEQUENCE_DURATION ||
        (step.values === undefined && step.capture === undefined)) throw invalid();
    previous = step.at;
    if (step.values !== undefined) {
      if (!isObject(step.values) || !Object.keys(step.values).length ||
          Object.keys(step.values).some(key => !fields.has(key))) throw invalid();
      merged = Object.assign({}, merged, step.values);
      if (!loadContract().validateDefinitionSource(definition, merged).valid) throw invalid();
    }
    if (step.capture !== undefined) {
      if (typeof step.capture !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,63}$/.test(step.capture) ||
          names.has(step.capture.toLowerCase()) || names.size >= MAX_SEQUENCE_CAPTURES) throw invalid();
      names.add(step.capture.toLowerCase());
    }
  }
  return sequence;
}

function loadContract() {
  try {
    return require('./ai-graphics-contract');
  } catch (error) {
    throw commandError('AI_GRAPHICS_RUNTIME_UNAVAILABLE', 'AI Graphics validation runtime is unavailable. Reinstall the Composer skill.');
  }
}

function loadPlaywright() {
  try {
    return require('./vendor/playwright-core');
  } catch (error) {
    throw commandError('PLAYWRIGHT_UNAVAILABLE', 'The required vendored playwright-core payload is unavailable. Reinstall the Composer skill.');
  }
}

function sanitizeRuntimeError(error) {
  const category = ['ReferenceError', 'TypeError', 'SyntaxError', 'RangeError', 'Error'].includes(error && error.name)
    ? error.name : 'Error';
  const original = String(error && error.message || '');
  let message = 'Runtime error; authored details omitted.';
  if (category === 'ReferenceError' && / is not defined$/.test(original)) message = 'An identifier is not defined.';
  else if (category === 'TypeError' && /^Cannot read properties of (undefined|null)/.test(original)) {
    message = 'Cannot read properties of an absent value.';
  } else if (category === 'TypeError' && / is not a function$/.test(original)) message = 'A value is not a function.';
  else if (category === 'RangeError') message = 'A runtime value is outside the supported range.';
  else if (category === 'SyntaxError') message = 'Runtime JavaScript syntax error.';
  const lifecycleFailure = original.match(/\b(mount|update|seek|destroy) must be a function\b/);
  if (lifecycleFailure) message = lifecycleFailure[1] + ' must be a function';
  const position = String(error && error.stack || '').split('\n').slice(1)
    .map(line => line.match(/:(\d{1,7}):(\d{1,7})\)?\s*$/)).find(Boolean);
  const location = position ? { source: 'runtime-stack', line: Number(position[1]), column: Number(position[2]) } : null;
  return { category: category, message: message, location: location };
}

async function invokeRuntime(page, method, input) {
  const result = await page.evaluate(async function (request) {
    try {
      return { value: await window.__singularAIGraphicsPreview[request.method](request.input) };
    } catch (error) {
      return { error: { name: error && error.name, message: String(error && error.message || ''),
        stack: String(error && error.stack || '') } };
    }
  }, { method: method, input: input });
  if (result.error) {
    const error = commandError('AI_GRAPHICS_PREVIEW_FAILED', 'AI Graphics lifecycle execution failed');
    error.runtimeError = sanitizeRuntimeError(result.error);
    throw error;
  }
  return result.value;
}

async function preview(options, definition, values, validation) {
  const width = parseInteger(options, 'width');
  const height = parseInteger(options, 'height');
  const timeline = options.timeline || 'In';
  if (timeline !== 'In' && timeline !== 'Out') {
    throw commandError('INVALID_AI_GRAPHICS_OPTION', '--timeline must be "In" or "Out"');
  }
  const progress = parseProgress(options);
  const sequence = readUpdates(options, definition, values);
  const outputPath = path.resolve(requireOption(options, 'output'));
  const timeout = options.timeout === undefined ? 30 : Number(options.timeout);
  if (!Number.isFinite(timeout) || timeout <= 0 || timeout > 120) {
    throw commandError('INVALID_AI_GRAPHICS_OPTION', '--timeout must be greater than 0 and no more than 120 seconds');
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const playwright = loadPlaywright();
  const browserBundle = path.join(__dirname, 'ai-graphics-preview-runtime.js');
  if (!fs.existsSync(browserBundle)) {
    throw commandError('AI_GRAPHICS_RUNTIME_UNAVAILABLE', 'AI Graphics preview runtime is unavailable. Reinstall the Composer skill.');
  }

  let browser;
  const consoleErrors = [];
  let blockedRequests = 0;
  let failedRequests = 0;
  let failedResponses = 0;
  let pageErrors = 0;
  let firstPageError = null;
  let executed = false;
  let runtime = {};
  let totalCaptureBytes = 0;
  let finalCapture = null;
  const captures = [];
  let deadlineTimer;
  let timedOut = false;
  const deadline = Date.now() + timeout * 1000;
  function report(failed) {
    return Object.assign({
      valid: true,
      preview: { status: failed ? 'failed' : 'captured', accepted: false },
      definitionVersion: validation.definitionVersion,
      timeline: timeline,
      progress: progress,
      schema: validation.schema,
      diagnostics: validation.diagnostics.concat(consoleErrors.map(function (message) {
        return { severity: 'warning', code: 'RUNTIME_CONSOLE_ERROR', path: 'runtime', message: message };
      })),
      runtime: Object.assign({ executed: executed, blockedRequests: blockedRequests,
        failedRequests: failedRequests, failedResponses: failedResponses, pageErrors: pageErrors,
        firstPageError: firstPageError, asynchronousReadiness: 'unverified',
        dependencies: blockedRequests > 0 ? 'blocked' : failedRequests > 0 || failedResponses > 0 || runtime.failedImages > 0
          ? 'failed' : 'unverified'
      }, runtime)
    }, finalCapture || {}, sequence ? {
      sequence: { clock: 'controlled-javascript', durationMs: sequence.steps[sequence.steps.length - 1].at,
        stepCount: sequence.steps.length, captures: captures }
    } : {});
  }
  try {
    browser = await playwright.chromium.launch({ channel: 'chrome', headless: true, timeout: timeout * 1000 });
    deadlineTimer = setTimeout(function () {
      timedOut = true;
      browser.close().catch(function () { /* The pending browser operation reports the timeout below. */ });
    }, Math.max(1, deadline - Date.now()));
    const page = await browser.newPage({ viewport: { width: width, height: height }, deviceScaleFactor: 1 });
    page.setDefaultTimeout(timeout * 1000);
    if (sequence) {
      const epoch = new Date('2026-01-01T00:00:00Z');
      await page.clock.install({ time: epoch });
      await page.clock.pauseAt(epoch);
    }
    page.on('console', function (message) {
      if (message.type() === 'error' && consoleErrors.length < 20) consoleErrors.push('Runtime console error; authored details omitted.');
    });
    page.on('pageerror', function (error) {
      pageErrors++;
      if (!firstPageError) firstPageError = sanitizeRuntimeError(error);
    });
    page.on('requestfailed', function () { failedRequests++; });
    page.on('response', function (response) { if (response.status() >= 400) failedResponses++; });
    await page.route('**/*', function (route) {
      const resourceType = route.request().resourceType();
      if (['image', 'stylesheet', 'font'].includes(resourceType)) route.continue();
      else { blockedRequests++; route.abort('blockedbyclient'); }
    });
    await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head>' +
      '<body style="margin:0;overflow:hidden;background:transparent"></body></html>');
    await page.addScriptTag({ path: browserBundle });
    executed = true;
    runtime = await invokeRuntime(page, 'render', {
      definition: definition, values: values, width: width, height: height,
      timeline: timeline, progress: progress, controlledClock: !!sequence
    });
    async function capture(filePath) {
      const image = await page.locator('#preview-host').screenshot({ type: 'png', timeout: timeout * 1000 });
      if (image.length > MAX_CAPTURE_BYTES || totalCaptureBytes + image.length > MAX_TOTAL_CAPTURE_BYTES) {
        throw commandError('AI_GRAPHICS_PREVIEW_TOO_LARGE', 'AI Graphics preview exceeds the 8 MB per-image or 32 MB total limit');
      }
      if (image.length < 24 || image.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
        throw commandError('AI_GRAPHICS_PREVIEW_FAILED', 'AI Graphics preview did not produce a valid PNG');
      }
      fs.writeFileSync(filePath, image);
      totalCaptureBytes += image.length;
      return { output: filePath, width: image.readUInt32BE(16), height: image.readUInt32BE(20), bytes: image.length };
    }
    if (sequence) {
      let elapsed = 0;
      for (const step of sequence.steps) {
        if (step.at > elapsed) await page.clock.runFor(step.at - elapsed);
        elapsed = step.at;
        if (step.values) await invokeRuntime(page, 'update', step.values);
        if (step.capture) {
          const parsed = path.parse(outputPath);
          const filePath = path.join(parsed.dir, parsed.name + '-' + step.capture + '.png');
          captures.push(Object.assign({ name: step.capture, at: step.at }, await capture(filePath)));
        }
      }
      runtime = await invokeRuntime(page, 'inspect');
    }
    finalCapture = await capture(outputPath);
    await invokeRuntime(page, 'destroy');
    const failed = blockedRequests > 0 || failedRequests > 0 || failedResponses > 0 ||
      pageErrors > 0 || consoleErrors.length > 0 || runtime.failedImages > 0 || runtime.pendingImages > 0;
    const result = report(failed);
    if (failed) {
      if (firstPageError) result.diagnostics.push(Object.assign({
        severity: 'error', code: 'RUNTIME_PAGE_ERROR', path: 'runtime'
      }, firstPageError));
      result.diagnostics.push({ severity: 'error', code: 'AI_GRAPHICS_PREVIEW_INCOMPLETE', path: 'runtime',
        message: 'Observed runtime or dependency failures; schema validity and a PNG do not establish rendering success.' });
      throw commandError('AI_GRAPHICS_PREVIEW_INCOMPLETE', 'AI Graphics preview has runtime or dependency failures', result);
    }
    return result;
  } catch (error) {
    if (error.result) throw error;
    const detail = error.runtimeError || sanitizeRuntimeError(error);
    if (error.runtimeError && !firstPageError) firstPageError = detail;
    const exceededDeadline = timedOut || Date.now() >= deadline;
    const code = exceededDeadline ? 'AI_GRAPHICS_PREVIEW_TIMEOUT' : error.code || 'AI_GRAPHICS_PREVIEW_FAILED';
    const result = report(true);
    result.diagnostics.push(Object.assign({ severity: 'error', code: code, path: 'runtime' }, detail));
    throw commandError(code, exceededDeadline ? 'AI Graphics preview exceeded its overall timeout' :
      detail.category + ': ' + detail.message, result);
  } finally {
    clearTimeout(deadlineTimer);
    if (browser) await browser.close();
  }
}

async function run(action, options) {
  if (action === 'validate') {
    assertAllowedOptions(options, ['action', 'file', 'values', 'compact'], action);
  } else if (action === 'preview') {
    assertAllowedOptions(options, ['action', 'file', 'values', 'updates', 'width', 'height', 'timeline', 'progress', 'output', 'timeout', 'compact'], action);
  } else {
    throw commandError('INVALID_AI_GRAPHICS_COMMAND', 'ai-graphics requires "validate" or "preview"');
  }
  const definition = readText(requireOption(options, 'file'), 'AI Graphics definition');
  const values = readValues(options);
  const validation = loadContract().validateDefinitionSource(definition, values);
  if (action === 'validate') return validation;
  if (!validation.valid) {
    throw commandError('AI_GRAPHICS_DEFINITION_INVALID', 'AI Graphics definition failed validation', validation);
  }
  return preview(options, definition, values, validation);
}

module.exports = { run: run };