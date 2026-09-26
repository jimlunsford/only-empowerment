import test from 'node:test';
import assert from 'node:assert/strict';
import {
  actionError,
  actionFromSession,
  actionText,
  newActionSession,
  validActionRecord,
  remainingSeconds,
  timerValid,
  receiveActionHandoff,
  resultChoices,
} from '../src/do-it-now-model.ts';
import { governedActionLessons } from '../src/do-it-now-lessons.ts';
import { parseAction, saveAction, ACTION_PREFIX } from '../src/local-actions.ts';
import { handoffPreview } from '../src/next-move-model.ts';
import { readArtifacts, saveDecision } from '../src/local-decisions.ts';
import { saveCard, deleteAll, deleteCard } from '../src/local-cards.ts';
import { saveStandard } from '../src/local-standards.ts';
import { saveReset } from '../src/local-resets.ts';
import { saveRebuild } from '../src/local-rebuilds.ts';
import { standardFields } from '../src/standard-model.ts';
import { resetFields } from '../src/reset-model.ts';
import { rebuildFields } from '../src/rebuild-model.ts';
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
const text = '  <script>"\'🧭e\u0301</script>\nOwn result.  ';
const record = () => ({ task: text, firstAction: text, beginState: 'Started', outcome: text });
const card = {
  situation: 'Context',
  action: text,
  start: 'After permission',
  obstacle: 'Delay',
  completion: 'Sent',
};
test('no Action Record before explicit Begin and result evidence', () => {
  const s = { ...newActionSession(), ...record(), result: 'Completed' };
  assert.equal(actionFromSession(s), null);
  assert.equal(actionFromSession({ ...s, started: true, result: '' }), null);
  assert.equal(actionFromSession({ ...s, started: true, outcome: '' }), null);
  assert.deepEqual(actionFromSession({ ...s, started: true }), record());
});
for (const status of resultChoices)
  test(`Action Record ${status} is exact user-authored report`, () => {
    const s = new Store(),
      saved = saveAction(s, record(), status);
    assert.deepEqual(parseAction(saved.raw, saved.key), saved.record);
    assert.equal(saved.record.status, status);
    assert.deepEqual(saved.record.record, record());
    const copy = actionText(record(), status);
    assert.ok(copy.includes(text));
    assert.ok(copy.includes('Status\n' + status));
    assert.ok(copy.includes('Begin state\nStarted'));
    assert.doesNotMatch(copy, /timer|UUID|savedKey/);
  });
for (const field of ['task', 'firstAction', 'outcome'])
  test(`Action ${field} validates bounds without changing words`, () => {
    for (const bad of ['', ' \n', 'x'.repeat(2001), 1, null])
      assert.equal(validActionRecord({ ...record(), [field]: bad }), false);
    assert.ok(validActionRecord({ ...record(), [field]: 'x'.repeat(2000) }));
    assert.ok(actionError('x'.repeat(2001)).includes('not been shortened'));
  });
