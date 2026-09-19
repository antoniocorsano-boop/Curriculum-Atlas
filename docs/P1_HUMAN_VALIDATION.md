# ATLAS-P1 — Human Validation Protocol

Status: READY_FOR_HUMAN_VALIDATION  
Date: 2026-09-19  
PR: #6

## Goal

Validate the first task-oriented public Curriculum Atlas experience before any public canonical release.

## Exact subject

Use only the preview artifact built from the exact PR head recorded in the workflow.

The preview is not production and does not replace the existing S1 GitHub Pages deployment.

## Critical journey

1. Open Curriculum Atlas.
2. From Home choose **Materiali**.
3. Confirm that **TEC-SYS-001 — Bisogni, risorse e sistemi** is immediately understandable as a first-grade Technology resource.
4. Open the Learning Object.
5. Confirm lifecycle/version are visible but not dominant.
6. Select **Proietta**.
7. Confirm the canonical LIM asset opens.
8. Return to Atlas.
9. Open **Scheda studente**.
10. Return to Atlas.
11. Open **Guida docente**.

Pass condition:
the teacher can reach and use the three material roles without manually browsing Drive folders.

## Mobile / Android

Check:
- no horizontal page overflow;
- navigation remains understandable;
- Home CTA visible without excessive scrolling;
- Material cards readable;
- buttons/touch targets usable;
- LO detail not cramped;
- asset actions stack cleanly;
- no accidental loading of 3D until Mappa is selected.

## Desktop / LIM

Check:
- primary navigation readable from projected view;
- Home hierarchy clear;
- Materials Hub can be scanned quickly;
- classroom actions have obvious priority;
- text does not become excessively wide;
- contrast remains adequate at normal projector brightness.

## Keyboard

Check:
- Tab order follows visible order;
- focus is visible;
- all navigation and material actions can be activated by keyboard;
- opening/closing details does not trap focus;
- Mappa has an HTML-accessible alternative.

## Content trust

Confirm:
- all three pilot LO show GENERATED / da validare;
- version 0.2 is visible;
- no badge says GDPR compliant / AI Act compliant / legal;
- no student/personal data is visible;
- provenance remains reachable.

## Human receipt

Record:
- device;
- browser;
- viewport/orientation;
- journey PASS/FAIL;
- issue(s);
- classroom usefulness;
- whether Proietta / Student / Teacher were found without guidance.

## Promotion rule

Human PASS may move the slice from:

IMPLEMENTED_PENDING_HUMAN_VALIDATION

to:

HUMAN_VALIDATED_PILOT

It does not make the LO CANONICAL and does not by itself authorize public production release.
