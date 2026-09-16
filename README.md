# Only Empowerment

**Practical tools for clear thinking, personal standards, and deliberate action.**

Only Empowerment helps people examine a decision, define a standard, correct course, rebuild structure, and identify what they can do next. Short lessons teach useful distinctions inside the workflow. The user makes the decision and leaves with something they can use.

Built by [Jim Lunsford](https://jimlunsford.com/).

## Status

Phase 1 foundation, version `0.1.0-dev.1`. Six tools are planned; none is complete. The shell includes tool outlines and a limited interaction preview, not a finished Next Move workflow. The production domain is preserved. Review the [live staging foundation](https://dev.onlyempowerment.com/) and its [operational acceptance](docs/STAGING-ACCEPTANCE-2026-09-16.md). See [Phase 1 status](docs/PHASE-1-STATUS.md) for current verification and staging status.

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

No account, server-side answer storage, advertising, analytics, third-party scripts, or AI API. The current preview keeps text in browser memory only and does not intentionally submit it. Copy/print happen only when requested. Browser/device behavior and ordinary hosting requests remain relevant privacy limits. Public source alone does not prove a deployed site matches it.

Read [Privacy architecture](docs/PRIVACY-ARCHITECTURE.md). Optional browser-local saving and deletion are planned, not implemented.

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

## License status

**Public source; licensing decision pending.** No open-source license has yet been granted for original project material. AGPL-3.0-or-later is recommended for owner consideration. Do not infer a permissive grant from repository visibility. Third-party dependencies retain their own licenses. See [third-party notices](THIRD_PARTY_NOTICES.md).
