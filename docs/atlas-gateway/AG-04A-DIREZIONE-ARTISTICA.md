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


## AG-04/DA2 — Direzione artistica estesa e disciplinare di accettazione
Data: 16 novembre 2026. Stato: DISCIPLINARE CANDIDATO, DA VALIDARE CON EVIDENZE VISIVE; NON PUBBLICARE.
Mandato: elevare spessore, professionalità e maturità artistica. Non sostituire il riferimento approvato AG-04B2 né aprire un progetto autonomo. Il presente disciplinare estende P1, P4, P5 e P7 del protocollo di produzione e può essere riutilizzato dopo la qualificazione del pilota.

### 1. Identità ed esperienza
Atlas è una biblioteca di mondi educativi: meraviglia, curiosità, orientamento e fiducia; monumentalità accogliente, non lusso ostentato. Lo studente è protagonista e raggiunge subito Esperienze, senza dover esplorare la sala o decifrare simboli. La stessa identità accompagna Storie, Laboratori, Scoperte e Percorsi, rispettando il loro linguaggio specifico. Vietati ambienti generici da videogioco, estetica fredda, effetti ornamentali invasivi, modelli seriali privi di carattere, simulazioni di qualità ottenute sostituendo interazioni con immagini statiche.
ARENA: provenienza curricolare, iscrizione integrata nell'anello superiore. ATLAS: identità dominante sul medaglione basso. Tre portali semantici invariati; Esperienze prioritario; Studio informativo e protetto. Nessuna cupoletta centrale.

### 2. Architettura e composizione
- Gerarchia: grande apertura superiore, anello, biblioteca a tre livelli, apertura paesaggistica, medaglione, portali. Il vuoto centrale valorizza il luogo e non ospita altri monumenti.
- Definire sezione radiale, modulo delle campate, rapporto fra altezza, larghezza, profondità e spessore reale dei cornicioni; verificare continuità di archi, capitelli, imposte e balconi. Le geometrie devono risultare costruttivamente plausibili, senza intersezioni visibili, elementi sospesi o scale incoerenti.
- Scaffali arretrati, libri protetti dalla luce diretta come intenzione scenografica; variazioni controllate di dorsi, altezze, spazi vuoti e finiture. La ripetizione del modulo è architettonica, non uniformità assoluta. Evitare disordine e decorazione casuale.
- Produrre tavola di composizione con griglia, punti focali, livelli e linee prospettiche. Conservare viste frontale, laterale, zenitale, verticale e dettaglio. Definire ingombri dei portali prima di modificare la scena.

### 3. Materiali, colore e tipografia
Tavolozza candidata (valori orientativi sRGB, non texture o certificazione cromatica): avorio #E4D7BD, noce #795138, blu Atlas #263C4F, oro satinato #B69A58, luce #F6F1E6, cielo #84A9C5. Validare con il riferimento e con la gestione colore del renderer; nessuna sostituzione automatica dei colori istituzionali.
- Pietra: variazione minuta, giunti credibili, spigoli non perfettamente taglienti; legno: venatura a scala coerente, direzione e rifinitura; metallo: riflessi satinati non specchiati indiscriminatamente; libri: dorsi leggibili come manufatti senza testi inventati predominanti; pavimento: riflessione attenuata e rugosità coerente.
- Schede per materiale: origine, licenza, SHA-256, scala UV, base color, roughness, normal, AO se applicabile, peso e trattamento colore. Verificare corrispondenza Blender/WebGL; nessuna risorsa remota in esecuzione.
- Tipografia serif monumentale per iscrizioni architettoniche, sans leggibile per interfaccia, icone essenziali della stessa famiglia. Non confondere scritte prospettiche con etichette accessibili HTML. Contrasto e dimensioni dei comandi verificati secondo il contratto di accessibilità vigente.

### 4. Luce, atmosfera, paesaggio
Un'unica regia coerente: luce zenitale naturale, contributo diffuso, luce calda indiretta nelle campate, ombre di contatto, riflessi selettivi. Evitare sovraesposizione, neri chiusi, saturazione artificiale e nebbia ornamentale.
Cielo e orizzonte fisicamente plausibili: verificare sorgente, proiezione equirettangolare, asse verticale, orientamento e separazione fra cielo visibile e illuminazione ambientale. Nessun terreno o vegetazione sopra l'orizzonte per errore di mappatura. La terrazza è una geometria distinta. Verificare esposizione e colori in tre viste prima di calcolare AO. Non dichiarare conformità illuminotecnica reale.
Conservare una scheda luce con direzione, intensità relative, temperatura, esposizione e gestione colore, e una tavola di confronto a parità di camera.

