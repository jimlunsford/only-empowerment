import { assertApprovedCiWorkflow } from './ci-workflow-preservation.mjs';
import { beforeAuditDSource } from './audit-d-preservation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import changes from './fixtures/audit-c-changes.json' with { type: 'json' };
import { beforeAuditCSource, beforeAuditCReading } from './audit-c-preservation.mjs';
import readingChanges from './fixtures/audit-c-readings.json' with { type: 'json' };
import { frameworkPositioning } from '../src/framework-home-content.ts';
import { frameworkChooser } from '../scripts/framework-links.ts';
import { privacySummary } from '../src/privacy-content.ts';
import { privacyReading } from '../scripts/privacy-reading.ts';
import { founderCopyright, footerEducation } from '../src/site-footer-content.ts';
import { loopSections } from '../src/loop-content.ts';
import { loopReading } from '../scripts/loop-reading.ts';
import { periodFallback } from '../scripts/period-fallback.ts';
import { ownershipReading, purposeReading } from '../scripts/standalone-reading.ts';
import { resilienceReading } from '../scripts/resilience-reading.ts';
import { integrityReading } from '../scripts/integrity-reading.ts';
import { disciplineReading } from '../scripts/discipline-reading.ts';
import { empowermentReading } from '../scripts/empowerment-reading.ts';
const base = 'a7089d0bd9459f3e27253f2da0d7f3fc1fd8b647';
const sha = (s) => createHash('sha256').update(s).digest('hex');
const read = (path) => readFileSync(path, 'utf8');
const forbidden =
  /in this build|bounded PERIOD experience|Legacy tools retain system fonts|All six values have full lessons/;

test('Batch C source edits reverse exactly and leave layout, behavior, deployment and unrelated teaching intact', () => {
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
      'COPYRIGHT',
      'THIRD_PARTY_NOTICES.md',
    ],
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n');
  for (const path of [...paths, 'src/privacy-content.ts']) {
    if (path === '.github/workflows/ci.yml') {
      assertApprovedCiWorkflow(readFileSync(path, 'utf8'));
      continue;
    }
    const source = beforeAuditDSource(read(path), path);
    const original =
      path === 'src/privacy-content.ts'
        ? ''
        : execFileSync('git', ['show', base + ':' + path], {
            encoding: 'utf8',
            maxBuffer: 5 * 1024 * 1024,
          });
    assert.equal(beforeAuditCSource(source, path), original, path);
    if (changes[path]) {
      assert.equal(sha(source), changes[path].afterSha256, path);
      for (const mutation of [source + '\n', source.slice(1)])
        assert.notEqual(
          beforeAuditCSource(mutation, path),
          original,
          path + ': reject unknown bytes',
        );
      assert.ok(
        !path.endsWith('.css') &&
          !path.startsWith('ops/') &&
          !path.startsWith('docs/work53-source/'),
      );
      assert.doesNotMatch(source, /\u2014/, path);
    }
  }
  const notices = read('THIRD_PARTY_NOTICES.md');
  const prior = execFileSync('git', ['show', base + ':THIRD_PARTY_NOTICES.md'], {
    encoding: 'utf8',
  });
  assert.equal(
    notices.slice(notices.indexOf('\n## ')),
    prior.slice(prior.indexOf('\n## ')),
    'third-party license text unchanged',
  );
  assert.equal(read('COPYRIGHT'), read('public/COPYRIGHT.txt'));
});

test('C1 and C2 keep exact public positioning, privacy, attribution and licensing aligned', () => {
  assert.equal(
    frameworkPositioning,
    "Only Empowerment is free to use, with no accounts, no tracking, and nothing you enter leaving your browser. Each framework is a complete, self-contained companion to one of Jim Lunsford's four published books, built so anyone can learn the ideas and put them to work without buying anything first. Direct links to the books are included if you want them, but no purchase is required.",
  );
  assert.ok(
    frameworkChooser().indexOf(frameworkPositioning) > frameworkChooser().indexOf('</nav>'),
  );
  for (const staging of [true, false]) {
    const html = privacyReading(staging);
    assert.ok(html.includes(privacySummary));
    assert.ok(html.includes(footerEducation('combined').text));
    assert.ok(html.includes('If you used an earlier version of this site'));
    assert.equal(html.includes('14 rotated logs'), staging);
    assert.doesNotMatch(
      html,
      /retired tools|Saved work|Approach|planned to use|future analytics|in this build/,
    );
  }
  assert.ok(
    founderCopyright.includes(
      'Software and educational adaptations: AGPL-3.0-or-later. Published books: all rights reserved.',
    ),
  );
  for (const source of ['period', 'rebuild', 'loop', 'execution', 'combined']) {
    assert.match(
      footerEducation(source).text,
      /^An educational companion to .+ by Jim Lunsford\.$/,
    );
  }
});

test('C3 keeps all six labels, public copy and Loop bridges grammatical in both editions', () => {
  const readings = [
    ownershipReading(),
    purposeReading(),
    resilienceReading(),
    integrityReading(),
    disciplineReading(),
    empowermentReading(),
  ];
  for (const [i, html] of readings.entries()) {
    assert.ok(html.includes(`${i + 1} of 6 in the teaching order`));
    assert.doesNotMatch(html, forbidden);
    for (const match of html.matchAll(
      /<a\b[^>]*href="https:\/\/jimlunsford.com\/period-code\/"[^>]*>/g,
    )) {
      assert.ok(match[0].includes('target="_blank"'));
      assert.ok(match[0].includes('rel="noopener noreferrer"'));
    }
  }
  for (const block of loopSections
    .flatMap((section) => section.blocks)
    .filter((block) => block.related)) {
    assert.equal(
      block.text.split(block.related.label).length,
      2,
      'bridge label appears in its sentence exactly once',
    );
    assert.ok(
      loopReading()
        .replace(/<[^>]+>/g, '')
        .includes(block.text),
    );
  }
  for (const html of [
    ...readings,
    periodFallback(),
    loopReading(),
    privacyReading(),
    read('THIRD_PARTY_NOTICES.md'),
  ])
    assert.doesNotMatch(html, forbidden);
  for (const html of [periodFallback(), loopReading(), ...readings]) {
    const original = beforeAuditCReading(html);
    assert.ok(
      Object.values(readingChanges).some((change) => sha(original) === change.beforeSha256),
    );
    assert.equal(
      beforeAuditCReading(html + '\n'),
      html + '\n',
      'unknown rendered bytes cannot reverse',
    );
  }
});
