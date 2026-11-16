# AG-04/A — Direzione artistica e contratto esperienziale

Stato: DIREZIONE FORMALIZZATA / CONFRONTO VISIVO DOCUMENTATO / NON PUBBLICARE.
Data: 16 novembre 2026.

## Riferimento qualificato e conservazione
- Commit esatto AG-03/B: d4448be0e7a47bd050677df0272e0cb8dca64f1b; PR #104 in bozza.
- Archivio dedicato: archive/atlas-gateway-ag03b-qualified. Non avanzare o riscrivere il ramo; lo SHA è il riferimento immutabile.
- Sviluppo separato: feat/atlas-gateway-ag04, derivato dallo stesso SHA. Non modificare main, Home, distribuzione o PR #104 durante AG-04/A.
- Qualificazione sul riferimento: 10/10 workflow PR completati con successo. WebGL locale: run 43825049343, artefatto 14206017238 (consultabile nella sezione Actions del repository Atlas mediante questi identificativi). Archivio integrale acquisito e verificato SHA-256 a1fa493bfa40db493c8ae3ec6128a70acc1d2512a7598a12eb6ad9a551cac900; copia nella Libreria personale, cartella Porta Atlas, atlas-gateway-ag03b-qualified.zip.
- La prova usa Chromium con WebGL software; non attesta qualità percettiva o prestazioni su hardware reale.
- Riferimenti artistici originali: baseline/ATLAS-Biblioteca-3D.html e fonti/scene-threejs.html, mantenuti byte per byte; l'archivio locale AG-01 contiene anche i due riferimenti visivi, non tutti pubblicati nel repository. Riferimenti e schermate recuperati e ispezionati; vedere confronto sotto.

## Intento
Atlas è una biblioteca di mondi educativi, non una demo grafica. L'ambiente deve invitare alla scoperta e consentire allo studente di raggiungere subito la propria esperienza; la sala non è un passaggio obbligatorio. Conservare la distinzione Atlas (fruizione), Arena (fonte curricolare), Studio Atlas (produzione professionale).

## Direzione visiva
1. Biblioteca circolare su tre livelli, con scaffali riconoscibili lungo le superfici laterali, parapetti leggeri, profondità e proporzioni coerenti. Evitare pareti fredde e spoglie.
2. Cupola vetrata come fulcro architettonico, inquadratura leggibile; nessuna cupoletta o monumento aggiuntivo al centro. Piattaforma centrale bassa.
3. Materiali caldi: legno, pietra chiara, accenti blu e oro sobri; luce naturale diffusa e illuminazione degli scaffali. Niente effetti abbaglianti, estetica futuristica fredda o animazioni ornamentali continue.
4. Identità: rispettare la richiesta di scritta Arena sulla cupola senza sostituire l'identità complessiva Atlas. Il README AG-01 prescrive marchio ATLAS: prima della realizzazione verificare sul riferimento visivo la collocazione di entrambi i nomi; non rinominare il prodotto o alterare il ruolo dei portali. La relazione tra marchi è un punto esplicito di revisione, non un'autorizzazione a cambiare il contratto.
5. Tre portali distinti e leggibili: Curricolo Atlas, Esperienze Atlas (principale per lo studente), Studio Atlas (informativo e riservato). Nessuna nuova destinazione, nessun contenuto fittizio.
6. Biblioteca editoriale: Storie, Laboratori, Scoperte, Percorsi e ricerca, con accesso diretto ai contenuti autorizzati. Niente navigazione esclusivamente spaziale.

## Regia per formato
- 320x568 e 393x873: inquadratura dedicata, portale Esperienze riconoscibile senza gesti preliminari, controlli non sovrapposti e accessi HTML sempre raggiungibili.
- 873x393: regia orizzontale senza occultare portali o comandi; rotazione del dispositivo senza perdita del contesto.
- 768x1024: equilibrio tra cupola, scaffali e portali, senza semplice ingrandimento del formato mobile.
- 1440x1000 e 1920x1080: composizione architettonica completa, leggibilità dei portali anche da distanza su LIM da verificare sul dispositivo.
- Movimento ridotto e alternativa HTML: mantenere parità di destinazioni; rotazioni intenzionali, controllabili, senza obbligo di movimento.

## Invarianti non negoziabili
Contratto AG-03/B, motore locale, isolamento iframe/CSP, controllo origine e canale, zero richieste esterne durante l'uso, nessun costo aggiuntivo, dati personali assenti, protezione Studio, filtri autorizzativi, recupero WebGL, accessibilità e nove comandi funzionanti. Non modificare i sorgenti storici: ogni variante è derivata e tracciata con impronta. Non introdurre librerie o risorse remote per la sola resa estetica.

