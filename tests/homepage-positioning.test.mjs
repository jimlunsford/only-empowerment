import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import changes from './fixtures/homepage-positioning-band-changes.json' with { type: 'json' };
import { beforeHomepagePositioningSource } from './homepage-positioning-preservation.mjs';
const base = 'a9d7e9d5549fac250ccba7d0653b5d92904f1065';

test('homepage positioning accepts only pinned band edits and preserves all other source bytes', () => {
  assert.deepEqual(Object.keys(changes).sort(), [
    'scripts/framework-links.ts',
    'src/Rebuild.tsx',
    'src/framework-home-content.ts',
    'src/period-homepage.css',
    'vite.config.ts',
  ]);
  const paths = execFileSync(
    'git',
    [
      'ls-tree',
      '-r',
      '--name-only',
      base,
      'src',
      'scripts',
      'public',
      'ops',
      '.github',
      'index.html',
      'vite.config.ts',
      'package.json',
      'package-lock.json',
    ],
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n');
  for (const path of paths) {
    const source = readFileSync(path, 'utf8');
    const original = execFileSync('git', ['show', base + ':' + path], {
      encoding: 'utf8',
      maxBuffer: 5 * 1024 * 1024,
    });
    assert.equal(beforeHomepagePositioningSource(source, path), original, path);
    if (!changes[path]) continue;
    assert.doesNotMatch(source, /\u2014/, path);
    for (const mutated of [source + '\n', source.slice(1)])
      assert.equal(
        beforeHomepagePositioningSource(mutated, path),
        mutated,
        path + ': reject unknown bytes',
      );
  }
});
