# Percorsi Runtime Readiness Review — 2026-10-03

Status: `READINESS_REVIEW_CANDIDATE / NOT_RUNTIME_AUTHORIZED`

## Scope

This review evaluates whether the two currently governed Experience Engine Percorsi candidates have sufficient implementation evidence to be submitted to a later governed runtime-authorization decision. It does **not** grant Q9, publish a student pathway, activate Smart→Percorsi binding, or alter Arena authority.

Candidates:

- `pw-missing-information-01`
- `pw-constraints-tradeoffs-01`

Baseline Atlas main at review start: `87512daaa3e09d8c48fda7de2c869e0a6d2e43e8`.

## Readiness matrix

| Dimension | PW-MISSING | PW-CONSTRAINTS | Review rule |
| --- | --- | --- | --- |
| Shared ExperienceDefinition contract | PASS | PASS | Both use `atlas.experience/v1` and `PATHWAY_G2_PLUS_V1`. |
| Governed challenge kernel | PASS | PASS | Kernel and experience are repository-governed. |
| Branch/revision/transfer semantics | PASS | PASS | Must be exercised by browser proof. |
| Volatile learner state | PASS | PASS | No pathway learner state may persist in localStorage. |
| Learner network writes | PASS | PASS | Browser proof must observe no POST/PUT/PATCH/DELETE during learner interaction. |
| Mobile reflow | EXISTING EVIDENCE | TEST ADDED | No horizontal overflow at 390×844. |
| Public catalog fail-closed | PASS | PASS | Neither candidate may appear without explicit `RUNTIME_AUTHORIZED`. |
| Public route implementation | PRESENT | PRESENT | Route existence is not publication authority. |
| Q9 runtime authorization | NOT RUN | NOT RUN | Explicitly outside this tranche. |
| Smart→Percorsi binding | NOT ACTIVE | NOT ACTIVE | Separately governed. |

## Remediation performed

The canonical Experience Engine browser suite is extended so that `pw-constraints-tradeoffs-01` has direct browser evidence for its governed runtime surface, including branching, changed-requirement revision, transfer, completion, volatile state, absence of learner network writes and mobile reflow. A corresponding public-surface privacy/write check is added for `pw-missing-information-01`.

No production catalog entry, runtime authorization flag or public activation is changed.

## Gate to close this review

The exact head may be classified `READY_FOR_RUNTIME_AUTHORIZATION_REVIEW / NOT_RUNTIME_AUTHORIZED` only if the Experience Engine lane passes on the exact head, including contracts, factories, four-case generality, typecheck, lint, production build and the expanded Chromium browser suite.

Any failure keeps the result `CHANGES_REQUIRED / NOT_RUNTIME_AUTHORIZED`.

## Authority boundary

Q9 remains the sole runtime authorization decision. This review can only establish readiness to **ask** for that decision. `DOS-A1` remains `RUNTIME_DEFERRED`.
