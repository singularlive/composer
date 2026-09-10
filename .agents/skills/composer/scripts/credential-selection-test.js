#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');
const selection = require('./credential-selection');

function credential(pairedAt, token) {
  return {
    server: 'http://localhost:3000',
    socketPath: '/composer-agent/socket',
    accessToken: token,
    pairedAt: pairedAt
  };
}

const olderDefault = { path: 'default', credentials: credential('2026-08-28T00:00:00.000Z', 'old') };
const newerTemporary = { path: 'temporary', credentials: credential('2026-08-29T00:00:00.000Z', 'new') };
assert.strictEqual(
  selection.selectNewestCredentialCandidate([olderDefault, newerTemporary]),
  newerTemporary
);
assert.strictEqual(
  selection.selectNewestCredentialCandidate([newerTemporary, olderDefault]),
  newerTemporary
);
assert.strictEqual(selection.selectNewestCredentialCandidate([
  { path: 'incomplete', credentials: { pairedAt: '2026-08-30T00:00:00.000Z' } },
  olderDefault
]), olderDefault);
assert.strictEqual(selection.selectNewestCredentialCandidate([]), null);
assert.strictEqual(selection.isCompleteCredential(olderDefault.credentials), true);
assert.strictEqual(selection.isCompleteCredential({}), false);
assert.strictEqual(selection.normalizeConnectionProfile('task-42.alpha'), 'task-42.alpha');
assert.throws(
  () => selection.normalizeConnectionProfile('../shared'),
  /--connection must be 1-64/
);
const environment = Object.assign({}, process.env);
delete environment.COMPOSER_AGENT_CREDENTIALS;
const unscoped = spawnSync(process.execPath, [
  path.join(__dirname, 'composer-agent.js'),
  'status', '--message', 'test'
], { encoding: 'utf8', env: environment });
assert.notStrictEqual(unscoped.status, 0);
assert.match(unscoped.stderr, /--connection is required to isolate this AI agent/);

process.stdout.write(JSON.stringify({ status: 'passed', assertions: 10 }) + '\n');
