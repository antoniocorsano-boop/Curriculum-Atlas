# ATLAS-P1 / Slice 1 — Public shell + Lesson Materials Hub

Status: IMPLEMENTED_PENDING_AUTOMATED_AND_HUMAN_VALIDATION  
Date: 2026-09-19  
Issue: #3

## Scope

This slice turns the S1 spatial engine into one optional view inside a task-oriented public shell.

Implemented:
- Home;
- Curricolo;
- Percorsi;
- Materiali;
- Mappa;
- Fonti;
- three real Learning Object fixtures at version 0.2;
- direct classroom actions for LIM, student and teacher assets;
- read-only/public data validation;
- versioned interoperability schemas.

## Product rule

The Spatial/Galaxy experience remains available but is no longer the mandatory product home.

Primary teacher journey:

`Home → Materiali → TEC-SYS-001 → Proietta`

No manual Drive-folder navigation is required.

## Fixtures

- TEC-MAT-001 v0.2 — GENERATED
- TEC-SYS-001 v0.2 — GENERATED
- TEC-DES-001 v0.2 — GENERATED

All remain visibly non-canonical until classroom evidence supports a later lifecycle decision.

## Contracts introduced

- CurriculumSnapshot v1
- LearningObjectManifest v1
- MaterialAssetManifest v1
- HandoffContext v1

These contracts are read-only integration boundaries. They do not create a shared database.

## Privacy boundary

The P1 fixture declares:
- `readOnly=true`;
- `personalData=false`.

The validator rejects known personal-data field names and requires HTTPS asset links.

This is a technical/public-bundle boundary, not a generic legal-compliance claim.

## Acceptance gates

- [x] P1-S1-G1 — data validator PASS on exact head `07aa48e3f331804e7c1feef7a304e4acc3ec9d35`;
- [x] P1-S1-G2 — TypeScript PASS on exact head;
- [x] P1-S1-G3 — production build PASS; initial shell code-split to ~224 kB, Spatial engine lazy chunk ~951 kB;
- [ ] P1-S1-G4 — home/materials responsive on Android;
- [ ] P1-S1-G5 — desktop/LIM review;
- [ ] P1-S1-G6 — keyboard/focus review;
- [ ] P1-S1-G7 — Home → Materiali → TEC-SYS-001 → Proietta completed by human;
- [ ] P1-S1-G8 — source/version/lifecycle visible without technical overload;
- [ ] P1-S1-G9 — Spatial view remains optional and accessible by HTML alternative;
- [ ] P1-S1-G10 — no lifecycle promotion or upstream write.

## Non-goals

- no authoring;
- no login;
- no backend;
- no Arena write;
- no Docente OS write;
- no lifecycle promotion;
- no assurance/trust badge claim beyond lifecycle/style metadata;
- no public production release in this slice without review.

## Stacking

This branch is intentionally stacked on `work/s1-spatial-poc` so P1 can mature without forcing the S1 PR merge.

After S1 disposition, P1 can be rebased/retargeted without changing the product contract.

## Automated receipt

GitHub Actions `Curriculum Atlas Quality Gate` run #48 PASS on exact head `07aa48e3f331804e7c1feef7a304e4acc3ec9d35`.

Validated public fixture:
- 3 Learning Objects;
- 9 material assets;
- readOnly = true;
- personalData = false;
- all pilot LO remain GENERATED.

Performance finding resolved in-slice: the spatial engine is now lazy-loaded and does not inflate the initial public-shell bundle.
