# ATLAS-ATRIUM-BLUEPRINT-01 — Prima tavola geometrica parametrica dell'atrio a quattro portali

**Data:** 20 novembre 2026  
**Stato:** **TAVOLA DI PROGETTAZIONE REALIZZATA — NON TARATA SULL'IMMAGINE**  
**Vincolo artistico:** ART-DIR-02; **origine semantica:** ATLAS-PROMPT-ART-01; **base geometrica:** ATLAS-GEO-SPEC-01 e ATLAS-COMPOSER-SEED-01.

## Consegne reali

- **[Tavola SVG](./ATLAS-ATRIUM-BLUEPRINT-01.svg)**: pianta iniziale, sezione assiale A–A e disposizione ideale dei quattro portali. Contiene geometrie vettoriali modificabili e non un render sintetico.
- **[Configurazione JSON](./ATLAS-ATRIUM-BLUEPRINT-01.json)**: parametri a scala relativa, ordine e natura dei portali, camere, ipotesi e differenze versionate rispetto alla seed precedente.
- **[Rapporto delle coordinate](./ATLAS-ATRIUM-BLUEPRINT-01-measures.json)**: baricentri tridimensionali, angoli, vertici in pianta, distanze tra portali e esito delle verifiche automatiche.
- **Generatore riproducibile:** `scripts/atlas-gateway-production/render-blueprint.py` legge il JSON e produce SVG e rapporto; programma eseguibile con Python standard, senza Blender.

**Attenzione:** l'immagine originale approvata a quattro portali è identificata nel manifesto ART-REFERENCE-MANIFEST ma non ancora disponibile come byte al processo; quindi la tavola non è un rilievo fotogrammetrico né prova di fedeltà ART-DIR-02. Nessun vero Master Blender è stato creato in questa consegna.

## Sistema di coordinate

Origine O=(0,0,0) al centro della rotonda sul pavimento finito. +X verso destra per l'osservatore, +Y verso la parete posteriore, +Z verso l'alto. La **scala R = raggio della rotonda è relativa**, non in metri. La telecamera principale è all'esterno, dal lato Y negativo.

## Dimensioni della tavola (ipotesi esplicite, in R)

| Elemento | Parametro di progetto | Stato |
|---|---:|---|
| Rotonda | raggio **1,00 R** | ipotesi |
| Galleria | raggio interno **0,82 R** | ipotesi |
| Primo livello alto | **0,42 R** | seed conservata |
| Secondo livello alto | **0,78 R** | seed conservata |
| Cornice perimetrale copertura | **1,05 R** | ipotesi |
| Lucernario | raggio **0,34 R**, quota **1,35 R** | circolare nello spazio solo come candidato |
| Piattaforma centrale | raggio **0,30 R**, quota **0,03 R** | ipotesi |
| Podio convesso | semiassi **0,22 R × 0,18 R**; sommità **0,14 R** | ipotesi, non semisfera matematica certificata |
| Portali | 4, larghezza **0,16 R**, altezza **0,46 R**, spessore **0,02 R** | ipotesi |
| Arco posteriore dei portali | raggio **0,64 R** | ipotesi per distanziamento |
| Angoli dei portali | **−42°, −14°, +14°, +42°** dal semiasse +Y | ipotesi |
| CAM_HERO | (0; **−1,90 R**; **0,25 R**), bersaglio (0;0;0,61 R) | da calibrare con il PNG |
| CAM_SIDE | (1,65 R; −1,55 R; 0,62 R) | vista di verifica reale 3D |
| CAM_MOBILE | (0; −1,85 R; 0,29 R) | composizione dedicata, da verificare |

## Decisioni controllate e conflitti con la seed

La prima seed aveva portali a raggio 0,46 R, larghezza 0,18 R e angoli −34°, −12°, +12°, +34°. Il nuovo **scenario Blueprint-01** usa raggio 0,64 R, larghezza 0,16 R e angoli −42°, −14°, +14°, +42° per evitare portali addossati nella tavola preliminare. **La seed originale non è stata modificata**: sono varianti registrate nel JSON, non una correzione imposta all'immagine.

L'esatto profilo del podio, la circolarità reale del lucernario, le quote e la camera finale dovranno essere stabiliti in base alla fotografia canonica, non a questo schema.

## Verifiche realmente eseguite

- Generazione programmatica dell'SVG.
- Interpretazione XML/SVG riuscita; generata anche una copia PNG di consultazione.
- JSON valido e script Python compilabile.
- Invarianti: **4 portali**, ordine richiesto, simmetria angolare, **3 camere**.
- Test di intersezione fra impronte rettangolari ruotate nel piano (separating axis theorem): **nessuna sovrapposizione**.
- Distanza dei centri dei portali adiacenti: circa **0,30966 R** per ciascuna delle tre coppie.
- **NON ESEGUITI:** calibrazione prospettica sul PNG, render Blender, verifica artistica, un modello `.blend`, collaudo WebGL/Android.

## Trasferimento al compositore

1. Acquisire l'immagine originale ART-DIR-02, verificando SHA-256 `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`.
2. Rilevare i landmark e correggere il JSON con versione + provenienza.
3. Generare e verificare il **vero modello Blender** dal JSON (non estrarre una mesh dal file SVG).
4. Usare la stessa scena per tre render da CAM_HERO / CAM_SIDE / CAM_MOBILE, confrontare l'HERO e modificare camera/architettura/podio/portali.
5. Passare ai materiali e luci Cycles, approvare ART-DIR-02 e quindi derivare GLB per Atlas Web.

## Regola di persistenza

Ogni nuova tavola, variazione di parametri, script, rapporto o render qualificato viene salvato su un **ramo GitHub del progetto**, con nome, versione, data, SHA o commit, e rimando ai piani permanenti Atlas #151 e TRAMA #354. Le sorgenti binarie devono stare in deposito permanente con manifest di hash verificabile. Non presentare un file temporaneo della chat come unico archivio canonico.