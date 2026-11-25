import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  executionSections,
  executionSteps,
  executionTargetIds,
  executionTexts,
  executionRoute,
  executionHomeCopy,
  executionPrivacyCopy,
} from '../src/execution-content.ts';
import { executionTeaching } from '../src/execution-view.ts';
import {
  executionReading,
  executionFallback,
  renderExecutionHtml,
} from '../scripts/execution-reading.ts';
import { frameworkOrientation } from '../src/framework-home-content.ts';
import { footerEducation } from '../src/site-footer-content.ts';
import { loopSections } from '../src/loop-content.ts';
import { loopTeaching } from '../src/loop-view.ts';
import { loopReading, loopFallback } from '../scripts/loop-reading.ts';
import { privacyReading } from '../scripts/privacy-reading.ts';
import { readingIndex } from '../scripts/standalone-reading.ts';
import { beforeWork80Source } from './work80-preservation.mjs';
import changes from './fixtures/work80-integration.json' with { type: 'json' };

const base = '2a4ee36378b50751469dafa4dba3ac1385321b11';
const sha = (s) => createHash('sha256').update(s).digest('hex');
const text = (node) => (typeof node === 'string' ? node : node.children.map(text).join(''));
const walk = (node, fn) => {
  if (typeof node === 'string') return;
  fn(node);
  node.children.forEach((child) => walk(child, fn));
};
const nodes = (tree, predicate) => {
  const result = [];
  walk(tree, (n) => {
    if (predicate(n)) result.push(n);
  });
  return result;
};

test('all approved sections and exact step names exist, with progressively reduced guidance', () => {
  assert.deepEqual(
    executionSections.map((s) => s.id),
    ['why', 'hesitation', 'method', 'continue', 'change', 'miss', 'daily', 'transfer', 'reference'],
  );
  assert.deepEqual(
    executionSteps.map((s) => s.title),
    [
      'Identify the Next Move',
      'Eliminate Negotiation',
      'Flip the Switch',
      'Stack the Wins',
      'Repeat Daily',
    ],
  );
  assert.deepEqual(
    executionSections
      .find((s) => s.id === 'method')
      .blocks.filter((b) => b.target)
      .map((b) => b.target),
    ['identify', 'negotiation', 'start', 'stack', 'repeat'],
  );
  const practice = executionSections.flatMap((s) => s.blocks).filter((b) => b.kind === 'practice');
  assert.equal(practice.length, 3);
  assert.ok(practice[0].hint && practice[1].hint);
  assert.equal(practice[2].id, 'event');
  assert.equal(practice[2].hint, undefined);
  assert.ok(practice.every((p) => p.facts[0].text.startsWith('Illustration:')));
  const quote = executionTexts().filter((p) => p.authorship === 'quotation');
  assert.deepEqual(
    quote.map((p) => p.text),
    [
      'The distance between a promise and a kept promise has consequences. I want the teaching to be usable in that distance.',
    ],
  );
  assert.doesNotMatch(JSON.stringify(executionSections), /\u2014|TODO|TBD|placeholder/i);
});

test('every source-map teaching row is represented and the new text is bounded adaptation', () => {
  const paragraphs = executionTexts();
  const sources = new Set(paragraphs.flatMap((p) => p.sources));
  for (let i = 2; i <= 43; i++)
    assert.ok(sources.has('M' + String(i).padStart(2, '0')), 'Missing teaching row ' + i);
  assert.equal(new Set(paragraphs.map((p) => p.id)).size, paragraphs.length);
  // This is a reproduction alarm, not a required writing length or effectiveness score.
  assert.ok(
    paragraphs
      .map((p) => p.text)
      .join(' ')
      .split(/\s+/).length < 8000,
  );
  const copy = paragraphs.map((p) => p.text).join(' ');
  for (const required of [
    'prescribed care',
    'withdrawal instructions',
    'urgent professional or emergency help',
    'alternative person',
    'agreement',
    'preparation',
    'forgiveness',
  ]) {
    assert.match(copy.toLowerCase(), new RegExp(required));
  }
});

