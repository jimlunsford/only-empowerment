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
  for (const [path, digest] of Object.entries(delta.protectedFiles))
    assert.equal(hash(beforeWork43Source(historicalPeriodSource(path), path)), digest, path);
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
