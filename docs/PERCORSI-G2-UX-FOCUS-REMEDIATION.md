# Percorsi G2 — UX focus remediation

## Stato

PR #46 — `feat(percorsi): G2.4 isolated UX prototype`.

Governance invariata: `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`. H1 resta PASS. H2 non viene promosso automaticamente.

## Evidenza umana vincolante

Il collaudo H2 reale su PC/Chrome dell'exact head `8e3cd1d8481def2a6ccbf38601dd38178d83963c` ha riprodotto lo stesso comportamento problematico precedente. L'esito è quindi `H2 = FAIL` per quell'exact head. Il precedente collaudo automatico verde è considerato insufficiente perché modellava le alternative come pulsanti indipendenti e verificava una sequenza di Tab che non coincideva con il modello semantico maturo di una scelta mutuamente esclusiva.

Non si richiede un'ulteriore ripetizione umana sullo stesso modello.

## Correzione strutturale

Le alternative di una scena sono ora un gruppo nativo di `input type=radio` racchiuso in `fieldset`/`legend`:

1. una domanda con alternative mutuamente esclusive usa controlli nativi radio, non pulsanti con `aria-pressed`;
2. Tab entra nel gruppo una sola volta; i tasti freccia spostano selezione e focus tra le alternative secondo il comportamento nativo del browser;
3. Tab successivo esce dal gruppo e raggiunge `Continua` quando è abilitato;
4. `Continua` resta disabilitato finché non esiste una scelta;
5. il feedback resta `role=status`, `aria-live=polite`, `aria-atomic=true` ed è associato al gruppo;
6. `Nuovo percorso` resta assente dalle scene attive e disponibile solo allo stato terminale;
7. dopo `Continua` o `Nuovo percorso` terminale, il titolo `h2` della nuova scena riceve focus post-commit tramite `useEffect`;
8. nessun `tabindex` positivo e nessun ordine del focus artificiale.

Questa soluzione privilegia la semantica HTML nativa e il comportamento interoperabile browser/tecnologie assistive rispetto a una ricostruzione manuale del pattern con pulsanti ARIA.

## Contratto di regressione automatica

Il collaudo G2 deve verificare:

- due alternative esposte come radio native;
- `Continua` disabilitato prima della scelta;
- assenza di `Nuovo percorso` durante una scena attiva;
- selezione della prima alternativa da tastiera;
- feedback annunciabile;
- `Continua` abilitato dopo la scelta;
- freccia nel gruppo radio: focus e selezione passano alla seconda alternativa;
- Tab dal gruppo: focus su `Continua`;
- focus sul titolo della nuova scena dopo la transizione;
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

Il nuovo exact head deve prima superare i controlli automatici. Solo dopo si esegue una nuova verifica umana mirata sul nuovo modello nativo. `H2 = PASS` richiede evidenza umana sul comportamento effettivo con tecnologia assistiva; fino ad allora la PR resta Draft e `NO MERGE`.
