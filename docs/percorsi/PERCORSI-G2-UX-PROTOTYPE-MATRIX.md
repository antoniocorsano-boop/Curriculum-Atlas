# Percorsi G2.4 — Prototype state matrix

Status: `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`

This matrix is the implementation checklist for the isolated G2.4 prototype. It is subordinate to ADR-009 and `PERCORSI-G2-CONTRACT.md`.

| State | Required learner-visible behaviour | Contract evidence |
|---|---|---|
| Entry | One cognitive prompt is primary; no technical node/scene ID | semantic-unit mapping; ID exposure check |
| Choice | Native/semantic choice controls; no correctness colour or score | accessibility contract; no scoring |
| Feedback | Process/consequence feedback appears and is announceable | feedback semantic units; announced region |
| Branch A | First choice can lead to a distinct next node | graph target evidence |
| Branch B | Alternative choice can lead to a different next node | graph target evidence |
| Revision | Learner can reconsider where permitted, without penalty | session transition test |
| Transfer | Same strategy applied in changed context | cognitive-function + semantic mapping |
| Literal | Literal renderer covers canonical semantic units | validator parity report |
| Narrative | Narrative renderer covers same canonical semantic units without extra hints | validator parity + human editorial review |
| Completion | Dedicated terminal state summarizes process | terminal contract |
| Exit | Leaves completed experience; does not restart implicitly | completion-state test |
| New session | Fresh session; visited/selections/completion cleared | deterministic reset test |
| Privacy | Compact disclosure: no response sending/saving | governance policy assertion |
| Mobile | Prompt/actions prioritized; no horizontal overflow | reflow/viewport evidence |
| Desktop | Same semantic/read order; optional secondary context only | DOM/order evidence |
| Keyboard | Complete actionable path with visible focus | runtime automated check |
| Reduced motion | No essential information depends on animation | runtime policy check |

## Prototype branch fixture
The first prototype should use the existing “missing information” learning strategy but convert it from nine fixed screens into a small genuine graph: `entry → inspect | infer → consequence → revise/continue → transfer → terminal`. At least `inspect` and `infer` must reach different consequence nodes before reconverging. Reconvergence must not erase the fact that different process feedback was presented.

## Review rule
Screenshots are supporting evidence only. `UX_PROTOTYPE_REVIEW` requires behavioural tests, semantic-unit parity, governance assertions, mobile/desktop evidence and human pedagogical comparison of Literal/Narrative information.