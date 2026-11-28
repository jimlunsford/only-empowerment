import { beforeHomepagePositioningSource } from './homepage-positioning-preservation.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/editorial-e1-e3-changes.json' with { type: 'json' };
import readings from './fixtures/editorial-e1-e3-readings.json' with { type: 'json' };
const sha = (source) => createHash('sha256').update(source).digest('hex');
function reverse(source, change) {
  if (!change || sha(source) !== change.afterSha256) return source;
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256);
  return source;
}
// Only the exact E1-E3 candidate reverses. Unknown edits remain visible to historical guards.
export function beforeEditorialSource(source, path) {
  return reverse(beforeHomepagePositioningSource(source, path), changes[path]);
}
export function beforeEditorialReading(html) {
  return reverse(
    html,
    Object.values(readings).find((change) => sha(html) === change.afterSha256),
  );
}
