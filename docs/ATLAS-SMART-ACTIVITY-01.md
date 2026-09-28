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

## 5. Collegamento alla lezione

Una Attività smart può essere associata a una lezione come risorsa operativa.

Flusso previsto:

`lezione → Attività smart Atlas → fruizione studente → eventuale riepilogo locale`.

Il collegamento deve poter essere esposto in Docente OS senza trasformare Docente OS nella superficie di fruizione studente. Atlas resta la superficie pubblica dell'attività.

Il collegamento alla lezione deve essere sostituibile o rimovibile dal docente e non deve produrre automaticamente approvazioni curricolari, registrazioni di valutazione o nuove persistenze server.

## 6. Fruizione e privacy

Baseline per le Attività smart pubbliche:

- nessun account studente richiesto;
- nessun tracciamento individuale implicito;
- nessuna telemetria studente introdotta dal contratto;
- nessun salvataggio server implicito;
- se serve continuità durante l'attività, persistenza locale esplicita e comprensibile;
- lo studente deve sapere se e dove le proprie risposte vengono conservate;
- reset e revisione devono essere coerenti con la persistenza realmente disponibile.

Qualunque estensione oltre questa baseline richiede un contratto e una decisione separati.

## 7. Visualizzazione e interazione

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
- la LIM deve permettere al docente di spiegare la struttura senza dipendere da testo minuto.

## 8. Impalcatura e autonomia

L'impalcatura deve essere proporzionata al compito e all'età degli studenti.

Una Attività smart può essere fortemente guidata quando è collegata a una lezione mediata dal docente. Deve tuttavia evitare di sostituire il ragionamento con una sequenza di suggerimenti che anticipano le risposte.

Quando l'obiettivo è il trasferimento, l'attività deve rendere riconoscibile il metodo appreso e chiedere almeno una rielaborazione o applicazione motivata, senza fingere di misurare trasferimento spontaneo se il compito rimane guidato.

## 9. Ciclo di prototipazione smart

Percorso operativo preferito:

`bisogno didattico → modello cognitivo → prototipo → controlli automatici proporzionati → anteprima exact-head → prova docente su smartphone/LIM → correzione mirata → decisione umana → pubblicazione`.

Principi:

- evitare cicli di certificazione sproporzionati per ogni micro-variazione;
- non saltare i controlli essenziali di accessibilità, privacy, persistenza e comportamento;
- usare l'anteprima exact-head per giudicare il comportamento reale prima della pubblicazione;
- nessun merge o pubblicazione canonica automatica come conseguenza dei soli test.

## 10. Criteri minimi di uscita

Una Attività smart è candidata alla pubblicazione solo quando:

1. lo scopo didattico è esplicito;
2. ogni schermata corrisponde a un compito cognitivo riconoscibile;
3. le richieste articolate sono scomposte o rappresentate visualmente quando necessario;
4. smartphone e LIM sono utilizzabili;
5. accessibilità e focus non presentano blocchi noti;
6. privacy e persistenza corrispondono a quanto dichiarato all'utente;
7. non esistono promesse funzionali simulate come reali;
8. il docente ha potuto provare un'anteprima vincolata all'exact head;
9. la decisione finale di pubblicazione resta umana.

## 11. Promozione a Percorso

Una Attività smart può generare un candidato Percorso quando emerge valore didattico riusabile oltre la singola lezione.

La promozione richiede esplicitamente:

- ridefinizione degli obiettivi di autonomia e trasferimento;
- progettazione della progressione e della riduzione dell'impalcatura;
- eventuale variazione dei contesti;
- revisione delle evidenze e dei feedback;
- nuova validazione pedagogica/accessibilità;
- decisione umana.

Non è ammessa una conversione automatica.

## 12. Applicazione iniziale: SP-01

`SP-01 — Analizzare un sistema tecnologico` è il primo caso di riferimento per questo contratto.

La prossima revisione deve preservare i sette passaggi ma sostituire, dove necessario, le domande aggregate con organizzatori cognitivi coerenti:

1. **Sistema** — scelta/identificazione;
2. **Bisogno e funzione** — bisogno → funzione → componenti → relazioni;
3. **Funzionamento** — entrate → trasformazione → uscite → collegamento;
4. **Energia** — fonte → forma in ingresso → trasformazione → energia utile; dispersioni; efficienza;
5. **Risorse** — risorse/materiali → funzione → criticità, con `non pertinente` quando necessario;
6. **Ciclo di vita e impatto** — materie prime → produzione → trasporto → uso → fine vita; risorse/energia/emissioni/rifiuti/ecosistemi; individuazione motivata dell'impatto rilevante;
7. **Sostenibilità** — problema → intervento → effetto atteso → motivazione.

Il riepilogo non costituisce un ottavo passaggio: ricompone le strutture prodotte e richiede una conclusione motivata sulle relazioni tra funzionamento, energia, risorse e ambiente.

## 13. Stato di governance

Questo documento formalizza il contratto proposto ma **non autorizza da solo merge, pubblicazione canonica, modifica di Percorsi o nuove capacità runtime**.

Prima della stabilizzazione richiede:

- verifica di coerenza con i contratti Percorsi esistenti;
- revisione umana del contratto;
- riallineamento di SP-01;
- nuova anteprima exact-head e collaudo didattico-visivo.
