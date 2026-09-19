# ATLAS-P1.1 — Interaction & Visual Quality

Status: READY_FOR_PLANNING  
Date: 2026-09-19  
Authority: product-quality specification for ATLAS-P1.1  
Parent: ATLAS-P1 #3  
Current application baseline: PR #6  
Cross-product authority: ECO-00

## Canonical source

Full benchmark, visual audit, maturity baseline and execution plan:

https://docs.google.com/document/d/1l2rNiHpjW_I3ocA0TpE6pN2eUt2CDpQlgzCf7-fn7ZI/edit

This repository document intentionally does **not** duplicate the full analysis. It records the enforceable product decisions and execution order.

## Product decision

ATLAS-P1.1 is the next quality tranche after the current P1 baseline.

Do not expand the feature surface significantly before improving:
- mobile navigation;
- inspector interaction;
- visual hierarchy and contrast;
- progressive disclosure;
- search-first navigation;
- Perspectives;
- semantic zoom;
- Visual/List parity.

The goal is to move Atlas from an advanced POC/pilot feel toward a professional educational product.

## Benchmark principles adopted

### Curriculum-management products
From mature curriculum-management patterns:
- views must answer a professional question;
- curriculum → unit/path → material must remain continuous;
- coverage, gap and overlap analysis are first-class diagnostic capabilities.

### Graph-exploration products
From mature graph-exploration patterns:
- search-first;
- Focus-first rather than Universe-first;
- progressive reveal;
- Perspectives over one canonical graph;
- inspector appears only when context requires it;
- graph and list are equal interaction modes.

Benchmarks are references for patterns and maturity. They are not specifications to copy.

## Evidence from current Android preview

Observed on the P1 navigable preview:
1. primary nav can overflow horizontally;
2. Map exposes too many control layers at once;
3. mobile Inspector behaves like a desktop drawer squeezed into the viewport;
4. contrast/typography in dark detail surfaces needs dedicated QA;
5. graph lacks semantic zoom;
6. provenance/technical metadata appears too early for the teacher task.

These findings do not invalidate P1 data architecture or provenance. They define P1.1.

## UX principle

**Complexity under the hood; clarity in front of the user.**

Primary question:
> What do you want to understand or do?

Not:
> Which graph mode do you want to use?

## Target primary information architecture

Preferred task-level entries:
- Esplora
- Percorsi
- Materiali
- Analizza

Map/graph rendering becomes a capability inside exploration/analysis rather than a mandatory primary destination.

On mobile, keep at most four persistent primary destinations.

## Smart Navigation

Evolve search toward **Chiedi ad Atlas**.

Target questions include:
- Dove tratto sostenibilità?
- Quali attività di prima sviluppano problem solving?
- Mostrami il percorso sui sistemi nei tre anni.
- Quali obiettivi non hanno Learning Object?
- Quali materiali ho per una lezione di 60 minuti?
- Dove ci sono gap o sovrapposizioni?

Results must remain explainable and provenance-aware.

## Perspectives

Same canonical graph, different task lenses:
- DOCENTE;
- DIPARTIMENTO;
- CURRICOLO / REFERENTE;
- DIRIGENZA / ISTITUZIONE;
- PUBBLICO.

A Perspective filters/presents. It never creates a second source of truth or changes authority.

## Progressive disclosure

1. human title / meaning;
2. class, type, state;
3. relations;
4. educational/document provenance;
5. SHA, source row, manifest, receipt.

Technical identifiers stay behind explicit detail disclosure for ordinary teacher journeys.

## Map target

### Desktop
- search/Ask Atlas;
- near-full-screen scene;
- minimal View/Filters controls;
- side inspector only after selection;
- contextual legend;
- semantic zoom;
- focus + progressive reveal.

### Mobile
- compact header;
- search;
- filters;
- scene;
- adaptive bottom sheet on node tap.

Bottom sheet states:
30% → 60% → full screen.

No desktop side drawer forced into mobile.

## Visual/List parity

Every important smart view should support:

**Visuale | Elenco**

The list is not merely an accessibility fallback. It is an equal operational view.

## Curriculum Health

Prepare a diagnostic view for:
- objective coverage;
- objectives with evidence;
- nodes with LO;
- LO lifecycle/validation readiness;
- unresolved links;
- sources requiring review;
- gap/overlap.

Do not produce an overall quality score for a teacher or school.

## Design quality rules

- reuse the existing design system; no second design system;
- professional typography;
- shared spacing/status/contrast tokens;
- no primary-nav overflow;
- technical metadata behind disclosure;
- maximum 2–3 visible trust badges;
- dark-map contrast QA;
- reusable components, not page-specific CSS patches;
- maintain 3D lazy loading.

## Accessibility

Target: WCAG 2.2 AA for critical journeys.

Required:
- keyboard;
- visible focus;
- contrast;
- reflow;
- touch;
- semantic structure;
- reduced motion;
- screen-reader critical path;
- HTML equivalent for Canvas/3D;
- correct bottom-sheet focus behavior.

## Slice order

Do not run multiple P1.1 implementation branches in parallel by default.

1. **P1.1-S1 — Mobile Navigation**
2. **P1.1-S2 — Inspector → Bottom Sheet**
3. **P1.1-S3 — Visual QA**
4. **P1.1-S4 — Progressive Disclosure**
5. **P1.1-S5 — Search-first Navigation**
6. **P1.1-S6 — Perspectives**
7. **P1.1-S7 — Semantic Zoom**
8. **P1.1-S8 — Visual/List Parity**
9. **P1.1-S9 — Curriculum Health Prototype**
10. **P1.1-S10 — Human Validation**

One slice → one owner → one head → one receipt.

## Gates

- **P1.1-G1 Navigation clarity**
- **P1.1-G2 Mobile inspector**
- **P1.1-G3 Visual quality**
- **P1.1-G4 Progressive disclosure**
- **P1.1-G5 Search-first**
- **P1.1-G6 Perspective coherence**
- **P1.1-G7 Semantic zoom**
- **P1.1-G8 Accessibility**
- **P1.1-G9 Performance**
- **P1.1-G10 Human quality**

## Anti-redundancy rules

- #3 remains the single ATLAS-P1 umbrella tracker.
- This file is the single repo authority for P1.1 quality requirements.
- Drive document is the full canonical analysis.
- PR #6 remains the current runtime baseline; do not rewrite its history to look like P1.1.
- PR #2 remains the S1 spatial history.
- ECO-00 remains cross-product authority.
- no second P1.1 dataset;
- no second design system;
- no separate lifecycle vocabulary;
- no duplicated LO/material source.

## Ready condition

P1.1 may start implementation when:
- Drive analysis and this repo spec are linked;
- #3 references the tranche and execution order;
- ECO-00 roadmap contains P1.1;
- no competing quality branch exists;
- P1 current baseline remains identifiable.

## Done condition

P1.1 is done only when P1.1-G1…G10 pass and:
- Android + desktop/LIM + keyboard are validated;
- Materials critical journey remains intact;
- mobile bottom sheet exists;
- smart navigation is search-first;
- semantic zoom is usable;
- Perspectives use the same data model;
- Visual/List parity exists;
- performance does not regress;
- a final maturity audit and receipt are recorded.
