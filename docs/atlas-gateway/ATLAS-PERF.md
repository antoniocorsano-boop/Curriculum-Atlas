# ATLAS-PERF — Ingegneria delle prestazioni tridimensionali

## PERF-01 — Consolidamento e metodo

Riferimento: PR #121, ramo work/atlas-scene-consolidated. Separare master artistico, compilazione delle risorse, motore interattivo, navigazione e qualificazione. Il master originale resta immutabile; nessuna pubblicazione, autorizzazione studenti o spesa aggiuntiva. Le metriche CI SwiftShader non sono certificazioni hardware.

### Evidenze di NAV-STAB-02

Revisione 2a9950234954403529d0711a2b35d47203e7105f, run 44464353253, job 135358481434, artefatto 14501072927, SHA-256 197ad10d036be5ae354cb6811df6baf67bc217fecfe32070ec942e143d5b5b86. Quattro prove differenziali e dieci esiti matrice PASS, zero fallimenti. Stage large 1886×962 CSS, buffer effettivo 1433×731 (1.047.523 pixel), scala 0,7598. Mobile e tablet sotto soglia mantengono 1:1. Valori clic/commit e inizio/fine detach (ms):

| Formato | Clic/commit | Detach |
|---|---:|---:|
| Large 1 | 5745 | 5583 |
| Large 2 | 5740 | 5561 |
| Large 3 | 5545 | 5372 |
| Compact | 1043 | 894 |
| Phone | 1051 | 904 |
| Landscape | 2760 | 2627 |
| Tablet | 3043 | 2917 |
| Desktop | 5462 | 5296 |

NAV-STAB-01 precedente run 44453050469: tre misure 16674, 16833, 20118 ms; media 17875 ms. NAV-STAB-02 media 5676,67 ms, riduzione descrittiva circa 68,2% su esecuzioni diverse, non prova causale controllata. Il precedente fallimento run 44462464142 resta documentato. Il tempo è ancora molto superiore all'obiettivo di usabilità e concentrato nella rimozione iframe. I log mostrano due tick animati saltati per backpressure nelle prove large; nessun fotogramma animato effettivamente sottomesso dopo attivazione prima del clic, perciò non assimilare lo stato del pulsante a una prova sotto animazione effettiva. La nuova matrice PERF-02 richiede una sottomissione reale in più.

### Fonti tecniche primarie e implicazioni

- MDN WebGL best practices: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices — evitare chiamate bloccanti, misurare, dimensionare il buffer.
- Khronos WebGL 2: https://registry.khronos.org/webgl/specs/latest/2.0/ e WebGL 1: https://registry.khronos.org/webgl/specs/latest/1.0/ — attributi contesto, conservazione del buffer, semantica fence. La conservazione permanente del buffer può penalizzare prestazioni; non assumere che la variante non persistente conservi la possibilità di readback dopo la composizione.
- Three.js responsive: https://threejs.org/manual/pages/responsive.html ; rendering on demand: https://threejs.org/manual/pages/rendering-on-demand.html ; disposal: https://threejs.org/manual/pages/how-to-dispose-of-objects.html ; screenshot: https://threejs.org/manual/pages/tips.html — dimensioni CSS distinte dal buffer fisico; ridisegno esplicito per cattura nello stesso task, rilascio esplicito solo quando appropriato. Atlas usa r128 bloccata: verificare sempre il comportamento effettivo della versione.
- React flushSync: https://react.dev/reference/react-dom/flushSync — uso eccezionale, possibili conseguenze sulle prestazioni. La misura DETACH_BEGIN/FRAME_DETACHED orienta PERF-03; non dimostra che React sia l'unica causa.
- Chrome DevTools Performance: https://developer.chrome.com/docs/devtools/performance/overview — tracce CPU/main thread e browser; non equiparare misura di sottomissione e tempo GPU.
- MDN OffscreenCanvas: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas — valutazione separata di worker, compositing, messaggi e CSP; non soluzione presunta.
- glTF EXT_mesh_gpu_instancing e KHR_texture_basisu: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Vendor/EXT_mesh_gpu_instancing ; https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_texture_basisu — future prove di compilazione, compatibilità r128 e qualità delle mappe.
- INP: https://web.dev/articles/inp — riferimento generale <=200 ms per la reattività, non soglia di navigazione completa. Obiettivi locali proposti: riscontro <=200 ms, portale <=2 s su dispositivo adeguato, 30 FPS quando animazione attiva; da qualificare, non risultati.

