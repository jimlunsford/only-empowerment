import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { historicalPeriodSource } from './work54-history-reader.mjs';
import { createHash } from 'node:crypto';
import delta from './fixtures/work42-navigation-delta.json' with { type: 'json' };
import { beforeWork42Source } from './work42-copy-helpers.mjs';
import { beforeWork43Source } from './work43-correction-helpers.mjs';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
test('Work 42 preserves approved teaching, drafts and verification inputs outside exact Work 43 corrections', () => {
  for (const [path, digest] of Object.entries(delta.protectedFiles)) {
    // Pin the complete workflow with the approved 50-minute timeout; other digests stay fixed.
    const expectedDigest =
      path === '.github/workflows/ci.yml'
        ? '733d388221da9a6e10b12aebebe34b4836b365a4e9870145ba310078c8982460'
        : digest;
    assert.equal(
      hash(beforeWork43Source(historicalPeriodSource(path), path)),
      expectedDigest,
      path,
    );
  }
});
test('only the recorded navigation refactor separates touched source from the approved Work 39 candidate', () => {
  for (const [path, change] of Object.entries(delta.files))
    assert.equal(
      hash(beforeWork42Source(historicalPeriodSource(path), path)),
      change.beforeSha256,
      path,
    );
});
test('navigation delta normalization cannot hide an unrelated source change', () => {
  const path = 'src/Purpose.tsx';
  const source = readFileSync(path, 'utf8');
  assert.throws(() => beforeWork42Source(source + '\n// unexpected change\n', path));
  assert.throws(() =>
    beforeWork42Source(
      source.replace('Give responsibility a direction.', 'Changed teaching'),
      path,
    ),
  );
});
