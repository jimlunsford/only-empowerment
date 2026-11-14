import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Preserve the old source guard against exact committed Work 45 artifacts.
// New app-shell edits are verified separately by Work 54 tests.
const original = {
  'src/main.tsx': {
    file: 'tests/fixtures/work54-accepted-main.tsx.txt',
    sha256: 'f07a905a2fe4e3912dda1903b78c661dce3ab36360ea361c65dad01c35ad0dcc',
  },
  'src/use-route.ts': {
    file: 'tests/fixtures/work54-accepted-use-route.ts.txt',
    sha256: '9207e865242d4bf06ac4376f47eaa09a0857857daff9009832cbb6f20769b49c',
  },
  'vite.config.ts': {
    file: 'tests/fixtures/work54-accepted-vite.config.ts.txt',
    sha256: 'a322340c68b8af66d05c04443ab7fc257940ceba795119bd3bc462b9e603937b',
  },
};
export function historicalPeriodSource(path) {
  if (!Object.hasOwn(original, path)) return readFileSync(path, 'utf8');
  const snapshot = original[path];
  const content = readFileSync(snapshot.file, 'utf8');
  assert.equal(createHash('sha256').update(content).digest('hex'), snapshot.sha256, path);
  return content;
}
