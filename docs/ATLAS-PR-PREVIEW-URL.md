# Atlas PR Preview — adapter URL navigabile

Status: `PROPOSED / INFRASTRUCTURE_ONLY`

## Obiettivo
Aggiungere al contratto `ATLAS-PR-PREVIEW` un secondo strato capace di esporre un artefatto exact-head tramite URL temporaneo, senza modificare il Pages canonico e senza attribuire autorizzazione all'uso con studenti.

## Vincoli
- input: artefatto già validato e legato a uno SHA esatto;
- output: URL di anteprima separato dalla produzione;
- nessuna modifica del deployment Pages di `main`;
- nessun account, analytics o raccolta di risposte introdotti dall'adapter;
- URL e deployment sono revocabili/temporanei;
- il manifest deve continuare a dichiarare `studentAuthorized=false`;
- la pubblicazione dell'anteprima non equivale a merge, pubblicazione curricolare o autorizzazione runtime.

## Provider
Il provider di anteprima deve essere configurato come sito separato. Non va creato implicitamente un nuovo sito di hosting né riutilizzato un sito esistente senza identificazione esplicita del relativo `siteId`.

## G1
Primo artefatto candidato: `atlas-pr-preview-c34420bf7a80f1f0e7e236b9b78f1e19e96cc59b`, prodotto con successo dal run GitHub Actions `36222693459`.

Il deployment tramite URL può iniziare solo dopo che esiste un sito di preview separato e identificato; il Pages canonico resta fuori dal percorso.
