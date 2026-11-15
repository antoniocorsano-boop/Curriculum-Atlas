# Atlas 1.0 — Piano di consolidamento e universo Energia

Versione 1.0 — 15 novembre 2026. Piano operativo derivato dalla revisione multidisciplinare assistita, non da un collegio di esperti esterni. Rilievi aperti: REV-01…REV-08. Non costituisce autorizzazione alla distribuzione.

## 1. Decisione di prodotto

Preservare il manifesto editoriale e le quattro sezioni (Storie, Laboratori, Scoperte, Percorsi). Collegarle attraverso temi, non duplicare le risorse. Prima di ampliare il catalogo di 12 opere obiettivo, completare e qualificare un universo Energia per la secondaria di primo grado, fascia III. La storia è leggibile autonomamente; l'approfondimento, il laboratorio e la mappa sono estensioni facoltative, non un quiz obbligatorio. Il catalogo originario resta una destinazione, non un impegno di pubblicazione.

### Baseline immutabili

- Home PR #91, commit 3dd2704631716c5f865d1d9193fd4458181f4ad5: 9/9 controlli.
- Libro PR #92, commit 56ec5d5523c3b3212eb2b8c259934fcdc4bf2056: 3/3 controlli sul riallineamento, edizione v0.4 SHA-256 e9c55945eafff4d2d9cb3cddb506839a65ade34b7ba53b18bc62b6b17d671cfc.
- Anteprima locale navigabile SHA-256 cf152d57dda2d2eff38dda470cfe3d4cf24d989a2a2e6cbfd7a3ee6ba8f4b36a; ricevuta nel commento #6889477182 della PR #92.
- Fonte della revisione: commento #6889576483 della PR #92; qualificazione v0.4 e riesame editoriale conservati.
- I controlli precedenti non qualificano le modifiche future. Nessuna prova su dispositivo fisico o con lettore di schermo attestata. Arena master 1.3, impronta b355be71, PROVISIONAL_COMPLETE, ricevuta di autorità assente.

## 2. Mandati e responsabilità

Le responsabilità qui assegnate sono funzioni professionali, non nomine di persone o attestazioni esterne. ChatGPT prepara, implementa e verifica tecnicamente nei limiti degli strumenti; il docente valuta l'effettiva fruibilità e l'adeguatezza pedagogica; l'autorità scolastica competente decide la qualificazione istituzionale e l'eventuale distribuzione. La verifica dei diritti e dei presupposti di accesso richiede evidenza umana e documentale. Nessuna autocertificazione di revisione indipendente.

| Funzione | Responsabilità |
|---|---|
| Direzione editoriale | Coerenza del catalogo, standard di opera, decisioni di prodotto |
| Progettazione pedagogica | Prerequisiti, obiettivi, attività differenziate, evidenze e rubrica |
| Revisione scientifica | Correttezza delle trasformazioni e dei confronti, distinzione dato/ipotesi |
| Autore e direzione artistica | Arco narrativo, continuità dei personaggi e conservazione immagini |
| Progettazione d'uso e accessibilità | Lettore, orientamento, interazioni, equivalenti testuali e prove |
| Architettura e qualità | Contratti, riuso, integrità, regressioni, prove di pubblicazione negativa |
| Docente/autorità competente | Revisione umana, collaudo reale, verifica diritti e decisione di rilascio |

## 3. Sequenza esecutiva

### F0 — Protezione e prerequisiti (avvio immediato, in parallelo con F1–F3)
REV-03. Riconciliare fonti Arena e stato d'autorità; mantenere il riferimento testuale verificato senza inventare identificativi. Inventariare provenienza, versione, impronte e condizioni d'uso delle opere e dei materiali. Documentare che il repository è pubblico: l'area di preparazione non è una misura di riservatezza. Non inserire dati personali o contenuti confidenziali; per eventuali opere realmente riservate usare soltanto un canale ad accesso controllato verificato, senza nuovi costi. Nessuna distribuzione automatica, nuovi servizi o credenziali degli studenti.

Uscita: registro delle evidenze e degli elementi mancanti, controllo negativo sulla pubblicazione. L'autorità definitiva, la verifica documentale dei diritti e l'autorizzazione restano dipendenze esterne bloccanti per F7, non per la produzione locale.