## Accettazione e sequenza
AG-04/A: confronto documentato tra riferimento, candidata e direzione; decisione sui marchi; inventario delle differenze e risorse con licenze. Nessun giudizio visivo positivo senza immagini ispezionate.
AG-04/B: variante scenografica isolata; confronto prima/dopo nelle sei risoluzioni; verifica colori, leggibilità, qualità architettonica e conservazione baseline.
AG-04/C: regia, gesti, prestazioni e accessibilità; ripetere i controlli AG-03/B senza ridurne copertura. Misurare fluidità su dispositivo fisico; documentare hardware/browser e risultati, senza dedurre prestazioni da Chromium software.
AG-04/D: verificare accesso immediato a Esperienze, ritorno, accessi diretti, tastiera, movimento ridotto, leggibilità su LIM e nessun accesso a contenuti non autorizzati. Evidenze effettive e rilievi aperti, non solo esiti automatici.
AG-05: revisione indipendente complessiva; solo dopo approvazione esplicita valutare integrazione e, separatamente, distribuzione.

## Stato effettivo
Questo documento non modifica il runtime e non certifica una grafica nuova. Il confronto delle schermate è documentato; test su dispositivi fisici della nuova candidata restano aperti. Il ramo archivio non è una protezione amministrativa contro modifiche o cancellazioni: il riferimento esatto è il commit sopra.

## Ricevuta del confronto visivo AG-04/A — 16 novembre 2026
Fonti ispezionate: riferimenti/01-visione-architettonica.png e riferimenti/02-collaudo-smartphone.jpg dall'archivio AG-01; sei immagini *-sala.png dell'artefatto AG-03/B. La schermata personale resta fuori dal repository. L'archivio AG-03/B contiene 24 file (19 PNG, risultati, manifest, licenze e log), tutti conservati. I risultati attestano sei formati PASS, recupero e movimento ridotto PASS, zero richieste esterne, nessuna autorizzazione studenti. Il commit intermedio 781d9c88c9c968b01760eeeb30d5af850768589d ha ottenuto 4/4 procedure PASS.

- Riferimento architettonico: cupola vetrata con luce zenitale e bordo luminoso, pavimento riflettente, pannelli traslucidi di grande formato, prospettiva centrale. Non riprodurre i cinque portali professionali o il monumento centrale della fonte: l'adattamento Atlas richiede tre portali e piattaforma bassa.
- Schermata storica smartphone: pareti fredde con finestre ripetute e cupoletta centrale. La candidata AG-03/B ha già risolto entrambi i rilievi: scaffali su tre livelli e piattaforma bassa. Conservare questi progressi.
- Candidata attuale: scaffalature regolari e ripetitive, pavimento scuro a griglia, struttura della cupola blu con chiazze luminose, pannelli relativamente piccoli nei formati orizzontali, comandi e accessi ripetuti. La luce e la profondità architettonica sono inferiori al riferimento. Su 320x568 l'intestazione occupa spazio significativo; in orizzontale la cupola è quasi interamente fuori campo. Su tablet la cupola e i tre portali sono più leggibili; desktop e LIM richiedono gerarchia visuale più forte. Non equiparare il PASS geometrico alla qualità visiva.
- Priorità AG-04/B: migliorare luce naturale, bordo della cupola, profondità degli scaffali e materiali, trasparenza e dimensione percettiva dei pannelli, mantenendo i tre accessi. Ridurre la ripetizione percepita dei comandi senza sopprimere alternativa HTML o destinazioni; eventuale riprogettazione dei controlli in AG-04/C. La scritta Arena richiesta va collocata sul bordo della grande cupola come richiamo alla provenienza curricolare, mentre ATLAS resta il marchio dell'ambiente e dei portali: proposta scenografica da verificare in anteprima, non rinomina né modifica di ruoli. Nessuna cupoletta centrale.
- Per AG-04/B usare geometrie e materiali procedurali locali già disponibili; conservare le licenze MIT del motore e degli stili; nessun nuovo asset esterno autorizzato. Qualora servano nuovi asset, registrare origine, licenza e impronta prima dell'inclusione. Per il confronto successivo acquisire gli stessi sei formati, mantenendo il confronto prima/dopo e ripetendo le prove funzionali. Le prestazioni su hardware reale e la leggibilità a distanza restano da verificare.
