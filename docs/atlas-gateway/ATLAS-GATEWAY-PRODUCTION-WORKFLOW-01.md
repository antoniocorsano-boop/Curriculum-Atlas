# ATLAS — ART-PROD-01
## Piano esecutivo di produzione artistica e tridimensionale del Gateway

**Versione:** 1.0 · **Data:** 20 novembre 2026  
**Norma artistica superiore:** [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md). In caso di divergenza estetica prevale ART-DIR-02.
**Piano prodotto:** [ATLAS-GATEWAY-01 #151](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/151). **Governo ecosistema:** [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354).
**Base tecnica riusabile:** [PR Atlas #152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152) — **bozza, non integrata e non artisticamente approvata**.  
**Metodo di selezione e assemblaggio adottato:** [ASSET-KIT-01](./ASSET-KIT-01.md) — riutilizzare/adattare asset professionali qualificati, costruire ex novo i tratti identitari Atlas, produrre prima una campata e un portale verificabili. La selezione è ancora da completare.
**Decisore artistico:** ideatore responsabile di Atlas. **Modalità operativa:** una sola scena campione; una sola catena di produzione; nessuna sostituzione della pagina pubblica fino all'approvazione.

## A. Che cosa stiamo davvero producendo

**Non** una nuova immagine generata, una libreria con scaffali, una panoramica 360° passiva, una facciata 2,5D o un altro visualizzatore. Il prodotto è un **atrio tridimensionale autentico** il cui fotogramma principale appare **il più vicino possibile all'immagine Atlas scelta** e la cui struttura regge limitati spostamenti di camera, selezione dei portali e fruizione da smartphone.

I dieci vincoli della sezione 10 di ART-DIR-02 sono condizioni non negoziabili.

**Fotogramma di riferimento verificato nella conversazione:**
- Nome dell'originale di lavoro: `atrio_futuristico_atlas_della_conoscenza.png`.
- Dimensioni: **1672 × 941 pixel**, orientamento orizzontale ~16:9, PNG, **2.288.614 byte**.
- SHA-256 del file nel contesto di lavoro: `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`.
- **Stato di conservazione:** originale ancora da depositare permanentemente in un archivio di risorse autorizzato; la presente descrizione e l'impronta **non equivalgono all'archiviazione dei byte nel repository**. Evitare di sostituire inavvertitamente il file con una schermata dell'app, un'immagine compressa o una nuova generazione.
- **Priorità D0:** conservare l'originale, verificarne SHA/dimensioni, registrare metadati e diritti d'uso nel registro risorse. Se l'archiviazione della risorsa non è possibile nel repository, utilizzare un archivio versionato autorizzato con collegamento stabile e impronta nel piano.

### Elementi compositivi da riconoscere nel primo fotogramma
1. Camera centrale simmetrica, con prospettiva profonda e pavimento che conduce al centro.
2. Grande **lucernario vetrato circolare con cielo**, visibile parzialmente nella parte alta, corona metallica calda e fasci freddi naturali.
3. Rotonda di qualità architettonica: **due livelli**, balconate e vetri, pilastri con profondità, laterali abitati da aperture illuminate, poche superfici espositive e vegetazione.
4. Quattro grandi pannelli traslucidi, **Curricolo — Esplora — Percorsi — Esperienze**, disposti ad arco con silhouette separate, cornici calde e accenti azzurri, icone/illustrazioni dedicate.
5. Basamento ellittico centrale **basso, ampio e convesso**, ATLAS illuminato, anelli bronzei concentrici e ombre di contatto.
6. Pietra scura levigata, **riflessioni selettive** del lucernario e dei portali, equilibrio blu/ottone.
7. Marca ATLAS e «Entra in Atlas» riconoscibili, ma **le scritte funzionali e gli indirizzi non vanno incisi nelle texture 3D**: fonte unica dati e componenti HTML accessibili.

L'immagine è un concetto artistico: proporzioni di alcuni elementi, luci e riflessi potrebbero essere fisicamente incoerenti. La ricostruzione da un solo fotogramma necessita decisioni sulle parti nascoste; la **vista principale prevale**, ma la vista laterale deve rimanere coerente.

## B. Scelta di filiera — unica e intenzionalmente breve

```
ART-DIR-02 + riferimento immutabile
      ↓
camera corrispondente + composizione in grigio (approvazione)
      ↓
set architettonico da risorse modulari qualificate (no primitiva per ogni elemento)
      ↓
materiali PBR, regia luminosa, master Blender/Cycles
      ↓
confronto artistico A/B nella stessa camera (APPROVAZIONE O STOP)
      ↓
derivato web: geometrie ottimizzate + mappe di luce/texture + GLB
      ↓
Atlas Three.js esistente, portali reali + accessibilità
      ↓
confronto Blender↔WebGL + collaudo Android fisico
      ↓
promozione controllata (se autorizzata)
```

**Regola anti-dispersione:** mai riaprire una sequenza di micro-PR su piccoli cambiamenti a luci, cilindri, ombre o parametri prima che esista un **master artistico approvato**. CI PASS è necessario, non sufficiente.

## C. Strumenti scelti e rispettive responsabilità

| Uso | Strumento / risorsa | Scelta |
|---|---|---|
| Master artistico, materiali e illuminazione | **Blender**, versione fissata e verificata nel processo (la CI ha usato 5.0.1) | **Obbligatorio** |
| Organizzazione modelli modulari | **Blender Asset Browser**, raccolte e collegamenti, libreria di componenti della rotonda | **Obbligatorio** |
| Calibrazione prospettica | **fSpy** + importatore Blender, solo se le linee di fuga dell'immagine sintetica sono sufficientemente coerenti | **Facoltativo**, non impedisce D1 |
| Asset e materiali | **Poly Haven / ambientCG**, CC0 verificato per ogni elemento; altri solo con licenza di redistribuzione documentata | **Preferiti** |
| Anteprima artistica | Blender **Eevee** per iterazione e **Cycles** per fotogramma di approvazione | **Obbligatorio il render Cycles** |
| Precalcolo di illuminazione | Baking **Cycles** su UV dedicate, o incorporazione controllata nella resa dei materiali statici | **Sperimentare su campione prima dell'intera scena** |
| Formato interscambio | **glTF 2.0 / GLB**, asset, manifest, versione e impronta SHA-256 | **Obbligatorio** |
| Validazione | **Khronos glTF Validator** e ispezione immagini/estensioni/texture | **Obbligatorio** |
| Ottimizzazione | **glTF-Transform** (inspect, dedup, prune, join, texture resize); **gltfpack/meshoptimizer** in variante compatibile | **Solo dopo confronto A/B** |
| Fruizione | **Three.js r128 già presente in Atlas**, PR #152, senza aggiungere un nuovo motore | **Obbligatorio nella prima consegna** |
| Verifica browser | Chromium/Playwright, stesse camere, schermate 1280px, 390px, 320px; misure di peso e errori | **Obbligatorio** |
| Collaudo reale | Smartphone Android dell'ideatore; tempi d'ingresso, movimento, lettura, ritorno, fluidità | **Obbligatorio prima di UTILIZZABILE** |
| Tracciabilità | GitHub issues/PR, registro risorse e documenti ART-DIR-02/ART-PROD-01 | **Obbligatorio** |

**Compatibilità:** non presumere che la versione corrente di un addon o un'estensione glTF funzionino in Blender 5.0.1 e Three.js r128. Il banco di prova deve validare realmente loader, decoder, colori, UV e materiali. Se necessario, usare una variante **non compressa ma corretta** anziché cambiare motore. Non installare strumenti commerciali come prerequisito.

## D. Sequenza operativa e prove di uscita

### D0 — Congelare riferimento e contratto (mezza giornata)

**Realizzare:**
- Archiviare immagine originale, SHA e metadati di origine; registrare decisione «questa è l'immagine approvata».
- Estrarre una **scheda di composizione** dal fotogramma: asse centrale, ingombro relativo dei quattro pannelli, basamento, bordo del lucernario, linee prospettiche del pavimento, zone più luminose e zone d'ombra.
- Separare gli elementi **3D** (architettura, telai, pavimento, basamento) da quelli **2D funzionali** (etichette, icone, pulsanti e descrizioni).
- Confermare le rotte già presenti: `/curricolo/`, `/esplora/`, `/percorsi/`, `/esperienze/`. Nessun collegamento inventato a MUSEO ZERO.
- Individuare un unico responsabile artistico, un artista Blender/ambienti e un referente tecnico WebGL. I ruoli possono essere combinati da persone competenti; **non presumere già ingaggiato un professionista**.

**Prodotti:** riferimento versionato, registro risorse, scheda degli ingombri e contratto portali.
**Uscita G0:** origine del riferimento verificabile, camera di confronto definibile e rotte distinte dal modello.

### D1 — Calibrazione della telecamera + composizione neutra (1–1,5 giornate)

**Realizzare:**
- Tentare fSpy per prospettiva/campo di vista; se l'immagine sintetica contiene linee non coerenti, passare alla regolazione manuale mantenendo **camera e fotogramma fissi**.
- Costruire masse architettoniche **provvisorie**: rotonda a due livelli, grande lucernario, quattro portali ad arco, podio ellittico basso, profondità del pavimento. Geometria provvisoria SOLO per valutare composizione.
- Produrre `clay-hero-16x9.png`, `clay-side.png`, `clay-phone.png`, tutte dal medesimo master .blend; fissare le camere con nomi `CAM_HERO`, `CAM_SIDE`, `CAM_MOBILE`.
- Registrare camera, inquadratura, eventuale focal length e posizioni dei principali volumi. Non forzare misure arbitrarie dall'immagine.

**G1 — APPROVAZIONE COMPOSITIVA:** corrispondenza di sagome, rapporti e punto di vista; portali leggibili e disposti come nel riferimento; cupola dominante senza occultamenti; basamento proporzionato. Se non passa, correggere camera/masse **prima** di modellare dettagli.

### D2 — Scelta e assemblaggio dei componenti architettonici (1–2 giornate)

**Realizzare:**
- Comporre **un'unica libreria minima di asset**: moduli di parete/balcone, parapetti, pilastri, cornici lucernario, lastre/giunti pavimento, podio, telaio portale, vegetazione/vaso.
- Cercare modelli professionali riutilizzabili e materiali PBR CC0; **non modellare da zero ogni elemento**. Rifiutare asset stilisticamente incompatibili anche se gratuiti.
- Curare spessori, smussi, rapporti di scala, trasparenze e profondità delle aperture; usare istanze/riutilizzo per ripetizioni.
- Evitare di lasciare 200 oggetti separati per moduli identici nel derivato web: organizzare il master per possibili unificazioni/istanze.

**Prodotti:** `atlas-foyer-master.blend`, distinta CC0/licenze, vista architettonica con materiali neutri e inquadratura laterale.
**G2 — APPROVAZIONE ARCHITETTONICA:** vero edificio, non primitive; profondità anche vista di lato; elementi visibili coerenti con il riferimento. **Se il kit selezionato non raggiunge questo livello, cambiarlo**, senza passare settimane a correggerlo con la luce.

### D3 — Materiali e illuminazione professionali (2 giornate)

**Realizzare:**
- Materiali PBR distinti per pietra levigata, ottone satinato, metallo brunito, vetro e superfici emissive. Un unico sistema cromatico blu profondo + accenti caldi. Selezionare dettagli visibili nella camera HERO: nessuna microgeometria irrilevante.
- Illuminazione: cielo/lucernario freddo come principale, luci architettoniche calde secondarie, debole riempimento, ombre di contatto, riflessi sul pavimento. Fasci atmosferici coerenti nel render offline.
- Niente simulazione del fotorealismo con bloom e coni 3D opachi: luce, riflessi e materiali devono reggere **anche senza eccessiva postproduzione**.
- Fissare gestione colore, esposizione e trasformazione AgX in Blender, registrando i parametri per il confronto con WebGL.
- Ottenere `hero-cycles.png`, `side-cycles.png`, `mobile-cycles.png`, più un render «luce e superfici» per diagnosticare problemi.

**G3 — APPROVAZIONE ARTISTICA DETERMINANTE:** confronto **affiancato** immagine ART-DIR-02 / Cycles HERO con stessa inquadratura. Giudizio umano: architettura, composizione, lucernario/luce, materiali/riflessi, portali e basamento. Su scala 1–5: **nessuna area critica (architettura, composizione, illuminazione) sotto 4**; deve esserci approvazione esplicita dell'ideatore. **STOP se non approvato:** non convertire al web; cambiare prima risorse/composizione e produrre un nuovo master mirato, evitando micro-PR del runtime.

### D4 — Versione web della luce: prova su un campione (0,5–1 giornata)

**Problema da affrontare prima del GLB completo:** **Cycles e glTF/Three.js non rendono in modo automaticamente identico**. Le luci Area, il mondo, le riflessioni e l'illuminazione precalcolata richiedono un metodo esplicito.

**Realizzare un banco prova con SOLO** pavimento, una parte di parete/colonna, un portale e un accento bronzo:
- UV per base-color e **UV dedicate per luce precalcolata** dove necessarie.
- Verificare bake Cycles e inserimento nel materiale o nel runtime, **senza presumere uno slot lightmap automaticamente interpretato da GLB**.
- Provare ambiente/riflesso economico del pavimento in WebGL: env map e riflessi statici o selettivi (non SSR continuo come requisito mobile).
- Portali: vetro e bagliore con risorse emissive leggere; icone/titoli funzionali su un solo livello DOM accessibile; bersagli 3D interattivi derivati dal contratto.
- Confronto a **camera uguale**, registrando differenze di colore, contrasto e ombra.

**G4 — PROVA DI PARITÀ:** il frammento WebGL conserva il carattere del master senza costi eccessivi. Se no, sistemare la catena materiali/luce **in questo solo campione**.

### D5 — Derivazione e ottimizzazione del mondo Atlas (1–2 giornate)

**Realizzare:**
- Applicare al modello completo solo il procedimento G4 verificato.
- Esportare `foyer-authoring.glb` e `foyer-mobile.glb` (oppure varianti derivate), texture e manifest con SHA, dimensioni, licenze e telecamere.
- Eseguire glTF Validator; usare glTF-Transform `inspect`, `dedup`, `prune`, `join`; usare meshopt/gltfpack **solo se il runtime r128 decodifica correttamente quel formato**. Ispezionare le estensioni dichiarate come obbligatorie.
- Riutilizzare geometrie, ridurre materiali/mesh distinte, concentrare il dettaglio nel campo visivo dell'utente. Creare qualità modulabile (mobile/desktop) senza cambiare identità.
- Misurare peso per file, totale transfer, draw calls, texture GPU, tempi di caricamento e memoria.

**Budget iniziali di progettazione, NON risultati acquisiti:** **≤8 MB di trasferimento iniziale** come primo bersaglio; preferibile ≤5 MB se raggiungibile senza perdita artistica; **≥30 fotogrammi/s** in navigazione sul dispositivo Android di riferimento, con percentili dei tempi di fotogramma e nessun blocco significativo. Non dichiarare superato il test su un emulatore software; la PR biblioteca #148 aveva un riferimento ~14,6 MB da non riprodurre senza ragione.

**G5 — COMPATIBILITÀ:** la scena viene decodificata e renderizzata dal motore **esistente** senza errori, risorse mancanti o degradazione ingiustificata.

### D6 — Integrazione e verifica fedeltà 3D (1–1,5 giornate)

**Realizzare:**
- Inserire GLB/texture nel circuito esistente della **PR #152** con manifest verificabile; mantenere scena geometrica precedente soltanto come fallback tecnico, non come prodotto.
- Ricostruire camera iniziale dal master, evitare doppie etichette. Tutti i portali devono essere utilizzabili direttamente, mediante tocco e tastiera, con equivalenti HTML.
- Produrre tre confronti: `reference-vs-cycles`, `cycles-vs-webgl`, `webgl-desktop-vs-mobile`, stessa camera quando possibile.
- Verificare parallasse reale nella vista laterale, movimento controllato, ritorno alla camera HERO, click sui pannelli, rotte reali e scelta della destinazione. `Entra in Atlas` è invito all'esplorazione e **non** un collo di bottiglia.
- Gestire preferenza di movimento ridotto e fallback DOM senza WebGL.

**G6 — FEDELTÀ WEB:** l'utente riconosce **quell'atrio**, non uno nuovo; il risultato rimane realmente 3D; non si perdono portali, marchio, lucernario o identità materiale rispetto al master approvato.

### D7 — Collaudo fisico e decisione di prodotto (1–2 giornate)

**Realizzare:** apertura locale/autorizzata su Android, prova in verticale e orizzontale, navigazione e ritorno, confronto visivo con riferimento e versione desktop, caricamento a freddo e caldo, prova riduzione movimento, gestione perdita WebGL/connessione, leggibilità e raggiungibilità delle destinazioni. Annotare dispositivo/browser, fonte delle misure, versione SHA, screenshot e differenze.

**G7 — UTILIZZABILE:** qualità artistica confermata dall'ideatore, portali raggiungibili e stabili, peso/tempo/fluida fruizione documentati, fallback corretto. Qualunque modifica maggiore richiede nuovo confronto visivo, **non soltanto nuova CI**.

### D8 — Promozione controllata (senza scadenza automatica)

Solo con G0–G7 superati, eseguire revisione indipendente, piano di ripristino e autorizzazione separata per integrazione/anteprima e per eventuale ingresso `/` di Atlas. **Nessuna pubblicazione studenti implicita**. Il raccordo a MUSEO ZERO resta una consegna distinta, dopo conferma della rotta reale.

## E. Ruoli minimi: chi deve fare cosa

- **Direzione artistica (responsabilità continua):** mantiene ART-DIR-02 e il riferimento, sceglie/compara asset, blocca camere, valuta le immagini. Deve avere reale competenza di ambienti e visualizzazione architettonica, o avvalersi di una revisione umana competente.
- **Artista Blender di ambienti / illuminazione:** costruisce il master con modelli modulari, materiali, luce Cycles, bake e immagini di confronto. **È la capacità oggi più importante e non è dimostrata dai test CI esistenti**. Può coincidere con la figura precedente.
- **Artista tecnico Three.js:** traduce luce e risorse, ottimizza, misura e integra nel motore. Non ridefinisce da solo l'estetica.
- **Ideatore Atlas:** approva le viste G1/G3/G7, autorizza o blocca la pubblicazione.
- **AI e automazioni:** raccolta fonti/licenze, distinta risorse, generazione controllata di parti ripetitive, QA delle geometrie, screenshot A/B, integrità e stato. **Non sostituiscono il giudizio artistico o un artista esperto.**

Se non è disponibile un generalista Blender competente, **la prima attività è individuare una modalità concreta di esecuzione artistica** con le risorse gratuite ammesse; altrimenti la previsione temporale non è attendibile.

## F. Struttura dei file e fonti uniche

```
docs/atlas-gateway/
    ATLAS-GATEWAY-ART-DIRECTION-02.md   ← visione artistica vincolante
    ATLAS-GATEWAY-PRODUCTION-WORKFLOW-01.md ← questo piano
    ART-REFERENCE-MANIFEST.md           ← immagine, SHA, diritti, decisione
scripts/atlas-gateway-foyer/
    ...                                 ← codice runtime esistente, non duplicare
visual-factory/atlas-gateway/           ← proposta di cartella risorse (da attivare)
    source/
        atlas-foyer-master.blend
        reference-camera.json
    assets/
        LICENSES.md
        manifest.json
    renders/
        clay-hero.png
        hero-cycles.png
        mobile-cycles.png
    web/
        foyer-mobile.glb
        foyer-manifest.json
    evidence/
        comparison.json
        android-acceptance.md
```

**Nota:** i file binari voluminosi non vanno obbligatoriamente inseriti in Git ordinario; scegliere archivio/versionamento con identità SHA e link durevoli (ad esempio risorse di una release interna o deposito del progetto). Le cartelle elencate sono **struttura proposta**, non dichiarazione di file già presenti.

## G. Calendario realistico e regole di arresto

| Fase | Impegno indicativo |
|---|---:|
| D0 riferimento e contratto | 0,5 g |
| D1 camera e composizione | 1–1,5 g |
| D2 assemblaggio architettura | 1–2 g |
| D3 resa artistica e approvazione | 2 g |
| D4 prova precalcolo e parità | 0,5–1 g |
| D5 derivazione web | 1–2 g |
| D6 integrazione e confronto | 1–1,5 g |
| D7 Android reale | 1–2 g |

**Totale orientativo: circa 8–13,5 giornate operative**, per un **unico atrio** con asset di livello adeguato, disponibilità di competenza specialistica e senza nuovi servizi a pagamento. Non è una durata garantita né comprende una libreria intera, un mondo educativo completo o una direzione artistica illimitata.

**Regola di stop:** se al termine di D3 la composizione/render non superano il confronto ART-DIR-02, fermare il lavoro sul web. Fare un'unica diagnosi: (a) camera, (b) modelli, (c) luce/materiali. Correggere **la causa prevalente**, non aprire ulteriori filoni di ricerca. Se l'asset-first non funziona, risolvere l'effettiva disponibilità di competenza artistica prima di consumare altre settimane.

## H. Riesame strutturato e accettazione

**Scheda valutativa D3 / D7** — scala umana 1–5; registrare rilievi specifici:
- Architettura / credibilità spaziale, peso 25%.
- Composizione / camera / leggibilità, peso 25%.
- Luce / atmosfera, peso 20%.
- Materiali / riflessi / dettagli, peso 20%.
- Identità ATLAS / portali, peso 10%.

Tre criteri critici (architettura, composizione, illuminazione) **≥4/5 ciascuno**; approvazione esplicita dell'ideatore obbligatoria. Non inventare punteggi senza osservare i fotogrammi. La stessa valutazione va ripetuta sulla **vera scena web**, non soltanto sul Cycles.

Per ogni ciclo registrare in issue #151 e TRAMA #354: data, fase e **gate** superato o aperto, master/GLB SHA, immagini, misura peso e fluidità, 1 solo problema prioritario, prossima attività. Stati separati: **PROGETTATO / MASTER APPROVATO / WEB VERIFICATO / UTILIZZABILE / PUBBLICATO**.

## I. Rischi anticipati e soluzioni

1. **Immagine generata da AI non coerente prospetticamente:** fSpy è un aiuto opzionale; mantenere il fotogramma principale e progettare fisicamente superfici laterali credibili.
2. **Asset gratuiti non riutilizzabili liberamente:** licenza verificata elemento per elemento, priorità CC0 (Poly Haven, ambientCG). Evitare dipendenza da modelli con redistribuzione vietata.
3. **Render Blender superiore al web:** test di bake/UV/materiali e confronto sulla stessa camera **prima di esportare l'intera scena**.
4. **Luci e riflessi troppo pesanti su Android:** fonti statiche precalcolate, env map, dettagli localizzati; riflessioni approssimate ma credibili; disattivare effetti costosi prima di ridurre la geometria iconica.
5. **Compressione incompatibile con r128:** non attivare estensioni richieste senza decoder verificati; partire da GLB base valido.
6. **Mobile ridotto a ritaglio:** camera e composizione dedicate, porta principale e pulsanti HTML equivalenti, portali immediatamente accessibili.
7. **Cicli infiniti di perfezionamento:** massimo un master artistico per gate e revisione causale mirata; bloccare l'ottimizzazione finché la direzione artistica non è accettata.

## J. Prime due decisioni operative già chiare

**Prima consegna da realizzare (non nuova implementazione runtime):** D0+D1, con immagine originale archiviata, camera HERO e tre render **in grigio** di rotonda/lucernario/pannelli/podio. L'obiettivo è dimostrare **composizione fedele, profondità e scala**, non incrementare i PASS automatici.

**Seconda consegna:** D2+D3, cioè assemblaggio con componenti professionali, materiali/luce Cycles e render confronto A/B dall'immagine approvata. Senza l'approvazione di questo master **nessuna ulteriore fase WebGL deve essere dichiarata completata**.

## K. Fonti tecniche usate per questo workflow

- Blender 5.0 Asset Browser: https://docs.blender.org/manual/en/5.0/editors/asset_browser.html
- Blender Cycles baking: https://docs.blender.org/manual/en/4.5/render/cycles/baking.html
- Blender 5.0 gestione colore AgX: https://docs.blender.org/manual/en/5.0/render/color_management/displays_views.html
- fSpy e camera matching: https://fspy.io/
- Poly Haven, licenza CC0: https://polyhaven.com/license
- ambientCG, materiali: https://ambientcg.com/
- Khronos glTF Validator: https://github.com/KhronosGroup/glTF-Validator
- glTF-Transform (ispezione, join, dedup, resize): https://gltf-transform.dev/
- meshoptimizer / gltfpack: https://github.com/zeux/meshoptimizer
- Three.js GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
- Forum Three.js su luce/materiali/blender: https://discourse.threejs.org/t/how-to-export-correctly-from-blender-to-three-js/67469
- Forum Three.js su lightmap: https://discourse.threejs.org/t/question-about-pbr-and-lightmap/18909
- Forum Three.js su resa architettonica: https://discourse.threejs.org/t/achieving-realistic-ambience-in-architectural-three-js-scenes/89753

**Esito della redazione:** il piano e gli indicatori sono definiti; **non** costituiscono esecuzione delle giornate D0–D7 o prova che il prodotto finale sia già consegnato.
