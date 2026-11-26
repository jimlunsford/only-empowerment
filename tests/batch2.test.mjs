import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import changes from './fixtures/batch2-changes.json' with { type: 'json' };
import { beforeBatch2Source } from './batch2-preservation.mjs';
import { homepageFallback } from '../scripts/homepage-fallback.ts';
import { homepage } from '../src/period-homepage-content.ts';
import { frameworkChoices } from '../src/framework-navigation.ts';
import { frameworkBridges } from '../scripts/framework-links.ts';
import { readingIndex } from '../scripts/standalone-reading.ts';
import { loopReading } from '../scripts/loop-reading.ts';
import { executionReading } from '../scripts/execution-reading.ts';

const base = 'a1238d96f5648426009e2f9ca51139b2f3acb5b0';
const sha = (s) => createHash('sha256').update(s).digest('hex');
test('Batch 2 reverses exactly to Batch 1 and rejects edits inside and outside the declared changes', () => {
  assert.deepEqual(
    Object.keys(changes).sort(),
    [
      'index.html',
      'scripts/empowerment-reading.ts',
      'scripts/execution-reading.ts',
      'scripts/homepage-fallback.ts',
      'scripts/loop-reading.ts',
      'scripts/rebuild-fallback.ts',
      'scripts/site-footer.ts',
      'scripts/standalone-reading.ts',
      'src/Empowerment.tsx',
      'src/PeriodHomepage.tsx',
      'src/Rebuild.tsx',
      'src/loop-view.ts',
      'src/main.tsx',
      'src/navigation.css',
      'src/period-homepage-content.ts',
      'src/rebuild-app.css',
      'vite.config.ts',
    ].sort(),
  );
  for (const [path, change] of Object.entries(changes)) {
    const source = readFileSync(path, 'utf8');
    assert.equal(sha(source), change.afterSha256, path);
    assert.equal(
      beforeBatch2Source(source, path),
      execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' }),
      path,
    );
    assert.throws(() => beforeBatch2Source(source + '\n', path), /Unexpected Batch2 bytes/);
    const start = change.edits[0].start;
    assert.throws(
      () => beforeBatch2Source(source.slice(0, start) + 'x' + source.slice(start + 1), path),
      /Unexpected Batch2 bytes/,
    );
  }
});
test('reading copy, sibling bridges and four-framework navigation stay script independent', () => {
  const root = homepageFallback();
  assert.ok(root.includes(homepage.lead));
  assert.ok(root.indexOf(homepage.acronym) < root.indexOf(homepage.order));
  for (const current of ['period', 'rebuild', 'loop']) {
    const bridge = frameworkBridges(current);
    for (const item of frameworkChoices.filter((item) => item.id !== current))
      assert.ok(bridge.includes(`href="${item.reading}"`));
  }
  const index = readingIndex();
  for (const part of [
    index.match(/<header class="site-header">([\s\S]*?)<\/header>/)[1],
    index.match(/<footer([\s\S]*?)<\/footer>/)[1],
  ]) {
    for (const item of frameworkChoices)
      assert.ok(part.includes(`href="${item.reading}">${item.title}</a>`));
  }
  for (const html of [index, loopReading(), executionReading()]) {
    assert.doesNotMatch(html, /<script|\sonclick=|<input|<textarea|<form/);
    const body = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, '');
    assert.doesNotMatch(
      body,
      /<details/,
      'Only navigation collapses; static teaching remains visible',
    );
  }
  const loop = loopReading();
  for (const item of frameworkChoices.filter((item) => item.id !== 'loop'))
    assert.ok(loop.includes(`href="${item.reading}">${item.title}</a>`));
});
