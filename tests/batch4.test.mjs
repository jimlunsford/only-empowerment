import { beforeBatch6Source } from './batch6-preservation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import changes from './fixtures/batch4-changes.json' with { type: 'json' };
import { beforeBatch4Source } from './batch4-preservation.mjs';
import {
  initialLoopSelection,
  chooseLoopOutcome,
  previousLoopChoice,
  loopBreakFor,
} from '../src/loop-state.ts';
import { loopScenario, loopRestartPaths } from '../src/loop-practice-content.ts';
import { loopReading } from '../scripts/loop-reading.ts';
import { disciplineReading } from '../scripts/discipline-reading.ts';
import { disciplineContent } from '../src/period-discipline-content.ts';
import { privacyReading } from '../scripts/privacy-reading.ts';
const sha = (text) => createHash('sha256').update(text).digest('hex');
const base = '50386905b9781eed86ba82177e569e432a7217fb';

test('Batch 4 pins every changed source and reverses only the approved bytes', () => {
  assert.deepEqual(
    Object.keys(changes).sort(),
    [
      'index.html',
      'scripts/privacy-reading.ts',
      'src/Execution.tsx',
      'src/LegacyDataRemoval.tsx',
      'src/LoopPractice.tsx',
      'src/PeriodLearning.tsx',
      'src/loop-practice-content.ts',
      'src/loop-state.ts',
      'src/loop-view.ts',
      'src/main.tsx',
      'src/period-discipline-content.ts',
    ].sort(),
  );
  for (const [path, change] of Object.entries(changes)) {
    const source = beforeBatch6Source(readFileSync(path, 'utf8'), path);
    const original = execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' });
    assert.equal(sha(source), change.afterSha256, path);
    assert.equal(beforeBatch4Source(source, path), original, path);
    for (const altered of [
      source + '\n',
      source.slice(0, change.edits[0].start) + 'x' + source.slice(change.edits[0].start + 1),
    ])
      assert.notEqual(
        beforeBatch4Source(altered, path),
        original,
        'Unapproved bytes cannot reverse: ' + path,
      );
  }
});

test('Loop correction identifies every chosen entrance and follows Previous choice without stale causes', () => {
  const routes = {
    miss: [2, 0],
    overbuilt: [1, 2, 0],
    spiral: [2, 1, 0],
    hide: [2, 2, 0],
    rest_escape: [3, 2, 1],
  };
  for (const [expected, choices] of Object.entries(routes)) {
    let selection = initialLoopSelection('pressure');
    for (const option of choices) selection = chooseLoopOutcome(selection, option);
    assert.equal(selection.state, 'restart');
    assert.equal(loopBreakFor(selection), expected);
    selection = previousLoopChoice(selection);
    assert.equal(loopBreakFor(selection), undefined);
    selection = chooseLoopOutcome(selection, choices.at(-1));
    assert.equal(loopBreakFor(selection), expected);
    assert.equal(loopBreakFor(initialLoopSelection('pressure')), undefined);
  }
  const direct = chooseLoopOutcome(initialLoopSelection('miss'), 0);
  assert.equal(loopBreakFor(direct), undefined, 'Public entry must not invent a chosen path');
  assert.equal(loopBreakFor(initialLoopSelection('restart')), undefined);
});

test('Both static Loop editions contain the complete fallback and each specific break and correction', () => {
  for (const html of [loopReading(), loopReading(undefined, true, true)]) {
    for (const text of loopScenario.states.restart.body) assert.ok(html.includes(text));
    for (const path of Object.values(loopRestartPaths))
      for (const text of Object.values(path)) assert.ok(html.includes(text));
  }
});

test('Discipline and Privacy static editions retain the revised visible copy and safe deletion framing', () => {
  assert.equal(disciplineContent.lesson.title, 'Discipline.');
  assert.ok(disciplineReading().includes('<h1 id="lesson">Discipline.</h1>'));
  assert.ok(disciplineReading().includes(disciplineContent.lesson.deck));
  const privacy = privacyReading();
  assert.ok(
    privacy.indexOf('No accounts. No tracking') < privacy.indexOf('Your reading and practice'),
  );
  assert.ok(
    privacy.indexOf('Requests and tracking') < privacy.indexOf('Records from the retired tools'),
  );
  assert.ok(privacy.includes('Confirm deletion of legacy data'));
  assert.ok(privacy.includes('Cancel is focused first'));
  assert.ok(privacy.includes('hosting logs'));
  assert.ok(!privacy.includes('<script'));
});
