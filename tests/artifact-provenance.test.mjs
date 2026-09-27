import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, cpSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
function verify(dir) {
  const files = (path, prefix = '') =>
    readdirSync(path, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? files(join(path, e.name), prefix + e.name + '/') : [prefix + e.name],
    );
  const manifest = readFileSync(join(dir, 'SHA256SUMS'), 'utf8');
  const entries = manifest
    .trim()
    .split('\n')
    .map((line) => line.split('  '));
  assert.deepEqual(
    entries.map(([, file]) => file).sort(),
    files(dir)
      .filter((f) => f !== 'SHA256SUMS')
      .sort(),
  );
  for (const [hash, file] of entries) assert.equal(digest(readFileSync(join(dir, file))), hash);
  for (const file of ['LICENSE.txt', 'COPYRIGHT.txt', 'THIRD_PARTY_NOTICES.txt', 'build.json'])
    assert.ok(entries.some(([, name]) => name === file));
  return { manifest, metadata: JSON.parse(readFileSync(join(dir, 'build.json'), 'utf8')) };
}
test('preserved production bytes and staging rebuild have complete independent manifests and the same source identity', () => {
  const root = mkdtempSync(join(tmpdir(), 'oe-artifacts-'));
  const dist = join(root, 'dist');
  const saved = join(root, 'production');
  const build = (mode) => {
    execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', dist], {
      env: { ...process.env, OE_PRESENTATION: mode, OE_RELEASE_BUILD: '0' },
      stdio: 'pipe',
    });
    execFileSync(process.execPath, [resolve('scripts/manifest.mjs')], { cwd: root, stdio: 'pipe' });
  };
  try {
    build('production');
    cpSync(dist, saved, { recursive: true });
    const production = verify(saved);
    build('staging');
    const staging = verify(dist);
    assert.deepEqual(verify(saved), production);
    assert.equal(production.metadata.presentation, 'production');
    assert.equal(staging.metadata.presentation, 'staging');
    for (const key of ['commit', 'version', 'tag', 'dirty', 'source'])
      assert.equal(production.metadata[key], staging.metadata[key]);
    assert.notEqual(production.manifest, staging.manifest);
    assert.match(readFileSync(join(saved, 'robots.txt'), 'utf8'), /\nAllow: \/\n/);
    assert.match(readFileSync(join(dist, 'robots.txt'), 'utf8'), /\nDisallow: \/\n/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
