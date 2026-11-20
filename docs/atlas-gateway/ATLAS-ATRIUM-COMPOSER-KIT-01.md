# ATLAS-ATRIUM-COMPOSER-KIT-01 — Indice e contratto dello strumento riusabile

**Data:** 20 novembre 2026. **Stato:** **DOCUMENTAZIONE VERSIONATA**. Non confondere con un'applicazione installata, con un generatore già eseguito o con un Master Blender già realizzato.

## I documenti effettivamente presenti
1. [ATLAS-PROMPT-ART-01](./ATLAS-PROMPT-ART-01.md) — prompt artistico integrale fornito dall'ideatore; riferimento semantico, non attestazione del testo interno storico.
2. [ATLAS-GEO-SPEC-01](./ATLAS-GEO-SPEC-01.md) — trasposizione in requisiti geometrici e artistici, con ipotesi esplicitate.
3. [ATLAS-COMPOSER-SEED-01](./ATLAS-COMPOSER-SEED-01.json) — parametri relativi iniziali `R`, quattro portali, tre telecamere, nessuna misura geometrica certificata.
4. [ATLAS-VALIDATION-01](./ATLAS-VALIDATION-01.md) — criteri e prove per fedeltà 2D, realtà 3D, estetica e WebGL.
5. [ATLAS-WORKFLOW-REALIZATION-01](./ATLAS-WORKFLOW-REALIZATION-01.md) — flusso di produzione/approvazione della scena.
6. [IMAGE-GEOMETRY-01](./IMAGE-GEOMETRY-01.md) — specifica della ricostruzione dal PNG canonico; provenienza ARENA/Atlas distinta.
7. [MASTER-BLENDER-01](./MASTER-BLENDER-01.md), [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md) e [ASSET-KIT-01](./ASSET-KIT-01.md) — vincoli artistici, authoring e riuso degli asset.

## Priorità delle fonti

**Immagine ART-DIR-02** > **direzione artistica ART-DIR-02** > **prompt artistico fornito dall'ideatore** > **ipotesi e seed**. Le misure che non risultano dal PNG sono ipotesi progettuali, da validare e versionare.

## Ingressi e uscite contrattuali

**Ingressi:** PNG originale approvato 1672×941 e SHA-256 `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`; prompt; specifica e seed; risorse 3D professionali con diritti verificati.

**Uscite attese, NON ancora prodotte:** `atlas-foyer-master.blend`, piante e sezioni, `hero-cycles.png`, `side-cycles.png`, `mobile-cycles.png`, `geometry-evidence.json`, confronto immagine/Blender, `atlas-foyer-web.glb`, manifest e prove Android.

