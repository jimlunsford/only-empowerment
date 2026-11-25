import assert from 'node:assert/strict';
import { beforeWork80Source } from './work80-preservation.mjs';
import { createHash } from 'node:crypto';
import changes from './fixtures/work75-dialog-focus.json' with { type: 'json' };

const sha = (text) => createHash('sha256').update(text).digest('hex');
// Preserve every older whole-file guard by reversing only the pinned opener fix.
export function beforeWork75Source(source, path) {
  source = beforeWork80Source(source, path);
  const change = changes[path];
  if (!change) return source;
  assert.equal(sha(source), change.afterSha256, 'Unexpected Work75 bytes: ' + path);
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after, path);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256, 'Work73 source changed: ' + path);
  return source;
}
