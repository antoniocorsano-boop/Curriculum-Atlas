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