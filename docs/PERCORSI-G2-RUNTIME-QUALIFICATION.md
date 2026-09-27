# Percorsi G2 — Runtime Qualification Gate

## Stato
Authority: issue #44.
Baseline: `323d9f445e69216303b4c88f814b87657b7dc378`.
Stato vincolante: `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`.

Questo documento non autorizza il runtime studente e non modifica G2.4. Definisce esclusivamente le condizioni per una futura decisione umana separata.

## Invarianti
- nessun account studente;
- nessun learner-write;
- nessuna analytics, profilazione, classifica o punteggio studente;
- nessuna risposta o dato personale inviato ad Atlas;
- sessione anonima e locale come modello di riferimento;
- contenuto cognitivo separato dalla grammatica di presentazione;
- H1/H2 PASS per G2.4 non equivalgono ad autorizzazione runtime;
- laboratorio e superficie pubblica autorizzata restano distinti;
- nessuna promozione implicita derivante dal merge.

## Q1 — Superficie pubblica e ingresso
Definire una route pubblica distinta dal laboratorio e un ingresso coerente da Atlas. `/percorsi/lab/**` non è superficie studente autorizzata.

Evidenza: mappa route/entrypoint e controllo che nessun collegamento pubblico presenti il laboratorio come runtime autorizzato.

## Q2 — Sessione anonima e locale
Lo stato della sessione resta sul dispositivo. Nessuna risposta, scelta, identificatore personale o profilo viene scritto lato server.

Evidenza: ispezione flusso dati e test rete/archiviazione che dimostrino zero learner-write.

## Q3 — Offline, PWA e reset
Specificare comportamento offline, caching consentito, invalidazione versioni e reset locale. Nessuna persistenza può trasformarsi in tracciamento studente.

Evidenza: matrice online/offline/reload/reset e verifica versione servita.

## Q4 — Matrice di compatibilità
Qualificare almeno desktop, smartphone e LIM, tastiera e una combinazione reale con tecnologia assistiva. I controlli automatici non sostituiscono l'evidenza umana.

Evidenza: matrice dispositivo/browser/input/tecnologia assistiva vincolata all'exact head.

## Q5 — Provenienza, versione e ritiro
Ogni percorso pubblicabile ha identità/versione verificabili, provenienza e stato di pubblicazione. Deve essere possibile ritirare una versione preservando la tracciabilità.

Evidenza: contratto publication identity e prova di ritiro/rollback.

## Q6 — Confine editoriale
Solo contenuti esplicitamente qualificati come pubblicabili possono raggiungere la superficie studente. Fixture, prototipi, scenari di laboratorio e contenuti non approvati restano esclusi.

Evidenza: regola verificabile automaticamente, o equivalente, contro la promozione accidentale del laboratorio.

## Q7 — Privacy e sicurezza
Sul candidato esatto rieseguire i controlli pertinenti, verificando zero telemetria studente, zero dati personali e assenza di endpoint di scrittura delle risposte.

Evidenza: receipt sul medesimo exact head candidato.

## Q8 — Rollback e kill-switch
La superficie pubblica deve poter essere disabilitata o ritirata senza modificare retroattivamente le evidenze e senza usare il laboratorio come fallback studente.

Evidenza: procedura e prova controllata di rollback/disable.

## Q9 — Decisione umana finale
`RUNTIME_AUTHORIZED` può essere registrato solo dopo PASS di Q1–Q8 sul medesimo exact head. La decisione è esplicita, umana e separata dal merge tecnico.

Fino ad allora: `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`.

## Ordine di lavoro
1. formalizzare contratti e validator non-runtime;
2. produrre candidato isolato senza esposizione pubblica;
3. controlli automatici ed evidenze exact-head;
4. matrice umana;
5. freeze exact head;
6. review indipendente;
7. decisione umana finale `RUNTIME_AUTHORIZED`.

Qualunque modifica successiva all'exact head richiede nuova qualificazione per gli aspetti impattati.