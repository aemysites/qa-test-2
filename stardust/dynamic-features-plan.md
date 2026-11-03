# Dynamic features plan — www.tatacapital.com (replica, 10 pages)

Static first, then wire. Every phase ends verified on the published origin at 1440 and 360.

| Phase | Deliverable | Authoring contract | Verification | Owner decision | Effort |
|---|---|---|---|---|---|
| D0 static | Every page renders its settled DOM content (client-rendered slots, sliders, tab boxes, popup steps) as authored blocks / default content | captured text verbatim | source-fidelity gate + gate-all | none | in Phase 3/5 |
| D1 chrome runtime | Header drawer (mobile), menus, locale switcher (links to source locale pages), search box UI | nav/footer documents | chrome-compare vs `stardust/chrome/header-contract.json` | search vendor (senseforth) keep/replace | S |
| D2 client-only tools | EMI / eligibility calculators (ion-range sliders) on home, home-loan, personal-loan, calculator: inline JS, no network | widget `widgets/calculator/emi` with config attributes; numbers from the source formulas | motion/interaction parity; values match source for 3 input sets | none (self) | M |
| D3 modals | Banner popup, video popovers, "get a call" modal, pre-approved offer popup — runtime modal loader | modal content authored as fragments | motion-observe live vs build | none (self) | S |
| D4 forms (interim) | Short lead form + OTP form UI; submission blocked with "no backend connected" | form fields from capture | submit shows notice, no request leaves | secured endpoint for lead capture (needs-backend) | S |
| D5 tags (scaffolded off) | `scripts/site-config.js` placeholders for Adobe Launch / GTM / analytics | none | none | keep tags on new host | — |

Host-bound: 3 first-party `/api/master/web/api/*` paths 404 on the target → their content ships as captured snapshot (data-fed interim).
