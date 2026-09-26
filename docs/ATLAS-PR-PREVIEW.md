# Atlas PR Preview — contratto infrastrutturale

Status: `PROPOSED / INFRASTRUCTURE_ONLY`

## Scopo
Fornire un'anteprima navigabile e temporanea di un exact head di una pull request Atlas per collaudo umano, senza modificare il Pages canonico, senza integrare la PR e senza autorizzare contenuti all'uso con studenti.

## Invarianti

1. **Exact-head binding.** Ogni anteprima deve dichiarare PR, SHA completo e data di generazione. L'URL non costituisce prova se il contenuto non è legato allo SHA dichiarato.
2. **Separazione dalla produzione.** Nessuna anteprima può usare l'environment `github-pages` canonico o sovrascrivere il deployment di `main`.
3. **Nessuna autorità runtime.** `preview != published != student-authorized`.
4. **Nessun dato studente.** Le anteprime non devono introdurre account, analytics, tracking o raccolta di risposte.
5. **Accesso non indicizzato.** Le anteprime devono includere `noindex,nofollow` quando il canale scelto lo consente.
6. **Ciclo di vita.** Una preview è temporanea e deve poter essere rimossa/invalidata alla chiusura della PR o al superamento dell'exact head.
7. **Least privilege.** Il workflow di build non riceve permessi di produzione. Eventuali credenziali di un provider esterno devono essere limitate al solo progetto preview.
8. **Evidenza.** Build log, exact head e URL devono essere registrabili nella PR come ricevuta di collaudo.

## Architettura

### A. Build candidate
Workflow riutilizzabile riceve `pr_number` e `exact_head`, esegue checkout dello SHA, installazione, typecheck/lint/build ed export statico. Produce un artifact immutabile con `EXACT_HEAD.txt` e `PREVIEW-MANIFEST.json`.

### B. Publish adapter
La pubblicazione è un adapter separato dalla build. Il primo adapter autorizzato dovrà offrire URL isolato per deploy e non toccare GitHub Pages canonico. La scelta del provider è separata dal contratto: GitHub Actions artifact resta comunque la prova primaria della build.

### C. Human review
Il revisore apre l'URL su smartphone/desktop, verifica percezione, lettore di schermo e contrasto e registra PASS/CHANGES REQUIRED con exact head.

### D. Cleanup
Alla chiusura PR o quando cambia lo SHA, la preview precedente viene considerata `STALE`; il provider deve consentire cancellazione o scadenza. Nessun vecchio URL può essere usato come evidenza per un nuovo exact head.

## G1 / PR #35

Candidato congelato: `c34420bf7a80f1f0e7e236b9b78f1e19e96cc59b`.

La futura preview di G1 deve essere costruita direttamente da questo SHA. Nessuna modifica al ramo della PR #35 è ammessa per ottenere l'anteprima.

## Gate di adozione

L'infrastruttura può essere integrata solo dopo:
- build di prova da exact head noto;
- verifica che non esista alcuna scrittura verso Pages canonico;
- URL isolato funzionante su smartphone e desktop;
- manifest SHA ↔ URL verificato;
- cleanup/staleness verificabile;
- human review dell'infrastruttura.
