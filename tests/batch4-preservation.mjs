import { beforeBookLinksReading } from './book-links-preservation.mjs';
import { beforeBatch5Source } from './batch5-preservation.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/batch4-changes.json' with { type: 'json' };
import readings from './fixtures/batch4-reading.json' with { type: 'json' };
const sha = (s) => createHash('sha256').update(s).digest('hex');
function reverse(source, change) {
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256);
  return source;
}
// Only exact Batch 4 bytes reverse. Unknown bytes pass through to the historical
// guards and fail there; batch4.test independently pins every current source.
export function beforeBatch4Source(source, path) {
  source = beforeBatch5Source(source, path);
  const change = changes[path];
  return change && sha(source) === change.afterSha256 ? reverse(source, change) : source;
}
export function beforeBatch4Reading(html) {
  html = beforeBookLinksReading(html);
  const change = Object.values(readings).find((entry) => sha(html) === entry.afterSha256);
  return change ? reverse(html, change) : html;
}
export function beforeBatch4Copy(value) {
  if (typeof value === 'string')
    return (
      {
        'Discipline.': 'Discipline',
        'Put your values into practice when the feeling fades.':
          'Put your values into the day. Keep practicing them when the feeling fades.',
      }[value] ?? value
    );
  if (Array.isArray(value)) return value.map(beforeBatch4Copy);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, beforeBatch4Copy(item)]),
    );
  return value;
}