### Roadmap

PERF-01 metodo e ricevute; PERF-02 buffer; PERF-03 ciclo di vita/navigazione con profilazione; PERF-04 controller qualità misurato e budget; PERF-05 pipeline ottimizzazione asset/LOD/istanze/compressione; PERF-06 prototipo OffscreenCanvas isolato; PERF-07 dispositivi fisici (mobile, desktop, LIM). Non promuovere cambiamenti per semplice PASS tecnico. Conservare decisioni, alternative, hash, immagini e limiti. Nessun aggiornamento del motore Three in questo esperimento.

## PERF-02 — Esperimento differenziale sul buffer

**Decisione:** lasciare il default qualificato NAV-STAB-02 intatto. Confrontare due compilazioni locali con lo stesso motore, asset, manifest, CSS, budget, inquadrature, sorgenti e politiche di navigazione. La variante transient sostituisce esattamente una occorrenza di preserveDrawingBuffer:true con false nell'HTML generato per il solo collaudo; ricalcolo degli hash, ricevuta baseline/variante. Il sorgente runtime non cambia. Entrambi passano il preflight con le letture immediate dopo render. Due job indipendenti: i tempi sono descrittivi per differenze dei runner, non prova causale.

**Prove:** quattro differenziali e intera matrice (tre large indipendenti e cinque altri formati, fallback integrità e movimento ridotto) per ciascun modo. Stessi 30 s, stesse cinque letture, stesso percorso e controlli esistenti. In aggiunta attributo contesto effettivo; screenshot compositor del canvas prima/dopo 1,2 s senza ridisegno, controllo che il contatore non avanzi, range cromatico >32 e MAE RGB normalizzata <=0,005; su large almeno una reale sottomissione di fotogramma animato entro 15 s prima dell'azione, non solo aria-pressed. Verifica tecnica del confronto tra screenshot idle con stessa dimensione, triangoli, draw call, buffer; MAE <=0,02 e frazione pixel con max delta canale >12 <=0,05, soglie diagnostiche proposte e non giudizio artistico. Catture via compositor; eventuali screenshot nativi e readback sono immediati nello stesso task di rendering. Se il buffer transient produce scene vuote, regressioni o perdita di leggibilità, non promuoverlo. Se non si osserva vantaggio, mantenere il riferimento. Confrontare immagini reali manualmente anche quando passa la soglia.

**Evidenze:** workflow Atlas — PERF-02 buffer lifecycle experiment; artefatti atlas-perf-buffer-retained, atlas-perf-buffer-transient, atlas-perf-buffer-comparison; scene e manifest hash, screenshot, tempi, ricevute e log. Stato: implementato, esecuzione da verificare. Nessuna modifica alla configurazione ordinaria e nessuna pubblicazione. PERF-03 non avviata.


## PERF-02/C — Consolidamento del buffer non permanente

Esito verificato: revisione 6939b045698cace08382f632c87c4b1618d3c878, run 44465438220, tre job PASS. Artefatti retained 14502028282 (SHA-256 13912262a7e1f962dd5ef7cdd5c73ba65fa31c7f1fc6bec40b07bc06fcd9d332), transient 14501594314 (b4f3669c2778b82dd53f42b6daaf11bbad16c7228e0bbbe558b207591a046157), confronto 14501723504 (8d4956bae499d92de02334254b83a02b6209214ff7a133cef1d6ef27bad03d6d). 28/28 prove PASS, otto confronti idle con MAE zero all'interno di ciascuna modalità. Tra modalità: sette immagini identiche, desktop MAE 0,00000323218 e frazione pixel oltre soglia 0,0000249272. Mediana large retained 3660 ms, transient 2471 ms (-32,5% descrittivo); tempi desktop 9506/6600, tablet 5000/3482, phone 1912/1475, compact 1766/1431, landscape 4699/3421. Un fotogramma animato realmente sottomesso prima di ciascuna prova large. I runner distinti non consentono inferenza causale rigorosa.

