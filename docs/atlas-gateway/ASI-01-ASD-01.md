# ASI-01 / ASD-01 — Osservazione e regia della scena

Stato: candidata L1, sola lettura, nessuna autorizzazione runtime. La decisione dell'utente del 18 novembre 2026 autorizza il percorso di ricerca e realizzazione, non una promozione automatica delle decisioni.

## Raccordo con TRAMA

Non si crea una base di conoscenza concorrente. ASP-01 è la fonte di dominio per scene e dossier; ASD-01 è il contratto di regia; ASI-01 è il lettore specialistico delle evidenze. TRAMA-ADR-015 e ProjectContextSnapshot v1 governano la proiezione; il modello dual-speed separa fatti storici e osservazioni correnti. TRAMA-DE-01 (ADR-023, PR centrale #346) governa la documentazione delle decisioni. L'indice del Control Center resta derivato e in sola lettura. La presente tranche non cambia il Control Center, non abilita DOS-A1 né nuove scritture o pubblicazioni.

## L1 — Prima capacità effettiva

Il comando `python3 scripts/scene-intelligence.py` legge esclusivamente l'archivio decisionale, la ricevuta del master Blender e sei regole candidate versionate. `--tag repeated-meshes` restituisce una proposta motivata e le verifiche necessarie per una scena con geometrie ripetute. Ogni regola dichiara fonti, stato atteso, precondizioni, prova e limite. L'output è JSON derivato, non una nuova authority né una modifica al registro. Fonte assente, diversa o superata blocca il suggerimento relativo. L'osservazione del master è una fotografia di collaudo vincolata alla ricevuta, non telemetria in tempo reale; non si dichiara aggiornamento live né addestramento del modello.

La memoria positiva e negativa conserva culling, decodifica, ALS, confronto materico, rilievo di navigazione e ripristino. La qualifica isolata non equivale a qualifica applicativa; M1/M2 restano non integrati, il timeout non è dichiarato risolto. Il master Blender riaperto è un candidato artistico, non una scena approvata. Il pacchetto iniziale resta immutato; l'archivio del master è conservato separatamente.

## ASD-01 — Perimetro dichiarativo da attuare

Separare scena, regia, osservazione e proposta. La regia deve riferirsi agli identificativi stabili di asset e gruppi di ASP-01 e dichiarare stati, eventi, vincoli e parametri con unità e intervalli. Le sequenze devono essere finite e reversibili; niente codice arbitrario, URL, accessi o nuove authority nei manifest. Le capacità iniziali sono selezione di camera, profilo di illuminazione e movimento ALS, con default statico e rispetto di movimento ridotto. Un adattatore Blender e uno WebGL interpreteranno lo stesso contratto, senza pretendere identità fotometrica. Nella tranche L1 il contratto è progettuale: non esiste ancora un interprete ASD-01 né una UI operativa.

## Progressione governata

- L1: leggere inventario e prove, recuperare regole candidate con fonti e limiti; test reali e negativi.
- L2: acquisire una fotografia di scena effettiva mediante adattatori di sola lettura (Blender e WebGL), misurare cambiamenti di inventario e confrontare inquadrature. Aggiornamenti live effimeri; promozioni solo deliberate.
- L3: proporre una regia dichiarativa valida, spiegare alternative e richiamare fallimenti precedenti; verificare compatibilità, accessibilità e costo.
- L4: preparare una variante reversibile in ambiente isolato, conservare confronto ed esito; nessun effetto sul master.
- L5: solo procedure specificamente autorizzate dopo le necessarie verifiche e revisione umana. Non fa parte di questa PR.

## Gate L1

Sei regole collegate alle prove reali, query selettiva, inventario master, fonti mancanti e superate bloccate, nessuna promozione di authority, nessuna scrittura al runtime, risultato ripetibile a parità di input. Conservare ricevuta del collaudo e registrare l'esito nel dossier ASP-01. Il raccordo tecnico con Context Pack e l'osservazione del renderer sono fasi successive. Nessun dato personale o studente, nessun servizio esterno, nessuna spesa.

## ASD-01/P1 — Controllo parametrico (18 novembre 2026)

Requisito espresso dall'utente: il sistema deve poter controllare parametricamente l'ambiente tridimensionale. I parametri non sono comandi liberi: sono proprietà tipizzate con identificativo, dominio, unità, valore di riferimento, intervallo o insieme consentito, collegamento al motore, fonte e stato di qualificazione.

### Primo incremento operativo: pianificazione senza applicazione

Il registro `ops/atlas-scene-director/parameters.json` dichiara 11 parametri iniziali. La funzione `scripts/scene-director.py` produce un piano deterministico e reversibile: controlla versione del master, impronta dello stato di riferimento, tipo, intervallo, destinatario e dipendenze; restituisce stato candidato, differenze, configurazione di ripristino e verifiche necessarie. Rifiuta proprietà sconosciute o protette, valori non finiti e richieste che pretendono nuove autorizzazioni.

Il riferimento WebGL deriva dal codice nativo (orbita, inclinazione, distanza, esposizione e tre coefficienti luminosi, movimento ALS). Gli intervalli luminosi sono ipotesi circoscritte per futuri esperimenti, non valori già qualificati. Blender espone le sette camere effettivamente conservate e la visibilità ALS. La scelta di una camera diversa dall'atrio con ALS visibile richiede l'adattatore ottico per riproiettare i punti. L'attivazione del movimento richiede adesione esplicita e assenza della preferenza di movimento ridotto. Non si altera il limite R4 delle luci.

Esempi: `python3 scripts/scene-director.py --example webgl` e `python3 scripts/scene-director.py --example blender`. Il primo piano varia orbita ed esposizione e richiede confronto con P1; il secondo seleziona la camera verticale e richiede riproiezione ALS. Sono piani, non esecuzioni.

### Modello di estensione

- Osservazione: ASI legge il valore reale, unità, identità della scena e versione del parametro; il valore corrente non va confuso con il riferimento di catalogo.
- Proposta: obiettivo e vincoli -> insieme di parametri candidati, dipendenze e confronto atteso.
- Regia: ASD verifica proprietà e relazioni; gli adattatori specifici applicheranno soltanto piani autorizzati a copie isolate. Nessuna applicazione nella tranche P1.
- Verifica: misure e immagini prima/dopo, costo grafico, accessibilità, invarianti. In caso di errore ripristino esatto; conservazione dell'evidenza negativa.
- Memoria: TRAMA-DE-01 registra ragioni, configurazioni, risultati e limiti. ASI recupera strategie con fonte e stato, senza elevare autonomamente un esperimento a regola approvata.

Le future proprietà comprendono trasformazioni e gruppi geometrici, materiali PBR, luce e ombra, atmosfera, sequenze, comportamento degli oggetti, suono, prestazioni e navigazione. In P1 geometria, materiali, navigazione, sicurezza, ottica ALS e audio sono protetti: non esiste un adattatore qualificato per le rispettive modifiche. Il controllo parametrico deve essere estendibile, non autorizzare tutto indistintamente.

L'osservazione diretta L2 e un interprete ASD su copie del master sono i prossimi incrementi, da qualificare separatamente. Nessun nuovo motore, servizio esterno, costo, pubblicazione o modifica del master. Il piano è vincolato alla fotografia di riferimento, non al valore letto in tempo reale: la rilevazione di stato live e la verifica pre-applicazione restano da attuare.

## Ideatore dei mondi — requisito di prodotto e prova di riuso

Indirizzo dell'utente, 18 novembre 2026: le capacità ASP/ASD/ASI hanno valore solo se effettivamente utilizzabili e riutilizzabili da un ideatore di mondi. Non si introduce un nuovo prodotto né un secondo editor. L'ideazione è una capacità di Studio Atlas, nel rispetto di TRAMA-ADR-020, del Creator Studio Product Vision, del World Brief e del Compact Learning World Specification v1. Il Pathway Authoring Package rimane il contratto di consegna; un futuro riferimento al pacchetto scena e alla regia è una proposta di estensione, non una modifica già operativa del contratto.

L'ideatore è la persona che determina l'intenzione educativa, narrativa e artistica. Una funzione assistita può elaborare alternative di mondi, confrontarle e tradurre l'idea selezionata in richieste di produzione; non approva autonomamente l'idea, i legami al curricolo, la qualità o la pubblicazione. Il sistema deve essere comprensibile senza conoscere Blender, codice o repository.

Percorso principale: idea e obiettivo -> alternative di mondo -> World Brief (luoghi, identità, situazione, ruolo, azioni, informazioni distribuite, conseguenze, artefatto significativo) -> scelta umana -> progetto di scena e regia -> produzione di una copia isolata -> prova interattiva -> revisione -> conservazione riusabile. Un mondo può essere 2-D o 3-D; la scelta della rappresentazione è subordinata alla funzione educativa, all'accessibilità e alla sostenibilità, non all'uso obbligatorio del 3-D. Le capacità ASD e ASI sono strumenti di produzione e osservazione, ASP conserva il risultato e TRAMA-DE-01 documenta le decisioni.

### Prova verticale di usabilità e trasferibilità (da realizzare)

Usare MUSEO ZERO, già dotato di World Brief e di prova interattiva 2-D nel sistema esistente, come riferimento iniziale per il passaggio tra mondo semantico e regia. Non sostituire la sua esperienza esistente e non dichiararne approvato il 3-D. Scegliere una singola scena, ad esempio Sala Zero/Cabina regia, dopo riesame dell'intenzione narrativa: rendere osservabili i cambi di stato di proiezione, luce e sequenza. Usare unicamente azioni simulate, non indicazioni operative per impianti reali.

Dimostrare poi il trasferimento della medesima grammatica di regia a un secondo piccolo mondo distinto (da scegliere in fase di ideazione), con risorse diverse e stessa interfaccia di parametri/eventi; riusare meccanismi ed evidenze, non copiare la storia o l'obiettivo. Le dipendenze specifiche del master biblioteca non devono essere imposte al secondo mondo. Il catalogo P1 è vincolato al master e richiede una successiva generalizzazione mediante manifesti di capacità e adattatori espliciti. Nessun nuovo motore, nuovo archivio concorrente, servizio a pagamento o pubblicazione.

Criteri di riuscita obbligatori:
1. Un ideatore descrive un'idea in linguaggio naturale, vede alternative comprensibili e può selezionare e correggere il World Brief senza modificare codice.
2. Una scena effettiva è osservata e configurata da parametri/eventi tipizzati; una variante autorizzata è provata e ripristinata senza alterare il master.
3. Una seconda scena appartenente a un mondo distinto riusa almeno una capacità di regia mediante contratto comune e adattatore esplicito, senza duplicarne il motore.
4. Anteprima utilizzabile su schermo mobile e desktop con accessibilità e azioni significative; distinta dalla pubblicazione.
5. Confronti, errori, provenienza, costi e decisioni sono conservati e consultabili; nessun dato personale o profilazione.

La sequenza operativa prioritaria è: completare il collaudo della biblioteca; qualificare osservazione L2 e applicazione reversibile su una copia del master; dimostrare una scena e un secondo mondo. Solo allora estendere l'interfaccia di ideazione e i domini parametrici. Non accumulare infrastruttura non dimostrata. I dieci test P1 e i due piani (run 44346093780, artefatto 14444669398 conservato) provano il pianificatore, non l'effettiva usabilità creativa o il riuso tra mondi.

## ASI-L2 / ASD-P2 — Prima prova effettiva sul master Blender

La prova usa il master Blender portabile già qualificato (artefatto 14444143410, SHA-256 del file f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab). Il manifest di collegamento dichiara identità della scena, camera, collezione ALS e numero atteso di oggetti. Il pianificatore P1 genera la variazione `astral.visible=false`; l'adattatore verifica la corrispondenza tra valori osservati e stato di riferimento prima di applicarla in memoria alla copia di lavoro. Il file originale è in sola lettura, non viene risalvato.

L'osservazione legge direttamente da Blender gli oggetti, le trasformazioni, le appartenenze a collezioni, le dimensioni delle mesh, i riferimenti ai materiali, i nodi e i loro ingressi, luci, camere e immagini. Non è un'ispezione completa di tutti i possibili dati Blender (per esempio non sono ancora campionati i vertici di ogni mesh o tutti i nodi del mondo). L'adattatore è ancora legato alla biblioteca e supporta una sola variazione isolata; non è un interprete generico o un sistema di regia in produzione.

Tre rendering 720×450, con le medesime impostazioni temporanee di prova: riferimento, variante senza ALS, ripristino. Il confronto verifica una differenza visiva osservabile nella variante, equivalenza dello stato osservato e scostamento visivo minimo nel ripristino, e identità SHA-256 dell'originale. Le sole differenze strutturali ammesse riguardano la proprietà `hide_render` dei 18 oggetti ALS e il valore parametrico derivato. Le impostazioni di rendering sono ripristinate. Nessuna nuova spesa, pubblicazione, applicazione alla scena WebGL o autorizzazione studenti.

Il criterio di completamento resta il PASS della prova effettiva, con immagini, inventari, piano, ricevuta e revisione dei risultati. Non dichiarare qualificato il riuso tra mondi: prima occorrono un secondo collegamento indipendente e un esperimento sulla scena corrispondente. Il rilievo di navigazione della biblioteca (#115) resta distinto, aperto e non viene alterato da questa PR.
