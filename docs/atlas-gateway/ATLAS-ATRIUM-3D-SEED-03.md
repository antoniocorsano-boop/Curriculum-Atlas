# ATLAS-ATRIUM-3D-SEED-03 — Revisione della copertura e delle gallerie

**Data:** 20 novembre 2026.  
**Stato:** **geometria reale GLB e viste di prova prodotte e verificate**; **non** è il Master Blender approvato né un render Cycles.  
**Ramo di lavoro:** `work/atlas-gateway-01-foyer` (PR Atlas #152).  
**Fonti:** [prompt artistico integrale](./ATLAS-PROMPT-ART-01.md), [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md), [specifica geometrica](./ATLAS-GEO-SPEC-01.md), [revisione precedente](./ATLAS-ATRIUM-3D-SEED-02.md).

## 1. Obiettivo ed esito effettivo

La vista precedente [SEED-02](./ATLAS-ATRIUM-3D-SEED-02.md) era dominata da una **fascia opaca orizzontale della galleria anteriore**, che impediva di leggere simultaneamente lucernario, portali e podio. Muovere soltanto la telecamera non aveva risolto la causa geometrica.

**Modifica realizzata:** le due gallerie e la copertura diventano **settori architettonici posteriori**, con ingresso frontale aperto; non vengono eliminate facce solo in postproduzione. La copertura resta una vera mesh a doppia superficie, con spessore e settore reale; l'oculo rimane un'apertura geometrica reale. Sono mantenuti **quattro portali distinti** e il nucleo convesso Atlas. Questo è un **candidato con ingresso monumentale aperto**, non un'intera rotonda chiusa a 360°: l'eventuale completamento architettonico sarà deciso dal riferimento canonico e dalle viste laterali.

## 2. Parametri e versione

- **[ATLAS-ATRIUM-BLUEPRINT-03.json](./ATLAS-ATRIUM-BLUEPRINT-03.json)** — dati di scena, quattro portali, tre camere e ipotesi di architettura; deriva dalla v2, senza sovrascrivere v1/v2.
- **[generate-atrium-seed-03.py](../../scripts/atlas-gateway-production/generate-atrium-seed-03.py)** — generatore riproducibile della geometria autentica e del file GLB.
- **[import-atrium-seed-03-blender.py](../../scripts/atlas-gateway-production/import-atrium-seed-03-blender.py)** — importatore della v3 per produrre un vero `.blend` e tre viste Cycles in un esecutore Blender. **Programma predisposto, ma l'esecuzione Blender non è stata certificata da questa verifica.**

Coordinate: unità **R**, raggio normalizzato della rotonda; nessuna misura in metri dedotta dall'immagine. Angoli portali: **−42°, −14°, +14°, +42°**. Altezza portale: **0,60 R**. Raggio apertura sommitale candidato: **0,55 R**. Camera HERO candidata: **(0; −1,32; 0,18) R**, bersaglio **(0; 0,2; 0,66) R**, campo visivo orizzontale **80°**.

## 3. Prove eseguite: modello 3D autentico

| Controllo | SEED-02 | SEED-03 | Evidenza |
|---|---:|---:|---|
| Mesh reali | 308 | **308** | Esportazione/rilettura con Trimesh |
| Triangoli | 68.796 | **62.652** | Report dal file GLB riletto |
| Portali distinti | 4 | **4** | Nomi distinti e verifica di scena |
| Ingresso anteriore | Gallerie e tetto continui | **Apertura architettonica** | Generatore v3, viste VTK |
| Ingombro superiore | Fascia scura dominante | **Fascia frontale rimossa** | Confronto visivo VTK **con identica CAM_HERO** |
| `.blend` e Cycles | Da verificare | **Non ancora eseguito in Blender** | Nessun render Cycles dichiarato |

- **GLB SEED-03:** `ATLAS-ATRIUM-3D-SEED-03.glb` — **885.152 byte**, SHA-256 `7ac7ef7de6560ffa53f952df9634ca78037a6ba8b9e121a5d1a5b41c825f10ba`.
- **GLB SEED-02** rigenerato dai parametri della versione precedente (stesso SHA della v2 già archiviata): SHA-256 `51f280aea8a9e57b4759317a112c170096701eed6b1a1d1b5f5bd3710dcb93a1`.
- **Confronto geometrico con CAM_HERO identica:** `ATLAS-ATRIUM-SEED-02-vs-03-SAME-CAMERA.png`, SHA-256 `e3bb0d89e0c5c303df8db303242245c0fdfa7786840a844802b11719c28ae144`. Esame indipendente della geometria anziché confronto con camere diverse.
- **Viste reali VTK dal GLB:** HERO 1280×720, SIDE 1280×720, MOBILE 720×1120. Non sono immagini generate da un servizio 2D e non attestano la qualità Blender.
- **Verifica di consistenza:** nessuna mesh vuota/non chiusa, quattro lastre portale, centro e due gallerie, tre camere configurate nel JSON.

## 4. Diagnosi artistica (non approvazione)

Il rapporto fra lucernario e portali migliora grazie all'eliminazione della fascia anteriore; nella prova a parità di camera la nuova parte superiore è leggibile. Tuttavia:

1. Il lucernario non mostra ancora il **cielo reale** con nuvole e luce zenitale; il colore scuro della vista è un materiale provvisorio.
2. I portali non presentano ancora gli elementi grafici definitivi, cornici e illustrazioni professionali.
3. La configurazione non è calibrata sui pixel del **PNG canonico ART-DIR-02 a quattro portali**, ancora non presente come byte autentici nella filiera attuale.
4. L'apertura anteriore del volume è una scelta architettonica candidata: va validata sul modello navigabile e nell'inquadratura originale. Nessun falso grado di certezza sulla prospettiva.
5. Non sono ancora state eseguite le prove Cycles, Android fisico e collegamento runtime WebGL per questa versione.

## 5. Riproduzione

Con Python, NumPy, Trimesh e Matplotlib:

```bash
python scripts/atlas-gateway-production/generate-atrium-seed-03.py \
  docs/atlas-gateway/ATLAS-ATRIUM-BLUEPRINT-03.json ./out
```

In un ambiente con Blender (verificare gli strumenti installati):

```bash
blender --background --factory-startup --threads 2 --python-exit-code 1 \
  --python scripts/atlas-gateway-production/import-atrium-seed-03-blender.py -- \
  --glb out/ATLAS-ATRIUM-3D-SEED-03.glb \
  --blueprint docs/atlas-gateway/ATLAS-ATRIUM-BLUEPRINT-03.json \
  --output out/blender --samples 6 --render
```

La catena non promuove automaticamente questa scena nella [filiera ART-DIR-02](./ATLAS-GATEWAY-CLOSED-LOOP-02.md) né pubblica contenuti per gli studenti.

## 6. Deposito permanente e prossimo controllo

Archiviare il GLB, i parametri, il generatore, le viste, il confronto a camera costante e i rapporti con SHA in Drive/ GitHub. **Non modificare il PNG di riferimento canonico.** Prossimo controllo prioritario: eseguire il compositore nel vero ambiente Blender e acquisire il PNG originale definitivo per misurare i landmark dell'immagine; solo allora può cominciare la verifica ART-DIR-02 reale.
## 7. Archivio persistente verificato

- **[Drive Curriculum Atlas — SEED-03, sorgenti e tre viste](https://drive.google.com/file/d/1qmY_CtiOjOdrAxDlJXvbgibdCfxU5nSP/view)**, file ZIP **2.508.885 byte**. Google Drive ha confermato il caricamento e la successiva rilettura dei metadati.
- SHA-256 del pacchetto: `4fefb233c93cf021a14ebd35808472c67ae22a57748920292f3295560bee7c17`.
- L'archivio contiene GLB, versione autonoma del generatore, programma d'importazione Blender, sorgenti parametriche, rapporti, manifest con SHA e tre immagini VTK; i sorgenti di GitHub sono organizzati come variante incrementale che riusa il generatore base.
- **Workflow predisposto** [SEED-03 Blender](../../.github/workflows/atlas-atrium-seed-03-blender.yml): rigenera GLB, controlla l'identità SHA e richiede Blender reale, `.blend` e tre render. **All'ultima verifica non risultava alcuna esecuzione di questo workflow associata al commit di creazione.** Non attestare né `.blend` né render Cycles fino a riscontro di artefatti reali.

