# Exact shared copy and route changes

Only these shared strings change. All other existing shared copy and navigation labels remain unchanged.

| Location | Before | After |
| --- | --- | --- |
| Home framework description, `executionHomeCopy` | Learn the five steps through a complete example, then work out how unfinished situations should continue. Keep the action connected to the responsibility, including when the facts call for help, rest, or a change of plan. | Follow one responsibility through the five steps, take over the decisions, then work through a new situation with less guidance. Compare consequences and adjust when the facts call for help, rest or a change of plan. |
| Enhanced and native privacy paragraph, `executionPrivacyCopy` | Pure Execution Mode offers fixed examples and optional explanations. It has no personal answer fields and records no practice results. | Pure Execution Mode uses fixed illustrative choices kept only in memory while its workshop is open. Refreshing, restarting or leaving clears them. Screen addresses contain no choices. There are no personal answer fields, submissions or stored practice results. |
| Native reader return link | Pure Execution Mode with optional explanations | Open the guided workshop |
| Native reader note | Complete reading edition. Every hint and explanation is visible. Use your browser's Print command for paper or PDF. No scripts or answers are required. | Complete reading edition. The accepted teaching and every workshop choice, consequence and explanation are visible. Use your browser's Print command for paper or PDF. No scripts or answers are required. |

## Existing destinations

`#/execution` opens the workshop entry. `/read/execution.html` and every existing native fragment remain unchanged and complete. The root fallback retains all old native aliases.

| Existing section URL | Related workshop screen | Original full reading |
| --- | --- | --- |
| `#/execution?section=why` | `#/execution` | `/read/execution.html#why` |
| `#/execution?section=hesitation` | `#/execution/negotiation` | `/read/execution.html#hesitation` |
| `#/execution?section=method` | `#/execution/identify` | `/read/execution.html#method` |
| `#/execution?section=continue` | `#/execution/take-over` | `/read/execution.html#continue` |
| `#/execution?section=change` | `#/execution/access` | `/read/execution.html#change` |
| `#/execution?section=miss` | `#/execution/your-responsibility` | `/read/execution.html#miss` |
| `#/execution?section=daily` | `#/execution/repeat` | `/read/execution.html#daily` |
| `#/execution?section=transfer` | `#/execution/event` | `/read/execution.html#transfer` |
| `#/execution?section=reference` | `#/execution/reference` | `/read/execution.html#reference` |
| `#/execution?section=identify` | `#/execution/identify` | `/read/execution.html#identify` |
| `#/execution?section=negotiation` | `#/execution/negotiation` | `/read/execution.html#negotiation` |
| `#/execution?section=start` | `#/execution/switch` | `/read/execution.html#start` |
| `#/execution?section=stack` | `#/execution/stack` | `/read/execution.html#stack` |
| `#/execution?section=repeat` | `#/execution/repeat` | `/read/execution.html#repeat` |

The old URL is preserved in the address bar, and the screen explicitly explains its mapping with a link to the full original section. New screens use `#/execution/ID`; `#/execution/welcome` also resolves to entry. Unknown or malformed destinations use the existing not-found page. No server paths, Nginx allowances or TLS changes are required. Native workshop transcript anchors use `/read/execution.html#workshop-ID`; root no-script aliases use `#/execution/ID`.
