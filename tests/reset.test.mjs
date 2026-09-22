import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyReset,
  resetFields,
  resetLabels,
  resetErrors,
  validReset,
  resetText,
  newResetSession,
  standardConfirmed,
} from '../src/reset-model.ts';
import { governedResetLessons } from '../src/reset-lessons.ts';
import { saveReset, parseReset, RESET_PREFIX } from '../src/local-resets.ts';
import { saveStandard } from '../src/local-standards.ts';
import { standardFields } from '../src/standard-model.ts';
import { readArtifacts, saveDecision } from '../src/local-decisions.ts';
import { saveCard, deleteAll, deleteCard } from '../src/local-cards.ts';
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
const plan = () =>
  Object.fromEntries(
    resetFields.map((f) => [f, `  RESET-${f} <script>"'🧭e\u0301</script>\nOwn words.  `]),
  );
const standard = () =>
  Object.fromEntries(
    standardFields.map((f) => [
      f,
      f === 'keeping' || f === 'violations' ? ['behavior'] : 'Original ' + f,
    ]),
  );
const card = {
  situation: 'Existing situation',
  action: 'Existing action',
  start: 'After lunch',
  obstacle: 'Delay',
  completion: 'Sent',
};
function decision() {
  const d = emptyDecision();
  for (const f of decisionFields) d[f] = 'Own words';
  d.options.forEach((o, i) =>
    Object.assign(o, { label: 'Option ' + i, tradeoff: 'Cost', reversibility: 'Not yet known' }),
  );
  d.chosenId = d.options[0].id;
  return d;
}
test('Reset begins empty and never infers a standard source or standing', () => {
  const s = newResetSession();
  assert.deepEqual(s.plan, emptyReset());
  assert.equal(s.source, '');
  assert.equal(s.standing, '');
  assert.equal(standardConfirmed(s), false);
});
for (const f of resetFields)
  test(`Reset ${f} requires bounded authored text without transformation`, () => {
    for (const v of ['', ' \n ', 'x'.repeat(2001), null, 2]) {
      const p = { ...plan(), [f]: v };
      assert.equal(validReset(p), false);
      assert.ok(resetErrors(p)[f]);
      assert.equal(p[f], v);
    }
    const p = { ...plan(), [f]: 'x'.repeat(2000) };
    assert.ok(validReset(p));
    assert.ok(resetText(p).includes(p[f]));
  });
