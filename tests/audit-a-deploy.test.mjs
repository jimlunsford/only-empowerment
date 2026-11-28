import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

test('manifest synchronization purges stale candidate files and rejects unsafe input before writes', () => {
  const root = mkdtempSync(join(tmpdir(), 'oe-sync-'));
  const source = join(root, 'dist');
  const destination = join(root, 'site', 'releases', `${'a'.repeat(40)}-production`);
  const script = resolve('ops/sync-release.py');
  const files = {
    'index.html': 'home',
    '404.html': 'not found',
    '404.css': 'body {}',
    'favicon.svg': '<svg />',
    'robots.txt': 'User-agent: *\nAllow: /\n',
    'read/index.html': 'readings',
    'build.json': JSON.stringify({
      commit: 'a'.repeat(40),
      presentation: 'production',
      dirty: false,
      version: '1.0.0',
    }),
  };
  const write = (dir, name, data) => {
    const path = join(dir, name);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, data);
  };
  const manifest =
    Object.entries(files)
      .map(([name, data]) => `${createHash('sha256').update(data).digest('hex')}  ${name}`)
      .join('\n') + '\n';
  const run = () => spawnSync('python3', [script, source, destination], { encoding: 'utf8' });
  try {
    for (const [name, data] of Object.entries(files)) write(source, name, data);
    write(source, 'SHA256SUMS', manifest);
    write(source, 'rebuild-preview/index.html', 'unlisted source');
    write(destination, 'rebuild-preview/index.html', 'stale destination');
    write(destination, 'assets/old.js', 'old');
    execFileSync('python3', [script, source, destination]);
    for (const [name, data] of Object.entries(files))
      assert.equal(readFileSync(join(destination, name), 'utf8'), data);
    assert.equal(existsSync(join(destination, 'rebuild-preview')), false);
    assert.equal(existsSync(join(destination, 'assets')), false);
    write(destination, 'keep-until-verified.txt', 'keep');
    write(source, 'index.html', 'tampered');
    assert.match(run().stderr, /hash mismatch/);
    assert.equal(readFileSync(join(destination, 'index.html'), 'utf8'), 'home');
    assert.ok(existsSync(join(destination, 'keep-until-verified.txt')));
    write(source, 'index.html', 'home');
    for (const invalid of [
      manifest + manifest.split('\n')[0] + '\n',
      manifest.replace('  index.html', '  ../index.html'),
    ]) {
      write(source, 'SHA256SUMS', invalid);
      assert.match(run().stderr, /Unsafe or duplicate/);
      assert.ok(existsSync(join(destination, 'keep-until-verified.txt')));
    }
    write(source, 'SHA256SUMS', manifest);
    symlinkSync(source, join(destination, 'escape'));
    assert.match(run().stderr, /symlinks/);
    rmSync(join(destination, 'escape'));
    symlinkSync(destination, join(root, 'site', 'current'));
    assert.match(run().stderr, /current release/);
    assert.ok(existsSync(join(destination, 'keep-until-verified.txt')));
    rmSync(destination, { recursive: true });
    assert.match(run().stderr, /current release/);
    assert.equal(existsSync(destination), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
