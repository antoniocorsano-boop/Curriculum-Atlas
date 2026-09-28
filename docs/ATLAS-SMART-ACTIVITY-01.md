# ATLAS-SMART-ACTIVITY-01 — Contratto delle Attività smart Atlas

Status: `DRAFT_CONTRACT / HUMAN_REVIEW_REQUIRED`

## 1. Definizione

Una **Attività smart Atlas** è un'esperienza didattica digitale pubblica, leggera e contestuale, normalmente collegabile a una lezione, progettata per rendere rapidamente disponibile allo studente un compito cognitivamente strutturato senza rinunciare ai principi educativo-didattici, di accessibilità, privacy e qualità visuale di Atlas.

`smart` qualifica la rapidità di prototipazione, distribuzione e fruizione. Non autorizza semplificazioni pedagogiche, riduzioni dell'accessibilità o abbassamenti della qualità dei contenuti.

## 2. Confine con Percorsi Atlas

Attività smart e Percorsi condividono una grammatica pedagogica comune, ma hanno scopo e profondità differenti.

### Attività smart
- nasce tipicamente da una lezione o da un'esigenza didattica immediata;
- può prevedere mediazione del docente;
- ha durata e perimetro contenuti;
- deve essere fruibile rapidamente, anche da smartphone e LIM;
- può conservare lo stato solo localmente sul dispositivo quando necessario;
- non richiede account studente per la fruizione pubblica prevista;
- usa una validazione proporzionata al rischio e alla portata;
- può diventare candidata a Percorso solo mediante decisione esplicita e nuova progettazione.

### Percorsi
- costituisce un'esperienza trasversale e strutturata;
- mira a una maggiore autonomia dello studente;
- prevede progressione intenzionale, variazione dei contesti, riduzione graduata dell'impalcatura, trasferimento e riflessione;
- richiede validazione pedagogica, accessibilità e collaudo più approfonditi.

**Divieto:** una Attività smart non diventa automaticamente un Percorso e un collegamento a una lezione non modifica l'autorità curricolare o la governance di Percorsi.

## 3. Grammatica cognitiva comune

La grammatica di riferimento è:

**OSSERVO → SCOMPONGO → COLLEGO → MOTIVO → TRASFERISCO**

Non è obbligatorio rappresentare ogni verbo come schermata separata. La regola di progettazione è:

> **una schermata = un compito cognitivo riconoscibile**

Una schermata può quindi contenere più domande o campi quando appartengono alla stessa operazione cognitiva e la relazione fra essi è resa visibile.

Da evitare come modello predefinito:

`domanda composta → grande campo testuale → domanda composta → grande campo testuale`.

Quando il contenuto possiede una struttura intrinseca, l'interfaccia deve renderla percepibile: sequenze, relazioni, categorie, flussi, confronti, causa-effetto, problema-intervento-effetto.

## 4. Regole pedagogiche riusate da Percorsi

Le Attività smart ereditano i seguenti vincoli già applicati alla revisione di Percorsi:

- equivalenza tra rappresentazione e compito cognitivo;
- orientamento chiaro;
- continuità tra le fasi;
- controllo del carico cognitivo estraneo;
- assenza di indizi involontari che rendano una risposta artificialmente saliente;
- possibilità di revisione senza linguaggio punitivo;
- feedback centrato sul processo e sull'informazione, non sulla persona;
- assenza, salvo esplicita finalità didattica governata, di voto, punteggio o classificazione dello studente;
- nessuna promessa funzionale che il prototipo non esegua realmente;
- trasferimento coerente con il livello di autonomia richiesto.

Le future varianti visuali o narrative devono preservare la parità informativa: immagini, colori, posizione, icone, personaggi o sequenze non devono suggerire la risposta o aggiungere informazioni cognitive non previste.

## 5. Unità didattica operativa: lezione + materiali + Attività smart

Una Attività smart non deve essere trattata come risorsa isolata. Quando nasce per una lezione, appartiene a una **unità didattica operativa coerente** composta almeno da:

`lezione ↔ materiali didattici ↔ Attività smart Atlas`.

I tre elementi hanno ruoli distinti ma devono condividere lo stesso obiettivo, lessico, modello concettuale e livello di approfondimento.

### Materiali didattici associabili

Il corredo può comprendere, secondo necessità:

- infografica o schema visuale per spiegazione/proiezione;
- presentazione per LIM;
- testo o scheda di consultazione;
- immagini, diagrammi o esempi;
- eventuale materiale docente;
- Attività smart interattiva.

Non tutti i formati sono obbligatori. È obbligatorio invece che i materiali effettivamente predisposti siano **esplicitamente associati** alla stessa attività e non diventino file dispersi o collegamenti ricostruiti manualmente.

### Coerenza pedagogica

