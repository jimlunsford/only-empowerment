import { beforeBatch2Source } from './batch2-preservation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  workshopScreens,
  workshopScreenIds,
  workshopStages,
  workshopLocation,
  legacyWorkshopMap,
  workshopById,
  chooseWorkshop,
  eventCarry,
  workshopOrigin,
  workshopBridges,
} from '../src/execution-workshop-content.ts';
import { executionRoute, executionTexts, executionSteps } from '../src/execution-content.ts';
import { executionReading, executionFallback } from '../scripts/execution-reading.ts';
const base = 'd54260c85e94e8391aa51896dd7425693a544766';

test('Work82 screens form a connected, open graph with valid authored branches', () => {
  assert.equal(new Set(workshopScreenIds).size, workshopScreens.length);
  assert.deepEqual(
    workshopStages.map((s) => s.title),
    ['See it demonstrated', 'Take over', 'Handle changed facts', 'Work independently'],
  );
  assert.deepEqual(
    workshopScreens.filter((s) => s.action).map((s) => s.title),
    executionSteps.map((s) => s.title),
  );
  const visited = new Set();
  function visit(id) {
    if (visited.has(id)) return;
    visited.add(id);
    const screen = workshopById(id);
    assert.ok(screen, id);
    for (const next of [
      screen.next,
      screen.back,
      ...(screen.options || []).map((o) => o.next),
    ].filter(Boolean))
      visit(next);
  }
  visit('welcome');
  assert.deepEqual([...visited].sort(), [...workshopScreenIds].sort());
  for (const screen of workshopScreens) {
    assert.ok(screen.facts && screen.purpose && screen.sources.length && screen.baseline.length);
    for (const block of screen.baseline)
      assert.ok(
        executionTexts().some((p) => p.id === block),
        block,
      );
    assert.equal(executionRoute('/execution/' + screen.id), '/execution');
    assert.equal(workshopLocation('/execution/' + screen.id).id, screen.id);
    const options = screen.options || [];
    assert.equal(new Set(options.map((o) => o.id)).size, options.length);
    for (const option of options) assert.ok(option.consequence && option.reasoning);
  }
  assert.equal(workshopById('take-over').options.find((o) => o.id === 'gather').next, 'arrange');
  assert.equal(workshopById('take-over').options.find((o) => o.id === 'shelf').next, 'recover');
  assert.equal(workshopById('take-over').options.find((o) => o.id === 'prepare').next, 'recover');
  assert.doesNotMatch(JSON.stringify(workshopScreens), /\u2014|Correct!|TODO|TBD/);
});

test('Work82 independent decisions retain each complete path and invalidate changed dependencies', () => {
  for (const a of workshopById('event').options)
    for (const b of workshopById('event-wait').options)
      for (const c of workshopById('event-close').options) {
        let state = chooseWorkshop({}, 'event', a.id);
        state = chooseWorkshop(state, 'event-wait', b.id);
        state = chooseWorkshop(state, 'event-close', c.id);
        assert.deepEqual(state, { event: a.id, 'event-wait': b.id, 'event-close': c.id });
        assert.deepEqual(chooseWorkshop(state, 'event', a.id), state);
        const different = workshopById('event').options.find((o) => o.id !== a.id).id;
        assert.deepEqual(chooseWorkshop(state, 'event', different), { event: different });
        const changedMiddle = chooseWorkshop(
          state,
          'event-wait',
          workshopById('event-wait').options.find((o) => o.id !== b.id).id,
        );
        assert.equal(changedMiddle.event, a.id);
        assert.equal(changedMiddle['event-close'], undefined);
        assert.equal(chooseWorkshop(state, 'event', 'untrusted'), state);
        assert.equal(chooseWorkshop(state, 'invalid', 'untrusted'), state);
      }
  assert.equal(
    new Set(['request', 'polish', 'announce', ''].map((event) => eventCarry({ event }))).size,
    4,
  );
});

test('Work82 every option, demonstration and continuation is available without JavaScript', () => {
  for (const html of [executionReading(), executionFallback()]) {
    const text = html
      .replace(/<[^>]*>/g, '')
      .replaceAll('&#39;', "'")
      .replaceAll('&amp;', '&')
      .replaceAll('&quot;', '"');
    for (const s of workshopScreens) {
      for (const value of [
        s.title,
        s.facts,
        s.purpose,
        ...s.teaching,
        s.explanation,
        ...(s.action ? [s.action.result, s.action.remains] : []),
        ...(s.options || []).flatMap((o) => [o.label, o.consequence, o.reasoning]),
      ].filter(Boolean))
        assert.ok(text.includes(value), s.id + ': ' + value);
    }
    for (const value of [workshopOrigin, ...Object.values(workshopBridges)])
      assert.ok(text.includes(value));
    assert.doesNotMatch(html, /<script|<input|<textarea|<form/);
  }
  for (const [legacy, id] of Object.entries(legacyWorkshopMap)) {
    assert.equal(executionRoute('/execution?section=' + legacy), '/execution');
    assert.equal(workshopLocation('/execution?section=' + legacy).id, id);
    assert.ok(executionReading().includes('id="' + legacy + '"'));
  }
  for (const malformed of [
    '/execution/../event',
    '/execution/event?answer=request',
    '/execution/event/',
    '/execution/EVENT',
    '/execution/unknown',
  ])
    assert.equal(executionRoute(malformed), null);
});

test('Work82 preserves all accepted teaching and limits shared wording to the declared constants', () => {
  const path = 'src/execution-content.ts';
  const old = execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' });
  const current = beforeBatch2Source(readFileSync(path, 'utf8'), path);
  const teaching = (s) =>
    s.slice(
      s.indexOf('export const executionSections:'),
      s.indexOf('export const executionTargetIds'),
    );
  assert.equal(teaching(current), teaching(old));
  for (const path of [
    'src/use-route.ts',
    'src/main.tsx',
    'src/Rebuild.tsx',
    'src/Loop.tsx',
    'src/LoopPractice.tsx',
    'src/loop-content.ts',
    'src/loop-view.ts',
    'src/PeriodStandard.tsx',
    'src/components/work.tsx',
    'package.json',
    'package-lock.json',
    '.github/workflows/ci.yml',
    'scripts/public-boundary.ts',
  ]) {
    const original = execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' });
    // Accept only the approved CI timeout change; preserve every other workflow byte.
    const expected =
      path === '.github/workflows/ci.yml'
        ? original.replace('\n    timeout-minutes: 35\n', '\n    timeout-minutes: 50\n')
        : original;
    assert.equal(beforeBatch2Source(readFileSync(path, 'utf8'), path), expected, path);
  }
});

test('Work82 interaction uses no persistence, submission, timers or personal fields', () => {
  for (const path of ['src/Execution.tsx', 'src/execution-workshop-content.ts']) {
    assert.doesNotMatch(
      readFileSync(path, 'utf8'),
      /localStorage|sessionStorage|indexedDB|document\.cookie|serviceWorker|fetch\(|XMLHttpRequest|sendBeacon|setTimeout|setInterval|<input|<textarea|<form|dangerouslySetInnerHTML/,
    );
  }
});
