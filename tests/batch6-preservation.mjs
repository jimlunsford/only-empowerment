import { beforeBatch7Source } from './batch7-preservation.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/batch6-changes.json' with { type: 'json' };
const sha = (source) => createHash('sha256').update(source).digest('hex');
// Accept only exact reviewed presentation bytes. Unknown changes remain visible
// to historical guards and cannot be hidden by this layout baseline.
export function beforeBatch6Source(source, path) {
  source = beforeBatch7Source(source, path);
  const change = changes[path];
  if (!change || sha(source) !== change.afterSha256) return source;
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after, path);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256, path);
  return source;
}
