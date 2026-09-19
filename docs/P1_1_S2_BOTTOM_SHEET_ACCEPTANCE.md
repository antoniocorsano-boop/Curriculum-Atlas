# ATLAS-P1.1-S2 — Mobile Inspector → Bottom Sheet

Status: IMPLEMENTED_PENDING_AUTOMATED_AND_HUMAN_VALIDATION  
Date: 2026-09-19  
Parent: ATLAS-P1 #3  
Quality authority: docs/product/ATLAS_P1_1_INTERACTION_VISUAL_QUALITY.md

## Scope

This slice changes only the Inspector interaction on mobile.

Implemented:
- desktop Inspector remains a right-side drawer;
- mobile Inspector becomes a bottom sheet;
- three snap states:
  - compact / peek;
  - medium;
  - full;
- drag handle supports vertical gesture;
- explicit **Riduci / Espandi** controls are available as a non-gesture alternative;
- internal content scrolls independently;
- selected node/segment content and provenance remain unchanged;
- reduced-motion disables the height transition.

## Explicit non-goals

This slice does not implement:
- dark contrast redesign;
- Map control reduction;
- progressive disclosure;
- search-first;
- Perspectives;
- semantic zoom;
- Visual/List parity;
- Curriculum Health.

Those remain P1.1-S3…S9.

## Gate

### Automated
- [ ] P1.1-S2-GA1 — data validator PASS;
- [ ] P1.1-S2-GA2 — TypeScript PASS;
- [ ] P1.1-S2-GA3 — production build PASS.

### Human Android
- [ ] P1.1-S2-GH1 — selecting a node opens a bottom sheet from the bottom, not a side drawer;
- [ ] P1.1-S2-GH2 — compact state preserves visible Map context;
- [ ] P1.1-S2-GH3 — Espandi reaches medium and full states;
- [ ] P1.1-S2-GH4 — Riduci returns to compact state;
- [ ] P1.1-S2-GH5 — vertical swipe/drag on the handle changes state;
- [ ] P1.1-S2-GH6 — sheet content scrolls without moving the page unexpectedly;
- [ ] P1.1-S2-GH7 — Torna alla vista closes focus and returns to the Map.

### Regression
- [ ] P1.1-S2-GR1 — desktop Inspector remains side drawer;
- [ ] P1.1-S2-GR2 — node/segment content unchanged;
- [ ] P1.1-S2-GR3 — provenance remains reachable;
- [ ] P1.1-S2-GR4 — no curriculum/LO/data contract changes;
- [ ] P1.1-S2-GR5 — P1.1-S1 mobile navigation remains unchanged.

## Human validation

On Android:
1. Open **Mappa**.
2. Select a visible node.
3. Confirm the panel appears from the bottom.
4. Confirm the Map remains visible above the compact sheet.
5. Tap **Espandi** once, then again.
6. Tap **Riduci** until compact.
7. Try an upward/downward drag on the handle.
8. Scroll the content inside the sheet.
9. Tap **Torna alla vista**.

Send one screenshot of compact state and one of expanded state.

## Promotion rule

S2 closes only after:
- exact-head automated PASS;
- human Android PASS;
- regression review PASS.

Passing S2 does not validate visual contrast or later P1.1 slices.
