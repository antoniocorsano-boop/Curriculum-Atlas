# Atlas Percorsi — G1 repository boundary

**Data:** 2026-09-25  
**Stato:** GOVERNANCE ALIGNMENT CANDIDATE  
**Authority source:** TRAMA `CAP-ATLAS-PERCORSI / G1`  
**Runtime:** NOT_AUTHORIZED

## Purpose
This document prevents repository presence from being mistaken for product/runtime authority while Atlas Percorsi moves from research and governed pathway dossiers toward controlled implementation.

## Current Atlas reality

1. The public Atlas baseline F0–F5 is closed and remains authoritative for the currently validated public product surface.
2. `/percorsi` exists but is still a placeholder surface; it is not evidence that the Percorsi capability has been implemented.
3. ATLAS-PERCHÉ code exists on `main` as a governed prototype. Its presence does not promote it to production or make it the canonical Percorsi model.
4. `CAP-ATLAS-PERCORSI / G1` is governed in `trama-ecosistema`; its child-safe constitution, review contract, evidence layer and pathway dossiers remain the authority for Percorsi development.

## Integration rule
A child-facing pathway may enter Atlas implementation only when it has, at minimum:

- a stable pathway identifier;
- a governed dossier;
- constitutional document review state permitting controlled implementation/validation preparation;
- an implementation specification;
- explicit data-flow and question-function declarations;
- a declared developmental band;
- claim/transfer ceilings;
- accessibility and child-safety validation plan;
- `Runtime: NOT_AUTHORIZED` unless and until the correct governance process grants runtime authority.

## First governed implementation candidate
The current first candidate is `PW-MISSING-INFORMATION-01 — Prima di decidere, cosa manca?` from TRAMA G1. Its implementation specification requires two equivalent conditions: restrained Narrative/Journey and Literal. No login, learner identity, free text, learner-response API, persistent learner profile, behavioural analytics or conversational/generative agent is authorised.

This candidate is **not yet implemented by this document**. Repository placement must be designed so existing F1/F2/F3/F4/F5 surfaces are not coupled to experimental pathway state.

## Recommended technical placement
Use an isolated feature boundary rather than extending the existing ATLAS-PERCHÉ component:

- `src/features/pathways/` — pathway domain/presentation code;
- `src/app/percorsi/[pathwayId]/` — controlled route shell when implementation begins;
- `public/pathways/<pathwayId>/` — static governed assets only when required;
- dedicated validation scripts/workflow scoped to the pathway files;
- no import from the legacy `activity-prototype.tsx` unless an explicit compatibility decision is reviewed.

The existing `/percorsi` index may later become discovery/navigation for authorised pathways. Until then it must not imply that experimental pathways are production-ready.

## ATLAS-PERCHÉ migration classification
ATLAS-PERCHÉ is classified as `LEGACY_GOVERNED_PROTOTYPE_INPUT` for Percorsi G1 analysis. Before reuse, map it against the current constitution and contract. Reuse is permitted only at the level of individually reviewed patterns or assets; wholesale inheritance is prohibited.

Particular items requiring remapping include local persistence/offline behaviour, learner-facing feedback grammar, age/developmental assumptions, question/input model, visual salience, accessibility, transfer claims and any state retained across sessions.

## Non-interference rule
Percorsi G1 work must not alter:

- Arena curriculum authority;
- Arena → Atlas authority-state propagation;
- validated F1 Curricolo/Materiali behaviour;
- F2 Esplora relational map;
- F3 Materiali/Risorse semantics;
- F4 mobile/LIM baseline;
- F5 exit status;
- Docente OS → Atlas publication authority;
- DOS-A1 state.

Any required change to these surfaces is a separate governed change, not an incidental consequence of Percorsi implementation.

## Promotion sequence
`TRAMA evidence/constitution → pathway dossier → constitutional document PASS → implementation specification → isolated Atlas implementation candidate → automated technical evidence → human developmental/pedagogical/child-safety/accessibility review → exact-head review → explicit runtime decision`.

No earlier step implies the next.

## Current decision
Atlas is ready to host a **controlled implementation candidate** for `PW-MISSING-INFORMATION-01` in an isolated feature boundary. It is not authorised to expose that candidate as student runtime. The next engineering step is to create the isolated feature/route on a dedicated branch and validate it without modifying the validated F0–F5 semantics.