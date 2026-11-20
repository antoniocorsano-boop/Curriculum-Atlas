# ATLAS — ASSET-KIT-01
## Decisione produttiva vincolante: riuso qualificato di librerie Blender e risorse 3D

**Data:** 20 novembre 2026.  
**Stato della decisione:** ADOTTATA per la produzione dell'Atlas Gateway.  
**Stato dell'esecuzione:** INVENTARIO DA COMPLETARE — nessun asset esterno approvato o importato da questo documento.  
**Riferimento artistico superiore:** [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md).  
**Master:** [MASTER-BLENDER-01](./MASTER-BLENDER-01.md).  
**Progetto geometrico precedente e vincolante rispetto alla scelta delle librerie:** [IMAGE-GEOMETRY-01](./IMAGE-GEOMETRY-01.md). Prima ricavare prospettiva, pianta, sezioni e proporzioni dall'immagine; solo dopo selezionare gli asset da adattare. L'asset non determina l'architettura.  
**Piano:** [ART-PROD-01](./ATLAS-GATEWAY-PRODUCTION-WORKFLOW-01.md).  
**Prontezza:** [PREPRODUCTION-READINESS-01](./PREPRODUCTION-READINESS-01.md), requisiti P0-CAP, P1-ASSETS, P1-BLENDER e P1-RUNTIME.  
**Governance:** [ATLAS-GATEWAY-01 #151](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/151), [AWC-DELIVERY-01 #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354).

## 1. Decisione stabile

**Non modellare ogni elemento da zero.** Comporre l'atrio con una biblioteca professionale minima di componenti architettonici, materiali e oggetti esistenti, adattandoli al riferimento ART-DIR-02. Modellare espressamente gli elementi identitari, preservando una scena realmente tridimensionale. La produzione non deve ridursi a un'immagine su piani né a una collezione di primitive.

**Ordine delle priorità:** (1) fedeltà artistica e volumetrica; (2) provenienza/licenza e modificabilità; (3) compatibilità con Blender e con il runtime Atlas; (4) leggerezza sullo smartphone; (5) velocità di assemblaggio. Un componente «gratuito» non è automaticamente redistribuibile.

**Vincolo economico:** nessuna spesa obbligatoria né dipendenza necessaria da cataloghi o strumenti a pagamento. Le risorse devono poter essere acquisite in modo lecito e conservate/versionate. Non introdurre un secondo motore 3D.

## 2. Strategia «riusa, adatta, costruisci»

| Sottosistema | Strategia | Specifica |
|---|---|---|
| Pietra/pavimenti e materiali | RIUSA/ADATTA | Texture PBR compatibili (albedo, roughness, normal), calibrate con l'illuminazione effettiva |
| Pilastri, arcate, modanature, parapetti | RIUSA/ADATTA | Moduli architettonici o geometria parametrica, in scala, con smussi/spessori reali |
| Vegetazione, vasi, stendardi secondari | RIUSA/ADATTA | Modelli con geometria riducibile, istanziabili, senza perdita di qualità visiva |
| Rotonda a due livelli e logge | COMPONI | Proporzioni determinate dall'immagine canonica, moduli ripetuti e verificati da HERO/SIDE |
| Lucernario/oculo monumentale | COSTRUISCI + RIUSA PARTI | Geometria dedicata; possono essere riutilizzati profili/materiali/elementi ripetibili |
| Quattro portali Atlas | COSTRUISCI UNA VOLTA, ISTANZIA | Telaio originale e varianti; testi/rotte funzionali mantenuti nel contratto HTML |
| Podio ellittico e identità Atlas | COSTRUISCI | Disegno originale aderente ad ART-DIR-02; nessuna sostituzione con oggetto generico |
| Luce, camere e composizione | PROGETTA | Calibrazione artistica specifica; Cycles per approvazione, derivato web separato |

## 3. Cataloghi e strumenti candidati — non ancora qualificati

| Fonte/strumento | Utilizzo candidato | Vincolo prima dell'impiego | Stato |
|---|---|---|---|
| [Poly Haven](https://polyhaven.com/) | Materiali PBR, ambienti HDRI, modelli secondari | Confermare CC0 e file/versione specifici; verificare resa e peso | CANDIDATO |
| [ambientCG](https://ambientcg.com/) | Materiali PBR pietra/metalli/superfici | Confermare licenza del materiale concreto e mappe necessarie | CANDIDATO |
| [Blender Asset Browser](https://docs.blender.org/manual/en/latest/editors/asset_browser.html) | Libreria locale di moduli, istanze e materiali | Verificare librerie collegate, percorsi e disponibilità in CI | STRUMENTO DA CONFIGURARE |
| [Arch Generator](https://extensions.blender.org/add-ons/arch-generator/) | Generazione/variazione di archi | Verificare versione, licenza, compatibilità con Blender effettivamente fissato | CANDIDATO |
| [Blendkit (ex BlenderKit)](https://www.blendkit.com/docs/licenses/) | Ricerca aggiuntiva di componenti | Non importare in GLB distribuibile senza chiarimento esplicito dei diritti di redistribuzione: **non predefinito** | SOSPESO / VALUTAZIONE LEGALE |
| [glTF-Transform](https://gltf-transform.dev/) | Ispezione e ottimizzazione dei derivati GLB | Verificare encoder/decoder e compatibilità con Three.js r128 | STRUMENTO DI FILIERA |

L'elenco contiene **fonti da valutare, non download eseguiti, verifiche legali concluse o modelli approvati**. Aggiornare la distinta per singolo asset, non approvare un intero catalogo in blocco.

## 4. Registro obbligatorio per ogni asset

Compilare per ciascun componente scelto il registro versionabile in `visual-factory/atlas-gateway/assets/manifest.json` (percorso previsto, ancora da attivare), o equivalente collegato al master. Campi minimi:
- `asset_id`, `elemento_atlas`, `strategia` (riusa/adatta/costruisci);
- `fonte_url`, `autore`, `licenza`, `licenza_url`, `redistribuzione_glb_autorizzata` e relative evidenze;
- `versione`, `sha256_sorgente`, `percorso_durevole`, eventuali modifiche;
- `blender_version`, dipendenze e texture collegate (con relative impronte);
- `triangoli`, `materiali`, `texture_px`, `dimensione_sorgente`, `dimensione_web`, `istanziabilita`;
- `compatibilita_runtime`, `fedelta_art_dir_02`, `stato` (CANDIDATO/VERIFICATO/APPROVATO/RESPINTO);
- `responsabile_verifica`, `evidenza_render`, `decisione` e data.

**Regola cache:** la firma di una produzione Cycles deve coprire anche librerie collegate e texture; non basarsi esclusivamente sull'impronta del file principale `.blend`.

## 5. Applicazione concreta, non nuova ricerca indefinita

- [ ] **AK0 — Risorse e competenze:** selezionare una dotazione minima per una campata (una sezione di parete con pilastro/arco, pietra, ottone, vetro e un portale originale); accertare chi realizza il lavoro artistico.
- [ ] **AK1 — Diritti:** compilare registro per le singole risorse, con licenza e redistribuzione GLB effettivamente consentita; escludere i componenti non chiariti.
- [ ] **AK2 — Apertura:** fissare Blender, collegare i moduli tramite Asset Browser/librerie, renderizzare e riaprire sul sistema di produzione e sulla CI; includere le dipendenze nelle impronte.
- [ ] **AK3 — Campata artistica:** ottenere da un autentico modello 3D una vista HERO e una vista laterale in Cycles; valutare la qualità architettonica rispetto ad ART-DIR-02.
- [ ] **AK4 — Campata web:** derivare un GLB con illuminazione/materiali trasferiti esplicitamente, validarlo e confrontarlo con Cycles in Three.js r128.
- [ ] **AK5 — Decisione:** se il campione raggiunge qualità e compatibilità, riusare gli stessi moduli per il master completo; altrimenti sostituire solo i componenti o il metodo inadeguato, senza riavviare il prototipo geometrico precedente.

**Consegna verificabile:** una campata + un portale originale, file Blender modificabile e sorgenti durevoli, due render verificabili, un GLB WebGL funzionante e una distinta di licenze/pesi. Non sono ammesse dichiarazioni di superamento senza file o prove.

## 6. Condizione di governo

Questa è **una decisione metodologica permanente** di ART-PROD-01 e MASTER-BLENDER-01, non un'alternativa artistica ad ART-DIR-02. Il documento si aggiorna con asset effettivamente verificati e risultati, senza inventare approvazioni. Se un componente pronto compromette la fedeltà artistica, va adattato o sostituito, non va modificato il riferimento per giustificarlo.

**Stato al salvataggio (20/11/2026):** approccio di riuso ADOTTATO; inventario qualificato NON COMPLETATO; master artistico NON REALIZZATO; nessun rilascio o distribuzione studenti autorizzati.
