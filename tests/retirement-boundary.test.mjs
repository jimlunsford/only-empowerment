import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { assertPublicModules, retiredModules } from '../scripts/public-boundary.ts';

test('public bundle guard rejects every retired module on Unix and Windows paths', () => {
  for (const name of retiredModules) {
    assert.throws(() => assertPublicModules([`/repo/src/${name}.tsx`]), /Retired implementation/);
    assert.throws(
      () => assertPublicModules([`C:\\repo\\src\\${name}.ts`]),
      /Retired implementation/,
    );
    assert.equal(existsSync(`src/${name}.tsx`) || existsSync(`src/${name}.ts`), false, name);
  }
  assert.doesNotThrow(() =>
    assertPublicModules([
      '/repo/src/PeriodStandard.tsx',
      '/repo/src/period-standard-model.ts',
      '/repo/src/legacy-data-removal.ts',
    ]),
  );
});
test('complete preserved source manifest resolves to exact baseline bytes and all ancestors remain available', () => {
  const manifest = JSON.parse(readFileSync('docs/preservation/work28-baseline.json', 'utf8'));
  assert.equal(
    execFileSync('git', ['rev-parse', `${manifest.commit}^{tree}`], { encoding: 'utf8' }).trim(),
    manifest.tree,
  );
  const paths = execFileSync('git', ['ls-tree', '-r', '--name-only', manifest.commit], {
    encoding: 'utf8',
  })
    .trim()
    .split('\n');
  assert.deepEqual(
    manifest.files.map((f) => f.path),
    paths,
  );
  for (const file of manifest.files) {
    const bytes = execFileSync('git', ['show', `${manifest.commit}:${file.path}`]);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path);
  }
  execFileSync('git', ['merge-base', '--is-ancestor', manifest.commit, 'HEAD']);
});
