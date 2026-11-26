import { beforeBatch4Source } from './batch4-preservation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import changes from './fixtures/batch3-changes.json' with { type: 'json' };
import { beforeBatch3Source } from './batch3-preservation.mjs';
import { workshopById, workshopScreens, eventCarry } from '../src/execution-workshop-content.ts';
import { executionSteps, executionTexts } from '../src/execution-content.ts';
import { executionReading } from '../scripts/execution-reading.ts';
import { rebuildTrees } from '../src/rebuild-content.ts';
import { rebuildReading } from '../scripts/standalone-reading.ts';
import { disciplineReading } from '../scripts/discipline-reading.ts';
import { loopReading } from '../scripts/loop-reading.ts';
import { practiceCopy } from '../src/period-practice-content.ts';
const base = '75d30695455ac512a3862bd43e7d674476b089b7';
const sha = (s) => createHash('sha256').update(s).digest('hex');
const text = (s) =>
  s
    .replace(/<[^>]*>/g, '')
    .replaceAll('&amp;', '&')
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"');

test('Batch 3 exact source edits reverse to the requested main and reject undeclared changes', () => {
  for (const [path, change] of Object.entries(changes)) {
    const source = beforeBatch4Source(readFileSync(path, 'utf8'), path);
    assert.equal(sha(source), change.afterSha256, path);
    assert.equal(
      beforeBatch3Source(source, path),
      execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' }),
      path,
    );
    assert.throws(() => beforeBatch3Source(source + '\n', path), /Unexpected Batch3 bytes/);
    const start = change.edits[0].start;
    assert.throws(
      () => beforeBatch3Source(source.slice(0, start) + 'x' + source.slice(start + 1), path),
      /Unexpected Batch3 bytes/,
    );
  }
});
test('Stage 4 alternatives vary strongest-answer position and preserve honest reconnection', () => {
  const ids = ['event', 'event-wait', 'event-close'];
  assert.deepEqual(
    ids.map((id, i) =>
      workshopById(id).options.findIndex((o) => o.id === ['request', 'follow-up', 'verify'][i]),
    ),
    [1, 2, 0],
  );
  assert.match(
    workshopById('event-close').facts,
    /assume the organizer was contacted.*Wait for access before involving the organizer.*not work performed by your earlier choice/,
  );
  assert.match(
    eventCarry({ event: 'announce' }),
    /owner received an access request.*organizer has not received a notice request/,
  );
  assert.doesNotMatch(workshopById('access').facts, /not to leave anything outside/);
  assert.doesNotMatch(workshopById('capacity').facts, /would be unsafe/);
  assert.match(workshopById('capacity').facts, /above shoulder height.*tilt toward you/);
  const reading = text(executionReading());
  for (const id of ids) {
    const screen = workshopById(id);
    assert.ok(reading.includes(screen.facts));
    for (const option of screen.options)
      for (const value of [option.label, option.consequence, option.reasoning])
        assert.ok(reading.includes(value));
  }
});
test('Rebuild order links to teaching for each movement, including four corresponding Loop sections', () => {
  const links = [];
  const walk = (nodes) =>
    nodes.forEach((node) => {
      if (typeof node === 'string') return;
      if (node.tag === 'a') links.push(node);
      walk(node.children);
    });
  walk(rebuildTrees.index);
  const flatten = (nodes) =>
    nodes.map((n) => (typeof n === 'string' ? n : flatten(n.children))).join('');
  const movements = [
    ['Raise the standard.', '#/rebuild/line'],
    ['Build the structure.', '#/rebuild/structure'],
    ['Repeat the action.', '#/rebuild/structure'],
    ['Produce the proof.', '#/loop?section=part-2'],
    ['Rebuild self-trust.', '#/loop?section=part-3'],
    ['Stabilize identity.', '#/loop?section=part-4'],
    ['Reduce negotiation.', '#/loop?section=part-5'],
    ['Own the life.', '#/rebuild/help'],
  ];
  for (const [label, href] of movements)
    assert.equal(links.find((a) => flatten(a.children).startsWith(label))?.attrs.href, href);
  const reading = rebuildReading();
  for (const part of [2, 3, 4, 5])
    assert.ok(reading.includes('href="/read/loop.html#part-' + part + '"'));
  assert.match(reading, /Steps 4 to 7 are the Discipline Loop at work/);
  assert.ok(reading.includes('href="/read/execution.html#miss"'));
  assert.ok(reading.includes('href="/read/execution.html#negotiation"'));
  assert.doesNotMatch(loopReading(), /not a second rebuilding sequence/);
  assert.ok(loopReading().includes('href="/read/rebuild.html#return"'));
  assert.ok(loopReading().includes('href="/read/rebuild.html#negotiation"'));
});
test('Rae keeps the same contact and consent, workshop transfer includes repair and evening study', () => {
  const reading = text(rebuildReading());
  assert.match(reading, /Sister: contacts the trusted friend with Rae’s permission/);
  assert.match(reading, /Friend: agrees with Rae on an accessible way to stay in contact/);
  assert.match(reading, /Nobody has to manufacture a task to prove Rae deserves assistance/);
  assert.doesNotMatch(reading, /contacts the office/);
  assert.equal((reading.match(/fictional/gi) ?? []).length, 1);
  assert.equal((text(disciplineReading()).match(/fictional/gi) ?? []).length, 1);
  const extension = workshopById('your-responsibility').teaching.join(' ');
  assert.match(extension, /evening course.*ask a specific question/);
  assert.match(extension, /apology is not the practical repair.*cannot command forgiveness/);
  assert.match(extension, /illness or access.*support you need/);
  assert.match(text(executionReading()), /evening course.*ask a specific question/);
  assert.deepEqual(
    workshopScreens.filter((s) => s.action).map((s) => s.title),
    executionSteps.map((s) => s.title),
  );
  assert.match(
    executionTexts().find((p) => p.id === 'why-origin').text,
    /^I developed this method/,
  );
  assert.match(
    practiceCopy.empowermentLimit,
    /is Ownership:.*Empowerment is the contribution you offer them/,
  );
});
