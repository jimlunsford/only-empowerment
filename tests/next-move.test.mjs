import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cardText,
  fields,
  limits,
  validCard,
  validateField,
  handoffPreview,
} from '../src/next-move-model.ts';
import {
  parseRecord,
  readCards,
  saveCard,
  deleteCard,
  deleteAll,
  CARD_PREFIX,
} from '../src/local-cards.ts';
const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const card = {
  situation: '  A stalled request.\nKeep my words.  ',
  action: '<script>alert("x")</script> Send the request. 🧭',
  start: 'After lunch',
  obstacle: 'Waiting for motivation',
  completion: 'The request is sent; a reply is not required.',
};
class MemoryStorage {
  map = new Map();
  get length() {
    return this.map.size;
  }
  key(i) {
    return [...this.map.keys()][i] ?? null;
  }
  getItem(k) {
    return this.map.get(k) ?? null;
  }
  setItem(k, v) {
    this.map.set(k, v);
  }
  removeItem(k) {
    this.map.delete(k);
  }
}
test('card validation bounds every field without altering user authorship', () => {
  assert.equal(validCard(card), true);
  for (const f of fields) {
    assert.ok(validateField(f, ' \n\t '));
    assert.equal(validateField(f, 'x'.repeat(limits[f])), '');
    assert.match(validateField(f, 'x'.repeat(limits[f] + 1)), /not been shortened/);
    assert.equal(validCard({ ...card, [f]: 12 }), false);
  }
  assert.equal(validCard({ ...card, extra: 'no' }), false);
  for (const value of [null, [], true, {}, 'text']) assert.equal(validCard(value), false);
  const copy = cardText(card);
  for (const f of fields) assert.ok(copy.includes(card[f]));
  assert.ok(copy.endsWith('Status\nPlanned'));
  assert.doesNotMatch(copy, /Status\nCompleted|Copy card|Save on/);
});
test('explicit save stores a minimal validated artifact and edits the same record', () => {
  const s = new MemoryStorage();
  assert.equal(s.length, 0);
  const saved = saveCard(s, card, undefined, id);
  assert.equal(s.length, 1);
  assert.deepEqual(parseRecord(saved.raw, saved.key).card, card);
  assert.deepEqual(Object.keys(JSON.parse(saved.raw)), [
    'schemaVersion',
    'id',
    'tool',
    'status',
    'card',
  ]);
  const changed = saveCard(s, { ...card, action: 'Updated wording' }, saved);
  assert.equal(s.length, 1);
  assert.equal(changed.key, saved.key);
  assert.equal(readCards(s).entries[0].record.card.action, 'Updated wording');
});
test('corruption, future versions, missing fields, extra fields, malformed IDs and excessive payloads are rejected', () => {
  const s = new MemoryStorage(),
    good = saveCard(s, card, undefined, id);
  const r = JSON.parse(good.raw);
  for (const raw of [
    '{',
    '{}',
    'null',
    '[]',
    JSON.stringify({ ...r, schemaVersion: 2 }),
    JSON.stringify({ ...r, status: 'Completed' }),
    JSON.stringify({ ...r, id: '../escape' }),
    JSON.stringify({ ...r, card: { action: 'only' } }),
    JSON.stringify({ ...r, card: { ...card, action: 'x'.repeat(2001) } }),
    'x'.repeat(60001),
  ])
    assert.equal(parseRecord(raw, good.key), null);
  assert.equal(parseRecord(good.raw, CARD_PREFIX + 'wrong'), null);
  s.setItem('oe:future:v5', '{}');
  s.setItem('other-app', 'preserve');
  assert.equal(readCards(s).entries.length, 1);
  assert.deepEqual(readCards(s).rejected, ['oe:future:v5']);
});
test('quota and denial never become successful saves, and readback is verified', () => {
  for (const method of ['setItem', 'getItem']) {
    const s = new MemoryStorage();
    s[method] = () => {
      throw new Error('denied');
    };
    assert.throws(() => saveCard(s, card, undefined, id));
  }
  const s = new MemoryStorage();
  s.setItem = () => {};
  assert.throws(() => saveCard(s, card, undefined, id), /verification/);
});
test('stale edits cannot silently restore a deleted card or overwrite another tab', () => {
  const s = new MemoryStorage(),
    old = saveCard(s, card, undefined, id);
  deleteCard(s, old.key);
  assert.throws(() => saveCard(s, card, old), /changed/);
  assert.equal(s.length, 0);
  const again = saveCard(s, card, undefined, id);
  saveCard(s, { ...card, action: 'Other tab' }, again);
  assert.throws(() => saveCard(s, card, again), /changed/);
});
test('per-record and all-version deletion leave unrelated keys intact and verify removal', () => {
  const s = new MemoryStorage(),
    one = saveCard(s, card, undefined, id);
  saveCard(s, card);
  s.setItem('oe:future:v99', 'unknown');
  s.setItem('other-app', 'keep');
  deleteCard(s, one.key);
  assert.equal(readCards(s).entries.length, 1);
  deleteAll(s);
  assert.equal(s.length, 1);
  assert.equal(s.getItem('other-app'), 'keep');
  assert.throws(() => deleteCard(s, 'other-app'), /scope/);
  s.setItem('oe:stuck', 'x');
  s.removeItem = () => {};
  assert.throws(() => deleteAll(s), /verification/);
  assert.throws(() => deleteCard(s, 'oe:stuck'), /verification/);
});
test('fifty-record bound fails honestly without replacing existing work', () => {
  const s = new MemoryStorage();
  for (let i = 0; i < 50; i++) saveCard(s, card);
  assert.throws(() => saveCard(s, card), /full/);
  assert.equal(s.length, 50);
});
test('future handoff contains only selected editable values and never claims action completion', () => {
  assert.deepEqual(handoffPreview(card, ['action']), {
    source: 'next-move',
    target: 'do-it-now',
    status: 'Planned',
    fields: { action: card.action },
  });
  assert.deepEqual(handoffPreview(card, []).fields, {});
});