test('complete semantic editions carry every accepted paragraph exactly once in reading order', () => {
  const expected = executionTexts().map((p) => [p.id, p.text]);
  for (const surface of ['app', 'reading', 'root', 'print']) {
    const tree = executionTeaching(surface);
    assert.deepEqual(
      nodes(tree, (n) => n.attrs['data-execution-copy']).map((n) => [
        n.attrs['data-execution-copy'],
        text(n),
      ]),
      expected,
      surface,
    );
    const ids = nodes(tree, (n) => n.attrs.id).map((n) => n.attrs.id);
    assert.equal(ids.length, new Set(ids).size, surface);
    assert.equal(nodes(tree, (n) => n.tag === 'details').length, surface === 'app' ? 5 : 0);
    assert.equal(
      nodes(tree, (n) => ['input', 'textarea', 'form', 'button'].includes(n.tag)).length,
      0,
    );
  }
  const combinedIds = ['app', 'print'].flatMap((surface) =>
    nodes(executionTeaching(surface), (n) => n.attrs.id).map((n) => n.attrs.id),
  );
  assert.equal(
    combinedIds.length,
    new Set(combinedIds).size,
    'Print IDs cannot shadow live headings',
  );
});

test('public route allowlist and native aliases cover every target and reject malformed links', () => {
  assert.equal(executionRoute('/execution'), '/execution');
  for (const id of executionTargetIds) {
    assert.equal(executionRoute('/execution?section=' + id), '/execution');
    assert.ok(executionFallback().includes('id="/execution?section=' + id + '"'));
    assert.ok(executionReading().includes('id="' + id + '"'));
  }
  for (const input of [
    '/execution/',
    '/executions',
    '/execution?section=unknown',
    '/execution?section=start&answer=x',
    '/execution?section=%73tart',
    '/execution?section=START',
  ])
    assert.equal(executionRoute(input), null, input);
  for (const surface of ['app', 'reading', 'root', 'print']) {
    const tree = executionTeaching(surface);
    const ids = new Set(nodes(tree, (n) => n.attrs.id).map((n) => n.attrs.id));
    for (const link of nodes(tree, (n) => n.tag === 'a' && n.attrs.href.startsWith('#'))) {
      const href = link.attrs.href;
      if (href === '#/') continue;
      if (surface === 'app') assert.equal(executionRoute(href.slice(1)), '/execution');
      else assert.ok(ids.has(href.slice(1)), href);
    }
  }
});

