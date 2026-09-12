#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const skillRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(skillRoot, 'package.json'), 'utf8'));
const packageLock = JSON.parse(fs.readFileSync(path.join(skillRoot, 'package-lock.json'), 'utf8'));
const cliSource = fs.readFileSync(path.join(__dirname, 'composer-agent.js'), 'utf8');
const versionMatch = cliSource.match(/const SKILL_VERSION = (\d+);/);
const dependencyOrigins = { 'playwright-core': ['capture-composition-preview.js', 'verifyComposition.mjs'] };

function findSystemChrome() {
  const candidates = process.platform === 'win32' ? [
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
  ] : process.platform === 'darwin' ? [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ] : [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable'
  ];
  return candidates.filter(Boolean).some(function (candidate) { return fs.existsSync(candidate); });
}

function inspectDependency(name, expectedVersion) {
  const lockEntry = packageLock.packages && packageLock.packages[`node_modules/${name}`];
  const result = {
    package: name,
    expectedVersion: expectedVersion,
    lockVersion: lockEntry && lockEntry.version || null,
    originatingScripts: dependencyOrigins[name] || [],
    status: 'missing'
  };
  if (!lockEntry || lockEntry.version !== expectedVersion) {
    result.status = 'lockfile-mismatch';
    result.errorCode = 'DEPENDENCY_LOCK_MISMATCH';
    return result;
  }
  let resolved;
  try {
    resolved = require.resolve(name, { paths: [__dirname] });
  } catch (error) {
    result.errorCode = 'MODULE_NOT_FOUND';
    return result;
  }
  const expectedRoot = path.join(skillRoot, 'node_modules') + path.sep;
  if (!resolved.startsWith(expectedRoot)) {
    result.status = 'wrong-root';
    result.errorCode = 'DEPENDENCY_ROOT_MISMATCH';
    return result;
  }
  const metadataPath = path.join(skillRoot, 'node_modules', name, 'package.json');
  try {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    result.actualVersion = metadata.version;
    result.status = metadata.version === expectedVersion ? 'resolved' : 'version-mismatch';
    if (result.status !== 'resolved') result.errorCode = 'DEPENDENCY_VERSION_MISMATCH';
  } catch (error) {
    result.status = 'invalid';
    result.errorCode = 'DEPENDENCY_METADATA_INVALID';
  }
  return result;
}

const captureRequested = process.argv.includes('--capture');
const optionalDependencies = packageJson.optionalDependencies || {};
const dependencies = captureRequested
  ? Object.keys(optionalDependencies).map(function (name) {
    return inspectDependency(name, optionalDependencies[name]);
  })
  : [];
const nodeExpectedMajor = Number(String(packageJson.engines.node).match(/\d+/)[0]);
const nodeActualMajor = Number(process.versions.node.split('.')[0]);
const lockedRoot = packageLock.packages && packageLock.packages[''] || {};
const lockMatches = JSON.stringify(optionalDependencies) === JSON.stringify(lockedRoot.optionalDependencies || {}) &&
  Object.keys(packageJson.dependencies || {}).length === 0 &&
  Object.keys(lockedRoot.dependencies || {}).length === 0;
const coreMetadata = packageJson.composerAgent || {};
const coreReady = coreMetadata.coreRuntime === 'scripts/composer-agent.js' &&
  coreMetadata.protocolVersion === (versionMatch ? Number(versionMatch[1]) : null) &&
  Array.isArray(coreMetadata.coreDependenciesBundled) &&
  coreMetadata.coreDependenciesBundled.length > 0;
const failed = dependencies.some(function (dependency) { return dependency.status !== 'resolved'; }) ||
  nodeExpectedMajor !== nodeActualMajor || !lockMatches || !coreReady || (captureRequested && !findSystemChrome());

process.stdout.write(JSON.stringify({
  status: failed ? 'failed' : 'passed',
  packageVersion: packageJson.version,
  skillVersion: versionMatch ? Number(versionMatch[1]) : null,
  payloadRoot: 'composer-skill',
  core: {
    status: coreReady ? 'ready' : 'invalid',
    selfContained: coreReady,
    bundledDependencies: coreMetadata.coreDependenciesBundled || [],
    errorCode: coreReady ? null : 'CORE_RUNTIME_INVALID'
  },
  node: {
    status: nodeExpectedMajor === nodeActualMajor ? 'compatible' : 'version-mismatch',
    expectedMajor: nodeExpectedMajor,
    actualMajor: nodeActualMajor,
    errorCode: nodeExpectedMajor === nodeActualMajor ? null : 'NODE_VERSION_MISMATCH'
  },
  lockfile: {
    status: lockMatches ? 'matched' : 'mismatch',
    errorCode: lockMatches ? null : 'LOCKFILE_MISMATCH'
  },
  dependencies: dependencies,
  capture: captureRequested
    ? {
      checked: true,
      systemChrome: findSystemChrome() ? 'available' : 'missing',
      errorCode: findSystemChrome() ? null : 'CHROME_NOT_FOUND'
    }
    : { checked: false }
}, null, 2) + '\n');

if (failed) process.exitCode = 1;
