# Inconsistency register — Tata Capital replica

Pure replica: no entry is `applied`. The entries below are cap-probe findings recorded for handover only.

## R-01 — Content column cap differs between page types

- **Evidence:** cap-probe (`stardust/current/DESIGN.json` extensions.breakpoints): contentMaxWidth 1140 px on `/`, `/check-credit-score.html`; 1294 px on `/personal-loan.html`, `/home-loan-app.html`; 1200 px on `/privacy-commitment.html`.
- **Finding:** the site's container width is not one value across templates.
- **Minimal change:** none in this run — each archetype keeps its own measured cap.
- **Status:** deferred
- **Where:** all page types

## R-02 — Single-section 1200 px cap on the hidden short lead form

- **Evidence:** cap-probe register line: `section.non-product-short-lead-form.is-hidden > div.container` capped 1200 px on `/privacy-commitment.html`.
- **Finding:** one module caps at a width no other section uses.
- **Minimal change:** none — replicated as measured.
- **Status:** deferred
- **Where:** static (privacy-commitment)
