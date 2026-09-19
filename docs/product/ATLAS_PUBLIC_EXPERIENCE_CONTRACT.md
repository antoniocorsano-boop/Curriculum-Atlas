# ATLAS-P1 — Public experience contract

Status: PRODUCT_CONTRACT_DRAFT  
Date: 2026-09-19

## Product promise

A teacher can move from curriculum meaning to usable lesson material without manually searching Drive.

Canonical journey:

`Home → Materiali → Classe → Learning Object → Proietta/Scheda/Guida`.

## Home

Primary tasks:
- Esplora il curricolo
- Trova un percorso/UDA
- Apri materiali di lezione
- Esplora la mappa

Do not force the 3D view as the home.

## Materials Hub

Filters:
- discipline;
- grade;
- period;
- UDA;
- LO;
- asset type;
- lifecycle.

Card:
- human-readable title;
- grade;
- duration;
- lifecycle/version;
- 2–3 trust badges;
- Proietta;
- Scheda studente;
- Guida docente;
- Valutazione when available.

Technical ids remain available under details/provenance, not as primary labels.

## LO page

Sections:
- Usa in classe
- Che cosa si impara
- Come si lavora
- Evidenza e valutazione
- Nel curricolo
- Provenienza e stato

Actions:
- Proietta alla LIM
- Apri scheda studente
- Apri guida docente
- Valutazione
- Prepara in Docente OS

## Deep-link handoff

`Prepara in Docente OS` carries a versioned `HandoffContext`:
- loId;
- loVersion;
- curriculumNodeIds;
- UDA/segment when known;
- asset role;
- origin URL.

Docente OS resolves its own user/class/workspace context.

## Trust Drawer

Explain:
- source;
- version;
- lifecycle;
- human validation;
- accessibility evidence;
- privacy claim;
- AI involvement;
- build/release identity.

## Acceptance

- 3 pilot LO v0.2 discoverable within 3 interactions;
- classroom actions work without manual Drive navigation;
- responsive desktop/Android/LIM;
- keyboard and semantic HTML;
- no student personal data;
- exact release identity;
- provenance retained;
- 3D optional.
