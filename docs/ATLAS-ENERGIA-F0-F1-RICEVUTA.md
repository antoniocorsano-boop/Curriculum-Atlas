# Atlas — Ricevuta F0/F1

Data 15 novembre 2026. Baseline cf6f64dc1d271db1aa9b385507a292cdaf6e1dbe. Candidato di revisione locale, non pubblicazione.

## F1 — Lettore immersivo, candidato

File personale conservato nella Libreria: Atlas_biblioteca_F1.html, SHA-256 8cf49de09b929646dc98e2db4f4cdba62a02188c60f841a55df685f47f79aaef. Sorgente locale Atlas_biblioteca_navigabile.html SHA-256 cf152d57dda2d2eff38dda470cfe3d4cf24d989a2a2e6cbfd7a3ee6ba8f4b36a. Edizione v0.4 SHA-256 e9c55945eafff4d2d9cb3cddb506839a65ade34b7ba53b18bc62b6b17d671cfc. Quattro immagini incorporate con impronte coincidenti. Il testo narrativo e la guida sono preservati; la presentazione è derivata, non una modifica dell'edizione originale.

Adattatore riusabile per edizioni HTML Atlas con il contratto attuale (non HTML arbitrario o nuovo formato senza adattatore); nessun iframe, titolo unico, indice nativo richiudibile, collegamenti interni con focus, ritorno alla scheda. La barra globale si nasconde durante la lettura e si ripristina al ritorno. Non è stato modificato il codice dell'applicazione pubblica.

Riproduzione con Node: `node scripts/build-atlas-immersive-reader.mjs <biblioteca-locale-originale> content/staging/biblioteca/poesia-energia/index-v0.4.html e9c55945eafff4d2d9cb3cddb506839a65ade34b7ba53b18bc62b6b17d671cfc <output-locale>`. Eseguire solo su edizioni locali fidate e già revisionate. Non destinare output alla directory pubblica.

Prove: `python scripts/test-atlas-immersive-reader.py <output-locale> <edizione-originale> <directory-evidenze>`, con Playwright Python e Chromium installati. Risultati registrati in reader-f1-results.json. Browser Chromium, set_content, viewport simulati. 320/360/430/1920: titolo unico, assenza di iframe, quattro immagini integre con alt, cinque collegamenti da tastiera, indice attivato da tastiera, ritorno e focus, navigazione indietro, nessun overflow al 200%, nessuna richiesta HTTP esterna, nessun errore JS. Prima immagine a y=360/360/322/347 px. La posizione di scorrimento su una scheda lunga non è ancora collaudata separatamente; non si attesta conformità completa a WCAG. Apertura fisica e tecnologie assistive da verificare in F6. F1 IN_VERIFICA, non risolto definitivamente.

## F0 — Registro di provenienza e confini

- Arena: esportazione corrente, blob d1ab3fd860db9c043452e62359e404e4c9b94bfd. Impronta b355be71 coincidente con la proiezione Atlas verificata. Stato PROVISIONAL_COMPLETE e ricevuta di autorità null. Nessuna dichiarazione di approvazione.
- Opera: testo originale assistito, edizione v0.4 e ricevuta editoriale presenti. Tavola master e quattro immagini: provenienza generativa registrata in ricevuta v0.3, originali e impronte conservati; verifica documentale dei diritti e decisione umana ancora mancanti.
- Cinque SVG: materiali già registrati nelle lezioni Atlas e verificati rispetto ai blob Git nel precedente dossier; non duplicare i master. La verifica dei diritti per ulteriore distribuzione non si deduce dalla presenza nel registro.
- Repository pubblico verificato mediante metadati GitHub. L'area di preparazione non garantisce riservatezza. L'anteprima F1 è conservata nella Libreria personale e consegnata come file locale; non è stato avviato alcun nuovo sito o servizio.
- Controllo statico: home non contiene riferimenti al libro in preparazione. Il presente intervento aggiunge solo script, ricevute e stato del piano; nessuna rotta o risorsa pubblica. Il controllo negativo sulla compilazione completa resta in F5.

REV-03: BLOCCATO_ESTERNO per autorità, diritti e autorizzazione; F0 prosegue nella raccolta delle evidenze. studentAuthorized=false, serialProductionAuthorized=false. Nessuna spesa, raccolta di dati personali, integrazione in main o distribuzione agli studenti.
