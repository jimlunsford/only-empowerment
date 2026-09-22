# Development

Use Node 24 (`.nvmrc`) and npm. The repository is canonical. Start from the current remote branch, not an old workstation copy. Keep credentials and infrastructure records out of Git.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

`npm run dev` is for development. The restrictive production CSP can block HMR; use `npm run build` and `npm run preview` to review the shipped behavior. Do not weaken the production policy to enable developer hot reload.

`npm run verify` runs unit checks, build, and browser tests. Browser tests use the production bundle on port 4173. Use synthetic inputs only. Never place actual private reflections in test fixtures, screenshots, traces, issues, or pull requests.

## Contribution workflow

Create short feature branches, open a PR, explain product behavior and privacy implications, pass CI, and review the rendered interface. Main is accepted source. Do not add features outside the documented scope. There is no separate long-lived develop branch.

For a deployable build, commit all source changes first and run:

```sh
OE_RELEASE_BUILD=1 npm run build
```

PowerShell equivalent: set `$env:OE_RELEASE_BUILD='1'`, then run `npm.cmd run build`. Never set credentials in `VITE_*` variables; those are client data. The app requires no runtime secrets.

## Structure

- `src/`: components, routes, catalog, preview, styles.
- `scripts/`: source metadata and build checksums.
- `tests/`: validation/privacy tests and cross-browser shell acceptance.
- `docs/`: product contracts, architecture, scope, operating standards.
- `.github/workflows/ci.yml`: minimal build and browser verification.
- `public/`: local icon and staging robots policy.

Use exact dependency versions and review lockfile changes. One runtime dependency, Preact, currently exists. Do not add a component kit, analytics library, global store, or persistence abstraction without a real workflow need. No HTML injection or user-controlled link rendering.

## Next Move reference

`NextMove.tsx` owns explicit workflow transitions and transient UI. `next-move-model.ts` owns fields, validation, copy and future handoff contract. `next-move-lessons.ts` is the source-governed lesson registry. `local-cards.ts` confines localStorage access to a small artifact API; `use-local-work.ts` owns app-lifetime memory and cross-tab notifications. `SavedWork.tsx` exposes local records and deletion. `components/work.tsx` holds primitives proven by this tool.

The development version is `0.1.0-dev.2`. No dependency was added. Node's built-in TypeScript stripping executes pure model/storage tests; imports for those modules include `.ts` and TypeScript explicitly permits those extensions in this no-emit build.

Normal PR verification has no staging dependency. Optional staging execution runs the same workflow tests against the fixed staging origin, plus host policy checks. Set `OE_STAGING_COMMIT` from independently accepted candidate evidence, never from the live host. The manual CI staging step pins it to the dispatched source commit.


## Phase 5 Reset implementation

`Reset.tsx` owns workflow, read-only explicit Personal Standard selection and artifact review. `reset-model.ts` defines the seven-field plan, validation and exact-standard validity invariant. `reset-lessons.ts` records current governed lessons. `local-resets.ts` extends explicit storage without migrating old schemas. App-lifetime Reset state and cross-tab checks stay in `use-local-work.ts`. The proven grapheme-safe text renderer is shared through `components/artifact-text.tsx` without changing Personal Standard rendering. Version `0.1.0-dev.5`; no dependency additions.
