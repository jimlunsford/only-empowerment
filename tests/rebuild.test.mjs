import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newRebuildSession,
  emptyRebuild,
  rebuildFields,
  rebuildLabels,
  rebuildErrors,
  validRebuild,
  rebuildText,
  prepareRebuildHandoff,
} from '../src/rebuild-model.ts';
import { governedRebuildLessons } from '../src/rebuild-lessons.ts';
import { saveRebuild, parseRebuild, REBUILD_PREFIX } from '../src/local-rebuilds.ts';
import { saveStandard } from '../src/local-standards.ts';
import { standardFields } from '../src/standard-model.ts';
import { readArtifacts, saveDecision } from '../src/local-decisions.ts';
import { saveCard, deleteAll, deleteCard } from '../src/local-cards.ts';
import { saveReset } from '../src/local-resets.ts';
import { resetFields } from '../src/reset-model.ts';
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
const words = (f) => `  Rebuild-${f} <script>"'🧭e\u0301</script>\nOwn words.  `;
const map = () =>
  Object.fromEntries(
    rebuildFields.map((f) => [f, f === 'actions' ? [words(f), 'Second action'] : words(f)]),
  );
const standard = () =>
  Object.fromEntries(
    standardFields.map((f) => [
      f,
      ['keeping', 'violations'].includes(f) ? ['Behavior'] : 'Original ' + f,
    ]),
  );
function seed(s) {
  const d = emptyDecision();
  for (const f of decisionFields) d[f] = 'Own ' + f;
  d.options.forEach((o, i) =>
    Object.assign(o, { label: 'Option ' + i, tradeoff: 'Cost', reversibility: 'Not yet known' }),
  );
  d.chosenId = d.options[0].id;
  return [
    saveCard(s, {
      situation: 'Existing',
      action: 'Act',
      start: 'Noon',
      obstacle: 'Delay',
      completion: 'Sent',
    }),
    saveDecision(s, d),
    saveStandard(s, standard()),
    saveReset(s, Object.fromEntries(resetFields.map((f) => [f, 'Reset ' + f]))),
  ];
}
test('Rebuild begins empty with no inferred source or saved state', () => {
  const s = newRebuildSession();
  assert.deepEqual(s.map, emptyRebuild());
  assert.equal(s.source, '');
  assert.equal(s.reference, null);
  assert.equal(s.savedKey, null);
});
for (const f of rebuildFields.filter((f) => f !== 'actions'))
  test(`Rebuild ${f} retains authored text and checks only bounds`, () => {
    for (const v of ['', ' \n ', 'x'.repeat(2001), null, 2]) {
      const m = { ...map(), [f]: v };
      assert.equal(validRebuild(m), false);
      assert.ok(rebuildErrors(m)[f]);
      assert.equal(m[f], v);
    }
    const m = { ...map(), [f]: 'x'.repeat(2000) };
    assert.ok(validRebuild(m));
    assert.ok(rebuildText(m).includes(m[f]));
  });
