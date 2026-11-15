# Atlas — Ricevuta F2 e regressione F1

Data: 15 novembre 2026. Candidato locale, non distribuzione. Baseline F1 b680349d2f902122aa4fd4dd3c342d2693523979, tre controlli GitHub superati prima di F2. 

## F2: materiale testuale e illustrato

File conservato nella Libreria personale: Atlas_biblioteca_F2.html, SHA-256 839a3de00ae8644227fc014d06fea5025fb5b9cd20b29997d73b56f24672bb3c. Origine: Atlas_biblioteca_F1.html, SHA-256 8cf49de09b929646dc98e2db4f4cdba62a02188c60f841a55df685f47f79aaef. Generatore: scripts/build-atlas-accessible-materials.py, test: scripts/test-atlas-accessible-materials.py, risultati: content/staging/biblioteca/poesia-energia/materials-f2-results.json.

Cinque SVG originali: tutte le impronte Git corrispondono. Copertura testuale normalizzata 107/107 elementi (23 bisogno, 23 scheda bisogno, 15 agricoltura, 19 energia, 27 scheda energia). La struttura HTML riproduce sequenze, relazioni, esempi, consegne, colonne per ogni riga, spazi da compilare e disegnare. La nota sulla conservazione dell'energia è esplicitamente aggiuntiva. Le tabelle operative sono riorganizzate per sistema/bisogno per evitare lo scorrimento orizzontale della pagina; nessun campo per la raccolta di dati. Originale disponibile con comando in apertura, ingrandimento 100–300%, ripristino e area scorrevole con focus. Stampa della versione testuale.

## Regressione F1

Al 200% il ritorno alla scheda lunga poteva perdere la posizione per interferenza della navigazione nativa a frammenti. Candidato F2: navigazione dei collegamenti interni con History API e router, acquisizione della posizione prima del passaggio, ritorno e focus ripristinati. Prove con posizione 606/487/230/0 px ripristinata esattamente, avanti e indietro del browser; testo narrativo e tutte le immagini identici alla baseline F1.

## Riproduzione e verifica

`python scripts/build-atlas-accessible-materials.py <biblioteca-F1-locale> <biblioteca-F2-locale>`
`python scripts/test-atlas-accessible-materials.py <biblioteca-F1-locale> <biblioteca-F2-locale> <cartella-evidenze>`
Prerequisiti test: Python, BeautifulSoup, Playwright, Chromium (CHROMIUM_PATH opzionale, default /usr/bin/chromium). Input locale fidato con impronta esatta; non scrivere output in una directory pubblica.

Quattro viewport 320x720, 360x800, 430x932, 1920x1080. Venti aperture materiali, equivalenti testuali, comandi da tastiera, ingrandimento e ripristino, focus e ritorno, layout normale e 200%, chiamata stampa intercettata e CSS stampa; generato PDF A4 della scheda energia di due pagine con testo estratto, non collaudo fisico della stampante. Zero richieste HTTP esterne e zero errori JS osservati. Chromium set_content, non apertura sul dispositivo reale. Verifica testuale non equivale a certificazione semantica indipendente o conformità WCAG. Restano revisione umana di equivalenza e tecnologie assistive, contrasto completo, collaudo fisico e integrazione nell'applicazione.

F1 e F2 restano IN_VERIFICA, con candidati tecnici disponibili; l'accettazione tecnica del passaggio F1→F2 è limitata al candidato locale. F3 può essere preparata in parallelo, F4 resta subordinata alla qualificazione delle dipendenze. F0 autorità/diritti/autorizzazione ancora bloccanti per F7. Nessuna modifica a main, alle rotte pubbliche o ai master; studentAuthorized=false; nessun nuovo servizio e nessuna spesa.
