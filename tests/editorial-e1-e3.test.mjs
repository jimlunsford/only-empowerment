import { assertApprovedCiWorkflow } from './ci-workflow-preservation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { stripTypeScriptTypes } from 'node:module';
import changes from './fixtures/editorial-e1-e3-changes.json' with { type: 'json' };
import { beforeEditorialSource, beforeEditorialReading } from './editorial-e1-e3-preservation.mjs';
import { workshopScreens, workshopById } from '../src/execution-workshop-content.ts';
import { executionReading } from '../scripts/execution-reading.ts';
import { loopReading } from '../scripts/loop-reading.ts';
const base = '9ffca83d6f1629b4b56d6dfdf814bcafa242e239';
const original = (path) =>
  execFileSync('git', ['show', base + ':' + path], {
    encoding: 'utf8',
    maxBuffer: 5 * 1024 * 1024,
  });

test('E1-E3 accepts only six pinned source edits and rejects unknown changes', () => {
  assert.deepEqual(Object.keys(changes).sort(), [
    'src/Execution.tsx',
    'src/PracticeOwnership.tsx',
    'src/Resilience.tsx',
    'src/execution-view.ts',
    'src/execution-workshop-content.ts',
    'src/loop-content.ts',
  ]);
  const paths = execFileSync(
    'git',
    [
      'ls-tree',
      '-r',
      '--name-only',
      base,
      'src',
      'scripts',
      'public',
      'ops',
      '.github',
      'docs/work53-source',
      'index.html',
      'vite.config.ts',
      'package.json',
      'package-lock.json',
    ],
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n');
  for (const path of paths) {
    if (path === '.github/workflows/ci.yml') {
      assertApprovedCiWorkflow(readFileSync(path, 'utf8'));
      continue;
    }
    const source = readFileSync(path, 'utf8');
    assert.equal(beforeEditorialSource(source, path), original(path), path);
    if (changes[path]) {
      assert.doesNotMatch(source, /\u2014/, path);
      for (const mutated of [source + '\n', source.slice(1)])
        assert.equal(
          beforeEditorialSource(mutated, path),
          mutated,
          path + ': unknown bytes remain visible',
        );
    }
  }
});

test('E1 adds a foundation before Stage 1 while preserving every decision branch and Stage 4', async () => {
  const oldModule = stripTypeScriptTypes(original('src/execution-workshop-content.ts'));
  const old = await import(
    'data:text/javascript;base64,' + Buffer.from(oldModule).toString('base64')
  );
  assert.equal(workshopById('welcome').next, 'foundation');
  assert.equal(workshopById('foundation').back, 'welcome');
  assert.equal(workshopById('foundation').next, 'identify');
  assert.equal(workshopById('foundation').stage, 0);
  assert.equal(workshopById('identify').back, 'foundation');
  assert.equal(workshopScreens.length, old.workshopScreens.length + 1);
  for (const previous of old.workshopScreens) {
    const current = workshopById(previous.id);
    assert.equal(current.stage, previous.stage);
    if (previous.id !== 'welcome') assert.equal(current.next, previous.next);
    if (previous.id !== 'identify') assert.equal(current.back, previous.back);
    assert.deepEqual(current.action, previous.action);
    assert.deepEqual(
      current.options?.map(({ id, next }) => ({ id, next })),
      previous.options?.map(({ id, next }) => ({ id, next })),
    );
    if (previous.stage === 4) assert.deepEqual(current, previous);
  }
  assert.equal(
    old.chooseWorkshop.toString(),
    (await import('../src/execution-workshop-content.ts')).chooseWorkshop.toString(),
  );
});

test('E2 jump links name unique focusable headings and complete reading remains ungated', () => {
  const html = executionReading();
  const nav = html.match(/<nav[^>]+aria-label="Reading sections"[^>]*>(.*?)<\/nav>/)?.[1];
  assert.ok(nav);
  assert.deepEqual(
    [...nav.matchAll(/href="#([^"]+)"[^>]*>([^<]+)<\/a>/g)].map((m) => m.slice(1)),
    [
      ['why', 'Explanation'],
      ['workshop-outcomes', 'Workshop outcomes'],
    ],
  );
  for (const id of ['why', 'workshop-outcomes']) {
    assert.equal([...html.matchAll(new RegExp('id="' + id + '"', 'g'))].length, 1);
    assert.match(html, new RegExp('<h2 id="' + id + '" tabindex="-1"'));
  }
  assert.doesNotMatch(
    html.slice(html.indexOf('<main'), html.indexOf('</main>')),
    /<details|<summary|<button|<input|<textarea|<select/,
  );
  for (const current of [html, loopReading()]) {
    assert.notEqual(beforeEditorialReading(current), current);
    assert.equal(beforeEditorialReading(current + '\n'), current + '\n');
  }
});
