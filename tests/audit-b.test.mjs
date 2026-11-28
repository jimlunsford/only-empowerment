import homepagePositioningChanges from './fixtures/homepage-positioning-band-changes.json' with { type: 'json' };
import editorialChanges from './fixtures/editorial-e1-e3-changes.json' with { type: 'json' };
import auditCChanges from './fixtures/audit-c-changes.json' with { type: 'json' };
import auditDChanges from './fixtures/audit-d-changes.json' with { type: 'json' };
import { beforeAuditCSource } from './audit-c-preservation.mjs';
import { withoutReadingNavigation } from './reading-navigation-contract.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { beforeAuditBSource } from './audit-b-preservation.mjs';
import changes from './fixtures/audit-b-changes.json' with { type: 'json' };
import { loopScenario } from '../src/loop-practice-content.ts';
import { loopReading, escapeLoop } from '../scripts/loop-reading.ts';
import { executionReading } from '../scripts/execution-reading.ts';
import { workshopById, eventCarry } from '../src/execution-workshop-content.ts';
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
import { privacyReading } from '../scripts/privacy-reading.ts';
const base = '73e93fa9caddce8f277ace50e0897d9a6a5eab72';
const sha = (source) => createHash('sha256').update(source).digest('hex');

test('Batch B accepts only pinned fixes and preserves all other source, copy, styles and server configuration', () => {
  const allowed = [
    'scripts/discipline-reading.ts',
    'scripts/empowerment-reading.ts',
    'scripts/integrity-reading.ts',
    'scripts/privacy-reading.ts',
    'scripts/resilience-reading.ts',
    'scripts/site-menu.ts',
    'src/Execution.tsx',
    'src/LoopPractice.tsx',
    'src/execution-workshop-content.ts',
    'src/loop-practice-content.ts',
    'src/main.tsx',
    'src/rebuild-app.css',
    'public/read/navigation.js',
  ];
  assert.deepEqual(Object.keys(changes).sort(), allowed.sort());
  const paths = execFileSync(
    'git',
    [
      'ls-tree',
      '-r',
      '--name-only',
      base,
      'src',
      'scripts',
      'ops',
      'public',
      'docs/work53-source',
      '.github',
      'index.html',
      'vite.config.ts',
    ],
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n');
  paths.push('public/read/navigation.js');
  for (const path of paths) {
    const source =
      auditCChanges[path] ||
      auditDChanges[path] ||
      editorialChanges[path] ||
      homepagePositioningChanges[path]
        ? Buffer.from(beforeAuditCSource(readFileSync(path, 'utf8'), path))
        : readFileSync(path);
    const original =
      path === 'public/read/navigation.js'
        ? Buffer.from('')
        : execFileSync('git', ['show', base + ':' + path], {
            maxBuffer: 5 * 1024 * 1024,
          });
    if (changes[path]) {
      assert.equal(sha(source), changes[path].afterSha256, path);
      assert.equal(beforeAuditBSource(source.toString(), path), original.toString(), path);
      assert.notEqual(
        beforeAuditBSource(source + '\n', path),
        original.toString(),
        path + ': unexpected bytes rejected',
      );
    } else assert.deepEqual(source, original, path);
  }
});

test('B1: both Loop editions disclose care before completion and explicitly change the capacity premise', () => {
  const correction = loopScenario.states.correction.body;
  assert.match(
    correction[0],
    /protect that rest first.*agreed help or a later return when able.*task stays open until.*safe return restores/,
  );
  assert.match(correction[1], /kitchen is usable again/);
  const label = loopScenario.states.restart.options[1].label;
  assert.equal(label, 'Explore changed conditions: too little sleep now limits capacity');
  for (const html of [loopReading(), loopReading(undefined, true, true)]) {
    for (const text of correction) assert.ok(html.includes(escapeLoop(text)));
    assert.ok(html.includes(escapeLoop(label)));
    assert.ok(html.indexOf(escapeLoop(correction[0])) < html.indexOf(escapeLoop(correction[1])));
  }
});

test('B2/B3: delayed sending and neutral subsequent actions match every Decision 1 history and the reading', () => {
  const first = workshopById('event').options;
  assert.match(first[0].label, /Hold back the requests while polishing/);
  assert.doesNotMatch(first[0].consequence, /remaining time/);
  assert.match(eventCarry({ event: 'polish' }), /held back the requests/);
  const second = workshopById('event-wait').options;
  assert.doesNotMatch(JSON.stringify(second), /owner again|correction again|before involving/);
  assert.match(second[0].consequence, /no further action.*no attendee notice is confirmed/);
  assert.match(second[1].label, /before taking any further action on notices/);
  assert.match(
    second[1].consequence,
    /You take no further action on the notice while the page update remains unconfirmed/,
  );
  const html = executionReading();
  for (const option of [...first, ...second])
    for (const key of ['label', 'consequence', 'reasoning'])
      assert.ok(html.includes(escapeLoop(option[key])));
});

test('B6: all 13 reading generators declare exactly one same-origin SVG favicon and allow only the optional navigation enhancement', () => {
  const readings = [
    ownershipReading(),
    purposeReading(),
    standardOnPaper(),
    rebuildReading(),
    readingIndex(),
    resilienceReading(),
    integrityReading(),
    disciplineReading(),
    empowermentReading(),
    privacyReading(),
    loopReading(),
    loopReading(undefined, true, true),
    executionReading(),
  ];
  for (const html of readings) {
    assert.equal(html.split('<link rel="icon" href="/favicon.svg">').length, 2);
    assert.equal(html.split('<script defer src="/read/navigation.js"></script>').length, 2);
    assert.doesNotMatch(withoutReadingNavigation(html), /<script|onload=/i);
  }
});
