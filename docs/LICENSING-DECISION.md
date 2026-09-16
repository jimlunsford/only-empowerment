# Licensing decision, owner approval pending

Public source and an open-source license are separate decisions. This repository is public for inspection. No software license has been granted yet; package metadata says UNLICENSED. Do not describe it as open source until an actual license is adopted. No external code contributions should be merged while contributor terms are unsettled.

## Recommendation

Adopt **AGPL-3.0-or-later for original application code**, subject to Jim's explicit approval. It follows the existing approach confirmed in the current public README files of [Bonumark Stream](https://github.com/jimlunsford/bonumarkstream) and [Intertexere](https://github.com/jimlunsford/intertexere), inspected 2026-09-16.

The desired direction is permission to inspect, use, modify, and redistribute while keeping covered derivative software available under the same copyleft terms, including applicable network-use source obligations. Preserve notices and corresponding source/build instructions. AGPL is not a ban on commercial use, competition, or hosting a modified version. It does not itself prove the privacy of deployed code or grant exclusive ownership of a product name.

| Choice | Reuse and attribution | Derivative openness | Maintenance tradeoff |
| --- | --- | --- | --- |
| AGPL-3.0-or-later | Broad reuse subject to license and notices | Strong copyleft, including relevant network-use source requirement | More compliance/compatibility care; consistent with existing projects |
| GPL-3.0-or-later | Broad reuse subject to distribution requirements | Strong distribution copyleft | Network-only modifications can raise a different disclosure boundary |
| MIT | Broad reuse with notices | Allows closed derivatives | Simple but weaker protection of ongoing openness |
| No license yet | Public inspection does not grant broad reuse rights | No open-source grant | Suitable temporary decision state, poor long-term contribution basis |

Primary references for the final decision: [GNU AGPL](https://www.gnu.org/licenses/agpl-3.0.html), [GitHub licensing guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository). Read the full license before adoption; this recommendation is product-policy reasoning, not a substitute for the license text.

## Authorship and content boundary

Do not relicense the full framework articles merely because the application links to them. Jim's framework names, authorship, personal attribution, and brand identity remain distinct from third-party software notices. Decide explicitly whether original in-app lesson text ships under the code license or a separately stated content license. Do not use a code license to imply trademark endorsement or ownership transfer of the frameworks.

Recommended clean policy for approval: original application code and the concise lesson adaptations included with it under AGPL-3.0-or-later, with clear Jim Lunsford attribution; linked external articles remain under their existing terms; names/logos do not imply endorsement or a separate trademark license. No final grant is applied by this document.

## Adoption checklist

After approval: add the complete LICENSE, update package metadata and README, specify covered code/lesson/doc boundaries, preserve third-party notices, define contributor terms, and ensure deployed source links include the source needed to build the covered version. Do not backdate the decision.
