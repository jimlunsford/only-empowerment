import test from 'node:test';
import assert from 'node:assert/strict';
import { practiceCopy } from '../src/period-practice-content.ts';
import { empowermentNavigation } from '../src/period-empowerment-content.ts';
import { periodFallback } from '../scripts/period-fallback.ts';

const approved =
  'The PERIOD Code remains a connected standard for living, not a sequence of achievements.';
const superseded = 'All six values have full lessons. ' + approved;

test('founder-approved Work 56 connected-Code wording is exact in both source fields', () => {
  assert.equal(practiceCopy.availability, approved);
  assert.equal(empowermentNavigation.connectedCodeAvailability, approved);
  assert.equal(practiceCopy.availability.includes('now have full lessons'), false);
  assert.equal(
    empowermentNavigation.connectedCodeAvailability.includes('now have full lessons'),
    false,
  );
});

test('script-independent Ownership teaching carries the approved evergreen line', () => {
  const html = periodFallback();
  assert.ok(html.includes(approved));
  assert.ok(!html.includes(superseded));
});
