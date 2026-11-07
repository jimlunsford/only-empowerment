import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import approved from './fixtures/work37-ownership-copy.json' with { type: 'json' };
import { ownershipFoundation } from '../src/period-content.ts';
import { practiceCopy, practiceViews } from '../src/period-practice-content.ts';
import { periodFallback } from '../scripts/period-fallback.ts';
import { practiceFallback } from '../scripts/practice-fallback.ts';

const escape = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const anchors = [
  'reading-ownership-practice',
  'reading-ownership-responses',
  'reading-ownership-follow-through',
  'reading-ownership-connected-code',
];

test('L01-L06 and P01-P03 match the approved copy with no story or extra fields', () => {
  assert.deepEqual(ownershipFoundation, approved.ownershipFoundation);
  for (const [key, value] of Object.entries(approved.practiceCopy))
    assert.equal(practiceCopy[key], value, key);
  const copy = JSON.stringify(ownershipFoundation) + JSON.stringify(approved.practiceCopy);
  assert.doesNotMatch(copy, /\u2014|What I had to own|authorExperience|I had explanations/);
});

test('complete root teaching has the approved order, map, optional bridge and native practice anchors', () => {
  const html = periodFallback();
  const values = Object.values(ownershipFoundation).flatMap((v) =>
    typeof v === 'string' ? [v] : [v.heading, ...v.paragraphs].filter(Boolean),
  );
  let previous = -1;
  for (const text of values) {
    const index = html.indexOf(escape(text));
    assert.ok(index > previous, text);
    assert.equal(html.split(escape(text)).length, 2, 'new teaching appears once');
    previous = index;
  }
  for (const text of [
    'What you cannot control',
    'The week that happened.',
    'How they respond.',
    'What you can own',
    'Acknowledge the effect.',
    'Offer a realistic next step.',
    'Make the correction.',
    'No answer required.',
  ])
    assert.ok(html.includes(escape(text)), text);
  assert.ok(
    html.indexOf('What you cannot control') < html.indexOf(ownershipFoundation.help.heading),
  );
  assert.ok(
    html.indexOf('Put Ownership into an ordinary moment') < html.indexOf('Why Purpose comes next'),
  );
  assert.match(html, /href="#reading-ownership-practice">Practice Ownership/);
  const routeSource = readFileSync('src/use-route.ts', 'utf8');
  anchors.forEach((anchor, index) => {
    assert.equal(html.split(`id="${anchor}"`).length, 2);
    assert.ok(routeSource.includes(`'${anchor}': '${practiceViews[index].path}'`));
  });
  assert.doesNotMatch(
    html,
    /What I had to own|I had explanations for|See how a real limit changes the responsibility|Follow the honest update into the next day/,
  );
  assert.doesNotMatch(
    readFileSync('src/PeriodLearning.tsx', 'utf8'),
    /Read the meaning, see an ordinary example/,
  );
});

test('P02 and P03 occur only in their approved practice views and once in linear reading', () => {
  const html = practiceFallback();
  for (const [key, index] of [
    ['lessonBridge', 0],
    ['purposeBridge', 3],
  ]) {
    const start = html.indexOf(`id="${anchors[index]}"`);
    const end = index < 3 ? html.indexOf(`id="${anchors[index + 1]}"`) : html.length;
    const text = escape(practiceCopy[key]);
    assert.ok(html.slice(start, end).includes(text));
    assert.equal(html.split(text).length, 2);
  }
  assert.ok(
    html.indexOf(escape(practiceCopy.purposeBridge)) < html.indexOf('Carry that responsibility'),
  );
});
