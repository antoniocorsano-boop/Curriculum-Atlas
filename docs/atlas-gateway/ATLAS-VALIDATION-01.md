# ATLAS-VALIDATION-01 — Criteri verificabili per il compositore inverso

**Stato:** protocollo di verifica adottato, **nessuna prova ART-DIR-02 già superata per effetto del presente documento**.  
**Fonti:** [Prompt](./ATLAS-PROMPT-ART-01.md), [Geometrie](./ATLAS-GEO-SPEC-01.md), [Seed](./ATLAS-COMPOSER-SEED-01.json), [IMAGE-GEOMETRY](./IMAGE-GEOMETRY-01.md).  
**Principio:** punteggio numerico di somiglianza ≠ fedeltà artistica ≠ corretta geometria tridimensionale.

## V0 — Integrità delle fonti
- [ ] PNG canonico originale, **quattro portali**, 1672 × 941 px, SHA-256 `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`, accessibile al processo.
- [ ] Prompt fornito dall'ideatore conservato **integralmente**, senza attribuirlo retroattivamente a istruzioni interne non recuperate.
- [ ] Modello, dipendenze, librerie e texture con provenienza, diritti e hash registrati.
- [ ] Le varianti storiche ARENA (cinque portali) e Biblioteca Atlas (tre) non sono utilizzate come input approvato.

## V1 — Fedeltà geometrica nella vista HERO
- [ ] Asse centrale e simmetria coerenti col riferimento.
- [ ] Cupola/oculo con ingombro, posizione e corona coerenti.
- [ ] Due o più livelli con altezze apparenti, pilastri e parapetti coerenti.
- [ ] Quattro portali distinti, ordinati e pienamente visibili, con ingombri e spaziatura coerenti.
- [ ] Podio basso, ampio, convesso, con collocazione, silhouette e ingombro corretti.
- [ ] Pavimento e fughe prospettiche coerenti.
- [ ] Conservate le maschere del riferimento, la camera e le sovrapposizioni annotate.
- [ ] In caso di impossibilità prospettiche da immagine sintetica, scelte documentate senza invenzione di precisione numerica.

**Prove obbligatorie:** immagine canonica, clay-HERO, sovrapposizione, coordinate dei landmark osservati e proiettati, tabella degli scostamenti. Le metriche sono diagnostiche; è necessaria valutazione umana.

## V2 — Realtà tridimensionale
- [ ] Modello Blender editabile con mesh/curve reali, non immagini stese su piani.
- [ ] Rotonda, portali, oculo, parapetti e podio dotati di spessori e profondità plausibili.
- [ ] HERO, SIDE e MOBILE prodotte **dallo stesso modello**.
- [ ] Camera SIDE dimostra parallasse e non rivela stratagemmi di sola facciata.
- [ ] Pianta e due sezioni coerenti col modello; quote relative e assunzioni documentate.

**Prove obbligatorie:** file .blend, tre render neutri, parametri, vista dall'alto e sezioni.

## V3 — Materiali e luce
- [ ] Pietra, ottone, metalli, vetro e tessuto/vegetazione distinguibili fisicamente.
- [ ] Contrasto freddo zenitale / caldo architettonico vicino alla direzione ART-DIR-02.
- [ ] Riflessi sul pavimento plausibili, non grandi specchi o bagliori uniformi.
- [ ] Rendimento in Cycles senza mascheramenti di post-produzione; parti identitarie leggibili.

**Prove obbligatorie:** HERO Cycles, SIDE Cycles, MOBILE Cycles; confronto affiancato con riferimento.

## V4 — Funzioni e prestazioni Web
- [ ] Derivato GLB e texture pesati, hashati, con licenze valide.
- [ ] Loader/decoder effettivamente compatibili con Three.js r128 utilizzato da Atlas.
- [ ] Ogni portale porta alla rotta Atlas esistente; DOM/fallback coerenti e accessibili.
- [ ] Misura reale del trasferimento iniziale, GPU e fotogrammi/s su Android fisico (obiettivo da qualificare: ≥30 fps; soglia GLB del packaging: 8 MB).
- [ ] Nessun merge né pubblicazione senza autorizzazione distinta.

## Stato e responsabilità

`NOT_STARTED` → `TECHNICAL_EVIDENCE_READY` → `AWAITING_ART_APPROVAL` → `ART_APPROVED_EXACT_SHA` → `WEB_VERIFIED` → `ANDROID_ACCEPTED` → `RELEASE_AUTHORIZED`.

**La presenza del protocollo non imposta nessuno di questi stati su PASS.** L'approvazione finale appartiene all'ideatore, dopo confronto visivo documentato.
