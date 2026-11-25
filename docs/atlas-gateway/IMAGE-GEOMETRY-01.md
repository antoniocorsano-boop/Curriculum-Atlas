# ATLAS — IMAGE-GEOMETRY-01
## Riprogettazione geometrica dell'atrio a partire dall'immagine ART-DIR-02

**Aggiornamento fonte, 21/11/2026:** l'ideatore ha designato come canonico l'allegato **JPEG 1536×864**, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`, [archiviato in Drive](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view?usp=drivesdk) e [registrato nel manifest](./ART-REFERENCE-CANONICAL-2026-11-21.json). **Sostituisce operativamente il PNG 1672×941 citato nelle sezioni storiche**, senza convertire i byte o attribuire quote fisiche all'immagine sintetica. [Rilievo canonico](./ART-DIR-02-CANONICAL-LANDMARKS.json) e [calibrazione candidata](./ATLAS-CAMERA-FIT-CANONICAL-02.json) sono prodotti: la calibrazione numerica non è ancora applicata come geometria approvata. Tutte le eventuali condizioni `P0-REF` delle sezioni preesistenti vanno intese come riferite alla **vecchia** fonte, non alla nuova immagine canonica già archiviata.


**Decisione dell'ideatore:** 20 novembre 2026.  
**Stato:** **MANDATO ADOTTATO; RILIEVO E MODELLO GEOMETRICO ANCORA DA ESEGUIRE.**  
**Riferimento vincolante:** [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md) e [ART-REFERENCE-MANIFEST](./ART-REFERENCE-MANIFEST.md).
**Strumento riusabile formalmente archiviato:** [ATLAS-ATRIUM-COMPOSER-KIT-01](./ATLAS-ATRIUM-COMPOSER-KIT-01.md), comprensivo di prompt integrale, specifica geometrica, parametri iniziali, verifiche e percorso di realizzazione.  
**Master Blender:** [MASTER-BLENDER-01](./MASTER-BLENDER-01.md).  
**Assemblaggio/riuso:** [ASSET-KIT-01](./ASSET-KIT-01.md).  
**Piano esecutivo:** [ART-PROD-01](./ATLAS-GATEWAY-PRODUCTION-WORKFLOW-01.md).

## 1. Decisione fondamentale — inversione della dipendenza

**NON partire dalla geometria procedurale esistente della PR #152 per adattarla all'immagine. PARTIRE DALL'IMMAGINE per derivarne geometrie, composizione e proporzioni, e solo successivamente costruire il modello Blender.**

Il riferimento visivo approvato è la **sorgente artistica primaria e canonica**; la precedente scena WebGL/Blender di laboratorio può fornire esclusivamente tecnologie, strumenti e componenti che superino un confronto con la nuova ricostruzione. Non è un vincolo per la pianta, i volumi, gli archi, le distanze, le posizioni dei portali o la camera.

Il progetto geometrico non si ricava scegliendo una libreria di asset né copiando una singola prospettiva su piani: è una **ricostruzione architettonica tridimensionale da immagine**, con pianta, sezioni, alzati, superfici reali e geometrie delle parti non visibili inferite in modo coerente.

**Regola d'ordine:** IMAGE-GEOMETRY-01 → progetto geometrico verificato → ASSET-KIT-01 selezione di componenti adeguati → MASTER-BLENDER-01 scena artistica → approvazione Cycles → versione WebGL leggera.

## 2. Fonte e controllo di identità

- File canonico indicato nei documenti correnti: PNG 1672 × 941, SHA-256 `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`.
- L'ultimo invio JPEG 1536 × 864 conferma la stessa impostazione visiva; non sostituire il PNG senza una decisione formale.
- **Condizione preliminare:** recuperare e depositare in un archivio durevole il file con i byte e l'impronta verificata, accessibile alla filiera Blender/CI.
- Un'annotazione del SHA non è prova che il file sia depositato o che la sua geometria sia già stata ricostruita.

## 2-bis. Valutazione image-to-3D prima di modellare tutto manualmente

**Decisione di verifica del 20/11/2026:** recuperare anche il percorso sperimentale già discusso in precedenza (GEN-WORLD-01): usare l'immagine canonica come input di sistemi **image-to-3D** per ottenere una geometria iniziale **candidata**, importabile e modificabile in Blender. Questa verifica **precede le scelte di modellazione laboriosa**, ma non può diventare una dipendenza da servizi a pagamento o un pretesto per dichiarare pronto il master.

**Distinzione tecnica obbligatoria:**
- **Ricostruzione IA di mesh** (es. [TripoSR](https://github.com/VAST-AI-Research/TripoSR), [TRELLIS.2](https://github.com/microsoft/TRELLIS.2)): accetta una singola immagine e genera un possibile oggetto/mesh 3D; **non garantisce** pianta, quote, geometrie occluse, moduli editabili o corretta topologia di un atrio interno completo. TRELLIS.2 richiede risorse GPU elevate (repository ufficiale: NVIDIA con almeno 24 GB) e non è automaticamente eseguibile a costo zero sull'infrastruttura corrente.
- **Profondità monoculare** (es. [Depth Anything V2](https://github.com/DepthAnything/Depth-Anything-V2), modello Small Apache-2.0): produce una stima della profondità visibile e può guidare la ricostruzione; **non produce da sola** l'architettura completa con parti nascoste e materiali editabili.
- **Allineamento telecamera** (fSpy, eventuale [Fit The Camera](https://extensions.blender.org/add-ons/fit-the-camera/) se compatibile con Blender effettivamente fissato): ricava prospettiva/camera da linee guida, **non genera mesh da sola**. Fit The Camera dichiara supporto per Blender 5.2+, distinto dalla 5.0.1 già utilizzata dalla CI.

**Prova AI-G0, comparativa e circoscritta:**
1. Ottenere l'originale PNG canonico effettivamente accessibile, con SHA verificato.
2. Valutare una modalità **gratuita e autorizzata** di esecuzione per almeno un generatore di mesh e una stima della profondità; non impegnare infrastruttura nuova o esporre contenuti non autorizzati. Registrare versione, licenze e limiti.
3. Salvare risultati reali, screenshot da HERO e SIDE, prova di importazione/riapertura in Blender, presenza di geometria navigabile, separabilità dei componenti e dimensioni del GLB.
4. Confrontare con immagine canonica e progettazione prospettica: oculo, pareti curve, due livelli, quattro portali, basamento, profondità. **Non dichiarare l'IA idonea solo perché genera un GLB.**
5. **Decisione esplicita:** (a) geometria generata riutilizzabile e da ripulire; (b) adatta soltanto a parti secondarie; (c) non valida per il foyer: procedere con ricostruzione architettonica controllata IG0–IG4 senza ulteriore ricerca indefinita.

L'esperimento AI-G0 e la calibrazione della telecamera possono svolgersi in parallelo. Il modello definitivo di Atlas deve comunque essere una geometria coerente, modificabile e fedele, verificata con HERO/SIDE/MOBILE; non una superficie 2,5D o un panorama.

## 2-ter. Provenienza generativa e intenzione progettuale (verifica storica del 20/11/2026)

**Cronologia ricostruita delle conversazioni:** [GENERATION-PROVENANCE-01](./GENERATION-PROVENANCE-01.md) — ARENA 16/11 ore 06:16–06:25, passaggio Biblioteca Atlas tre portali, direzione Atlas finale quattro portali. Titolo e testo esatto della generazione originaria ancora non recuperati.



**Premessa confermata dall'ideatore:** il fotogramma ART-DIR-02 fu generato da ChatGPT. La generazione di un'immagine non presuppone che sia stato creato e conservato un modello 3D, una pianta, una telecamera reale o un file Blender recuperabile.

**Recupero effettivo eseguito:** dalla cronologia personale e dalla documentazione del progetto risultano conservati l'orientamento artistico di Atlas, i vincoli della rotonda, del lucernario, dei quattro portali, del basamento e della luce. In `ART-DIR-02` le caratteristiche visibili e gli obiettivi artistici sono descritti in dettaglio. **Non è stato recuperato il testo esatto dell'istruzione di generazione dell'immagine canonica, né parametri strutturali originali del generatore.** Non attribuire misure, focale, quote o topologia a quel prompt come se fossero dati storici certi.

**Attenzione alle varianti:** nella cronologia compaiono anche riferimenti a versioni della biblioteca Atlas con tre portali (Curricolo/Esperienze/Studio Atlas); sono differenti dal riferimento corrente a **quattro portali** (Curricolo/Esplora/Percorsi/Esperienze). Non usarle per alterare l'immagine ART-DIR-02.

**Uso operativo delle informazioni recuperate:**
1. Redigere una **scheda di intenzione progettuale recuperata** dai testi e dalle scelte storiche (architettura, atmosfera, composizione, portali), identificando la fonte di ogni decisione.
2. Estrarre dall'immagine canonica i **dati osservabili**: silhouette, punti prospettici plausibili, rapporti, allineamenti, colori e disegno delle superfici.
3. Conservare separatamente le **ipotesi introdotte ora**: scala reale, geometrie non visibili, profondità, valori numerici della camera e modulo architettonico.
4. Qualora in seguito venga recuperato il prompt esatto, aggiungerlo con la relativa provenienza e riconciliare le differenze; **non bloccare nel frattempo** la ricostruzione geometrica verificabile.
5. Non assumere che il prompt, anche recuperato, possa sostituire una ricostruzione 3D o garantire geometrie fisicamente coerenti.

**Principio:** usare la memoria della progettazione generativa come **brief architettonico**, l'immagine approvata come **vincolo visivo** e il confronto Blender HERO/SIDE/MOBILE come **prova di geometria**. Nessuna generazione aggiuntiva sostituisce il riferimento approvato.

## 2-quater. INVERSE-COMPOSER-01 — ricostruzione per sintesi e confronto (decisione del 20/11/2026)

**Decisione:** fare del compositore Atlas/Blender il **generatore parametrico della scena** a partire da ART-DIR-02, non limitarsi a usare un modello image-to-3D opaco e non adattare il riferimento alla geometria precedente. **Prima scena 3D, poi render da quella scena; non usare un nuovo modello text-to-image come surrogato della geometria.** Il generatore deve produrre sia un fotogramma confrontabile sia quote/mesh/camera esportabili e versionate.

**Metodo professionale:** **analisi mediante sintesi / inverse graphics**: stimare parametri `theta`, costruire con Blender una scena `S(theta)`, renderizzare `I(theta)` dalla camera HERO, misurare le differenze con il PNG canonico, aggiornare `theta` e ripetere, mantenendo SIDE/MOBILE per evitare geometria 2.5D. Sono separati gli scostamenti di camera, struttura, proporzioni, materiali e luce.

**Ordine delle regolazioni:**
1. Immagine canonica realmente verificata per byte SHA-256, quattro portali, non variante ARENA a cinque o biblioteca a tre.
2. Rilevare su quel PNG i punti 2D di controllo e le silhouette: oculo/corona, asse, due livelli, posizioni/spigoli dei quattro portali, ellisse e appoggio del podio, fughe pavimento.
3. Configurare **parametri editabili**: curvatura e raggio della rotonda, livelli, nervature oculo, portali (4), podio ellittico, posizione/focale/orientamento camera, orientamento delle superfici e ingombri architettonici.
4. Eseguire un **render rapido neutro** e il confronto numerico/geometrico. Registrare misure **relative** e confidenza: un'immagine non identifica una pianta/metrica univoca.
5. Regolare prima camera e grandi volumi; solo dopo sostituire le superfici principali con asset adeguati (ASSET-KIT-01) e passare ai materiali/luce Cycles.
6. Ottenere da un unico modello `CAM_HERO`, `CAM_SIDE`, `CAM_MOBILE`; costruire e conservare `.blend`, parametri JSON, coordinate 3D, proiezioni 2D, tavole/sezioni, immagini e report delle differenze.
7. SOLO dopo approvazione dell'ideatore e completamento della catena FLOW-02 passare al derivato GLB e al motore Atlas. Vietato trasformare un miglioramento dell'immagine in una falsa prova di geometria corretta.

**Prototipo effettivamente preparato nella sessione del 20/11/2026:** archivio `atlas_inverse_composer_prototipo.zip`, SHA-256 `99850809929f62839373d0d782d41544a8df0a7d000042f7aec6e636c1863d2d`, contenente:
- `scene-parameters.json`: ipotesi dimensionali **relative e non calibrate**, quattro portali, tre telecamere, impronta del riferimento;
- `scene_composer.py`: Blender Python che genera una scena 3D **SEED UNAPPROVED**, salva un `.blend`, può renderizzare tre viste e produce `geometry-evidence.json` con geometrie e punti proiettati;
- `README.md`: esecuzione, limiti, percorso al risultato.

**Prove realmente eseguite:** sintassi Python valida con `py_compile`, JSON valido, invarianti quattro portali e tre camere. Archivio ZIP verificato. **Non eseguito:** Blender (non installato nell'ambiente locale), generazione `.blend`, render, calcolo di somiglianza sul PNG canonico e ottimizzazione iterativa. Il prototipo è al momento allegato come file scaricabile nella conversazione, **non depositato in GitHub né collegato a una CI esecutiva**. Il suo codice andrà versionato quando il collegamento ad artefatti sarà disponibile; non è il master finale.

**Prossimo ostacolo risolutivo:** disponibilità del PNG definitivo ART-DIR-02 in byte autentici al percorso `visual-factory/atlas-gateway/reference/atlas-hero-approved.png`. Il confronto semantico dei pixel e l'ottimizzazione automatica dei parametri non sono eseguibili in sua assenza. Rimane aperta la selezione di un ambiente reale con Blender 5.x e risorse CPU/GPU compatibili e gratuite.

**Fonti tecniche:**
- Blender Python 5.0, esecuzione non interattiva: https://docs.blender.org/api/5.0/info_tips_and_tricks.html
- Blender projection API `world_to_camera_view`: https://docs.blender.org/api/main/bpy_extras.object_utils.html
- fSpy per camera matching: https://fspy.io/
- Ricerca 2026 `Thinking in Blender — Staged Executable Inverse Graphics`: https://arxiv.org/abs/2606.02580

**Regola di controllo:** distinguere (a) somiglianza bidimensionale, (b) plausibilità tridimensionale da altre viste, (c) editabilità geometrica, (d) effettiva fedeltà artistica. Nessun punteggio automatico può garantire (d).


## 3. Catena di inferenza, senza false certezze

### IG0 — Ricognizione visiva e tavola di riferimento
- Usare l'immagine canonica completa, senza ritagli che alterino il rapporto della camera.
- Sovrapporre una griglia di lettura, segnare l'asse di simmetria, gli orizzonti possibili, il bordo dell'oculo, i livelli architettonici, la posizione apparente e l'ingombro dei quattro portali, l'ellisse del basamento, l'andamento dei giunti a pavimento, le silhouette delle logge e i confini della scena.
- Produrre `reference-landmarks.json` con coordinate **normalizzate 0–1** e una tavola `reference-annotated.png`, entrambi verificabili.
- Dichiarare separatamente le osservazioni visibili, le interpretazioni e ciò che non si può dedurre.

### IG1 — Camera e sistema di riferimento
- Stimare asse, altezza osservatore, inclinazione, campo visivo e punti/linee di fuga usando le rette effettivamente coerenti.
- Provare fSpy soltanto se le fughe sono geometricamente affidabili; per l'immagine sintetica ammettere incoerenze prospettiche. Non forzare un'unica prospettiva impossibile.
- Fissare una camera HERO documentata; costruire camere SIDE e MOBILE dallo **stesso** modello reale, non con artifici di facciata.
- Distinguere parametri ricostruiti, assunti per progetto e ancora incerti; nessuna misura metrica spacciata per dedotta da un solo fotogramma.

### IG2 — Riprogettazione architettonica
Produrre prima dell'assemblaggio di librerie:
1. **Pianta parametrica:** asse, centro della rotonda, raggio/angolo dell'involucro, posizione quattro portali, ingombro del podio e assi strutturali.
2. **Sezione longitudinale e trasversale:** quote relative dei due livelli, balconate e aperture, spessore della corona dell'oculo, rapporto altezza/diametro.
3. **Alzato/sviluppo modulare:** pilastri, archi, logge, vetri, fioriere e pannelli; numero e interasse da stabilire mediante verifica prospettica.
4. **Componenti identitari:** telaio e spessore del portale master, varianti quattro portali, basamento ellittico ribassato e lucernario reale.
5. **Geometria nascosta:** ricostruzione tecnicamente e visivamente plausibile, registrata come ipotesi progettuale, senza pretendere che fosse visibile nella fonte.

Fissare un sistema di scala coerente, anche con un'unità relativa iniziale; solo dopo definire eventuali dimensioni metriche di progetto. Salvare una tabella dei parametri con tolleranze e grado di certezza.

### IG3 — Modello Blender geometrico neutro
- Costruire un **unico modello 3D** con componenti nominati secondo MASTER-BLENDER-01, senza texture che mascherino errori di forma.
- Prevedere mesh o curve realmente tridimensionali per la rotonda, i due livelli, la struttura dell'oculo, i quattro portali e l'ellisse del podio; superfici laterali e spessori dove la camera può muoversi.
- Ottenere render neutri `clay-hero.png`, `clay-side.png` e `clay-mobile.png`.
- L'assemblaggio da librerie esterne **segue** la verifica delle geometrie e delle dimensioni richieste, non la precede.

### IG4 — Confronto in sovrapposizione e revisione
- Confrontare HERO con l'immagine sorgente nello stesso rapporto d'aspetto, mediante sovrapposizione, silhouette, ingombri/centri dei portali, bordo dell'oculo, livelli e contorno del podio.
- Registrare deviazioni percettive e geometriche per sottosistema; correggere **camera o progetto geometrico** prima di aggiungere materiali e luci.
- Validare SIDE per reale profondità e MOBILE per una composizione autonoma.
- Acquisire valutazione visiva dell'ideatore prima della modellazione artistica dei dettagli; non dichiarare equivalenza artistica per il solo superamento automatico di test.

## 4. Distinta geometrica preliminare ricavabile dalla descrizione del riferimento

Questa tabella indica **che cosa misurare e riprogettare** quando i pixel della fonte sono disponibili; non contiene quote inventate.

| Parte | Osservazioni disponibili | Grandezze/forme da derivare o progettare | Incertezza |
|---|---|---|---|
| Rotonda | Atrio curvo su due livelli | centro, raggio, arco visibile, spessore, altezza relativa | profondità e porzioni nascoste |
| Gallerie | Logge e parapetti laterali | quote dei due piani, interassi, sezioni | continuità fuori campo |
| Oculo | Grande lucernario vetrato in sommità | diametro/proiezione, inclinazione, corona, nervature | proiezione ellittica vs forma reale |
| Portali | Quattro grandi portali traslucidi | profili, dimensioni relative, spessori, posizioni lungo arco | distanza reciproca in profondità |
| Podio ATLAS | Basamento ellittico basso e largo | semiassi, quota, curvatura convessa, anelli | dimensioni metriche assolute |
| Pavimento | Pietra scura con giunti prospettici | piano, direzioni delle fughe, modulo lastre | scala assoluta |
| Decorazioni | Vegetazione, stendardi, luci calde | volume di ingombro e posizionamento | dettagli secondari |

## 5. Prove concrete di completamento

- [ ] PNG canonico materialmente archiviato e SHA verificato.
- [ ] Tavola annotata con riferimenti e file di punti normalizzati **estratti realmente dall'immagine**.
- [ ] Camera HERO documentata, ipotesi esplicite e parametri riproducibili.
- [ ] Pianta, due sezioni e alzato/sviluppo geometrico parametrici, coerenti fra loro.
- [ ] `.blend` geometrico neutro, con HERO/SIDE/MOBILE e geometria realmente tridimensionale.
- [ ] Confronti e sovrapposizioni dell'HERO contro la fonte; eventuali scarti registrati.
- [ ] Approvazione compositiva dell'ideatore. **Solo allora** approvare il kit di moduli ASSET-KIT-01 per adattarlo al progetto.

**GO/NO-GO:** l'esistenza di una precedente scena geometrica non costituisce superamento di IG0–IG4. Nessuna definizione geometrica definitiva è attribuibile alla fonte senza un rilievo effettivo e il suo confronto visivo.

## 6. Conseguenze per gli altri piani

- MASTER-BLENDER-01: la fase di camera/clay è un **processo di reverse design dall'immagine**, non il miglioramento della precedente geometria WebGL.
- ART-PROD-01: **IG0–IG4 devono precedere la selezione finale ASSET-KIT e la rifinitura artistica**. L'ordine D1/D2 viene reinterpretato in questo senso; le prove tecniche isolate possono svolgersi in parallelo, ma non cambiano la geometria finale.
- ASSET-KIT-01: i cataloghi si consultano sulla base degli ingombri e dello stile derivati; se un asset non corrisponde, si adatta o si scarta.
- PR #152: conserva valore per il runtime, le interazioni e i test, ma non è la fonte delle quote geometriche o della camera definitiva.
- Nessun merge, deploy o pubblicazione studente conseguono a questa decisione.

**Prossima operazione esecutiva:** ottenere il PNG effettivo nella filiera, effettuare il rilievo visivo IG0 e la ricostruzione di camera IG1, quindi produrre pianta/sezioni IG2. La stesura di questo documento non è l'esecuzione di tali operazioni.

## IG0 — Esito operativo del 20 novembre 2026 (materiali effettivamente disponibili)

**Verifica degli ingressi (evidenza, non approvazione):**
- Il file fornito dall'ideatore con la prima immagine **ARENA** è disponibile come allegato della conversazione corrente: snapshot `1000032603.png`, **1536×864 px**, SHA-256 `1a5a75b661bc47c21655465e78cdb052027ef858a8c7b73390431f1ccda78bc8`. La schermata del telefono colloca il salvataggio del **precedente file originale locale** al **16/11/2026 ore 06:25 CET**. Il file corrente NON corrisponde binariamente all'originale locale indicato nella schermata.
- **Primo rilievo VISIVO storico ESEGUITO**, su quello screenshot ARENA a cinque pannelli: asse stimato, contorni approssimativi dei cinque pannelli, curva apparente dell'oculo, ingombro ellittico del podio. Dati leggibili in [ARENA-IG0-HISTORIC-01.json](./ARENA-IG0-HISTORIC-01.json). Sono punti manuali di immagine, **non** quote, progetto di pianta, geometria approvata o solve prospettico.
- Recuperata dalla Library un'altra variante `Atlas-AG04-riferimento-grafico-approvato.png`, **1672×941 px**, SHA-256 `e6d374806529223558d226e8e52faf1889cf73214030bd6f1100c569fd96b252`. Mostra la Biblioteca Atlas con **tre portali**, **NON** il PNG canonico ART-DIR-02 a quattro portali, e l'impronta è diversa. **Non sostituire** l'input canonico con questa variante.
- Ricerche mirate nelle risorse della sessione/Library e nel Drive collegato (per nome del PNG originale e del pacchetto sorgenti visivi) **non hanno restituito il PNG canonico** `atrio_futuristico_atlas_della_conoscenza.png` con SHA `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`. Questo non prova l'inesistenza del file in altri archivi; **P0-REF rimane aperto**.
- In questa sessione locale l'eseguibile Blender non è installato e la libreria Python `bpy` non è disponibile; **nessun render Cycles, test Blender o ricostruzione neurale può essere dichiarato eseguito**. Il runtime di produzione via CI/altro esecutore resta da verificare separatamente.
- Il prompt letterale delle istruzioni ricevute dal generatore della prima immagine ARENA o dell'ultima immagine Atlas **non è stato recuperato**, nonostante la ricostruzione della finestra temporale storica in [GENERATION-PROVENANCE-01](./GENERATION-PROVENANCE-01.md).

**Conclusione effettiva:** esiste un primo rilievo manuale di **provenienza storica**. **IG0–IG4 per l'Atlas definitivo non sono superati.** Il prossimo ingresso necessario è il file binario canonico approvato (SHA sopra), da cui effettuare il rilievo che governerà le geometrie, indipendentemente dalla vecchia PR #152. Non procedere a un modello definitivo utilizzando ARENA o AG04 come surrogati.
