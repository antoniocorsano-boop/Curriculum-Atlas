# Smart Publish → Percorsi Publication Qualification Boundary

Status: **PROPOSED / GOVERNANCE ONLY / NO RUNTIME CHANGE**

Historical source baseline: `ae18cc60d7d5401041e43d2e8c94fa4baa2d4076`.

Current review baseline after governed realignment: `f68be1d9913fed77483685158e38848d3d0a19b2`.

## Purpose

Define the boundary between Atlas Smart Activity material publication work and the governed Percorsi publication-qualification chain without merging their implementations.

This contract does **not** authorize publication, does not change Q5/Q6/Q1/Q9 semantics, does not create a new runtime adapter, and does not make a Smart material set independently publishable.

## Separation rule

The two workstreams remain distinct:

- Smart publication prepares and verifies material artifacts and their canonical manifests.
- Percorsi qualification governs provenance, editorial admission, sealed-preauthorization reachability evidence, and eventual runtime authorization.
- Neither workstream may silently redefine the other's authority, receipt, candidate identity, state machine, or publication semantics.

A Smart material set may become an input to publication qualification only through the explicit handoff defined below.

## SmartPublicationCandidateHandoff v1

A Smart material set that is ready to enter a governed publication-qualification flow MUST provide a handoff object containing:

- `handoffVersion = atlas.smart-publication-candidate-handoff/v1`;
- `materialSetId`;
- `materialSetVersion`;
- `activityId`;
- `candidateContentDigest`: deterministic digest of the canonical Smart material-set identity used for qualification;
- `requiredResourceDigests`: exact digest list for all required resources in the candidate;
- `provenanceRefs`: provenance references for all required resources;
- `sourceManifestRef`: immutable or exact-version reference to the canonical material set;
- `publicationEligibility = PUBLICATION_CANDIDATE`;
- `humanDecisionRequired = true`;
- `runtimeAuthorization = null`;
- `publicationId = null` until a governed publication candidate is created;
- `authorityRef = null` until supplied by the governing publication authority;
- `candidateBinding = null` until the Percorsi publication-qualification layer binds the candidate.

The handoff is an **input package**, not Q5 evidence, not Q6 admission, not Q1 reachability evidence, and not Q9 authority.

## Ownership of fields

Smart owns and may produce:

- material identity and version;
- resource identity;
- canonical bytes/digest/byte size;
- provenance references;
- material slot roles;
- publication paths as candidate paths;
- package completeness/readiness evidence;
- pre-deploy and post-deploy asset verification evidence.

The publication-qualification layer owns:

- `publicationId`;
- `RuntimeCandidateIdentity/candidateBinding`;
- normalized publication `authorityRef`;
- Q5 transition provenance;
- Q6 editorial admission;
- Q1 sealed-preauthorization probe evidence;
- invalidation/revalidation lineage;
- Q9 `RUNTIME_AUTHORIZED`;
- transition to `PUBLISHED`.

Smart MUST NOT synthesize or infer any of those fields.

## State mapping

Smart states and Percorsi publication states are not synonyms.

- `DRAFT` in a Smart material set remains a Smart-package state.
- `PUBLICATION_CANDIDATE` means only that the Smart package may be handed to a governed qualification flow.
- It does **not** mean `QUALIFIED`, `PUBLISHED`, Q6 PASS, Q1 PASS, or Q9 authorization.
- `BYTES_VERIFIED_PUBLICATION_PENDING` proves byte identity only.
- Anonymous asset reachability evidence proves asset reachability only and MUST NOT be promoted to Q1 surface reachability evidence unless consumed by the governed Q1 probe contract.

## Fail-closed integration rules

The handoff MUST be rejected if:

- any required resource has unresolved provenance;
- any required resource digest is malformed, missing, duplicated ambiguously, or differs from the canonical manifest;
- the source manifest version and declared material-set version differ;
- `publicationEligibility` is not exactly `PUBLICATION_CANDIDATE`;
- Smart attempts to provide non-null `publicationId`, `authorityRef`, `candidateBinding`, or `runtimeAuthorization`;
- a consumer attempts to treat Smart asset receipts as Q5/Q6/Q1/Q9 evidence without an explicit governed adapter;
- the Smart manifest changes after candidate binding without invalidating downstream qualification evidence.

## Change classification

Any future Smart change touching one or more of these concepts is **CROSS_COMPONENT** and requires explicit impact review before implementation:

- publication authority;
- publication state machine;
- publication receipt semantics;
- candidate identity/binding;
- runtime reachability;
- Q5/Q6/Q1/Q9 semantics;
- invalidation rules.

Changes limited to material bytes, provenance, material-set structure, educational metadata, export verification, or candidate-path verification remain within the Smart workstream unless they alter an existing publication contract.

## Current PR coordination

- PR #50 is merged; its integrated responsibility is Q5 → Q6 → Q1 qualification semantics.
- PR #55 is merged; its integrated responsibility is fail-closed Smart material export/publication evidence.
- This boundary contract is intentionally a separate governance tranche.
- No code from PR #50 is copied into PR #55 and no Smart publication verifier is promoted into a Percorsi gate by implication.

## Integration sequence

The future governed sequence is:

`Smart material-set verified → SmartPublicationCandidateHandoff → publication candidate binding → Q5 → Q6 → Q1 → remaining gates → independent review → Q9 → activation/publication`

Each arrow represents an explicit handoff. None is an automatic promotion.

Until a separate integration tranche is reviewed and approved, the boundary remains documentation/governance only.
