import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import delta from './fixtures/work72-corrections.json' with { type: 'json' };

const sha = (text) => createHash('sha256').update(text).digest('hex');
// Reverse only the exact bounded correction before applying older preservation guards.
// Any additional byte change fails, including changes inside an approved edit span.
export function beforeWork72Source(source, path) {
  const change = delta[path];
  if (!change) return source;
  assert.equal(sha(source), change.afterSha256, 'Unexpected Work72 bytes: ' + path);
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after, path);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256, 'Work71 source changed: ' + path);
  return source;
}
