import { beforeEditorialReading } from './editorial-e1-e3-preservation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import changes from './fixtures/audit-d-changes.json' with { type: 'json' };
import readingHashes from './fixtures/audit-d-readings.json' with { type: 'json' };
import { beforeAuditDSource } from './audit-d-preservation.mjs';
import {
  ownershipReading,
  purposeReading,
  standardOnPaper,
  rebuildReading,
  readingIndex,
} from '../scripts/standalone-reading.ts';
import { resilienceReading } from '../scripts/resilience-reading.ts';
import { integrityReading } from '../scripts/integrity-reading.ts';
import { disciplineReading } from '../scripts/discipline-reading.ts';
import { empowermentReading } from '../scripts/empowerment-reading.ts';
import { loopReading } from '../scripts/loop-reading.ts';
import { executionReading } from '../scripts/execution-reading.ts';
import { privacyReading } from '../scripts/privacy-reading.ts';
const base = '7a7145977fbd25ae04ff163b065edb28697457dd';
const sha = (source) => createHash('sha256').update(source).digest('hex');

test('Batch D permits only pinned layout and accessibility edits and preserves teaching, logic and server configuration', () => {
  assert.deepEqual(
    Object.keys(changes).sort(),
    [
      'src/Rebuild.tsx',
      'src/focus-modality.css',
      'src/focus-modality.ts',
      'src/loop.css',
      'src/reading.css',
      'vite.config.ts',
    ].sort(),
  );
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
      'docs/work53-source',
      '.github',
      'index.html',
      'vite.config.ts',
    ],
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n');
  for (const path of paths) {
    const source = readFileSync(path, 'utf8');
    const original = execFileSync('git', ['show', base + ':' + path], {
      encoding: 'utf8',
      maxBuffer: 5 * 1024 * 1024,
    });
    assert.equal(beforeAuditDSource(source, path), original, path);
    if (changes[path]) {
      assert.equal(sha(source), changes[path].afterSha256, path);
      for (const mutated of [source + '\n', source.slice(1)])
        assert.notEqual(
          beforeAuditDSource(mutated, path),
          original,
          path + ': reject unknown bytes',
        );
      assert.doesNotMatch(source, /\u2014/, path);
    }
  }
});

test('D1 preserves exact static main markup, including all teaching, outcomes, anchors and links on all 13 readings', () => {
  const readings = {
    index: readingIndex(),
    ownership: ownershipReading(),
    purpose: purposeReading(),
    resilience: resilienceReading(),
    integrity: integrityReading(),
    discipline: disciplineReading(),
    empowerment: empowermentReading(),
    standard: standardOnPaper(),
    rebuild: rebuildReading(),
    loop: loopReading(),
    'loop-practice': loopReading(undefined, true, true),
    execution: executionReading(),
    privacy: privacyReading(true, {
      version: '1.0.0-rc.3',
      commit: base,
      source: 'https://github.com/jimlunsford/only-empowerment/commit/' + base,
      dirty: false,
    }),
  };
  assert.equal(Object.keys(readings).length, 13);
  for (const [name, html] of Object.entries(readings)) {
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>') + 7);
    assert.equal(sha(beforeEditorialReading(main)), readingHashes[name], name);
  }
});
