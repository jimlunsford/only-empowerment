# ADR 0001: Modest browser application

Status: accepted for Phase 1. Decision date: 2026-09-16.

## Options

| Option | Strength | Cost / risk | Decision |
| --- | --- | --- | --- |
| Plain TypeScript and DOM | Few runtime dependencies; familiar platform | Six stateful workflows would need repeated rendering, focus, validation, and output coordination | Not selected |
| Preact + TypeScript + Vite | Small component runtime; explicit local state; static deployment; familiar component model | JSX/toolchain learning; smaller ecosystem; manage accessibility ourselves | Selected |
| React + TypeScript + Vite | Broad ecosystem and contributor familiarity | More runtime weight than this app currently needs | Viable alternative, no current need |
| Vue or Svelte | Cohesive components and efficient output | Additional conventions/compiler knowledge with no decisive requirement advantage here | Viable, not selected |
| Next.js / full-stack SSR framework | Routing and server/data features | Server runtime and data pathways the product does not need | Reject for current scope |

A component runtime is justified by shared lessons, controlled responses, state transitions, and outputs. A backend, global state library, UI framework, generic form engine, CMS, and database are not justified.

## Architecture

Preact function components with hooks. TypeScript strict mode for tool contracts. Vite builds static assets. Exact direct versions plus committed npm lockfile; Node 24 pinned by `.nvmrc`. Nginx serves build files without a Node, PHP, or database runtime.

Hash routing is sufficient for a tool application without article SEO. A short explicit route map uses native links and the browser Back/Forward stack. It avoids server rewrite dependencies and keeps tool identifiers out of request paths. Hashes contain only route IDs, never answers. If routes grow beyond this small catalog, replace the route switch with a maintained lightweight router rather than building a custom routing framework.

Per-tool component state and explicit transitions; no global store. Current preview state is deliberately discarded on exit. Future shared persistence service must sit behind explicit user actions, never automatic component side effects. Output mappers are pure functions and text-only. Handoffs are reviewed in-memory payloads, not query strings.

Source responsibilities: `model.ts` owns catalog/contracts; shared components own lesson/source/intro presentation; `Preview.tsx` is an explicitly disposable architecture demonstration; `main.tsx` composes shell and static pages; CSS owns responsive/print behavior. Split route components as real tools arrive, not in anticipation of dozens of routes.

## Build metadata

Build configuration reads version from package.json and commit/tag/dirty state from Git. `OE_RELEASE_BUILD=1` fails when the working tree is dirty. The footer refuses to imply a dirty build exactly matches its base commit. `build.json` exposes full metadata. `SHA256SUMS` covers all other built files. No build timestamp is embedded, avoiding unnecessary nondeterminism. CI builds accepted commits; production requires an intentional matching version tag and release artifact.

## Browser and offline support

Build target: Chrome/Edge 109, Firefox 115, Safari 16.4 or newer; actual support requires tests. Initial automation targets current Chromium, Firefox, and WebKit; real iOS/Android and assistive technology checks remain release gates. Clipboard can fail and has a manual fallback.

The static architecture supports a future service worker/offline shell without changing the core workflow model. No service worker or install claim in Phase 1. Later caching must define update notification, stale code/privacy behavior, cache deletion, and interactions with saved schemas before becoming a feature.

## Deployment and boundaries

Static public build only; no source checkout in web root. No runtime secrets. Local-only scripts, strict CSP, no inline executable script, no unsafe HTML, no remote response processing. Preview server is a development tool, not production hosting. See release, privacy, security, and testing documents for gates.

## Sources reviewed

[Preact guide](https://preactjs.com/guide/v10/getting-started/), [Vite guide](https://vite.dev/guide/), and [WCAG 2.2](https://www.w3.org/TR/WCAG22/), reviewed 2026-09-16. Exact installed dependency versions and integrity hashes are in package-lock.json. The stack choice is product judgment, not a claim that other frameworks cannot meet these requirements.
