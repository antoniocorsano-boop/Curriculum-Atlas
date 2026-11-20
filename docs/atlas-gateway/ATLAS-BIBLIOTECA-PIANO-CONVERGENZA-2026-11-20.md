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


## Esecuzione Fase A — Diagnostica locale opzionale
È stata introdotta nella sola candidata Web PR #148 la pagina \`/biblioteca/?diagnostica=1\`, disponibile come anteprima tecnica. Il parametro aggiunge **Avvia misura**, **Termina misura** e **Copia risultato**, senza cambiare la scena, la geometria, i materiali, la luce o il caricamento quando la diagnostica non è attivata. I dati restano nella pagina e vengono copiati soltanto su azione esplicita; non vengono archiviati né trasmessi ad analisi esterne. Per misurare: aprire il collegamento con \`?diagnostica=1\`, verificare che la biblioteca sia pronta, premere Avvia misura, trascinare ripetutamente la visuale, premere Termina misura e condividere il testo soltanto se desiderato.

**Interpretazione obbligatoria:** il rapporto contiene cadenza dei fotogrammi **inviati dal motore grafico**, p95 degli intervalli tra invii, p95 della durata CPU di sottomissione, contropressione della coda GPU, scala di risoluzione e numero delle chiamate grafiche. La cadenza d'invio NON è una misura degli FPS effettivamente mostrati dallo schermo; i tempi GPU risultano esplicitamente «non disponibile», evitando false equivalenze. Una misura supportata del tempo GPU può essere valutata in un secondo momento senza presumere estensioni WebGL presenti sul telefono. La prova è stata inserita nel test della stessa pagina Android simulata; la misura concreta richiede l'interazione sullo smartphone fisico.


## Misura reale ricevuta — diagnosi di partenza
Il primo rapporto restituito dallo smartphone riporta sala pronta a **8.677 ms**, durata prova **20.087 ms**, **181 invii di fotogramma**, frequenza dichiarata **11/s**, intervallo fra invii al p95 **191,3 ms**, intervallo massimo **3.133,9 ms**, durata CPU sottomissione al p95 **10 ms**, attese GPU dichiarate **0**, scala raster **1,20**, **60** chiamate grafiche. Tempo GPU **non disponibile**. Il numero «11/s» deriva dall'intervallo fra il primo e l'ultimo invio e non rappresenta gli FPS dello schermo; la durata complessiva e le pause rendono non confrontabili in modo ingenuo 181/20.087 e la frequenza dichiarata.

Interpretazione: l'esperienza segnalata come poco fluida resta **confermata**; non è dimostrato che la GPU sia il collo di bottiglia. L'assenza di attese non equivale a GPU inattiva, specie se la funzione di interrogazione delle barriere non è supportata. Un intervallo massimo di 3,13 s può essere una pausa senza movimenti, perché il navigatore non disegna continuamente quando la visuale è ferma. **Sospendere riduzioni aggiuntive della qualità** finché non viene isolata la frequenza durante il gesto.

**Revisione diagnostica successiva:** la pagina \`?diagnostica=1\` distingue i movimenti di trascinamento dalle pause, aggiungendo quantità di gesti, eventi tattili, durata approssimativa di movimento, intervalli di invio durante movimento, p95 e ritardi maggiori di 200 ms durante il movimento; dichiara esplicitamente il supporto al controllo della coda GPU. I dati restano in locale e la modalità è esclusivamente volontaria. Il collaudo deve produrre trascinamenti effettivi, non solo tocchi dei comandi; nessuna modifica a shader, geometrie, luci o asset. La decisione successiva è fondata sui soli intervalli realmente associati al movimento del dito.


## Secondo rapporto reale — ottimizzazione mirata del movimento
Seconda rilevazione ricevuta dal telefono: **5.021 ms** fino alla sala pronta; **5.601 ms** di prova, **56 invii**, frequenza complessiva degli invii **14,7/s**, p95 generale **149,8 ms**, massimo generale **1.046,9 ms**, CPU di sottomissione p95 **11 ms**, zero attese coda rilevate pur con controllo supportato, 60 chiamate grafiche, scala finale 1,20. Durante il gesto: **3 gesti, 113 eventi, 1.934 ms circa di movimento, 53 intervalli attivi**, **27,6 invii/s**, p95 **43,9 ms**, massimo **149,8 ms**, nessun intervallo attivo oltre 200 ms. Non è una misura FPS GPU; il p95 è superiore ai **33,3 ms** corrispondenti a 30 aggiornamenti/s regolari, ma la frequenza media di invio è vicina al limite intenzionale di 30/s.

**Decisione:** non degradare ulteriormente illuminazione, risoluzione ferma, geometria e texture. Un'ispezione del motore Web PR #148 mostra che il precedente trascinamento effettuava \`setCamera()\` **a ogni evento del puntatore**, mentre \`render()\` era già limitato a ~30/s e \`setCamera()\` aggiorna matrice, dimensioni e visibilità. I 113 movimenti reali possono quindi comportare molte più rivalutazioni della camera rispetto ai fotogrammi effettivamente disegnati. Correzione piccola: accumulare angolo e inclinazione a ogni evento, ma eseguire \`setCamera()\` **solo immediatamente prima del fotogramma autorizzato**, oltre che al rilascio e annullamento del gesto per garantire coerenza finale. La coda grafica e il tetto di 30/s non sono modificati.

**Prova attesa:** trascinamento col pulsante/puntatore ancora premuto deve muovere realmente la camera, la scena deve rimanere leggibile e navigabile, nessun errore del visualizzatore, tempi CPU e p95 reali nuovamente misurati con lo stesso percorso del dispositivo fisico. **Non dichiarare l'obiettivo di fluidità conseguito sulla base del solo collaudo sintetico.** In caso di regressione tornare alla revisione precedente senza toccare le risorse.