### F1 — Lettore immersivo (REV-02, P0)
Primo intervento software. Creare lettore riusabile con un solo scorrimento, titolo unico, prima illustrazione vicino all'inizio, indice richiudibile accessibile, collegamenti capitolo precedente/successivo, ritorno alla scheda Storie e ripristino della posizione. Nessuna alterazione degli originali. Mantenere il libro autonomo e versionare separatamente il lettore. Non introdurre una rotta pubblica per l'opera.

Prove: apertura/ritorno reali, indice e quattro capitoli via tastiera e tocco, focus visibile, nessuno scorrimento annidato del lettore, quattro immagini con alternative, nessun overflow a 320/360/430/1920 px e testo al 200%, nessuna nuova richiesta esterna nella copia locale. Schermate iniziali mobile e LIM, misurazione della posizione della prima immagine; alla dimensione ordinaria deve comparire già nel primo schermo del lettore su 360/430 px. Non imporre tale limite al 200% se compromette la leggibilità.

### F2 — Materiali accessibili (REV-01, P0)
Per ciascuno dei cinque SVG: conservare il file originale, fornire un equivalente HTML strutturato completo (testo, sequenza, relazioni, istruzioni e tabelle ove presenti), collegamenti a vista illustrata, ingrandimento senza perdita del controllo e stampa locale. Priorità ai due materiali Energia, poi gli altri tre. Nessuna raccolta o trasmissione di nomi o risposte; schede da svolgere su carta o localmente senza persistenza.

Prove: equivalenza verificata elemento per elemento, titoli semantici, navigazione solo tastiera, focus, reflow, contrasto, lettore di schermo con verifica manuale. Riferimenti WCAG 2.2, criteri 1.1.1 e 1.4.10, senza affermare conformità complessiva sulla sola base di test automatici. F1 e F2 possono avanzare separatamente, ma entrambi precedono F5.

### F3 — Opera Energia, edizione candidata 0.5 (REV-04, REV-05, REV-07, P1)
Preparare nuova versione del manoscritto senza sovrascrivere v0.4. Rendere esplicito che l'affievolimento iniziale non dimostra da solo la causa; introdurre osservazioni, ipotesi alternative e confronto di dati illustrativi dichiarati simulati, a parità di luce utile. Non prescrivere prove elettriche fisiche. Rafforzare la svolta narrativa: i tre ragazzi decidono come presentare risultati e limiti, non risolvono il problema per magia. Verificare la corrispondenza testo/immagini; nessuna rigenerazione di massa. Registrare schede identità Matteo, Elena, Samir e ambienti, con provenienza delle quattro immagini. Separare diagrammi esplicativi dalle frecce decorative.

Prove: revisione scientifica e narrativa con checklist, coerenza del bilancio e delle unità, assenza di causalità non supportata, nessuna manipolazione elettrica richiesta, identità e impronte preservate. Guida docente: obiettivi proposti, prerequisiti, indicazioni di durata orientative, attività differenziate, evidenze osservabili e rubrica a quattro livelli per spiegazione energetica, confronto e argomentazione; non valutare la qualità poetica come unico indicatore di competenza scientifica.

### F4 — Universo tematico Energia (REV-06, P1; dipende da F1–F3 per il candidato completo)
Mantenere le quattro porte editoriali; aggiungere una scheda tematica trasversale con quattro azioni effettive:
- Scopri: La poesia dell'energia, nuova edizione.
- Comprendi: Dove va l'energia?, infografica originale e testo equivalente.
- Sperimenta: scheda esistente e nuovo laboratorio virtuale facoltativo di confronto tra trasformazioni; usare esclusivamente dati simulati dichiarati, risultati leggibili e motivabili.
- Esplora: mappa essenziale delle relazioni energia, fonti, trasformazioni, efficienza, risorse e ambiente; distinguere collegamenti introduttivi dagli obiettivi realmente trattati.

Metadati: tema, fascia, tipo, durata orientativa, stato, versione, riferimenti Arena, risorsa e impronta, prerequisiti, alternative accessibili. Una risorsa ha una fonte unica e può comparire in più viste mediante riferimenti. Non trasformare le sezioni in copie del tema; Percorsi resta non disponibile finché non esiste un'opera qualificata. Non spacciare il laboratorio virtuale o la mappa per opere già disponibili.