**Decisione:** promuovere preserveDrawingBuffer:false come riferimento locale sul ramo di sviluppo (commit 54372260ed1146b005e91654fb5c9aff54ef359c); mantenere reversibile l'esperimento PERF-02 aggiornandone il controllo retained. La matrice ordinaria ora richiede esplicitamente buffer transient, persistenza idle e almeno una sottomissione animata sulle tre prove large. La qualificazione della revisione consolidata è ancora da verificare; nessuna pubblicazione. Il master e la risoluzione interna non cambiano.

## PERF-03 — Esperimento sul ciclo di vita della scena

**Problema:** il distacco rimane dominante (PERF-02 transient large 2299/2334/2313 ms; desktop 6379 ms). Non confondere questi intervalli con tempo GPU o tempo di React isolato. Confronto tra due percorsi con buffer transient identico, sullo stesso head, due job isolati. Il riferimento conserva NAV-STAB-01 (flushSync e rimozione del frame prima di location.assign). La candidata navigation-first non rimuove l'iframe nel percorso di interazione: disabilita le interazioni del frame, imposta lo stato di partenza, invia richiesta di quiescenza best-effort e avvia la navigazione documentale immediatamente senza attendere risposta. Il figlio accetta soltanto parent, origine esatta e canale effimero; il portale ha già quiesciuto prima di inviare atlas-open. Il browser gestisce il teardown; nessuna attesa GPU o perdita esplicita del contesto. Rifiuto dei messaggi e trasferimenti tardivi durante partenza; ripristino BFCache conserva la regola di ricreazione del canale. Il percorso diretto e Home condividono la stessa funzione.

**Isolamento:** scripts/prepare-atlas-perf-navigation.mjs modifica esclusivamente la copia locale del runner, con binding univoci, hash prima/dopo e nessun selettore esposto all'utente. Workflow Atlas — PERF-03 navigation lifecycle experiment. Entrambe le modalità conservano gli asset, la geometria, la risoluzione, il preflight, le quattro prove differenziali e la matrice completa, compresa animazione reale e idle. Variante navigation-first verifica FRAME_RETAINED prima di DOCUMENT_NAV_START e richiesta documento reale, senza FRAME_DETACHED precedente; verifica comunque destinazione funzionante senza iframe, ritorno a gateway, secondo accesso diretto a Curricolo, fallback integrità e riduzione movimento. Il limite di 30 s non cambia. La verifica della sicurezza dei messaggi e il ritorno da cache su browser/dispositivi fisici richiedono ulteriori prove prima della promozione. Nessuna affermazione di superiorità prima dei risultati; tempi descrittivi su runner distinti. Artefatti atlas-perf-navigation-detach-first e atlas-perf-navigation-navigation-first. Stato: predisposto, collaudo da osservare. Nessun merge, deploy o accesso studenti.


### PERF-03 — Esito e decisione

Revisione 13af965916f9261f7f806aac4168b785a8f75299, run 44467546561, job 135368862522 (detach-first) e 135368862200 (navigation-first), entrambi PASS, 14/14 prove ciascuno. Artefatti detach-first 14503001870 SHA-256 4e4a52c504fd63e0f9f0eea57edad0d139fa9da9c027949617d78743e173db96; navigation-first 14503047636 SHA-256 28bb2e127dc6df61aec610e8c730efa29a311e1b36a7508b740e431853aed2ba. Mediana large 2520/2439 ms (-3,2% descrittivo); desktop 6470/6282, tablet 3537/3489, phone 1434/1405, compact 1409/1362, landscape 3507/3283. Tre large con almeno un fotogramma animato sottomesso, zero errori. La navigazione diretta non attende il detach esplicito, ma la latenza di commit resta vicina al riferimento. Nessuna prova causale fra runner distinti; non promuovere navigation-first, conservare come alternativa riproducibile. Confermato buffer transient e percorso detach-first.

