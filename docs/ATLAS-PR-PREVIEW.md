# Atlas PR Preview — contratto infrastrutturale

Status: `PROPOSED / INFRASTRUCTURE_ONLY`

## Scopo
Fornire un'anteprima temporanea di un exact head di una pull request Atlas per collaudo umano, senza modificare il Pages canonico, senza integrare la PR e senza autorizzare contenuti all'uso con studenti.

## Invarianti
1. Exact-head binding: ogni anteprima dichiara lo SHA completo.
2. Separazione dalla produzione: nessun uso dell'environment `github-pages` canonico e nessuna sovrascrittura del deployment di `main`.
3. `preview != published != student-authorized`.
4. Nessun account, analytics, tracking o raccolta di risposte introdotti dall'infrastruttura di preview.
5. Ciclo di vita temporaneo: l'artifact scade; un nuovo SHA rende stale la preview precedente.
6. Least privilege: il workflow di build ha soltanto `contents: read`.
7. Evidenza: build log, exact head e manifest accompagnano l'artefatto.

## Prima slice
Il workflow `.github/workflows/atlas-pr-preview.yml` riceve un exact head, esegue checkout dello SHA, typecheck/lint/build ed export statico, quindi produce un artifact con `EXACT_HEAD.txt` e `PREVIEW-MANIFEST.json`, conservato per 7 giorni.

La pubblicazione tramite URL navigabile è un adapter separato e richiede un gate successivo: questa prima slice non usa `pages: write`, `deploy-pages` o l'environment di produzione.

## G1 / PR #35
Candidato congelato: `c34420bf7a80f1f0e7e236b9b78f1e19e96cc59b`.

Dopo la validazione e l'integrazione di questa infrastruttura, il candidato G1 potrà essere costruito direttamente da quello SHA senza modificare la PR #35.
