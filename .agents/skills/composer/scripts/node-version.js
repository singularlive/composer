'use strict';

const SUPPORTED_NODE_MAJORS = Object.freeze([22, 24]);
const SUPPORTED_NODE_RANGE = SUPPORTED_NODE_MAJORS.map(major => major + '.x').join(' || ');

function inspectNodeVersion(version) {
  const actualMajor = Number(version.split('.')[0]);
  const compatible = SUPPORTED_NODE_MAJORS.includes(actualMajor);
  return {
    status: compatible ? 'compatible' : 'version-mismatch',
    expectedMajors: SUPPORTED_NODE_MAJORS.slice(),
    actualMajor,
    errorCode: compatible ? null : 'NODE_VERSION_MISMATCH',
    severity: compatible ? null : 'blocking',
    requiredAction: compatible ? null :
      'Select Node.js ' + SUPPORTED_NODE_MAJORS.map(major => major + '.x').join(' or ') +
      ' for the skill CLI and rerun dependency-preflight before pairing or further work. Do not downgrade the skill.'
  };
}

module.exports = { SUPPORTED_NODE_RANGE, inspectNodeVersion };
