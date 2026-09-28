# ATLAS-SMART-PUBLISH-ADAPTER-01 — Adattatore di pubblicazione canonica

**Stato:** Stage A / contratto. Nessuna nuova infrastruttura o credenziale autorizzata.

## Scopo

Collegare il workflow delle Attività smart al meccanismo di pubblicazione materiali già presente in Atlas, senza creare un secondo deposito e senza elevare i canali di preview a pubblicazione student-facing.

Catena canonica:

`SmartActivityPlan → normalize → register → public/materials → canonical Atlas build/deploy → verify-public → receipt → apply-receipt → MaterialSet readiness`

## Superficie canonica degli asset

Gli asset pubblicabili delle Attività smart DEVONO usare la superficie esistente `public/materials/` e il contratto MAT-PUB. `public/activity-packages/` può contenere i pacchetti che collegano attività e risorse, ma non sostituisce l'identità dell'asset.

Il percorso logico pubblico resta `/materials/...` e DEVE essere deterministico. Il nome locale del file non è identità canonica.

## Separazione preview / pubblicazione

I workflow `atlas-pr-preview*` sono esclusivamente superfici di anteprima e NON DEVONO:

- produrre una receipt `atlas.smart.asset-receipt/v1` valida per readiness;
- impostare `studentAuthorized=true` per effetto del solo successo della preview;
- promuovere `packageReady=true`;
- essere trattati come origine canonica di `publicRef`.

Una URL di preview può essere usata per collaudo visuale, mai come evidenza di pubblicazione definitiva.

## Adattatore

L'adattatore riceve un `AssetRecord` verificato e produce una richiesta di pubblicazione MAT-PUB coerente con:

- `materialId` ← identità stabile dell'asset;
- `checksum` ← SHA-256 dei byte;
- `filesize` ← dimensione dei byte;
- `mimeType` ← media type verificato;
- `sourceProvenance` ← provenienza ricostruibile;
- `publicPath` ← percorso deterministico sotto `/materials/`;
- `publicationState` iniziale ← `CANDIDATE`.

L'adattatore NON produce da solo una receipt finale.

## Condizione di pubblicazione effettiva

La pubblicazione diventa utilizzabile da una Attività smart soltanto dopo che una build/deploy Atlas **canonica e autorizzata** ha reso disponibile il `publicPath` sulla superficie pubblica ufficiale.

Solo allora `smart:asset:verify-public` può verificare HTTP, byte e digest e produrre la receipt. La receipt viene quindi applicata al Material Set tramite `smart:asset:apply-receipt`.

## Fail-closed

In assenza di una base URL canonica Atlas o di una distribuzione autorizzata:

- l'asset resta `CANDIDATE`;
- `publicRef` resta irrisolto;
- nessuna receipt finale viene emessa;
- una risorsa required mantiene il pacchetto non pronto.

Non è consentito sostituire la base URL canonica con una preview per superare il gate.

## Idempotenza

Per lo stesso `assetId + version + digest`, una nuova esecuzione DEVE riusare il percorso pubblico già assegnato. Un digest differente richiede una nuova versione o una sostituzione esplicita; non può sovrascrivere silenziosamente un asset già pubblicato.

## Esperienza docente

Il docente non interagisce con MAT-PUB, path, digest o deploy. Il sistema espone solo lo stato didatticamente utile:

- `Pronto`;
- `Pubblicazione in corso`;
- `Da completare`;
- `Da rivedere`.

Dettagli tecnici sono disponibili solo in diagnostica.

## Autorizzazione runtime

Questo contratto non sceglie né autorizza un provider di deploy. La qualificazione del deploy canonico Atlas è una decisione infrastrutturale separata. L'adattatore resta provider-neutral e riusa `public/materials/`, MAT-PUB e i comandi Smart già implementati.