# Percorsi G2 — Validator fixtures

Gate: `VALIDATOR_PASS` (candidate evidence only until CI and review complete).

The positive fixture must satisfy every validator check. `invalid/broken-contract.json` is a broad rejection smoke test. `scripts/test-g2-validator.mjs` derives 13 atomic mutations from the valid fixture and requires the expected invariant to fail for each mutation.

Atomic coverage:

| Mutation | Expected check |
|---|---|
| missing entry | `G2-ENTRY` |
| unknown semantic reference | `G2-CONTENT-REFS` |
| ungoverned cognitive registry | `G2-COGNITIVE-REGISTRY` |
| missing transition target | `G2-TARGETS` |
| terminal with ordinary choice | `G2-NODE-SHAPE` |
| invalid bounded cycle policy | `G2-CYCLE-POLICY` |
| unreachable/orphan node | `G2-REACHABLE` |
| no path to terminal | `G2-TERMINAL-REACHABILITY` |
| forbidden cycle | `G2-CYCLES` |
| allowed grammar absent | `G2-GRAMMARS` |
| L/N semantic omission | `G2-PARITY` |
| unauthorized governance state | `G2-GOVERNANCE` |
| missing static accessibility requirement | `G2-A11Y-CONTRACT` |

A passing atomic matrix demonstrates rejection sensitivity for these invariants. It does not replace runtime accessibility testing, human editorial equivalence review, or the separate assistive-technology gate.