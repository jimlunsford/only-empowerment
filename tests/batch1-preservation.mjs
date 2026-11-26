import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/batch1-changes.json' with { type: 'json' };

const sha = (text) => createHash('sha256').update(text).digest('hex');
// Reverse only the checksum-pinned Batch 1 edits before historical whole-file guards.
export function beforeBatch1Source(source, path) {
  const change = changes[path];
  if (!change || sha(source) === change.beforeSha256) return source;
  assert.equal(sha(source), change.afterSha256, 'Unexpected Batch1 bytes: ' + path);
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after, path);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256, 'Accepted Batch1 base changed: ' + path);
  return source;
}
