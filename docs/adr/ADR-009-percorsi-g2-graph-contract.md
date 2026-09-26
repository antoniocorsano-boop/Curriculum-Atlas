# ADR-009 — Percorsi G2 come grafo didattico versionato

Status: `PROPOSED`

Date: 2026-09-26

## Context
G1 ha validato un percorso controllato di nove scene, ma ha anche mostrato limiti strutturali: sequenzialità rigida, identificatori tecnici visibili, densità verticale mobile e mancata distinzione semantica fra completamento e nuova sessione. L'evoluzione deve inoltre consentire branching e grammatiche di presentazione differenti senza compromettere equivalenza cognitiva, privacy o accessibilità.

## Decision
Percorsi G2 adotta un grafo didattico versionato come modello canonico. Contenuto cognitivo e transizioni sono indipendenti dalla grammatica di presentazione. Lo stato della sessione è distinto dallo stato di completamento. Il runtime deve essere preceduto da validazione statica degli invarianti.

Il design è informato da pattern maturi osservati in H5P Branching Scenario, Twine e GDevelop, senza assumere tali strumenti come dipendenze o autorità del modello Atlas.

## Consequences
Positive:
- branching esplicito e verificabile;
- renderer L/N sostituibili senza duplicare il contenuto cognitivo;
- terminali e cicli validabili;
- test automatici più forti;
- possibilità futura di editor senza cambiare il contratto runtime.

Costs:
- migrazione del G1 lineare verso il nuovo schema;
- necessità di validatore e fixture di contratto;
- disciplina più forte nella gestione della parità informativa fra grammatiche.

## Rejected
- mantenere un array lineare come modello permanente;
- adottare direttamente un formato H5P/Twine come fonte canonica;
- introdurre un game engine completo;
- aggiungere scoring, classifiche, profili o analytics studente.

## Governance
`PROPOSED` non modifica runtime e non autorizza studenti. L'ADR potrà diventare `APPROVED` solo dopo review del contratto e del validatore G2.