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
    { OE_STAGING_COMMIT: 'A'.repeat(40) },
    { OE_STAGING_VERSION: '' },
    { OE_STAGING_VERSION: 'latest' },
    { OE_STAGING_VERSION: '1.0.0-rc.03' },
    { OE_STAGING_VERSION: '01.0.0' },
    { OE_STAGING_VERSION: ['1.0.0-rc.1'] },
    { OE_STAGING_TAG: undefined },
    { OE_STAGING_TAG: null },
    { OE_STAGING_TAG: false },
    { OE_STAGING_TAG: 'null' },
    { OE_STAGING_TAG: 'untagged' },
    { OE_STAGING_TAG: ' ' },
    { OE_STAGING_TAG: 'v1.0.0-rc.2' },
  ])
    assert.throws(() => stagingExpectations({ ...input, ...change }), /OE_STAGING/);
  const { OE_STAGING_TAG, ...omitted } = input;
  assert.throws(() => stagingExpectations(omitted), /OE_STAGING_TAG/);
});
// Recorded Work 44 metadata, not generated from expectations or fetched from the host.
const untagged = {
  version: '1.0.0-rc.3',
  commit: 'e3944772f88b9fe722ac0d54a3f3d4aa7f6f4a39',
  dirty: false,
  tag: null,
  source:
    'https://github.com/jimlunsford/only-empowerment/commit/e3944772f88b9fe722ac0d54a3f3d4aa7f6f4a39',
  presentation: 'staging',
};
const untaggedInput = {
  OE_STAGING_COMMIT: 'e3944772f88b9fe722ac0d54a3f3d4aa7f6f4a39',
  OE_STAGING_VERSION: '1.0.0-rc.3',
  OE_STAGING_TAG: '',
};
test('an independently authorized untagged RC pins actual tag absence', () => {
  assert.deepEqual(untagged, stagingExpectations(untaggedInput));
});
test('the exact deployed metadata equality gate rejects mismatches and relabeling in both directions', () => {
  const expected = stagingExpectations(untaggedInput);
  for (const change of [
    { commit: 'b'.repeat(40) },
    { version: '1.0.0-rc.2' },
    { version: 'latest' },
    { tag: 'v1.0.0-rc.3' },
    { tag: 'v1.0.0-rc.2' },
    { tag: '' },
    { tag: undefined },
    { dirty: true },
    { presentation: 'production' },
    { presentation: undefined },
    { source: 'https://github.com/jimlunsford/only-empowerment/commit/' + 'b'.repeat(40) },
  ])
    assert.throws(() => assert.deepEqual({ ...untagged, ...change }, expected));
  const tagged = { ...untagged, tag: 'v1.0.0-rc.3' };
  const taggedExpected = stagingExpectations({ ...untaggedInput, OE_STAGING_TAG: 'v1.0.0-rc.3' });
  assert.deepEqual(tagged, taggedExpected);
  assert.throws(() => assert.deepEqual(untagged, taggedExpected));
  assert.throws(() => assert.deepEqual(tagged, expected));
  assert.throws(() => assert.deepEqual({ ...tagged, tag: 'v1.0.0-rc.2' }, taggedExpected));
});
test('stable and development SemVer identities retain exact independent tag matching', () => {
  for (const version of ['1.0.0', '0.1.0-dev.7', '1.0.0-rc.3+build.1']) {
    assert.equal(
      stagingExpectations({ ...input, OE_STAGING_VERSION: version, OE_STAGING_TAG: `v${version}` })
        .tag,
      `v${version}`,
    );
  }
});
test('historical Phase 7 metadata remains independently expressible without relabeling', () => {
  const expected = stagingExpectations({
    OE_STAGING_COMMIT: 'a7e8ec325703856542aa29236776be6351604b33',
    OE_STAGING_VERSION: '0.1.0-dev.7',
    OE_STAGING_TAG: '',
  });
  assert.equal(expected.tag, null);
  assert.equal('presentation' in expected, false);
  const current = stagingExpectations({
    OE_STAGING_COMMIT: 'b'.repeat(40),
    OE_STAGING_VERSION: '0.1.0-dev.7',
    OE_STAGING_TAG: '',
  });
  assert.equal(current.presentation, 'staging');
  assert.throws(() => assert.deepEqual({ ...expected, commit: current.commit }, current));
});