## PERF-04 — Controllo adattivo della qualità

**Obiettivo:** ridurre il carico raster sotto pressione effettiva, non ridurre indiscriminatamente la qualità artistica. Master, camera CSS, portali, geometria, texture, materiali, CSP, motore r128, buffer transient e detach-first invariati. Nessun nuovo servizio, rete o identificazione del dispositivo. L’esperimento usa due derivati locali CI, identici salvo la decisione adattiva; il runtime di riferimento non viene sostituito.

**Politica proposta (non ancora qualificata):**

| Livello | Limite pixel fisici | Riduzione teorica del limite |
|---|---:|---:|
| 0 — riferimento | 1.048.576 | 0% |
| 1 — moderato | 786.432 | 25% |
| 2 — contenuto | 524.288 | 50% |

La dimensione effettiva è min(1,sqrt(limite/area CSS)); non si ingrandisce il raster oltre le dimensioni CSS. Si osserva, durante l'animazione, il tempo trascorso fra sottomissione e rilevamento del fence già completato e il numero di polling saltati. È una misura end-to-end che comprende attese e scheduling, non tempo GPU puro. Nessun readback o attesa sincrona aggiunti al percorso utente. Tre osservazioni consecutive con elapsed >=220 ms o almeno due polling saltati consentono un passaggio di un livello; otto osservazioni consecutive <=140 ms senza polling saltati consentono recupero di un livello. Intervallo minimo di 1500 ms fra variazioni, livelli limitati a 0–2. Nessuna transizione se area CSS <=524.288; nessuna variazione sul percorso di navigazione o durante trascinamento. La risoluzione ridotta resta fino a nuove osservazioni favorevoli: è un compromesso sperimentale da valutare visivamente, non un criterio estetico approvato. Su dispositivi senza fence non si adatta. Isteresi e limiti sono scelte iniziali verificabili, non soglie universali.

**Qualificazione:** test deterministici di pressione, recupero, isteresi, cooldown, limiti, modalità fissa e piccolo viewport. Due workflow reali con preflight, quattro differenziali, otto formati e due fallback ciascuno; quattro prove stress (tre large e desktop) con almeno sei nuovi fotogrammi animati, stessa procedura per entrambe le modalità. Il budget separato di 45 s riguarda lo stress di sei fotogrammi; la scadenza di navigazione resta 30 s. Verifica post-stress di buffer reale, CSS e coordinate dei portali, invarianti di triangoli e draw call, screenshot stabile dopo arresto animazione. Confronto automatico di immagini effettive (MAE RGB <=0,04 e frazione pixel con differenza max canale >12 <=0,15 come soglie diagnostiche, non artistiche), durata stress e commit. Se nessuna transizione osservata, solo PASS della politica e compatibilità; non dichiarare riduzione reale. Se differenze visive eccessive, riesame obbligatorio. Anche con PASS, esame delle immagini e collaudo fisico richiesti prima di promuovere. I tempi fra runner sono descrittivi.

**Tracciabilità:** scripts/atlas-gateway-integration/adaptive-quality.mjs; scripts/test-atlas-adaptive-quality.mjs; scripts/prepare-atlas-perf-quality.mjs; scripts/compare-atlas-perf-quality.mjs; workflow Atlas — PERF-04 adaptive quality experiment; artefatti atlas-perf-quality-fixed, atlas-perf-quality-adaptive, atlas-perf-quality-comparison. Stato: implementato, da qualificare. Nessuna pubblicazione, merge o accesso studenti.


### PERF-04 — Esito e decisione