Il materiale non deve anticipare meccanicamente le risposte dell'Attività smart. Deve fornire concetti, rappresentazioni, esempi e metodo necessari per affrontarla.

L'Attività smart deve quindi poter riusare la stessa grammatica visuale e concettuale dei materiali. Esempio SP-01:

`infografica/presentazione: ENTRATE → TRASFORMAZIONE → USCITE`

corrisponde a

`Attività smart: organizzatore cognitivo ENTRATE → TRASFORMAZIONE → USCITE`.

La relazione deve essere riconoscibile dallo studente senza trasformare il materiale in una soluzione precompilata.

### Identità e collegamento

Ogni Attività smart deve poter dichiarare un riferimento stabile al proprio **insieme di materiali**. Il contratto concettuale minimo del collegamento è:

- `activityId`: identità stabile dell'Attività smart;
- `lessonRef`: riferimento opzionale alla lezione che la utilizza;
- `materialSetRef`: riferimento stabile al corredo didattico associato;
- per ogni risorsa: `resourceId`, `kind`, `title`, `audience`, `publicRef` o equivalente pubblicabile, `version`/digest quando governato.

Questo documento non impone ancora uno schema runtime né autorizza nuova persistenza: definisce l'invariante che una futura implementazione deve rispettare.

### Navigazione

Dalla superficie pubblica Atlas dell'Attività smart deve essere possibile, quando pertinente, raggiungere i **materiali per lo studente** associati senza autenticazione aggiuntiva. I materiali esclusivamente destinati al docente non devono essere esposti per errore nella superficie pubblica.

Da Docente OS, la lezione deve poter presentare il pacchetto in modo unitario: **materiali da mostrare/usare + Attività smart da aprire o condividere**. Docente OS non diventa il repository canonico dei materiali né la superficie studente.

### Integrità del collegamento

La pubblicazione di una Attività smart deve poter verificare che:

- i riferimenti dichiarati ai materiali esistano o siano esplicitamente opzionali;
- le risorse studente dichiarate pubbliche siano realmente raggiungibili nella superficie prevista;
- una nuova versione del materiale non venga silenziosamente scambiata per quella validata con l'attività;
- la rimozione o sostituzione di un materiale non lasci collegamenti apparentemente validi ma non funzionanti.

Il collegamento non deve richiedere duplicazione fisica dello stesso file in più sistemi: deve privilegiare riferimenti stabili e provenienza verificabile.

## 6. Collegamento alla lezione

Una Attività smart può essere associata a una lezione come risorsa operativa, insieme al proprio corredo didattico.

Flusso previsto:

`lezione → materiali didattici + Attività smart Atlas → fruizione studente → eventuale riepilogo locale`.

Il collegamento deve poter essere esposto in Docente OS senza trasformare Docente OS nella superficie di fruizione studente. Atlas resta la superficie pubblica dell'attività e dei materiali studente pubblicabili.

Il docente deve poter sostituire o escludere un materiale o l'attività nel contesto della lezione senza modificare automaticamente il contratto canonico della risorsa. Tali scelte non devono produrre automaticamente approvazioni curricolari, registrazioni di valutazione o nuove persistenze server.

## 7. Fruizione e privacy

Baseline per le Attività smart pubbliche:

- nessun account studente richiesto;
- nessun tracciamento individuale implicito;
- nessuna telemetria studente introdotta dal contratto;
- nessun salvataggio server implicito;
- se serve continuità durante l'attività, persistenza locale esplicita e comprensibile;
- lo studente deve sapere se e dove le proprie risposte vengono conservate;
- reset e revisione devono essere coerenti con la persistenza realmente disponibile.

Qualunque estensione oltre questa baseline richiede un contratto e una decisione separati.

## 8. Visualizzazione e interazione

L'attività deve essere progettata contemporaneamente per **smartphone** e **LIM**, non come semplice riduzione di un layout desktop.

Requisiti minimi:

- gerarchia tipografica leggibile;
- contrasto e focus percepibili;
- bersagli di interazione adeguati;
- progressione e stato comprensibili;
- quantità di testo compatibile con il compito;
- uso di campi lunghi solo quando è realmente richiesta una risposta articolata;
- strutture visuali usate per rendere visibili relazioni cognitive, non come decorazione;
- nessun elemento grafico deve aggiungere indizi involontari;
- riflusso e navigazione devono rimanere utilizzabili su schermi piccoli;
- la LIM deve permettere al docente di spiegare la struttura senza dipendere da testo minuto;
- quando attività e materiali condividono una rappresentazione concettuale, la grammatica visuale deve essere coerente abbastanza da favorire riconoscimento e trasferimento.

## 9. Impalcatura e autonomia

L'impalcatura deve essere proporzionata al compito e all'età degli studenti.