test('static editions are script independent, escaped, and have complete explanations', () => {
  for (const html of [executionReading(), executionFallback()]) {
    assert.doesNotMatch(html, /<script|<form|<textarea|<input|<details|\sonclick=/i);
    assert.equal((html.match(/data-execution-section=/g) || []).length, 9);
    assert.doesNotMatch(html, /M0[1-9]|P0\d{3}/);
  }
  assert.equal(
    renderExecutionHtml({ tag: 'p', attrs: { title: '"<&' }, children: ['<script>&"'] }),
    '<p title="&quot;&lt;&amp;">&lt;script&gt;&amp;&quot;</p>',
  );
  assert.match(executionReading(), /connect-src 'none'/);
  for (const path of ['src/execution-content.ts', 'src/execution-view.ts', 'src/Execution.tsx'])
    assert.doesNotMatch(
      readFileSync(path, 'utf8'),
      /localStorage|sessionStorage|indexedDB|document\.cookie|serviceWorker|fetch\(|XMLHttpRequest|sendBeacon|dangerouslySetInnerHTML|innerHTML|eval\(/,
    );
});

test('approved shared wording is exact and the Loop availability paragraph links on every surface', () => {
  assert.equal(
    frameworkOrientation.relationship,
    'The PERIOD Code establishes the values and standards you choose to live by. How to Rebuild Yourself teaches how to turn those standards into structure and action. The Discipline Loop explains how repeated action creates proof, builds self-trust, and keeps the work going through setbacks and correction. Pure Execution Mode teaches how to carry a sound responsibility through hesitation into appropriate action, adjust when the facts change, and follow through honestly.',
  );
  assert.equal(
    frameworkOrientation.choice,
    "Start where you need to. You don't have to complete one framework to benefit from another.",
  );
  assert.equal(
    executionHomeCopy,
    'Follow one responsibility through the five steps, take over the decisions, then work through a new situation with less guidance. Compare consequences and adjust when the facts call for help, rest or a change of plan.',
  );
  assert.equal(
    executionPrivacyCopy,
    'Pure Execution Mode uses fixed illustrative choices kept only in memory while its workshop is open. Refreshing, restarting or leaving clears them. Screen addresses contain no choices. There are no personal answer fields, submissions or stored practice results.',
  );
  const replacement =
    'Pure Execution Mode teaches how to carry an appropriate next move into action. It uses a five-step method for choosing, beginning, following through and returning when the next responsibility calls for it. Explore Pure Execution Mode for that teaching.';
  const links = loopSections.flatMap((s) => s.blocks).filter((b) => b.executionLink);
  assert.equal(links.length, 1);
  assert.equal(links[0].text, replacement);
  for (const surface of ['app', 'reading', 'root']) {
    const tree = loopTeaching(surface);
    const paragraphs = nodes(tree, (n) => n.tag === 'p' && text(n) === replacement);
    assert.equal(paragraphs.length, 1);
    const link = nodes(paragraphs[0], (n) => n.tag === 'a');
    assert.deepEqual(
      link.map((n) => [n.attrs.href, text(n)]),
      [[surface === 'app' ? '#/execution' : '/read/execution.html', 'Pure Execution Mode']],
    );
  }
  for (const html of [loopReading(), loopFallback()])
    assert.doesNotMatch(html, /Pure Execution Mode remains a future/);
  assert.ok(privacyReading().includes(executionPrivacyCopy));
  assert.match(
    readingIndex(),
    /<h2>Pure Execution Mode<\/h2><p><a href="\/read\/execution.html">Complete teaching, worked examples and explanations<\/a>/,
  );
  assert.equal(
    footerEducation('combined').text,
    'Based on The PERIOD Code, How to Rebuild Yourself, The Discipline Loop and Pure Execution Mode by Jim Lunsford. Educational adaptation by Only Empowerment.',
  );
  assert.deepEqual(footerEducation('execution'), {
    text: 'Based on Pure Execution Mode by Jim Lunsford. Educational adaptation by Only Empowerment.',
    url: 'https://jimlunsford.com/pure-execution-mode/',
  });
});

test('bounded integration edits reverse exactly, reject mutation, and retain older guards', () => {
  assert.deepEqual(
    Object.keys(changes).sort(),
    [
      'index.html',
      'scripts/privacy-reading.ts',
      'scripts/site-footer.ts',
      'scripts/standalone-reading.ts',
      'src/Rebuild.tsx',
      'src/framework-home-content.ts',
      'src/loop-content.ts',
      'src/loop-view.ts',
      'src/main.tsx',
      'src/navigation.css',
      'src/site-footer-content.ts',
      'src/use-route.ts',
      'vite.config.ts',
    ].sort(),
  );
  for (const [path, change] of Object.entries(changes)) {
    const current = readFileSync(path, 'utf8');
    const original = execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' });
    assert.equal(sha(current), change.afterSha256, path);
    assert.equal(beforeWork80Source(current, path), original, path);
    assert.equal(beforeWork80Source(original, path), original, path);
    assert.throws(() => beforeWork80Source(current + '\n', path), /Unexpected Work80 bytes/);
  }
  const paths = execFileSync('git', ['ls-tree', '-r', '--name-only', base], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(
      (p) =>
        /^src\/(period-.*|rebuild-content|loop-practice-content|loop-state)\.(ts|css)$/.test(p) ||
        p.startsWith('docs/work53-source/') ||
        [
          'src/Loop.tsx',
          'src/LoopPractice.tsx',
          'src/PeriodStandard.tsx',
          'src/components/work.tsx',
          'package.json',
          'package-lock.json',
          '.github/workflows/ci.yml',
          'scripts/public-boundary.ts',
          'scripts/rebuild-fallback.ts',
        ].includes(p),
    );
  assert.ok(paths.length > 40);
  for (const path of paths)
    assert.equal(
      readFileSync(path, 'utf8'),
      execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' }),
      path,
    );
});
