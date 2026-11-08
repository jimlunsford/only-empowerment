import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { beforeWork43Source } from './work43-correction-helpers.mjs';

test('correction normalization rejects unrelated dependency, script and style changes', () => {
  const source = readFileSync('package.json', 'utf8');
  assert.throws(() => beforeWork43Source(source.replace('10.29.8', '10.29.9'), 'package.json'));
  assert.throws(() =>
    beforeWork43Source(
      source.replace('playwright test', 'playwright test --retries=3'),
      'package.json',
    ),
  );
  assert.throws(() =>
    beforeWork43Source(readFileSync('package-lock.json', 'utf8') + '\n', 'package-lock.json'),
  );
  assert.throws(() =>
    beforeWork43Source(
      readFileSync('src/period.css', 'utf8') + '\nbody { display: none; }\n',
      'src/period.css',
    ),
  );
  assert.throws(() =>
    beforeWork43Source(
      readFileSync('src/use-route.ts', 'utf8').replace('event.ctrlKey', 'false'),
      'src/use-route.ts',
    ),
  );
});
