# S3-V2/F3 — Materiali + Risorse: integrazione publisher asset

**Data:** 2026-09-23  
**Stato:** PROPOSED / IMPLEMENTATION CONTRACT  
**Riferimento canonico TRAMA:** `ATLAS-MAT-PUB-01`  
**Decisioni collegate:** TRAMA-ADR-008 · TRAMA-ADR-010 · TRAMA-ADR-013

## Scopo

F3 deve trasformare la superficie Materiali da semplice catalogo a superficie pubblica affidabile per asset didattici realmente pubblicati, mantenendo Atlas statico, privacy-first e senza introdurre un DAM/CMS obbligatorio.

## Principio

Atlas non decide se un materiale debba essere pubblicato.

Il percorso tecnico adottato da F3 è:

`asset approvato → validate → optimize → manifest → commit → deploy → smoke test → receipt`

La decisione editoriale resta esterna alla pipeline tecnica.

## Perimetro F3

F3 implementa progressivamente:

- browser pubblico classe → disciplina → lezione;
- asset realmente apribili;
- metadati risorsa;
- preview;
- stato editoriale;
- provenance;
- URL pubblici stabili;
- verifica del deploy;
- receipt tecnica;
- supporto a ritiro/sostituzione.

## Substrato asset

Gli asset pubblici restano versionati nel repository Atlas.

Pattern iniziale:

```
public/materials/<YYYY-MM-DD>/<class-or-grade>/<discipline>/<asset-slug>.<ext>
```

Formati preferiti:

- SVG per schemi e infografiche vettoriali;
- WebP per immagini raster;
- AVIF opzionale;
- PNG/JPEG come sorgente o fallback.

## Normalizzazione raster

La normalizzazione proposta usa **Sharp** o equivalente compatibile con Node per:

- ridimensionamento;
- conversione WebP/AVIF;
- rimozione metadata non necessari;
- lettura dimensioni;
- checksum;
- eventuali thumbnail.

Sharp non attribuisce alcuna autorità editoriale: è un trasformatore tecnico deterministico.

## Metadati minimi

Il modello F3 deve poter rappresentare almeno:

- `materialId`;
- `lessonId`;
- `disciplineId`;
- contesto classe/grado minimizzato;
- `title`;
- `kind`;
- `alt`;
- `mimeType`;
- `width` / `height`;
- `filesize`;
- `checksum`;
- `sourceProvenance`;
- `publicPath`;
- `publicationState`;
- `commitSha`;
- `publicUrl`.

## Vincoli

- nessun dato personale studente;
- nessun EXIF di localizzazione non necessario;
- nessun identificativo registro pubblico;
- nessuna pubblicazione implicita;
- nessuna seconda autorità curricolare;
- nessun DAM/CMS completo richiesto;
- nessun runtime Docente OS → Atlas autorizzato da questo documento.

## Gate

### Automatici

- typecheck/lint/build;
- manifest valido;
- formato ammesso;
- file pubblico presente;
- checksum;
- smoke test URL;
- deploy identity.

### Umani

- leggibilità;
- correttezza didattica;
- alt text;
- qualità visuale;
- smartphone/LIM;
- diritti/licenze;
- decisione di pubblicazione.

## Sequenza di implementazione

### F3-A — Asset model
Schema e validator.

### F3-B — Image normalization
Sharp + WebP + metadata stripping + checksum.

### F3-C — Material publisher
Path/naming + manifest + idempotenza.

### F3-D — Deploy verification
Smoke test + receipt + rollback test.

### F3-E — Public UX
Preview, metadata, apertura asset, ritiro/sostituzione.

## Riferimento autorevole

La specifica completa non è duplicata in questo repository.

Fonte canonica:
`trama-ecosistema/docs/contracts/atlas-mat-pub-01.md`

Decisione architetturale:
`trama-ecosistema/docs/decisions/trama-adr-013-atlas-git-first-media-publication.md`

Finché TRAMA-ADR-013 resta `PROPOSED`, questo documento è un contratto implementativo proposto e non promuove da solo il runtime cross-product.


## MAT-PUB-B — Image normalization · IMPLEMENTED

Il normalizzatore raster build-time è implementato in `scripts/normalize-image.mjs`.

Contratto corrente:

- input ammessi: JPEG, PNG, WebP, AVIF;
- decoder in modalità restrittiva (`failOn: warning`);
- limite pixel in ingresso;
- correzione orientamento;
- ridimensionamento entro budget senza enlargement;
- conversione a sRGB;
- output WebP;
- metadata EXIF/XMP/IPTC rimossi;
- checksum SHA-256 dell'output;
- budget massimo del file risultante;
- self-test CI con sorgente sintetica che contiene EXIF e verifica la sua rimozione.

Dipendenza: `sharp@^0.35.4`.

MAT-PUB-B non effettua commit, deploy o pubblicazione e non modifica il controllo editoriale. Il passo successivo resta MAT-PUB-C — Repository publisher.

## F3-E — Modello pubblico Risorse / Materiali

La superficie pubblica distingue due oggetti che non devono essere confusi:

- **Risorsa Atlas**: oggetto editoriale riusabile, catalogabile e collegabile al curricolo;
- **Materiale pubblicato**: elemento effettivamente reso disponibile nel contesto di una specifica lezione.

Una Risorsa Atlas non diventa materiale per il solo fatto di esistere nel catalogo. Il legame nasce solo quando la risorsa viene pubblicata nel contesto classe + disciplina + lezione. Restano inoltre ammessi materiali pubblicati direttamente per una lezione senza inventare una Risorsa Atlas corrispondente.

### Superficie `/risorse`

Espone il catalogo editoriale con filtri per disciplina e tipologia, metadati di accessibilità e diritti, ordine di scuola, periodo di aggiornamento, collegamenti curricolari e numero di lezioni pubbliche che riusano la risorsa.

### Superficie `/materiali`

Conserva il percorso pubblico:

`classe → disciplina → lezione → materiali pubblicati`

Ogni materiale può dichiarare l'origine da una Risorsa Atlas, un URL pubblico reale dell'asset quando disponibile, oppure la pubblicazione diretta per la lezione.

Il substrato MAT-PUB e il modello prodotto F3 sono complementari: MAT-PUB governa validazione, normalizzazione e pubblicazione tecnica degli asset; F3 governa la presentazione pubblica e la distinzione semantica tra catalogo e materiale di lezione.

### Autorità e confini

- Arena resta l'autorità curricolare;
- Atlas non introduce una seconda autorità sugli obiettivi;
- Docente OS resta il luogo di preparazione, contesto e decisione docente;
- nessuna sincronizzazione live Arena → Atlas è attivata da F3;
- nessuna pubblicazione runtime Docente OS → Atlas è attivata da F3;
- nessuna adozione o approvazione automatica;
- nessun account, profilo o tracking studente.

### Criteri di accettazione F3-E

- differenza Risorsa / Materiale comprensibile direttamente nella UI;
- `/risorse` navigabile e filtrabile;
- `/materiali` organizzato per classe, disciplina e lezione;
- materiali reali MAT-PUB ancora apribili;
- origine Atlas tracciabile quando presente;
- materiali diretti rappresentabili senza risorsa fittizia;
- metadati accessibilità e diritti visibili;
- nessun overflow orizzontale su mobile e desktop;
- build, typecheck, lint, gate TRAMA e gate visuale F3 PASS.


## Vision Alignment — Mockup V2

F3 adotta la baseline TRAMA **Atlas Mockup V2 — Vision Alignment** senza ampliare il proprio scope.

In questo slice:
- la lezione è il contesto pubblico dei materiali;
- Risorsa Atlas e Materiale pubblicato restano oggetti distinti;
- il curricolo può condurre a lezioni e materiali senza trasformare Atlas in una cartella di file;
- `LearningActivity` resta una reference implementation sperimentale separata e **non è un exit criterion F3**;
- nessun runtime Docente OS → Atlas è autorizzato;
- nessun account o tracking studente viene introdotto.

Il prototipo ATLAS-PERCHÉ resta su una PR separata e non viene assorbito da questo riallineamento.


### Regola trust-state

Il catalogo non può mostrare come verificati stati non supportati da evidenza.

In particolare:
- presenza nel catalogo = `Catalogata`, non automaticamente `Pubblicata`;
- accessibilità = `Da verificare` finché non esiste evidenza specifica;
- diritti/licenza = `Diritti da verificare` finché non esiste una fonte o receipt;
- il conteggio delle lezioni indica un collegamento pubblico, non prova da solo lo stato editoriale o i diritti della risorsa.

La UI deve evitare badge positivi sintetici basati su fixture o assunzioni.
