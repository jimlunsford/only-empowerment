import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  disciplineContent as content,
  disciplineWayfinding,
} from '../src/period-discipline-content.ts';
import {
  disciplineAnchorRoute,
  disciplineAnchor,
  disciplineLessonAnchor,
} from '../src/period-discipline-navigation.ts';
import { disciplineReading } from '../scripts/discipline-reading.ts';
import {
  newPeriodSession,
  enterPeriodExercise,
  periodCardText,
} from '../src/period-standard-model.ts';

test('the entire approved eight-part lesson and seven-occasion comparison retain Work 15 copy exactly', () => {
  // Independent digests of the two visitor-copy objects in the accepted Work 15 archive.
  for (const [key, digest] of Object.entries({
    lesson: '0ef34666e7aaa6dce4c6a3f48a71bcfa117f6e3ab47a3e4ca94521502d1e00cc',
    interaction: '66a6c13967da3ee76bae7d51d3ce0b83656c7a5d4e54556d252ad275498800a5',
  }))
    assert.equal(createHash('sha256').update(JSON.stringify(content[key])).digest('hex'), digest);
  assert.equal(content.lesson.sections.length, 8);
  assert.deepEqual(
    content.interaction.moments.map((m) => m.id),
    [
      'promise',
      'first-action',
      'repeated-action',
      'miss',
      'return',
      'changed-capacity',
      'continuation',
    ],
  );
});

test('the direct reading export includes the complete lesson, all three patterns, interpretations and limitations without scripts', () => {
  const html = disciplineReading();
  const escape = (t) =>
    t
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  const strings = (v) =>
    typeof v === 'string'
      ? [v]
      : Array.isArray(v)
        ? v.flatMap(strings)
        : Object.entries(v)
            .filter(([k]) => k !== 'id')
            .flatMap(([, v]) => strings(v));
  const c = content.interaction;
  for (const text of [
    ...strings(content.lesson),
    c.readingTitle,
    c.deck,
    c.readingIntro,
    ...c.intro,
    c.readerPrompt,
    c.fixedLabel,
    ...c.choices.map((c) => c.label),
    c.conclusionTitle,
    ...c.conclusion,
    c.transferPrompt,
    c.backLink,
    ...c.moments.flatMap((m) => [
      m.title,
      m.context,
      m.reference,
      m['strong-start'],
      m['rigid-effort'],
      m.interpretation,
      m.correction,
    ]),
  ])
    assert.ok(html.includes(escape(text)), text);
  assert.doesNotMatch(
    html,
    /<script|<details|<input|<button|aria-live|localStorage|sessionStorage/,
  );
  assert.match(html, /All three fictional patterns/);
  assert.match(html, /content="noindex, nofollow"/);
  assert.match(disciplineReading(false), /content="index, follow"/);
  assert.doesNotMatch(disciplineReading(false), /Development staging/);
});

test('founder wayfinding reaches existing occasions and stays within the same comparison route', () => {
  assert.deepEqual(
    disciplineWayfinding.map((l) => l.label),
    ['Repeated actions', 'The miss and return', 'Changed capacity'],
  );
  for (const item of disciplineWayfinding) {
    assert.ok(content.interaction.moments.some((m) => m.id === item.id));
    assert.match(disciplineReading(), new RegExp(`href="#occasion-${item.id}"`));
    assert.match(disciplineReading(), new RegExp(`id="occasion-${item.id}"`));
    assert.equal(disciplineAnchorRoute(disciplineAnchor(item.id)), '/period/discipline/pattern');
  }
  assert.equal(disciplineAnchorRoute(disciplineLessonAnchor), '/period/values/discipline');
  assert.equal(
    disciplineAnchorRoute('/period/discipline/pattern/unknown'),
    '/period/discipline/pattern/unknown',
  );
});

test('comparison state cannot access drafts, persist, submit or track and no-script fallback links directly', () => {
  const source = readFileSync('src/Discipline.tsx', 'utf8');
  assert.doesNotMatch(
    source,
    /PeriodDraft|PeriodSession|localStorage|sessionStorage|fetch\(|console\.|setTimeout|scrollIntoView|\.focus\(|<textarea|<select/,
  );
  assert.match(source, /type="radio"/);
  assert.match(source, /role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(readFileSync('index.html', 'utf8'), /href="\/read\/discipline.html"/);
});

test('Discipline preselection changes only a pristine Standard Card and preserves exact authored or selected work', () => {
  assert.equal(enterPeriodExercise(newPeriodSession(), 'discipline').draft.valueId, 'discipline');
  for (const fields of [
    { valueId: 'purpose' },
    { standard: '  ' },
    { nextApplication: '\n' },
    { returnPlan: 'Support' },
    { standard: '👩🏽‍💻 é <b>my words</b>\n' },
  ]) {
    for (const view of ['edit', 'card']) {
      const s = newPeriodSession();
      s.view = view;
      Object.assign(s.draft, fields);
      const before = JSON.stringify(s.draft),
        copied = periodCardText(s.draft);
      const after = enterPeriodExercise(s, 'discipline');
      assert.equal(JSON.stringify(after.draft), before);
      assert.equal(periodCardText(after.draft), copied);
    }
  }
});
