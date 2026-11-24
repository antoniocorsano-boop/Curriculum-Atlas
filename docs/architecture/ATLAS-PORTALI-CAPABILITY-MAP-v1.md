# ATLAS-PORTALI-02 — Mappa canonica delle capacità e dei quattro portali

**Stato:** baseline di progettazione conservata, **non** autorizzazione alla pubblicazione.  
**Data di ricognizione:** 23 novembre 2026.  
**Responsabile del registro:** Curriculum-Atlas, repository `antoniocorsano-boop/Curriculum-Atlas`.  
**Fonte strutturata unica:** [`governance/atlas-portal-capability-map.v1.json`](../../governance/atlas-portal-capability-map.v1.json).  
**Linea di sviluppo:** [PR #189 — INGRESSO-WEB-01](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/189), in bozza.

## Perché esiste questo documento

Atlas deve smettere di dipendere dalla ricostruzione delle conversazioni per sapere *quali capacità possiede*, *dove si trovano*, *a chi appartengono*, *quanto sono mature* e *che cosa manca per proporle agli studenti*. Questo file è la **porta d'ingresso permanente** all'inventario; il JSON collegato è il **registro aggiornabile** delle capacità. Non creare copie concorrenti su altri rami, Drive o TRAMA: conservare altrove soltanto collegamenti a questi due file e ai rispettivi commit.

I quattro portali non sono quattro nuove applicazioni, ma quattro **intenzioni di navigazione** sulla stessa base di contenuti e strumenti. Chi arriva per curiosità non deve necessariamente conoscere termini curricolari; chi cerca una disciplina deve poterla raggiungere direttamente.

| Porta | Promessa all'utente | Base attuale | Differenza da colmare |
| --- | --- | --- | --- |
| **Esplora** | «Ho una curiosità» | `/esplora/`, grafo e vista elenco, collegamenti tra discipline e obiettivi | Ingresso da domanda concreta e scoperta guidata, non solo navigazione gerarchica |
| **Esperienze** | «Voglio entrare in un mondo» | Motore Esperienze e anteprima Studio Atlas/EduTwin **in laboratorio** | `/esperienze/` non è ancora presente in `main`; creare il catalogo pubblico filtrato, poi approvare un'esperienza vera |
| **Percorsi** | «Voglio affrontare una sfida» | `/percorsi/`, catalogo e due itinerari candidati | I due itinerari sono `NOT_RUNTIME_AUTHORIZED`, quindi non sono visibili come contenuti pubblicati |
| **Curricolo** | «Voglio orientarmi e approfondire» | `/curricolo/`, progressione verticale, obiettivi, tracciabilità Arena | Versione Arena provvisoria e **non vigente**: informazione sempre dichiarata e non sostituita con una finta approvazione |

**Materiali** e **Risorse** restano presenti (`/materiali/` e `/risorse/`) ma rappresentano capacità trasversali, non un quinto portale. L'attuale PR #189 usa *Materiali* come quarta destinazione **transitoria** in luogo della rotta `/esperienze/` ancora assente: non reinterpretare tale espediente come decisione di prodotto definitiva.

## Capacità recuperate: dove cercarle

### Esplora e consultazione

- **Mappa relazionale:** `src/components/atlas/relation-explorer.tsx` e `src/features/explore/graph.ts`; UI funzionante, da rendere meno tecnica all'ingresso.
- **Curricolo verticale:** `src/components/atlas/curriculum-tree.tsx`, `src/app/curricolo/page.tsx`; legge lo stato proveniente da Arena.
- **Risorse e materiali:** `src/app/risorse/page.tsx`, `src/app/materiali/page.tsx` e relativi componenti; collegare tramite riferimenti e provenienza, non tramite archivi duplicati.

### Esperienze: capacità tecnica e prodotti candidati sono cose diverse

- **Motore:** `src/features/experiences/experience-runtime.tsx` e laboratorio `src/app/experience-lab/conformance/page.tsx`. Il collaudo del motore **non** equivale all'approvazione di una storia da offrire a uno studente.
- **Studio Atlas professionale:** [sorgenti TRAMA Studio](https://github.com/antoniocorsano-boop/trama-ecosistema/tree/main/products/studio-atlas). È l'ambiente per creare storia, mondo, scene, scelte e trasferimento, *non* una sezione pubblica per alunni.
- **Anteprima governata:** [ponte Studio → Atlas](../STUDIO-ATLAS-PREVIEW-ADAPTER-v0.1.md) e [illustrazioni EduTwin](../EDUTWIN-ILLUSTRATED-PREVIEW-v0.1.md). Entrambi sono **anteprime private**, non pubblicazioni.
- **Missione 118:** [PR #84](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/84) in bozza; materiali da riqualificare in relazione a diritto d'uso, accessibilità, apprendimento e decisione di pubblicazione.
- **Museo Zero — La sala che non torna:** [specifica del mondo](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/main/docs/capabilities/atlas-percorsi/pathways/PW-STRATEGY-SELECTION-01/worlds/MUSEO-ZERO/world-brief-v1.md). Laboratorio narrativo da conservare, non percorso pubblico già approvato.

### Percorsi: catalogo pronto, contenuti non ancora rilasciati

- **Biblioteca e filtro runtime:** `src/features/pathways/pathway-catalog.tsx`, `src/features/pathways/load-public-pathways.ts`.
- **Unica fonte dello stato dei candidati:** `governance/percorsi-portfolio.json`, `governance/percorsi-student-library.json`.
- **Candidato 1:** *Prima di decidere, cosa manca?* — `IMPLEMENTED_CANDIDATE`, `NOT_RUNTIME_AUTHORIZED`.
- **Candidato 2:** *Una soluzione, molti vincoli* — `IMPLEMENTATION_CANDIDATE`, `NOT_RUNTIME_AUTHORIZED`.
- **Sei territori della Biblioteca Percorsi:** ipotesi di organizzazione **non approvata**; non usarli per classificare persone e non presentarli come tassonomia definitiva.
- **Conseguenza pubblica:** finché manca autorizzazione esplicita, il catalogo dei Percorsi **non deve mostrare** i candidati come disponibili.

### Produzione, accessi e governance

- **Visual Factory:** [filiera TRAMA](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/main/docs/capabilities/atlas-percorsi/production/VISUAL-FACTORY-v0.1.md); produzione e qualificazione dei media separata dalla home.
- **Architettura di accesso:** [TRAMA ACCESS-01](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/main/docs/superpowers/specs/2026-10-10-trama-access-01-ecosystem-access-architecture-design.md). Alunni senza account nominativo per impostazione predefinita; aree professionali separate.
- **Qualità delle esperienze:** [contratto biblioteca studente](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/main/docs/capabilities/atlas-percorsi/product/STUDENT-LIBRARY-PRODUCT-CONTRACT-v1.md). La qualità della narrazione, le azioni e le conseguenze vengono valutate da persone; il controllo automatico non autorizza il prodotto.
- **Ingresso web leggero:** [PR #189](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/189) e [anteprima tecnica](https://g1-043d3e5bb493.atlas-pr-preview.pages.dev/): impianto valutato positivamente come base, da evolvere verso quattro porte autentiche e una maggiore accoglienza.
- **Ingresso 3D:** [PR #188](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/188), linea **sospesa per l'accesso**; preservare evidenze e modelli, non riavviare la generazione illustrativa come prerequisito.

## Piano verticale, senza dispersione

1. **P0 — Conservazione**: mantenere e verificare la mappa, classificare i prodotti con ID e stato; completato a livello di inventario iniziale dopo la qualifica di questa PR.
2. **P1 — Quattro porte vere**: convertire l'attuale quarta scheda transitoria *Materiali* in *Esperienze*; aggiungere una rotta `/esperienze/` realmente raggiungibile, **vuota in modo esplicito** quando non vi sono esperienze autorizzate.
3. **P2 — Esplora primo**: consegnare un percorso domanda → conoscenza → risorsa esistente, adeguato a smartphone e tastiera.
4. **P3 — Una sola esperienza autentica**: selezionare un candidato; farne una scena narrativamente e didatticamente completa; verificare qualità, diritti e approvazione umana prima dell'attivazione.
5. **P4 — Relazioni tra le porte**: collegare contenuti, percorsi, obiettivi e materiali senza duplicazione di archivi o nuova autorità.
6. **P5 — Verifica completa**: browser, smartphone fisico, LIM, accessibilità, comprensione per fascia d'età, provenienza e autorizzazione separata a ogni pubblicazione.

## P1 — Attuazione delle quattro porte nel ramo candidato (23 novembre 2026)

La quarta porta **Esperienze** è stata realizzata nella [PR #189](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/189), senza integrare o pubblicare il sito canonico:

- home: quattro portali **Esplora · Esperienze · Percorsi · Curricolo** con descrizioni orientate all'utente e con maggiore rilievo per la scoperta;
- `/esperienze/`: pagina Next.js reale, con presentazione di **Storie · Laboratori · Scoperte** come ambiti futuri; nessuna esperienza candidabile viene mostrata come già fruibile;
- navigazione comune: accesso a Esperienze dalla barra laterale e da quella mobile; Materiali e Risorse rimangono disponibili come sezioni trasversali;
- in assenza di autorizzazioni delle esperienze, il portale comunica apertamente che non sono ancora disponibili attività e conduce invece alle sezioni consultabili Esplora e Materiali;
- codice presentazionale in CSS locale, senza immagini generate, risorse remote, WebGL o nuove dipendenze.

**Stato di governo:** `routeOnMain=false` e `routeOnCandidate=true` nel registro per Esperienze. Questo distingue la rotta presente sulla PR dalla rotta non ancora integrata su `main`. La nuova capacità `experience-portal` è una **superficie pubblica vuota**, non una dichiarazione di approvazione di Missione 118, Museo Zero o dei percorsi candidati. Tutti i loro stati di autorizzazione rimangono invariati.

**Gate successivo:** verifica di compilazione, navigazione reale e accessibilità sul commit della PR, quindi anteprima isolata con revisione umana. L'esito tecnico non integra `main` e non autorizza contenuti learner.

## P2 — Primo viaggio Esplora: dalla domanda alla scoperta (23 novembre 2026)

**Caso concreto:** «Perché una lampada si scalda se deve fare luce?». È una scena interattiva in **tre tappe**, non un questionario e non una generazione di immagini: domanda iniziale, trasformazione energia elettrica → luce utile e calore disperso, confronto con altri dispositivi e passaggio alla rete dei saperi.

**Riuso verificato nei sorgenti della PR #189:**
- `src/features/explore/energy-discovery.tsx` è la scena a tre tappe; `energy-discovery.module.css` realizza le forme visive senza servizi o immagini nuove;
- `src/features/explore/explore-hub.tsx` collega la scena alla **mappa Esplora effettiva**, non a un catalogo fittizio;
- `src/components/atlas/relation-explorer.tsx` seleziona nella vista a elenco il nucleo «analizzare sistemi energetici/produttivi» di Tecnologia, **derivandolo dal grafo prodotto a partire da Arena**, senza creare un finto obiettivo;
- `src/features/materials/fixtures.ts` attesta l'associazione del materiale `3e-20260923-infografica` alla lezione pubblica `3e-tec-02`, e il file preesistente `public/materials/2026-09-23/3e/dove-va-l-energia.svg` fornisce lo **schema reale**. Il collegamento viene letto dalla fonte di dati già in uso, non riprodotto in un secondo archivio.

**Governance dei contenuti:** la risorsa è già collegata a una lezione pubblica di Atlas e viene presentata come **schema esistente**, non come nuovo prodotto approvato. Il curricolo Arena su cui si basa la mappa risulta `PROVISIONAL_COMPLETE` / **non vigente**; lo stato resta esplicitamente visibile. Nessun percorso o esperienza in laboratorio viene attivato. Nessun dato personale è memorizzato: le tre tappe sono puro stato locale temporaneo del navigatore.

**Qualificazione P2:** test del navigatore per tutte e tre le tappe, lettura della risorsa SVG esistente, selezione dell'obiettivo effettivo e collegamento al dettaglio, ritorno all'inizio, accesso da tastiera, responsive 320/360/390/768/1280 px e assenza di richieste a fornitori esterni. La riuscita deve essere verificata sul commit esatto e non dedotta dalla presenza del codice.

**Gate:** questa capacità è `IMPLEMENTED_P2_IN_PR_NOT_CANONICAL`: resta nel ramo PR #189, non nel sito principale, fino a collaudo automatico e revisione diretta dell'esperienza. Sviluppi successivi possono aggiungere altre domande solo se esistono riferimenti verificabili e diritti/qualità adeguati.

## P3 — MUSEO ZERO: ricostruzione del primo mondo narrativo nel laboratorio (24 novembre 2026)

**Candidato scelto:** *MUSEO ZERO · La sala che non torna*, già sviluppato in Studio Atlas con **sette scene canoniche, quattro luoghi, otto indizi, personaggi Lia/Omar/Teo, branching esplicito e conseguenze `worldAfter`**.

**Decisione di governo imprescindibile:** [Human Product Review del 4 ottobre 2026](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/main/docs/capabilities/atlas-percorsi/pathways/PW-STRATEGY-SELECTION-01/worlds/MUSEO-ZERO/HUMAN-PRODUCT-REVIEW-v0.1.md) = **REVISE**, non PASS. Il progetto originale resta `worldReview=READY`, `productReview=READY`, `storyboardReady=false`, `production=NOT_REQUESTED`; il nuovo prototipo non cambia questi stati. Il livello narrativo è un **artefatto di revisione professionale**, non una lezione o esperienza student-facing. Non inserirlo nella home `/esperienze/` o nella biblioteca `/percorsi/` e non concedere `runtimeAuthorized` o `studentAuthorized`.

### Provenienza e materiale congelato

- Sorgente autorevole: [TRAMA · Studio Atlas, `museo-zero.ts`](https://github.com/antoniocorsano-boop/trama-ecosistema/blob/main/products/studio-atlas/lib/canonical/museo-zero.ts).
- Blob Git della sorgente letta: `27037f3af1e12b660e9108d2eaf6be32f1a42f48`.
- SHA-256 della sorgente in formato UTF-8: `bda63f478da6c073b8e83b23fa07631cd3a9c7cc39d2c062e8c867f788927236`.
- Proiezione congelata con scene, posizioni, indizi, scelta e conseguenze **copiati integralmente** dal documento originale: `src/features/experiences/museo-zero-p3-review-snapshot.ts`. È una **derivazione per collaudo**, non una nuova sorgente editoriale: eventuali nuove revisioni della storia devono nascere in Studio Atlas e produrre uno snapshot aggiornato con nuova provenienza. Il digest lega il candidato alla specifica sorgente, non approva il prodotto.
- Adattatore già esistente: `src/features/pathways/studio-atlas-preview-adapter.ts` (fail closed, valide destinazioni, scene TRANSFER, `studentAuthorized=false`, `runtimeAuthorized=false`). Esecuzione: `PathwayRuntimeSurface → ExperienceRuntime`; nessun motore duplicato.

### Modifiche mirate ai rilievi della Human Review

| Rilievo precedente | Nuova superficie di revisione da qualificare | Residuo da verificare da persona |
| --- | --- | --- |
| R1 · luogo non percepibile | Quattro luoghi già navigabili nel runtime, rappresentati da una scena ambientale CSS; nessuna grafica pretesa come Q4 approvata | Credibilità spaziale e accoglienza del museo |
| R2 · indizi passivi | Otto evidenze verificabili sul posto e appuntabili al banco nell'ordine scelto | Effettiva iniziativa del ragazzo |
| R3 · rappresentazioni nominali | Ordinamento cronologico modificabile con frecce; creazione esplicita di collegamenti fra indizi; tavola comparativa derivata dagli stati `worldAfter` delle scelte canoniche | Scelta non meccanica della rappresentazione e comprensione delle cause |
| R4 · conseguenze testuali | Nuova rappresentazione della Sala Zero con proiezione, sensore, percorso e stati osservabili *ritardo / stabile / manuale*, accompagnati da alternativa testuale accessibile | Leggibilità del mutamento **prima** del feedback verbale |
| R5 · trasferimento già risolto | In MZ5 si confrontano accessibilità, affidabilità e lavoro necessario prima di consigliare un intervento e vederne la conseguenza | Giustificazione della raccomandazione e qualità del compromesso |
| R6 · personaggi tutor | Ripristinati battute e tracce originali di Lia, Omar e Teo, senza alterare la trama | Autenticità dei caratteri e loro contributo all'indagine |
| R7 · ritmo passivo | Strumenti persistenti nel medesimo motore e tre operazioni effettive; nessun quiz o punteggio | Sensazione di essere dentro la sala, non in un formulario |

**Rotta tecnica di laboratorio:** `/experience-lab/museo-zero/` con `noindex,nofollow`, avviso esplicito di revisione professionale e blocco dei collegamenti dai portali pubblici. Nessun dato personale, account, telemetria o connessione a impianti reali. Durante il collaudo il prototipo rimane nel ramo della PR #189, separato dal sito principale.

**Gate di uscita P3:** prima, compilazione, verifica dell'adattatore, test di indagine e rappresentazioni, biforcazioni, `worldAfter`, trasferimento, conclusione, accessibilità/tastiera, mobilità e nessuna scrittura dei dati. Poi **seconda Human Product Review** su questa versione congelata; non attribuire PASS per inferenza dai test. Solo in caso di PASS potranno essere valutate separatamente la Quality Bar visiva, i diritti, l'accessibilità di prodotto, la revisione di uso umano e un'eventuale futura autorizzazione agli studenti.

## Regola permanente di manutenzione

**Ogni modifica a un portale o a una capability richiede nello stesso intervento:**

1. aggiornamento del relativo record nel JSON (ID stabile, stato, riferimenti, autorizzazioni e prossimo passo);
2. aggiornamento di questo documento soltanto se cambia l'architettura, la semantica o una decisione di governo;
3. citazione di PR, commit, verifiche e approvazioni reali; non usare la parola *pubblicato* per un laboratorio o una bozza;
4. esecuzione di `node scripts/validate-atlas-portal-capability-map.mjs`, che verifica struttura, riferimenti locali, integrità delle quattro porte e confini delle autorizzazioni;
5. per contenuti learner, aggiornamento anche del registro di **prodotto autorevole** pertinente, senza sostituirlo con questa mappa.

Il JSON è un **inventario di progettazione**, non un'autorizzazione runtime. Non deve essere importato dal frontend per decidere che cosa mostrare agli studenti: la disponibilità resta governata dai registri e filtri di dominio.

## Tracciabilità

- [Piano integrale ATLAS-PORTALI-02 sulla PR #189](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/189#issuecomment-7111072159).
- [Qualificazione tecnica iniziale della home](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/45238659751), 13/13 prove Chromium.
- [Anteprima isolata della home](https://g1-043d3e5bb493.atlas-pr-preview.pages.dev/), non è la pubblicazione canonica.
- Registro TRAMA ACCESS-01 e documentazione Studio Atlas restano riferimenti cross-product; questa mappa non ne trasferisce l'autorità.

**Prossimo intervento:** P1 sulle quattro destinazioni reali, una volta acquisita la mappa come base stabile; nessun contenuto nuovo è dichiarato autorizzato da questo documento.
