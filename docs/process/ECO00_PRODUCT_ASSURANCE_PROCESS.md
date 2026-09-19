# ECO-00 — Atlas product assurance process

Status: PROPOSED_CANONICAL  
Date: 2026-09-19

## Local + ecosystem gates

Atlas must pass both product-local gates and ECO-00 gates for cross-product releases.

## Data publication

Runtime data is generated from versioned read-only manifests.

Do not scrape Drive folders at runtime as the product data model.

Target public datasets:
- curriculum-snapshot.json;
- learning-objects.json;
- material-assets.json;
- assurance-records.json;
- normative-references.json.

## Release evidence

Minimum:
- data/schema validation;
- typecheck/build;
- no-private-data scan;
- broken-link/material asset validation;
- accessibility automated + manual;
- mobile/desktop/LIM journey;
- exact SHA/build identity;
- public smoke;
- Trust Drawer evidence coherence.

## Assurance invalidation

An assurance tied to an exact version/SHA is not automatically valid after:
- content version change;
- schema breaking change;
- material replacement;
- accessibility-impacting UI change;
- privacy/security boundary change.

## Real-user validation

ATLAS-P1 pilot journey:
`Home → Materiali → Prima → TEC-SYS-001 → Proietta`.

Record:
- completion;
- time/effort;
- confusion;
- failed/recovery path;
- usefulness;
- classroom readiness.

## Handoff validation

Atlas → Docente OS:
context survives without granting foreign authority.

Atlas → Arena:
revision context survives; Arena independently validates authority.
