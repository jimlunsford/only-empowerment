import { periodFallback } from '../scripts/period-fallback.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { beforeWork35 } from './editorial-copy-helpers.mjs';
import { integrityContent as content } from '../src/period-integrity-content.ts';
import { integrityReading } from '../scripts/integrity-reading.ts';
import {
  newPeriodSession,
  enterPeriodExercise,
  periodCardText,
} from '../src/period-standard-model.ts';

test('all ten lesson sections retain Work 12 with only the approved Work 35 edits', () => {
  // Digest of the accepted archive lesson, independently matched to all ten Doc sections.
  assert.equal(
    createHash('sha256')
      .update(JSON.stringify(beforeWork35(content, 'integrityContent').lesson))
      .digest('hex'),
    'eccc4f90df9c49e9eedbd09aa7d2d2976b2d7dbc37f07609b3213b425e866f3d',
  );
  assert.deepEqual(
    content.lesson.map((section) => section.id),
    Array.from({ length: 10 }, (_, i) => `L${String(i + 1).padStart(2, '0')}`),
  );
});

test('the fixed record incorporates all three founder corrections without inventing a resolution', () => {
  const c = content.case;
  assert.ok(c.original.startsWith('I wrote the session descriptions for the workshop guide.'));
  assert.equal(c.notes[0].claim, 'I wrote the session descriptions for the workshop guide.');
  assert.match(
    c.notes[0].replacement,
    /Maya wrote the session descriptions\. I arranged the layout\./,
  );
  assert.match(c.facts[0], /^Monday:.*Maya.*private.*Riley acknowledges that boundary/);
  assert.match(c.facts[1], /^Tuesday:/);
  assert.match(c.facts[2], /existing privacy boundary/);
  assert.match(c.notes[2].fact, /Before Tuesday's message/);
  assert.doesNotMatch(c.correction, /private|circumstances|away|background/i);
  for (const text of [
    'Maya wrote the session descriptions',
    'I arranged the layout',
    'two room numbers',
    '20 printed draft copies',
    'replace the affected copies',
  ])
    assert.ok(c.correction.includes(text));
  assert.equal(c.notes[2].replacement_label, 'A private assurance to Maya');
  assert.match(c.continuation[1], /still needs to check that every copy was replaced/);
  assert.match(c.continuation[2], /Maya has not said whether she wants to collaborate again/);
  assert.match(c.correction_note, /While it stays in a draft, the team is still misled/);
});

test('the static reading page contains every teaching paragraph, note, comparison and limit with no enhancement dependency', () => {
  const html = integrityReading();
  const escape = (t) =>
    t
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  function strings(value) {
    return typeof value === 'string'
      ? [value]
      : Array.isArray(value)
        ? value.flatMap(strings)
        : Object.entries(value)
            .filter(([key]) => !['id', 'after'].includes(key))
            .flatMap(([, v]) => strings(v));
  }
  for (const text of [
    ...strings(content.lesson),
    ...strings(content.case),
    content.title,
    content.lead,
    content.card,
    content.book,
    content.attribution,
    content.availability,
    content.activity_invitation.hint,
  ])
    assert.ok(html.includes(escape(text)), text);
  assert.doesNotMatch(
    html,
    /<script|<details|<summary|<input|<textarea|<select|<button|aria-live|localStorage|sessionStorage/,
  );
  assert.match(html, /id="record"/);
  assert.match(html, /requires JavaScript/);
  assert.match(html, /href="\/read\/resilience.html"/);
  assert.match(html, /content="noindex, nofollow"/);
  assert.match(integrityReading(false), /content="index, follow"/);
  assert.doesNotMatch(integrityReading(false), /Development staging/);
});

test('the Integrity module cannot access private drafts or create new records and the fallback has a direct link', () => {
  const component = readFileSync(new URL('../src/Integrity.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(
    component,
    /PeriodDraft|PeriodSession|period-standard-model|localStorage|sessionStorage|fetch\(|console\.|<input|<textarea|<select|aria-expanded|aria-live/,
  );
  assert.match(component, /target="_blank"\s+rel="noopener noreferrer"/);
  assert.match(periodFallback(), /href="\/read\/integrity.html"/);
  assert.doesNotMatch(JSON.stringify(content), /I built the workshop guide/);
});

test('Integrity entry preserves selected-only, whitespace, authored and rendered cards exactly', () => {
  assert.equal(enterPeriodExercise(newPeriodSession(), 'integrity').draft.valueId, 'integrity');
  for (const fields of [
    { valueId: 'purpose' },
    { standard: '  ' },
    { nextApplication: '\n' },
    { returnPlan: 'Support' },
    { valueId: 'ownership', standard: '  👩🏽‍💻 é <b>my words</b>\n' },
  ]) {
    for (const view of ['edit', 'card']) {
      const session = newPeriodSession();
      session.view = view;
      Object.assign(session.draft, fields);
      const before = JSON.stringify(session.draft),
        copied = periodCardText(session.draft);
      const after = enterPeriodExercise(session, 'integrity');
      assert.equal(after.draft, session.draft);
      assert.equal(JSON.stringify(after.draft), before);
      assert.equal(after.view, view);
      assert.equal(periodCardText(after.draft), copied);
    }
  }
});
