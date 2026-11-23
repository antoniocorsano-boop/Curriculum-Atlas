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
