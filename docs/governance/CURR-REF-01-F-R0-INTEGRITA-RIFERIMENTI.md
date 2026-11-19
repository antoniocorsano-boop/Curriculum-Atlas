# CURR-REF-01/F-R0 — Integrità dei riferimenti curricolari

Data: 2026-11-19. Stato: IMPLEMENTATION_CANDIDATE / NO_PUBLICATION.
Base: d2938378c9384c5122adb8379396dbad5b4385fe. Raccordo: [TRAMA PR #348](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/348).

## Causa e decisione

Il proiettore univa disciplina, nome della classe e posizione, omettendo l'ordine. Sul bundle effettivo: 106 fasce ordinarie univoche, 549 obiettivi proiettati, 399 chiavi distinte e 150 collisioni. Riusare l'identità della fascia sorgente, non creare una nuova autorità o modificare il bundle. Anche argomenti e codici di consultazione usano ora la fascia. Gli ID restano riferimenti Atlas di proiezione posizionali e non sono identificativi ministeriali o stabili tra versioni in caso di riordinamento del contenuto.

Alternative scartate: aggiungere un suffisso solo alle collisioni (instabile), redirigere alla prima corrispondenza (errato), riscrivere il master (violazione di autorità). Le vecchie rotte ricostruibili mostrano candidati espliciti della versione corrente, anche se uno solo; non garantiscono equivalenza con una revisione storica. La risoluzione ordinaria accetta soltanto ID correnti esatti e rifiuta duplicati all'avvio. Il riferimento storico tech-s2-1 delle tre risorse resta conservato ma non è presentato come link valido; richiede raccordo professionale, senza attribuzioni automatiche. Il catalogo verifica anche disciplina e ordine.

## Qualificazione

Il gate di regressione esistente esegue il codice effettivo di proiezione e grafo, controlla unicità di obiettivi, codici, argomenti, nodi, archi, rotte, risoluzione esatta, candidati storici, caso Tecnologia primaria/secondaria, riferimenti non risolvibili e conservazione della facciata durante sync. Il controllo del catalogo e della pagina storica nel gate è statico; la navigazione reale richiede build e prova browser. Il gate non verifica l'equivalenza semantica dei riferimenti attraverso revisioni diverse. CI e revisione esatta ancora da verificare. Nessuna approvazione istituzionale, pubblicazione o modifica ad Arena, Studio Atlas, export, autorità o mondi 3D. F-R1 e raccordo risorse con ATL-KB-01 restano separati.
