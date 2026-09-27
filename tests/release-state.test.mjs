import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReleaseState, releaseState } from '../scripts/release-state.mjs';
import { buildInfo } from '../scripts/build-info.mjs';

const metadata = {
  version: '1.0.0-rc.1',
  commit: 'a'.repeat(40),
  dirty: false,
  tag: 'v1.0.0-rc.1',
};
const lock = { version: metadata.version, packages: { '': { version: metadata.version } } };
test('clean exact RC tag and matching lockfile are accepted without fabricating metadata', () => {
  assert.equal(validateReleaseState(metadata, lock, 'v1.0.0-rc.1'), metadata);
});
test('untagged, wrong-tag and mismatched triggering-tag release states fail closed', () => {
  for (const tag of [null, 'v0.1.0-dev.7', '1.0.0-rc.1'])
    assert.throws(() => validateReleaseState({ ...metadata, tag }, lock), /exact tag/);
  assert.throws(() => validateReleaseState(metadata, lock, 'v1.0.0-rc.2'), /requested tag/);
});
test('dirty source or non-exact HEAD cannot be a release', () => {
  for (const change of [{ dirty: true }, { commit: 'abcdef0' }])
    assert.throws(() => validateReleaseState({ ...metadata, ...change }, lock), /exact HEAD/);
});
test('both lockfile version markers must equal package version', () => {
  for (const bad of [
    { ...lock, version: '0.1.0-dev.7' },
    { ...lock, packages: { '': { version: '0.1.0-dev.7' } } },
    { version: metadata.version },
  ])
    assert.throws(() => validateReleaseState(metadata, bad), /versions must match/);
});
test('real Git metadata remains truthful for ordinary builds and strict checks', () => {
  const actual = buildInfo();
  assert.match(actual.commit, /^[a-f0-9]{40}$/);
  assert.equal(
    actual.source,
    `https://github.com/jimlunsford/only-empowerment/commit/${actual.commit}`,
  );
  if (actual.dirty || actual.tag !== `v${actual.version}`) assert.throws(() => releaseState());
  else assert.deepEqual(releaseState(), actual);
});

test('SemVer RC and final versions are validated without accepting malformed identifiers', () => {
  for (const version of ['1.0.0-rc.1', '1.0.0', '1.0.0-rc.2+build.1']) {
    const state = { ...metadata, version, tag: `v${version}` };
    assert.equal(validateReleaseState(state, { version, packages: { '': { version } } }), state);
  }
  for (const version of ['01.0.0', '1.0.0-rc.01', '1.0.0-rc..1', 'latest'])
    assert.throws(() => validateReleaseState({ ...metadata, version }, lock), /SemVer/);
});
