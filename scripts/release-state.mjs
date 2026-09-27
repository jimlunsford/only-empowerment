import { readFileSync } from 'node:fs';
import { buildInfo } from './build-info.mjs';

// SemVer identifiers reject leading zeroes in numeric prerelease components.
export const semver =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

// Pure validation lets tests cover tagged states without creating a repository tag.
export function validateReleaseState(metadata, lock, requestedTag = `v${metadata.version}`) {
  const expected = `v${metadata.version}`;
  if (!semver.test(metadata.version))
    throw new Error('Release package version must be a SemVer version.');
  if (lock.version !== metadata.version || lock.packages?.['']?.version !== metadata.version)
    throw new Error('Package and lockfile root versions must match.');
  if (!/^[a-f0-9]{40}$/.test(metadata.commit) || metadata.dirty !== false)
    throw new Error('Release requires exact HEAD and a clean checkout.');
  if (requestedTag !== expected || metadata.tag !== expected)
    throw new Error(`Release requires exact tag ${expected} on HEAD and matching requested tag.`);
  return metadata;
}

export function releaseState(requestedTag = process.env.OE_RELEASE_TAG || undefined) {
  // buildInfo uses git rev-parse HEAD, status --porcelain and describe --exact-match.
  // Missing tags, unrelated tags and dirty tracked/untracked files cannot pass.
  return validateReleaseState(
    buildInfo(true),
    JSON.parse(readFileSync('package-lock.json', 'utf8')),
    requestedTag,
  );
}

if (import.meta.main) console.log(JSON.stringify(releaseState(), null, 2));
