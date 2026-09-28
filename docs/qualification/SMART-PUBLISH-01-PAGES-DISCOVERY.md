# SMART-PUBLISH-01 — GitHub Pages discovery

**Stato:** discovery read-only completata; deploy canonico NON ancora autorizzato.

## Evidenze

- Il repository `antoniocorsano-boop/Curriculum-Atlas` dichiara `has_pages: true`.
- Il repository non dichiara una `homepage` pubblica.
- Non esiste un branch `gh-pages` al momento della discovery.
- Nell'albero `.github/workflows` di `main` non risulta un workflow applicativo di deploy GitHub Pages; risultano invece workflow preview Cloudflare/Netlify e gate MAT-PUB.
- I workflow preview esistenti restano esplicitamente non autorizzati per uso student-facing canonico.

## Interpretazione

`has_pages: true` dimostra che la funzione Pages è abilitata sul repository, ma non dimostra da sola:

1. quale sorgente Pages sia configurata;
2. quale URL sia la base pubblica canonica;
3. che l'attuale build Atlas venga distribuita da `main`;
4. che `public/materials/` sia servito senza alterazioni incompatibili con la verifica SHA-256.

L'assenza di `gh-pages` esclude almeno il modello corrente basato su quel branch.

## Decisione fail-closed

Fino alla qualificazione della configurazione effettiva Pages:

- GitHub Pages resta **CANDIDATE_PROVIDER**;
- `canonicalAtlasPublicBaseUrl` resta non valorizzato;
- nessuna URL Pages viene usata come `publicRef` Smart;
- nessuna receipt finale viene emessa sulla sola base di `has_pages: true`;
- SP-01 non viene promosso a `packageReady=true`.

## Prossimo gate

Serve una delle seguenti evidenze, in ordine di preferenza:

1. lettura della configurazione Pages del repository (source/build type/URL), oppure
2. evidenza equivalente dalla UI GitHub Settings → Pages, oppure
3. configurazione esplicita e governata di un workflow Pages su `main`, sottoposta a PR e human review.

Non creare un nuovo provider o un secondo deposito per superare questo gate.