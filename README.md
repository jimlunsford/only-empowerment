# Only Empowerment

**The free interactive learning companion to The PERIOD Code.**

Read the six complete lessons, Ownership, Purpose, Resilience, Integrity, Discipline, and Empowerment, and explore their six distinct educational examples. The optional PERIOD Standard Card records one intended behavior in the open tab only. About the book, Privacy & source, complete script-free readings, and source/licensing notices remain available.

Built by [Jim Lunsford](https://jimlunsford.com/).

## Work 28 source candidate

Based on verified commit `f15c1ea0b5c8748312b7cac30947a99d7a1f5046`, this branch retires Decision Room, Next Move, Build a Standard, Reset, Rebuild Map, Do It Now, Saved work, and legacy Approach from the public application. Their source modules, runtime storage readers, route handlers, marketing and entry links are removed. Old fragments show an unavailable page with educational navigation.

This is a draft source change only. Development staging still serves the prior release until a separately approved deployment. No merge, deployment, Nginx edit, or actual visitor-data operation is included.

## Preservation and privacy

The complete earlier implementation, tests, documentation and source history remain at the immutable base commit. A checksum manifest covers every baseline file. Offline source/history and original CI artifact preservation, historical verification evidence, restoration instructions, test retirement accounting, and the safe rollback recommendation are documented in [Work 28](docs/WORK-28-RETIREMENT.md).

The application never opens, lists, migrates, exports or automatically changes residual legacy browser records. The Privacy & source deletion control operates only after confirmation, removes only the historical `oe:` local-storage namespace, and never reads record values. Ordinary startup and navigation do not access local storage. The Standard Card remains memory-only and uses its separate Clear this draft action. Old data belongs to its original origin and cannot automatically follow a private/offline deployment to another origin.

There is no account, answer-submission endpoint, AI service, third-party runtime script, or active analytics. Future analytics remain subject to the existing [Analytics policy](docs/ANALYTICS-POLICY.md) and separate authorization. Previously published GitHub history remains publicly readable.

## Develop and verify

Node 24 and npm:

```sh
npm ci
npm run dev
npm run format:check
npm test
npm run build
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

Preact + TypeScript + Vite. Static deployment with no server application runtime or database. Build metadata and SHA-256 checksums associate artifacts with their source commit. The build rejects retired modules in generated application chunks. Both presentation modes and the complete applicable browser suite remain required.

Historical six-tool documents below `docs/` describe the preserved implementation, not current public availability. Their original verification evidence is retained, not relabeled as a passing retirement test. See [testing](docs/TESTING.md), [development](docs/DEVELOPMENT.md), [technical architecture](docs/decisions/0001-APPLICATION-ARCHITECTURE.md), [licensing](docs/LICENSING-DECISION.md), [contributing](CONTRIBUTING.md), and [security](SECURITY.md).

## License

Copyright (C) 2026 Jim Lunsford.

Original application code, build and test code, repository documentation, and the concise lesson adaptations included here are licensed under the **GNU Affero General Public License, version 3 or later (AGPL-3.0-or-later)**. See [LICENSE](LICENSE) and [COPYRIGHT](COPYRIGHT).

Linked framework articles on JimLunsford.com remain under their existing terms. This software license does not grant a trademark license or imply endorsement by Jim Lunsford. User-created answers and exported records remain the user's work.

Third-party components retain their own licenses and notices. See [third-party notices](THIRD_PARTY_NOTICES.md).
