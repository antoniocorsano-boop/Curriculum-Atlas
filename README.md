# Curriculum Atlas Spatial

S1 is the first **read-only spatial proof of concept** for Curriculum Atlas.

The same canonical curriculum subset is reorganized as **Universe, Galaxy, Verticale, Timeline and Focus**. The 3D scene is a visualization layer only: provenance and epistemic status remain authoritative in the consolidated registry.

## S1 dataset

- 15 real curriculum nodes
- 7 real Docente OS plan segments
- 16 candidate links
- 9 review-ready, 2 exploratory, 5 blocked
- zero automatic VALIDATED relations

## Stable-first stack

React 19.2.8 · Three.js r186 · React Three Fiber 9.7.0 · Drei 10.7.8 · Zustand 5.0.8.

## Quality posture

- exact top-level dependency pins
- read-only data fixture
- semantic HTML mirror for non-Canvas access
- prefers-reduced-motion support
- deterministic data validation before build
- no backend, authentication, analytics or personal data

S1 is **not** a public release. Human/device validation on Android, desktop/LIM, keyboard and screen reader remains required before closure.

See docs/ADR-0001-spatial-stack.md and docs/S1_ACCEPTANCE.md.
