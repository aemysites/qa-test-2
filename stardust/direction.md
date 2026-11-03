---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-11-02T09:28:43Z
  againstInput: https://www.tatacapital.com/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://www.tatacapital.com/,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-11-02T09:28:43Z).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(2 entries, both deferred — pure replica: no design delta applied).

Fidelity: ia verbatim · design verbatim · content verbatim.

Scope: the 10 selected pages of stardust/.labs/site-plan.json; source breakpoints kept (no --target-breakpoints); gate widths 1440 (desktop) and 360 (mobile).

## Decision — link targets outside the 10-page scope (E2 link audit, 2026-11-02)

The run's page scope is the 10 selected pages of the site plan. Every other tatacapital.com target the delivered pages, nav and footer link to (≈390 distinct paths: product pages, calculators, contact, insurance, locale roots …) is a SCOPE EXTENSION and is repointed to the source site (absolute `https://www.tatacapital.com/…`), not delivered. Internal (root-relative) links are only the delivered pages: 12 distinct targets, all 200 on aem.live. `localize-links.mjs --check`: 0 localizable links left. Source `.html` URLs of the delivered pages redirect via the redirects sheet.
