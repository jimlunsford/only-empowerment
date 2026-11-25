import assert from 'node:assert/strict';
import { beforeWork73Source } from './work73-preservation.mjs';
import { beforeWork59Source } from './work59-preservation.mjs';
import { createHash } from 'node:crypto';
import changes from './fixtures/work56-preservation.json' with { type: 'json' };

const sha = (text) => createHash('sha256').update(text).digest('hex');

// Feed the earlier whole-file checks their original input only after proving every new byte.
export function beforeWork56Source(source, path) {
  if (path === 'src/period-integrity-content.ts' || path === 'src/period-purpose-content.ts')
    source = beforeWork73Source(source, path);
  source = beforeWork59Source(source, path);
  const change = changes[path];
  if (!change) return source;
  assert.equal(sha(source), change.afterSha256, path);
  const lines = source.split('\n');
  for (const { line, before, after } of [...change.edits].reverse()) {
    assert.deepEqual(lines.slice(line, line + after.length), after, path);
    lines.splice(line, after.length, ...before);
  }
  const original = lines.join('\n');
  assert.equal(sha(original), change.beforeSha256, path);
  return original;
}

export function beforeWork56Reading(html) {
  // These two exact phrases also appear in the script-independent root reading.
  for (const [candidate, original] of [
    [
      'If the shared file is offline, you can ask your colleague for an exported copy. They can say no. You still owe the update.',
      'Receiving an exported copy helps you do your work.',
    ],
    ['The PERIOD Code remains', 'All six values now have full lessons. The PERIOD Code remains'],
  ]) {
    assert.equal(html.split(candidate).length, 2, candidate);
    html = html.replace(candidate, original);
  }
  return html;
}
