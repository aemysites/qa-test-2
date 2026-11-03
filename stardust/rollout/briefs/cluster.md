# C-cluster brief — one template's sibling pages → EDS pages, live and gated on the preview origin

You deliver the SIBLING page(s) of ONE template of a same-design migration (replica flow) of
https://www.tatacapital.com/ to AEM Edge Delivery Services + Document Authoring (DA). The template's archetype
is already LIVE and gated; its blocks are the proven encoder. Your unit (template, archetype slug, sibling slugs,
blocks available) is named in the message that launched you. Other unit agents may run at the same time.
Project root: /workspace/290ff49a (aem-boilerplate; `AGENTS.md` applies). Hands-off: never ask questions.

Read `stardust/rollout/briefs/archetype.md` once: its Inputs, Blocks, Pipeline steps 3–10 and Rules apply to
you verbatim (same scripts, same flags, same bar, same commit and deploy discipline), with these differences.

## Shared servers — already running, never start or stop them

- Prototypes: `http://localhost:8791/<slug>-proposed.html`. Local EDS dev server: `http://localhost:3000`.
  They belong to the main agent. If one does not answer, report it; do not start another on those ports.

## Sibling steps (contract: `/home/node/adobe-skills/plugins/stardust/skills/replica/reference/
handoff-contract.md` § 1, read by section)

1. Variance probe, once, BEFORE encoding (through run-bg):
   `node stardust/scripts/replica/sibling-variance.mjs <archetype-live-url> <sibling-live-url> --probe
   <block>=<source selector> … --width 1440` with the archetype's own section selectors. Exit 0 = clone
   as-is; exit 2 = every delta becomes a block VARIANT class (additive CSS/JS in the existing block, never a
   per-page fork, never changing what the archetype renders). JSON → `stardust/.work/rollout/<unit>/variance.json`.
2. Render (migrate, Path A′): build the sibling's HTML by forking the archetype prototype's structure with
   THIS page's verbatim content from `stardust/current/pages/<slug>.json` / `.html` (hydrated capture) into a
   scratch file under `stardust/.work/rollout/<unit>/`, then
   `node stardust/scripts/migrate/migrate.mjs render <slug> --archetype <slug>=<archetype> --source
   <slug>=<that file>`; record judgments with `migrate.mjs gate|deviation|variant` (`--help`). The driver's
   final `rendered N, unchanged N, refused N, passthrough N` line goes in your report. Then
   `node stardust/scripts/stardust/state.mjs advance <slug> --to migrated --by hands-off` only if the
   driver accepted it (refused = report, do not advance).
3. Encode `content/<slug>.html` (DA document) with the archetype's blocks (template-slotted / reconstructive
   as on the archetype — reuse the archetype unit's encoder script under `stardust/.work/rollout/<archetype
   unit>/` if one exists). Verbatim content; content-count acceptance against the capture (every drop is a
   logged `migrate.mjs deviation` or a fix).
4. Then archetype brief steps 3–10 for your sibling(s): localize-links (only the ten delivered paths become
   root-relative), lints, media upload/reconcile, local structural asserts, commit only your paths + push,
   `deploy-batch.mjs` with `--paths stardust/rollout/units/<unit>.paths --ledger
   stardust/deploy/ledger-<unit>.json` (publishes), gate-all `--only <siblings>` on the preview host at 1440
   and 360, crop-compare header/footer once, fix rounds cap 3, update-coverage, `## <unit>` section in
   `stardust/eds-conversion-log.md`. A block change must not regress the archetype page: after any block
   CSS/JS change re-run gate-all `--only <archetype>,<siblings>` at the affected width.

## Report (your final message, nothing else)

Line 1: `render-<template>: <driver final line>`.
Line 2: `<unit>: pages n/n live, blocks reused k (+v variants), gate 1440 x% Δh y% clip c miss m / 360 x% Δh y%
clip c miss m, crop header a%/footer b%, rounds r, requests q`.
Then one line per residual left over the bar with its cause.
