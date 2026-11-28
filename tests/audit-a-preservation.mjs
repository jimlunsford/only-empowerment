import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/audit-a-build.json' with { type: 'json' };
const sha = (source) => createHash('sha256').update(source).digest('hex');

// Historical guards reverse only the exact version and build-command changes.
// Any unrecognized bytes remain visible to the existing dependency/script guards.
export function beforeAuditASource(source, path) {
  const change = changes[path];
  if (!change || sha(source) !== change.afterSha256) return source;
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after, path);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256, path);
  return source;
}
