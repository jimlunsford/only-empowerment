import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/batch5-changes.json' with { type: 'json' };
const sha = (source) => createHash('sha256').update(source).digest('hex');
// Reverse only the exact reviewed visual additions. Unknown bytes remain visible
// to historical guards; batch5.test pins every current stylesheet independently.
export function beforeBatch5Source(source, path) {
  const change = changes[path];
  if (!change || sha(source) !== change.afterSha256) return source;
  assert.equal(source.slice(change.start), change.after, path);
  const original = source.slice(0, change.start);
  assert.equal(sha(original), change.beforeSha256, path);
  return original;
}
