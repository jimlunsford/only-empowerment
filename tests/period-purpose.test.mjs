import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  purposeLesson,
  purposeCopy,
  purposeDirections,
  purposeCapacities,
  purposeExamples,
  purposeRelationships,
  purposeConnected,
  purposeBridge,
  purposeCardNote,
  purposeBook,
  newPurposeSession,
  purposeExample,
} from '../src/period-purpose-content.ts';
import { purposeFallback } from '../scripts/purpose-fallback.ts';
import { periodFallback } from '../scripts/period-fallback.ts';
import {
  newPeriodSession,
  enterPeriodExercise,
  periodCardText,
} from '../src/period-standard-model.ts';

test('approved refinements separate the plan from purpose and respect survival seasons', () => {
  assert.equal(
    purposeCopy.planDistinction,
    "The evening plan is not Sam's purpose. It is one decision that can serve the life Sam is trying to build. Steadier work and basic stability may both contribute to that larger direction.",
  );
  const seasons = purposeLesson.find((part) => part.id === 'L05');
  assert.ok(
    seasons.paragraphs.includes(
      'Avoiding the old life may be where rebuilding begins. Purpose is what gives you something worth building in its place.',
    ),
  );
  assert.match(seasons.paragraphs[0], /survival, sobriety, care or basic stability/);
  assert.match(seasons.paragraphs.at(-1), /before every detail is clear/);
  assert.match(purposeConnected, /connected standard for living/);
  assert.equal(purposeRelationships.length, 6);
  assert.equal(
    purposeBridge.at(-1),
    'Resilience is next in the teaching order. Its lesson is not available yet.',
  );
});

test('four possible evenings preserve 120 minutes, tomorrow preparation and the 9 p.m. stop', () => {
  assert.deepEqual(Object.keys(purposeExamples), [
    'work_usual',
    'stability_usual',
    'work_lower',
    'stability_lower',
  ]);
  const minutes = (t) => t.split(':').reduce((hours, value) => hours * 60 + Number(value), 0);
  const allocations = {};
  for (const [key, example] of Object.entries(purposeExamples)) {
    let next = 7 * 60;
    const spans = example.plan.map((row) => {
      const [start, end] = row.time.split('–').map(minutes);
      assert.equal(start, next, `${key}: no overlaps or borrowed time`);
      assert.ok(end > start);
      next = end;
      return end - start;
    });
    assert.equal(next, 9 * 60);
    assert.equal(
      spans.reduce((a, b) => a + b, 0),
      120,
    );
    assert.equal(example.plan[1].title, 'Prepare for tomorrow');
    assert.equal(spans[1], 20);
    assert.equal(example.plan[2].title, 'Rest');
    allocations[key] = spans;
    assert.ok(example.serves && example.cost && example.uncertain && example.compare);
  }
  assert.deepEqual(allocations, {
    work_usual: [60, 20, 40],
    stability_usual: [40, 20, 60],
    work_lower: [20, 20, 80],
    stability_lower: [10, 20, 90],
  });
  assert.match(
    purposeExamples.work_usual.uncertain,
    /not a submitted application, an acceptance or a job offer/,
  );
  assert.match(purposeExamples.stability_usual.cost, /let this opportunity go/);
  assert.match(purposeExamples.work_lower.cost, /extension is not guaranteed/);
  assert.match(purposeExamples.stability_lower.cost, /rest will solve everything/);
  assert.match(purposeCopy.same_evening, /70 minutes.*30 minutes.*20 minutes/);
  assert.match(
    purposeCopy.same_evening_end,
    /Changing the purpose statement alone has changed nothing/,
  );
});

test('fictional defaults and independent combinations are separate from any personal draft', () => {
  const initial = newPurposeSession();
  assert.deepEqual(initial, { direction: 'work', capacity: 'usual' });
  assert.notEqual(initial, newPurposeSession());
  for (const direction of Object.keys(purposeDirections))
    for (const capacity of Object.keys(purposeCapacities)) {
      const example = purposeExample({ direction, capacity });
      assert.equal(example.direction, direction);
      assert.equal(example.capacity, capacity);
    }
  const source = readFileSync(new URL('../src/Purpose.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(
    source,
    /PeriodDraft|PeriodSession|period-standard-model|localStorage|sessionStorage|fetch\(|console\.|<input|<textarea|<select/,
  );
});

test('build-time reading preserves the complete lesson and every fictional consequence', () => {
  const html = purposeFallback();
  const escape = (s) =>
    s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  const content = [
    ...purposeLesson.flatMap((part) => [part.heading, ...part.paragraphs]),
    ...purposeRelationships.flatMap((item) => [item.value, item.connection]),
    purposeConnected,
    ...purposeBridge,
    purposeCardNote,
    ...Object.values(purposeBook),
    ...Object.values(purposeDirections).map((item) => item.description),
    ...Object.values(purposeCapacities).map((item) => item.description),
    ...Object.values(purposeExamples).flatMap((item) => [
      item.label,
      item.serves,
      item.cost,
      item.uncertain,
      item.compare,
      ...item.plan.flatMap((row) => [row.time, row.title, row.description]),
    ]),
    ...[
      'title',
      'lead',
      'intro',
      'situation_heading',
      'situation',
      'facts',
      'assumptions',
      'planDistinction',
      'directionLimit',
      'reflection',
      'same_evening_heading',
      'same_evening',
      'same_evening_end',
      'close_heading',
      'close',
      'pressure',
      'reassurance',
    ].map((key) => purposeCopy[key]),
  ];
  for (const text of content) assert.ok(html.includes(escape(text)), text);
  assert.doesNotMatch(html, /<input|<textarea|<select|<button|<details|<script/);
  const full = periodFallback();
  assert.ok(full.includes(html));
  assert.match(full, /href="#reading-purpose"/);
  assert.doesNotMatch(full, /Only Ownership|other five lessons|Purpose lesson is not included/);
});

test('Purpose card entry preserves nonblank drafts, exact text and completed card view', () => {
  assert.equal(enterPeriodExercise(newPeriodSession(), 'purpose').draft.valueId, 'purpose');
  for (const fields of [
    { valueId: 'ownership' },
    { standard: '  ' },
    { nextApplication: '\n' },
    { returnPlan: 'Support' },
    { valueId: 'integrity', standard: '  👩🏽‍💻 é <b>my words</b>\n' },
  ]) {
    for (const view of ['edit', 'card']) {
      const session = newPeriodSession();
      session.view = view;
      Object.assign(session.draft, fields);
      const before = JSON.stringify(session.draft),
        copied = periodCardText(session.draft);
      const after = enterPeriodExercise(session, 'purpose');
      assert.equal(after.draft, session.draft);
      assert.equal(JSON.stringify(after.draft), before);
      assert.equal(after.view, view);
      assert.equal(periodCardText(after.draft), copied);
    }
  }
});
