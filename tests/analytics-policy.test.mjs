import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (path) => readFileSync(path, 'utf8').replace(/\s+/g, ' ');

test('current public copy discloses no analytics or tracking without future speculation', () => {
  const copy = read('src/privacy-content.ts');
  assert.ok(copy.includes('No accounts. No tracking. No cookies.'));
  assert.ok(
    copy.includes(
      'uses no analytics, tracking cookies, session replay, heatmaps, or advertising profiles',
    ),
  );
  assert.ok(copy.includes('No AI service or remote fonts are used.'));
  for (const path of ['src/main.tsx', 'scripts/privacy-reading.ts']) {
    const source = read(path);
    assert.ok(source.includes('privacyTracking'));
    assert.doesNotMatch(source, /in this build|Production is planned|Any future analytics/);
  }
});

test('canonical policy preserves categorical content exclusions and activation gates', () => {
  const policy = read('docs/ANALYTICS-POLICY.md');
  assert.ok(
    policy.includes("Measure the product, not the content of the person's private thinking."),
  );
  assert.ok(policy.includes('What users enter into the tools is never sent to Google Analytics.'));
  const allowed = policy.split('## Allowed categories')[1].split('## Prohibited data')[0];
  assert.doesNotMatch(
    allowed,
    /(?:collect|receive|send|include|measure) (?:tool answers|free-text|Saved Work|artifact contents|copied text)/i,
  );
  const prohibited = policy.split('## Prohibited data')[1].split('## Prohibited features')[0];
  for (const category of [
    'Tool answers',
    'free-text field contents',
    'Decision Record',
    'Execution Card',
    'Personal Standard',
    'Reset Plan',
    'Rebuild Map',
    'Action Record',
    'Saved Work',
    'clipboard contents',
    'event names or parameters',
    'URLs containing user-authored content',
    'Titles derived from user-authored content',
    'user properties derived from private tool content',
  ])
    assert.ok(prohibited.includes(category), category);
  const features = policy
    .split('## Prohibited features')[1]
    .split('## Implementation requirements')[0];
  for (const feature of [
    'Session replay',
    'Heatmaps',
    'Advertising personalization',
    'Remarketing',
    'Google Signals',
    'User-ID',
    'User-provided data',
    'Behavioral advertising profiles',
  ])
    assert.ok(features.includes(feature), feature);
  for (const gate of [
    'explicit analytics implementation approval',
    'fixed event allowlist',
    'no arbitrary event parameters or user-authored values',
    'documented privacy review',
    'synthetic private-marker network tests',
    'do not weaken unrelated directives',
    'consent/legal handling separately',
  ])
    assert.ok(policy.includes(gate), gate);
  for (const file of [
    'README.md',
    'docs/PRIVACY-ARCHITECTURE.md',
    'docs/DEVELOPMENT.md',
    'docs/TESTING.md',
  ]) {
    assert.ok(read(file).includes('ANALYTICS-POLICY.md'), file);
    assert.doesNotMatch(
      read(file),
      /No analytics in Phase 1 or v1 baseline|analytics are prohibited from v1|never uses analytics/i,
    );
  }
});
