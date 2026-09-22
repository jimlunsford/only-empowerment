# Release and deployment standard

## Source lifecycle

Feature branch → PR + CI + product review → accepted main → staging → deliberate version tag/release → production.

Main represents accepted source, not an automatic production deploy. Phase 1 foundation was accepted through `foundation/phase-1`; operational closure uses `ops/phase-1-staging-closure`. Staging may temporarily review a clearly identified PR head; record that exception and never call it accepted main. No production release or apex cutover is authorized by Phase 1.

## Versions and evidence

Use SemVer for application versions. Current development line: `0.1.0-dev.1`. Production tags must match package version, be intentional, and not be moved after publication. Record user-visible changes in CHANGELOG.md; GitHub release notes explain acceptance evidence, limits, and upgrade implications.

`build.json` includes version, full commit, exact tag if one exists, dirty flag, and public commit URL. Footer shows a subtle version/source link. Dirty local builds say local changes and are rejected by `OE_RELEASE_BUILD=1`.

Build from a clean checkout using pinned Node and `npm ci`; run verification. Package `dist/`, including build.json and SHA256SUMS. Record artifact SHA-256 alongside release notes. Compare deploy files with the independently obtained CI/release artifact, not only a manifest served by the same host. Commit labels and public source aid inspection but cannot prove an uncompromised deployment.

## Staging operation

Preferred host: `dev.onlyempowerment.com`. Separate root and Nginx server block; no PHP pool/database because the runtime is static. Public review shell with noindex is acceptable; noindex is not access control. Use synthetic examples and clear unfinished status. Do not place administrative endpoints, Git metadata, source/config backups, or secrets under the web root.

Serve only built assets. Use an immutable release directory named by source commit and an atomic `current` symlink. Keep the previous release for rollback. Build assets outside the public directory as an unprivileged user. Nginx reads files and cannot alter source. A reviewed deployment can be manual initially; do not add SSH secrets or privileged automated CI deployment solely for appearance.

## VPS operations

Verify `vps1.phoenix233.com` through Remote Desktop Commander. Inspect current state and stop on unexpected site/config ownership or existing content. Use existing Nginx/ACME/Certbot conventions and the established VPS-wide backup. Preserve UFW, SSH, Fail2ban, application isolation, all existing domains and mail DNS.

Before changing Nginx, establish a usable rollback and verify existing backup health. Run the established backup helper when authorized; do not create another repository, timer, or rclone sync. Validate Nginx before reload. Verify HTTPS hostname, redirects, actual app navigation, CSP/security headers, source metadata, assets, denied sensitive paths, and unchanged production behavior. Verify deployed files and configuration are included in the next existing VPS-wide snapshot.

## Production gate

Owner authorizes the specific release and cutover. Resolve license; complete tool acceptance, accessibility, privacy/data-flow, hosting-log review, vulnerability review, release manifest and backup/rollback verification. Production should receive the tested artifact bytes, not an unrecorded rebuild. Update robots/indexing deliberately at production launch. Prefer rollback to a known artifact when verification fails; preserve diagnostic evidence without private user text.

## CI economics

GitHub documentation reviewed 2026-09-16 says standard hosted runners are free for public repositories. Older private-repository minute exhaustion is not assumed to block this project. Larger runners and artifact/cache storage have separate billing rules. Use standard Ubuntu runners, bounded jobs, least-privilege `contents: read`, short artifact retention, and no deployment credentials in CI.

Source: [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

## Current repository protection and operational checkpoint

Main requires a PR and GitHub Actions app 15368 check `verify`, with strict up-to-date branches and zero required additional approving reviews. Admin enforcement is enabled; force pushes and deletion are disabled. The owner retains settings access for deliberate emergency recovery. No CI credential or automatic bypass was created.

Staging currently represents accepted foundation commit `701664c1b4af37287f4b16fcf8a76a41d09f00c7`. Operational closure adds tests, scripts and documentation without changing application files. Merging those records need not redeploy identical application behavior solely to replace its truthful source label. The acceptance record distinguishes deployed source from later operational/documentation commits. Any future application change requires a new verified artifact and explicit staging acceptance.

## Authorized Phase 2 staging exception

The owner authorized the dedicated Next Move feature PR head on staging for product review, before merge. This is a review candidate, not accepted main. Use `0.1.0-dev.2`, retain exact full-SHA build metadata and immutable release bytes, preserve the previous accepted `bd984a8986a658c6bd0d0d663c4e30f5c2f09d80` release, and keep the PR draft/unmerged until explicit product approval. No production tag, production deployment, certificate, or indexing change is part of Phase 2.


## Phase 3 Decision Room candidate

The Phase 3 owner instruction authorizes an exact unmerged Decision Room feature candidate on staging for personal product review. Version: `0.1.0-dev.3`. The accepted rollback base is `26ff9be784ce2395413b19be441dd418b0e6ab77`. PR must remain draft and unmerged; no production deployment or tag. The general staging banner remains as approved.

## Phase 3 product approval and banner closeout (2026-09-21)

The owner approved Decision Room subject only to replacing the staging notice with “Current tools are staged for development and review. Not a production release.” The “Development staging” label stays unchanged. Earlier candidate records above describe their historical gates. The owner now authorizes regular protected merge of PR #5 after full feature and deployed candidate verification, followed by a clean accepted-main build, immutable staging deployment, full deployed verification and existing VPS backup/health checks. Production remains untouched.

Keep `0.1.0-dev.3`: this staging-status copy correction completes the same reviewed development candidate and does not require a new application version or release tag. No product behavior or dependencies change.

## Phase 4 candidate staging exception

The owner authorizes the clean unmerged `feature/build-a-standard-v1` candidate at `0.1.0-dev.4` on staging for product review. Accepted main `1a0909e9e3417c5eaf1f48cafc52da1be9a2d4ee` is the rollback release. Keep the PR draft and unmerged. Preserve the approved generic staging banner. Exact CI/local/HTTPS byte comparison, immutable release, atomic switch and existing VPS-wide backup/restore checks remain required. No production application, DNS, TLS, indexing, tag or release changes.


## Phase 5 Reset candidate staging exception

Accepted source and rollback are `77d921d8bd2aecab94f9581c36262bf48a54d608` (`0.1.0-dev.4`). The owner authorizes exact clean `feature/reset-v1` candidate deployment at `0.1.0-dev.5` for product review. PR #7 must remain draft and unmerged. Preserve the approved staging banner, restrictive CSP, noindex, immutable release, independent CI/local/HTTPS file comparison, existing backup/restore process and neighbor/firewall checks. No production, DNS, TLS issuance, tag or release. A sudo authentication requirement does not authorize privilege changes; prepare the verified payload and pinned helper before requesting the owner-run command.
