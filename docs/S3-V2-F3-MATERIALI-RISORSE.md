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
