import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  emptyDecision,
  decisionFields,
  decisionLimits,
  decisionText,
  validDecision,
  textError,
  lenses,
  prepareHandoff,
  reversibilities,
} from '../src/decision-room-model.ts';
import { governedLessons } from '../src/decision-room-lessons.ts';
import {
  saveDecision,
  parseDecision,
  readArtifacts,
  DECISION_PREFIX,
} from '../src/local-decisions.ts';
import { saveCard, deleteAll, deleteCard } from '../src/local-cards.ts';
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
function decision() {
  const d = emptyDecision();
  for (const f of decisionFields) d[f] = `  ${f}: <script>"'🧭</script>\nOwn words.  `;
  d.options.forEach((o, i) =>
    Object.assign(o, {
      label: `My alternative ${i}`,
      tradeoff: 'Cost and unknowns',
      reversibility: reversibilities[i],
    }),
  );
  d.chosenId = d.options[1].id;
  return d;
}
const card = {
  situation: 'Situation',
  action: 'Action',
  start: 'Start',
  obstacle: 'Obstacle',
  completion: 'Boundary',
};
test('two blank options start with no choice and no invented wait option', () => {
  const d = emptyDecision();
  assert.equal(d.options.length, 2);
  assert.equal(d.chosenId, '');
  assert.ok(d.options.every((o) => o.label === ''));
  assert.equal(validDecision(d), false);
});
test('Decision Record preserves every authored field and explicit Decided status', () => {
  const d = decision();
  assert.ok(validDecision(d));
  const text = decisionText(d);
  for (const f of decisionFields) assert.ok(text.includes(d[f]));
  for (const o of d.options) {
    assert.ok(text.includes(o.label));
    assert.ok(text.includes(o.tradeoff));
    assert.ok(text.includes(o.reversibility));
  }
  assert.ok(text.endsWith('Status\nDecided'));
  assert.ok(text.includes('Chosen option\n' + d.options[1].label));
});
test('all six lessons remain distinct and carry live source review metadata', () => {
  for (const lens of lenses) {
    const lesson = governedLessons.find((l) => l.key === lens);
    assert.ok(lesson.question);
    assert.ok(lesson.text);
    assert.equal(lesson.framework, 'The PERIOD Code');
    assert.equal(lesson.reviewed, '2026-09-21');
    assert.equal(lesson.canonical, 'https://jimlunsford.com/period-code/');
    assert.ok(lesson.reviewer);
  }
  assert.equal(
    new Set(governedLessons.filter((l) => lenses.includes(l.key)).map((l) => l.question)).size,
    6,
  );
});
test('bounds reject without silently shortening and permit explicit unknowns', () => {
  for (const f of decisionFields) {
    const d = decision();
    d[f] = 'x'.repeat(decisionLimits[f]);
    assert.ok(validDecision(d));
    d[f] += 'x';
    assert.equal(validDecision(d), false);
    assert.match(textError(d[f], decisionLimits[f], f), /not been shortened/);
    d[f] = "I don't know.";
    assert.ok(validDecision(d));
  }
});
test('options require two to four bounded meaningful alternatives and stable unique identities', () => {
  for (const count of [0, 1, 5]) {
    const d = decision();
    d.options = Array.from({ length: count }, () => ({ ...d.options[0], id: crypto.randomUUID() }));
    assert.equal(validDecision(d), false);
  }
  for (const change of [
    { label: '' },
    { label: 'x'.repeat(301) },
    { tradeoff: '' },
    { tradeoff: 'x'.repeat(2001) },
    { reversibility: 'high' },
    { id: 'invalid' },
    { extra: 1 },
  ]) {
    const d = decision();
    Object.assign(d.options[0], change);
    assert.equal(validDecision(d), false);
  }
  const d = decision();
  d.options[1].id = d.options[0].id;
  assert.equal(validDecision(d), false);
});
test('choice must reference a real option; schema rejects missing or extra fields', () => {
  const d = decision();
  for (const value of [
    null,
    [],
    {},
    true,
    'text',
    { ...d, chosenId: 'missing' },
    { ...d, score: 1 },
    { ...d, ownership: undefined },
  ])
    assert.equal(validDecision(value), false);
});
test('explicit Decision Record save uses minimal versioned data and edit preserves identity', () => {
  const s = new Store(),
    d = decision();
  assert.equal(s.length, 0);
  const entry = saveDecision(s, d);
  assert.ok(entry.key.startsWith(DECISION_PREFIX));
  assert.deepEqual(Object.keys(entry.record), [
    'schemaVersion',
    'id',
    'tool',
    'status',
    'decision',
  ]);
  assert.deepEqual(parseDecision(entry.raw, entry.key).decision, d);
  d.rationale = 'Changed by the user';
  const edited = saveDecision(s, d, entry);
  assert.equal(edited.key, entry.key);
  assert.equal(s.length, 1);
  assert.equal(edited.record.decision.rationale, d.rationale);
});
test('corrupt and future records are rejected without migration or removal', () => {
  const s = new Store(),
    e = saveDecision(s, decision());
  for (const raw of [
    '{',
    'null',
    '[]',
    'x'.repeat(200001),
    JSON.stringify({ ...e.record, schemaVersion: 2 }),
    JSON.stringify({ ...e.record, status: 'Completed' }),
    JSON.stringify({ ...e.record, score: 99 }),
  ])
    assert.equal(parseDecision(raw, e.key), null);
  assert.equal(parseDecision(e.raw, e.key + 'wrong'), null);
  s.setItem('oe:future:v5', '{}');
  assert.deepEqual(readArtifacts(s).rejected, ['oe:future:v5']);
  assert.equal(s.length, 2);
});
test('mixed collections preserve original Execution Card bytes and both record types', () => {
  const s = new Store(),
    old = saveCard(s, card);
  const d = saveDecision(s, decision());
  const all = readArtifacts(s);
  assert.equal(all.entries.length, 2);
  assert.equal(all.rejected.length, 0);
  assert.equal(s.getItem(old.key), old.raw);
  deleteCard(s, d.key);
  assert.equal(s.getItem(old.key), old.raw);
  s.setItem('unrelated', 'keep');
  s.setItem('oe:future:v4', 'unknown');
  deleteAll(s);
  assert.deepEqual([...s.map], [['unrelated', 'keep']]);
});
test('global fifty-record bound applies across types and includes unsupported records', () => {
  const s = new Store();
  for (let i = 0; i < 24; i++) saveCard(s, card);
  for (let i = 0; i < 25; i++) saveDecision(s, decision());
  s.setItem('oe:future', '{}');
  assert.throws(() => saveDecision(s, decision()), /full/);
  assert.throws(() => saveCard(s, card), /full/);
  assert.equal(s.length, 50);
});
test('stale edits cannot resurrect deleted Decision Records or overwrite other tabs', () => {
  const s = new Store(),
    d = decision(),
    e = saveDecision(s, d);
  deleteCard(s, e.key);
  assert.throws(() => saveDecision(s, d, e), /changed/);
  const again = saveDecision(s, d);
  saveDecision(s, { ...d, rationale: 'Other tab' }, again);
  assert.throws(() => saveDecision(s, d, again), /changed/);
});
test('storage denial, quota, and dishonest readback cannot report successful saving', () => {
  for (const method of ['setItem', 'getItem']) {
    const s = new Store();
    s[method] = () => {
      throw Error('denied');
    };
    assert.throws(() => saveDecision(s, decision()));
  }
  const s = new Store();
  s.setItem = () => {};
  assert.throws(() => saveDecision(s, decision()), /verification/);
});
test('maximum JSON escaping fits the serialization ceiling and no data is truncated', () => {
  const d = decision();
  for (const f of decisionFields) d[f] = '\u0001'.repeat(decisionLimits[f]);
  d.options.forEach((o) => {
    o.label = '\u0001'.repeat(300);
    o.tradeoff = '\u0001'.repeat(2000);
  });
  d.options.push(
    { ...d.options[0], id: crypto.randomUUID() },
    { ...d.options[0], id: crypto.randomUUID() },
  );
  assert.ok(validDecision(d));
  const e = saveDecision(new Store(), d);
  assert.ok(e.raw.length <= 200000);
  assert.deepEqual(parseDecision(e.raw, e.key).decision, d);
});
test('handoff uses only two selected authored fields and leaves the decision unchanged', () => {
  const d = decision(),
    before = JSON.stringify(d),
    h = prepareHandoff(d);
  assert.deepEqual(h, {
    situation: d.decision,
    action: d.firstMove,
    includeSituation: true,
    includeAction: true,
  });
  h.action = 'Edited';
  assert.equal(JSON.stringify(d), before);
});
test('runtime has no answer network, HTML injection, AI, or option scoring primitives', () => {
  const files = ['DecisionRoom.tsx', 'decision-room-model.ts', 'local-decisions.ts'];
  const source = files
    .map((f) => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8'))
    .join('\n');
  assert.doesNotMatch(
    source,
    /dangerouslySetInnerHTML|innerHTML\s*=|sendBeacon|WebSocket|XMLHttpRequest|fetch\s*\(|eval\s*\(|\.sort\s*\(|\bscore\s*[:=]|\bweight\s*[:=]|\bwinner\s*[:=]/,
  );
});
