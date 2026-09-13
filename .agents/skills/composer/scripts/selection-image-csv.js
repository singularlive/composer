'use strict';

const MAX_CSV_BYTES = 1024 * 1024;

function csvError(message) {
  const error = new Error(message);
  error.code = 'INVALID_SELECTION_IMAGE_CSV';
  return error;
}

function parseRows(source) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (quoted) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index++;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
    } else if (character === '"' && field === '') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && source[index + 1] === '\n') index++;
      row.push(field);
      if (row.some(function (value) { return value !== ''; })) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (quoted) throw csvError('Image CSV contains an unterminated quoted field');
  row.push(field);
  if (row.some(function (value) { return value !== ''; })) rows.push(row);
  return rows;
}

function validateImageUrl(value, rowNumber) {
  if (!value || value.length > 2048 || !/^(?:https?:)?\/\//i.test(value)) {
    throw csvError('Image CSV row ' + rowNumber + ' url must be an HTTP(S) or protocol-relative URL');
  }
  let parsed;
  try {
    parsed = new URL(value, 'https://localhost');
  } catch (error) {
    throw csvError('Image CSV row ' + rowNumber + ' url is invalid');
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw csvError('Image CSV row ' + rowNumber + ' url must not contain credentials');
  }
}

function parseImageSelectionCsv(source) {
  if (typeof source !== 'string') throw csvError('Image CSV must be text');
  if (Buffer.byteLength(source, 'utf8') > MAX_CSV_BYTES) {
    throw csvError('Image CSV exceeds the 1 MB input limit');
  }
  const rows = parseRows(source.replace(/^\uFEFF/, ''));
  if (!rows.length) throw csvError('Image CSV is empty');
  const headers = rows[0].map(function (value) { return value.trim().toLowerCase(); });
  const typeIndex = headers.indexOf('type');
  const nameIndex = headers.indexOf('name');
  const urlIndex = headers.indexOf('url');
  const hasDashboardHeaders = typeIndex !== -1 && nameIndex !== -1 && urlIndex !== -1;
  const hasSimpleHeaders = typeIndex === -1 && nameIndex !== -1 && urlIndex !== -1;
  const dataRows = hasDashboardHeaders || hasSimpleHeaders ? rows.slice(1) : rows;
  const dataNameIndex = nameIndex === -1 ? 0 : nameIndex;
  const dataUrlIndex = urlIndex === -1 ? 1 : urlIndex;
  if (!hasDashboardHeaders && !hasSimpleHeaders && rows[0].length !== 2) {
    throw csvError('Image list requires Dashboard type,name,url headers or name,url pairs');
  }

  const seen = new Set();
  const selections = dataRows.map(function (row, index) {
    return { row: row, rowNumber: index + (dataRows === rows ? 1 : 2) };
  }).filter(function (entry) {
    return !hasDashboardHeaders ||
      (entry.row[typeIndex] || '').trim().toLowerCase() === 'image';
  }).map(function (entry) {
    const row = entry.row;
    const rowNumber = entry.rowNumber;
    const title = (row[dataNameIndex] || '').trim();
    const url = (row[dataUrlIndex] || '').trim();
    if (!title) throw csvError('Image CSV row ' + rowNumber + ' name must not be empty');
    validateImageUrl(url, rowNumber);
    if (seen.has(url)) throw csvError('Image CSV row ' + rowNumber + ' duplicates url "' + url + '"');
    seen.add(url);
    return { id: url, title: title };
  });
  if (!selections.length) throw csvError('Image CSV must contain at least one image row');
  if (selections.length > 100) throw csvError('Image CSV must contain at most 100 image rows');
  return selections;
}

module.exports = { parseImageSelectionCsv: parseImageSelectionCsv };