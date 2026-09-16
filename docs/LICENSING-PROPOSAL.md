# Approved licensing proposal (historical wording)

Jim explicitly approved this proposal on 2026-09-16. The proposal text below is preserved as the decision record, not current implementation status. See LICENSING-DECISION.md and the operative root LICENSE/COPYRIGHT for adoption.

## Exact proposed implementation

1. Add `LICENSE` containing the complete, unmodified GNU Affero General Public License, version 3, 19 November 2007: https://www.gnu.org/licenses/agpl-3.0.txt . The exact full text is prepared in [the reference file](proposals/agpl-3.0-reference.txt), retrieved from GitHub's license API. It is reference material only, not an operative project license. Verify the full text against GNU before adoption. The standard v3 text plus the notices below establish the "or later" choice.
2. Add the identical text to `public/LICENSE.txt` so builds distribute it with the application. Confirm the deployed static-host allowlist serves `/LICENSE.txt` and the checksum manifest includes it.
3. Change `package.json` from `"license": "UNLICENSED"` to `"license": "AGPL-3.0-or-later"`. Update the root package entry in `package-lock.json` to the same identifier without changing dependency versions. Keep `"private": true` to prevent accidental npm publication; this does not change repository visibility.
4. Add `COPYRIGHT` with exactly the notice below. Include it in distributed artifacts as `COPYRIGHT.txt`, with the same provenance/checksum checks as other files.
5. Replace README's entire "License status" section with the exact "License" section below.
6. Update the licensing-decision document to record the actual approval date, scope, and adoption commit. Replace the pending contributor paragraph with the proposed wording below. Do not backdate approval.
7. Replace the current in-app pending-license paragraph with the proposed notice below, linking the license and corresponding public source.
8. Preserve the complete existing Preact MIT notice and build/test dependency notices. Do not rewrite third-party copyright ownership or license terms.

## Proposed COPYRIGHT text

```text
Only Empowerment
Copyright (C) 2026 Jim Lunsford
SPDX-License-Identifier: AGPL-3.0-or-later

Original application code, build and test code, repository documentation,
and the concise lesson adaptations included in this repository are licensed
under the GNU Affero General Public License, version 3 or (at your option)
any later version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE. See LICENSE for the complete terms.

Third-party components retain their own copyright and license notices.
See THIRD_PARTY_NOTICES.md, distributed as THIRD_PARTY_NOTICES.txt.

Articles and other materials hosted on JimLunsford.com are not licensed by
this repository's software license merely because the application links
to them. Their existing terms remain applicable.

No trademark license or endorsement is granted for the Only Empowerment
name, Jim Lunsford name, framework names, logos, or brand identity. This
notice does not narrow the AGPL permissions for covered copyright material
or prohibit accurate attribution and other uses permitted by law.

User-created answers and exported records remain the user's work. Using
Only Empowerment does not subject that work to this software license.
```

## Exact proposed README replacement

```markdown
## License

Copyright (C) 2026 Jim Lunsford.

Original application code, build and test code, repository documentation, and the concise lesson adaptations included here are licensed under the **GNU Affero General Public License, version 3 or later (AGPL-3.0-or-later)**. See [LICENSE](LICENSE) and [COPYRIGHT](COPYRIGHT).

Linked framework articles on JimLunsford.com remain under their existing terms. This software license does not grant a trademark license or imply endorsement by Jim Lunsford. User-created answers and exported records remain the user's work.

Third-party components retain their own licenses and notices. See [third-party notices](THIRD_PARTY_NOTICES.md).
```

## Proposed contributor paragraph

```text
By submitting an original contribution for inclusion, you agree that it may be distributed under AGPL-3.0-or-later. Submit only material you have the right to contribute and preserve applicable third-party notices. Contributions do not transfer copyright ownership. Discuss substantial changes before implementation.
```

## Decision requested after operational staging acceptance

Approve AGPL-3.0-or-later for the stated original code, documentation, and included lesson adaptations, with the external-article, trademark, third-party, and user-output boundaries above?

No license file, package license change, or operative grant is applied by this proposal. If approved, use a separate adoption PR and verify notices in its built artifact before deployment.

## Proposed in-app notice

```text
Copyright (C) 2026 Jim Lunsford. Only Empowerment is free software under
AGPL-3.0-or-later and comes without warranty. You may use, modify, and
redistribute it under that license. View the license and this build's
corresponding source.
```

Link "license" to `/LICENSE.txt` and "corresponding source" to the build's existing full-commit source URL. Keep builder attribution and framework links. This replaces only the pending-license statement after approval.

Reference file SHA-256: `8d56b405468aad11f87ab5763f901e276e08d9646ff5c8481b1762b6b789e9ed`. Keeping this reference in docs/proposals does not apply it to the project.
