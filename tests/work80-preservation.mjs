import assert from 'node:assert/strict';
import { beforeBatch1Source } from './batch1-preservation.mjs';
import { createHash } from 'node:crypto';
import changes from './fixtures/work80-integration.json' with { type: 'json' };

const sha = (text) => createHash('sha256').update(text).digest('hex');
// Reverse only checksum-pinned Work 80 integration edits before historical guards.
// Some historical adapters compose; the exact accepted base is idempotent.
// work80.test.mjs separately requires every current file to match its new hash.
export function beforeWork80Source(source, path) {
  source = beforeBatch1Source(source, path);
  const change = changes[path];
  if (!change || sha(source) === change.beforeSha256) return source;
  assert.equal(sha(source), change.afterSha256, 'Unexpected Work80 bytes: ' + path);
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after, path);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256, 'Accepted Work80 base changed: ' + path);
  return source;
}
