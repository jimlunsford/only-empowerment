import {
  beforeBatch4Source,
  beforeBatch4Reading,
  beforeBatch4Copy,
} from './batch4-preservation.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/batch3-changes.json' with { type: 'json' };
import readings from './fixtures/batch3-reading.json' with { type: 'json' };
import copy from './fixtures/batch3-copy.json' with { type: 'json' };
const sha = (s) => createHash('sha256').update(s).digest('hex');
function reverse(source, change, name) {
  assert.equal(sha(source), change.afterSha256, 'Unexpected Batch3 bytes: ' + name);
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after, name);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256, 'Batch 3 base changed: ' + name);
  return source;
}
// The older checks retain their original assertions after exactly pinned edits reverse.
export function beforeBatch3Source(source, path) {
  source = beforeBatch4Source(source, path);
  const change = changes[path];
  if (!change || change.historicalSha256.includes(sha(source))) return source;
  return reverse(source, change, path);
}
export function beforeBatch3Reading(html) {
  html = beforeBatch4Reading(html);
  const entry = Object.entries(readings).find(([, change]) => sha(html) === change.afterSha256);
  return entry ? reverse(html, entry[1], entry[0]) : html;
}
export function beforeBatch3Copy(value) {
  value = beforeBatch4Copy(value);
  if (typeof value === 'string') return copy.find((edit) => edit.after === value)?.before ?? value;
  if (Array.isArray(value)) return value.map(beforeBatch3Copy);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, beforeBatch3Copy(item)]),
    );
  return value;
}