### 5. Regia e accessibilità
Tre composizioni distinte: smartphone verticale (accesso immediato, titolo/portale leggibili); smartphone orizzontale (cupola e portali bilanciati, nessun comando tagliato); schermi medi/grandi e LIM (monumentalità, distanza di fruizione, nessuna sovrapposizione). Acquisire comunque tutti i sei formati del contratto. Camera controllabile, movimento ridotto, alternativa HTML equivalente, nessun movimento obbligatorio, suono non necessario. Non ridurre leggibilità e tempi di accesso in nome dell'estetica.

### 6. Produzione artistica tracciata
Per ogni incremento produrre: brief percettivo e riferimento immutabile; tavola compositiva; schede di materiali e luce; render Blender di insieme/verticale/dettaglio; confronto affiancato con riferimento e versione precedente a inquadrature comparabili; manifest delle risorse; scena modificabile e derivato WebGL; sei schermate reali del browser, evidenze funzionali e prestazioni; rapporto con rilievi e decisione. Conservare originali, licenze, impronte, commit, parametri, log e ricevute. Distinguere render offline, schermata WebGL e misura su dispositivo fisico. Nessuna nuova infrastruttura o spesa.

### 7. Revisione artistica: rubriche e soglie candidate
Scala 0-4 per criterio: 0 assente, 1 insufficiente, 2 parziale, 3 professionale, 4 eccellente. Valutazione argomentata con evidenza specifica, non attribuzione automatica da CI. Pesi candidati: fedeltà al riferimento e identità 20; architettura e proporzioni 20; luce/cielo/paesaggio 20; materiali e dettagli 15; composizione multidispositivo 15; orientamento educativo e leggibilità 10. Punteggio ponderato su 100 = somma(peso × livello/4). Proposta di soglia: almeno 80/100 e nessun criterio sotto 3; nessuna media compensa un blocco. Non assegnare punteggi senza immagini effettive. Una seconda revisione separata dalla produzione valuta i medesimi criteri; registrare scostamenti e motivazioni, non simulare pareri indipendenti.
Blocchi assoluti: orizzonte errato; geometria evidentemente incoerente; identità ARENA/ATLAS alterata; portali non leggibili/raggiungibili; accessibilità regressiva; risorse senza licenza; richieste esterne, costo aggiuntivo, dati personali, autorizzazioni violate; controlli funzionali falliti. Le prestazioni devono essere misurate e confrontate con la precedente candidata su dispositivi fisici, senza inventare una soglia già approvata. Il PASS automatico è necessario ma non sufficiente; il render offline non qualifica il browser. Approvazione artistica finale esplicita prima della richiesta di integrazione e autorizzazione separata alla pubblicazione.

### 8. Applicazione immediata C3.3A3
C3.3A2: commit 4bf26bd1b6ecdd52f5e41c3afd9a1cb68f63788b, 11/11 procedure PASS; run Blender 43902700194, artefatto atlas-c33a2-refined 14244351864, digest dichiarato da GitHub sha256:77768a9f628d7e42c2774ab31304e517bd7c9b8aee271edd8108bee990d16de5. Evidenze di insieme, verticale e dettaglio prodotte; la precedente verifica percettiva segnala vegetazione/terreno nella zona del cielo. Non qualificare il risultato artistico né presumere integrato il nuovo modello nel WebGL.
Sequenza vincolante proposta: (1) diagnosi proiezione e orientamento panorama e verifica cielo; (2) revisione proporzioni di arco/anello e profondità campate; (3) campione materiali/luce e nuova tavola di tre render; (4) revisione con rubrica e chiusura dei blocchi; (5) bake AO delle varianti soltanto dopo approvazione della geometria; (6) assemblaggio WebGL isolato, sei formati, regressioni e confronto offline/browser; (7) collaudo fisico e revisione indipendente AG-05. Non avanzare al bake o all'assemblaggio se il riferimento artistico intermedio è respinto.
I pesi, la tavolozza e le soglie sopra sono scelte progettuali candidate, non decisioni già approvate dall'utente. Nessun runtime, Home, ramo principale, autorizzazione o distribuzione modificati da DA2.


