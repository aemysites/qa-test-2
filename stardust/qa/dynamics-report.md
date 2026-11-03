# Dynamics parity check — https://main--290ff49a--aemcoder.aem.live — 2026-11-02T17:28:15.340Z

Replayed 7 checks over 10 features · pass 7 · fail 0. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| video popover (related videos) | M | done | click-dialog | PASS | dialog 1440px · heading "" · 0 fields · iframe · Escape closes: true | www.youtube.com:200×13 fonts.gstatic.com:200×3 static.doubleclick.net:200×1 googleads.g.doubleclick.net:302×1 googleads.g.doubleclick.net:200×1 www.google.com:200×1 rr4---sn-o097znzd.googlevideo.com:200×2 i.ytimg.com:200×4 yt3.ggpht.com:200×2 www.youtube.com:204×4 www.gstatic.com:200×1 jnn-pa.googleapis.com:200×1 |
| video popover (loan steps) | M | done | click-dialog | PASS | dialog 1440px · heading "" · 0 fields · iframe · Escape closes: true | www.youtube.com:200×13 fonts.gstatic.com:200×3 static.doubleclick.net:200×1 googleads.g.doubleclick.net:302×1 googleads.g.doubleclick.net:200×1 www.google.com:200×1 i.ytimg.com:200×6 rr5---sn-o097znss.googlevideo.com:200×2 www.gstatic.com:200×1 yt3.ggpht.com:200×2 www.youtube.com:204×4 jnn-pa.googleapis.com:200×1 |
| video popover (app steps) | M | done | click-dialog | PASS | dialog 1440px · heading "" · 0 fields · iframe · Escape closes: true | www.youtube.com:200×13 fonts.gstatic.com:200×3 static.doubleclick.net:200×1 googleads.g.doubleclick.net:302×1 www.google.com:200×1 googleads.g.doubleclick.net:200×1 i.ytimg.com:200×6 rr5---sn-o097znss.googlevideo.com:200×2 yt3.ggpht.com:200×2 www.gstatic.com:200×1 www.youtube.com:204×4 jnn-pa.googleapis.com:200×1 |
| CSR video modal | M | done | click-dialog | PASS | dialog 1440px · heading "That Travel Deal Looks Perfect… But Did You Check the Fine Print?" · 0 fields · iframe · Escape closes: true | www.youtube.com:200×13 fonts.gstatic.com:200×2 static.doubleclick.net:200×1 googleads.g.doubleclick.net:302×1 www.google.com:200×1 googleads.g.doubleclick.net:200×1 i.ytimg.com:200×2 yt3.ggpht.com:200×2 www.youtube.com:204×1 jnn-pa.googleapis.com:200×1 |
| EMI / eligibility calculators (client-only) | F | done | dom-count | PASS | 4 × .home-calculator input (min 1) |  |
| EMI / eligibility calculators (client-only) | F | done | dom-count | PASS | 74 × .calculator-tab a (min 3) |  |
| page runtime (all pages) | X | done | no-page-errors | PASS | none on 10 page(s) |  |

## Features without checks

- short lead form + OTP form, pre-approved offer form, newsletter (F) — scaffolded-awaiting-owner · owner: provide a secured lead-capture endpoint (and OTP service) for the forms to post to
- first-party MDM APIs (mitc-pdfs, minmaxmaster, stampdutymaster) (A) — interim · owner: decide whether to feed these from a sheet synced from the source API
- header Smart Search (third-party senseforth) (S) — interim · owner: keep the senseforth vendor or replace it with an index-backed search
- sign-in / account links (X) — decided-out
