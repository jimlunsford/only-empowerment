import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  newPracticeSession,
  practiceViews,
  communicationConditions,
  evidenceRecords,
  practiceCopy,
  honestMessage,
  helpMessage,
} from '../src/period-practice-content.ts';
import { practiceFallback } from '../scripts/practice-fallback.ts';
import {
  newPeriodSession,
  enterPeriodExercise,
  periodCardText,
} from '../src/period-standard-model.ts';
import { periodExercise } from '../src/period-content.ts';

test('practice has four public views and only two temporary fictional facts', () => {
  assert.deepEqual(
    practiceViews.map((v) => v.path),
    [
      '/period/practice',
      '/period/practice/responses',
      '/period/practice/follow-through',
      '/period/practice/connected-code',
    ],
  );
  assert.deepEqual(newPracticeSession(), { communication: 'worked', evidence: 'promised' });
  assert.notEqual(newPracticeSession(), newPracticeSession());
  const source = readFileSync(new URL('../src/PracticeOwnership.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(
    source,
    /PeriodDraft|PeriodSession|period-standard-model|localStorage|sessionStorage|fetch\(|console\.|<input|<textarea|<select/,
  );
});

test('both messages acknowledge only the actual condition and retain the workable correction', () => {
  for (const message of [honestMessage, helpMessage]) {
    assert.match(message('worked'), /^I missed the 3 p.m. update and left you waiting\./);
    assert.match(
      message('unavailable'),
      /^I could not send the 3 p.m. update because messaging was unavailable until now\./,
    );
    assert.doesNotMatch(message('unavailable'), /I missed|chose|left you waiting/);
    assert.match(message('unavailable'), /completed section now/);
    assert.match(message('unavailable'), /update you by 9:15/);
  }
});

test('linear fallback includes every essential teaching paragraph and all alternate records', () => {
  const html = practiceFallback();
  const escape = (s) =>
    s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  const paragraphs = [
    ...practiceViews.flatMap((v) => [v.title, v.lead]),
    ...Object.values(communicationConditions).flatMap((c) => [
      c.situation,
      c.outside,
      c.own,
      c.explanation,
    ]),
    ...Object.values(evidenceRecords).flatMap((r) => [r.record, r.interpretation]),
    ...['worked', 'unavailable'].flatMap((condition) => [
      honestMessage(condition),
      helpMessage(condition),
    ]),
    ...Object.values(practiceCopy.household),
    ...practiceCopy.relationships.flatMap((r) => [r.value, r.contribution, r.connection]),
    practiceCopy.waiting.explanation,
    practiceCopy.overpromising.explanation,
    practiceCopy.help.explanation,
    practiceCopy.repair,
    practiceCopy.connectedStandard,
    practiceCopy.connectedReturn,
    practiceCopy.empowermentLimit,
    practiceCopy.workedExample,
    practiceCopy.takeAction,
    practiceCopy.availability,
    practiceCopy.responsePause,
  ];
  for (const text of paragraphs) assert.ok(html.includes(escape(text)), text);
  assert.doesNotMatch(html, /<input|<textarea|<select|<button|<details|<script/);
});

test('optional entry never replaces a selected-only, field-only, whitespace, or finished draft', () => {
  for (const changes of [
    { valueId: 'purpose' },
    { standard: '  ' },
    { nextApplication: 'My wording' },
    { returnPlan: '\nSupport\n' },
    { valueId: 'integrity', standard: 'Exact 👩🏽‍💻 é <b>text</b>' },
  ]) {
    for (const view of ['edit', 'card']) {
      const before = { ...newPeriodSession(), view };
      Object.assign(before.draft, changes);
      const snapshot = JSON.stringify(before.draft);
      const after = enterPeriodExercise(before, 'ownership');
      assert.equal(after.draft, before.draft);
      assert.equal(JSON.stringify(after.draft), snapshot);
      assert.equal(after.view, view);
      assert.equal(after.notice, 'You already have a standard in progress.');
    }
  }
  assert.equal(enterPeriodExercise(newPeriodSession(), 'ownership').draft.valueId, 'ownership');
});

test('approved card scope wording is exact and appears once in copied output', () => {
  const expected =
    'This card records one behavior you intend to practice within the connected six-value Code. It does not show that the action has happened or that you have completed the Code. Return to the standard, make the correction when needed, and let your behavior provide the evidence.';
  assert.equal(periodExercise.footnote, expected);
  assert.equal(
    periodExercise.lead,
    'Write one intended behavior within The PERIOD Code’s connected standard for living. Choose a value as the focus of this card, then name where you will practice the behavior. The other values still matter.',
  );
  assert.equal(periodCardText(newPeriodSession().draft).split(expected).length, 2);
});
