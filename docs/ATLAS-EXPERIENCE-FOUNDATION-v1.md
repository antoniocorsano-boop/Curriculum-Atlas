# Atlas Experience Foundation (AXF) — decisione progettuale e piano di qualificazione v1
Data: 15 novembre 2026. Stato: proposta di indirizzo da qualificare; nessuna autorizzazione alla distribuzione agli studenti.
Documento complementare a [Mondi educativi e verticali v1](ATLAS-MONDI-E-VERTICALI-v1.md). Non lo sostituisce.

## 1. Problema e decisione
La revisione mobile del campione Atelier Energia 0.1 (La città delle piccole stelle) mostra una biblioteca navigabile, quattro ambienti, immagini originali, spiegazioni, pulsanti, modello di bilancio e guida docente. L'utente ha rilevato che l'esperienza resta prevalentemente un libro di testo digitale: scorrimento, testo, immagini illustrative e interazioni subordinate alla lettura. Il funzionamento tecnico non dimostra efficacia educativa o adeguatezza al primo ciclo.
Sospendere l'estensione delle pagine didattiche come soluzione principale. Conservare il patrimonio realizzato (testi, asset originali, obiettivi, modelli scientifici, guide, evidenze, versioni) e riutilizzarlo in esperienze in cui l'azione è parte essenziale dell'apprendimento. Non eliminare il libro digitale: resta un formato legittimo, non il formato universale.
Non ripartire da zero, non imporre a tutti gli ambiti un gioco e non produrre un altro prototipo prima di confrontare prodotti maturi.

## 2. Visione invariata
Atlas è una biblioteca generale di mondi educativi per il primo ciclo, non un'app sull'energia. Esplora, Scopri, Comprendi, Sperimenta; sezioni Storie, Laboratori, Scoperte, Percorsi; selezione visuale per tema/interesse, poche scelte per volta, smartphone e LIM, accesso diretto via Padlet solo dopo autorizzazione. Arena è la fonte curricolare; Studio Atlas produce; Atlas organizza e fruisce; TRAMA governa la qualità; Docente OS sostiene il lavoro docente.
Distinguere biblioteca, mondi tematici e singole esperienze. Un motore comune, se qualificato, gestisce scene, oggetti, dialoghi, stati, azioni, conseguenze e accessibilità; renderer specifici possono sostenere altre tipologie. Nessun vincolo a una narrazione o a un motore unico.
Requisiti non negoziabili: costo aggiuntivo zero, nessun account studente, nessuna raccolta di dati/risposte o telemetria non autorizzata, nessun voto automatico, niente pubblicazione non autorizzata, produzione ripetibile e automatizzabile, conservazione e tracciabilità degli originali, accessibilità, adeguatezza per età.

