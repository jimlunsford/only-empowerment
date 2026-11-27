import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { beforeBatch5Source } from './batch5-preservation.mjs';
import changes from './fixtures/batch5-changes.json' with { type: 'json' };
const base = '8ba1b1ca8bb34b1837cef08c75f897db29e5c3e4';
const sha = (text) => createHash('sha256').update(text).digest('hex');

test('Batch 5 reverses only pinned visual additions and preserves original print rules', () => {
  assert.deepEqual(Object.keys(changes).sort(), [
    'src/execution.css',
    'src/loop.css',
    'src/navigation.css',
    'src/period-homepage.css',
    'src/period.css',
    'src/rebuild-app.css',
    'src/style.css',
  ]);
  for (const [path, change] of Object.entries(changes)) {
    const source = readFileSync(path, 'utf8');
    const original = execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' });
    assert.equal(sha(source), change.afterSha256, path);
    assert.equal(beforeBatch5Source(source, path), original, path);
    assert.ok(source.startsWith(original), path + ': original print and focus rules retained');
    if (path !== 'src/style.css') assert.match(change.after, /@media screen/);
    for (const altered of [source + '\n', source.replace('--editorial-', '--unexpected-')])
      assert.notEqual(beforeBatch5Source(altered, path), original, path + ': reject unpinned CSS');
  }
});
