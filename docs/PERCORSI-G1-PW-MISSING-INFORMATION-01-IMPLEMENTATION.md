# Percorsi G1 — PW-MISSING-INFORMATION-01 implementation candidate

Status: `IMPLEMENTATION_CANDIDATE / NOT_RUNTIME_AUTHORIZED`

Base: Atlas `main` after governance PR #34 merge (`3b4dd1fb3e0d4f9cb8bd84bdb4324cd41b6391ed`).

## Scope
This branch implements the first isolated controlled candidate under `src/features/pathways/pw-missing-information-01/` and a non-indexed laboratory route at `/percorsi/lab/pw-missing-information-01`.

It does not replace `/percorsi`, alter F1–F5, modify Arena authority, change Docente OS → Atlas publication contracts, or activate DOS-A1.

## Implemented controls
- two presentation conditions: L literal and N narrative;
- same nine-scene task model for both conditions;
- bounded responses only;
- state held in React memory only;
- no account/name/free text/profile/score;
- no response API, persistence or analytics added;
- no generative/conversational agent;
- visible non-authorized status;
- route marked `noindex/nofollow`;
- keyboard-native controls, visible focus specification, semantic fieldset/progress/ARIA live feedback;
- reduced-motion rule and responsive layout;
- S9 local-save action intentionally remains disabled at implementation level: no trace is written while runtime is unauthorized.

## Important limitation
The narrative condition currently uses only a restrained CSS journey indicator. This is deliberate: final character art, expressive imagery or richer narrative treatment would materially affect salience/emotional interpretation and must not be invented before review.

## Required evidence before promotion
1. typecheck/lint/build;
2. desktop/mobile screenshots for L and N;
3. keyboard/focus test;
4. screen-reader/semantic review;
5. contrast, zoom/reflow and touch-target measurements;
6. network inspection confirming no learner-response requests;
7. dependency/security review;
8. final Italian developmental/pedagogical script review;
9. child-safety/privacy implementation review;
10. exact-head human review.

No public/student runtime is authorized by this implementation candidate.