test('exact Reset shape rejects extra missing and non-object fields', () => {
  for (const v of [null, [], {}, false, { ...plan(), score: 1 }, { ...plan(), proof: undefined }])
    assert.equal(validReset(v), false);
  assert.equal(validReset(plan()), true);
});
test('the exact standard statement must be explicitly confirmed; changes invalidate it', () => {
  const s = { ...newResetSession(), plan: plan(), source: 'manual', standing: 'stands' };
  assert.equal(standardConfirmed(s), false);
  s.checkedStandard = s.plan.standard;
  assert.ok(standardConfirmed(s));
  for (const choice of ['', 'review', 'unsure'])
    assert.equal(standardConfirmed({ ...s, standing: choice }), false);
  assert.equal(standardConfirmed({ ...s, source: 'unclear' }), false);
  assert.equal(
    standardConfirmed({ ...s, plan: { ...s.plan, standard: s.plan.standard + ' ' } }),
    false,
  );
});
test('Reset copy uses seven exact future-facing sections and Planned status', () => {
  const p = plan(),
    t = resetText(p);
  assert.ok(t.startsWith('ONLY EMPOWERMENT\nReset Plan\n'));
  let n = -1;
  for (const f of resetFields) {
    const i = t.indexOf(resetLabels[f] + '\n');
    assert.ok(i > n);
    n = i;
    assert.ok(t.includes(p[f]));
  }
  assert.ok(t.endsWith('Status\nPlanned'));
  assert.doesNotMatch(t, /Proof created|Reset complete|Status\nCorrected/);
});
test('all seven lessons preserve current source governance', () => {
  assert.equal(governedResetLessons.length, 7);
  for (const l of governedResetLessons) {
    assert.equal(l.tool, 'reset');
    assert.equal(l.reviewed, '2026-09-22');
    assert.ok(l.question && l.reviewer && l.sources.length);
    assert.equal(l.canonical, 'https://jimlunsford.com/discipline-loop/');
  }
});
test('explicit save stores only minimal Reset schema; updates preserve local identity', () => {
  const s = new Store(),
    p = plan();
  assert.equal(s.length, 0);
  const e = saveReset(s, p);
  assert.deepEqual(Object.keys(e.record), ['schemaVersion', 'id', 'tool', 'status', 'plan']);
  assert.deepEqual(parseReset(e.raw, e.key).plan, p);
  p.proof = 'Next opportunity';
  const edited = saveReset(s, p, e);
  assert.equal(edited.key, e.key);
  assert.equal(s.length, 1);
  assert.deepEqual(edited.record.plan, p);
});
test('four artifact types stay exactly compatible with original bytes and independent statuses', () => {
  const s = new Store();
  const old = [saveCard(s, card), saveDecision(s, decision()), saveStandard(s, standard())];
  const bytes = [...s.map];
  const r = saveReset(s, plan());
  const result = readArtifacts(s);
  assert.equal(result.entries.length, 4);
  assert.deepEqual(result.rejected, []);
  assert.deepEqual([...s.map].slice(0, 3), bytes);
  for (const e of old) assert.equal(s.getItem(e.key), e.raw);
  assert.deepEqual(result.entries.find((e) => e.key === r.key).record.plan, plan());
  deleteCard(s, r.key);
  assert.deepEqual([...s.map], bytes);
});
test('Personal Standard snapshot stays independent after source update or deletion', () => {
  const s = new Store(),
    source = saveStandard(s, standard());
  const p = { ...plan(), standard: source.record.standard.standard },
    reset = saveReset(s, p);
  assert.equal(s.getItem(source.key), source.raw);
  saveStandard(s, { ...source.record.standard, standard: 'Changed deliberately' }, source);
  assert.equal(parseReset(s.getItem(reset.key), reset.key).plan.standard, p.standard);
  deleteCard(s, source.key);
  assert.equal(s.getItem(reset.key), reset.raw);
});
test('corrupt unsupported mismatched and excess Reset records are rejected without mutation', () => {
  const s = new Store(),
    e = saveReset(s, plan());
  for (const patch of [
    { schemaVersion: 2 },
    { status: 'Corrected' },
    { tool: 'next-move' },
    { id: 'bad' },
    { sourceKey: 'private' },
    { plan: { ...plan(), diagnosis: 'bad' } },
  ]) {
    const raw = JSON.stringify({ ...e.record, ...patch });
    assert.equal(parseReset(raw, e.key), null);
  }
  for (const raw of ['{', 'null', '[]', 'x'.repeat(90001)])
    assert.equal(parseReset(raw, e.key), null);
  assert.equal(parseReset(e.raw, RESET_PREFIX + 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'), null);
  s.setItem('oe:reset-plan:v9:future', '{}');
  s.setItem('oe:broken', '{');
  const before = [...s.map];
  assert.equal(readArtifacts(s).rejected.length, 2);
  assert.deepEqual([...s.map], before);
});
test('worst-case JSON escaping roundtrips all bounded fields', () => {
  const p = Object.fromEntries(resetFields.map((f) => [f, 'a' + '\u0001'.repeat(1999)]));
  const e = saveReset(new Store(), p);
  assert.ok(e.raw.length < 90000);
  assert.deepEqual(parseReset(e.raw, e.key).plan, p);
});
test('global fifty-record limit spans all four types and permits updates at capacity', () => {
  const s = new Store();
  saveCard(s, card);
  saveDecision(s, decision());
  saveStandard(s, standard());
  const e = saveReset(s, plan());
  for (let i = 0; i < 46; i++) s.setItem('oe:future:' + i, '{}');
  assert.equal(s.length, 50);
  assert.throws(() => saveReset(s, plan()), /full/);
  assert.equal(saveReset(s, { ...plan(), proof: 'Updated' }, e).key, e.key);
  assert.equal(s.length, 50);
});
test('stale Reset edits refuse resurrection and overwrite', () => {
  const s = new Store(),
    e = saveReset(s, plan());
  deleteCard(s, e.key);
  assert.throws(() => saveReset(s, plan(), e), /changed/);
  assert.equal(s.length, 0);
  s.setItem(e.key, e.raw + ' ');
  assert.throws(() => saveReset(s, plan(), e), /changed/);
});
test('quota denial false readback and failed deletion remain failures', () => {
  const s = new Store();
  s.setItem = () => {
    throw Error('quota');
  };
  assert.throws(() => saveReset(s, plan()), /quota/);
  s.setItem = () => {};
  assert.throws(() => saveReset(s, plan()), /verification/);
  s.getItem = () => {
    throw Error('denied');
  };
  assert.throws(() => saveReset(s, plan()), /denied/);
  const a = new Store(),
    e = saveReset(a, plan());
  a.removeItem = () => {};
  assert.throws(() => deleteCard(a, e.key), /verification/);
  assert.throws(() => deleteAll(a), /verification/);
});
test('scoped all-data deletion removes four types and unsupported versions while preserving unrelated data', () => {
  const s = new Store();
  saveCard(s, card);
  saveDecision(s, decision());
  saveStandard(s, standard());
  saveReset(s, plan());
  s.setItem('oe:future', '{}');
  s.setItem('unrelated', 'keep');
  deleteAll(s);
  assert.deepEqual([...s.map], [['unrelated', 'keep']]);
});
