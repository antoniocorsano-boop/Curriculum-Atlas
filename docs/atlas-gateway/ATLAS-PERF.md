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
