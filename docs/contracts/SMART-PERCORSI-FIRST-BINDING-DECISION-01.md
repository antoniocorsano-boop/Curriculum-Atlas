# SMART-PERCORSI-FIRST-BINDING-DECISION-01 — Decision gate per il primo binding reale

**Stato:** DRAFT / QUALIFICATION_ONLY / NO_ACTIVE_BINDING  
**Baseline:** `337761cc5219c54a3f3c3628e2c14ec20c49d3ae`

## Scopo

Impedire che il primo binding Smart → Percorso venga creato per somiglianza tematica o convenienza tecnica.

Il primo binding reale può essere registrato solo quando esistono contemporaneamente:

- un Material Set Smart identificato e qualificabile;
- un `pathwayId` specifico già governato;
- una decisione esplicita che collega proprio quel Material Set a proprio quel Percorso;
- un riferimento alla progettazione/ridefinizione del Percorso che dimostri come i materiali Smart vengono riusati;
- identità Percorsi completa: `runtimeExactHead`, `pathwayId`, `contentVersion`, `publicationId`;
- autorità e relativo riferimento di evidenza.

## Situazione corrente

Il candidato Smart noto è:

- attività: `SP-01 — Analizzare un sistema tecnologico`;
- Material Set: `sistema-tecnologico-analisi`, versione 2.

Il contratto `ATLAS-SMART-ACTIVITY-01` stabilisce che una Attività Smart può generare un candidato Percorso soltanto mediante **decisione esplicita e nuova progettazione**.

Il Percorso governato già identificato `PW-MISSING-INFORMATION-01 — Prima di decidere, cosa manca?` non costituisce evidenza di destinazione per SP-01. Non esiste nel repository un collegamento governato tra i due.

Pertanto lo stato corretto del primo binding è:

`BLOCKED_NO_GOVERNED_PATHWAY_TARGET`

## Divieti

Finché lo stato è bloccato:

- il registro `smart-percorsi-binding-registry.json` deve restare senza binding attivi;
- non è consentito usare `PW-MISSING-INFORMATION-01` come target implicito;
- non è consentito derivare un `pathwayId` da `activityId`, titolo, argomento o similarità lessicale;
- non è consentito produrre una `SmartPathwayBindingEvidence` reale;
- nessun Q5/Q6/Q1 o Q9 può essere avanzato per effetto di questa decisione.

## Condizione di sblocco

La decisione può diventare `READY_FOR_BINDING_REGISTRATION` soltanto dopo una nuova tranche che identifichi esplicitamente il target Percorso e includa almeno:

1. `pathwayId` governato;
2. riferimento al dossier/spec del Percorso;
3. decisione umana di promozione/associazione;
4. piano di riuso dei materiali;
5. candidate identity Percorsi completa;
6. autorità coerente.

Questa tranche non crea il binding: qualifica se esistono le condizioni per crearne uno.
