# ATLAS-P1.1-S1 — Mobile Navigation

Status: HUMAN_MOBILE_PASS_PENDING_FINAL_EXACT_HEAD  
Date: 2026-09-19  
Parent: ATLAS-P1 #3  
Quality authority: docs/product/ATLAS_P1_1_INTERACTION_VISUAL_QUALITY.md

## Scope

This slice fixes only the public primary navigation on small screens.

Implemented:
- four persistent primary destinations on mobile:
  - Curricolo
  - Percorsi
  - Materiali
  - Mappa
- Fonti moved out of the primary mobile row into a secondary utility action;
- no horizontal scrolling required for the primary mobile navigation;
- 48 px minimum height for mobile primary navigation targets;
- desktop navigation remains unchanged with all five destinations visible.

## Explicit non-goals

This slice does not implement:
- mobile bottom sheet;
- Map control reduction;
- contrast redesign;
- progressive disclosure;
- search-first / Ask Atlas;
- Perspectives;
- semantic zoom;
- Visual/List parity;
- Curriculum Health.

Those remain P1.1-S2…S9.

## Gate

### Automated
- [x] P1.1-S1-GA1 — data validator PASS on `73357d976390314792beeae64c2ef1019b06b8e1`;
- [x] P1.1-S1-GA2 — TypeScript PASS;
- [x] P1.1-S1-GA3 — production build PASS.

### Human mobile
- [x] P1.1-S1-GH1 — no horizontal primary-nav overflow at Android viewport — PASS from Android screenshot;
- [x] P1.1-S1-GH2 — all four primary tasks are visible without swiping — PASS from Android screenshot;
- [x] P1.1-S1-GH3 — Fonti remains reachable as a secondary action — PASS from Android screenshot;
- [x] P1.1-S1-GH4 — active section styling preserved by unchanged active-state rule; prior Map human evidence remains applicable;
- [x] P1.1-S1-GH5 — touch targets are visibly separated/non-overlapping; 48 px minimum enforced by CSS.

### Regression
- [x] P1.1-S1-GR1 — desktop shows Curricolo / Percorsi / Materiali / Mappa / Fonti; desktop nav data unchanged.
- [x] P1.1-S1-GR2 — Materials critical journey remains reachable; route/state contract unchanged.
- [x] P1.1-S1-GR3 — Mappa remains reachable and lazy-loaded; MapExperience loading path unchanged.
- [x] P1.1-S1-GR4 — no data/lifecycle/provenance contract changes; scoped diff only header/CSS/acceptance.

## Human validation prompt

On Android:
1. Open the P1.1-S1 preview.
2. Confirm that the header shows the brand and a secondary **Fonti** action.
3. Confirm the next row contains exactly:
   **Curricolo · Percorsi · Materiali · Mappa**
4. Confirm the row does not scroll horizontally.
5. Open each destination once.
6. Return to Materiali and confirm the existing LO journey is unchanged.

Report:
- device/browser;
- PASS/FAIL;
- screenshot;
- any clipping/overlap.

## Promotion rule

Only a human PASS on mobile navigation may close P1.1-S1.

Passing this slice does not validate P1.1-S2+ and does not promote P1 or any Learning Object lifecycle.


## Automated receipt

GitHub Actions `Curriculum Atlas Quality Gate` run `35443313659`: PASS on implementation head `73357d976390314792beeae64c2ef1019b06b8e1`.


## Human evidence — Android

Evidence received: screenshot of the deployed P1.1-S1 preview.

Observed:
- brand row fits;
- Fonti is separated as a secondary utility;
- Curricolo / Percorsi / Materiali / Mappa are all visible simultaneously;
- no horizontal primary-navigation clipping is visible;
- controls are separated and readable.

Result: **HUMAN MOBILE NAVIGATION PASS**.

This PASS is limited to P1.1-S1. It does not validate the Map inspector, dark visual QA, semantic zoom or later P1.1 slices.
