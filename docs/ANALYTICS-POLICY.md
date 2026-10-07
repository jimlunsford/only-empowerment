# Analytics policy

Canonical production analytics contract, adopted following hands-on rc.2 review. Other documents link here; historical acceptance evidence describes what was tested at its original checkpoint.

## Provider

Google Analytics.

## Purpose

Minimal aggregate site and product usage measurement to understand how Only Empowerment is used and improve the product.

Permanent public-facing privacy rule:

> Only Empowerment uses Google Analytics for minimal site and product usage analytics. What users enter into the tools is never sent to Google Analytics.

This rule describes intended production policy. Current copy must distinguish that intent from the implementation state below and must not imply that staging already sends analytics.

## Core principle

Measure the product, not the content of the person's private thinking.

## Allowed categories

Subject to explicit implementation review and minimal configuration:

- Page/tool usage, including page views and tool visits.
- Broad acquisition/referrer information and traffic source.
- Limited browser/device information.
- Broad geographic information.
- Fixed content-free product events, such as tool opened, tool started, and tool result reached.

Allowed categories do not authorize arbitrary collection. Use fixed route/tool identifiers and reviewed content-free values; do not forward raw URLs, titles or referrers that could contain authored content.

## Prohibited data

Google Analytics must never receive any user-authored private tool content, including:

- Tool answers or free-text field contents.
- Decision Record, Execution Card, Personal Standard, Reset Plan, Rebuild Map or Action Record contents.
- Saved Work contents, saved-record identifiers or content-derived metadata.
- Copied text or clipboard contents.
- User-authored text in event names or parameters.
- URLs containing user-authored content.
- Titles derived from user-authored content.
- Analytics user properties derived from private tool content.

These exclusions apply to automatic collection as well as manually emitted events. Reducing or transforming private content does not make it approved analytics input.

## Prohibited features

- Session replay.
- Heatmaps.
- Advertising personalization.
- Remarketing.
- Google Signals.
- User-ID.
- User-provided data.
- Behavioral advertising profiles.

## Implementation requirements

Before production activation:

- Obtain explicit analytics implementation approval for the selected provider.
- Document an explicit fixed event allowlist and allowed content-free parameters; no arbitrary event parameters or user-authored values.
- Complete a documented privacy review, including automatic/default collection and route, URL, title and referrer handling.
- Review and update CSP only for required Google endpoints at implementation time; do not weaken unrelated directives or predeclare domains before the integration exists.
- Add synthetic private-marker network tests proving markers never appear in analytics requests, including URLs, headers and bodies, through answer entry, artifact creation/editing, Saved Work, copy, navigation and result flows.
- Document minimal Google Analytics configuration and verify all prohibited features remain disabled.
- Review consent/legal handling separately where required before activation.
- Update public implementation-state wording accurately when activation is separately approved and verified.

## Current state

Google Analytics is not enabled on development staging. Both current staging and production presentation builds contain no analytics implementation. There is no analytics script, event transmission, cookie, measurement ID, analytics package or third-party runtime analytics dependency. Current staging retains its restrictive network behavior and `connect-src 'none'`.

This policy change does not authorize adding runtime analytics, network calls, remote scripts, CSP allowances, configuration identifiers, or consent UI. Implementation belongs to later production-site work.
