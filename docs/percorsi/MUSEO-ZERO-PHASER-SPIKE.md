# MUSEO ZERO — Phaser 4 technology spike

**Status:** ISOLATED_TECHNOLOGY_SPIKE / NOT_RUNTIME_AUTHORIZED  
**Route:** `/percorsi/lab/museo-zero-phaser`  
**Branch:** `spike/phaser-museo-zero`

## Question

Can Phaser 4 provide a noticeably more **lived, stateful and causally legible** learner experience than the previous card/document prototypes, while remaining web-native and mobile-friendly inside Atlas?

## Scope

One room only.

Story moment:
- Lia enters through the new visitor route;
- the physical sensor is at the new entrance;
- the control booth still listens to the old trigger;
- the projection therefore starts late;
- the learner changes the simulated mapping from A to B;
- the same scene is replayed;
- the room visibly synchronises.

## Deliberately excluded

- no complete Percorso;
- no story registry change;
- no Experience Engine integration;
- no learner progress;
- no badges;
- no persistence;
- no analytics;
- no student identity/account;
- no Q9;
- no public catalogue registration;
- no Atlas #78 modification.

## Technology

Phaser 4.2.1, pinned in this spike and loaded from jsDelivr.

This external CDN dependency is **acceptable only for the experiment**. A production decision would require a separately reviewed dependency/supply-chain strategy and should normally bundle the dependency with Atlas.

Official release reference:
https://phaser.io/download/release/v4.2.1

## PASS criteria

The spike is promising only if Human Review finds that:

1. the room feels like one place rather than a stack of UI components;
2. the learner understands the visible mismatch between new entry and old trigger;
3. changing the mapping has a clear visual consequence in the world;
4. replaying the same scene makes before/after comparison immediate;
5. mobile interaction is comfortable;
6. explanatory prose is secondary to what the room itself shows;
7. the experience suggests a credible path toward MUSEO ZERO without requiring a full game engine architecture rewrite.

## FAIL / stop criteria

Stop Phaser exploration if:

- the canvas still feels like a decorative illustration around a form;
- causal state is not more legible than standard React UI;
- mobile performance or scaling is poor;
- accessibility requires duplicating the whole experience in a second UI;
- integration cost exceeds the experiential gain;
- Phaser begins dictating product architecture rather than serving the approved story/world.

## Evaluation boundary

This spike tests **rendering + stateful world response**, not educational efficacy.

A PASS does not authorize:
- implementation of MUSEO ZERO;
- replacement of the Experience Engine;
- runtime publication;
- Q9.

Human Product Review remains the authority.
