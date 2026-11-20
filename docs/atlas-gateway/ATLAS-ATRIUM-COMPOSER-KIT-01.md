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

## Evidenze produttive successive (20 novembre 2026)

- [ATLAS-3D-SEED-VIEWS-01](./ATLAS-3D-SEED-VIEWS-01.md): **prove prospettiche da GLB reale** e registrazione dei difetti architettonici e delle telecamere; [configurazioni sperimentali](./ATLAS-CAMERA-DIAGNOSTIC-02.json). Le immagini reali e il loro generatore sono nel [Drive](https://drive.google.com/file/d/1Fsv_KDX4S_pFmlR941Curp_0_iOH35bF/view).
- [ATLAS-ATRIUM-BLUEPRINT-02](./ATLAS-ATRIUM-BLUEPRINT-02.json) e [ATLAS-ATRIUM-3D-SEED-02](./ATLAS-ATRIUM-3D-SEED-02.md): prima **revisione geometrica reale** dopo i difetti osservati; GLB, tre viste e report in [Drive](https://drive.google.com/file/d/1AqK_L45BYeWVZ6cn3RdM-swIxEvzB0HN/view). Non risolve ancora la qualità artistica né sostituisce ART-DIR-02.
- [Procedura Blender autonoma](../../.github/workflows/atlas-atrium-seed-blender.yml): codice di esecuzione reale su GitHub Actions **salvato e letto**, ma senza evidenza acquisita del suo esito nella conversazione attuale. Nessuna affermazione di aver già generato `.blend` o render Cycles.

**Decisione di proseguimento:** i prossimi interventi produttivi devono risolvere la geometria della copertura e calibrare l'inquadratura HERO sul PNG canonico. Evitare di scambiare la correzione del campo visivo per l'approvazione artistica.

## Avanzamento effettivo — SEED-03, 20/11/2026

**Geometria prodotta, non approvata:** [ATLAS-ATRIUM-3D-SEED-03](./ATLAS-ATRIUM-3D-SEED-03.md) con [BLUEPRINT-03](./ATLAS-ATRIUM-BLUEPRINT-03.json), [evidenze](./ATLAS-ATRIUM-3D-SEED-03-evidence.json), [generatore](../../scripts/atlas-gateway-production/generate-atrium-seed-03.py) e [importatore Blender](../../scripts/atlas-gateway-production/import-atrium-seed-03-blender.py).

- **308 mesh**, **62.652 triangoli**, GLB **885.152 byte**, SHA-256 `7ac7ef7de6560ffa53f952df9634ca78037a6ba8b9e121a5d1a5b41c825f10ba`.
- **Archivio verificato** [Drive — SEED-03](https://drive.google.com/file/d/1qmY_CtiOjOdrAxDlJXvbgibdCfxU5nSP/view), 2.508.885 byte, SHA-256 `4fefb233c93cf021a14ebd35808472c67ae22a57748920292f3295560bee7c17`.
- Il confronto con SEED-02 è stato eseguito con la **stessa camera HERO**: la fascia geometrica anteriore che occultava il lucernario è stata eliminata creando un vero ingresso frontale aperto.
- La modifica introduce una rotonda **non chiusa a 360°** verso l'ingresso: scelta ipotetica da validare sulla foto definitiva e sulle altre viste.
- Immagini reali **VTK da GLB**, non render Blender. [Workflow Blender SEED-03](../../.github/workflows/atlas-atrium-seed-03-blender.yml) salvato ma **nessuna esecuzione ancora verificata**.
- **Blocco persistente:** il PNG canonico a quattro portali (SHA `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`) è stato inviato in altra chat, ma i byte non sono ancora accessibili al ciclo di confronto; non inventare calibrazione, fedeltà fotografica o approvazione.

**Prossima soglia di avanzamento:** `.blend` e tre render reali da Blender verificati; acquisizione dei byte canonici e correzione delle geometrie su ART-DIR-02. Nessun merge/deploy.


## Studio alternativo — Gateway ibrido 2D/3D (20 novembre 2026)

L'ideatore ha proposto una soluzione a **fondale fotografico/architettonico 2D con soli quattro portali 3D interattivi**. La proposta è stata tradotta in uno **schema reale salvato in SVG**, con studio di fattibilità e criteri di verifica:

- [ATLAS-GATEWAY-HYBRID-01.md](./ATLAS-GATEWAY-HYBRID-01.md): stratificazione, clean plate, maschere, interazioni e confronto con il 3D completo;
- [ATLAS-GATEWAY-HYBRID-SCHEMA-01.svg](./ATLAS-GATEWAY-HYBRID-SCHEMA-01.svg): schema vettoriale apribile e riutilizzabile.

**Stato:** sola ipotesi; nessun codice di prodotto ibrido, nessun fondale modificato, nessuna revisione ART-DIR-02 approvata. Non cancellare il master 3D/SEED-03, conservare distinte le due alternative finché la qualità visiva, navigazione e compatibilità non saranno confrontate. L'immagine originale ART-DIR-02 resta necessaria e attualmente non acquisita in byte nel deposito produttivo.


## Ingresso web effettivamente implementato (20 novembre 2026)

Il percorso ibrido non è più soltanto una tavola o un esperimento con quattro pulsanti non collegati. La **radice reale `/` dell'app Next.js** è stata trasformata in una **pagina scenografica a schermo pieno**, dotata di quattro destinazioni effettive, CTA Esplora, marchio A e microinterazioni. La realizzazione è nel ramo di sviluppo collegato alla PR #152, non integrato in main né pubblicato.

- [Documento di implementazione, fonti, identificativi delle immagini e prove browser](./ATLAS-GATEWAY-ENTRY-WEB-01.md)
- [Codice della pagina](../../src/app/page.tsx), [componente interattivo](../../src/features/atlas-gateway/atlas-entry.tsx), [stili responsive](../../src/features/atlas-gateway/atlas-entry.module.css)
- [5 risorse binarie effettivamente versionate](../../public/atlas-gateway-entry/plate-prova.jpg), derivate dalla dimostrazione precedente (non dalla fotografia canonica ART-DIR-02)
- [GitHub Actions — prove reali desktop/mobile PASS](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44811398372)
- [Drive — archivio permanente delle schermate del navigatore](https://drive.google.com/file/d/14xziEYMMsBjGeHUcblYRbJObdZKpxysN/view)

**Non dichiarare conclusa la qualifica artistica:** il fondale usa inpainting da una generazione dimostrativa, i portali sono ancora porzioni di immagine trasformate via CSS, non mesh. Il sistema è tecnicamente utilizzabile per la navigazione interna alla prova, ma richiede approvazione dell'ideatore e sorgente ART-DIR-02 definitiva prima di pubblicare agli studenti.
