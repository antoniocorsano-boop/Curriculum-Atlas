# Percorsi G2 — H1 Pedagogical / Editorial Review

Status: `H1 = PASS_WITH_REMEDIATION_REQUIRED`

Reviewed implementation head at start of review: `dfce6591d853ca7c73352a37586d7ec82ade4c7c`.

Scope: human pedagogical/editorial comparison of the Literal (`L`) and Narrative (`N`) presentations of `pw-missing-information-01`. This review does not constitute assistive-technology validation and does not authorize student runtime.

## Review criteria

1. Same cognitive objective and decision structure.
2. Same decision-relevant information at each corresponding node.
3. No differential hint that makes one grammar materially easier.
4. Same consequences and branching semantics.
5. Same transfer demand.
6. Feedback describes process/consequence rather than learner worth.
7. No score, ranking, penalty or hidden correctness metadata.

## Findings

### H1-01 — Cognitive objective and graph semantics — PASS
Both grammars train the same strategy: identify decision-relevant missing information before choosing. Entry, inspect/infer branches, revision, transfer and terminal meaning correspond.

### H1-02 — Information coverage — PASS
The Literal and Narrative variants expose the same decision-relevant facts: cost is known, duration is missing; after inspection cost and duration are available; estimation does not replace the missing datum; transfer changes context to route choice with distance known and travel time missing.

### H1-03 — Differential hints — PASS
Neither grammar introduces a hidden correctness marker before selection. Labels differ stylistically but preserve the same affordances and semantic alternatives. The transfer distractor remains non-pertinent in both presentations.

### H1-04 — Feedback equivalence — PASS
Feedback in both grammars explains what information the selected strategy makes available or leaves uncertain. It remains process-oriented and does not evaluate the learner as a person.

### H1-05 — Transfer demand — PASS
Both grammars require recognition of travel time as the missing decision-relevant datum in a changed context; neither grammar supplies the answer in advance.

### H1-06 — Editorial inconsistency in Narrative revision feedback — REMEDIATION REQUIRED
Narrative `inspect → revise` currently says: `senza perdere punti: qui non ce ne sono.` Literal says only `senza penalizzazioni`, and Narrative `infer → revise` also uses `senza penalizzazioni`.

The phrase does not create scoring functionality, but it unnecessarily introduces the concept of points in learner-facing copy and breaks editorial symmetry with the governed no-scoring model. Replace it with neutral process language equivalent to the other revision feedback.

Required replacement:

`Puoi tornare alla decisione iniziale e rivedere la strategia senza penalizzazioni.`

## Decision

`H1 = PASS_WITH_REMEDIATION_REQUIRED`.

The pedagogical equivalence is substantively sound, with one bounded editorial remediation. H1 becomes final `PASS` only after:

1. the H1-06 copy correction is committed;
2. automated G2 UX/contract gates rerun successfully on the new exact head;
3. this review record is updated to reference that exact head.

`H2` human assistive-technology validation remains separate and pending. `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED` remains binding.