## Uso in ogni nuova sessione
1. Riaprire questo indice dal ramo esatto GitHub.
2. Recuperare il PNG dai byte archiviati e verificare la SHA.
3. Riutilizzare prompt/spec/seed e aggiornarli **solo con nuova evidenza e versionamento**.
4. Comporre un modello e produrre prove reali, non nuove dichiarazioni di completamento.
5. Registrare blocchi ed esiti nei piani [Atlas #151](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/151) e [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354).

**Avvertenza di stato:** questo indice fissa metodi e documenti, non chiude il P0-REF e non dimostra esecuzione Blender, approvazione, integrazione o pubblicazione.

## Consegna operativa #1 — Tavola parametrica reale (20 novembre 2026)

La prima consegna, **[ATLAS-ATRIUM-BLUEPRINT-01](./ATLAS-ATRIUM-BLUEPRINT-01.md)**, è stata **generata, verificata e salvata**. Non è soltanto un progetto descritto in chat.

- [Pianta, sezione A–A e schema 4 portali SVG](./ATLAS-ATRIUM-BLUEPRINT-01.svg) — file vettoriale sorgente.
- [Parametri geometrici e camere](./ATLAS-ATRIUM-BLUEPRINT-01.json) — R normalizzato, scelte iniziali con provenienza; modifica della seed conservata come override, non sovrascrittura.
- [Misure/coordinate e controlli geometrici](./ATLAS-ATRIUM-BLUEPRINT-01-measures.json) — dati generati e verificati; portali non sovrapposti in pianta.
- [Generatore Python riproducibile](../../scripts/atlas-gateway-production/render-blueprint.py) — codice che produce la tavola direttamente dal JSON, non una dichiarazione di possibilità.
- [Archivio Drive dell'intera consegna](https://drive.google.com/file/d/1VsGEd-SWirx1Xp64qbq24IoZYAVg8dMY/view) — ZIP con SVG, PNG, JSON, misure, istruzioni e generatore; SHA-256 del pacchetto `89295144502da996a341e20103999884cb8a90bb057bdcd71d49dae6540e5b2c`.

**Prove effettuate:** JSON interpretabile, script compilato ed eseguito con Python, XML/SVG valido, quattro portali e tre telecamere, simmetria e intersezioni in pianta. **Non superati:** camera fitting sul PNG canonico, vera scena Blender e approvazione artistica. Nessuna pubblicazione studenti.

## Regola di conservazione permanente adottata

**Ogni nuova consegna del compositore deve diventare un insieme di file riproducibili:** documentazione e dati/script nel ramo di lavoro GitHub; immagini e pacchetti binari nel deposito persistente con collegamento al repository; salvataggio verificato tramite rilettura e impronta; link e stato registrati su [Atlas #151](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/151) e [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354). **Non** qualificare come prodotto un file che è solo progettato o rimasto nei temporanei della chat.


## Produzione effettiva — ATLAS-ATRIUM-3D-SEED-01 (20/11/2026)

**Artefatto realizzato, diverso da un Master Blender:** un GLB con **308 mesh e 68.796 triangoli**, 979.996 byte, **riaperto e verificato** dopo esportazione, tutte le mesh non vuote e chiuse. Il primo modello 3D contiene rotonda, due gallerie, lucernario con apertura reale, podio convesso, quattro pannelli fisici distinti, scaffalature e vegetazione. Le geometrie sono derivate dalle **ipotesi** del Blueprint-01, non dai pixel dell'immagine ART-DIR-02.

- [Documento e limitazioni](./ATLAS-ATRIUM-3D-SEED-01.md)
- [Rapporto JSON della geometria](./ATLAS-ATRIUM-3D-SEED-01-evidence.json)
- [Generatore riproducibile Python](../../scripts/atlas-gateway-production/generate-atrium-seed.py)
- [Passaggio a Blender / 3 telecamere / render Cycles](../../scripts/atlas-gateway-production/import-atrium-seed-blender.py)
- [Pacchetto **persistente Drive**, contenente GLB, sorgenti, JSON e anteprima](https://drive.google.com/file/d/1kHp7LNSyU4nHAt1yLqDWDy5vkOqpLpJp/view); ID Drive `1kHp7LNSyU4nHAt1yLqDWDy5vkOqpLpJp`, **685.215 byte**, rilettura dei metadati riuscita.
- SHA-256 GLB: `2800580409408efae6cc9181354a622959aee67ffb6620531f1db1e0b40b6ddf` e SHA-256 ZIP `1dd10ab8c18fcfd3d40159daeec3e6261df7d1f33bef2c1695d7ca4b7dce07b1`.

**Prove superate:** export/rilettura GLB, 4 portali distinti, chiusura di ogni mesh, 3 camere nel JSON, script Python sintatticamente validi. **NON eseguito:** importazione con Blender, salvataggio di `.blend`, rendering Cycles, confronto con PNG canonico, approvazione artistica, test WebGL/Android. L'ambiente locale non disponeva di Blender e l'installazione non è riuscita.

**Prossimo ingresso:** eseguire lo script Blender su un runner dotato di Blender e acquisire il PNG canonico, senza sostituirlo con ARENA 5 portali o Biblioteca Atlas 3 portali; poi effettuare la calibrazione mediante sintesi/confronto. Il lavoro appena salvato è un prototipo geometrico, non un risultato fotorealistico.