test('repeated actions require one to five bounded entries in authored order', () => {
  for (const actions of [
    [],
    Array(6).fill('act'),
    [''],
    ['x'.repeat(1001)],
    ['ok', null],
    null,
    'text',
  ])
    assert.equal(validRebuild({ ...map(), actions }), false);
  const actions = Array(5).fill('x'.repeat(1000));
  const m = { ...map(), actions };
  assert.ok(validRebuild(m));
  assert.deepEqual(m.actions, actions);
});
test('strict map and persisted shapes reject corrupt unsupported and mismatched data without mutation', () => {
  for (const v of [null, [], {}, false, { ...map(), score: 1 }, { ...map(), trust: undefined }])
    assert.equal(validRebuild(v), false);
  const s = new Store(),
    e = saveRebuild(s, map());
  for (const patch of [
    { schemaVersion: 2 },
    { status: 'Completed' },
    { tool: 'reset' },
    { id: 'bad' },
    { sourceKey: 'private' },
    { map: { ...map(), identity: 'certified' } },
  ])
    assert.equal(parseRebuild(JSON.stringify({ ...e.record, ...patch }), e.key), null);
  for (const raw of ['{', 'null', '[]', 'x'.repeat(130001)])
    assert.equal(parseRebuild(raw, e.key), null);
  assert.equal(parseRebuild(e.raw, REBUILD_PREFIX + 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'), null);
  s.setItem('oe:rebuild-map:v9:future', '{}');
  s.setItem('oe:broken', '{');
  const before = [...s.map];
  assert.equal(readArtifacts(s).rejected.length, 2);
  assert.deepEqual([...s.map], before);
});
test('exact portable output has nine authored sections and Mapped artifact status', () => {
  const m = map(),
    text = rebuildText(m);
  let last = -1;
  assert.ok(text.startsWith('ONLY EMPOWERMENT\nRebuild Map\n'));
  for (const f of rebuildFields) {
    const n = text.indexOf(rebuildLabels[f] + '\n');
    assert.ok(n > last);
    last = n;
    if (f !== 'actions') assert.ok(text.includes(m[f]));
  }
  assert.ok(text.includes(m.actions.map((v) => '- ' + v).join('\n')));
  assert.ok(text.endsWith('Status\nMapped'));
});
test('governed lessons cover seven stages and reviewed canonical doctrine', () => {
  assert.equal(governedRebuildLessons.length, 7);
  for (const l of governedRebuildLessons) {
    assert.equal(l.tool, 'rebuild-map');
    assert.equal(l.reviewed, '2026-09-24');
    assert.ok(l.question && l.reviewer && l.sources.length);
    assert.equal(l.canonical, 'https://jimlunsford.com/how-to-rebuild-yourself/');
  }
});
test('five artifact types retain original bytes and separate statuses', () => {
  const s = new Store(),
    old = seed(s),
    before = [...s.map],
    m = map(),
    e = saveRebuild(s, m);
  assert.deepEqual(Object.keys(e.record), ['schemaVersion', 'id', 'tool', 'status', 'map']);
  assert.deepEqual(parseRebuild(e.raw, e.key).map, m);
  assert.equal(readArtifacts(s).entries.length, 5);
  for (const a of old) assert.equal(s.getItem(a.key), a.raw);
  m.firstMove = 'Revised';
  assert.equal(saveRebuild(s, m, e).key, e.key);
  assert.equal(s.length, 5);
  deleteCard(s, e.key);
  assert.deepEqual([...s.map], before);
});
test('saved map snapshots only the statement and survives source edits and deletion', () => {
  const s = new Store(),
    source = saveStandard(s, standard()),
    m = { ...map(), standard: source.record.standard.standard },
    e = saveRebuild(s, m);
  assert.equal(s.getItem(source.key), source.raw);
  saveStandard(s, { ...source.record.standard, standard: 'New line' }, source);
  deleteCard(s, source.key);
  assert.deepEqual(parseRebuild(s.getItem(e.key), e.key).map, m);
  assert.ok(!e.raw.includes(source.key));
});
test('worst-case JSON escaping fits the full map serialization ceiling', () => {
  const m = Object.fromEntries(
    rebuildFields.map((f) => [
      f,
      f === 'actions' ? Array(5).fill('a' + '\u0001'.repeat(999)) : 'a' + '\u0001'.repeat(1999),
    ]),
  );
  const e = saveRebuild(new Store(), m);
  assert.ok(e.raw.length < 130000);
  assert.deepEqual(parseRebuild(e.raw, e.key).map, m);
});
test('global record bound counts all five types and unknown records; updates remain possible', () => {
  const s = new Store();
  seed(s);
  const e = saveRebuild(s, map());
  for (let i = 0; i < 45; i++) s.setItem('oe:future:' + i, '{}');
  assert.throws(() => saveRebuild(s, map()), /full/);
  assert.equal(saveRebuild(s, { ...map(), proof: 'Changed' }, e).key, e.key);
  assert.equal(s.length, 50);
});
test('stale map cannot resurrect deleted records or overwrite changed bytes', () => {
  const s = new Store(),
    e = saveRebuild(s, map());
  deleteCard(s, e.key);
  assert.throws(() => saveRebuild(s, map(), e), /changed/);
  assert.equal(s.length, 0);
  s.setItem(e.key, e.raw + ' ');
  assert.throws(() => saveRebuild(s, map(), e), /changed/);
});
test('failed save readback, denial, quota and deletion never claim success', () => {
  const s = new Store();
  s.setItem = () => {
    throw Error('quota');
  };
  assert.throws(() => saveRebuild(s, map()), /quota/);
  s.setItem = () => {};
  assert.throws(() => saveRebuild(s, map()), /verification/);
  s.getItem = () => {
    throw Error('denied');
  };
  assert.throws(() => saveRebuild(s, map()), /denied/);
  const a = new Store(),
    e = saveRebuild(a, map());
  a.removeItem = () => {};
  assert.throws(() => deleteCard(a, e.key), /verification/);
  assert.throws(() => deleteAll(a), /verification/);
});
test('all-data deletion removes five types and unknown versions without unrelated keys', () => {
  const s = new Store();
  seed(s);
  saveRebuild(s, map());
  s.setItem('oe:future', '{}');
  s.setItem('unrelated', 'keep');
  deleteAll(s);
  assert.deepEqual([...s.map], [['unrelated', 'keep']]);
});
test('handoff includes only exact area/reality and first move, without truncation or source mutation', () => {
  const m = map(),
    before = structuredClone(m),
    h = prepareRebuildHandoff(m);
  assert.deepEqual(h, {
    situation: m.area + '\n\n' + m.reality,
    action: m.firstMove,
    includeSituation: true,
    includeAction: true,
  });
  assert.deepEqual(m, before);
  assert.equal(
    prepareRebuildHandoff({ ...m, area: 'a'.repeat(2000), reality: 'b'.repeat(2000) }).situation
      .length,
    4002,
  );
  for (const f of ['structure', 'proof', 'trust', 'negotiation'])
    assert.ok(!JSON.stringify(h).includes(m[f]));
});
