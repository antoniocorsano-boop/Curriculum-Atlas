# ATLAS-P1.1-S3 — Visual QA

Status: IMPLEMENTED_PENDING_AUTOMATED_AND_HUMAN_VALIDATION  
Date: 2026-09-19  
Parent: ATLAS-P1 #3  
Quality authority: docs/product/ATLAS_P1_1_INTERACTION_VISUAL_QUALITY.md

## Scope

This slice changes only visual readability and hierarchy inside the dark Map experience.

Implemented:
- scoped semantic dark-map tokens;
- explicit high-contrast text colors for Map brand and Inspector;
- readable node/segment titles;
- readable section headings;
- readable relation title/body/metadata;
- readable provenance labels/values;
- improved typography hierarchy;
- slightly clearer relation/fact surfaces;
- clearer sheet controls and drag handle;
- no layout or data-flow redesign.

## Explicit non-goals

This slice does not implement:
- Map control reduction;
- progressive disclosure;
- search-first navigation;
- Perspectives;
- semantic zoom;
- Visual/List parity;
- Curriculum Health.

Those remain P1.1-S4…S9.

## Design-time contrast check

Reference colors:

- panel: `#071423`
- raised panel: `#0d1b2d`
- primary text: `#f4f8fb`
- secondary text: `#d6e1ea`
- muted text: `#a8b8c8`
- accent text: `#8bdcff`
- disclosure text: `#cfe7ff`

Approximate contrast ratios against the two solid reference dark backgrounds:

- primary: 17.35:1 / 16.23:1
- secondary: 13.96:1 / 13.05:1
- muted: 9.14:1 / 8.55:1
- accent: 12.16:1 / 11.37:1
- disclosure: 14.58:1 / 13.64:1

These are **design-time reference checks**, not a declaration of full WCAG PASS.  
Rendered opacity/compositing, focus states, real devices and projection still require validation.

## Gate

### Automated
- [x] P1.1-S3-GA1 — data validator PASS on `a0d8723d4d503713d37bc2228365c03adde8b17d`;
- [x] P1.1-S3-GA2 — TypeScript PASS;
- [x] P1.1-S3-GA3 — production build PASS.

### Visual Android
- [ ] P1.1-S3-GH1 — Map brand title is clearly readable;
- [ ] P1.1-S3-GH2 — Inspector main title is clearly readable;
- [ ] P1.1-S3-GH3 — section headings are clearly readable;
- [ ] P1.1-S3-GH4 — relation cards have readable title/body/meta hierarchy;
- [ ] P1.1-S3-GH5 — provenance labels/values are readable when opened;
- [ ] P1.1-S3-GH6 — disabled sheet action remains distinguishable without looking broken;
- [ ] P1.1-S3-GH7 — no new visual crowding is introduced.

### Regression
- [ ] P1.1-S3-GR1 — S1 mobile navigation unchanged;
- [ ] P1.1-S3-GR2 — S2 bottom sheet behavior unchanged;
- [ ] P1.1-S3-GR3 — Map controls/modes unchanged;
- [ ] P1.1-S3-GR4 — no curriculum/LO/provenance data contract change;
- [ ] P1.1-S3-GR5 — 3D lazy loading unchanged.

## Human validation

On Android:
1. Open Mappa.
2. Select a node.
3. Capture one compact/medium Inspector screenshot.
4. Expand and capture one screenshot with a relation card.
5. Open **Fonte e tracciabilità** and capture the provenance area.

Check especially:
- title visibility;
- relation copy;
- metadata;
- hierarchy;
- disabled control clarity.

## Promotion rule

S3 closes only after:
- exact-head automated PASS;
- visual Android PASS;
- regression review PASS.

Passing S3 does not validate progressive disclosure or later P1.1 slices.


## Automated receipt

GitHub Actions `Curriculum Atlas Quality Gate` run `35459613827`: PASS on exact head `a0d8723d4d503713d37bc2228365c03adde8b17d`.
