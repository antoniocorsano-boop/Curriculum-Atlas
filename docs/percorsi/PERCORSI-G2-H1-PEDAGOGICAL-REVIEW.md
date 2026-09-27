# Percorsi G2 — H1 Pedagogical / Editorial Review

Status: `H1 = PASS`

Initial reviewed implementation head: `dfce6591d853ca7c73352a37586d7ec82ade4c7c`.
Remediated implementation head verified by CI: `255edacca82a4f7cf0a074d9e9a324df49ee89e1`.

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

### H1-06 — Narrative revision feedback — REMEDIATED / PASS
The initial Narrative `inspect → revise` copy unnecessarily introduced the concept of points. It was replaced with neutral process language:

`Puoi tornare alla decisione iniziale e rivedere la strategia senza penalizzazioni.`

The remediation preserves graph semantics and aligns learner-facing copy with the governed no-scoring model.

## Post-remediation evidence

On exact head `255edacca82a4f7cf0a074d9e9a324df49ee89e1`:

- `Percorsi G2 UX Collaudo`: PASS;
- `R3-F0 S3-V2 Foundation`: PASS;
- F1 Visual Evidence: PASS;
- F2 Visual Evidence: PASS;
- F3 Visual Evidence: PASS;
- F4 Mobile LIM Evidence: PASS;
- F5 Exit: PASS;
- `TRAMA Perceptible Write`: PASS;
- G1 collaudo: correctly skipped for the isolated G2 change.

## Decision

`H1 = PASS`.

The Literal/Narrative pedagogical-editorial equivalence gate is complete for this prototype implementation. `H2` human assistive-technology validation remains separate and pending. `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED` remains binding until the later authorization gates are explicitly satisfied.
