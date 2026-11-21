# ATLAS-ATRIUM-3D-SEED-01 — Prima geometria tridimensionale effettiva

**Data:** 20 novembre 2026. **Stato:** scena GLB generata e verificata; file `.blend` e render Cycles non ancora prodotti in questo ambiente. **Non approvata** rispetto al riferimento visivo ART-DIR-02, non pronta per la pubblicazione Web.

## Fonti e distinzioni

- Input: `ATLAS-ATRIUM-BLUEPRINT-01.json`, riferito al prompt integrale dell'ideatore e alla specifica geometrica.
- Quattro portali ordinati: Curricolo, Esplora, Percorsi, Esperienze.
- Quote geometriche in unità **R (raggio atrio = 1)**, non in metri fisici certificati.
- L'immagine finale di riferimento `atrio_futuristico_atlas_della_conoscenza.png`, SHA-256 `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`, **non è stata utilizzata come input binario**: è un modello 3D ipotetico, non una ricostruzione calibrata sui pixel.
- Le geometri*e* sono **vere triangolazioni in uno spazio tridimensionale**: due gallerie, pareti di rotonda, lucernario aperto, costolature, pavimento, basamento convesso, quattro lastre curve solo agli angoli (prime superfici di progetto), scaffalature e vegetazione volumetrica.
- I portali sono **pannelli arrotondati piani nello spazio e disposti tangenzialmente all'arco**, con una leggera possibilità di variazione angolare della collocazione: la curvatura intrinseca dei singoli pannelli deve ancora essere introdotta nel master artistico.

## Rigenerare il GLB

```bash
python generate_atrium_seed.py ATLAS-ATRIUM-BLUEPRINT-01.json ./output
```

`generate_atrium_seed.py` usa `numpy`, `trimesh` e `matplotlib` (solo per la figura tecnica). Legge unicamente il Blueprint JSON. Produce:

- `ATLAS-ATRIUM-3D-SEED-01.glb`: modello tridimensionale originale, apribile in Blender, con mesh nominative;
- `ATLAS-ATRIUM-3D-SEED-01-evidence.json`: SHA-256, ingombri, numero triangoli, coordinate e controlli; verifica di lettura dopo esportazione GLB;
- `ATLAS-ATRIUM-3D-SEED-01-technical-view.png`: proiezione tecnica delle triangolazioni, **non** un'immagine fotorealistica.

## Convertire a Blender reale

```bash
blender -b --factory-startup --python import_seed_to_blender.py -- \
  --glb output/ATLAS-ATRIUM-3D-SEED-01.glb \
  --blueprint ATLAS-ATRIUM-BLUEPRINT-01.json \
  --output output/blender --render --samples 12
```

Lo script importa il GLB e attribuisce materiali provvisori, aggiunge vere luci e telecamere HERO/SIDE/MOBILE e salva un vero `atlas-atrium-3d-seed-01.blend` modificabile. Con `--render` esegue tre render Cycles **di prova** e scrive il rapporto di esecuzione. Il presente archivio NON comprende un `.blend` né immagini Cycles generate, perché Blender non era disponibile nel runtime che ha prodotto il GLB; non dichiarare esiti non eseguiti.

## Qualità e vincoli operativi

Il prodotto è **un prototipo geometrico**: non rispecchia ancora l'immagine finale ART-DIR-02 e non sostituisce MASTER-BLENDER-01. Le superfici sono materiali-segnaposto, luci non tarate, geometrie ancora semplificate. Un'immagine di anteprima tecnica non può validare la direzione artistica.

Il file GLB non è pubblicato né collegato alle rotte utente Atlas. Va verificato nello specifico runtime Three.js e su Android **solo dopo** il completamento del ciclo artistico e l'approvazione separata.

## Verifiche effettuate

- Rigenerazione da Blueprint JSON, controlli 4 portali e 3 telecamere nella configurazione.
- GLB scritto su disco e riaperto indipendentemente con trimesh; ingombri e triangoli coincidono.
- Tutte le mesh confermate non vuote e chiuse; nessun modello bidimensionale travestito da GLB.
- Script di importazione Blender compilato con Python standard (controllo sintattico), ma **non eseguito in Blender**.
- Configurazione di produzione e documentazione da versionare nello stesso ramo GitHub, con hash SHA e copia binaria persistente.

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
