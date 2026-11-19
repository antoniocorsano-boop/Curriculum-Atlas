# ASC-01 — Standard produttivo e compilazione degli ambienti di Studio Atlas

Data: 2026-11-19. Decisione dell'ideatore: conservare l'analisi professionale e farne l'infrastruttura di realizzazione. Stato: P0, specifica e preflight di pianificazione; nessuna compilazione grafica qualificata, nessuna pubblicazione. Estende il protocollo P0–P8, senza creare un secondo motore, archivio o prodotto.

## Decisione e motivazione
Qualità artistica prima della scelta tecnologica, leggerezza misurata, costo incrementale zero. Separare master modificabile Blender/Cycles, rappresentazioni derivate, adattatore del motore e qualificazione. Conservare il master e la sua semantica; la complessità visiva non coincide con quella geometrica. La rappresentazione 2D, 3D o ibrida è scelta per funzione educativa e accessibilità; non imporre lo stile della biblioteca agli altri mondi. Il compilatore è una capacità interna di Studio Atlas, da estrarre solo dopo prova di riuso. Non assumere che il GLB esportato direttamente preservi shader, luce o colori del master.

## Raccordi e confini
- P0–P8: [protocollo](PROTOCOLLO-PRODUZIONE-AMBIENTI-IMMERSIVI.md); ART-100: [criteri artistici](ART-100-world-parametric.md); [ASI/ASD](ASI-01-ASD-01.md); [ATLAS-PERF](ATLAS-PERF.md). Nessuna nuova authority: Arena curricolo, World Brief/Pathway Authoring Package intenzione didattica, ASP inventario ed evidenze, ASD piani parametrici, ASI osservazione e recupero delle regole, TRAMA-DE-01 decisioni append-only. ART-LEARN produce prove, ASC compila derivate.
- Base esatta PR #121, 900ff114c75709b33a72a44a3525826aa167dc0f; riferimento artistico candidato PR #127, aa7ee147ea65250543cafc16b060d788d4ea9a6e (ramo distinto, non integrato; esito artistico da accertare). PR #115 anteprima locale; non promuovere automaticamente.
- Master ASP portabile: SHA-256 f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab, ricevuta ops/atlas-scene-package/editable-master-receipt-summary.json. 495 oggetti nelle campate, 25 mesh uniche, 47 luci, 7 camere, 9 immagini impacchettate. ART-LEARN-05E prevede otto sostituzioni su campata e nove immagini: non assumerne il PASS. C3.1 storico: 176 geometrie e 11 materiali, 1.357.348 byte; non confonderlo con master attuale.
- PERF-05A documenta baseline 619574 triangoli/60 draw call large, 717794/63 landscape, 438890/60 phone, già con instancing. I valori vengono da CI, non da hardware fisico. Evitare di implementare nuovamente istanziazione e culling. Misurare contributo di ciascun gruppo prima di decimare.

## Sequenza produttiva (estensione P0–P8)
| Fase | Lavorazione | Prodotto verificabile |
| --- | --- | --- |
| P0–P1 | Brief, visione, composizione, palette, luce, inquadrature, criteri ART-100 | riferimento approvato, camera e rubriche |
| P2–P3 | Congelare master e baseline, inventariare gruppi, risorse, diritti e versioni | manifest ASP, hash, licenze, bilancio iniziale |
| P4a | Moduli parametrici, geometrie essenziali, silhouette e collisioni; UV e materiali condivisi | master e derivate isolati, mappa identità |
| P4b | Trasferire microdettagli, normali, AO, colore e luce; confronto cromatico | texture e lightmap con UV/binding esplicito |
| P4c | Compilare per profilo, semplificare, deduplicare e comprimere selettivamente | GLB, risorse locali, manifest, log e impronte |
| P5 | Adattatore r128, profili camera/dispositivo, hit test e alternative HTML | anteprima senza modificare la route pubblica |
| P6–P7 | Confronto A/B/C, prestazioni, accessibilità, sicurezza, qualità umana | immagini reali, misure, rubrica, decisione motivata |
| P8 | Promozione deliberata, archivio e rollback | ricevuta separata; pubblicazione e accesso studenti restano distinti |

## Tecniche e decisioni
- Architettura modulare: campate, archi, colonne, capitelli, scaffali, pavimento; libreria dei componenti, varianti e materiali condivisi. Geometria reale per silhouette, interazione, ombre importanti; microdettaglio in normal map e mappe PBR. LOD solo dopo misura, con soglie e isteresi verificate.
- Libri: superfici fotografiche per lontani, modelli instanziati per intermedi, modelli dedicati caricati per opere interattive. Dorsi originali o risorse con licenze verificate; nessun testo o marchio protetto riprodotto senza titolo. Conservare target semantici indipendenti da raggruppamenti grafici.
- Luce: A master di riferimento, B colore+luce precalcolati (unlit per evitare doppia illuminazione), C PBR + luce diffusa precalcolata + riflessioni dinamiche selettive. Usare UV secondarie univoche con padding e test di bleeding; non presumere esportazione standard della lightmap. AO distinta dalla luce indiretta; evitare doppia attenuazione. Oggetti mobili separati. HDR/EXR candidato da qualificare, non obbligo.
- Colore: distinguere sRGB colore e dati lineari (normali, roughness, metallic, AO); esplicitare spazio della lightmap, esposizione, trasformazione tonale, intensità e pipeline. AgX del master non equivale automaticamente alla trasformazione r128. Confrontare inquadrature identiche, chart e dettagli, evitare gamma o tone mapping duplicati.
- Compressione: glTF Transform selettivo come candidato principale; meshoptimizer e gltfpack da confrontare; KTX2 ETC1S per colore ordinario e UASTC per dettagli/normali/dati dopo ispezione. WebP per panorami alternativi, non equivalente alla compressione GPU. Misurare byte di rete, decodifica, memoria stimata ed effettivo formato GPU; preservare fallback. Non applicare weld/merge/prune/quantize o semplificazione globale senza verifica degli ID, extras, trasformazioni, animazioni e target interattivi.
- Compatibilità: Three.js r128 bloccata, loader locale con URL blob e CSP restrittiva. Nessuna promessa di supporto KTX2/Meshopt, worker/WASM o UV binding prima di prova effettiva della versione esatta. Non rilassare CSP per far passare un test. Se incompatibile conservare GLB non compresso e progettare un adattatore locale separato; aggiornamento motore solo decisione distinta.
- Scartate come percorso primario: modellazione diretta esclusiva in Three.js, GLB non compilato come soluzione completa, generazione 3D IA non controllata, Gaussian Splatting e panorami come unico mondo. Fotogrammetria, splatting e generazione IA rimangono esperimenti circoscritti; panorami/HTML possono essere alternative accessibili.

