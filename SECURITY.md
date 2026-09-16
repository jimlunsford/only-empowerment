# Security

The initial application is static browser software with no account system, server response store, AI API, or runtime secrets. Its important risks are XSS, dependency/build compromise, host tampering, browser-local exposure, unsafe future imports, and misleading privacy/deployment claims.

Render responses as text. Do not use raw HTML injection, eval, dynamic code, or user-controlled network URLs. Future import files must have size limits, strict schemas and version checks, and never executable content. Treat browser storage as accessible to same-origin scripts and potentially extensions, not a vault.

Use local assets, restrictive CSP, secure HTTPS and referrer/security headers. Keep repository metadata, environment files, backups, credentials, deployment keys and infrastructure secrets out of served files and Git. Lock and review dependencies. CI needs read-only repository access; no production keys in pull-request jobs.

## Reporting

Do not open a public issue containing private responses, credentials, or an exploit that exposes users. GitHub private vulnerability reporting must be verified/enabled before it is advertised as available. Until then, use the [contact page](https://jimlunsford.com/contact/) to request a private security-reporting channel without sending exploit details or sensitive data in the initial message. No guaranteed response time is currently promised.

This pre-release has no production support commitment. The current development branch is the review target. See docs/PRIVACY-ARCHITECTURE.md and docs/RELEASE-STANDARD.md for the trust boundary and release gates.
