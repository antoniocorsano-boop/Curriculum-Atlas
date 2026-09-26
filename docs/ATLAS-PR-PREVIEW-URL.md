# Atlas Preview — URL stabile di collaudo

Status: `PROPOSED / INFRASTRUCTURE_ONLY`

## Obiettivo
Esporre un artefatto exact-head validato tramite un URL stabile di collaudo, senza modificare il Pages canonico e senza attribuire autorizzazione all'uso con studenti.

## Semantica
Il sito Netlify `atlas-pr-preview` è un ambiente dedicato esclusivamente al collaudo. Un deployment `--prod` su questo sito significa soltanto aggiornare l'URL stabile dell'ambiente Atlas Preview. Non equivale a:

- pubblicare il candidato nel sito canonico Atlas;
- integrare la relativa pull request;
- approvare contenuti curricolari;
- autorizzare l'uso con studenti.

Il manifest deve continuare a dichiarare `studentAuthorized=false`.

## Provider governato
- nome: `atlas-pr-preview`;
- siteId: `7ee88635-ac0d-4515-8cdf-7ae99b3023c6`;
- URL stabile previsto: `https://atlas-pr-preview.netlify.app`;
- nessun riuso o modifica del GitHub Pages canonico.

L'autenticazione di deploy è un segreto GitHub Actions `NETLIFY_AUTH_TOKEN`, non incluso nel repository. L'environment GitHub dedicato è `atlas-pr-preview`.

## Workflow
`.github/workflows/atlas-pr-preview-netlify.yml` riceve `artifact_run_id` ed `exact_head`, scarica l'artefatto già validato, verifica `EXACT_HEAD.txt` e `studentAuthorized=false`, quindi esegue `netlify deploy --prod` esclusivamente sul siteId governato e registra l'URL stabile nel riepilogo dell'esecuzione.

Ogni nuovo candidato sostituisce il precedente nell'ambiente di collaudo; la provenienza rimane verificabile tramite exact head e log dell'esecuzione.

## G1
Primo candidato: `atlas-pr-preview-c34420bf7a80f1f0e7e236b9b78f1e19e96cc59b`, prodotto dal run GitHub Actions `36222693459`.

La PR #35 resta congelata su `c34420bf7a80f1f0e7e236b9b78f1e19e96cc59b` e `NOT_RUNTIME_AUTHORIZED`.
