# Percorsi G2 — H2 Human Assistive-Technology Protocol

Status: `H2 = PENDING_HUMAN_EXECUTION`

Target: PR #46, G2 implementation candidate. Execute only on the current preview built from the exact head under review.

This is a human validation protocol. Automated browser tests, accessibility scanners and code inspection do not substitute for this gate.

## Recommended setup

Use one real screen reader/browser combination available to the reviewer. Examples: TalkBack + Chrome on Android; NVDA + Firefox/Chrome on Windows; VoiceOver + Safari on Apple platforms.

Record the exact combination used. Do not enter personal or student data.

## Test path — about 5 minutes

### H2-01 — Entry and orientation
1. Open the G2 preview directly at the Percorsi laboratory route.
2. Enable the screen reader before interacting.
3. Navigate from the page title to the presentation mode and then to the first scene.

PASS when the purpose, presentation mode, scene heading, known facts, prompt and choices are understandable in a logical order, without technical IDs or unexplained controls.

### H2-02 — Choice and announced feedback
1. Activate the first choice in the initial scene.
2. Do not manually move focus immediately afterward.

PASS when the selected state is understandable and the resulting process feedback is announced or otherwise made immediately discoverable without forcing the reviewer to search the whole page.

### H2-03 — Continue and focus transfer
1. Activate `Continua`.

PASS when focus arrives at the heading of the newly committed scene and the screen reader identifies the new context. FAIL if focus remains on a disappeared control, returns unpredictably to the top, or the scene change is silent/ambiguous.

### H2-04 — Revision branch
1. Follow the revision option back toward the initial decision.

PASS when the reviewer can understand that the prior strategy is being reconsidered, with no score/penalty semantics and without losing orientation.

### H2-05 — Narrative grammar
1. Switch to `Narrativo`.
2. Repeat one choice → feedback → continue transition.

PASS when the interaction structure remains understandable and no additional decision hint appears solely because the screen reader is using the Narrative presentation.

### H2-06 — Transfer and completion
1. Reach the changed-context transfer scene.
2. Make a choice and continue to completion.

PASS when the transfer prompt, feedback and terminal state are distinguishable, and `Esci` and `Nuovo percorso` are exposed as separate actions.

### H2-07 — New session
1. Activate `Nuovo percorso` from completion.

PASS when the experience returns to a fresh entry state and focus is placed coherently on the entry-scene heading.

## Blocking defects

H2 is FAIL if any of these occurs on the tested path:
- an essential prompt, fact, choice, feedback or completion action is not perceivable;
- focus is lost or trapped;
- scene changes cannot be identified;
- feedback is effectively silent/unfindable;
- choice state is ambiguous;
- technical identifiers are announced as learner content;
- Literal/Narrative changes the decision-relevant information;
- completion, exit and new-session actions cannot be distinguished.

Minor wording preferences that do not alter meaning, operability or orientation should be recorded separately and do not automatically block H2.

## Evidence record

After the test, record:

- exact head tested;
- preview URL;
- date;
- device/operating system;
- browser and version if known;
- screen reader and version if known;
- H2-01 … H2-07: PASS/FAIL;
- concise notes for every FAIL;
- overall result: `H2 = PASS` only when all blocking checks pass.

## Governance

Until this human record exists and is reviewed, H2 remains `PENDING_HUMAN_EXECUTION` and the prototype remains `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`.
