import { beforeBatch7Source } from './batch7-preservation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { beforeBatch6Source } from './batch6-preservation.mjs';
import changes from './fixtures/batch6-changes.json' with { type: 'json' };
const base = '8746c009d88b0cd357555d20f913b37f34a9799d';
const sha = (source) => createHash('sha256').update(source).digest('hex');

test('Batch 6 pins layout-only changes, preserving teaching, controls and print rules', () => {
  assert.deepEqual(Object.keys(changes).sort(), [
    'src/Execution.tsx',
    'src/Rebuild.tsx',
    'src/execution.css',
    'src/loop.css',
    'src/period-homepage.css',
    'src/style.css',
  ]);
  for (const [path, change] of Object.entries(changes)) {
    const source = beforeBatch7Source(readFileSync(path, 'utf8'), path);
    const original = execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' });
    assert.equal(sha(source), change.afterSha256, path);
    assert.equal(beforeBatch6Source(source, path), original, path);
    for (const altered of [source + '\n', source.replace('framework', 'unexpected')])
      if (altered !== source)
        assert.notEqual(beforeBatch6Source(altered, path), original, path + ': unknown edits');
    if (path.endsWith('.css')) {
      assert.ok(source.startsWith(original), path + ': established print/focus rules retained');
      if (path !== 'src/style.css') assert.match(source.slice(original.length), /@media screen/);
    } else {
      // Only neutral layout wrappers move. Every other tag, attribute, expression,
      // teaching string, event handler and state transition must remain identical.
      const withoutLayout = (s) => s.replace(/<\/?(?:div|header)\b[^>]*>/g, '').replace(/\s+/g, '');
      assert.equal(withoutLayout(source), withoutLayout(original), path);
    }
  }
});

test('Batch 6 leaves reading generators, content, focus modality and framework logic unchanged', () => {
  const paths = execFileSync('git', ['ls-tree', '-r', '--name-only', base, 'src', 'scripts'], {
    encoding: 'utf8',
  })
    .trim()
    .split('\n');
  for (const path of paths.filter((path) => !changes[path]))
    assert.equal(
      beforeBatch7Source(readFileSync(path, 'utf8'), path) ===
        execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' }),
      true,
      path,
    );
});
