import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import changes from './fixtures/batch7-changes.json' with { type: 'json' };
import { beforeBatch7Source } from './batch7-preservation.mjs';
const base = '491bccfb74cc4ddd12e83bb09038bdd65258d294';
const sha = (source) => createHash('sha256').update(source).digest('hex');

test('Batch 7 accepts only exact scoped presentation and notice edits', () => {
  const paths = execFileSync(
    'git',
    ['ls-tree', '-r', '--name-only', base, 'src', 'scripts', 'docs/work53-source'],
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n');
  for (const path of paths) {
    const original = execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' });
    const source = readFileSync(path, 'utf8');
    if (changes[path]) {
      assert.equal(sha(source), changes[path].afterSha256, path);
      assert.equal(beforeBatch7Source(source, path), original, path);
      assert.notEqual(
        beforeBatch7Source(source + '\n', path),
        original,
        path + ': reject unreviewed bytes',
      );
    } else assert.equal(source, original, path);
  }
});
