# ATLAS-SMART-ASSET-01 — Asset delle Attività smart

**Stato:** Stage A / contratto, nessun runtime autorizzato

## Scopo

Definire un percorso stabile, semplice e riusabile per collegare i materiali didattici alle Attività smart Atlas senza imporre al docente operazioni Git, calcolo di digest, gestione di path tecnici o duplicazione degli upload.

Flusso canonico:

`materiale prodotto → asset binario → deposito pubblico Atlas → verifica → material set → Attività smart`

## Confini

Questo contratto riguarda esclusivamente gli asset delle **Attività smart Atlas**. Non modifica Atlas Percorsi, non promuove contenuti ad autorità curricolare e non crea un nuovo canale verso Docente OS. Il trasporto verso Docente OS resta `LessonPreparationManifest.materialSlots`.

## Identità dell'asset

Ogni asset pubblicabile DEVE avere:

- `assetId` stabile;
- `version` esplicita;
- `sha256` calcolato sui byte effettivi;
- `byteSize`;
- `mediaType`;
- `audience` (`STUDENT`, `TEACHER`, `BOTH`);
- `provenanceRef` ricostruibile;
- `publicRef` solo dopo pubblicazione verificata.

Il nome locale del file non costituisce identità canonica.

## Deposito e deduplicazione

Il percorso pubblico DEVE essere deterministico e indipendente dal nome locale. Due asset con lo stesso digest NON DEVONO essere duplicati inutilmente. L'implementazione può usare un deposito content-addressed o un meccanismo equivalente, purché la deduplicazione sia verificabile e il contratto resti indipendente dallo storage concreto.

## Verifica e ricevuta

La pubblicazione è valida soltanto se:

1. i byte pubblicati producono il `sha256` dichiarato;
2. `byteSize` e `mediaType` sono coerenti;
3. `publicRef` è raggiungibile secondo l'audience prevista;
4. per `STUDENT` e `BOTH`, quando il materiale è destinato alla fruizione pubblica, il riferimento è verificato senza autenticazione;
5. la provenienza è ricostruibile;
6. viene prodotta una ricevuta di pubblicazione riferita alla stessa identità/versione/digest.

Una ricevuta minima contiene:

```yaml
schemaVersion: atlas.smart.asset-receipt/v1
assetId: string
version: integer
sha256: sha256:<hex>
byteSize: integer
mediaType: string
audience: STUDENT | TEACHER | BOTH
provenanceRef: string
publicRef: string
anonymousReachabilityVerified: boolean
verifiedAt: RFC3339
```

## Aggiornamento del material set

Il `material-set` NON DEVE assumere `packageReady: true` per la sola presenza dei byte sorgente.

Per ogni risorsa `required: true` devono essere presenti e coerenti almeno:

- digest verificato;
- provenienza;
- `publicRef` reale;
- ricevuta valida;
- raggiungibilità conforme all'audience.

Se uno di questi elementi manca o non coincide, la pubblicazione resta **fail-closed**.

## Esperienza docente

Il docente non deve conoscere GitHub, path, manifest o digest. Le azioni operative ammesse devono essere comprensibili nel contesto didattico:

- **Riprova** la pubblicazione;
- **Sostituisci** il materiale;
- **Escludi** una risorsa non obbligatoria.

Una risorsa obbligatoria non risolta non può essere esclusa per aggirare il controllo.

## Compatibilità

Il contratto deve funzionare con hosting statico/Pages e consentire in futuro la sostituzione del deposito senza modificare il contratto delle Attività smart.

## SP-01 — evidenza pilota

Il pilota `sistema-tecnologico` dispone già dei byte verificati delle due infografiche obbligatorie:

- metodo/automobile — 481619 byte — `sha256:f337f4300af0fb3997eceeec377bc2919c8bf584333306cb44f7a12aed79cbf3`;
- smartphone — 506219 byte — `sha256:26374b368336a16d583f43d67fa0256faee062ec67bfcaafe5729e4eb868c546`.

Questa evidenza elimina la necessità di richiedere o rigenerare i file, ma NON equivale a pubblicazione. SP-01 resta non pronto finché `publicRef` e ricevute non sono reali e verificati.

## Non autorizzato in Stage A

Questo documento non autorizza:

- nuova API di upload;
- nuovo database;
- nuovo storage runtime;
- credenziali o segreti aggiuntivi;
- adattatori Docente OS;
- promozione automatica dei contenuti;
- merge automatico della PR pilota.

Qualunque runtime successivo richiede una decisione separata e controlli dedicati.