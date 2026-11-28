import { withoutReadingNavigation } from './reading-navigation-contract.mjs';
import { beforeBatch3Source } from './batch3-preservation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { beforeWork73Source, beforeWork73Reading } from './work73-preservation.mjs';
import changes from './fixtures/work73-changes.json' with { type: 'json' };
import editorial from './fixtures/work73-editorial.json' with { type: 'json' };
import { initialLoopSelection, chooseLoopOutcome, previousLoopChoice } from '../src/loop-state.ts';
import { loopScenario } from '../src/loop-practice-content.ts';
import { loopTransfer, loopSections } from '../src/loop-content.ts';
import { loopReading, loopFallback, escapeLoop } from '../scripts/loop-reading.ts';
import { integrityContent } from '../src/period-integrity-content.ts';
import { purposeConnected } from '../src/period-purpose-content.ts';
import { periodFallback } from '../scripts/period-fallback.ts';
import { frameworkOrientation } from '../src/framework-home-content.ts';
const baseline = '4d3a497faa8fa0ae7e39e30b1a7c0e083f5a616f';
const original = (path) =>
  execFileSync('git', ['show', baseline + ':' + path], { encoding: 'utf8' });

test('Work73 changes reverse byte-for-byte to Work72 and reject incidental mutations', () => {
  for (const path of Object.keys(changes)) {
    const source = beforeBatch3Source(readFileSync(path, 'utf8'), path);
    assert.equal(beforeWork73Source(source, path), original(path), path);
    assert.throws(
      () => beforeWork73Source(source + '\n', path),
      /Unexpected (?:Work(?:73|80)|Batch[123]) bytes/,
    );
  }
});
test('only the two exact editorial replacements change accepted PERIOD content', () => {
  for (const edit of editorial) {
    const source = beforeBatch3Source(readFileSync(edit.path, 'utf8'), edit.path);
    assert.equal(source.split(edit.after).length, 2);
    assert.equal(source.replace(edit.after, edit.before), original(edit.path));
  }
  assert.equal(
    integrityContent.lesson.find((x) => x.id === 'L09').paragraphs[0],
    editorial[0].after,
  );
  assert.equal(purposeConnected, editorial[1].after);
  assert.equal(
    integrityContent.card,
    'If you want a reminder, name one honest behavior on an optional Standard Card and copy or print it. Keep it where you can return to it before a promise or a correction. The card cannot make your conduct truthful. What you do next can.',
  );
  assert.ok(beforeWork73Reading(periodFallback()));
});
test('Work72 restart, 13 states, 35 transitions and all other accepted teaching stay unchanged', () => {
  const paths = execFileSync('git', ['ls-tree', '-r', '--name-only', baseline], {
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter((p) => /^src\/.*content\.ts$/.test(p) || p.startsWith('docs/work53-source/'));
  for (const path of paths) {
    assert.equal(beforeWork73Source(readFileSync(path, 'utf8'), path), original(path), path);
  }
  assert.equal(Object.keys(loopScenario.states).length, 13);
  assert.equal(
    Object.values(loopScenario.states).reduce((n, s) => n + s.options.length, 0),
    35,
  );
});
test('Previous choice retraces every authored edge from its actual origin', () => {
  for (const [id, state] of Object.entries(loopScenario.states))
    for (const [option, edge] of state.options.entries()) {
      const start = initialLoopSelection(id);
      const next = chooseLoopOutcome(start, option);
      assert.equal(next.state, edge.next);
      assert.deepEqual(next.history, [id]);
      assert.equal(previousLoopChoice(next).state, id);
      assert.deepEqual(previousLoopChoice(next).history, []);
      assert.deepEqual(start, initialLoopSelection(id));
    }
});
test('repeated backward steps discard future branches and can retrace cycles', () => {
  let s = initialLoopSelection('pressure');
  const visited = ['pressure'];
  for (let i = 0; i < 25; i++) {
    s = chooseLoopOutcome(s, 0);
    visited.push(s.state);
  }
  for (let i = 0; i < 8; i++) {
    visited.pop();
    s = previousLoopChoice(s);
    assert.equal(s.state, visited.at(-1));
  }
  const alternative = loopScenario.states[s.state].options.length - 1;
  s = chooseLoopOutcome(s, alternative);
  assert.deepEqual(s.history, visited);
  s = previousLoopChoice(s);
  for (let i = visited.length - 2; i >= 0; i--) {
    s = previousLoopChoice(s);
    assert.equal(s.state, visited[i]);
  }
  assert.deepEqual(s.history, []);
  assert.equal(previousLoopChoice(s), s);
});
test('ordinary and miss entries start with no choice history and invalid choices do nothing', () => {
  for (const id of ['pressure', 'miss']) {
    const s = initialLoopSelection(id);
    assert.equal(previousLoopChoice(s), s);
    assert.equal(chooseLoopOutcome(s, 99), s);
    assert.deepEqual(s.history, []);
  }
});
test('exact combined orientation carries the founder-approved optional order', () => {
  assert.equal(frameworkOrientation.heading, 'Where to start');
  assert.equal(
    frameworkOrientation.relationship,
    'The PERIOD Code establishes the values and standards you choose to live by. How to Rebuild Yourself teaches how to turn those standards into structure and action. The Discipline Loop explains how repeated action creates proof, builds self-trust, and keeps the work going through setbacks and correction. Pure Execution Mode teaches how to carry a sound responsibility through hesitation into appropriate action, adjust when the facts change, and follow through honestly.',
  );
  assert.equal(
    frameworkOrientation.choice,
    "Start where you need to. You don't have to complete one framework to benefit from another.",
  );
});
test('transfer wording is exact, optional, fictional and included after the four closing questions', () => {
  assert.equal(loopTransfer.heading, 'Apply the Loop somewhere else');
  assert.equal(
    loopTransfer.scenario,
    'A coworker is waiting for an update you promised. The task is unfinished. You can send an honest update now, or wait until the result looks better.',
  );
  assert.equal(
    loopTransfer.reflection,
    'Identify the pressure, the standard and the action that would create real evidence. Then consider what changes if communication is unavailable.',
  );
  const closing = loopSections.find((s) => s.id === 'reflection');
  assert.equal(closing.blocks.filter((b) => b.text.endsWith('?')).length, 4);
  for (const html of [loopReading(), loopFallback()]) {
    for (const text of Object.values(loopTransfer)) assert.ok(html.includes(escapeLoop(text)));
    assert.ok(html.indexOf(loopTransfer.heading) > html.indexOf('What will I do if I miss?'));
    assert.match(html, /Optional reflection.*fictional situation/);
    assert.doesNotMatch(withoutReadingNavigation(html), /<form|<input|<textarea|<script/);
  }
});
