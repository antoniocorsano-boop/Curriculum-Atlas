# Atlas Gateway — PREPRODUCTION-READINESS-01
## Verifica dei blocchi prima della produzione artistica conforme ad ART-DIR-02

**Data:** 20 novembre 2026. **Esito:** **NO-GO al ciclo di produzione artistica completo**; **GO alla chiusura mirata dei prerequisiti**.
**Documenti verificati:** [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md), [ART-PROD-01](./ATLAS-GATEWAY-PRODUCTION-WORKFLOW-01.md), [FLOW-02](./ATLAS-GATEWAY-CLOSED-LOOP-02.md), [MASTER-BLENDER-01](./MASTER-BLENDER-01.md).  
**Lavorazioni in corso:** [PR #152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152) aperta in bozza, basata sulla PR #148.

### Sintesi verificata
- Le specifiche artistiche, il processo e il workflow tecnico **esistono**. Le verifiche di base della PR #152 all'ultimo HEAD esaminato sono **PASS** (incluse prove WebGL), ma sono relative alla piattaforma tecnica.
- L'**immagine ad alta risoluzione ART-DIR-02** esiste nei file della conversazione; il file JPEG reinviato mostra la stessa composizione, con differenza media per canale di circa **1,317/255** dopo il confronto a 384×216. La scelta canonica è il **PNG 1672×941** SHA-256 `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`. Verifica dettagliata nel [registro immagine](./ART-REFERENCE-MANIFEST.md). **Il file PNG non è ancora depositato nel percorso GitHub atteso.**
- Il file `visual-factory/atlas-gateway/source/atlas-foyer-master.blend` non esiste nel ramo; l'**ultimo .blend prodotto dal generatore procedurale precedente** è solo una prova della filiera, **non** un master artistico approvato.
- Il primo [run FLOW-02 #44759502412](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44759502412) è **FAIL/BLOCKED_INPUT** in preflight per ingressi mancanti; tutte le fasi Cycles/confronto/export dell'effettivo master sono **SKIPPED**, quindi **non sono state collaudate nella filiera finale**.
- Le quattro rotte Atlas `/curricolo/`, `/esplora/`, `/percorsi/` ed `/esperienze/` hanno pagine nel sorgente attuale. La loro presenza non è un collaudo del percorso artistico WebGL.

## 1. Bloccanti assoluti (P0)

| ID | Cosa manca / prova | Responsabilità di chiusura | Criterio oggettivo di chiusura |
|---|---|---|---|
| **P0-REF** | L'immagine PNG canonica non è nel deposito versionato atteso dal preflight, pur essendo recuperabile dalla conversazione | Infrastruttura di prodotto | `visual-factory/atlas-gateway/reference/atlas-hero-approved.png` accessibile al runner e con SHA/dimensioni esatte. Registrare diritti/provenienza e URL stabile |
| **P0-ART** | Manca il **master Blender artistico** conforme ad ART-DIR-02; generatore procedurale precedente non valido | Produzione di ambienti Blender | Esiste un `.blend` realizzato e assemblato artisticamente, editabile, con `CAM_HERO`, `CAM_SIDE`, `CAM_MOBILE` e materiali/asset collegati |
| **P0-CAP** | Non è dimostrata la disponibilità della competenza produttiva reale (artistica/archviz/illuminazione) e di un kit architettonico adeguato | Governo della produzione | Identificare un esecutore o una modalità di produzione effettivamente capace di assemblare e illuminare il master; prima selezione di asset con licenze e qualità verificabili |

**Nota:** P0-ART non può essere dichiarato chiuso con un file `.blend` vuoto, con una scena automatica a primitive o con l'immagine su piani bidimensionali. **Il problema principale è la capacità di produzione artistica, non la mancanza di altri documenti.**

## 2. Vincoli tecnici da sciogliere prima di estendere la produzione (P1)

| ID | Evidenza / rischio | Risoluzione richiesta | Quando |
|---|---|---|---|
| **P1-CI** | FLOW-02 non ha ancora raggiunto Cycles → confronto → approvazione → vero build Atlas → browser WebGL. Il primo run si ferma correttamente al preflight | **Prova tecnica isolata** con un master campione chiaramente NON APPROVATO, senza aggirare il gate di rilascio; validare la catena in una modalità di collaudo separata | Prima di destinare risorse artistiche importanti al master |
| **P1-BLENDER** | La CI precedente ha eseguito Blender **5.0.1**, ma la versione non è fissata permanentemente; linked libraries e texture devono essere risolvibili sul runner | Bloccare versione di Blender e dipendenze, produrre una prova di apertura di file con librerie collegate e tutte le texture necessarie; verificare compatibilità addon per camera matching | Prima del master definitivo |
| **P1-LIGHT** | glTF non preserva automaticamente la resa Cycles, il runtime r128 non integra ancora una filiera di lightmap verificata sul nuovo atrio | Realizzare un **solo campione** con pietra, vetro, ottone e luce baked; confronto Cycles/WebGL dalla stessa camera, senza integrare l'intera scena | Prima dell'ottimizzazione globale |
| **P1-ASSETS** | Nessuna distinta di modelli architettonici professionali approvati con fonte, licenza, peso e possibilità di redistribuzione | Selezionare moduli/texture e registrare la licenza di ciascuno (preferenza CC0); verificare che il realismo richiesto sia costruibile con il kit prima di investire nel dettaglio | Prima del montaggio architettonico |
| **P1-CACHE** | La cache dei render FLOW-02 è calcolata dal file `.blend` e dallo script, non dalle librerie collegate/texture: può riutilizzare fotogrammi vecchi dopo modifiche agli asset esterni | Includere **manifest hash di tutte le dipendenze artistiche** nella chiave cache, oppure disabilitare la cache finché non è affidabile | Prima di approvare un master |
| **P1-STACK** | `#152 → #148 → #147 → #146 →` ulteriori rami precedenti della biblioteca, tutti in bozza | Preparare una candidata Gateway basata su `main` o una base tecnica minimale verificata, preservando solo il codice necessario al Gateway; non trascinare la biblioteca nel rilascio | Prima di integrazione/merge |
| **P1-RUNTIME** | Il pacchettizzatore Gateway limita il GLB a **8 MB** e respinge le `extensionsRequired` non verificate; la scena fotorealistica rischia di richiedere materiali/texture e decoder non supportati | Profilare una campata prima del modello completo, verificare estensioni GLB, spazio GPU, dimensioni/texture e decoder nel **Three.js r128 esistente** | Prima dell'esportazione dell'atrio completo |

**P1-CI non equivale a richiedere una approvazione falsa**: la prova tecnica deve dichiarare e isolare esplicitamente il proprio stato di *collaudo tecnico*, senza poter pubblicare né creare un'approvazione artistica.

## 3. Verifiche previste che NON devono bloccare l'avvio artistico (P2)

- **P2-MOBILE:** fluidità, resa WebGL e controlli su Android reale, non dimostrabili su Chromium software; saranno criteri di accettazione finali, non requisiti per disegnare in Blender.
- **P2-ACCESS:** contrasto, navigazione da tastiera, preferenza movimento ridotto e fallback DOM; i quattro percorsi devono restare raggiungibili senza WebGL.
- **P2-PUBLISH:** autorizzazione distinta a sostituire la home `/`; la PR #152 non è integrata né pubblicata; prevedere ripristino.
- **P2-QUOTA:** la produzione Cycles in GitHub Actions consuma risorse/tempo di calcolo; monitorare la disponibilità effettiva del piano gratuito, senza rendere obbligatorio un servizio a pagamento.
- **P2-APPROVAL:** il file `ART-DIR-02-APPROVAL.json` correttamente **non esiste** prima del confronto artistico, ma governance e identità del revisore devono essere validate, oltre alla presenza dei soli campi testuali.

## 4. Decisione GO/NO-GO in tre livelli

### GO-1 — Avviare la produzione del master
Necessari: **P0-REF chiuso**, **P0-CAP chiuso**, un primo kit professionale **P1-ASSETS** sufficiente e la verifica minima **P1-BLENDER**. Non serve attendere prestazioni Android o approvazione artistica finale.

### GO-2 — Convertire e integrare un master ART-DIR-02
Necessari: **P0-ART chiuso** con viste HERO/SIDE/MOBILE, **giudizio artistico favorevole** documentato, prova **P1-LIGHT**, verifica della pipeline **P1-CI**, correzione della **P1-CACHE** e compatibilità tecnica **P1-RUNTIME**.

### GO-3 — Promuovere il Gateway
Necessari: indipendenza sufficiente dalle PR della biblioteca (**P1-STACK**), prove WebGL e Android, accessibilità, pesi/misure reali e **autorizzazione esplicita**. Nessuna pubblicazione in assenza di decisione.

## 5. Prossima unica operazione coordinata

**Chiudere il pacchetto preparatorio GO-1** senza iniziare altre micro-revisioni del vecchio `foyer.mjs`:
1. depositare nel progetto il PNG originale canonico e verificare il suo SHA già noto;
2. registrare disponibilità del sistema Blender versione fissata e una modalità **reale** di produzione artistica con kit selezionato;
3. verificare l'apertura/illuminazione di un **microcampione** per eliminare prima gli errori infrastrutturali prevedibili;
4. soltanto dopo costruire il Master Blender secondo `MASTER-BLENDER-01`.

**Esito attuale:** GO per chiusura dei prerequisiti; **NO-GO** per dichiarare avviata una produzione con esito artistico prevedibile. Il tempo non va speso su ulteriori documenti, ma sugli ingressi reali che mancano.

---
**Tracciabilità:** verifiche svolte su GitHub e confronto diretto delle due immagini disponibili in questa conversazione; budget e soglie riportate nei piani sono **obiettivi**, non risultati già misurati.
