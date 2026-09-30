# TRAMA — Atlas Component Isolation R1

**State:** PROPOSED / HUMAN REVIEW REQUIRED  
**Repository:** `antoniocorsano-boop/Curriculum-Atlas`  
**Targets:** `ATLAS.RELATION_EXPLORER.FAMILY`, `ATLAS.CURRICULUM_TREE.DISCLOSURE`  
**Runtime impact:** NONE  
**Product dependency adoption:** NONE  
**Lifecycle promotion:** NONE

## Purpose

Provide real **ISOLATED** evidence for the two Atlas component targets already registered in TRAMA without introducing Storybook, a new product UI library, or a public evidence route.

The isolation surface is deliberately test-only. It mounts the existing components in a minimal browser host and reuses:

- the real component source;
- the real curriculum/explore fixtures;
- the existing Atlas global styling;
- the existing `@xyflow/react` runtime already owned by Atlas;
- the existing Playwright development dependency.

Only `next/link` is replaced inside the laboratory by a neutral anchor adapter so the component can be mounted without a full Next router. This adapter is evidence infrastructure and is not used by the product runtime.

## Architecture

Test-only host:

`test-infrastructure/atlas-component-isolation/`

Evidence producer:

`scripts/capture-atlas-component-isolation.mjs`

CI:

`.github/workflows/atlas-component-isolation.yml`

The host is bundled during CI with a pinned temporary `esbuild` invocation. `esbuild` is **not added to package.json** and is not a product dependency.

## Evidence cases

### RelationExplorer

The isolated host must prove at both 390×844 and 1280×900:

- the real `RelationExplorer` mounts without the application shell;
- the map surface is present;
- the accessible equivalent list can be activated;
- isolated nodes remain selectable;
- the view can return to the map;
- no page-level horizontal overflow is introduced.

### CurriculumTree

The isolated host must prove at both 390×844 and 1280×900:

- the real `CurriculumTree` mounts without the application shell;
- native `details/summary` disclosure groups are present;
- a disclosure can close and reopen;
- school-stage filtering remains functional;
- no page-level horizontal overflow is introduced.

## Evidence semantics

A successful run produces:

- exact-head workflow identity;
- screenshot evidence for each target and viewport;
- `evidence.json`;
- explicit `ISOLATED = PASS` per component.

This slice does **not** automatically claim:

- additional accessibility qualification;
- lifecycle STABLE;
- regression history;
- component migration;
- design-system standardization.

TRAMA may bind the isolated evidence only after the Atlas PR is merged and the artifact/exact-head chain is verified.

## Boundaries

This slice must not:

- modify `relation-explorer.tsx`;
- modify `curriculum-tree.tsx`;
- create a public application route;
- add a package dependency;
- replace `@xyflow/react`;
- impose Storybook on Atlas;
- change Arena authority or Atlas publication semantics;
- affect DOS-A1.

## Expected TRAMA effect after separate evidence binding

If the exact-head Atlas isolation run is PASS and integrated:

- `ATLAS.RELATION_EXPLORER.FAMILY:ISOLATED` may advance from `DOCUMENTED_ONLY` to `PRESENT`;
- `ATLAS.CURRICULUM_TREE.DISCLOSURE:ISOLATED` may advance from `DOCUMENTED_ONLY` to `PRESENT`.

The deterministic maturity projection remains evidence-driven. No maturity or lifecycle state is promoted by this document alone.
