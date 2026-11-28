import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/audit-d-changes.json' with { type: 'json' };
const sha = (source) => createHash('sha256').update(source).digest('hex');
// Reverse only exact Batch D bytes. Every unknown edit remains visible to prior guards.
export function beforeAuditDSource(source, path) {
  const change = changes[path];
  if (!change || sha(source) !== change.afterSha256) return source;
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after, path);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256, path);
  return source;
}
