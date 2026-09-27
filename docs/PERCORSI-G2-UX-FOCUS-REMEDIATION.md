# Percorsi G2 — UX focus remediation

## Stato

PR #46 — `feat(percorsi): G2.4 isolated UX prototype`.

Governance invariata: `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`. H1 resta PASS. H2 non viene promosso automaticamente: la nuova implementazione deve superare il collaudo exact-head e una nuova verifica umana mirata.

## Evidenza umana che ha originato la seconda correzione strutturale

Nel collaudo H2 reale su PC/Chrome, la navigazione da tastiera ha mostrato una sequenza confondente: con `Continua` ancora disabilitato, il browser lo esclude correttamente dall'ordine di tabulazione e il focus può raggiungere l'azione secondaria `Nuovo percorso`. L'evidenza umana ha quindi mostrato che il modello era tecnicamente coerente ma non sufficientemente autoesplicativo per il collaudo assistivo.

Questo rilievo è trattato come difetto reale di interazione. Non viene corretto con `tabindex` artificiale e non viene indebolito il test.

## Decisione strutturale

Il contratto di interazione G2 è ora:

1. prima dell'attivazione di una scelta, `Continua` resta disabilitato;
2. la scelta deve essere attivata esplicitamente con mouse, tocco, `Invio` o `Barra spaziatrice`;
3. la scelta attivata espone semanticamente lo stato tramite `aria-pressed` basato sull'identità della scelta, non sulla destinazione del grafo;
4. il feedback è una regione `role=status`, `aria-live=polite`, `aria-atomic=true` ed è associato al gruppo delle scelte;
5. il feedback rende esplicito che, dopo l'attivazione, è possibile continuare oppure cambiare scelta;
6. `Continua` si abilita solo dopo una scelta attivata ed entra allora nell'ordine naturale del focus dopo le alternative;
7. `Nuovo percorso` viene rimosso dalle scene attive: un reset distruttivo non interrompe più il flusso decisionale;
8. `Nuovo percorso` resta disponibile nello stato terminale, dove ha significato esplicito di nuova sessione;
9. dopo `Continua` o `Nuovo percorso` terminale, il trasferimento del focus resta post-commit: il titolo `h2` della nuova scena riceve focus tramite `useEffect` dopo l'aggiornamento React;
10. nessun `tabindex` positivo e nessun ordine del focus costruito artificialmente.

## Contratto di regressione automatica

Il collaudo G2 deve ora verificare anche:

- `Continua` disabilitato prima della scelta;
- assenza di `Nuovo percorso` durante una scena attiva;
- stato `aria-pressed=true` dopo attivazione da tastiera;
- feedback annunciabile;
- `Continua` abilitato dopo la scelta;
- ordine naturale: prima scelta → seconda scelta → `Continua`;
- focus sul titolo della scena dopo la transizione;
- `Esci` e `Nuovo percorso` distinti solo nello stato terminale;
- nuova sessione deterministica.

## Invarianti

- nessun indebolimento del collaudo G2;
- nessuna modifica al runtime G1;
- nessun punteggio, profilo, analitica o persistenza studente;
- nessuna autorizzazione runtime implicita;
- modalità Letterale e Narrativa conservate;
- ramificazione G2 conservata;
- nessun dato personale o risposta inviato ad Atlas.

## Gate

La correzione deve essere valutata sul nuovo exact head della PR. Un workflow verde è necessario ma non sufficiente: `H2 = PASS` richiede ancora evidenza umana sul comportamento effettivo con tecnologia assistiva.
