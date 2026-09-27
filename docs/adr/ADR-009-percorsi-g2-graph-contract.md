# ADR-009 — Percorsi G2 come grafo didattico versionato

Status: `APPROVED`

Date: 2026-09-26
Approved: 2026-09-27
Approval basis: `CONTRACT_REVIEW = PASS` + `VALIDATOR_PASS = PASS` on exact head `cac7f3be6c8f808934130ea0a400b0472ed96640`.

## Context
G1 ha validato un percorso controllato di nove scene, ma ha mostrato limiti strutturali: sequenzialità rigida, identificatori tecnici visibili, densità verticale mobile e mancata distinzione semantica fra completamento e nuova sessione. G2 deve consentire branching e grammatiche differenti senza compromettere equivalenza cognitiva, privacy, accessibilità o verificabilità automatica.

## Decision
Percorsi G2 adotta un grafo didattico versionato come modello canonico. La semantica cognitiva è rappresentata da unità canoniche con provenienza; nodi e transizioni le referenziano; le grammatiche L/N sono renderer con copertura semantica verificabile.

La funzione cognitiva usa un registro versionato. I cicli sono vietati o esplicitamente limitati. Non esiste un canale generico `SessionEffect` in v2.0. Governance/privacy sono policy machine-readable. Terminali, completamento e nuova sessione hanno semantiche distinte e deterministiche. La compatibilità dello schema è esplicita e non ammette auto-upgrade silenziosi.

L'accessibilità produce tre classi separate di evidenza: contratto statico, runtime automatico e verifica umana con tecnologia assistiva. Nessuna classe sostituisce impropriamente l'altra.

Il design è informato da pattern maturi osservati in H5P Branching Scenario, Twine e GDevelop, senza assumere tali strumenti come dipendenze o autorità del modello Atlas.

## Consequences
Positive:
- branching esplicito e verificabile;
- parità L/N misurabile come copertura di unità semantiche, non uguaglianza testuale;
- renderer sostituibili senza duplicare la fonte cognitiva;
- terminali, cicli, restart e governance validabili;
- test automatici più forti e fixture di migrazione;
- possibilità futura di editor senza cambiare il contratto runtime.

Costs:
- migrazione del G1 lineare verso il nuovo schema;
- registro delle funzioni cognitive e registro contenuti versionati;
- validatore e fixture di contratto;
- review editoriale ancora necessaria per la qualità dell'equivalenza linguistica e semantica.

## Rejected
- mantenere un array lineare come modello permanente;
- adottare direttamente un formato H5P/Twine come fonte canonica;
- introdurre un game engine completo;
- usare un generico `SessionEffect` non governato;
- dedurre la parità L/N dalla sola uguaglianza testuale;
- aggiungere scoring, classifiche, profili o analytics studente;
- trattare test automatici di accessibilità come sostituti della verifica umana assistiva.

## Governance
`APPROVED` approva il contratto architetturale G2 come base governata per le fasi successive. Non modifica il runtime G1, non autorizza l'uso con studenti e non promuove automaticamente alcun prototipo G2 a runtime. Ogni implementazione resta soggetta ai gate `UX_PROTOTYPE_REVIEW`, `IMPLEMENTATION_CANDIDATE` ed `EXACT_HEAD_REVIEW`; l'autorizzazione studenti rimane separata e richiede anche la verifica umana valida con tecnologia assistiva.
