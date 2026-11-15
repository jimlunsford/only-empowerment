import { beforeWork56Source } from './work56-preservation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import delta from './fixtures/work45-correction-delta.json' with { type: 'json' };
import { beforeWork45Source } from './work45-correction-helpers.mjs';

test('native-control correction reverses exactly to the preserved Work 43 source', () => {
  for (const [path, change] of Object.entries(delta)) {
    const source = beforeWork56Source(readFileSync(path, 'utf8'), path);
    const original = beforeWork45Source(source, path);
    assert.equal(createHash('sha256').update(original).digest('hex'), change.beforeSha256);
    assert.equal(beforeWork45Source(original, path), original);
    assert.throws(() => beforeWork45Source(source + '\n// unrelated change\n', path));
  }
});
test('native-control normalization cannot hide changes to teaching, handlers or styles', () => {
  for (const [path, before, after] of [
    ['src/PeriodStandard.tsx', 'setSession((old)', 'setSession((changed)'],
    ['src/Resilience.tsx', 'onChange=', 'onInput='],
    ['src/period.css', 'display: contents', 'display: none'],
  ]) {
    const source = beforeWork56Source(readFileSync(path, 'utf8'), path);
    assert.ok(source.includes(before));
    assert.throws(() => beforeWork45Source(source.replace(before, after), path));
  }
});
