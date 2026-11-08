import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import delta from './fixtures/work43-correction-delta.json' with { type: 'json' };

// Reverse only the exact browser corrections before applying the original
// whole-file guards. Teaching, CI settings and unrelated dependencies stay pinned.
export function beforeWork43Source(source, path) {
  const change = delta[path];
  if (!change) return source;
  assert.equal(createHash('sha256').update(source).digest('hex'), change.afterSha256, path);
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.split(edit.after).length, 2, `Unique Work 43 correction: ${path}`);
    source = source.replace(edit.after, edit.before);
  }
  assert.equal(createHash('sha256').update(source).digest('hex'), change.beforeSha256, path);
  return source;
}
