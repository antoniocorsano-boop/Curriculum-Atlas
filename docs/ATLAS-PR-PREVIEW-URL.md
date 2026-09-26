# Atlas Preview — URL stabile di collaudo

Status: `PROPOSED / INFRASTRUCTURE_ONLY`

## Obiettivo
Esporre un artefatto exact-head validato tramite un URL stabile di collaudo, senza modificare il Pages canonico e senza attribuire autorizzazione all'uso con studenti.

## Semantica
Il sito Netlify `atlas-pr-preview` è un ambiente dedicato esclusivamente al collaudo. Un deployment `--prod` su questo sito significa soltanto aggiornare l'URL stabile dell'ambiente Atlas Preview. Non equivale a pubblicare il candidato nel sito canonico Atlas, integrare la relativa pull request, approvare contenuti curricolari o autorizzare l'uso con studenti.

Il manifest deve continuare a dichiarare `studentAuthorized=false`.

## Provider governato
- nome: `atlas-pr-preview`;
- siteId: `7ee88635-ac0d-4515-8cdf-7ae99b3023c6`;
- URL stabile: `https://atlas-pr-preview.netlify.app`;
- nessun riuso o modifica del GitHub Pages canonico.

L'autenticazione è fornita esclusivamente dal segreto GitHub Actions `NETLIFY_AUTH_TOKEN`; l'environment dedicato è `atlas-pr-preview`.

## Gate tecnici del workflow
`.github/workflows/atlas-pr-preview-netlify.yml` applica prima del deploy:

1. validazione rigida di `exact_head` come SHA Git completo lowercase di 40 caratteri e di `artifact_run_id` come numerico;
2. verifica via GitHub API che il run sorgente sia `Atlas PR Preview Artifact`, `workflow_dispatch`, completato e concluso con `success`;
3. download dell'artefatto nominato con l'exact head richiesto;
4. verifica congiunta di `EXACT_HEAD.txt` e `PREVIEW-MANIFEST.json`, incluso `channel=artifact-only` e `studentAuthorized=false`;
5. serializzazione dei deploy tramite un unico gruppo di concorrenza, con cancellazione dell'esecuzione precedente ancora in corso;
6. Netlify CLI fissata alla versione `27.9.0`, senza uso di `latest`;
7. `netlify deploy --prod` confinato al siteId governato;
8. accettazione dell'esito soltanto se Netlify restituisce l'URL stabile governato `https://atlas-pr-preview.netlify.app`.

Ogni nuovo candidato validato sostituisce il precedente nell'ambiente di collaudo; exact head e log dell'esecuzione costituiscono l'evidenza di provenienza.

## G1
Primo candidato: `atlas-pr-preview-c34420bf7a80f1f0e7e236b9b78f1e19e96cc59b`, prodotto dal run GitHub Actions `36222693459`.

La PR #35 resta congelata su `c34420bf7a80f1f0e7e236b9b78f1e19e96cc59b` e `NOT_RUNTIME_AUTHORIZED`.
