# ART-DIR-02 — Verifica del primo confronto Blender sul riferimento canonico

**Data:** 21 novembre 2026  
**Sorgente attiva:** [immagine canonica scelta dall'ideatore](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view?usp=drivesdk), JPEG 1536×864, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.  
**PR:** [#152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152), in bozza, non pubblicata.  
**Esecuzione Blender:** [44861820315](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44861820315), conclusa **SUCCESS**.  
**Archivio A/B Blender + GLB + master + ricevute:** [Drive](https://drive.google.com/file/d/1behe0DEmuawqnvB_nJd8ZCA6QgmqLZQw/view?usp=drivesdk), metadati verificati (5.470.191 B).  
**Tavola 4 immagini:** [Drive](https://drive.google.com/file/d/1ZeAPK6cCx_O6J51CgijIiQjGAQYNqCsp/view?usp=drivesdk).

## 1. Fatti dimostrati

- Il modello Blender attuale, **non** ancora approvato come master artistico, è stato aperto e renderizzato con Cycles da una procedura automatizzata.
- La candidata A modifica **soltanto la camera**; la candidata B modifica **camera e disposizione/larghezza dei portali** in una copia di calcolo della scena. Non vengono riscritti il file master `.blend`, la geometria GLB e le rotte pubbliche.
- La verifica del nuovo eseguibile ha superato produzione delle due immagini, checksum e ricevuta, validazione GLB, e prova della pagina WebGL.
- La misura dei rettangoli apparenti dei portali sulla foto canonica registra 88,76 px di errore iniziale, 35,20 px per la camera sola e 16,51 px per la combinazione camera + spaziatura. **Questi numeri non qualificano l'architettura nel suo insieme.**

## 2. Giudizio artistico sulle immagini reali

| Variazione | Risultato osservato | Decisione |
|---|---|---|
| Master precedente | Quattro portali visibili, ma ambiente stilizzato, cupola e lucernario non fedeli; podio troppo alto | NON APPROVATO |
| Candidata A — camera sola | Accresce le dimensioni apparenti dei portali, ma taglia il podio e indebolisce la composizione del lucernario | NON ADOTTARE |
| Candidata B — camera e disposizione | Quattro portali più ordinati nella stessa inquadratura, podio più completo, ma il reale lucernario e i due livelli architettonici restano assai diversi dal riferimento; illuminazione/materiali ancora schematici | SOLO IPOTESI PER PROSSIMO RILIEVO, NON APPLICARE AL MASTER |

**Priorità correttiva:** ricalibrare **insieme** camera e volumi dell'oculo, basamento basso ellissoidale e rotonda a due livelli. Non si deve aumentare la luminescenza o aggiungere decorazioni per mascherare la geometria errata. I simboli e i titoli dei portali devono restare leggibili, con un'unica famiglia di materiale e bordo sobrio.

## 3. Elementi della sorgente misurabili

Sul JPEG canonico 1536×864, secondo il [rilievo manuale](./ART-DIR-02-CANONICAL-LANDMARKS.json):
- Quattro portali per circa 17–18% di larghezza ciascuno, con centri distribuiti in due coppie simmetriche; basi dei due centrali parzialmente nascoste dal podio
- Podio comprensivo di anelli: circa 54% della larghezza dell'immagine, basso e allungato; il modello attuale non ne riproduce proporzioni e curvatura
- Oculo visibile nella fascia superiore, ampio e parzialmente fuori campo, con cielo e raggi; non un semplice disco scuro in fondo alla volta
- Due livelli con balconate, parapetti, pilastri e ambienti retrostanti sulle pareti curve

Queste sono **misure visive approssimative**, non dimensioni metriche deducibili da un fotogramma sintetico.

## 4. Svolgimento del prossimo ciclo architettonico

1. Modellare il **basamento come calotta ellissoidale bassa** e ampia, anelli coerenti, marchio aderente.
2. Modellare l'**oculo di diametro e posizione prospettica coerente**, mantenendo lo scorcio del cielo reale e la struttura di vetro leggera.
3. Completare il **secondo livello della rotonda** e la profondità architettonica laterale, evitando l'aggiunta di dettagli superflui.
4. Tarare camera e posizioni portali sulle *nuove* geometrie, non applicare i numeri B senza rifare la proiezione.
5. Confrontare nuove HERO/SIDE/MOBILE e **solo se artisticamente qualificate** trasporre al runtime WebGL con misure sullo smartphone.

**Stato:** `REFERENCE_ARCHIVED=PASS`, `CAMERA_EXPERIMENT=PASS`, `ART_DIR_02_ARCHITECTURAL_FIT=NOT_APPROVED`, `STUDENT_RELEASE=false`.
