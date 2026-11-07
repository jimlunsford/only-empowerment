import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import approved from './fixtures/work39-approved.json' with { type: 'json' };
import exports from './fixtures/work39-card-exports.json' with { type: 'json' };
import prior from './fixtures/work35-editorial.json' with { type: 'json' };
import { parseCopy, fieldNode } from './editorial-copy-helpers.mjs';
import { beforeWork39Source, supersessions } from './work39-copy-helpers.mjs';
import { periodCardText } from '../src/period-standard-model.ts';
import { periodCardContext as context, periodExercise } from '../src/period-content.ts';
import { periodFallback } from '../scripts/period-fallback.ts';
import { staticFooter } from '../scripts/site-footer.ts';
import { resilienceReading } from '../scripts/resilience-reading.ts';
import { integrityReading } from '../scripts/integrity-reading.ts';
import { disciplineReading } from '../scripts/discipline-reading.ts';
import { empowermentReading } from '../scripts/empowerment-reading.ts';

const record = (id) => approved.records.find((r) => r.id === id);
const escape = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
test('exactly 21 Work 38 A records and seven named Work 35 supersessions', () => {
  assert.deepEqual(
    approved.records.map((r) => r.id),
    [
      'F01',
      'C01',
      'C02',
      'C03',
      'C04',
      'C05',
      'C06',
      'C07',
      'C08',
      'N01',
      'N02',
      'L01',
      'L02',
      'L03',
      'L04',
      'L05',
      'L06',
      'E01',
      'E02',
      'E03',
      'E04',
    ],
  );
  assert.deepEqual(Object.fromEntries(Object.entries(supersessions).map(([id, r]) => [id, r.id])), {
    O33: 'L01',
    P27: 'L02',
    R13: 'L03',
    I07: 'L04',
    D10: 'L05',
    E14: 'L06',
    E03: 'E04',
  });
  assert.equal(prior.records.filter((r) => !supersessions[r.id]).length, 170);
  for (const [id, r] of Object.entries(supersessions)) {
    const old = prior.records.find((p) => p.id === id);
    assert.equal(r.original, old.approved, id);
    assert.equal(r.field, old.field, id);
  }
  for (const r of approved.records.filter((r) => r.operation === 'replace' && r.id !== 'N01'))
    assert.equal(
      fieldNode(parseCopy(readFileSync(r.file, 'utf8')), r.field).value,
      r.proposed,
      r.id,
    );
  for (const [id, field] of [
    ['E01', 'resilienceContent.lesson[4].paragraphs[3]'],
    ['E02', 'integrityContent.lesson[3].paragraphs[1]'],
  ])
    assert.equal(
      fieldNode(parseCopy(readFileSync(record(id).file, 'utf8')), field).value,
      record(id).proposed,
      id,
    );
  assert.deepEqual(context, {
    footer: record('F01').proposed,
    connectedHeading: record('C03').proposed.heading,
    connectedParagraphs: record('C03').proposed.paragraphs,
    takeaway: record('C08').proposed,
    paperParagraphs: record('N01').proposed,
  });
  assert.equal(periodExercise.example.valueId, 'integrity');
  assert.doesNotMatch(JSON.stringify(approved.records.map((r) => r.proposed)), /\u2014/);
});

for (const [path, digest] of Object.entries(approved.baselineFiles)) {
  test(`Work 39 reverses only approved changes to exact Work 37 source: ${path}`, () => {
    const source = readFileSync(path, 'utf8');
    for (const r of approved.excluded) assert.ok(!source.includes(r.proposed), r.id);
    assert.equal(
      createHash('sha256').update(beforeWork39Source(source, path)).digest('hex'),
      digest,
    );
  });
}

test('all teaching, exact invitations, four examples and N02 are available without JavaScript', () => {
  const root = periodFallback();
  const card = root.slice(root.indexOf('<section class="standard-paper-reading">'));
  const texts = [
    periodExercise.lead,
    periodExercise.teaching,
    periodExercise.guardrail,
    context.connectedHeading,
    ...context.connectedParagraphs,
    ...context.paperParagraphs,
    periodExercise.example.standard,
    periodExercise.example.nextApplication,
    periodExercise.example.returnPlan,
    periodExercise.exampleLesson,
    periodExercise.footnote,
    periodExercise.source,
  ];
  let after = -1;
  for (const text of texts) {
    const at = card.indexOf(escape(text));
    assert.ok(at > after, text);
    assert.equal(card.split(escape(text)).length, 2, text);
    after = at;
  }
  assert.ok(!card.includes(context.takeaway));
  for (const [id, html] of [
    ['L01', root],
    ['L02', root],
    ['L03', resilienceReading()],
    ['L04', integrityReading()],
    ['L05', disciplineReading()],
    ['L06', empowermentReading()],
    ['E01', resilienceReading()],
    ['E02', integrityReading()],
    ['E03', disciplineReading()],
    ['E04', empowermentReading()],
  ])
    assert.ok(html.includes(escape(record(id).proposed)), id);
  assert.equal(root.split('id="reading-standard-card" tabindex="-1"').length, 2);
  assert.match(staticFooter(), /href="\/#reading-standard-card">Use the standard on paper<\/a>/);
  assert.match(staticFooter(), /href="\/#\/period\/standard">Optional Standard Card<\/a>/);
  assert.match(staticFooter(), /Optional Standard Card require JavaScript/);
  assert.ok(staticFooter().includes(context.footer));
  assert.match(
    readFileSync('src/use-route.ts', 'utf8'),
    /'reading-standard-card': '\/period\/standard'/,
  );
});

test('same synthetic drafts preserve exact pre-Work 39 export bytes with absent, present and long support', () => {
  for (const sample of exports)
    assert.equal(periodCardText(sample.draft), sample.text, sample.name);
  const source = readFileSync('src/PeriodStandard.tsx', 'utf8');
  assert.ok(
    source.indexOf('<p>{context.takeaway}</p>') >
      source.indexOf('<aside class="result-actions no-print">'),
  );
  assert.ok(source.indexOf('<p>{context.takeaway}</p>') < source.indexOf('Copy my card'));
  assert.ok(
    !source
      .slice(
        source.indexOf('export function PeriodCard'),
        source.indexOf('export function PeriodStandard'),
      )
      .includes('context.'),
  );
});