Prove: tutti i collegamenti apertura/ritorno reali, nessun link fittizio, tema navigabile in ordine libero, controllo di bilancio del laboratorio e alternativa testuale, nessuna richiesta elettrica fisica, coerenza delle risorse e assenza di duplicazioni dei file originali.

### F5 — Qualificazione tecnica e revisione assistita integrata
Dipendenze F1–F4, F0 per i controlli negativi. Compilazione, tipi, lint, regole terminologiche, motore esperienze, regressioni, prova di ogni navigazione effettiva, dimensioni 320/360/430/1920 px e testo al 200%. Verificare tastiera, focus, contrasto e alternative; distinguere automatico da manuale. Produrre schermate e ricevute legate al commit e alle impronte. Verificare assenza di opera non autorizzata nelle rotte e nel catalogo pubblici, assenza di dati personali e nuove spese. La copia locale non equivale all'applicazione distribuita; un'anteprima pubblicamente raggiungibile non è riservata.

### F6 — Revisione umana e collaudo fisico (REV-08, P2)
Docente: apertura reale su smartphone e LIM; trovare il tema, aprire storia, passare a spiegazione e laboratorio, tornare alla biblioteca, usare ingrandimento e stampa. Registrare dispositivo, versione, esito, attriti e decisione senza dati personali. Revisore umano competente per contenuti, accessibilità e diritti: esito circostanziato, non firma simulata. Eventuale prova con studenti solo dopo autorizzazioni istituzionali specifiche, senza raccolta identificativa; non è prerequisito per la sola revisione docente.

### F7 — Decisione di rilascio e riuso del modello
Dipendenze: F0 risolto per tutte le evidenze esterne, F5 e F6 superate, nessun P0 aperto, rilievi P1 risolti o esplicitamente accettati se non bloccanti, versione autorizzata nominativamente. Solo allora proporre integrazione e distribuzione tramite infrastruttura gratuita esistente, con separazione dei canali e possibilità di ritiro della versione. L'autorizzazione al piano non è autorizzazione al rilascio. Se i prerequisiti istituzionali non sono disponibili, chiudere il candidato tecnico e mantenere NO-GO studenti. Il modello di produzione seriale parte dopo il giudizio editoriale sul primo universo, non automaticamente al termine dei test.

## 4. Regole di lavoro

Piccoli commit verificabili, ramo dedicato, nessuna integrazione implicita in main. Preservare PR #91 qualificata; modifiche al lettore e alla nuova opera su ramo derivato da PR #92, evitando conflitti. Prima di ogni nuova fase: verificare la punta del ramo e i risultati del candidato; dopo: salvare ricevuta con versione, verifiche, difetti, evidenze e responsabilità di chiusura. Se un controllo fallisce, correggere prima di avanzare; nessuna deroga generica o riscrittura delle evidenze. Conservare originali e versioni precedenti.

Ogni rilievo ha stato APERTO, IN_LAVORAZIONE, IN_VERIFICA, RISOLTO o BLOCCATO_ESTERNO. RISOLTO richiede evidenza riproducibile e verifica adeguata; non è sufficiente un commit. Fasi senza scadenze arbitrarie: l'avanzamento è condizionato dagli esiti. Le misure di progresso sono opere complete, collegamenti verificati, rilievi chiusi con evidenze e autorizzazioni, non numero di commit.

## 5. Riferimenti e decisioni

Manifesto ATLAS-1.0-MANIFESTO-EDITORIALE.md; revisione PR #92 commento 6889576483; W3C https://www.w3.org/TR/wcag/ ; CAST https://udlguidelines.cast.org/ . Nessuna nuova valutazione di conformità normativa o dichiarazione di approvazione.

Decisione corrente: GO per consolidamento e sviluppo; NO-GO per produzione seriale non qualificata e distribuzione. Prossimo intervento eseguibile: F1 lettore immersivo, con F0 in parallelo. F2 segue con equivalenti dei due materiali Energia e poi degli altri tre. F3 non altera i master e usa esclusivamente nuove versioni.
