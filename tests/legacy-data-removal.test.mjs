import test from 'node:test';
import assert from 'node:assert/strict';
import { removeLegacyData } from '../src/legacy-data-removal.ts';

function storage(entries) {
  const data = new Map(entries);
  return {
    data,
    get length() {
      return data.size;
    },
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => data.delete(key),
    getItem() {
      throw new Error('Record values must never be read');
    },
    setItem() {
      throw new Error('Record values must never be written');
    },
    clear() {
      throw new Error('Unscoped deletion is forbidden');
    },
  };
}
test('confirmed deletion removes only the historical namespace without reading or writing values', () => {
  const store = storage([
    ['oe:execution-card:v1:fictional', 'unchanged'],
    ['oe:future:v9', '{not json'],
    ['oe:', ''],
    ['other-app', 'keep'],
    ['oe-other', 'keep'],
  ]);
  removeLegacyData(store);
  assert.deepEqual(
    [...store.data],
    [
      ['other-app', 'keep'],
      ['oe-other', 'keep'],
    ],
  );
  removeLegacyData(store);
  assert.equal(store.length, 2);
});
test('denied, partial, and ineffective removal fail without claiming success or clearing unrelated keys', () => {
  const denied = storage([['oe:one', 'one']]);
  denied.removeItem = () => {
    throw new Error('denied');
  };
  assert.throws(() => removeLegacyData(denied), /denied/);
  assert.equal(denied.length, 1);
  const ineffective = storage([['oe:one', 'one']]);
  ineffective.removeItem = () => {};
  assert.throws(() => removeLegacyData(ineffective), /removal-unverified/);
  const partial = storage([
    ['oe:one', 'one'],
    ['oe:two', 'two'],
    ['unrelated', 'keep'],
  ]);
  partial.removeItem = (key) => {
    if (key === 'oe:two') throw new Error('denied');
    partial.data.delete(key);
  };
  assert.throws(() => removeLegacyData(partial), /denied/);
  assert.deepEqual(
    [...partial.data],
    [
      ['oe:two', 'two'],
      ['unrelated', 'keep'],
    ],
  );
});
