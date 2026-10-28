import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newPeriodSession,
  characterCount,
  periodErrors,
  periodCardText,
  enterPeriodExercise,
} from '../src/period-standard-model.ts';
import { periodValues, periodExercise } from '../src/period-content.ts';
import { periodFallback } from '../scripts/period-fallback.ts';
test('ordered content contains only the authorized complete lesson and a substantial static fallback', () => {
  assert.deepEqual(
    periodValues.map((v) => v.name),
    ['Ownership', 'Purpose', 'Resilience', 'Integrity', 'Discipline', 'Empowerment'],
  );
  assert.deepEqual(
    periodValues.filter((v) => v.lesson).map((v) => v.id),
    ['ownership'],
  );
  const fallback = periodFallback();
  for (const text of [
    'Why PERIOD?',
    'Ownership does not mean everything is your fault.',
    'Why Purpose comes next',
    'Example standard card',
    'pattern on paper',
  ])
    assert.ok(fallback.includes(text));
});
test('presence and code-point bounds validate without modifying any text', () => {
  const d = newPeriodSession().draft;
  assert.deepEqual(Object.keys(periodErrors(d)), ['valueId', 'standard', 'nextApplication']);
  Object.assign(d, {
    valueId: 'ownership',
    standard: '😀'.repeat(500),
    nextApplication: 'x'.repeat(300),
    returnPlan: 'y'.repeat(300),
  });
  assert.equal(characterCount(d.standard), 500);
  assert.deepEqual(periodErrors(d), {});
  const before = JSON.stringify(d);
  for (const f of ['standard', 'nextApplication', 'returnPlan']) {
    const excessive = { ...d, [f]: d[f] + 'x' };
    assert.match(periodErrors(excessive)[f], /Your words have not been shortened/);
  }
  assert.equal(JSON.stringify(d), before);
  assert.ok(periodErrors({ ...d, standard: ' \n\t ' }).standard);
});
test('copy preserves exact authored text, optional omission, honest status and attribution', () => {
  const d = {
    ...newPeriodSession().draft,
    valueId: 'integrity',
    standard: '  <script>alert("x")</script>\n👩🏽‍💻 é العربية  ',
    nextApplication: '\nNext.\n',
    returnPlan: '  Return\n  ',
  };
  const text = periodCardText(d);
  for (const f of ['standard', 'nextApplication', 'returnPlan']) assert.ok(text.includes(d[f]));
  assert.ok(text.includes('Chosen, not yet demonstrated'));
  assert.ok(text.includes(periodExercise.footnote));
  assert.ok(text.includes(periodExercise.source));
  assert.ok(!periodCardText({ ...d, returnPlan: '  ' }).includes('Support or correction'));
});
test('lesson entry only preselects an empty draft and never overwrites an existing card', () => {
  const start = enterPeriodExercise(newPeriodSession(), 'ownership');
  assert.equal(start.draft.valueId, 'ownership');
  start.draft.standard = 'My exact words';
  start.view = 'card';
  const next = enterPeriodExercise(start, 'purpose');
  assert.equal(next.draft, start.draft);
  assert.equal(next.view, 'card');
  assert.equal(next.notice, 'You already have a standard in progress.');
});