## 3. Riferimenti di esperienza da verificare direttamente
Riferimento principale proposto: Field Day Lab (https://fielddaylab.org/). Non equivale a selezione tecnica né ad autorizzazione di riuso.
- Wake: Tales from the Aqualab — ricerca, esperimenti, modelli, argomentazione: https://fielddaylab.org/play/wake/
- Lost at the Forever Mine — avventura in cui grafici e modelli matematici servono per risolvere problemi: https://fielddaylab.org/play/forevermine/ ; codice candidato https://github.com/fielddaylab/forevermine
- Lakeland — gestione di città e agricoltura, conseguenze sistemiche: https://fielddaylab.org/play/lakeland/ ; codice candidato https://github.com/fielddaylab/lakeland
- Jo Wilder and the Capitol Case — indagine, fonti e interpretazione: https://fielddaylab.wisc.edu/play/jowilder/ ; codice candidato https://github.com/fielddaylab/jo_wilder
- PhET — manipolazione diretta e rappresentazione di fenomeni: https://phet.colorado.edu/it/simulations/energy-forms-and-changes
- Quandary — decisione, prospettive e pensiero critico: https://quandarygame.org/
- Smithsonian Science Education Center — progettazione e costruzione: https://ssec.si.edu/game-center
Per ogni riferimento: verifica del link, osservazione diretta dell'esperienza, età/lingua, dispositivi, azioni cognitive, feedback, accessibilità, privacy, licenze del codice e degli asset. Non assumere che gratuito equivalga a riutilizzabile o privo di telemetria. Alcuni progetti di ricerca possono registrare interazioni: ispezione obbligatoria prima di qualsiasi integrazione.

## 4. Candidati tecnologici, non selezionati
- Phaser — https://github.com/phaserjs/phaser ; https://phaser.io/examples. Candidato prioritario per automazione tramite codice e esperienze web 2D.
- GDevelop — https://github.com/GDevelopApp/GDevelop-examples ; https://gdevelop.io/game-example/free/starting-point-and-click-adventure. Candidato per modelli pronti, scene, eventi e avventure; verificare riproducibilità automatica, costi e condizioni di esportazione.
- SceneryStack — https://scenerystack.org/. Candidato per simulazioni scientifiche accessibili; verificare integrazione, licenze e complessità.
La selezione preliminare Phaser/GDevelop/SceneryStack è una ipotesi, non una decisione definitiva. Non assumere che una soluzione richieda un solo motore. Genially e il libro interattivo H5P non sono la base prioritaria del modello immersivo; possono mantenere un ruolo specifico.
Confrontare: maturità, licenza e asset, esportazione web autonoma, requisiti di rete, dati e telemetria, touch, LIM, tastiera e tecnologie assistive, prestazioni su dispositivi modesti, integrazione con Atlas, produzione ripetibile da Studio Atlas, costo effettivo, manutenzione e compatibilità con la distribuzione esistente.

## 5. Primo caso: La città delle piccole stelle
Lo studente entra in una scena della città, osserva la piazza, esplora dispositivi virtuali, raccoglie informazioni, formula ipotesi, modifica un modello e verifica conseguenze. Personaggi e oggetti partecipano quando utili; le spiegazioni sono contestuali. Il bilancio energetico serve a risolvere un problema, non è una domanda dopo un testo.
Preservare il rigore: dati dichiarati simulati, confronto a parità di servizio nel modello, distinzione conservazione/effetto utile, nessuna diagnosi reale dal modello e nessuna attività elettrica fisica. Taccuino e guida docente separati; evidenze osservabili e restituzione senza raccolta automatica.
Criterio di differenziazione: se la scena si riduce a testo, immagini e pulsanti di avanzamento, non supera la qualificazione. Le azioni devono avere effetti leggibili sul modello, consentire di rivedere le scelte e sostenere l'obiettivo disciplinare.

## 6. Sequenza operativa e criteri di uscita
| Fase | Attività | Evidenza minima |
|---|---|---|
| AXF-01 | Analizzare prodotti maturi Field Day e altri riferimenti | Schede comparabili, esempi concreti, motivazione delle scelte |
| AXF-02 | Verificare codice, licenze, dipendenze, privacy | Matrice dei rischi e delle condizioni di riuso, esiti documentati |
| AXF-03 | Collaudare almeno un esempio esistente | Prova su smartphone e LIM, accessibilità e prestazioni; distinguere prove effettive da mancanti |
| AXF-04 | Confrontare candidati tecnici | Export web ripetibile, costi, automazione, integrazione; scelta motivata o nessuna scelta |
| AXF-05 | Realizzare una sola scena Energia usando base qualificata | Azione significativa, conseguenze, evidenza disciplinare, asset conservati, test tecnici |
| AXF-06 | Verificare trasferibilità ad Agricoltura | Secondo tema con stesso contratto comune, senza duplicare motore o imporre narrazione |
| AXF-07 | Consolidare modello di produzione | Contratti, pipeline, documentazione, qualificazione ATLAS-QE-01, revisioni e autorizzazioni |
Non saltare fasi. Esito tecnico positivo non equivale a efficacia educativa; revisione disciplinare, accessibilità manuale, privacy, diritti e autorizzazioni restano necessari prima del rilascio. Nessuna modifica a pubblicazione studenti in questa fase.

## 7. Stato al consolidamento
Analisi strategica effettuata; nessun motore qualificato, nessun collaudo diretto degli esempi su smartphone/LIM, nessuna verifica completa di licenze, dati o costi. I riferimenti sono una lista di lavoro e non un risultato di collaudo. L'Atelier 0.1 rimane un campione di revisione locale; la sua integrazione nativa e la ricevuta Arena sono ancora da verificare. Non dichiarare AXF-01 conclusa prima delle schede con evidenze.
Prossima azione: AXF-01, confronto documentato delle esperienze mature. Ogni avanzamento deve riferirsi a questo documento, produrre evidenze versionate e aggiornare lo stato senza cancellare l'analisi precedente.
