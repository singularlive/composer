'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const HOST_DIRECTORIES = ['.agents', '.claude', '.codex'];

function pathIdentity(value) {
  const resolved = path.resolve(value);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function containsHostPath(skillRoot, hostDirectory) {
  const normalized = path.resolve(skillRoot).replace(/[\\/]+/g, path.sep);
  const marker = path.sep + hostDirectory + path.sep + 'skills' + path.sep + 'composer';
  return process.platform === 'win32'
    ? normalized.toLowerCase().includes(marker.toLowerCase())
    : normalized.includes(marker);
}

function realPath(value) {
  try {
    return fs.realpathSync.native ? fs.realpathSync.native(value) : fs.realpathSync(value);
  } catch (error) {
    return path.resolve(value);
  }
}

function getInstallationScope(skillRoot, homeDirectory) {
  const rootIdentity = pathIdentity(skillRoot);
  const home = homeDirectory || os.homedir();
  const globalRoots = HOST_DIRECTORIES.map(function (hostDirectory) {
    return pathIdentity(path.join(home, hostDirectory, 'skills', 'composer'));
  });
  if (globalRoots.includes(rootIdentity)) return 'global';
  return HOST_DIRECTORIES.some(function (hostDirectory) {
    return containsHostPath(skillRoot, hostDirectory);
  }) ? 'project' : 'custom';
}

function getInstallationHost(skillRoot) {
  const hostDirectory = HOST_DIRECTORIES.find(function (candidate) {
    return containsHostPath(skillRoot, candidate);
  });
  return hostDirectory ? hostDirectory.slice(1) : 'custom';
}

function findSkillInstallations(selectedRoot, options) {
  const settings = options || {};
  const cwd = path.resolve(settings.cwd || process.cwd());
  const home = path.resolve(settings.home || os.homedir());
  const candidates = [path.resolve(selectedRoot)];
  let current = cwd;
  while (true) {
    HOST_DIRECTORIES.forEach(function (hostDirectory) {
      candidates.push(path.join(current, hostDirectory, 'skills', 'composer'));
    });
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  HOST_DIRECTORIES.forEach(function (hostDirectory) {
    candidates.push(path.join(home, hostDirectory, 'skills', 'composer'));
  });

  const selectedPathIdentity = pathIdentity(selectedRoot);
  const selectedRealPathIdentity = pathIdentity(realPath(selectedRoot));
  const seenPaths = new Set();
  return candidates.filter(function (candidate) {
    const identity = pathIdentity(candidate);
    if (seenPaths.has(identity) || !fs.existsSync(path.join(candidate, 'SKILL.md'))) return false;
    seenPaths.add(identity);
    return true;
  }).map(function (candidate) {
    const root = path.resolve(candidate);
    const canonicalPath = realPath(root);
    let version = null;
    try {
      version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version || null;
    } catch (error) {}
    return {
      path: root,
      realPath: canonicalPath,
      scope: getInstallationScope(root, home),
      host: getInstallationHost(root),
      packageVersion: version,
      selected: pathIdentity(root) === selectedPathIdentity,
      samePhysicalInstallation: pathIdentity(canonicalPath) === selectedRealPathIdentity
    };
  });
}

function getDuplicateInstallations(installations) {
  const seenRealPaths = new Set();
  return installations.filter(function (installation) {
    if (installation.samePhysicalInstallation) return false;
    const identity = pathIdentity(installation.realPath);
    if (seenRealPaths.has(identity)) return false;
    seenRealPaths.add(identity);
    return true;
  });
}

module.exports = {
  findSkillInstallations,
  getDuplicateInstallations,
  getInstallationScope
};