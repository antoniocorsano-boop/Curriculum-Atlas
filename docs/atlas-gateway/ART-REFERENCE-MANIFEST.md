# ATLAS ART-DIR-02 — Registro dell'immagine di riferimento

**Stato:** identità e metadati verificati, **file binario da depositare** in una posizione permanente e accessibile al progetto.

- **Titolo:** Atrio Atlas — immagine artistica di riferimento approvata nella conversazione del 20 novembre 2026.
- **File verificato:** `atrio_futuristico_atlas_della_conoscenza.png`
- **Formato:** PNG
- **Dimensioni:** 1672 × 941 px (orizzontale, vicino a 16:9)
- **Dimensione file:** 2.288.614 byte
- **SHA-256:** `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`
- **Origine dichiarata:** immagine Atlas generata nel contesto della conversazione e selezionata come riferimento per ART-DIR-02.
- **Funzione:** riferimento **compositivo/artistico** della vista iniziale (rotonda a più livelli, lucernario circolare, fasci luminosi, quattro portali, basamento ATLAS, riflessi del pavimento).
- **Controllo:** non sostituire il riferimento con un'altra generazione, screenshot ricampionato o versione corretta senza nuova decisione esplicita.
- **Fatto da completare:** archiviazione del PNG originale in archivio versionato autorizzato, registrazione della posizione stabile e verifica della stessa impronta. Il percorso locale della conversazione non è un identificatore GitHub permanente.
- **Tracciabilità / diritti:** mantenere informazioni sull'origine generativa e verificare eventuali condizioni applicabili all'uso e distribuzione delle risorse derivate.

## Relazioni

- [ART-DIR-02 — Direzione artistica corrente](./ATLAS-GATEWAY-ART-DIRECTION-02.md)
- [ART-PROD-01 — Processo esecutivo](./ATLAS-GATEWAY-PRODUCTION-WORKFLOW-01.md)
- [ATLAS-GATEWAY-01 issue #151](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/151)
- [TRAMA AWC-DELIVERY-01 #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354)

## Verifica comparativa del 20 novembre 2026 — riconciliazione del riferimento

**Decisione tecnica di conservazione:** usare il **PNG originale, 1672×941**, già identificato qui, come sorgente artistica canonica ad alta risoluzione. L'immagine **reinviata successivamente dall'ideatore** rappresenta la **stessa composizione visiva** e viene conservata come conferma di scelta, non come secondo progetto artistico.

- File reinviato: nome locale `1000088971.png`, ma contenuto binario **JPEG**, 1536×864 pixel, 224.170 byte.
- SHA-256 del JPEG reinviato: `cce6bb9d670376e1b75558136b220a71095d15b64843bf1ba89cc9432d3d2cb8`.
- Confronto delle immagini ridimensionate entrambe a 384×216: **differenza media assoluta per canale 1,317/255**, 99° percentile 7/255. Risultato coerente con ridimensionamento e compressione: *i file binari differiscono*, ma l'orientamento artistico non è in conflitto.
- **Non** aggiornare i controlli dell'orchestratore alla impronta JPEG mentre il PNG originale rimane la versione canonica. Il controllo attuale `preflight.mjs` sul PNG è coerente.
- **Blocco ancora aperto:** il file PNG fisico **esiste nel contesto di lavoro della conversazione** ma non è ancora stato acquisito come risorsa binaria **persistente** nel repository o in un archivio versionato autorizzato. Questo registro non lo sostituisce.

Il master sarà confrontato con il **PNG canonico** e non con una ricostruzione compressa o una nuova generazione.

---
**Nessun modello tridimensionale né alcuna sua approvazione è implicato dal presente registro.**
