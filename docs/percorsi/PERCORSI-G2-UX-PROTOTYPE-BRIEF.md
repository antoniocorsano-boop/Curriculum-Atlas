# Percorsi G2.4 — UX Prototype Brief

Status: `PROPOSED / PROTOTYPE_ONLY / NO_RUNTIME_AUTHORIZATION`

Architecture authority: ADR-009 `APPROVED`.

## Objective
Translate the approved G2 graph contract into a mobile-first learning experience that keeps the cognitive task primary, makes branching comprehensible, and reduces the vertical/noise problems observed in G1 without introducing scoring, learner profiling, analytics, or persistence.

## Mature-pattern benchmark
The prototype must be reviewed against mature patterns rather than invented in isolation:

- **H5P Branching Scenario** — progressive disclosure, choice → consequence → branch, explicit terminal outcomes.
- **Twine** — passage-centered interaction, legible transitions, narrative structure separated from graph data.
- **GDevelop** — state/event separation and reusable interaction behaviours, without importing a game engine.
- **WAI-ARIA/APG patterns** — semantic controls, predictable focus, status/feedback announcements; accessibility is not inferred from visual similarity.

Benchmarking is selective: Atlas retains its own graph contract and privacy/governance model.

## Experience principles
1. **One cognitive task per viewport priority.** On mobile the prompt and actionable choices precede secondary explanation.
2. **Progress without false linearity.** Do not display “step X of Y” when branching makes Y path-dependent. Prefer a neutral progress state such as `In percorso` plus optional visited-node context that does not reveal correctness.
3. **Technical IDs hidden.** `S1_*`, node IDs, registry IDs and validator metadata never appear in learner UI.
4. **Choice is not a quiz answer.** No green/red correctness coding, points, streaks, rankings or celebratory reward loops.
5. **Feedback is consequence/process information.** It explains what the choice makes possible or what information remains useful.
6. **Revision is first-class.** Where pedagogy allows it, the learner can reconsider without penalty.
7. **Narrative and literal renderers share semantic units.** Visual/narrative decoration cannot add hints unavailable in the other grammar.
8. **Completion is a real state.** Terminal screen summarizes the strategy/process and separates `Esci` from `Nuovo percorso`.
9. **Privacy is perceivable, not dominant.** A compact persistent disclosure explains that the prototype does not send or save responses; full detail is expandable.
10. **Accessibility by construction.** Native controls first; visible focus; announced dynamic feedback; logical reading order; reflow; target size; reduced motion.

## Mobile scene anatomy
Recommended order:

1. compact Atlas/Percorsi context;
2. progress/context indicator;
3. scene title/prompt;
4. optional media or narrative frame, only if semantically mapped;
5. choice group with explicit accessible label;
6. consequence/feedback region (`status`/appropriate live semantics only when needed);
7. primary continuation/revision action;
8. compact privacy/governance disclosure.

Secondary explanations should collapse or move below the active decision instead of competing with it above the fold.

## Desktop adaptation
Desktop may use a two-column composition only when the second column carries useful context (narrative/media/strategy notebook). It must not expose the graph as a debugging map to learners. The decision region remains the primary landmark and preserves the same semantic/read order as mobile.

## Required prototype states
The prototype must demonstrate at minimum:

- entry scene before selection;
- selection + feedback;
- revision of a previous choice;
- a genuine branch with at least two different next nodes;
- transfer scene using the same strategy in changed context;
- terminal/completion screen;
- deterministic `Nuovo percorso` reset;
- Literal/Narrative switch preserving semantic coverage;
- narrow mobile viewport and desktop viewport;
- keyboard/focus path and announced feedback behaviour.

## Acceptance evidence for UX_PROTOTYPE_REVIEW
A prototype review cannot pass from screenshots alone. Evidence must include:

- mapping of every rendered element to G2 semantic units;
- L/N parity report from the validator;
- automated keyboard/focus/reflow/contrast checks where applicable;
- mobile and desktop visual evidence;
- branching and restart behaviour tests;
- explicit confirmation that network learner-write, telemetry and local persistence remain forbidden;
- human pedagogical review of whether the two grammars preserve equivalent decision information;
- assistive-technology human validation remains a later separate student-authorization gate unless explicitly required earlier.

## Non-goals for G2.4
No authoring editor, LMS integration, account, student identity, scoring, leaderboard, analytics, server persistence, local learner history, multiplayer, or generalized game engine.

## Gate
`ADR-009 APPROVED` → `G2.4 UX PROTOTYPE` → `UX_PROTOTYPE_REVIEW`.

Prototype work must remain isolated from the currently integrated G1 runtime until the review gate passes.
