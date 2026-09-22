import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyStandard,
  standardFields,
  standardLabels,
  standardErrors,
  validStandard,
  standardText,
  STANDARD_TEXT_LIMIT,
  STANDARD_ITEM_LIMIT,
} from '../src/standard-model.ts';
import { governedStandardLessons } from '../src/standard-lessons.ts';
import { saveStandard, parseStandard, STANDARD_PREFIX } from '../src/local-standards.ts';
import { readArtifacts, saveDecision } from '../src/local-decisions.ts';
import { saveCard, deleteCard, deleteAll } from '../src/local-cards.ts';
import { emptyDecision, decisionFields } from '../src/decision-room-model.ts';
class Store {
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
const card = {
  situation: 'Existing situation',
  action: 'Existing action',
  start: 'After lunch',
  obstacle: 'Delay',
  completion: 'Sent',
};
function standard() {
  return Object.fromEntries(
    standardFields.map((f) => [
      f,
      f === 'keeping' || f === 'violations'
        ? [`  ${f} <script>"'🧭</script>\nOwn words.  `]
        : `  ${f} <img src=x> "'🧭\nOwn words.  `,
    ]),
  );
}
function decision() {
  const d = emptyDecision();
  for (const f of decisionFields) d[f] = 'Own words';
  d.options.forEach((o, i) =>
    Object.assign(o, { label: 'Option ' + i, tradeoff: 'Cost', reversibility: 'Not yet known' }),
  );
  d.chosenId = d.options[0].id;
  return d;
}
test('standards begin empty; vague non-empty wording is never algorithmically judged', () => {
  assert.equal(validStandard(emptyStandard()), false);
  const s = standard();
  s.standard = 'try harder';
  assert.ok(validStandard(s));
  assert.deepEqual(standardErrors(s), {});
  assert.equal(s.standard, 'try harder');
});
test('every required field and list item is bounded without truncation or semantic rewriting', () => {
  for (const f of standardFields) {
    const s = standard();
    const list = Array.isArray(s[f]);
    const max = list ? STANDARD_ITEM_LIMIT : STANDARD_TEXT_LIMIT;
    for (const v of ['', ' \n ', 'x'.repeat(max + 1)]) {
      s[f] = list ? [v] : v;
      assert.equal(validStandard(s), false);
      assert.ok(Object.keys(standardErrors(s)).length);
      assert.deepEqual(s[f], list ? [v] : v);
    }
    s[f] = list ? ['x'.repeat(max)] : 'x'.repeat(max);
    assert.ok(validStandard(s));
  }
});
test('behavior collections require one to five strings, rejecting missing, extra and malformed shapes', () => {
  for (const f of ['keeping', 'violations'])
    for (const v of [[], Array(6).fill('behavior'), null, 'behavior', [null], [12]])
      assert.equal(validStandard({ ...standard(), [f]: v }), false);
  for (const v of [
    null,
    [],
    {},
    true,
    { ...standard(), score: 1 },
    { ...standard(), reason: undefined },
  ])
    assert.equal(validStandard(v), false);
});
test('Personal Standard text has exact ordered fields and Set status, preserving multiline authorship', () => {
  const s = standard(),
    text = standardText(s);
  assert.ok(text.startsWith('ONLY EMPOWERMENT\nPersonal Standard\n'));
  let pos = -1;
  for (const f of standardFields) {
    const i = text.indexOf(standardLabels[f] + '\n');
    assert.ok(i > pos);
    pos = i;
    for (const v of Array.isArray(s[f]) ? s[f] : [s[f]]) assert.ok(text.includes(v));
  }
  assert.ok(text.endsWith('Status\nSet'));
  assert.doesNotMatch(text, /Status\n(Proven|Maintained|Kept|Mastered|Completed)/);
});
test('all seven lessons carry current source governance and next questions', () => {
  assert.equal(governedStandardLessons.length, 7);
  for (const l of governedStandardLessons) {
    assert.equal(l.reviewed, '2026-09-22');
    assert.equal(l.tool, 'build-a-standard');
    assert.ok(l.question && l.reviewer && l.sources.length);
    assert.equal(l.canonical, 'https://jimlunsford.com/period-code/');
  }
});
test('save stores only the confirmed schema and preserves record identity on explicit updates', () => {
  const store = new Store(),
    s = standard();
  assert.equal(store.length, 0);
  const e = saveStandard(store, s);
  assert.ok(e.key.startsWith(STANDARD_PREFIX));
  assert.deepEqual(Object.keys(e.record), ['schemaVersion', 'id', 'tool', 'status', 'standard']);
  assert.equal(e.record.status, 'Set');
  assert.deepEqual(parseStandard(e.raw, e.key).standard, s);
  s.standard = 'Changed by the user';
  assert.notEqual(e.record.standard.standard, s.standard);
  const update = saveStandard(store, s, e);
  assert.equal(update.key, e.key);
  assert.equal(store.length, 1);
  assert.equal(update.record.standard.standard, s.standard);
});
test('unsupported and corrupt standards remain untouched and visibly rejected', () => {
  const store = new Store(),
    e = saveStandard(store, standard());
  for (const raw of [
    '{',
    'null',
    '[]',
    'x'.repeat(160001),
    JSON.stringify({ ...e.record, schemaVersion: 2 }),
    JSON.stringify({ ...e.record, status: 'Kept' }),
    JSON.stringify({ ...e.record, tool: 'next-move' }),
    JSON.stringify({ ...e.record, score: 10 }),
  ])
    assert.equal(parseStandard(raw, e.key), null);
  assert.equal(parseStandard(e.raw, e.key + 'wrong'), null);
  store.setItem('oe:personal-standard:v2:unknown', 'future');
  store.setItem('oe:broken', '{');
  assert.equal(readArtifacts(store).rejected.length, 2);
  assert.equal(store.length, 3);
});
test('maximum list and text JSON escaping round-trips under the serialized ceiling', () => {
  const s = standard();
  for (const f of standardFields)
    s[f] = Array.isArray(s[f]) ? Array(5).fill('\u0001'.repeat(1000)) : '\u0001'.repeat(2000);
  const e = saveStandard(new Store(), s);
  assert.ok(e.raw.length < 160000);
  assert.deepEqual(parseStandard(e.raw, e.key).standard, s);
});
test('all three artifact types stay compatible, retaining bytes and independent statuses', () => {
  const store = new Store(),
    c = saveCard(store, card),
    d = saveDecision(store, decision()),
    s = saveStandard(store, standard());
  assert.equal(readArtifacts(store).entries.length, 3);
  assert.equal(readArtifacts(store).rejected.length, 0);
  assert.equal(store.getItem(c.key), c.raw);
  assert.equal(store.getItem(d.key), d.raw);
  assert.deepEqual(
    new Set(readArtifacts(store).entries.map((e) => e.record.status)),
    new Set(['Planned', 'Decided', 'Set']),
  );
  deleteCard(store, s.key);
  assert.equal(store.length, 2);
  store.setItem('unrelated', 'keep');
  store.setItem('oe:unsupported', 'x');
  deleteAll(store);
  assert.deepEqual([...store.map], [['unrelated', 'keep']]);
});
test('one global fifty-record bound includes all types and unknown records but permits existing updates', () => {
  const store = new Store();
  for (let i = 0; i < 16; i++) {
    saveCard(store, card);
    saveDecision(store, decision());
    saveStandard(store, standard());
  }
  const e = saveStandard(store, standard());
  store.setItem('oe:unknown', '{}');
  assert.equal(store.length, 50);
  for (const fn of [
    () => saveStandard(store, standard()),
    () => saveDecision(store, decision()),
    () => saveCard(store, card),
  ])
    assert.throws(fn, /full/);
  saveStandard(store, { ...standard(), reason: 'Updated' }, e);
  assert.equal(store.length, 50);
});
test('stale standard edits cannot recreate deleted records or overwrite changed data', () => {
  const store = new Store(),
    s = standard(),
    e = saveStandard(store, s);
  deleteCard(store, e.key);
  assert.throws(() => saveStandard(store, s, e), /changed/);
  const e2 = saveStandard(store, s);
  saveStandard(store, { ...s, reason: 'Other tab' }, e2);
  assert.throws(() => saveStandard(store, s, e2), /changed/);
  assert.throws(() => saveStandard(store, s, { key: 'oe:wrong', raw: '{}' }), /changed/);
});
test('quota, storage denial, and failed readback do not become successful saves or deletions', () => {
  for (const method of ['setItem', 'getItem']) {
    const store = new Store();
    store[method] = () => {
      throw Error('denied');
    };
    assert.throws(() => saveStandard(store, standard()));
  }
  const store = new Store();
  store.setItem = () => {};
  assert.throws(() => saveStandard(store, standard()), /verification/);
  const broken = new Store(),
    e = saveStandard(broken, standard());
  broken.removeItem = () => {};
  assert.throws(() => deleteCard(broken, e.key), /verification/);
  assert.throws(() => deleteAll(broken), /verification/);
});
