import test from 'node:test';
import assert from 'node:assert/strict';
import { validateResponse, previewText, MAX_RESPONSE } from '../src/preview-model.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
test('empty and overlong responses have actionable errors', () => {
  assert.match(validateResponse(' \n '), /Name one action/);
  assert.match(validateResponse('a'.repeat(MAX_RESPONSE + 1)), /600/);
  assert.equal(validateResponse('Send one question.'), '');
});
test('copy preserves user text and separates plan from completion', () => {
  const content = previewText('  Send one question.\nThen stop.  ');
  assert.ok(content.includes('Send one question.\nThen stop.'));
  assert.ok(content.includes('Status: planned.'));
  assert.ok(content.includes('not a completed tool'));
});
function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? sourceFiles(join(dir, e.name)) : [join(dir, e.name)],
  );
}
test('runtime has no network, implicit persistence, unsafe HTML, or evaluation calls', () => {
  const runtime = sourceFiles('src')
    .filter((p) => /\.(tsx?|mjs)$/.test(p))
    .map((p) => readFileSync(p, 'utf8'))
    .join('\n');
  assert.doesNotMatch(
    runtime,
    /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|sessionStorage|indexedDB|eval)\s*[.(]|dangerouslySetInnerHTML|\.innerHTML\s*=/,
  );
  assert.doesNotMatch(runtime, /document\.cookie\s*=/);
});
test('HTML blocks answer submission and third-party runtime requests', () => {
  const html = readFileSync('index.html', 'utf8');
  for (const policy of [
    "connect-src 'none'",
    "form-action 'none'",
    "object-src 'none'",
    "script-src 'self'",
    "base-uri 'none'",
  ])
    assert.ok(html.includes(policy));
  assert.doesNotMatch(html, /<script[^>]+src="https?:/);
});

test('localStorage access is confined to the explicit artifact service', () => {
  for (const p of sourceFiles('src').filter(
    (p) => /\.(tsx?|mjs)$/.test(p) && !p.endsWith('local-cards.ts'),
  ))
    assert.doesNotMatch(readFileSync(p, 'utf8'), /\blocalStorage\b/);
  assert.doesNotMatch(readFileSync('src/local-cards.ts', 'utf8'), /\.clear\s*\(/);
});
