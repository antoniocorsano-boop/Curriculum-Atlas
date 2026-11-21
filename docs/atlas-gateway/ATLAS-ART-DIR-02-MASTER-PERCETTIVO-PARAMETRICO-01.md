# ATLAS ART-DIR-02 — MASTER PERCETTIVO PARAMETRICO 01

**Data:** 21 novembre 2026 · **Stato:** `METHOD_APPROACH_PROPOSED__NOT_A_NEW_BLENDER_MASTER`.  
**Funzione:** cambiare il criterio di ricostruzione, da struttura rigidamente regolare a **scenografia tridimensionale regolata sull'inquadratura canonica**. È un piano di sostituzione del metodo di lavoro, non una approvazione della geometria R8.

## 0. Identità e continuità (non ricominciare il lavoro)

- Immagine canonica immutabile [ART-DIR-02](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), 1536×864 JPEG, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.
- Inventario canonico [VISUAL-READING-02](./ATLAS-ART-DIR-02-VISUAL-READING-02.md), 26 elementi e 16 relazioni; non cancellare.
- Ultima base Blender prodotta: [R8-02, archiviata in Drive](https://drive.google.com/file/d/19JWBQ4DQG4a77YbsChtID7ZYFjZ9LUQU/view), master `atlas-art-dir02-r8-integrated-atmosphere.blend` SHA-256 `2d39c43e0690334ce40627266d083e78d4d4238d25a28d0aaec6be33ef6550f8`, [PR #168 in bozza](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/168). MASTER TECNICO, **non** MASTER ARTISTICO APPROVATO.
- [Confronto geometria percepita ART-DIR-02/R8](https://drive.google.com/file/d/1aYKVL5vQlBtqb1nb2DzJazTR2_sKkbx6/view), tavola originale di analisi con tracciamento **manuale e approssimativo**, non una calibrazione fotogrammetrica.
- Coordinamento tecnico [Curriculum-Atlas #154](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/154), [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354). Non eseguire merge né deploy.

## 1. Diagnosi: differenza fra scena plausibile e immagine artistica

Il JPEG è un'immagine sintetica artistica, non fotografia misurata di un edificio. Una sola vista 2D non determina univocamente focale, quota della camera, dimensione di ambienti e profondità delle vetrate. Inoltre elementi sintetici possono non condividere un unico sistema prospettico perfettamente consistente.

La differenza prioritaria **non** è l'intensità di emissione del vetro: nella R8 la sala ha meno altezza apparente, la galleria sembra vicina e chiusa, il podio comprime le quattro lastre e i portali centrali si toccano quasi visivamente.

**Prova manuale orientativa su due HERO della stessa proporzione 16:9:**

| Ancora della composizione | ART-DIR-02 1536×864 | R8 1152×648 | Interpretazione |
|---|---|---|---|
| Distanza apparente fra lato destro di «Esplora» e sinistro di «Percorsi» | ~95–100 px, circa **6,3% della larghezza** | ~5–12 px, circa **0,4–1%** | Aumentare il vuoto centrale agendo sulla distribuzione angolare/prospettica dei quattro ingressi |
| Quota superiore del vetro sinistro esterno | circa y=170, **19,7% dell'altezza** | circa y=210, **32,4%** | La lettura dei portali e dell'architettura è troppo bassa in R8: investigare altezza spaziale, camera e spessore dei piani, non spostare soltanto i testi |
| Bordo superiore del lucernario | Tagliato dall'inquadratura, oculo luminoso ma non dominante sulle fasce architettoniche | Ovale troppo regolare rispetto al rapporto cielo/volta del riferimento | La dimensione apparente dipende anche da camera e copertura: evitare di stimare il diametro metrico dal JPEG |
| Gallerie laterali | Molteplici piani arretrati, librerie calde in nicchie profonde, vetri sottili | Aperture regolari con prospetti ravvicinati e molto uniformi | Creare **profondità scenografica reale** con moduli visibili per sezioni, senza costruire infinite sale complete |

I contorni e le ancore sono **stime di lettura**, non misure analitiche. Prima di ottimizzare: annotazione manuale e accettazione del tracciato da parte dell'ideatore; registrare un intervallo di incertezza.

## 2. Nuova architettura del lavoro: tre sorgenti separate

**A. FOTOGRAMMA GUIDA:** ART-DIR-02 + ancore su immagine normalizzate `u=x/W`, `v=y/H`, in pixel e con grado di fiducia; 26 schede A01–A26, 16 relazioni. Non scrivere nuove caratteristiche nel solo prompt.

**B. MASTER SPAZIALE EDITABILE:** una copia verificata del master R8 + controlli centralizzati per layout camera, geometrie di sala, gallerie, portali e podio. Tutti gli asset e le luci rimangono veri oggetti/mesh/istanze, navigabili e revisionabili. Il sistema deve poter ripristinare la scena-base dalla copia immutata. **Da questo momento il vincolo rigido "non muovere mai le quattro radici" è un contratto delle prove R2–R8, non della futura ricostruzione prospettica; se le radici si muovono, occorre aggiornare e ricollaudare hotspot e accessi.**

**C. REGIA LUMINOSA PARAMETRICA:** sistema unico di luci fisiche, gruppi, profili e materiali, distinto sia dalla camera sia dai dati geometrici. La qualità del Cycles non si presume trasferita nel web.

## 3. Camera matching dalla singola immagine

1. Collocare ART-DIR-02 come sfondo camera senza modificarlo.
2. Stimare prospettiva con **fSpy** (strumento libero, [manuale](https://fspy.io/basics/), [importatore Blender](https://fspy.io/)) usando pochi spigoli credibilmente paralleli e linee di pavimento.
3. Verificare se i punti di fuga della sala, dei bordi delle gallerie e delle vetrate sono **compatibili fra loro**. fSpy assume una proiezione di tipo prospettico a foro stenopeico; può non risolvere un'illustrazione composita. **Non dichiarare calibrazione riuscita senza sovrapposizione soddisfacente.**
4. Bloccare inizialmente 4–8 ancore stabili (basamento dei quattro ingressi, chiave della cupola, linea galleria, bordo anteriore podio). Ottimizzare prima camera: altezza, distanza, focale, inclinazione e `shift_y`; poi altezza, raggio, profondità della sala.
5. Calibrare **l'obiettivo visivo** su fotogramma con pochi parametri e perdita pesata per ancore e silhouette, non con una media cieca dei pixel. Conservare sempre render neutro `clay` senza luci decorative.

## 4. Geometria scenografica e controlli

- **Involucro/altezza:** scala verticale della sala, quota occhio e sommità dei livelli, distanza gallerie, oculo e anello. Conservare un modello fisicamente plausibile per il percorso del visitatore.
- **Gallerie:** raggio primo/secondo livello, arretramento delle nicchie, apertura delle campate, spessore dei parapetti, frequenza e densità di scaffali solo dove il JPEG li rende visibili. **Evitare la ripetizione meccanica**: due o tre varianti controllate di campata su archi coerenti.
- **Portali:** raggio della curva e quattro angoli `theta_i` **non necessariamente equispaziati**; quattro profondità, due famiglie di altezza/curvatura, distanziamento centrale indipendente, inclinazione locale verso la camera, base unica per lastra. Le attuali radici in codice sono `x=[-4.8,-1.6,1.6,4.8]`, `y=[1.0,2.7,2.7,1.0]`, `yaw≈[-0.24,-0.08,0.08,0.24] rad` e **sono valori storici di R5, non il progetto definitivo della vista canonica**.
- **Podio:** ellissoide basso percepito, occlusione dei due vetri centrali, massimo ingombro proiettato, continuità degli anelli. Non ridimensionare tutto il podio per risolvere un problema di camera.
- **Fioriere/verde:** due famiglie CC0 originali, stessa tipologia di due vasi, peso visivo ai bordi, senza oscurare gli accessi. Non acquistare o cercare altri modelli.
- **Compromessi artistici:** silhouette e posizioni adattabili alla HERO, ma niente pannelli foto al posto di architetture, superfici fisicamente impossibili negli spazi navigabili o occlusioni incompatibili con l'accessibilità.

Gli ingressi e i loro contratti d'accesso rimangono **quattro oggetti semantici stabili**, anche se cambiano posizioni e rotazioni visive. La campata e la camera web devono essere ricollocate coerentemente.

## 5. Regia luminosa professionale, per gruppi indipendenti

| Gruppo di regia (nome proposto) | Tipo di luce / sistema | Parametri da esporre | Controllo anti-difetto |
|---|---|---|---|
| `L01_DAY_SKY` | cielo/ambiente e sorgente direzionale ampia sopra oculo | direzione, elevazione, colore, intensità, dimensione apparente | il cielo è il punto più luminoso, non una lampada opaca |
| `L02_ZENITH_VOLUME` | volume partecipante **localizzato**, sorgenti collegate | densità, anisotropia, raggio, decadimento e gradiente | niente sette cilindri identici, niente tende bianche uniformi |
| `L03_GALLERY_AMBER` | aree rettangolari nascoste nelle nicchie, eventuali profili IES sui punti focali | potenza, temperatura colore di partenza, distanza, selezione dei ricettori | rendere leggibili libri e piante, non balconate bianche |
| `L04_PORTAL_EDGE` | emissione da cornice fine + riflessi separati | luminanza percepita, colore e decadimento, base unica | vetro cobalto riconoscibile; oro raro, non doppie cornici |
| `L05_FLOOR_SPECULAR` | grandi sorgenti direzionali di riflesso, materiale Onyx originale | ampiezza della sorgente, angolo, rugosità della pietra, maschera di intensità | niente macchie bianche ovali identiche né falsi LED |
| `L06_PLANTS_PODIUM` | luci ambrate di taglio molto selettive e riempimento scuro | intensità, lato illuminato, diffusione, riflettività bronzo | fogliame e vasi leggibili, podio non cromato |
| `L07_NEGATIVE_FILL` | riduzione controllata della luce ambiente / quinte scure | contributo indiretto/riempimento e posizione di quinte | preservare il blu-notte senza spegnere gli accessi |

**Ordine dei test luce, a camera e geometria temporaneamente bloccate:** SOLO cielo → cielo + gallerie → + bordi vetri → + pavimento/podio → + atmosfera. Ogni gruppo si prova separatamente: non modificare insieme esposizione, intensità, colore e materiale.

**Funzioni Blender consolidate:**
- **Light Groups** e passaggi luce/compositore consentono di modificare il contributo di gruppi senza rifare necessariamente l'intero render: https://docs.blender.org/manual/en/4.5/render/layers/passes.html
- **Light Linking** limita l'influenza a ricettori dedicati (feature Blender, non contratto web): https://docs.blender.org/manual/en/4.5/render/lights/light_linking.html
- **Profili IES** per realismo nelle distribuzioni delle sorgenti puntuali, non per cielo: https://docs.blender.org/manual/en/4.5/render/shader_nodes/textures/ies.html
- **Principled Volume**, scattering e anisotropia della foschia localizzata: https://docs.blender.org/manual/en/4.5/render/shader_nodes/shader/volume_principled.html
- **AgX/OpenColorIO**, esposizione e regolazione del contrasto nella gestione cromatica: https://docs.blender.org/manual/en/4.5/render/color_management.html
- **Node Groups, Geometry Nodes, Drivers** come ingressi riutilizzabili: https://docs.blender.org/manual/en/4.5/interface/controls/nodes/groups.html e https://docs.blender.org/manual/en/4.5/animation/drivers/drivers_panel.html

Le sorgenti, la riproduzione e la colorimetria vanno verificati nella **stessa versione eseguibile Blender** installata nel laboratorio, evitando differenze di implementazione fra varianti.

## 6. Pannello di controllo e contratto parametrico

**Non un nuovo algoritmo che cambia alla cieca 200 costanti nei file R2–R8.** Creare un unico `ATLAS_ART_PARAMS` (custom properties su Empty/Scene), gruppi di nodi con ingressi esposti e script di applicazione Python con validazioni. Il documento di parametri accompagna il master `.blend` e resta sorgente leggibile; ogni test salva esattamente la configurazione usata.

Un **registro iniziale, candidabile e non eseguito** è in [PARAMS-01.json](./ATLAS-ART-DIR-02-PERCEPTUAL-PARAMS-01.json). I valori di prova non sono misure reali del JPEG. Gli slider importanti sono: altezza, ampiezza, profondità, focale, inclinazione, separazione centrale, rotazioni/quote delle quattro lastre, ampiezza relativa oculo, profondità delle nicchie, sette gruppi luce, riflettanza vetri/pavimento.

**Strategia di ottimizzazione:** piccoli insiemi di configurazioni controllate e riconoscibili. **Scomporre** camera → volume globale → archi/portali → luci → materiali; non variare tutto a ogni rendering. Acquisire vista HERO, maschere silhouette, profondità e passaggi luce, confrontare ancore con errore in pixel, esaminare qualità fotografica con un revisore umano, scartare automatismi che inseguono solo la somiglianza cromatica.

## 7. Separazione Cycles dalla biblioteca web leggera

La scena cinematografica non è direttamente un documento WebGL. **Blender/glTF non esporta come tali le Area Lights e la luce World**, e i volumi atmosferici/Light Linking di Cycles non si trasferiscono fedelmente nel GLB. Fonte: https://github.com/KhronosGroup/glTF-Blender-IO/blob/main/docs/blender_docs/scene_gltf2.rst ; supporto runtime di alcune estensioni in https://threejs.org/docs/pages/GLTFLoader.html.

Due prodotti derivati dallo stesso asset parametrico:
1. **Master di direzione artistica Cycles**: scena completa regolabile, luci, atmosfera, archivio dei passaggi e render di verifica.
2. **Derivato web performante**: modelli e materiali PBR semplificati, luci precalcolate (*baking*) sulle architetture statiche, pochi punti luce veri, riflessi approssimati/precalcolati per vetro e metallo, texture compresse KTX2, istanze e risorse caricate su richiesta. Fonti: https://docs.blender.org/manual/en/4.5/render/cycles/baking.html ; https://threejs.org/docs/pages/KTX2Loader.html ; https://threejs.org/manual/pages/optimize-lots-of-objects.html .

**Lettura prestazionale corretta:** qualità visiva HERO separata da tempo di caricamento, memoria, fluidità e accessibilità reali sul telefono. La grafica «Entra in Atlas» rimane un elemento dell'interfaccia web accessibile e non va inserita come mesh Cycles.

## 8. Protocollo di avvio in tre prove vere, senza nuovi cicli infiniti

1. **GATE P1 — Anatomia della prospettiva:** sei-otto ancore e una camera plausibile, confronto `clay` ART-DIR-02/R8/nuova scena **senza materiali**. L'unico risultato richiesto è una sala percepita più alta e ampia, i livelli leggibili e un vuoto centrale fra Esplora e Percorsi in zona di ~6% della larghezza (intervallo non rigido).
2. **GATE P2 — Geometria da scena cinematografica:** solo dopo P1, riposizionare i quattro ingressi sul nuovo arco parametrico, verificare i loro quattro ancoraggi/accessi e il rapporto con il podio; conservare versioni e geometria R8.
3. **GATE P3 — Illuminazione riutilizzabile:** montare sette gruppi luce sopra una sola scena non distruttiva. Prima i contributi isolati, poi il composito; usare IES e volume dove effettivamente aiutano. Confrontare l'immagine intera e le zone secondo l'inventario 02. Da P3 ottenere primo derivato web su **una sola campata** per misurare le prestazioni.

**Arresto:** se P1 non conferma che la prospettiva può essere ricostruita con una camera coerente, non continuare a ritoccare la cupola: passare a geometria scenografica locale con dichiarazione delle discrepanze artistiche. Nessuna fusione in main, pubblicazione o nuovi costi obbligatori senza apposita autorizzazione.
