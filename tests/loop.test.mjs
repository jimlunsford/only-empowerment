import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { loopScenario } from '../src/loop-practice-content.ts';
import { loopRoute, nextLoopState } from '../src/loop-state.ts';
import { loopSections, loopSectionIds, loopStages } from '../src/loop-content.ts';
import { loopReading, loopFallback, escapeLoop } from '../scripts/loop-reading.ts';
import preserved from '../docs/work70/preservation.json' with { type: 'json' };

test('Work69 authored graph retains all 13 states, 35 labeled edges and full reachability', () => {
  const seen = new Set(),
    queue = ['pressure'];
  assert.equal(Object.keys(loopScenario.states).length, 13);
  assert.equal(
    Object.values(loopScenario.states).reduce((n, s) => n + s.options.length, 0),
    35,
  );
  assert.deepEqual(
    Object.fromEntries(Object.entries(loopScenario.states).map(([k, v]) => [k, v.options])),
    preserved.scenario_graph,
  );
  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    for (const [i, o] of loopScenario.states[id].options.entries()) {
      assert.equal(nextLoopState(id, i), o.next);
      queue.push(o.next);
    }
  }
  assert.equal(seen.size, 13);
  for (const id of seen) assert.equal(nextLoopState(id, 99), id);
});
test('Loop accepts only its sixteen public sections and one authored miss entry', () => {
  assert.equal(loopSectionIds.length, 16);
  for (const id of loopSectionIds) assert.equal(loopRoute('/loop?section=' + id), '/loop');
  for (const s of ['/loop', '/loop/practice', '/loop/practice?state=miss'])
    assert.equal(loopRoute(s), s);
  for (const s of [
    '/loop?section=unknown',
    '/loop/practice?state=proof',
    '/loop/practice?state=miss&answer=x',
    '/loop?section=source&state=miss',
    '/looping',
    '/loop/practice/',
  ])
    assert.equal(loopRoute(s), null);
});
test('complete teaching, all five links, care, breaks and every scenario field reach native and root readings', () => {
  const native = loopReading(),
    root = loopFallback(),
    practice = loopReading(undefined, true, true);
  for (const section of loopSections)
    for (const block of section.blocks) {
      const strings = block.kind === 'comparison' ? block.rows.flat() : [block.text];
      for (const text of strings) {
        assert.ok(native.includes(escapeLoop(text)));
        assert.ok(root.includes(escapeLoop(text)));
      }
    }
  for (const state of Object.values(loopScenario.states))
    for (const text of [
      state.heading,
      ...state.body,
      ...(state.loop || []).flatMap((x) => [x.stage, x.text]),
      ...state.options.map((x) => x.label),
    ])
      for (const html of [native, root, practice]) assert.ok(html.includes(escapeLoop(text)), text);
  assert.deepEqual(
    loopSections
      .find((x) => x.id === 'five-parts')
      .blocks.filter((b) => b.kind === 'heading')
      .map((b) => b.text),
    [...loopStages],
  );
  assert.equal(
    loopSections.find((x) => x.id === 'breaks').blocks.filter((b) => b.kind === 'heading').length,
    5,
  );
  assert.match(native, /Treatment, counseling, meetings, peers, family and medical help/);
  assert.match(native, /unsafe exhaustion/);
  assert.doesNotMatch(native, /<script|<form|<input|<textarea|onclick=/i);
  assert.doesNotMatch(practice, /<script|<form|<input|<textarea|onclick=/i);
});
test('scoped Loop implementation adds no storage, request, visitor input or HTML injection API', () => {
  for (const path of [
    'src/Loop.tsx',
    'src/LoopPractice.tsx',
    'src/loop-state.ts',
    'src/loop-view.ts',
  ])
    assert.doesNotMatch(
      readFileSync(path, 'utf8'),
      /localStorage|sessionStorage|indexedDB|document\.cookie|serviceWorker|fetch\(|XMLHttpRequest|sendBeacon|dangerouslySetInnerHTML|innerHTML|eval\(/,
    );
  assert.doesNotMatch(JSON.stringify(loopSections) + JSON.stringify(loopScenario), /\u2014/);
});
test('every previously accepted teaching source and dependency/build-security control remains byte-identical', () => {
  const base = 'f53820986eed85f9176bf5fc14926497fe83dc8d';
  const paths = execFileSync('git', ['ls-tree', '-r', '--name-only', base], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(
      (p) =>
        /^src\/(period-.*content|period-content|rebuild-content)\.ts$/.test(p) ||
        /^docs\/work53-source\//.test(p) ||
        [
          'src/PeriodLearning.tsx',
          'src/Discipline.tsx',
          'src/Purpose.tsx',
          'src/Resilience.tsx',
          'src/Integrity.tsx',
          'src/Empowerment.tsx',
          'src/PeriodStandard.tsx',
          'src/PracticeOwnership.tsx',
          'package.json',
          'package-lock.json',
          '.github/workflows/ci.yml',
          'scripts/public-boundary.ts',
          'scripts/rebuild-fallback.ts',
        ].includes(p),
    );
  assert.ok(paths.length > 25);
  for (const path of paths)
    assert.deepEqual(readFileSync(path), execFileSync('git', ['show', base + ':' + path]), path);
  const rebuild = readFileSync('src/Rebuild.tsx', 'utf8').split('export function RebuildGuide')[1];
  assert.equal(
    rebuild,
    execFileSync('git', ['show', base + ':src/Rebuild.tsx'], { encoding: 'utf8' }).split(
      'export function RebuildGuide',
    )[1],
  );
});
