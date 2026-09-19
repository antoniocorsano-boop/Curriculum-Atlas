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
- [x] P1.1-S2-GH1 — selecting a node opens a bottom sheet from the bottom, not a side drawer — PASS from Android screenshots;
- [x] P1.1-S2-GH2 — compact state preserves visible Map context — PASS from Android screenshots;
- [x] P1.1-S2-GH3 — Espandi reaches medium and full states — PASS: medium and full states evidenced;
- [x] P1.1-S2-GH4 — Riduci returns to compact state — PASS from Android compact-state screenshots;
- [ ] P1.1-S2-GH5 — vertical swipe/drag on the handle changes state;
- [x] P1.1-S2-GH6 — sheet content scrolls internally — PASS from full-state screenshot with internal scrollbar;
- [x] P1.1-S2-GH7 — Torna alla vista closes focus and returns to the Map — PASS from subsequent screenshots with no sheet.

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


## Human Android evidence — partial

Evidence received: two screenshots from the deployed P1.1-S2 preview.

Observed:
- Inspector is rendered as a bottom sheet;
- first screenshot shows the **medium** state: both Riduci and Espandi are enabled;
- second screenshot shows the **full** state: Espandi is disabled and Riduci remains available;
- sheet content has its own internal scroll region;
- desktop-style right drawer is no longer used on the observed mobile viewport.

Still not evidenced:
- compact/peek state with meaningful Map context above it;
- vertical drag gesture on the handle;
- Torna alla vista returning to the Map.

Result: **HUMAN ANDROID PARTIAL PASS**.

No dimension change is justified from these screenshots alone.


## Human Android evidence — compact + return

Additional screenshots received:
- compact/peek state is clearly shown with Map context preserved above the sheet;
- Riduci is disabled in compact state and Espandi remains available;
- subsequent screenshots show the Map with no Inspector, confirming Torna alla vista.

Result now:
- compact PASS;
- medium PASS;
- full PASS;
- internal scroll PASS;
- return-to-map PASS.

Only the handle drag gesture remains unevidenced by still images.
