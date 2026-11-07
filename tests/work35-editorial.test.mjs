import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { format, resolveConfig } from 'prettier';
import fixture from './fixtures/work35-editorial.json' with { type: 'json' };
import { parseCopy, fieldNode, headingNodes, patchLocations } from './editorial-copy-helpers.mjs';
import { beforeWork37Source } from './work37-copy-helpers.mjs';
import { periodFallback } from '../scripts/period-fallback.ts';
import { resilienceReading } from '../scripts/resilience-reading.ts';
import { integrityReading } from '../scripts/integrity-reading.ts';
import { disciplineReading } from '../scripts/discipline-reading.ts';
import { empowermentReading } from '../scripts/empowerment-reading.ts';

const { records } = fixture;
test('Work 35 has exactly the 177 approved records, the founder O01 override and no em dashes', () => {
  assert.equal(records.length, 177);
  assert.equal(new Set(records.map((record) => record.id)).size, 177);
  assert.deepEqual(
    Object.fromEntries(
      'OPRIDE'
        .split('')
        .map((prefix) => [prefix, records.filter((r) => r.id.startsWith(prefix)).length]),
    ),
    { O: 34, P: 28, R: 29, I: 21, D: 36, E: 29 },
  );
  assert.equal(records[0].id, 'O01');
  assert.equal(
    records[0].approved,
    'Ownership begins when you stop defending what is yours to change. Tell the truth about your choices, their consequences and the responsibility in front of you. You may not have caused the situation. You still have a next response to own, including asking for the help you need.',
  );
  for (const record of records) assert.ok(!record.approved.includes('\u2014'), record.id);
});

for (const [path, baselineDigest] of Object.entries(fixture.baselineFiles)) {
  test(`Work 35 exact approved fields and all unlisted source preserved: ${path}`, async () => {
    let source = beforeWork37Source(readFileSync(path, 'utf8'), path);
    if (path === 'scripts/purpose-fallback.ts') {
      assert.equal(
        source.split('${p(copy.readingLead)}').length,
        2,
        'P20 is rendered exactly once in the static reading',
      );
      source = source.replace('${p(copy.readingLead)}', '');
    }
    const ast = parseCopy(source);
    const edits = [];
    for (const record of records.filter((r) => r.files.includes(path))) {
      const nodes = record.occurrences
        ? headingNodes(ast, record.approved)
        : [fieldNode(ast, record.field)];
      assert.equal(nodes.length, record.occurrences?.[path] ?? 1, record.id);
      for (const node of nodes) {
        assert.equal(node.value.trim(), record.approved, record.id);
        edits.push({ node, value: record.original });
      }
    }
    const restored = await format(patchLocations(source, edits), {
      ...(await resolveConfig(path)),
      filepath: path,
    });
    assert.equal(
      createHash('sha256').update(restored).digest('hex'),
      baselineDigest,
      'Reversing only approved fields must recover every baseline string, array, position and implementation statement',
    );
  });
}

const escape = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const reading = {
  O: periodFallback(),
  P: periodFallback(),
  R: resilienceReading(),
  I: integrityReading(),
  D: disciplineReading(),
  E: empowermentReading(),
};
// Pair-specific explanations belong to the two interactive selections. The
// complete static reading uses each approved three-pattern interpretation.
const pairEquivalents = {
  D15: 'D13',
  D16: 'D13',
  D19: 'D18',
  D20: 'D18',
  D22: 'D21',
  D23: 'D21',
  D25: 'D24',
  D26: 'D24',
  D32: 'D31',
  D33: 'D31',
};
test('all 177 records have complete static reading coverage or their approved all-pattern equivalent', () => {
  for (const record of records) {
    const equivalent = pairEquivalents[record.id];
    const approved = equivalent
      ? records.find((r) => r.id === equivalent).approved
      : record.approved;
    assert.ok(
      reading[record.id[0]].includes(escape(approved)),
      `${record.id}: ${equivalent ?? 'exact static copy'}`,
    );
  }
  assert.equal(Object.keys(pairEquivalents).length, 10);
});
