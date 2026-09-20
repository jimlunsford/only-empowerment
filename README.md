# Only Empowerment

**Phase 2 candidate: Next Move.** Turn a stalled direction into a clear, user-authored Execution Card. Six focused steps, a legitimate pause, editable review, copy/print, and optional saving in this browser. Card status is always Planned. No account, analytics, AI, or answer submission.

This feature candidate awaits product review. It is not accepted main or a production release. The other five tools remain outlines. [Candidate acceptance](docs/PHASE-2-ACCEPTANCE.md) records verification and remaining gates.


**Practical tools for clear thinking, personal standards, and deliberate action.**

Only Empowerment helps people examine a decision, define a standard, correct course, rebuild structure, and identify what they can do next. Short lessons teach useful distinctions inside the workflow. The user makes the decision and leaves with something they can use.

Built by [Jim Lunsford](https://jimlunsford.com/).

## Status

Phase 1 is closed. This `0.1.0-dev.2` feature branch implements Next Move for staging product review. It has not been merged or launched to production. See [Phase 2 acceptance](docs/PHASE-2-ACCEPTANCE.md) for actual verification and review status. The previous [Phase 1 record](docs/PHASE-1-STATUS.md) remains historical evidence.

## Product family

| Tool | Job | Output |
| --- | --- | --- |
| Decision Room | Examine options, values and consequences | Decision Record |
| Next Move | Define one executable action | Execution Card |
| Reset | Correct a miss and repair its supporting structure | Reset Plan |
| Build a Standard | Define a specific line and how to protect it | Personal Standard |
| Rebuild Map | Connect a larger rebuild to structure and repeated action | Rebuild Map |
| Do It Now | Begin a known action and record what happened | Action Record |

The teaching model is lesson → reflection → decision → action → result. The four frameworks remain distinct: PERIOD Code for values, How to Rebuild Yourself for process, Discipline Loop for reinforcement, and Pure Execution Mode for execution. [Framework sources and mapping](docs/FRAMEWORK-MAP.md).

## Privacy

No account, server-side answer storage, advertising, analytics, third-party scripts, or AI API. Next Move keeps text in memory by default and never submits answers. Explicit saving stores only the Execution Card in the current browser profile. Copy/print happen only when requested. Browser/device behavior and ordinary hosting requests remain relevant privacy limits. Public source alone does not prove a deployed site matches it.

Read [Privacy architecture](docs/PRIVACY-ARCHITECTURE.md). Local saving, per-card deletion, and Delete my local data are implemented in this candidate.

## Develop

Node 24 and npm:

```sh
npm ci
npm run dev
npm test
npm run build
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

Preact + TypeScript + Vite. Static deployment with no server application runtime or database. Build metadata and SHA-256 checksums associate an artifact with its source commit. [Architecture decision](docs/decisions/0001-APPLICATION-ARCHITECTURE.md).

## Documentation

- [Product doctrine](docs/PRODUCT-DOCTRINE.md)
- [Framework map](docs/FRAMEWORK-MAP.md)
- [Tool responsibilities](docs/TOOL-CATALOG.md)
- [Workflow model and handoffs](docs/WORKFLOW-MODEL.md)
- [Output artifact standard](docs/OUTPUT-ARTIFACT-STANDARD.md)
- [Privacy architecture](docs/PRIVACY-ARCHITECTURE.md)
- [UX, accessibility and design direction](docs/UX-AND-ACCESSIBILITY.md)
- [Technical architecture](docs/decisions/0001-APPLICATION-ARCHITECTURE.md)
- [v1 scope and reference-tool recommendation](docs/V1-SCOPE.md)
- [Development](docs/DEVELOPMENT.md) and [testing](docs/TESTING.md)
- [Release and deployment standard](docs/RELEASE-STANDARD.md)
- [Licensing decision](docs/LICENSING-DECISION.md)
- [Phase 1 status](docs/PHASE-1-STATUS.md)
- [Contributing](CONTRIBUTING.md), [security](SECURITY.md), [changelog](CHANGELOG.md)

## License

Copyright (C) 2026 Jim Lunsford.

Original application code, build and test code, repository documentation, and the concise lesson adaptations included here are licensed under the **GNU Affero General Public License, version 3 or later (AGPL-3.0-or-later)**. See [LICENSE](LICENSE) and [COPYRIGHT](COPYRIGHT).

Linked framework articles on JimLunsford.com remain under their existing terms. This software license does not grant a trademark license or imply endorsement by Jim Lunsford. User-created answers and exported records remain the user's work.

Third-party components retain their own licenses and notices. See [third-party notices](THIRD_PARTY_NOTICES.md).
