import assert from 'node:assert/strict';
import { beforeWork72Source } from './work72-preservation.mjs';
import { createHash } from 'node:crypto';
import router from './fixtures/work70-router.json' with { type: 'json' };
const sha = (text) => createHash('sha256').update(text).digest('hex');

// Reverse only the checksum-pinned Loop additions for historical tests.
// Current routing and cross-framework behavior are independently exercised in loop.spec.ts.
export function beforeWork70Source(source, path) {
  if (path !== 'src/use-route.ts') return source;
  source = beforeWork72Source(source, path);
  assert.equal(sha(source), router.afterSha256, 'Unexpected Work70 router bytes');
  for (const edit of [...router.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), router.beforeSha256, 'Accepted Work62 router changed');
  return source;
}