Revisione aa985c5f8341c1b9b5acb0c96484b87f7bb91b66, run 44469495717, tre job PASS. Artefatti fixed 14503597708 SHA-256 11ffb91a7a0a428b9d5c929ef70e7e2f1d2a30ce4ce5c5a702f80c77fa2b23af, adaptive 14503477965 SHA-256 62292ff6b9759bbcdd6ffb6e008be9b206875538b4a2b21793e2a032b05b5323, confronto 14503504196 SHA-256 9e401be840a8b2c26118df8987f824112527d2a9064efcc48a1fd8efba325587. Esito PASS_COMPARISON_ONLY, quattro transizioni effettive al livello 2, buffer large 1433×731 → 1013×517, riduzione 50,0%. Mediana large 2548/1770 ms (-30,5% descrittivo); sei frame stress in circa 18–20 s, non una fluidità sufficiente per uso reale. MAE RGB large 0,0149565, frazione pixel oltre soglia 0,121692; desktop 0,0140383 / 0,115099. Il riesame artistico in conversazione ha rilevato perdita di precisione di dettagli sottili, iscrizioni e scaffalature. Non adottare il livello 2 come ordinario: resta alternativa sperimentale di emergenza, non ancora modalità distribuita; riferimento fisso invariato. Recupero e dinamica su hardware fisico ancora da verificare.

## PERF-05A — Inventario geometrico e visibilità conservativa

**Riferimento verificato:** run 44469495713, job 135375246111 (matrice ordinaria), 495 istanze scaffalature con 25 batch, 225 visibili e 270 escluse su large; 619574 triangoli e 60 draw call; landscape 717794 triangoli e 63 draw call; phone 438890 triangoli e 60 draw call. La scena usa già compattazione con frustum/sfera; non reintrodurre inutilmente instancing. L’attribuzione per gruppo e il costo raster effettivo sono questioni distinte.

**Decisione:** prima di decimare risorse, misurare in un unico browser il contributo dei gruppi realmente disegnati e verificare una modifica strettamente conservativa. Il candidato applica, soltanto alle istanze già ammesse dal test sferico, un secondo test con parallelepipedo di ingombro allineato al mondo (bounding box della geometria trasformata dalla matrice di istanza, margine .02 unità scena). Nessuna semplificazione della mesh, materiale, texture, camera, illuminazione, risoluzione o portale. Il test non elimina oggetti per distanza o presunta occlusione. Non equivale a un sistema LOD; il guadagno deve essere misurato, non assunto. La modifica risiede soltanto nella copia locale CI, con hash prima/dopo; riferimento originale intatto.

**Prova:** stesso browser, stessa scena, stessa inquadratura e buffer; cinque inquadrature (atrio, panorama, panoramica sinistra/destra, verticale). Per ciascuna: baseline sfera, candidata sfera+box, ripristino sfera; lettura RGB reale e PNG; parità esatta di pixel, camera, buffer e hit dei portali rispetto al riferimento; ripristino pixel esatto; conteggi triangoli e draw call non crescenti; copertura invariata di 495 istanze, differenza visibili coerente con boxRejected. Inventario per radice disegnata (shell, scenography, cupola, portals, stars, istanze bay e punti astrali) tramite differenza dei contatori del renderer con radice temporaneamente nascosta, ripristinata prima del confronto seguente. Sono contributi al costo di disegno, non misure GPU temporali o quote del file. Conservare comunque esito PASS_NO_GEOMETRY_GAIN se nessun risparmio, non promuovere a priori. Dopo confronto: preflight e matrice ordinaria completa con scadenza navigazione invariata, buffer transient, risoluzione fissa e detach-first.

**Tracciabilità:** scripts/prepare-atlas-perf-geometry.mjs, scripts/atlas-perf-geometry-probe.mjs, workflow Atlas — PERF-05A conservative geometry experiment; artefatto atlas-perf-geometry (ricevuta, immagini originali, inventario, log, hash e controlli). Stato implementato, da qualificare. Fasi successive: scelta del primo intervento LOD/ottimizzazione delle mesh dal contributo misurato; proteggere iscrizioni e ornamentazione, esaminare confronti visivi. Compressione texture separata; nessuna pubblicazione, merge, autorizzazione studenti o nuovo servizio.
