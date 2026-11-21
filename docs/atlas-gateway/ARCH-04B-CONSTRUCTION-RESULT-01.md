# ATLAS ART-DIR-02 — ARCH-04B / Costruzione geometrica e collaudo reale
**Data:** 21 novembre 2026 · **Status:** `TECHNICAL_PASS / ART_NOT_APPROVED`  
**Fonte:** [ART-DIR-02 (JPEG canonico 1536×864)](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.  
**Contratto geometrico:** [ARCH-04 Geometry Project](./ARCH-04-ARCHITECTURAL-GEOMETRY-PROJECT-01.json) e [16 nodi](./ARCH-04-CONSTRUCTION-JOINTS-01.json).  
**Generatore:** [`build_architecture_04_geometry.py`](../../scripts/atlas-gateway-production/build_architecture_04_geometry.py) (derivato da ARCH-04 R2, non sostituisce il generatore precedente).  
**Procedura:** [`atlas-arch04-construction.yml`](../../.github/workflows/atlas-arch04-construction.yml).

## 1. Prove reali
- Esecuzione **ARCH-04B R2**: [GitHub Actions #44868819041](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44868819041), commit `e5708034ef5bccf92d1c93eccf248c4acd71cf0b`: **PASS**. Il master originale è stato rigenerato senza alterazioni, il candidato `.blend` distinto è stato salvato e sono state prodotte **otto immagini** (HERO, SIDE, MOBILE, MOBILE_LEFT, MOBILE_RIGHT, TOP_ORTHO, FRONT_ORTHO, SIDE_ORTHO); hash SHA-256 di ogni immagine e del `.blend` registrati nella `architecture-receipt.json`.
- **322 mesh reali**, rispetto a **276** nella precedente ARCH-04 R2: **46 nuove mesh** nette; il numero è diagnostico e non misura di qualità artistica.
- **15 nodi del registro associati a geometrie**; `N-CAM-01` riguarda la calibrazione compositiva e non è un oggetto mesh. **`N-ENTRY-01` ha pareti laterali candidate, non una soluzione architettonica approvata**. Il programma conserva espliciti i due rilievi da approvare.
- Piano di calpestio della candidata rialzato di 0,04 BU in Z: estradosso nominale Z=0; quattro supporti reali ai piedi dei portali; tre elementi solidi ellittici di fondazione del podio; raccordi fra i pilastri e i due impalcati; canaline di posa dei vetri; ritorno della corona; un elemento continuo di ripartizione fra 18 nervature e 15 assi portanti; due brevi ritorni laterali a delimitare un ingresso centrale aperto.
- **ARCH-04B R1** [#44868572376](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44868572376) aveva salvato il `.blend` e cinque PNG, ma l'avvio delle tre viste ortografiche con Workbench aveva provocato un arresto per `libEGL.so.1` mancante. Il problema riguardava il renderer diagnostico in GitHub, non la geometria. Sostituito Workbench con Cycles a 4 campioni per le viste ortografiche; successo R2 con Cycles a 16 campioni per le prospettiche.

## 2. Conservazione e provenienza
- [**R2 — archivio originale e candidata, otto immagini, ricevute**](https://drive.google.com/file/d/1aaqZFB3Etg4IFjnb1qpOnI3C7HdUx4zH/view): ZIP conservato in Google Drive; artefatto Actions `14693200630`, dimensione compressa **9.842.458 byte**, digest `sha256:2d8cc48c4e6d222e354b829ede0fb55c5165905c47940969c00aae9eeab9e0c2`.
- [**R1 — archivio diagnostico parziale**](https://drive.google.com/file/d/1wBj915C8ABEAsvJpCw6bWtZwIL1Fh9fl/view) conservato senza sovrascritture.
- [**Confronto artistico con riferimento e tre viste geometriche**](https://drive.google.com/file/d/1scIV7Q68fslHxCICIe5xzroGfxfNjvfI/view).
- Candidate Blender R2 SHA-256 `f90a9b1edb3913895eebeafa10daaea8c88489de2b28093db36e675e9b2083e1`; master originale R2 SHA-256 `639b7b4182a20c84e49777aefdf6e65ffc0b6cb3deae0a9a3bdb49d9a089bf06`. Le impronte sono riproducibili dal registro di ricevuta e sono riferite agli artefatti di **quella esecuzione**, senza assumere identità hash fra master generati in esecuzioni diverse.

## 3. Confronto reale con il riferimento canonico
- L'errore medio assoluto sulle **16 coordinate normalizzate** dei quattro rettangoli portale in HERO resta **0,0124844**, pressoché invariato dalla candidata ARCH-04 R2. Questo preserva la disposizione circolare esistente, ma **non** dimostra fedeltà artistica.
- L'estremo inferiore del rettangolo proiettato dell'oculo in HERO è `y=0,06262` rispetto all'altezza totale, mentre il riferimento ART-DIR-02 mostra il suo tratto visibile fino a circa `y=136/864=0,1574`. Le due misure non sono una segmentazione accurata del cielo (il rettangolo dell'oculo Blender include la geometria proiettata, e in entrambi i casi il tetto è tagliato), ma confermano il **problema di composizione: apertura troppo alta/tagliata nel render**.
- La **vista dall'alto ortografica** mostra attualmente la superficie del cielo e della copertura, non una pianta sezionata del piano sottostante. Resta utile per verificare oculo e anello, ma **non sostituisce** PL-01 né una sezione Blender con mascheratura geometrica.
- FRONT_ORTHO e SIDE_ORTHO mostrano l'atrio e i volumi reali da più direzioni; non sono tagli booleani dell'edificio. Le sezioni progettuali vere restano le tavole vettoriali SE-01 e SE-02.
- I contenuti dei portali, la presenza luminosa del cielo, le gallerie e l'accuratezza dei materiali **non** raggiungono ancora il riferimento ART-DIR-02. Non modificare shader o luci finali per mascherare le discrepanze geometriche.

## 4. Decisioni e gate
**PASS tecnico:** file prodotti, 8 viste, geometrie esistenti, master conservato, archivio leggibile, nessun GLB runtime prodotto dalla fase ARCH-04B, nessuna pubblicazione.  
**NON APPROVATO artisticamente:** completamento della geometria nella HERO e ingresso anteriore, raccordi visibili e qualità del volume, valutazione umana ancora aperta.
**Prossima singola lavorazione:** `ARCH-04C CAMERA-FIT` su **cielo realmente visibile + corona oculo + quattro portali + silhouette podio + gallerie**, con confronto misurato per tutti gli elementi. Evitare nuove modifiche isolate del raggio oculo; non inserire ancora le immagini illustrative e i materiali definitivi dei portali.

**Divieti:** nessuna modifica di `main`, del sito studenti, delle destinazioni Curricolo/Esplora/Percorsi/Esperienze; nessuna approvazione implicita da CI. VIS-01 e WEB-01 rimangono bloccate dal gate ARCH-04.
