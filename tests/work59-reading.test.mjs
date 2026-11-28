import { withoutReadingNavigation } from './reading-navigation-contract.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  ownershipReading,
  purposeReading,
  standardOnPaper,
  rebuildReading,
  readingIndex,
} from '../scripts/standalone-reading.ts';
import { privacyReading } from '../scripts/privacy-reading.ts';
import { periodFallback } from '../scripts/period-fallback.ts';
import { beforeWork59Source, beforeWork59RootReading } from './work59-preservation.mjs';

const sha = (text) => createHash('sha256').update(text).digest('hex');
const values = ['ownership', 'purpose', 'resilience', 'integrity', 'discipline', 'empowerment'];

test('Work59 static index exposes all six complete lessons, Rebuild and paper instructions', () => {
  const html = readingIndex();
  assert.match(html, /<h1>Complete text-only readings<\/h1>/);
  for (const value of values) assert.ok(html.includes('href="/read/' + value + '.html"'));
  for (const path of ['/read/rebuild.html', '/read/standard.html', '/read/privacy.html'])
    assert.ok(html.includes('href="' + path + '"'));
  assert.doesNotMatch(withoutReadingNavigation(html), /<script|<input|<textarea|<button|onload=/i);
});

test('Work59 standalone Ownership and Purpose use original approved teachings with full examples', () => {
  const ownership = ownershipReading();
  const purpose = purposeReading();
  assert.match(ownership, /id="reading-ownership"/);
  assert.match(ownership, /id="reading-ownership-practice"/);
  assert.match(ownership, /id="reading-ownership-follow-through"/);
  assert.match(ownership, /href="\/read\/purpose.html"/);
  assert.doesNotMatch(ownership, /id="reading-purpose-evening"/);
  assert.match(purpose, /id="reading-purpose"/);
  assert.match(purpose, /id="reading-purpose-evening"/);
  assert.match(purpose, /Direction in this example/);
  assert.doesNotMatch(purpose, /id="reading-ownership-practice"/);
  for (const html of [ownership, purpose])
    assert.doesNotMatch(withoutReadingNavigation(html), /<script|<textarea|<button|<input/i);
});

test('Work59 Rebuild static edition contains every source alternative without unrelated PERIOD text', () => {
  const html = rebuildReading();
  assert.match(
    html,
    /<h1 class="standalone-reading-heading">How to Rebuild Yourself: Complete reading<\/h1>/,
  );
  assert.equal((html.match(/class="all-module"/g) || []).length, 7);
  assert.equal((html.match(/class="flatstate"/g) || []).length, 22);
  assert.equal((html.match(/>Return to the example<\/a>/g) || []).length, 6);
  for (const station of values.map(
    (_, i) => ['line', 'structure', 'return', 'trust', 'negotiation', 'help'][i],
  ))
    assert.ok(html.includes('href="#' + station + '-example"'));
  assert.ok(html.includes('id="/rebuild/trust"'));
  assert.doesNotMatch(html, /class="homepage"/);
  assert.doesNotMatch(withoutReadingNavigation(html), /<script|<textarea|<button|<input/i);
});

test('Work59 paper aid works independently of the Standard Card editor', () => {
  const html = standardOnPaper();
  assert.match(html, /<h1>Use the standard on paper<\/h1>/);
  assert.match(html, /Example standard card/);
  assert.doesNotMatch(withoutReadingNavigation(html), /<script|<textarea|<button|<input/i);
  assert.match(html, /id="reading-standard-card"/);
  const privacy = privacyReading();
  assert.match(privacy, /href="\/read\/index.html"/);
  assert.match(privacy, /href="\/read\/rebuild.html"/);
  assert.match(privacy, /href="\/read\/standard.html"/);
});

test('Work59 source-reversal contract retains byte-exact founder-approved historical source', () => {
  for (const path of [
    'src/Purpose.tsx',
    'src/PeriodLearning.tsx',
    'scripts/site-footer.ts',
    'src/PeriodStandard.tsx',
    'src/use-route.ts',
  ]) {
    const source = readFileSync(path, 'utf8');
    const original = beforeWork59Source(source, path);
    assert.notEqual(sha(original), sha(source));
  }
  const restored = beforeWork59RootReading(periodFallback());
  assert.match(restored, /href="#reading-ownership"/);
  assert.match(restored, /href="#reading-purpose"/);
});

test('every published Rebuild section address names one native destination', () => {
  const html = rebuildReading();
  const sections = [
    'end',
    'end?section=paper',
    'index?section=destinations',
    'index?section=order',
    'complete?section=order-links',
    'complete?section=paper',
    ...[1, 2, 3, 4].map((n) => 'line?section=note-' + n),
  ];
  for (const lesson of ['line', 'structure', 'return', 'trust', 'negotiation', 'help'])
    sections.push(
      lesson,
      lesson + '?section=example',
      lesson + '?section=apply',
      'complete?section=' + lesson,
      'complete?section=' + lesson + '-example',
    );
  for (const section of sections)
    assert.equal(html.split('id="/rebuild/' + section + '"').length, 2, section);
  for (const anchor of ['paper', 'order-links']) assert.ok(html.includes('id="' + anchor + '"'));
});

test('standalone lessons retain working local links, heading order and presentation policy', () => {
  for (const render of [
    ownershipReading,
    purposeReading,
    readingIndex,
    rebuildReading,
    standardOnPaper,
  ]) {
    const html = render();
    assert.match(html, /content="noindex, nofollow"/);
    assert.match(render(undefined, false), /content="index, follow"/);
    for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g))
      assert.ok(html.includes('id="' + fragment + '"'), fragment);
    let previous = 0;
    for (const [, depth] of html.match(/<main\b[\s\S]*?<\/main>/)[0].matchAll(/<h([1-6])\b/g)) {
      assert.ok(Number(depth) <= previous + 1, 'Skipped heading level in ' + render.name);
      previous = Number(depth);
    }
  }
});
