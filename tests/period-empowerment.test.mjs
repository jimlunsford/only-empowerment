import { periodFallback } from '../scripts/period-fallback.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { beforeWork35 } from './editorial-copy-helpers.mjs';
import {
  empowermentContent as content,
  empowermentAvailability,
  empowermentNavigation,
} from '../src/period-empowerment-content.ts';
import { empowermentReading } from '../scripts/empowerment-reading.ts';
import { newPeriodSession, enterPeriodExercise } from '../src/period-standard-model.ts';
import { disciplineContent } from '../src/period-discipline-content.ts';
import { integrityContent } from '../src/period-integrity-content.ts';
import { periodPresentation } from '../src/period-presentation.ts';
import { practiceCopy } from '../src/period-practice-content.ts';

const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const refinement = content.lesson.sections.find((s) => s.id === 'help-that-fits').paragraphs[4];
const escape = (s) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

test('Work 19 copy retains the founder passage and only the approved Work 35 edits', () => {
  // Independently calculated from the accepted Work 19 visitor-copy JSON.
  const originalLesson = beforeWork35(content.lesson, 'empowermentContent.lesson');
  originalLesson.sections.find((s) => s.id === 'help-that-fits').paragraphs.splice(4, 1);
  assert.equal(
    hash(originalLesson),
    '033818d4ffdb5fc4e1fe2765ae7940123754ebe2a3770d340f646be6111e973e',
  );
  assert.equal(
    hash(beforeWork35(content.conversation, 'empowermentContent.conversation')),
    'b19c4b96b4d95875955a85c268365c09e0ae107d218e11689924aa99b3759703',
  );
  assert.equal(content.lesson.sections.length, 7);
  assert.equal(content.lesson.sections[5].connections.length, 6);
});

test('the founder passage distinguishes avoidable irresponsibility from necessary support', () => {
  for (const text of [
    'Do not keep covering avoidable choices while calling it help',
    'Where a person can act, leave them responsibility and room to face the ordinary consequences',
    'without punishment or humiliation',
    'Never withhold necessary care, treatment, disability accommodations, medical or emergency help',
    'support required by genuine limits to teach someone a lesson',
    'Give the help the need requires',
    'respect the choices the person can make',
  ])
    assert.ok(refinement.includes(text), text);
  assert.ok(empowermentReading().includes(escape(refinement)));
});

test('all three alternatives preserve explicit agreement, actual actions and uncertainty', () => {
  const c = content.conversation;
  assert.equal(c.defaultReply, 'accept');
  assert.deepEqual(
    c.states.map((s) => s.id),
    ['accept', 'negotiate', 'decline'],
  );
  assert.match(c.states[0].action, /agenda has not been sent/);
  const n = c.states[1];
  assert.match(n.helper, /Would that fit\?/);
  assert.equal(
    n.confirmation,
    'Dev agrees to that limited arrangement. Mara has not promised that all three items will be finished before 3:20.',
  );
  assert.match(n.action, /third is unfinished at 3:20/);
  assert.match(
    n.action,
    /Dev plans to ask Jordan for help\. That conversation and agreement have not happened yet/,
  );
  assert.match(c.states[2].action, /What Dev does next is not shown/);
  assert.match(
    c.states[2].agreement[1][1],
    /No message, draft, reminder or unsolicited check-in is agreed/,
  );
  assert.equal(c.alternatives.length, 2);
});

test('script-free reading contains every teaching string and real in-page links', () => {
  const html = empowermentReading();
  const strings = (v) =>
    typeof v === 'string'
      ? [v]
      : Array.isArray(v)
        ? v.flatMap(strings)
        : Object.entries(v)
            .filter(
              ([k]) =>
                !['id', 'status', 'defaultReply', 'controlLegend', 'controlHint'].includes(k),
            )
            .flatMap(([, v]) => strings(v));
  for (const text of strings(content)) assert.ok(html.includes(escape(text)), text);
  assert.doesNotMatch(html, /<script|<details|<input|<button|\shidden|aria-live/);
  for (const id of [
    'lesson',
    'offer',
    'reply-accept',
    'reply-negotiate',
    'reply-decline',
    'conclusion',
  ]) {
    assert.ok(html.includes(`href="#${id}"`));
    assert.ok(html.includes(`id="${id}"`));
  }
  for (const path of [
    '/read/resilience.html',
    '/read/integrity.html',
    '/read/discipline.html',
    '/#reading-ownership',
    '/#reading-purpose',
  ])
    assert.ok(html.includes(`href="${path}"`));
  assert.match(html, /content="noindex, nofollow"/);
  assert.match(empowermentReading(false), /content="index, follow"/);
  assert.doesNotMatch(empowermentReading(false), /Development staging/);
});

test('every active availability source agrees that all six lessons are available', () => {
  assert.equal(disciplineContent.lesson.nextDescription, empowermentNavigation.disciplineBridge);
  assert.equal(disciplineContent.lesson.nextLink, 'Continue to Empowerment');
  assert.equal(integrityContent.navigation.availability, empowermentAvailability);
  assert.equal(periodPresentation.introLead, empowermentNavigation.homeLead);
  assert.equal(practiceCopy.availability, empowermentNavigation.connectedCodeAvailability);
  assert.ok(periodFallback().includes('href="/read/empowerment.html"'));
});

test('new conversation has no personal data, persistence, network, grading or selection history', () => {
  const source = readFileSync('src/Empowerment.tsx', 'utf8');
  assert.doesNotMatch(
    source,
    /PeriodDraft|PeriodSession|localStorage|sessionStorage|fetch\(|console\.|setTimeout|scrollIntoView|\.focus\(|<textarea|<select|history\./,
  );
  assert.match(source, /type="radio"/);
  assert.match(source, /role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(source, /useState\(''\)/);
});

test('Empowerment can select only a pristine card and cannot overwrite partial drafts', () => {
  assert.equal(enterPeriodExercise(newPeriodSession(), 'empowerment').draft.valueId, 'empowerment');
  for (const field of ['standard', 'nextApplication', 'returnPlan']) {
    const session = newPeriodSession();
    session.draft.valueId = 'integrity';
    session.draft[field] = 'SYNTHETIC: Preserve exactly.\nSecond line.';
    const after = enterPeriodExercise(session, 'empowerment');
    assert.deepEqual(after.draft, session.draft);
  }
});
