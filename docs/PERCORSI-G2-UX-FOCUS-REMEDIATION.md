# Percorsi G2 — UX focus remediation

## Stato

PR #46 — `feat(percorsi): G2.4 isolated UX prototype`.

Governance invariata: `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`. Il gate `UX_PROTOTYPE_REVIEW` resta aperto fino a collaudo G2 verde e successiva revisione prevista.

## Evidenza che ha originato la correzione

Sul precedente exact head `90966e747a74be77be2d8ef9717a04c1315d855b` il workflow `Percorsi G2 UX Collaudo` ha superato installazione, typecheck, lint e build, ma il collaudo comportamentale ha rilevato:

`Error: L focus moves to new scene heading`

Il rilievo è trattato come difetto reale di accessibilità/interazione. Non viene abbassata né rimossa l'asserzione del test.

## Causa

Il componente richiedeva il focus con `requestAnimationFrame` immediatamente dopo `setNodeId`. Questo lega il trasferimento del focus al frame successivo, non al commit effettivo della nuova scena React.

## Decisione correttiva

Il trasferimento del focus è ora post-commit:

1. l'azione di navigazione marca esplicitamente che la scena successiva deve ricevere focus;
2. aggiorna lo stato (`nodeId` oppure `session`);
3. un `useEffect` dipendente dallo stato della scena viene eseguito dopo il commit;
4. il titolo `h2` della scena, già programmaticamente focalizzabile con `tabIndex=-1`, riceve il focus;
5. lo scorrimento viene riallineato al titolo senza animazione forzata.

La stessa regola vale per `Continua` e `Nuovo percorso`. Il caricamento iniziale non sottrae il focus all'utente.

## Invarianti

- nessun indebolimento del collaudo G2;
- nessuna modifica al runtime G1;
- nessun punteggio, profilo, analitica o persistenza studente;
- nessuna autorizzazione runtime implicita;
- modalità Letterale e Narrativa conservate;
- feedback annunciabile e ramificazione G2 conservati.

## Gate

La correzione è candidata al nuovo collaudo automatico sull'exact head della PR. Un esito verde del workflow è evidenza necessaria ma non sufficiente a promuovere il prototipo oltre `UX_PROTOTYPE_REVIEW`.
