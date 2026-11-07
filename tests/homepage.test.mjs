import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { homepageFallback } from '../scripts/homepage-fallback.ts';
import { periodFallback } from '../scripts/period-fallback.ts';
import { homepage } from '../src/period-homepage-content.ts';
const approved = JSON.parse(readFileSync('tests/fixtures/work32-homepage-copy.json', 'utf8'));
const text = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replaceAll('&amp;', '&')
    .replace(/\s+/g, ' ');

test('approved Work 32 copy, comparison and reflection are complete in the root introduction', () => {
  const html = homepageFallback(),
    rendered = text(html);
  let after = 0;
  for (const line of approved) {
    const index = rendered.indexOf(line, after);
    assert.ok(index >= after, `Missing or reordered approved copy: ${line}`);
    after = index + line.length;
  }
  assert.doesNotMatch(
    html,
    /Keep your answer to yourself|<input|<form|<button|<textarea|<select|<details|aria-live/,
  );
  assert.ok(rendered.includes(homepage.readingBoundary));
  assert.ok(rendered.includes(homepage.legacy));
  assert.ok(rendered.indexOf(homepage.legacy) > rendered.indexOf(homepage.book));
  for (const id of ['first-moment', 'why-period', 'teaching-order']) {
    assert.match(html, new RegExp(`id="${id}"[^>]+tabindex="-1"[^>]+aria-labelledby=`));
  }
  for (const id of ['ownership', 'purpose']) assert.ok(html.includes(`href="#reading-${id}"`));
  for (const id of ['resilience', 'integrity', 'discipline', 'empowerment'])
    assert.ok(html.includes(`href="/read/${id}.html"`));
});

test('root readings after the unchanged homepage match the approved Work 35 copy and P20 static parity', () => {
  const full = periodFallback();
  const readings = full.slice(full.indexOf('<h2 id="reading-ownership"'));
  assert.equal(
    createHash('sha256').update(readings).digest('hex'),
    '22dfaa1867514d877090515e2af50cf6376d408923b8c71d0fa0e95ede0e05ca',
  );
});