Una Attività smart può essere fortemente guidata quando è collegata a una lezione mediata dal docente. Deve tuttavia evitare di sostituire il ragionamento con una sequenza di suggerimenti che anticipano le risposte.

Quando l'obiettivo è il trasferimento, l'attività deve rendere riconoscibile il metodo appreso e chiedere almeno una rielaborazione o applicazione motivata, senza fingere di misurare trasferimento spontaneo se il compito rimane guidato.

## 10. Ciclo di prototipazione smart

Percorso operativo preferito:

`bisogno didattico → modello cognitivo → corredo materiali + attività → prototipo → controlli automatici proporzionati → anteprima exact-head → prova docente su smartphone/LIM → correzione mirata → decisione umana → pubblicazione`.

Principi:

- progettare materiali e attività come un insieme coerente, pur mantenendoli risorse distinguibili;
- evitare cicli di certificazione sproporzionati per ogni micro-variazione;
- non saltare i controlli essenziali di accessibilità, privacy, persistenza, comportamento e integrità dei collegamenti;
- usare l'anteprima exact-head per giudicare il comportamento reale prima della pubblicazione;
- nessun merge o pubblicazione canonica automatica come conseguenza dei soli test.

## 11. Criteri minimi di uscita

Una Attività smart è candidata alla pubblicazione solo quando:

1. lo scopo didattico è esplicito;
2. ogni schermata corrisponde a un compito cognitivo riconoscibile;
3. le richieste articolate sono scomposte o rappresentate visualmente quando necessario;
4. il corredo didattico associato è identificato e coerente con l'attività;
5. i collegamenti ai materiali dichiarati sono integri e la destinazione docente/studente è rispettata;
6. smartphone e LIM sono utilizzabili;
7. accessibilità e focus non presentano blocchi noti;
8. privacy e persistenza corrispondono a quanto dichiarato all'utente;
9. non esistono promesse funzionali simulate come reali;
10. il docente ha potuto provare un'anteprima vincolata all'exact head comprendente l'attività e, quando previsto, i materiali collegati;
11. la decisione finale di pubblicazione resta umana.

## 12. Promozione a Percorso

Una Attività smart può generare un candidato Percorso quando emerge valore didattico riusabile oltre la singola lezione.

La promozione richiede esplicitamente:

- ridefinizione degli obiettivi di autonomia e trasferimento;
- progettazione della progressione e della riduzione dell'impalcatura;
- eventuale variazione dei contesti;
- revisione delle evidenze e dei feedback;
- revisione del ruolo dei materiali associati nel nuovo Percorso;
- nuova validazione pedagogica/accessibilità;
- decisione umana.

Non è ammessa una conversione automatica.

## 13. Applicazione iniziale: SP-01

`SP-01 — Analizzare un sistema tecnologico` è il primo caso di riferimento per questo contratto.

Il suo corredo iniziale comprende almeno i materiali già predisposti per la lezione — **infografica/e di analisi del sistema tecnologico e presentazione per LIM** — e l'Attività smart. Questi elementi devono essere trattati come un unico insieme didattico collegato, non come prodotti indipendenti.

La prossima revisione deve preservare i sette passaggi ma sostituire, dove necessario, le domande aggregate con organizzatori cognitivi coerenti con gli stessi schemi utilizzati nei materiali:

1. **Sistema** — scelta/identificazione;
2. **Bisogno e funzione** — bisogno → funzione → componenti → relazioni;
3. **Funzionamento** — entrate → trasformazione → uscite → collegamento;
4. **Energia** — fonte → forma in ingresso → trasformazione → energia utile; dispersioni; efficienza;
5. **Risorse** — risorse/materiali → funzione → criticità, con `non pertinente` quando necessario;
6. **Ciclo di vita e impatto** — materie prime → produzione → trasporto → uso → fine vita; risorse/energia/emissioni/rifiuti/ecosistemi; individuazione motivata dell'impatto rilevante;
7. **Sostenibilità** — problema → intervento → effetto atteso → motivazione.

Il riepilogo non costituisce un ottavo passaggio: ricompone le strutture prodotte e richiede una conclusione motivata sulle relazioni tra funzionamento, energia, risorse e ambiente.

## 14. Stato di governance

Questo documento formalizza il contratto proposto ma **non autorizza da solo merge, pubblicazione canonica, modifica di Percorsi, nuova persistenza o nuove capacità runtime**.

Prima della stabilizzazione richiede:

- verifica di coerenza con i contratti Percorsi esistenti;
- revisione umana del contratto;
- definizione/validazione del modello stabile `materialSetRef` e delle sue regole di provenienza/versione;
- riallineamento di SP-01 e collegamento del suo corredo didattico;
- nuova anteprima exact-head e collaudo didattico-visivo del pacchetto completo.
