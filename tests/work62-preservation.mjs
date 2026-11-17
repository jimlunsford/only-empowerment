import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fieldNode, parseCopy } from './editorial-copy-helpers.mjs';
import historical from './fixtures/work35-editorial.json' with { type: 'json' };
import approved from './fixtures/work62-approved.json' with { type: 'json' };

export const work62Base = '9e376de9b1fb9366aa663869828730ac2b4f6491';

// Reconstruct the older source only after checking the exact string at each
// approved field and proving every byte outside those literal ranges survived.
export function beforeWork62PeriodSource(source, path) {
  const records = historical.records.filter(
    (r) => r.files.includes(path) && Object.hasOwn(approved.period, r.id),
  );
  if (!records.length) return source;
  const original = execFileSync('git', ['show', work62Base + ':' + path], { encoding: 'utf8' });
  const before = parseCopy(original);
  const after = parseCopy(source);
  const edits = records.map((record) => {
    const old = fieldNode(before, record.field);
    const current = fieldNode(after, record.field);
    assert.equal(old.value, record.approved, record.field);
    assert.equal(current.value, approved.period[record.id], record.field);
    return { range: current.range, original: original.slice(...old.range) };
  });
  for (const edit of edits.sort((a, b) => b.range[0] - a.range[0]))
    source = source.slice(0, edit.range[0]) + edit.original + source.slice(edit.range[1]);
  assert.equal(source, original, path + ': unexpected change outside the approved fields');
  return source;
}

export function beforeWork62RootReading(html) {
  const replacement = '<p>' + approved.period.O15 + '</p>';
  assert.equal(html.split(replacement).length, 2, 'One complete Ownership response');
  const old = historical.records.find((r) => r.id === 'O15').approved;
  return html.replace(replacement, '<p>' + old + '</p>');
}
