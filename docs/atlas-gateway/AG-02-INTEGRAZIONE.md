# AG-02 — Integrazione dei tre portali Atlas

Stato: RICOGNIZIONE COMPLETATA / CONTRATTO CANDIDATO / RUNTIME NON AUTORIZZATO.

## Evidenze e decisioni

Atlas main d2938378c9384c5122adb8379396dbad5b4385fe:
- src/app/curricolo/page.tsx: pagina funzionante, conserva provenienza Arena e avviso di curricolo provvisorio.
- src/app/esplora/page.tsx: esplorazione relazionale disponibile.
- src/app/obiettivi/page.tsx e src/app/raccordi/page.tsx: superfici predisposte, non funzionalità completate.
- src/app/materiali/page.tsx, src/app/risorse/page.tsx e src/app/percorsi/page.tsx: destinazioni esistenti, da mantenere; la biblioteca unitaria /esperienze non risulta presente.
- src/features/pathways/load-public-pathways.ts esclude i percorsi privi di RUNTIME_AUTHORIZED; governance/percorsi-portfolio.json contiene due candidati, nessuno autorizzato al runtime. Non aggirare il filtro tramite deep link.
- src/components/atlas/app-shell.tsx: Atlas pubblico senza account; next.config.ts: Next static export, basePath /Curriculum-Atlas su GitHub Pages, trailingSlash. Usare Next Link per le rotte interne; non assegnare URL assoluti hardcoded.

Studio Atlas, TRAMA main 4d9b7b487f3f920dad54593683b19a742d639b84:
- docs/decisions/trama-adr-020-studio-atlas-product-boundary.md: prodotto autonomo; nessun editor o login professionale duplicato in Atlas.
- docs/capabilities/atlas-percorsi/product/STUDIO-ATLAS-S1-IMPLEMENTATION-RECEIPT-v0.1.md: prodotto in products/studio-atlas/, build verificata, non autorizzato al runtime, identità professionale non implementata nella ricevuta.
- docs/capabilities/atlas-percorsi/product/STUDIO-ATLAS-PREVIEW-BRIDGE-RECEIPT-v0.1.md: anteprima separata su origini distinte, nessuna autorizzazione studenti. Non usare le porte locali di collaudo né le rotte lab come destinazioni pubbliche.

## Esperienza di accesso
- Un tocco su Curricolo apre la vista reale. Esplora rimane raggiungibile.
- Un tocco su Esperienze deve aprire una biblioteca unitaria con Storie, Laboratori, Scoperte, Percorsi e ricerca. La futura /esperienze è una nuova superficie di aggregazione, non un nuovo archivio. Riusa i cataloghi, i metadati e i filtri di pubblicazione esistenti. Stato vuoto esplicito se nessun contenuto autorizzato. Non classificare arbitrariamente le risorse.
- Studio presenta un accesso professionale separato, attivabile solo dopo verifica dell'origine autorizzata e dell'identità. Fino ad allora: spiegazione sintetica e nessuna navigazione fittizia.
- I collegamenti diretti alle esperienze già autorizzate non richiedono il passaggio dalla sala. Ritorno alla sala e alternativa accessibile condividono le stesse destinazioni.

## Contratto
[destinations.v1.json](destinations.v1.json) distingue rotte accertate, proposte e bloccate. Non è una configurazione di produzione; la baseline HTML non viene riscritta.

## Gate successivi
1. AG-03: isolare il renderer, le interazioni e il resolver; creare la biblioteca unitaria in una candidata non pubblicata; integrare Next Link/basePath; dipendenze locali e licenze.
2. Rivedere il canale iframe: la baseline usa postMessage '*' e controlla e.source; qualificare l'isolamento e il protocollo prima di qualsiasi collegamento reale. Nessun contenuto sensibile nel messaggio.
3. AG-04: test di route, autorizzazioni, accessibilità, performance WebGL e mobile; nessun accesso involontario a lab, demo o Studio.
4. AG-05: revisione indipendente e approvazione esplicita. Home e distribuzione non modificate da AG-02.

La verifica è documentale sul codice ai riferimenti indicati, non collaudo browser o autorizzazione di distribuzione.
