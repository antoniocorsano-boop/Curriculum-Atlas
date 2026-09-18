# ADR-0001 — Stable-first spatial stack

**Status:** Accepted for S1 POC  
**Date:** 2026-09-18

## Decision

S1 uses a deliberately small stable core:

- React 19.3.0
- Three.js 0.186.0 (r186)
- @react-three/fiber 9.7.0
- @react-three/drei 10.7.8
- Zustand 5.0.8
- Vite 8.3.0 + TypeScript 7.0.2

No alpha/pre-release spatial library is allowed in the S1 core. @react-three/uikit, force-graph, post-processing and Theatre.js remain gated candidates for later slices.

## Why

The purpose of S1 is to validate whether spatial reconfiguration improves curriculum comprehension on real devices, not to maximize visual effects.

## Accessibility

The Canvas is never the sole access path. S1 ships an HTML semantic mirror with keyboard-accessible node selection. prefers-reduced-motion disables auto-rotation and makes scene transitions immediate.

## Data authority

The fixture is a read-only subset of Curriculum Atlas v0.1 — Registro canonico consolidato. Link statuses are preserved exactly; no PROPOSED relation is promoted to VALIDATED.
