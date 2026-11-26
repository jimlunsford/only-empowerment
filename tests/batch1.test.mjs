import { beforeBatch2Source } from './batch2-preservation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { beforeBatch1Source } from './batch1-preservation.mjs';
import changes from './fixtures/batch1-changes.json' with { type: 'json' };

const sha = (text) => createHash('sha256').update(text).digest('hex');
test('Batch 1 reverses exactly to current main and rejects incidental edits inside and outside approved spans', () => {
  assert.deepEqual(
    Object.keys(changes).sort(),
    [
      'THIRD_PARTY_NOTICES.md',
      'src/Execution.tsx',
      'src/execution.css',
      'src/loop-practice-content.ts',
      'src/loop.css',
      'src/rebuild-app.css',
      'src/rebuild-source-scoped.css',
      'src/style.css',
    ].sort(),
  );
  for (const [path, change] of Object.entries(changes)) {
    const current = beforeBatch2Source(readFileSync(path, 'utf8'), path);
    const base = execFileSync('git', ['show', 'f1290043500c64c86e26f308ba198a880d7d9bba:' + path], {
      encoding: 'utf8',
    });
    assert.equal(sha(current), change.afterSha256, path);
    assert.equal(beforeBatch1Source(current, path), base, path);
    assert.throws(() => beforeBatch1Source(current + '\n', path), /Unexpected Batch[12] bytes/);
    const edit = change.edits[0];
    assert.throws(
      () =>
        beforeBatch1Source(
          current.slice(0, edit.start) + 'x' + current.slice(edit.start + 1),
          path,
        ),
      /Unexpected Batch[12] bytes/,
    );
  }
});
