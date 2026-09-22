# Only Empowerment

**Phase 4 candidate: Build a Standard.** Define a user-owned behavioral line, what keeps or violates it, the structure that protects it, deliberate adaptation, and correction after a miss. Leave with a Personal Standard, Status: Set. No scores, recommendations, rewriting, account, analytics, AI, or answer submission.

Decision Room and Next Move are accepted. This third-tool candidate awaits product review and remains unmerged. Reset, Rebuild Map, and Do It Now remain outlines. [Phase 4 acceptance](docs/PHASE-4-ACCEPTANCE.md) records actual evidence and remaining gates.

**Practical tools for clear thinking, personal standards, and deliberate action.**

Only Empowerment helps people examine a decision, define a standard, correct course, rebuild structure, and identify what they can do next. Short lessons teach useful distinctions inside the workflow. The user makes the decision and leaves with something they can use.

Built by [Jim Lunsford](https://jimlunsford.com/).

## Status

Development version `0.1.0-dev.4`. Accepted base: `1a0909e9e3417c5eaf1f48cafc52da1be9a2d4ee` (`0.1.0-dev.3`). The dedicated feature PR stays draft until owner approval. This is not a production release. Historical acceptance records remain intact.

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

No account, server-side answer storage, advertising, analytics, third-party scripts, or AI API. All three tools keep text in memory by default and never submit answers. Explicit saving stores only the confirmed artifact in this browser profile. Up to 50 saved Only Empowerment records total. Copy and print happen only when requested. Browser/device behavior and ordinary hosting requests remain relevant privacy limits. Public source alone does not prove a deployed site matches it.

Read [Privacy architecture](docs/PRIVACY-ARCHITECTURE.md) and [Build a Standard](docs/BUILD-A-STANDARD.md). Saved Work supports all three artifact types, per-record deletion, and Delete my local data.

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
