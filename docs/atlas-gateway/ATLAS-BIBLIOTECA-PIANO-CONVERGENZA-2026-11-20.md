# Biblioteca Atlas Web — Piano unico di realizzazione e convergenza
**Decisione del 20 novembre 2026 · Stato: approvazione operativa per la pianificazione, esecuzione distinta dai collaudi già conclusi**

## 1. Obiettivo di prodotto
La biblioteca deve essere **fruibile, funzionante, fluida sul Web e di alta qualità visiva** su smartphone, tablet e computer. È la porta d'ingresso agli ambienti e ai contenuti Atlas: **non** sostituisce Arena né diventa un nuovo Studio Atlas o un World Composer. Evitare cicli di sola qualificazione senza miglioramento visibile del prodotto. L'evidenza determinante è l'uso reale della biblioteca.

**Vincoli permanenti:** nessuna spesa aggiuntiva, nessun nuovo servizio, nessun secondo motore 3D, nessun cambiamento non autorizzato al master Blender, a \`main\`, alla pubblicazione istituzionale o ai contenuti destinati agli studenti. La diramazione Cloudflare è un'anteprima tecnica raggiungibile da chi possiede il link: \`studentAuthorized=false\` **non è un controllo di autenticazione**. Nessun dato personale nella scena o nella diagnostica.

## 2. Baseline di riferimento, verificata
- Unico ramo di prodotto: PR #148 \`work/atlas-library-web-delivery\`, testa \`9ca0b097b12ece076507566dae2f445386d0e9b0\`, basata su PR #147 \`work/atlas-library-bay-material-completion\`. PR aperta, bozza, non integrata.
- Collaudo statico: workflow \`Atlas — Native master navigable preview\`, esecuzione **44693821496**, prova \`PASS_FULL_LIBRARY_STATIC_WEB\` su telefono Android simulato e desktop. HTTPS Cloudflare effettivamente pubblicato con alias di revisione e \`library-review\`.
- Otto risorse originali: **25.798.660 byte**; distribuzione compressa, senza perdita e con SHA originale verificato: **14.618.743 byte (56,66%)**. Sette file compressi e nessun modello originale scaricato nella prova. Questo è traffico di risorse, **non** la memoria GPU né il peso totale dell'applicazione.
- **495 oggetti**; **60 chiamate grafiche** nel caso mobile; già presenti istanziazione, gestione visibilità, trasferimento incrementale. Illuminazione mobile: 2 fasci sulle cornici, 3 sulle scaffalature, ombra del sole precalcolata 512²; scala grafica circa **1,20** a riposo, **0,72** in trascinamento; tetto 1.048.576 pixel; materiali fotografici mantenuti con profilo materico mobile scalare. Nessuna nuova texture aggiunta.
- Rapporto del collaudo: invio del fotogramma dopo interazione **2 ms** misurati sul software di prova. **Non è il tempo GPU** del telefono dell'ideatore e non dimostra 30 fotogrammi/s.
- La prova sullo smartphone fisico mostra biblioteca e illuminazione presenti, ma l'ideatore ha riscontrato **fluidità insufficiente**; non esiste ancora una misura attendibile del 95° percentile dei tempi tra fotogrammi sul dispositivo reale. Questo è il principale requisito irrisolto, non il numero di controlli automatizzati superati.

## 3. Convergenza tra i lavori, senza duplicazioni
| Linea | Responsabilità | Impatto consentito sulla Biblioteca Web |
| --- | --- | --- |
| **Biblioteca Web / PR #148** | Prodotto, prestazioni reali, comandi, accessi, distribuzione di anteprima | **Unico ramo di integrazione dell'esperienza navigabile** |
| **Blender, Visual Factory, ASC** | Master, immagini e materiali, sorgenti luminose, derivati artistici | Conferire **risorse selettive** solo quando migliorano una superficie/area osservabile; master invariato |
| **PR #147 — campata LBC-01** | Texture e prove sulla campata isolata | Conservare evidenze; nessuna propagazione automatica dei bake a 45 campate |
| **PR #149 — ASC/P2C1 luce precalcolata** | Prova indipendente su una superficie statica | Non integrare finché non è dimostrato un beneficio visibile e compatibile con il runtime reale |
| **Atlas World Composer / PR #136 e progettazione Studio Atlas** | Ideazione, composizione e produzione dei mondi educativi | Solo contratti condivisi per **manifest di scena, destinazione e provenienza**; non intervenire sul visualizzatore della biblioteca |
| **Arena e CURR-REF / PR #144** | Autorità curricolare, stati e progressioni approvate | Il portale \`Curricolo\` conserva origine, integrità e criteri di pubblicazione; niente autorità duplicata |
| **TRAMA** | Coordinamento, decisioni, prove e regole di pubblicazione | Raccordo di contratto; **non** un secondo archivio di contenuti, motore o portale |
| **Docente OS** | Preparazione e raccordo didattico | Nessun dato personale portato nel Web pubblico |

Progetti e richieste di modifica rimangono separati finché non c'è un'interfaccia precisa da condividere. In particolare, l'esperimento di luce #149 **non blocca** l'accesso alla Biblioteca Web.

## 4. Piano operativo sequenziale

### A — Stabilizzare il prodotto e diagnosticare il dispositivo reale
**Input:** URL dell'anteprima PR #148, esatto SHA, immagini già confermate e segnalazione di scarsa fluidità.
**Realizzazione:**
1. Congelare una **baseline riproducibile** (riferimento al commit e all'URL immutabile), preservando un semplice ritorno alla precedente anteprima funzionale.
2. Aggiungere un quadro diagnostico **locale, opzionale e temporaneo** nella biblioteca (nessuna trasmissione dei dati): tempo al primo fotogramma, tempo alla sala completa, FPS e intervalli tra \`requestAnimationFrame\` sul dispositivo reale, percentili e interruzioni, scala raster, chiamate grafiche, risorse e fallimenti. Separare esplicitamente **durata CPU** dalla **durata GPU**. Usare \`EXT_disjoint_timer_query_webgl2\` *solo se supportata*, interrogando i risultati in modo asincrono; in caso contrario dichiarare il dato GPU «non disponibile».
3. Uno scenario reale di uso: apertura, osservazione della sala, trascinamento della visuale, apertura e chiusura comandi, scelta di un portale, ritorno alla biblioteca. Consentire una singola schermata condivisibile con le misure, senza accesso agli strumenti di sviluppo del computer.
**Uscita:** 1 fotografia visiva e 1 rapporto breve sullo smartphone fisico; almeno un collo di bottiglia identificato. Non aprire ulteriori suite sperimentali.

### B — Ottimizzazione mirata, un solo ciclo correttivo alla volta
**Ramo unico:** #148.
**Decisione deterministica basata sulle misure:**
- Se rallenta **la GPU durante trascinamento**: ridurre prima shader e pixel, poi numero/raggio dei fasci e precisione delle ombre mobili; mantenere ombre del pavimento, contrasto dei volumi e riconoscibilità di libri e materiali. Conservare l'adattamento grafico 0,72→1,20 solo se migliora realmente la fluidità.
- Se rallenta **la CPU**: individuare traversata di scena, raccolta eventi, passaggi del motore e decodifica. L'istanziazione è già presente e le 60 chiamate grafiche non giustificano da sole un altro compilatore di geometrie.
- Se prevalgono **rete o memoria**: verificare trasferimento iniziale, tempi di decompressione, memoria texture e accessi ripetuti. Le immagini \`KTX2\`/Basis e quantizzazione delle geometrie sono strumenti opzionali da impiegare **solo dopo compatibilità verificata con Three.js r128 e con i materiali esistenti**; mai introdurre una migrazione di motore come prerequisito.
- Se la navigazione è fluida ma la **qualità si deteriora**: correggere la singola luce, il materiale o l'area visibile, non rilavorare tutti i modelli.
**Uscita:** prima/dopo dallo stesso punto di vista, tempo sul dispositivo reale, scelta conservata o ripristinata; nessun cambiamento a master o percorsi curricolari.

### C — Rifinitura artistica e didattica della sala completa
**Perimetro:** ingresso, pavimento, ombra architettonica, cupola, scaffalature, metalli, leggibilità dei tre portali, comandi a tocco e visuale immersiva.
**Verifica umana sintetica:** 3 viste reali (normale, immersiva, vicinanza alle scaffalature), massimo 5 rilievi prioritizzati con correzione diretta. La resa Blender serve da **riferimento artistico**, non da obbligo di uguaglianza pixel-per-pixel; AgX e ACES non sono intercambiabili.
**Uscita:** nessuna interferenza significativa dei comandi sulla sala, accessi leggibili e funzionanti, profondità luminosa conservata, fluidità accettata sul dispositivo.

### D — Consolidamento tecnico, raccordo e candidata al rilascio
**PR #148 è impilata su #147**, che dipende a sua volta da lavori precedenti. Non trasferire indiscriminatamente l'intera catena in \`main\`.
1. Inventariare le modifiche realmente necessarie alla **biblioteca completa** e preparare un'unica candidata di integrazione con base aggiornata, senza trascinare le prove isolate non richieste.
2. Collegare solo le destinazioni governate: Curricolo da Arena, Esperienze con contenuti autorizzati, Studio Atlas come accesso informativo finché non esiste autorizzazione. Definire un contratto di ingresso per i mondi di World Composer, senza introdurre il compositore dentro la biblioteca.
3. Conservare nello stesso dossier ogni decisione: problema osservato, intervento, motivazione, risorse interessate, confronto visivo, misura, eventuale ripristino, provenienza e approvazione.
4. Un solo controllo finale essenziale su smartphone e desktop più le verifiche di privacy, licenze, provenienza e destinazioni. Conservare la distribuzione gratuita su Cloudflare; la pubblicazione per studenti **richiede un'autorizzazione distinta ed esplicita**.
**Uscita:** candidata stabile e documentata, pronta per integrazione e decisione di pubblicazione senza dipendere da un revisore esterno non disponibile.

## 5. Criteri di accettazione del prodotto (obiettivi, non risultati acquisiti)
| Requisito | Criterio pratico |
| --- | --- |
| Accesso | Apre via HTTPS direttamente su Android e computer, senza download, con uscita semplificata in caso d'errore |
| Fluidità | **Obiettivo: almeno 30 FPS percepiti durante la rotazione** sul telefono di riferimento, con tempo al 95° percentile dei fotogrammi da misurare e senza blocchi rilevanti; il requisito può essere affinato solo su evidenza reale |
| Avvio | Mostra una prima scena riconoscibile durante il caricamento, senza un pannello vuoto prolungato; misurare separatamente primo avvio e aperture successive |
| Peso | Partire dai **14,6 MB compressi** reali; nessun aumento significativo per una rifinitura che non produca un chiaro beneficio percepito |
| Qualità artistica | Ombre coerenti, libri e materiali riconoscibili, portali leggibili; confronto di immagini equivalenti prima/dopo |
| Navigazione | Tocco e comandi 3D, visuale immersiva, tre accessi coerenti; nessuna perdita delle scelte curricolari approvate |
| Rischio/costi | Master e dati scolastici protetti, nessun servizio a pagamento, nessuna nuova applicazione, nessuna diffusione studenti senza autorizzazione |

## 6. Fonti e regole di misura
**Evidenze interne:** PR #148 e run 44693821496; PR #147, #149, #136 e #144; documentazione \`ATLAS-LIBRARY-WEB-DELIVERY.md\`. I dati di run descrivono un browser **simulato**, non il comportamento della GPU dello smartphone reale.

**Documentazione tecnica consultata il 20 novembre 2026:**
- Three.js \`WebGLRenderer\`: https://threejs.org/docs/pages/WebGLRenderer
- Three.js \`InstancedMesh\`: https://threejs.org/docs/pages/InstancedMesh.html
- Three.js \`KTX2Loader\`: https://threejs.org/docs/pages/KTX2Loader.html
- Three.js manuale sull'ottimizzazione degli oggetti: https://threejs.org/manual/pages/optimize-lots-of-objects.html
- Chrome Developers, analisi prestazioni e limiti delle simulazioni desktop: https://developer.chrome.com/blog/devtools-grounded-real-world
- MDN, misure GPU \`EXT_disjoint_timer_query\`: https://developer.mozilla.org/en-US/docs/Web/API/EXT_disjoint_timer_query
- glTF Transform, compressione e ottimizzazione opzionale: https://gltf-transform.dev/
- Cloudflare Pages, gestione risorse e cache: https://developers.cloudflare.com/pages/configuration/serving-pages/

**Decisione irrinunciabile:** la prossima modifica produttiva si valuta da ciò che migliora nell'esperienza reale, non dal numero di nuovi test o prototipi prodotti. Un solo ramo di prodotto, una sola cronologia decisionale, risorse artistiche e curricolari governate dalle rispettive fonti di autorità.
