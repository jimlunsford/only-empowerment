import test from 'node:test';
import assert from 'node:assert/strict';
import { stagingExpectations } from './staging-expectations.mjs';
const input = {
  OE_STAGING_COMMIT: 'a'.repeat(40),
  OE_STAGING_VERSION: '1.0.0-rc.1',
  OE_STAGING_TAG: 'v1.0.0-rc.1',
};
test('staging RC metadata uses independent SHA, version and tag pins', () => {
  assert.deepEqual(stagingExpectations(input), {
    version: '1.0.0-rc.1',
    presentation: 'staging',
    commit: input.OE_STAGING_COMMIT,
    dirty: false,
    tag: 'v1.0.0-rc.1',
    source: `https://github.com/jimlunsford/only-empowerment/commit/${input.OE_STAGING_COMMIT}`,
  });
});
test('missing and malformed staging identity fails instead of trusting the host', () => {
  for (const change of [
    { OE_STAGING_COMMIT: '' },
    { OE_STAGING_COMMIT: 'abcdef0' },
    { OE_STAGING_VERSION: '' },
    { OE_STAGING_VERSION: 'latest' },
    { OE_STAGING_TAG: '' },
    { OE_STAGING_TAG: 'v1.0.0-rc.2' },
  ])
    assert.throws(() => stagingExpectations({ ...input, ...change }), /OE_STAGING|RC staging/);
});
test('historical Phase 7 metadata remains independently expressible without relabeling', () => {
  const expected = stagingExpectations({
    OE_STAGING_COMMIT: 'a7e8ec325703856542aa29236776be6351604b33',
    OE_STAGING_VERSION: '0.1.0-dev.7',
  });
  assert.equal(expected.tag, null);
  assert.equal('presentation' in expected, false);
  const current = stagingExpectations({
    OE_STAGING_COMMIT: 'b'.repeat(40),
    OE_STAGING_VERSION: '0.1.0-dev.7',
  });
  assert.equal(current.presentation, 'staging');
});
