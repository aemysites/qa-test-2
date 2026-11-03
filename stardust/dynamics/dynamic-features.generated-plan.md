<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-11-02T10:45:48.735Z · input stardust/current/_dynamics.json (6 pages, 70 findings) · reconciled against stardust/migrated -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · target = the delivery form (widget where no authored rows remain) · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | target | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-unknown-third-party-host-smart-search-senseforth-com | A | unknown third-party host smart-search.senseforth.com | 6/6 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 2 | a-first-party-api-get-api-master-web-api-mdm-export-mitc-pdf | A | first-party API GET /api/master/web/api/mdm/export/mitc-pdfs.json | 6/6 (reach 10/10) | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 3 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 6/6 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 4 | a-cms-app-settings-object-adobedatalayer | A | CMS / app settings object adobeDataLayer | 6/6 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 5 | a-cms-app-settings-object-appconfig | A | CMS / app settings object appConfig | 6/6 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 6 | a-cms-app-settings-object-cq | A | CMS / app settings object CQ | 6/6 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 7 | a-unknown-third-party-host-www-google-com | A | unknown third-party host www.google.com | 5/6 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 8 | a-unknown-third-party-host-mpc2-prod-28-is5qnl632q-ue-a-run- | A | unknown third-party host mpc2-prod-28-is5qnl632q-ue.a.run.app | 5/6 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 9 | a-unknown-third-party-host-mpc2-prod-23-is5qnl632q-ue-a-run- | A | unknown third-party host mpc2-prod-23-is5qnl632q-ue.a.run.app | 5/6 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 10 | a-first-party-api-get-api-master-web-api-mdm-export-minmaxma | A | first-party API GET /api/master/web/api/mdm/export/minmaxmaster.json | 2/6 (reach 3/10) | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 11 | a-first-party-api-get-api-master-web-api-mdm-export-stampdut | A | first-party API GET /api/master/web/api/mdm/export/stampdutymaster.json | 2/6 (reach 2/10) | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 12 | cr-client-rendered-slot-sticky-actions-js-sticky-actions-clo | CR | client-rendered slot sticky-actions js-sticky-actions close-on-outside | 5/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 13 | cr-client-rendered-slot-js-fi-slider-slider-dots-financial-i | CR | client-rendered slot js-fi-slider slider-dots financial-insights-slider-dots | 3/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 14 | cr-client-rendered-slot-overviews-tab-box-js-floating | CR | client-rendered slot overviews-tab-box js-floating | 3/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 15 | cr-client-rendered-slot-subnav-apply-popup-js-subnav-popup-s | CR | client-rendered slot subnav-apply-popup js-subnav-popup subnav-mobile-journey-modal | 3/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 16 | cr-client-rendered-slot-subnav-popup-step-js-subnav-step1 | CR | client-rendered slot subnav-popup-step js-subnav-step1 | 3/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 17 | cr-client-rendered-slot-js-subnav-product-select | CR | client-rendered slot js-subnav-product-select | 3/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 18 | cr-client-rendered-slot-subnav-popup-step-js-subnav-step2-d- | CR | client-rendered slot subnav-popup-step js-subnav-step2 d-none | 3/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 19 | cr-client-rendered-slot-subnav-apply-popup-js-subnav-consent | CR | client-rendered slot subnav-apply-popup js-subnav-consent-popup subnav-mobile-journey-modal | 3/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 20 | cr-client-rendered-slot-subnav-consent-wrap-js-subnav-consen | CR | client-rendered slot subnav-consent-wrap js-subnav-consent-wrap | 3/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 21 | cr-client-rendered-slot-subnav-consent-modal-js-subnav-terms | CR | client-rendered slot subnav-consent-modal js-subnav-terms-popup | 3/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 22 | cr-client-rendered-slot-js-fi-slider-financial-insights-slid | CR | client-rendered slot js-fi-slider financial-insights-slider-dots slider-arrows | 2/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 23 | cr-client-rendered-slot-subnav-apply-popup-non-product-short | CR | client-rendered slot subnav-apply-popup non-product-short-lead-modal js-np-slf-popup | 2/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 24 | cr-client-rendered-slot-subnav-popup-step-non-product-consen | CR | client-rendered slot subnav-popup-step non-product-consent-step js-np-slf-consent-step | 2/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 25 | cr-client-rendered-slot-irs-irs-round-js-irs-28 | CR | client-rendered slot irs irs--round js-irs-28 | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 26 | cr-client-rendered-slot-custom-dropdown-name-dropdown-filter | CR | client-rendered slot custom-dropdown name-dropdown-filter close-on-outside | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 27 | cr-client-rendered-slot-irs-irs-round-js-irs-20 | CR | client-rendered slot irs irs--round js-irs-20 | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 28 | cr-client-rendered-slot-irs-irs-round-js-irs-27 | CR | client-rendered slot irs irs--round js-irs-27 | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 29 | cr-client-rendered-slot-irs-irs-round-js-irs-12 | CR | client-rendered slot irs irs--round js-irs-12 | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 30 | cr-client-rendered-slot-irs-irs-round-js-irs-15 | CR | client-rendered slot irs irs--round js-irs-15 | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 31 | cr-client-rendered-slot-irs-irs-round-js-irs-17 | CR | client-rendered slot irs irs--round js-irs-17 | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 32 | cr-client-rendered-slot-irs-irs-round-js-irs-18 | CR | client-rendered slot irs irs--round js-irs-18 | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 33 | cr-client-rendered-slot-cmp-container-personal-loan-slider-j | CR | client-rendered slot cmp-container personal-loan-slider js-personal-loan-slider | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 34 | cr-client-rendered-slot-non-product-consent-copy-js-np-slf-t | CR | client-rendered slot non-product-consent-copy js-np-slf-terms-content | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 35 | cr-client-rendered-slot-non-product-consent-scroll-simple-ba | CR | client-rendered slot non-product-consent-scroll simple-bar js-np-slf-terms-scroll | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 36 | cr-client-rendered-slot-subnav-popup-step-js-np-slf-otp-step | CR | client-rendered slot subnav-popup-step js-np-slf-otp-step | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 37 | cr-client-rendered-slot-js-np-slf-otp-form | CR | client-rendered slot js-np-slf-otp-form | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 38 | cr-client-rendered-slot-subnav-popup-step-subnav-success-wra | CR | client-rendered slot subnav-popup-step subnav-success-wrap js-np-slf-failure-step | 1/6 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 39 | f-form-short-lead-form-fields-third-party-1-fields | F | form "short-lead-form-fields" → third-party  (1 fields) | 3/6 | rebuild-native | block | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 40 | f-form-js-np-slf-otp-form-third-party-4-fields | F | form "js-np-slf-otp-form" → third-party  (4 fields) | 3/6 | rebuild-native | block | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 41 | f-form-preapprovedloanform-no-action-js-wired-2-fields | F | form "preApprovedLoanForm" → no action (JS-wired) (2 fields) | 1/6 | client-only | widget | self | pending | client-compute | none |  |
| 42 | f-form-preapprovedotp-no-action-js-wired-4-fields | F | form "preApprovedOtp" → no action (JS-wired) (4 fields) | 1/6 | client-only | widget | self | pending | client-compute | none |  |
| 43 | f-form-less-control-group-in-section-6-controls | F | form-less control group in section. (6 controls) | 1/6 | client-only | widget | self | pending | client-compute | none |  |
| 44 | f-form-less-control-group-in-article-calc-banner-box-4-contr | F | form-less control group in article.calc-banner-box (4 controls) | 1/6 | client-only | widget | self | pending | client-compute | none |  |
| 45 | i18n-locale-variants-en-hi-mr-bn-gu-kn-te-ta | I18N | locale variants en,hi,mr,bn,gu,kn,te,ta | 6/6 | rebuild-native | runtime | needs-business-decision | delivered-by-capture | locale-tree | scope of the locale trees | output already carries "https://apps.apple.com/in/app/tata-capit" |
| 46 | l-listing-candidate-slick-track-9-cards | L | listing candidate slick-track (9 cards) | 1/6 | index-backed | block | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 47 | m-modal-trigger-js-bannerpopup-target-outside-dom-at-capture | M | modal trigger js-bannerPopup → target outside DOM at capture | 6/6 (reach 10/10) | rebuild-native | runtime | self | pending | modal-loader | none |  |
| 48 | m-modal-trigger-data-popovermodal-chrome-only-div-form | M | modal trigger data-popovermodal (chrome only) → div:form | 4/6 (reach 3/10) | rebuild-native | runtime | self | delivered-by-capture | chrome-interaction | none (the header contract is the spec) | output already carries "Download App" |
| 49 | m-modal-trigger-aria-haspopup-chrome-only-textbox-content | M | modal trigger aria-haspopup (chrome only) → textbox:content | 2/6 (reach 12/10) | rebuild-native | runtime | self | delivered-by-capture | chrome-interaction | none (the header contract is the spec) | output already carries "Language" |
| 50 | m-modal-trigger-aria-haspopup-textbox-content | M | modal trigger aria-haspopup → textbox:content | 2/6 (reach 12/10) | rebuild-native | runtime | self | delivered-by-capture | modal-loader | none | output already carries "Read More" |
| 51 | m-modal-trigger-data-popovermodal-video-target-outside-dom-a | M | modal trigger data-popovermodal-video → target outside DOM at capture | 2/6 (reach 10/10) | rebuild-native | runtime | self | pending | modal-loader | none |  |
| 52 | m-modal-trigger-data-popovermodal-div-form-div-iframe | M | modal trigger data-popovermodal → div:form/div:iframe | 2/6 (reach 3/10) | rebuild-native | runtime | self | delivered-by-capture | modal-loader | none | output already carries "Download App" |
| 53 | m-modal-trigger-jsmodalongetcall-target-outside-dom-at-captu | M | modal trigger jsModalOnGetCall → target outside DOM at capture | 1/6 (reach 3/10) | rebuild-native | runtime | self | delivered-by-capture | modal-loader | none | output already carries "javascript:void(0)" |
| 54 | m-modal-trigger-aria-haspopup-target-outside-dom-at-capture | M | modal trigger aria-haspopup → target outside DOM at capture | 1/6 (reach 12/10) | rebuild-native | runtime | self | delivered-by-capture | modal-loader | none | output already carries "Read More" |
| 55 | t-tag-manager-adobe-launch | T | tag manager: Adobe Launch | 6/6 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 56 | t-tag-manager-google-tag-manager | T | tag manager: Google Tag Manager | 6/6 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 57 | t-analytics-session-replay | T | analytics: session replay | 6/6 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 58 | t-analytics-adobe-analytics-experience-cloud-id | T | analytics: Adobe Analytics / Experience Cloud ID | 6/6 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 59 | t-analytics-google-analytics-ads | T | analytics: Google Analytics / Ads | 6/6 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 60 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 6/6 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 61 | t-third-party-mount-div-data-sliderid-tag-manager-injected-w | T | third-party mount <div data-sliderid> (tag-manager-injected widget) | 6/6 | embed-passthrough | embed | needs-credential | pending | embed-passthrough | vendor account ids stay the owner's |  |
| 62 | t-unknown-third-party-host-c-bing-com | T | unknown third-party host c.bing.com | 5/6 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 63 | t-unknown-third-party-host-adservice-google-com | T | unknown third-party host adservice.google.com | 5/6 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 64 | t-unknown-third-party-host-www-facebook-com | T | unknown third-party host www.facebook.com | 5/6 | embed-passthrough | embed | needs-business-decision | delivered-by-capture | consent-gated-tags | which tags run on the new host; property ids | output already carries "www.facebook.com" |
| 65 | v-iframe-without-src-runtime-injected-embed | V | iframe without src (runtime-injected embed) | 4/6 | embed-passthrough | embed | needs-human-capture | delivered-by-capture | embed-passthrough | resolve the runtime src from a rendered capture | output already carries "Analytics" |
| 66 | x-sign-in-account-links | X | sign-in / account links | 6/6 | decided-out | — | needs-backend | delivered-by-capture | decided-out | auth / commerce on the new host? | output already carries "https://corporateservices.tatacapital.co" |
| 67 | chrome-locale | I18N | header locale: English हिन्दी বাংলা ગુજરાતી मराठी ಕನ್ನಡ తెలుగు தமிழ் (chrome only) | 1/1 | rebuild-native | runtime | needs-business-decision | pending | locale-tree | which locales the switcher lists |  |
| 68 | chrome-drawer | M | header drawer: Open navigation menu (chrome only) | 1/1 | rebuild-native | runtime | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 69 | chrome-search | S | header search: Open Smart Search (chrome only) | 1/1 | index-backed | widget | self | pending | search-index-backed | none (results from the query index; overlay and typeahead per the contract) |  |
| 70 | chrome-menu | M | header menu: menu (chrome only) | 1/1 | rebuild-native | runtime | self | pending | chrome-interaction | none (the header contract is the spec) |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 40 row(s) — read-settings, settled-dom-snapshot, client-compute, modal-loader, chrome-interaction, search-index-backed.
- **One owner decision batch:** 20 row(s) — inspect the XHR, add a vendor row · which tier for the target host; consumer on the migrated pages? · production endpoint; interim capture ships now · index-driven or editorially curated? · which tags run on the new host; property ids · vendor account ids stay the owner's.
- **Already delivered by the capture pipeline:** 10 row(s) — no work.
- **Host-bound on the target:** 0 of 0 probed API paths — the off-origin data work.

## Phases

- **capture** — 27
- **interactive** — 12
- **tags** — 9
- **detect** — 8
- **client tools** — 4
- **off-origin data** — 3
- **forms** — 2
- **embeds** — 2
- **locale wave** — 1
- **listings** — 1
- **register** — 1
