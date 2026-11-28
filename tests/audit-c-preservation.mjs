import { beforeEditorialReading } from './editorial-e1-e3-preservation.mjs';
import { beforeAuditDSource } from './audit-d-preservation.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/audit-c-changes.json' with { type: 'json' };
import readings from './fixtures/audit-c-readings.json' with { type: 'json' };
import copy from './fixtures/audit-c-copy.json' with { type: 'json' };
const sha = (source) => createHash('sha256').update(source).digest('hex');
function reverse(source, change) {
  if (!change || sha(source) !== change.afterSha256) return source;
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256);
  return source;
}
// Exact Batch C bytes only. Unknown edits remain visible to historical guards.
export function beforeAuditCSource(source, path) {
  return reverse(beforeAuditDSource(source, path), changes[path]);
}
export function beforeAuditCReading(html) {
  html = beforeEditorialReading(html);
  return reverse(
    html,
    Object.values(readings).find((change) => sha(html) === change.afterSha256),
  );
}
export function beforeAuditCCopy(value) {
  if (typeof value === 'string') return copy.find((edit) => edit.after === value)?.before ?? value;
  if (Array.isArray(value)) return value.map(beforeAuditCCopy);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, beforeAuditCCopy(item)]),
    );
  return value;
}
