'use strict';

const fs = require('fs');
const path = require('path');

const MAX_CAPTURE_BYTES = 8 * 1024 * 1024;

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

async function preview(options, definition, values, validation) {
  const width = parseInteger(options, 'width');
  const height = parseInteger(options, 'height');
  const timeline = options.timeline || 'In';
  if (timeline !== 'In' && timeline !== 'Out') {
    throw commandError('INVALID_AI_GRAPHICS_OPTION', '--timeline must be "In" or "Out"');
  }
  const progress = parseProgress(options);
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
  try {
    browser = await playwright.chromium.launch({ channel: 'chrome', headless: true, timeout: timeout * 1000 });
    const page = await browser.newPage({ viewport: { width: width, height: height }, deviceScaleFactor: 1 });
    page.setDefaultTimeout(timeout * 1000);
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
    const runtime = await page.evaluate(function (input) {
      return window.__singularAIGraphicsPreview.render(input);
    }, { definition: definition, values: values, width: width, height: height, timeline: timeline, progress: progress });
    const image = await page.locator('#preview-host').screenshot({ path: outputPath, type: 'png', timeout: timeout * 1000 });
    await page.evaluate(function () { window.__singularAIGraphicsPreview.destroy(); });
    if (image.length > MAX_CAPTURE_BYTES) {
      fs.rmSync(outputPath, { force: true });
      throw commandError('AI_GRAPHICS_PREVIEW_TOO_LARGE', 'AI Graphics preview exceeds the 8 MB output limit');
    }
    if (image.length < 24 || image.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
      fs.rmSync(outputPath, { force: true });
      throw commandError('AI_GRAPHICS_PREVIEW_FAILED', 'AI Graphics preview did not produce a valid PNG');
    }
    const failed = blockedRequests > 0 || failedRequests > 0 || failedResponses > 0 ||
      pageErrors > 0 || consoleErrors.length > 0 || runtime.failedImages > 0;
    const report = {
      valid: true,
      preview: { status: failed ? 'failed' : 'captured', accepted: false },
      definitionVersion: validation.definitionVersion,
      output: outputPath,
      width: image.readUInt32BE(16),
      height: image.readUInt32BE(20),
      bytes: image.length,
      timeline: timeline,
      progress: progress,
      schema: validation.schema,
      diagnostics: validation.diagnostics.concat(consoleErrors.map(function (message) {
        return { severity: 'warning', code: 'RUNTIME_CONSOLE_ERROR', path: 'runtime', message: message };
      })),
      runtime: Object.assign({ executed: true, blockedRequests: blockedRequests,
        failedRequests: failedRequests, failedResponses: failedResponses, pageErrors: pageErrors,
        firstPageError: firstPageError,
        asynchronousReadiness: 'unverified',
        dependencies: blockedRequests > 0 ? 'blocked' : failedRequests > 0 || failedResponses > 0 || runtime.failedImages > 0
          ? 'failed' : 'unverified'
      }, runtime)
    };
    if (failed) {
      if (firstPageError) report.diagnostics.push(Object.assign({
        severity: 'error', code: 'RUNTIME_PAGE_ERROR', path: 'runtime'
      }, firstPageError));
      report.diagnostics.push({ severity: 'error', code: 'AI_GRAPHICS_PREVIEW_INCOMPLETE', path: 'runtime',
        message: 'Observed runtime or dependency failures; schema validity and a PNG do not establish rendering success.' });
      throw commandError('AI_GRAPHICS_PREVIEW_INCOMPLETE', 'AI Graphics preview has runtime or dependency failures', report);
    }
    return report;
  } catch (error) {
    if (error.code) throw error;
    const detail = sanitizeRuntimeError(error);
    throw commandError('AI_GRAPHICS_PREVIEW_FAILED', detail.category + ': ' + detail.message);
  } finally {
    if (browser) await browser.close();
  }
}

async function run(action, options) {
  if (action === 'validate') {
    assertAllowedOptions(options, ['action', 'file', 'values', 'compact'], action);
  } else if (action === 'preview') {
    assertAllowedOptions(options, ['action', 'file', 'values', 'width', 'height', 'timeline', 'progress', 'output', 'timeout', 'compact'], action);
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