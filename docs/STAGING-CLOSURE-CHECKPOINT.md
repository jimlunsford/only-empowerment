# Phase 1 staging closure checkpoint

Historical work log, 2026-09-16. The blockers recorded below were subsequently resolved. See STAGING-ACCEPTANCE-2026-09-16.md for completed staging evidence and current limitations.

## Verified accepted source

- Public repository; accepted main remains `701664c1b4af37287f4b16fcf8a76a41d09f00c7`.
- Version `0.1.0-dev.1`, dirty false, no tag.
- Main CI run `35076785285`, job `verify`, successful.
- CI artifact ID `10437803928`, ZIP digest `43299069a5cb0ecbcce31592bc476758a8a6a3efe4726370b26bac1cb3493a70`.
- Local strict build reproduced all seven CI manifest file hashes. The prepared deployment envelope also includes SHA256SUMS, for eight files total.

## Infrastructure inspection

Remote Desktop Commander verified `vps1.phoenix233.com`, user jim. `sudo -n true` still requires a password. No permission changes were made.

WordPress.com is authoritative, domain active. The complete inspected zone has protected NS, apex A `104.36.229.165` TTL 300, www CNAME to apex TTL 14400, and `_domainconnect` TXT TTL 3600. There is no dev record or published mail record in this zone. Apex/www HTTP return 404; HTTPS fails hostname validation. Production is preserved.

No Only Empowerment webroot, enabled Nginx host, or Certbot lineage existed. Shared ACME snippet uses `/var/www/letsencrypt`. Existing VPS-wide backup service last completed successfully at 06:38:13 UTC. Nginx was active. Public listeners were 22, 80, 443; database and DNS listeners were local.

## Governance applied

Classic branch protection on main now requires a PR and the real `verify` check from GitHub Actions app ID 15368. The branch must be up to date. Force pushes and deletion are disabled. Enforcement includes admins. Zero additional approving reviews avoids solo-maintainer deadlock. No signed-commit, merge-queue, or deployment-status requirement was added.

The owner retains repository administrative access to inspect or deliberately edit protection for emergency recovery. There is no new credential or automatic bypass. Main itself was not changed.

## Deployment prepared, not executed

`ops/deploy-staging-foundation.py` is a one-time, inspect-first script for this named VPS and accepted commit. It requires the exact prepared artifact envelope beside it. It is not a general deployment framework or an application runtime dependency.

Prepared on VPS at `/home/jim/only-empowerment-deployment/`. Syntax and transferred SHA-256 hashes were verified. The artifact envelope hash is `14ebc75cd71c62788a6407ef13eac4616707ac76d47f2fc98fc53456cd72684b`.

The script checks authoritative and public DNS before changes, refuses existing staging state, runs the existing backup, installs immutable static release files and an atomic current symlink, configures only staging Nginx, uses existing Certbot HTTP-01/account conventions, compares seven live file hashes, verifies restrictive headers and path isolation, tests the staging lineage renewal, and runs/verifies the existing backup by restoring covered files to memory. It does not print private keys or backup credentials.

Existing neighboring sites are checked before and after. Firewall configuration and listening ports must remain unchanged. Failed initial serving validation removes only the new staging enabled link and preserves diagnosis. If later renewal/backup verification fails, do not blindly rerun the first-deployment script; inspect and resume only the failed verification.

## Blockers at this historical checkpoint

The WordPress connector returned: `wpcom/domain-update-dns-records` is not enabled in MCP settings. The attempted addition was not applied. The user must enable that specific capability or add only `dev` A `104.36.229.165`, TTL 300, through the authoritative DNS interface.

The scoped deployment command requires user-authenticated sudo. No password has been requested in chat; no sudoers, SSH, firewall, or backup configuration was changed.

Live staging, TLS issuance/renewal, deployed browser/privacy/accessibility checks, and fresh snapshot content verification remain pending. No operational completion is claimed.

## License and scope

The exact review proposal is in LICENSING-PROPOSAL.md. It is not an operative license grant. No Phase 2 feature work or production release occurred.

## First deployment attempt and recovery preparation

The user added the dev A record and ran the scoped deployment. DNS/preflight and the pre-change VPS-wide backup passed. Certbot created `dev.onlyempowerment.com.conf`; the accepted release and current symlink exist. The first HTTPS curl returned exit 60, and the script removed the new enabled Nginx link and retained the candidate configuration for inspection. Nginx remains active. All seven release file hashes were reverified successfully.

The original script checked HTTPS immediately after requesting reload. Nginx reload is asynchronous, so a request can encounter the prior TLS configuration before new workers are ready. This is a plausible cause, not yet proven as the specific failure. Root-protected certificate validation and retained configuration checks are performed by the recovery preflight before it changes anything.

`ops/resume-staging-foundation.py` reuses the existing certificate and immutable release. It pins the original helper and retained Nginx configuration by SHA-256, validates certificate trust/hostname locally, restores only the inspected staging host, and uses bounded HTTPS readiness probes with normal TLS validation on every attempt. It does not reissue the certificate, replace app files, relax trust, or weaken sudo. Later renewal/backup verification resumes using existing infrastructure. User-authenticated sudo remains required.
