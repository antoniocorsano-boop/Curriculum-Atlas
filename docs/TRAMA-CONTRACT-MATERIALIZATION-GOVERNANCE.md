# TRAMA — Consequence-Aware Contract Materialization Governance

Status: PROPOSED in PR #50. This rule does not modify runtime behavior by itself.

## Purpose

Prevent a governed contract from being implemented as a collection of happy-path examples while normative consequences remain unenforced. The required reasoning sequence is:

`WHY -> CONSEQUENCES -> INVARIANTS -> ADVERSARIAL MUTATIONS -> IMPLEMENTATION -> EVIDENCE -> INDEPENDENT REVIEW`.

Independent review is a verification layer, not the primary mechanism for discovering consequences already encoded in the governing contract.

## Applicability and non-impact rule

This mechanism applies first to the Percorsi G2 evidence-producer tranche. Extension to other TRAMA components requires an explicit impact assessment and a separate human integration decision when it changes an existing governed contract, CI requirement, runtime behavior, authority boundary, publication rule, data flow or repository outside Curriculum-Atlas.

A local improvement MAY be adopted without cross-ecosystem propagation only when it is additive, preserves all existing authorities/contracts and cannot change observable runtime/publication/data behavior. Any conflict with an existing higher-authority contract is BLOCKED and escalated; this document never silently overrides another contract.

## Normative requirement decomposition

Before implementation, every normative statement containing semantics equivalent to MUST, MUST NOT, ONLY IF, SAME IDENTITY, INVALIDATES, ACCEPTED VERSION, FAIL CLOSED or HUMAN AUTHORITY must receive a stable requirement ID and a row in the compliance matrix.

Each row MUST identify:

- `requirementId` and governing source;
- `why`: property/risk the rule exists to control;
- `consequences`: downstream effects if true and if violated;
- `invariant`: machine-testable statement where possible;
- `trustBoundary`: candidate, authority, receipt, producer, dependency, publication, storage, network, human evidence, etc.;
- `enforcementPoint`;
- positive case;
- at least one adversarial mutation/negative case;
- evidence produced;
- affected contracts/components;
- impact classification;
- review status.

No implementation tranche is READY_FOR_INDEPENDENT_REVIEW while a normative row is `UNMAPPED`, `UNTESTED` or has an unresolved impact conflict.

## Adversarial mutation rule

For every object that crosses a trust boundary, testing MUST start from a valid object and mutate independently every security/governance-significant dimension that could remain syntactically valid while becoming semantically foreign or stale. At minimum consider:

- exact head;
- pathway/content/publication identity;
- authority/receipt identity;
- gate/producer identity;
- producer, policy and contract versions;
- state and state transition;
- timestamps where freshness/provenance matters;
- dependency lineage/run identity;
- missing/duplicate/foreign evidence;
- publishability/reachability state.

Schema validity is not semantic validity. A syntactically valid foreign object MUST be tested where identity matters.

## Shared trust-boundary validators

Cross-cutting invariants MUST be implemented once as reusable validators rather than reimplemented independently by each gate. For the current tranche this requires a common dependency-consumption validator covering candidate identity, expected gate/producer, accepted producer/policy/contract versions and lineage compatibility. Q6 and Q1 consume dependencies only through that validator.

Future Q7/Q8 SHOULD reuse the same governed primitive unless their contract requires a stricter superset.

## Impact assessment

Every proposed rule/change is classified before implementation:

- `LOCAL_ADDITIVE`: internal evidence/test/governance improvement; no observable runtime/data/authority change.
- `CONTRACT_STRENGTHENING`: makes an existing promise executable without changing its intended semantics; requires compatibility check and independent review.
- `CROSS_COMPONENT`: changes assumptions/interfaces consumed by another component/repository; requires explicit consumer analysis before implementation.
- `RUNTIME_OR_AUTHORITY_CHANGE`: changes public/runtime behavior, data flow, authority or publication semantics; requires separate governed decision and cannot ride implicitly on a remediation PR.

Unknown impact defaults to `BLOCKED_FOR_ANALYSIS`.

## Review readiness gate

A tranche may enter independent review only when:

1. all normative requirements in scope are mapped;
2. all mapped invariants have executable enforcement or an explicit justified human-evidence requirement;
3. positive and adversarial cases pass on the same exact head;
4. identity/version/freshness boundaries have syntactically-valid mismatch tests where applicable;
5. supply-chain changes are classified for production reachability;
6. impact assessment reports no unresolved collision with governed contracts;
7. the PR states what remains deliberately out of scope.

## Review feedback learning loop

Every independent-review finding is classified as:

- `UNEXPECTED_DOMAIN_DISCOVERY`: genuinely new domain knowledge;
- `KNOWN_REQUIREMENT_NOT_MATERIALIZED`: contract already contained the rule;
- `MISSING_CONSEQUENCE_ANALYSIS`: rule existed but downstream consequence was not derived;
- `TEST_GENERATION_GAP`: invariant existed but adversarial mutation was missing;
- `TOOLCHAIN/SUPPLY_CHAIN`: build/dependency/tooling issue.

Any finding except `UNEXPECTED_DOMAIN_DISCOVERY` MUST improve the reusable governance mechanism, matrix, validator or test-generation rule before the local defect is considered fully remediated.

## Current PR #50 application

The eight findings from the first independent Q5/Q6/Q1 implementation review are not treated as eight isolated patches. They become compliance rows covering: dependency candidate binding; producer/gate/version compatibility; lineage/freshness; Q5 transition timestamp/binding; Q5 state-machine closure/withdrawal; Q6 receipt/authority identity; Q1 surface/publication identity and publishability; supply-chain audit reachability.

Until those rows are executable and green, PR #50 remains Draft / NO MERGE.

Percorsi remains `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`.