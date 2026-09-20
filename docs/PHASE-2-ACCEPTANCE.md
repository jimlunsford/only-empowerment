# Phase 2: Next Move reference candidate

Status: implemented, verification in progress, not accepted. Phase 1 is closed.

Branch: `feature/next-move-v1`, PR #4 (draft), based on accepted main `bd984a8986a658c6bd0d0d663c4e30f5c2f09d80`. Version `0.1.0-dev.2`. No new dependencies.

Next Move alone is implemented. Six lessons/questions lead through situation, owned action, readiness, obstacle, start condition, and completion boundary. A clean pause is valid. Editable review produces a Planned Execution Card. Copy, fallback text, print, explicit saving, saved work, per-record/all-version deletion, and cross-tab notifications are implemented. Other tools remain outlines.

Source registry: `src/next-move-lessons.ts`. Pure Execution Mode and Core Frameworks live pages re-reviewed 2026-09-20. Product doctrine unchanged. Jim's lesson and product approval remains pending.

Executed locally: 13 model/storage/privacy tests pass; TypeScript passes; production build passes; npm audit reports zero vulnerabilities. Local browser download timed out, and the cloud browser cannot open the local preview. Four-engine CI has exercised all workflow, pause, storage, network, escaping, and axe checks. The second run passed 62 tests; six harness checks need correction (native dialog tab-order assumptions and browser screenshot dimension limits). Full acceptance requires a green run on the final candidate. Deployed browser tests, source/artifact byte comparison, and VPS backup verification remain pending. No WCAG conformance claim is made. True assistive-technology and physical phone keyboard testing have not been performed.

VPS read-only inspection confirmed `vps1.phoenix233.com`, accepted foundation current pointer, existing restrictive CSP/noindex, and active VPS-wide backup/maintenance timers. Last daily service result was success. Privileged Nginx/backup/deployment steps need the owner's sudo invocation because this connection has no noninteractive elevation. Do not change sudoers or credentials.

The owner authorized deployment of the exact verified feature candidate to staging for product review. Preserve immutable releases and rollback. Keep PR draft/unmerged. Production and tags remain untouched. This record must be completed with actual acceptance evidence before reporting the candidate ready.

## Visual and accessibility review

CI-rendered desktop and mobile views have been inspected for all six lessons, review, artifact, pause, save confirmation, saved list, and deletion confirmation. The action example was moved into an optional disclosure to reduce mobile lesson height. Brand/navigation wrapping and long headings were refined after 200% text enlargement exposed overflow. Printed hostile and multiline content was rendered from Chromium Save as PDF: text wraps across eight readable pages with white backgrounds, margins, no navigation/buttons/banner, and no clipped answers. This stress record contains over 240 intentional line breaks. The PDF is not tagged; no accessible-PDF claim is made.

Automated checks include keyboard field progression and modal focus, axe in workflow/error/review/card/dialog/saved states, widths 320/360/390/1024/1440, 200% text enlargement, reduced motion, forced colors, and 320-CSS-pixel reflow. The latter models the space available at 400% zoom on a 1280-pixel viewport; it is not a claim of physical browser zoom or mobile keyboard hardware testing. Actual NVDA, VoiceOver, TalkBack or equivalent screen-reader testing is unavailable in this environment and remains a specific limitation.

Final immutable candidate SHA, CI artifact comparison, live deployment/backup evidence, and product review status belong in the draft PR acceptance report so evidence can identify the exact deployed source without rebuilding to insert its own SHA. A report must not mark a pending check as passed.
