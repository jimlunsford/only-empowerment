import { semver } from '../scripts/release-state.mjs';
// Expectations come only from independently recorded candidate evidence, never the host.
export function stagingExpectations(env) {
  const commit = env.OE_STAGING_COMMIT;
  const version = env.OE_STAGING_VERSION;
  // An empty string explicitly pins absence. Omission must not silently mean untagged.
  if (typeof env.OE_STAGING_TAG !== 'string')
    throw new Error(
      'OE_STAGING_TAG must explicitly name a tag or be empty for an authorized untagged build.',
    );
  const tag = env.OE_STAGING_TAG === '' ? null : env.OE_STAGING_TAG;
  if (typeof commit !== 'string' || !/^[a-f0-9]{40}$/.test(commit))
    throw new Error('OE_STAGING_COMMIT must be an independently supplied full Git SHA.');
  if (typeof version !== 'string' || !semver.test(version))
    throw new Error('OE_STAGING_VERSION must be an independently supplied SemVer version.');
  if (tag !== null && tag !== `v${version}`)
    throw new Error('OE_STAGING_TAG must equal v plus OE_STAGING_VERSION.');
  const historical =
    commit === 'a7e8ec325703856542aa29236776be6351604b33' && version === '0.1.0-dev.7';
  return {
    version,
    ...(historical ? {} : { presentation: 'staging' }),
    commit,
    dirty: false,
    tag,
    source: `https://github.com/jimlunsford/only-empowerment/commit/${commit}`,
  };
}