## Profili e misure
Budget esplorativi, NON soglie già qualificate: mobile 30 FPS durante navigazione attiva, 5 MB trasferimento iniziale delle risorse 3D, 100k triangoli visibili, 100 draw call, 64 MiB texture; desktop 60 FPS, 10 MB, 300k triangoli, 200 draw call, 128 MiB. Prima misurare sullo stesso dispositivo e percorso; non imporre rendering continuo in idle. Le soglie triangoli possono richiedere più incrementi rispetto alla baseline; non sacrificare il riferimento artistico. Il gate di non regressione è separato dai target. Misurare percentili p50/p95 del frame time e latenza di azione/commit, avvio a freddo e caldo, memoria, perdita contesto, stabilità prolungata; CI software e hardware reale separati. Conservare 6 formati, movimento ridotto, 3 portali, hit test, fallback, sicurezza dei messaggi, zero richieste esterne runtime e no dati personali. Nessuna regressione delle destinazioni; nessun accesso studenti, deploy o merge in questa fase. Rubrica ART-100 e immagini reali obbligatorie; soglie pixel diagnostiche non approvazione estetica.

## Pilota e gate
ASC-P0: questo documento, contratto JSON e preflight deterministico in sola lettura. Il preflight controlla la ricevuta del master e genera piano non eseguibile; non attesta disponibilità dei byte del master né installazione o compatibilità dei tool.
ASC-P1: completare valutazione 05E; acquisire master reale e verifica SHA-256; selezionare campata, camere, asset e baseline; inventario delle mesh e dei contributi; congelare riferimenti.
ASC-P2: A/B/C sulla stessa campata, stessa camera, geometria, esposizione e condizioni per i confronti pertinenti; distinguere esperimento luce da esperimento geometria. Prima test UV/lightmap/colore e binding r128; poi riduzione geometrica separata. Conservare immagini e ripristino.
ASC-P3: preflight reale delle versioni glTF Transform/meshoptimizer/KTX-Software/validator, licenze, hash, compatibilità loader/CSP. Confronto isolato, un fattore alla volta, mai installazione o download non controllati.
ASC-P4: compilazione candidata con mappa identità, variant manifest, GLB validator, prove semantiche e prestazionali. Nessuna promozione se falliscono identità, qualità, accessibilità o navigazione.
ASC-P5: revisione umana con ART-100, archiviazione nel dossier ASP/TRAMA-DE-01 (inclusa conoscenza negativa), regole ASI solo dopo evidenze. Secondo mondo per provare riuso prima di generalizzare. Un ciclo correttivo circoscritto per ipotesi; se non migliora, archiviare e scegliere alternativa.

## Fonti primarie e strumenti da conservare
- Blender Cycles baking https://docs.blender.org/manual/en/latest/render/cycles/baking.html ; gestione colore https://docs.blender.org/manual/en/latest/render/color_management.html
- Khronos glTF https://github.com/KhronosGroup/glTF ; KTX Artist Guide https://github.com/KhronosGroup/3D-Formats-Guidelines/blob/main/KTXArtistGuide.md ; KTX https://github.com/KhronosGroup/KTX-Software ; validator https://github.com/KhronosGroup/glTF-Validator
- glTF Transform https://github.com/donmccurdy/glTF-Transform ; meshoptimizer https://github.com/zeux/meshoptimizer ; xatlas https://github.com/jpcy/xatlas
- Three.js https://github.com/mrdoob/three.js/tree/r128 ; color management https://threejs.org/manual/pages/color-management.html (documentazione corrente, non prova r128); MDN https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- PlayCanvas https://developer.playcanvas.com/user-manual/graphics/lighting/runtime-lightmaps/ ; Spector.js https://github.com/BabylonJS/Spector.js ; three-mesh-bvh https://github.com/gkjohnson/three-mesh-bvh
- Poly Haven https://polyhaven.com/ (verificare licenza e impronte per ogni asset); Web3D Asset Compiler https://github.com/ARafaykhalid/web3d-asset-compiler (osservazione, non dipendenza); SuperSplat https://github.com/playcanvas/supersplat-viewer (sperimentale).

Evidenze future: manifest e hash input/output, tool e versioni, licenze, mappa identità, immagini originali, metriche grezze, errori, alternativa scartata, decisione e rollback. Risorse e master vanno conservati durevolmente, non solo in artefatti CI temporanei. Il presente documento conserva l'analisi e la decisione, non dichiara misure o implementazioni non effettuate.
