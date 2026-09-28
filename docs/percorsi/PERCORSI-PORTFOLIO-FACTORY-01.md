# PERCORSI-PORTFOLIO-FACTORY-01

**Stato:** DRAFT / FACTORY_IMPLEMENTED / NOT_RUNTIME_AUTHORIZED  
**Baseline:** `362972202208ada9798e089ea20ac2aa90ded264`

## Obiettivo

Trasformare Percorsi da sviluppo artigianale per singolo caso a pipeline governata e ripetibile:

`portfolio → seed → candidate G2 → dossier → validator → review`

La Factory non autorizza runtime e non sostituisce la revisione pedagogica umana. Riduce il lavoro manuale ripetitivo e impedisce backlog informale.

## Backlog-zero

Il portafoglio canonico usa solo tre stati:

- `IMPLEMENTED`: percorso reale già materializzato;
- `RECOVERED_NAME_ONLY`: nome certo recuperato, identità tecnica non ancora ricostruita;
- `RECOVERY_PENDING`: slot noto del portafoglio, ma nome non recuperato con affidabilità.

Nessun percorso nuovo viene creato fuori dal portafoglio.

## Territori trasversali recuperati

1. Conosci te stesso
2. Impara a imparare
3. Incontra gli altri
4. Affronta problemi
5. Agisci nel mondo
6. Progetta

## Grammatiche recuperate

Il registro canonico comprende 11 grammatiche di progetto: narrazione visuale sequenziale; audiovisiva; ramificazione/conseguenze; indagine/evidenze; costruzione/laboratorio; simulazione/micromondo; teatro/punti di vista; taccuino riflessivo; mappa/esplorazione; costruzione condivisa; narrazione ambientale.

Sono repertorio di progettazione, non autorizzazioni automatiche.

## Seed v1

Un seed contiene il minimo necessario per costruire un candidato strutturale:

- `pathwayId`, titolo, versione;
- territori;
- competenza trasversale;
- strategia centrale;
- evidenza attesa;
- contesto iniziale e contesto di trasferimento;
- provenienza;
- quattro funzioni cognitive governate.

Il compilatore produce automaticamente:

- `PathwayDefinition 2.0`;
- semantic units canoniche;
- grafo orientamento → pratica → trasferimento → riflessione;
- grammatiche L/N con parità semantica;
- governance `NOT_RUNTIME_AUTHORIZED`;
- dossier standard.

Il risultato è un **implementation candidate scaffold**, non contenuto finale pubblicabile.

## Gate

La Factory è valida solo se:

1. il seed rispetta lo schema;
2. il candidato prodotto passa `validate-g2-pathway.mjs`;
3. output identico da input identico;
4. nessun output contiene `RUNTIME_AUTHORIZED`;
5. nessun seed può inventare un percorso fuori dal portafoglio senza prima registrarlo con decisione governata.

## Review umana residua

Restano umani e non automatizzabili:

- qualità pedagogica;
- adeguatezza per età;
- validità delle evidenze;
- equivalenza editoriale reale L/N;
- accessibilità con tecnologie assistive;
- decisione Q9/runtime.
