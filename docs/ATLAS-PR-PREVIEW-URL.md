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

## Provider governato
È stato creato un sito Netlify separato esclusivamente per le anteprime Atlas:

- nome: `atlas-pr-preview`;
- siteId: `7ee88635-ac0d-4515-8cdf-7ae99b3023c6`;
- nessun riuso del Pages canonico;
- il workflow usa solo draft deploy (`netlify deploy`, mai `--prod`).

L'autenticazione di deploy è un segreto GitHub Actions `NETLIFY_AUTH_TOKEN`, non incluso nel repository. L'environment GitHub dedicato è `atlas-pr-preview`.

## Workflow
`.github/workflows/atlas-pr-preview-netlify.yml` riceve `artifact_run_id` ed `exact_head`, scarica l'artefatto già prodotto dal workflow di build, verifica `EXACT_HEAD.txt` e `studentAuthorized=false`, quindi esegue il draft deploy sul siteId governato e registra l'URL nel riepilogo dell'esecuzione.

## G1
Primo artefatto candidato: `atlas-pr-preview-c34420bf7a80f1f0e7e236b9b78f1e19e96cc59b`, prodotto con successo dal run GitHub Actions `36222693459`.

La PR #35 resta congelata su `c34420bf7a80f1f0e7e236b9b78f1e19e96cc59b` e `NOT_RUNTIME_AUTHORIZED`.
