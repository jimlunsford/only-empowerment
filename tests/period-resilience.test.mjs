import { periodFallback } from '../scripts/period-fallback.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { beforeWork35 } from './editorial-copy-helpers.mjs';
import { integrityContent } from '../src/period-integrity-content.ts';
import { resilienceContent as content } from '../src/period-resilience-content.ts';
import { pressureNote, resilienceUi as ui } from '../src/period-resilience-state.ts';
import { resilienceReading } from '../scripts/resilience-reading.ts';
import {
  newPeriodSession,
  enterPeriodExercise,
  periodCardText,
} from '../src/period-standard-model.ts';

// Permit only the bounded six-lesson availability update.
const originalAvailability =
  'Teaching order, not completion. Ownership, Purpose and Resilience have full lessons. Integrity, Discipline and Empowerment are shown for orientation; their full lessons are not available yet.';

test('Work 10 copy retains its verified baseline with only the approved Work 35 edits', () => {
  // SHA-256 of JSON.stringify(proposed-copy.json), checked against the complete Doc and PDF.
  assert.equal(
    createHash('sha256')
      .update(
        JSON.stringify({
          ...beforeWork35(content, 'resilienceContent'),
          availability: originalAvailability,
        }),
      )
      .digest('hex'),
    '96ad7684b970d2a13d6ce042393436495803a88462dbffc3fd54811a8f007a88',
  );
  assert.equal(content.lesson.length, 12);
  assert.equal(content.values.length, 6);
  assert.deepEqual(
    content.states.map((note) => note.id),
    ['slow', 'blocked', 'rest', 'missed', 'harm'],
  );
  assert.ok(content.states.every((note) => note.responses.length === 3));
});

test('the complete founder refinement preserves useful ordinary persistence', () => {
  assert.equal(
    ui.refinement,
    'Keep doing useful work when boredom is the problem. Change a method that is blocked. Rest when capacity requires it. Leave harm rather than proving you can endure more of it. Resilience asks which response protects the life you are building.',
  );
});

test('unknown fictional conditions recover to slow progress without private session state', () => {
  for (const input of [undefined, null, '', 'completed', 'score', {}, 1])
    assert.equal(pressureNote(input), content.states[0]);
  for (const note of content.states) assert.equal(pressureNote(note.id), note);
  const source = readFileSync(new URL('../src/Resilience.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(
    source,
    /PeriodDraft|PeriodSession|period-standard-model|localStorage|sessionStorage|fetch\(|console\.|<input|<textarea/,
  );
});

test('static export includes all lesson copy, every consequence, all fifteen explanations and actual action', () => {
  const html = resilienceReading();
  const escape = (text) =>
    text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  const strings = [
    content.title,
    content.lead,
    content.attribution,
    ui.refinement,
    ...content.lesson.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...('cta' in section ? [section.cta] : []),
      ...('hint' in section ? [section.hint] : []),
      ...('availability' in section ? [integrityContent.navigation.resilience_bridge] : []),
    ]),
    ...content.values.flat(),
    ...Object.entries(content.activity)
      .filter(([key]) => key !== 'selectorLabel')
      .map(([, text]) => text),
    ...content.states.flatMap((note) => [
      note.name,
      note.facts,
      note.method,
      note.retain,
      note.revision,
      note.cost,
      note.review,
      ...note.responses.flatMap((response) => [response.title, response.text]),
    ]),
  ];
  for (const text of strings) assert.ok(html.includes(escape(text)), text);
  assert.doesNotMatch(
    html,
    /<script|<input|<textarea|<select|<button|<details|localStorage|sessionStorage|aria-live/,
  );
  assert.match(html, /id="pressure-notes"/);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /content="noindex, nofollow"/);
  assert.match(resilienceReading(false), /content="index, follow"/);
  assert.doesNotMatch(resilienceReading(false), /Development staging/);
});

test('both static entry points are real links and reading cannot depend on the client bundle', () => {
  const index = periodFallback();
  assert.match(index, /href="\/read\/resilience\.html"/);
  const source = readFileSync(new URL('../src/Resilience.tsx', import.meta.url), 'utf8');
  assert.match(source, /\/read\/resilience\.html/);
  assert.match(source, /#pressure-notes/);
  assert.match(source, /target="_blank"\s+rel="noopener noreferrer"/);
});

test('Resilience card entry preselects only an entirely untouched draft and preserves exact authored work', () => {
  assert.equal(enterPeriodExercise(newPeriodSession(), 'resilience').draft.valueId, 'resilience');
  for (const fields of [
    { valueId: 'ownership' },
    { standard: '  ' },
    { nextApplication: '\n' },
    { returnPlan: 'Support' },
    { valueId: 'purpose', standard: '  👩🏽‍💻 é <b>my words</b>\n' },
  ]) {
    for (const view of ['edit', 'card']) {
      const session = newPeriodSession();
      session.view = view;
      Object.assign(session.draft, fields);
      const before = JSON.stringify(session.draft),
        copied = periodCardText(session.draft);
      const after = enterPeriodExercise(session, 'resilience');
      assert.equal(after.draft, session.draft);
      assert.equal(JSON.stringify(after.draft), before);
      assert.equal(after.view, view);
      assert.equal(periodCardText(after.draft), copied);
    }
  }
});
