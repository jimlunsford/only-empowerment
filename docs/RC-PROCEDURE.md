# v1 release-candidate source, tag and artifact contract

## A3a scope and identity

Proposed version: `1.0.0-rc.1`. Required tag: `v1.0.0-rc.1`. This is a release candidate, not final 1.0.0. Six-tool scope is frozen; A1 browser compatibility and A2 presentation separation are accepted. Human/device acceptance and production hosting/cutover remain pending. A3a prepares source and a draft PR only: no merge, tag, release, deployment or human acceptance.

`npm run check:release` invokes `scripts/release-state.mjs`. It obtains actual HEAD, dirty status and an exact tag through the existing Git-based `buildInfo` function; it rejects dirty tracked/untracked source, an absent or mismatched exact tag, and mismatched package/lockfile root versions. The required tag is `v${package.version}`. If `OE_RELEASE_TAG` supplies a triggering tag, it must also match. If multiple tags on HEAD cause Git to report a different exact tag, stop and inspect; do not fabricate metadata or move published tags.

`OE_RELEASE_BUILD=1` remains the clean-checkout contract for ordinary deployable development builds, without requiring a tag. `OE_RELEASE_TAG=v1.0.0-rc.1` opts a build into the stronger contract. Tagged CI sets that variable from the GitHub tag ref; Vite checks it again when producing metadata. Untagged PR/main output can truthfully contain `tag: null`. An authoritative RC artifact cannot. Ignored generated files such as node_modules, dist and test evidence do not count as source changes.

## Artifact identities and order

| Actions artifact | Purpose | Preservation point |
| --- | --- | --- |
| `only-empowerment-production-<full-source-SHA>` | Production-intended application bytes, usable only after remaining acceptance and authorization | After production build and four-project presentation/shell checks, before staging rebuild |
| `only-empowerment-staging-<full-source-SHA>` | Candidate review on dev.onlyempowerment.com | After explicit staging rebuild and ordinary four-project browser suite |
| `browser-review-<full-source-SHA>` | Local-browser evidence, with separate production/staging directories | Separate from application artifacts, also retained on failures |
| `staging-review-<independently-supplied-SHA>` | Later manual deployed-host evidence | Only for an explicitly requested deployed verification run |

Both application artifacts contain `build.json`, `SHA256SUMS`, `LICENSE.txt`, `COPYRIGHT.txt` and `THIRD_PARTY_NOTICES.txt`. The manifests hash every other packaged file. Production is uploaded before Vite empties dist for staging, so that rebuild cannot overwrite its preserved bytes. Staging keeps its banner, non-production wording, noindex/nofollow and robots Disallow. Production has index/follow and robots Allow. They intentionally have different manifests and bundle bytes; never relabel or claim cross-mode byte identity.

The old ambiguous `only-empowerment-<SHA>` name is replaced deliberately. Repository inspection found no script or deployment helper consuming that Actions name. Historical helpers consume phase-specific JSON envelopes and enforce old exact versions, null tags and metadata shapes; they remain unchanged historical tools, not RC deployment tools. A later deployment preparation must deliberately select the staging artifact by its exact ID/name and review an RC-compatible deployment procedure. Do not run a Phase 2-7 helper against these RC bytes. No deployment helper is introduced in A3a.

CI checks out the exact PR head or event commit with full history/tags. Pushes to main, PRs and manual development runs remain usable before the RC tag exists. Tag pushes matching `v*` run strict validation before `npm ci`; formatting, audit, unit tests, TypeScript/build, production browser checks, production upload, staging build, ordinary browser checks and staging upload follow. Both builds use the same checkout. Retries remain zero. No automatic deployment, release publication or deployment credentials are configured. An artifact uploaded before a later failure is not accepted unless the entire exact-source run succeeds.

## A3b, only in a later authorized execution

1. Review and merge accepted A3a through protected main. Record resulting exact main commit **M**; do not substitute the PR head for the merge commit.
2. Verify remote main is M, checkout is clean, package.json and both package-lock version markers are `1.0.0-rc.1`, and no conflicting tag/release exists.
3. With explicit authorization, create immutable tag `v1.0.0-rc.1` pointing exactly to M and publish it. Never move it. **The tag must exist on M before the authoritative build, because build.json records the tag.** Do not promote the earlier untagged PR artifact as the tagged RC.
4. Identify the tag-triggered run by tag ref and exact commit M. Require the full run, including strict release-state validation, to pass. No automatic deployment occurs.
5. Record run ID/attempt, source SHA, tag, version, both application artifact names/IDs, Actions artifact digests, browser-evidence artifact IDs and test results. Download and preserve all before the seven-day Actions retention expires. Record SHA-256 of the downloaded archive bytes separately from contained file checksums; do not confuse an archive digest with SHA256SUMS.
6. Independently inspect each downloaded archive, its complete path set and every file against SHA256SUMS. Confirm build.json says version `1.0.0-rc.1`, commit M, dirty false, exact tag `v1.0.0-rc.1`, the appropriate presentation and public commit source URL. Compare independent clean tagged local builds using the pinned Node/lockfile against the corresponding CI manifest, production to production and staging to staging. Record any mismatch and stop. Never compare only a manifest served by the deployment to itself.
7. Preserve the accepted production archive without rebuilding or replacing it. Prepare separately authorized staging deployment using the exact verified **staging** bytes, current infrastructure/backup/rollback rules, and a reviewed RC-compatible procedure. Do not deploy an intermediate A2-only artifact.
8. After deployment, compare live files against independently obtained staging artifact files/hashes. Run explicitly authorized deployed acceptance with `OE_STAGING_COMMIT=M`, `OE_STAGING_VERSION=1.0.0-rc.1`, and `OE_STAGING_TAG=v1.0.0-rc.1`. The workflow equivalents are `verify_staging=true`, `staging_commit`, `staging_version`, and `staging_tag`. Do not obtain expected identity from the host being tested. Record run/results and host/backup evidence.
9. Complete human/device Gate B acceptance, including actual accessibility/device evidence and known limitations. Automation and screenshots do not establish screen-reader or physical-device acceptance.
10. Only after explicit authorization, create the durable GitHub **prerelease** for `v1.0.0-rc.1`, with its immutable tag/source identity, GitHub source archives for that tag, accepted production archive, archive SHA-256, contained SHA256SUMS, license/copyright/notices, release notes, acceptance evidence and known testing limitations. Retain the staging comparison record and evidence too. Actions artifacts are expiring acceptance transport, not the durable public distribution record. Do not replace accepted archive bytes during attachment.
11. Production hosting and cutover remain separately authorized gates. If authorized, production receives the preserved, accepted production bytes, never an unrecorded rebuild. A later final 1.0.0 requires its own version/tag/artifact acceptance, rather than relabeling RC bytes.

Live staging currently represents historical source `a7e8ec325703856542aa29236776be6351604b33` at `0.1.0-dev.7`. Its expected gap from A1/A2/RC source is not an incident or authorization to normalize it now.

## Defects and immutable history

If rc.1 reveals a defect, retain `v1.0.0-rc.1` and its recorded assets unchanged. Fix through normal PR/protected-main flow, advance package and lockfile to `1.0.0-rc.2`, create a new `v1.0.0-rc.2` tag on the newly accepted commit, and generate independently verified new artifacts. Never move the old tag or replace assets as though they were the same candidate.

Final `1.0.0` follows the same discipline: accepted source with matching version/lockfile, immutable `v1.0.0` tag before build, clean tagged metadata, separate verified presentation artifacts, required acceptance and explicit publication/deployment authorization. No rc.2 or final release is implemented by A3a.
