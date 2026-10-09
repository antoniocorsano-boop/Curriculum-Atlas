# Arena → Atlas — sincronizzazione automatica del curricolo

## Modello runtime

Atlas non acquisisce mai autorità sul curricolo.

`release Arena → bundle pubblico di esportazione → watcher orario Atlas → PR di sincronizzazione governata → gate Atlas → merge umano`

Il watcher confronta:
- impronta strutturale;
- stato di autorità;
- revisione canonica della fonte.

Una variazione di uno qualsiasi di questi elementi apre o aggiorna l’unico branch `sync/arena-curriculum`.

## Regole di pubblicazione

### PROVISIONAL_COMPLETE

- il candidato può essere reso nella preview della PR per l’ispezione professionale;
- il gate di integrità del candidato può risultare PASS;
- il gate di autorità alla pubblicazione DEVE risultare FAIL;
- il `main` pubblico non deve essere aggiornato.

### APPROVED

La promozione pubblica richiede inoltre:
- `authorityReceiptRef` emesso da Arena;
- digest di integrità SHA-256 sul payload approvato;
- gate Atlas di build, visuali e accessibilità;
- revisione umana dell’exact head.

Nessuna modifica del curricolo viene redatta in Atlas. Le correzioni devono tornare ad Arena e produrre una nuova impronta Arena.

## Bootstrap

Il primo candidato è il master istituzionale completo materializzato dalla PR Arena #329. Sostituisce la fixture ridotta S3-V2 soltanto nel branch candidato di sincronizzazione finché l’approvazione istituzionale non è completata.
