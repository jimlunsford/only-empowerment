import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import delta from './fixtures/work45-correction-delta.json' with { type: 'json' };
const hash = (source) => createHash('sha256').update(source).digest('hex');

// Only the exact reviewed native-control correction may precede historical guards.
// Already normalized bytes are allowed when two older guard layers are composed.
export function beforeWork45Source(source, path) {
  const change = delta[path];
  if (!change || hash(source) === change.beforeSha256) return source;
  assert.equal(hash(source), change.afterSha256, path);
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.split(edit.after).length, 2, `Unique Work 45 correction: ${path}`);
    source = source.replace(edit.after, edit.before);
  }
  assert.equal(hash(source), change.beforeSha256, path);
  return source;
}