test('Action schema rejects extra keys, bad UUID/key, wrong status, unstarted and oversized data', () => {
  const s = new Store(),
    a = saveAction(s, record(), 'Partial');
  for (const change of [
    { extra: 1 },
    { schemaVersion: 2 },
    { tool: 'next-move' },
    { id: 'bad' },
    { status: 'Success' },
    { record: { ...record(), beginState: '' } },
    { record: { ...record(), timer: 3 } },
  ])
    assert.equal(parseAction(JSON.stringify({ ...a.record, ...change }), a.key), null);
  for (const raw of ['{', 'null', '[]', 'x'.repeat(40001)])
    assert.equal(parseAction(raw, a.key), null);
  assert.equal(parseAction(a.raw, a.key + 'x'), null);
});
test('worst-case JSON escaping fits serialized Action Record limit', () => {
  const s = new Store(),
    r = {
      task: '\u0001'.repeat(1999) + 'a',
      firstAction: '\u0002'.repeat(1999) + 'b',
      outcome: '\u0003'.repeat(1999) + 'c',
      beginState: 'Started',
    };
  const a = saveAction(s, r, 'Blocked');
  assert.ok(a.raw.length < 40000);
  assert.ok(parseAction(a.raw, a.key));
});
test('timer defaults off, bounded whole minutes, honest elapsed deadline', () => {
  assert.equal(newActionSession().timerMinutes, '');
  assert.equal(newActionSession().timerStartedAt, null);
  for (const v of ['', '1', '5', '60']) assert.ok(timerValid(v));
  for (const v of ['0', '61', '-1', '1.5', 'abc', ' ', 'Infinity'])
    assert.equal(timerValid(v), false);
  assert.equal(remainingSeconds(1000, 1, 1000), 60);
  assert.equal(remainingSeconds(1000, 1, 60000), 1);
  assert.equal(remainingSeconds(1000, 1, 999999), 0);
});
test('accepted handoff keeps required action and optional references in memory', () => {
  const h = handoffPreview(card, ['action', 'start', 'completion']);
  const s = receiveActionHandoff(h);
  assert.equal(s.task, text);
  assert.equal(s.firstAction, '');
  assert.equal(s.readiness, '');
  assert.equal(s.started, false);
  assert.equal(s.savedKey, null);
  assert.deepEqual(s.reference, h);
  h.fields.start = 'Changed';
  assert.equal(s.reference.fields.start, 'After permission');
  assert.equal(receiveActionHandoff(handoffPreview(card, ['start'])), null);
  assert.equal(receiveActionHandoff(handoffPreview({ ...card, action: '' }, ['action'])), null);
  assert.deepEqual(receiveActionHandoff(handoffPreview(card, ['action'])).reference.fields, {
    action: text,
  });
  assert.equal(
    receiveActionHandoff(handoffPreview({ ...card, start: 'x'.repeat(1001) }, ['action', 'start'])),
    null,
  );
});
test('lessons carry live source governance and questions', () => {
  assert.equal(governedActionLessons.length, 3);
  for (const l of governedActionLessons) {
    assert.equal(l.tool, 'do-it-now');
    assert.equal(l.reviewed, '2026-09-25');
    assert.ok(l.canonical.endsWith('/pure-execution-mode/'));
    assert.ok(l.question && l.reviewer);
  }
});
test('six artifact types preserve old bytes and share a 50 record quota', () => {
  const s = new Store(),
    d = emptyDecision();
  for (const f of decisionFields) d[f] = 'Own ' + f;
  d.options.forEach((o, i) =>
    Object.assign(o, { label: 'Option ' + i, tradeoff: 'Cost', reversibility: 'Not yet known' }),
  );
  d.chosenId = d.options[0].id;
  const old = [
    saveCard(s, card),
    saveDecision(s, d),
    saveStandard(
      s,
      Object.fromEntries(
        standardFields.map((f) => [
          f,
          ['keeping', 'violations'].includes(f) ? ['Act'] : 'Own ' + f,
        ]),
      ),
    ),
    saveReset(s, Object.fromEntries(resetFields.map((f) => [f, 'Own ' + f]))),
    saveRebuild(
      s,
      Object.fromEntries(rebuildFields.map((f) => [f, f === 'actions' ? ['Act'] : 'Own ' + f])),
    ),
  ];
  saveAction(s, record(), 'Completed');
  assert.equal(readArtifacts(s).entries.length, 6);
  for (const a of old) assert.equal(s.getItem(a.key), a.raw);
  while (s.length < 50) saveAction(s, record(), 'Partial');
  assert.throws(() => saveAction(s, record(), 'Blocked'), /full/);
  for (const a of old) assert.equal(s.getItem(a.key), a.raw);
});
test('saved Action edits reject changed bytes or deleted records', () => {
  const s = new Store(),
    a = saveAction(s, record(), 'Completed');
  const b = saveAction(s, { ...record(), outcome: 'Changed' }, 'Partial', a);
  assert.equal(b.key, a.key);
  assert.throws(() => saveAction(s, record(), 'Completed', a), /changed/);
  deleteCard(s, b.key);
  assert.throws(() => saveAction(s, record(), 'Completed', b), /changed/);
  assert.equal(s.length, 0);
});
test('storage denial, quota failure and failed write readback are not successful saves', () => {
  for (const error of ['denied', 'quota']) {
    const s = new Store();
    s.setItem = () => {
      throw new Error(error);
    };
    assert.throws(() => saveAction(s, record(), 'Blocked'), new RegExp(error));
  }
  const s = new Store();
  s.setItem = () => {};
  assert.throws(() => saveAction(s, record(), 'Blocked'), /verification/);
});
test('scoped deletion covers unsupported Action records and preserves unrelated storage', () => {
  const s = new Store();
  const a = saveAction(s, record(), 'Blocked');
  s.setItem('oe:action-record:v2:unknown', 'future');
  s.setItem('oe:bad', '{');
  s.setItem('unrelated', 'keep');
  assert.equal(readArtifacts(s).rejected.length, 2);
  deleteCard(s, a.key);
  assert.equal(s.getItem(a.key), null);
  deleteAll(s);
  assert.equal(s.length, 1);
  assert.equal(s.getItem('unrelated'), 'keep');
});
test('failed deletion readback rejects success', () => {
  const s = new Store();
  const a = saveAction(s, record(), 'Blocked');
  s.removeItem = () => {};
  assert.throws(() => deleteCard(s, a.key), /verification/);
  assert.throws(() => deleteAll(s), /verification/);
});
