# Learnings

## 2026-11-02 — tatacapital.com replica (10 pages)

- **Closed modals must not read as dialogs.** A modal toggled only by a CSS class keeps `role=dialog` + `aria-modal` in the DOM while closed; the dynamics replay (and assistive tech) sees it as open. Set `hidden` and `aria-modal` only while open.
- **The pipeline renders a `JSON-LD` metadata row as `<script type="application/ld+json">`.** Carry the source's structured data verbatim that way (skip source blocks that are not valid JSON); it closed every `ai-search/jsonld` finding with no code change.
- **Grep served code with `curl --compressed`.** The origin answers compressed; a plain `curl | grep` reads as "not propagated yet" and wastes a polling window.
- **A C-final foundation fix after the gate-all re-freeze trips `foundation-freeze check`** — re-freeze at C-final end, after the last foundation commit.
