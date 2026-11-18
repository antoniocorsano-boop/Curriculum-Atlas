# AG-04 — Preflight nativo, prevenzione delle regressioni di integrazione

## Evidenza del problema
PR #115, commit 42b83f743d769e1449b63e565908a6b477cd2556:
il run 44333226603 ha ricevuto sky, ambient e shell, ma nessuno dei
sei formati ha raggiunto atlas-3d-ready; fallback integrità e movimento
ridotto positivi. Il timeout/rimozione dell'iframe è un effetto, non
la causa. L'analisi del sorgente r128 mostra che ImageBitmapLoader
usa fetch anche per immagini blob incorporate. Il CSP del renderer
blocca connect-src; la modifica 67c9fc5 usa TextureLoader via img-src blob
senza cambiare il CSP. La conferma empirica resta affidata al collaudo.

## Regola preventiva
Ogni futura modifica a risorse, motore, runtime, CSP o trasporto deve
superare prima la prova del pacchetto generato in un iframe opaco:
- stesso scene.html con SHA-256 e manifest verificati, non una scena
  di test costruita a parte;
- stessa policy di manifest, richiesta e verifica byte del genitore,
  usata da un host locale minimo; non si sostituisce il decodificatore
  con un mock;
- otto trasferimenti completi e sei GLB decodificati con texture
  originali, geometria selezionata e primo rendering WebGL effettivo;
- zero richieste a origini esterne, zero violazioni CSP o errori WebGL;
- evidenze delle fasi, durate trasferimenti, diagnostica, immagine
  e fase precisa dell'ultimo errore, anche in caso di timeout.

Il workflow deve fermarsi al primo fallimento del preflight, prima
di costruire Next e ripetere il collaudo su sei formati. Il preflight
non sostituisce la successiva prova della route reale, della navigazione,
delle dimensioni responsive o delle alternative accessibili.

La nuova procedura è isolata sul ramo work/atlas-native-preflight per
non cancellare il collaudo #115 attualmente in corso; la concorrenza
è separata per ramo. Sul ramo d'integrazione, dopo il raccordo del
preflight, la sequenza sarà build del pacchetto → preflight → build Next →
route reale e sei formati. Nessuna riduzione delle garanzie, nessun
nuovo servizio, nessuna modifica al master, nessun deploy o merge.
Rimane aperta la dipendenza CI da artefatti temporanei; i digest
e i tentativi limitati non risolvono la loro scadenza.