## AG-04/DA3 — Obiettivo di eccellenza 100/100
Decisione esplicita dell'utente, 16 novembre 2026: «Occorre raggiungere 100».
Il requisito finale di accettazione artistica è 100/100, cioè livello 4/4 in ciascuno dei sei criteri DA2. La precedente soglia proposta di 80/100 è superata e non autorizza integrazione o distribuzione. I punteggi intermedi descrivono l'avanzamento, non autorizzano deroghe. Il massimo certifica il soddisfacimento documentato della rubrica, non una perfezione estetica universale.
Nessuna attribuzione automatica, arrotondamento al massimo, compensazione, rimozione di criteri o modifica opportunistica dei pesi. Un criterio non verificato resta non verificato; nessun punteggio finale su sole immagini offline. Conservare i pesi DA2 come base operativa. Approvazione finale esplicita dell'utente e revisione separata dalla produzione; se i giudizi divergono, registrare il rilievo e risolverlo prima di qualificare. Restano tutti i blocchi assoluti e le invarianti di sicurezza, costo zero, privacy, accessibilità e prestazioni fisiche.

### Evidenze obbligatorie per il livello 4/4
| Criterio | Peso | Evidenza per 4/4 |
| --- | ---: | --- |
| Identità e fedeltà | 20 | Confronto affiancato con il riferimento approvato: atmosfera, gerarchia, ARENA integrata, ATLAS dominante, tre portali, nessuna cupoletta; scostamenti residui chiusi oppure espressamente approvati come adattamenti coerenti |
| Architettura | 20 | Continuità costruttiva e proporzioni credibili in insieme, sezione, dettaglio; archi, cornici, parapetti e campate senza difetti percettibili; arredi coerenti senza ostacolare accessi |
| Luce e paesaggio | 20 | Cielo naturale, orizzonte corretto, profondità esterna, luce zenitale e indiretta plausibile, ombre e riflessi coerenti; confronto in tre inquadrature e nel browser |
| Materiali e dettagli | 15 | Pietra, legno, metallo, libri e pavimento leggibili alla scala d'uso; medaglione a filo, tipografia serif verificata; schede e licenze complete, resa coerente offline/WebGL |
| Composizione multidispositivo | 15 | Sei formati effettivi e prova fisica: regia dedicata, leggibilità dei punti focali, nessuna sovrapposizione, taglio critico o regressione; movimento ridotto e alternativa HTML equivalenti |
| Orientamento educativo | 10 | Tre accessi riconoscibili e funzionanti, Esperienze immediatamente raggiungibile, Studio protetto, navigazione da tastiera e tocco, nessun ostacolo scenografico e nessun accesso non autorizzato |

### Roadmap di eccellenza (sequenza di lavoro, non nuove approvazioni)
- C3.3A4 — composizione artistica complessiva: correggere fessura sopra arco, monumentalità e leggibilità ARENA; medaglione a filo con vera tipografia serif (licenza e impronta); pavimento, sedute e vegetazione curate; cielo luminoso e paesaggio profondo. Inserire rappresentazioni offline dei tre portali con dimensioni e ancore compatibili con i portali semantici esistenti. Non sostituire destinazioni con geometria decorativa.
- C3.3A5 — rifinitura: campioni materiali, dettaglio arredi, luce, inquadrature, correzioni emerse dal confronto. Per autorizzare il lavoro tecnico successivo, chiudere tutti i rilievi dei primi quattro criteri in sede offline; tale gate intermedio non attribuisce 100/100 né certifica la resa web.
- C3.3B — produzione delle tre varianti AO e assemblaggio WebGL isolato; confronto con Blender; preservare accessi, isolamento e budget. È una lavorazione di candidata e non l'integrazione in main.
- C3.3C/D — regia nei sei formati, collaudo reale e revisione educativa/tecnica; rimuovere ogni regressione. Solo qui è valutabile la rubrica completa.
- AG-05 — revisione finale indipendente, rapporto con evidenza puntuale per ogni criterio, decisione esplicita dell'utente. Se un criterio non raggiunge 4/4, mantenere la candidata non approvata e correggere. Integrazione e pubblicazione restano decisioni distinte.

Baseline C3.3A3: 9c7750337ca945cbeec00fa07b171bf0e12a538c, 11/11 procedure PASS, artefatto 14249600059. Valutazione percettiva preliminare 47,5/100 (ricevuta PR #105, commento 6923250441), riferita al prototipo offline; non è un risultato finale né un parere indipendente. Conservare il riferimento e la candidata. Nessuna modifica runtime, autorizzazione, ramo principale o pubblicazione in DA3.
