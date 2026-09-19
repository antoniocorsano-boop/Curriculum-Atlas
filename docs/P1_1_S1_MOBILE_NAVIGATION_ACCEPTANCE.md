# ATLAS-P1.1-S1 — Mobile Navigation

Status: IMPLEMENTED_PENDING_AUTOMATED_AND_HUMAN_VALIDATION  
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
- [ ] P1.1-S1-GA1 — data validator PASS;
- [ ] P1.1-S1-GA2 — TypeScript PASS;
- [ ] P1.1-S1-GA3 — production build PASS.

### Human mobile
- [ ] P1.1-S1-GH1 — no horizontal primary-nav overflow at Android viewport;
- [ ] P1.1-S1-GH2 — all four primary tasks are visible without swiping;
- [ ] P1.1-S1-GH3 — Fonti remains reachable as a secondary action;
- [ ] P1.1-S1-GH4 — active section remains visually clear;
- [ ] P1.1-S1-GH5 — touch targets are comfortable and non-overlapping.

### Regression
- [ ] P1.1-S1-GR1 — desktop shows Curricolo / Percorsi / Materiali / Mappa / Fonti;
- [ ] P1.1-S1-GR2 — Materials critical journey remains reachable;
- [ ] P1.1-S1-GR3 — Mappa remains reachable and lazy-loaded;
- [ ] P1.1-S1-GR4 — no data/lifecycle/provenance contract changes.

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
