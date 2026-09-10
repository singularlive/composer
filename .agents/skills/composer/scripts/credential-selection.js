function pairedAtTime(credentials) {
  const value = credentials && new Date(credentials.pairedAt).getTime();
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
}

function isCompleteCredential(credentials) {
  return Boolean(
    credentials &&
    credentials.server &&
    credentials.accessToken &&
    credentials.socketPath
  );
}

function normalizeConnectionProfile(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value)) {
    throw new Error('--connection must be 1-64 letters, numbers, periods, underscores, or hyphens');
  }
  return value;
}

function selectNewestCredentialCandidate(candidates) {
  let selected = null;
  candidates.forEach(function (candidate) {
    if (!candidate || !isCompleteCredential(candidate.credentials)) return;
    if (!selected || pairedAtTime(candidate.credentials) > pairedAtTime(selected.credentials)) {
      selected = candidate;
    }
  });
  return selected;
}

module.exports = {
  isCompleteCredential,
  normalizeConnectionProfile,
  pairedAtTime,
  selectNewestCredentialCandidate
};
