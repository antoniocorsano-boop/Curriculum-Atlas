# Percorsi G2 — Implementation Candidate

Status: `CANDIDATE_PREPARATION / NOT_RUNTIME_AUTHORIZED`

Date: 2026-09-27

## Authority chain

- ADR-009: `APPROVED`.
- G2 contract: `CONTRACT_REVIEW = PASS`.
- G2 validator: `VALIDATOR_PASS = PASS`.
- G2.4 UX prototype: `UX_PROTOTYPE_REVIEW = PASS` on exact head `db74bede58a4b9a312a3e282e4a71cb809942ea2`.
- Contract/validator integration: PR #45 merged to `main` as `4350fe43d9274e555c23fcc79ef0311aacedec5f`.
- Candidate PR: #46, retargeted to `main`, still draft.

## Candidate scope

The candidate is the isolated G2 graph-driven experience for `pw-missing-information-01`: genuine branching, process feedback, revision without penalty, transfer, explicit completion, deterministic new-session reset, Literal/Narrative presentation, compact privacy disclosure, post-commit scene focus management and mobile/desktop behaviour.

## Automated evidence already satisfied

- contract validator and adversarial fixtures;
- typecheck, lint and production build;
- browser behavioural path for Literal/Narrative mobile and Literal desktop;
- branch progression and transfer;
- announced feedback region;
- post-transition heading focus;
- explicit terminal;
- distinct Exit/New session actions;
- deterministic session reset;
- no false linear progress or technical scene IDs;
- no horizontal overflow in tested viewports;
- governance disclosure visible;
- Foundation, F1–F5 and TRAMA Perceptible Write gates green on the reviewed prototype head.

## Evidence still required before final promotion

### H1 — Human pedagogical/editorial L/N equivalence
A human reviewer must compare Literal and Narrative presentation state by state and record whether:

1. both expose the same decision-relevant semantic units;
2. Narrative adds no hint, salience cue or implied correctness absent from Literal;
3. Literal omits no context needed to make the same decision;
4. feedback preserves the same cognitive function while wording may differ;
5. transfer and terminal meaning remain equivalent;
6. neither grammar changes difficulty through presentation alone.

Outcome: `PASS` or `CHANGES_REQUIRED`, with exact head.

### H2 — Human assistive-technology validation
This remains a separate authorization gate. It must not be inferred from automated accessibility checks. At minimum, the reviewed candidate must be exercised with keyboard plus an appropriate screen reader/assistive technology across entry, choice, feedback, scene transition, terminal and new-session reset.

Outcome: `PASS` or `CHANGES_REQUIRED`, with environment and exact head recorded.

## Promotion rule

`IMPLEMENTATION_CANDIDATE` may be declared only when H1 is recorded as PASS and the exact head remains green. Student/runtime authorization remains forbidden until H2 and any other explicit authorization gates are satisfied.

Any code/content change caused by H1 or H2 invalidates the previous exact-head conclusion and requires rerunning the affected automated gates followed by `EXACT_HEAD_REVIEW`.

## Current decision

`IMPLEMENTATION_CANDIDATE = PENDING_HUMAN_EVIDENCE`.

No merge of PR #46 is authorized by this document.