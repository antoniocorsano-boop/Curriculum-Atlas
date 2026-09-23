# Atlas S3-V2/F3 — Materiali + Risorse

## Decisione di prodotto

F3 rende operativa la distinzione canonica già introdotta in F1:

- **Risorsa Atlas**: oggetto editoriale riusabile, catalogabile e collegabile al curricolo.
- **Materiale pubblicato**: elemento reso disponibile nel contesto di una specifica lezione.

Una risorsa non diventa materiale per il solo fatto di esistere nel catalogo. La relazione nasce esclusivamente da una pubblicazione esplicita nel contesto classe + disciplina + lezione.

## Superfici

### Risorse Atlas

La superficie `/risorse` espone:

- filtro per disciplina;
- filtro per tipologia;
- titolo, descrizione e tipo;
- ordine/i di scuola;
- stato di accessibilità;
- indicazione dei diritti;
- data/periodo di aggiornamento;
- collegamenti curricolari quando disponibili;
- numero di lezioni pubbliche che riusano la risorsa.

Le fixture sono dimostrative. Non costituiscono dati live provenienti da Arena o Docente OS.

### Materiali

La superficie `/materiali` conserva il percorso pubblico:

`classe → disciplina → lezione → materiali pubblicati`

Ogni materiale dichiara se:

- deriva da una Risorsa Atlas; oppure
- è stato pubblicato direttamente per quella lezione.

La pagina non mostra il catalogo generale per evitare di confondere disponibilità editoriale e pubblicazione didattica.

## Autorità e confini

### Arena

Resta l'autorità curricolare. I riferimenti agli obiettivi non duplicano né sostituiscono il curricolo autorevole.

### Atlas

È responsabile del catalogo editoriale e della presentazione pubblica dei materiali effettivamente pubblicati.

### Docente OS

Resta il luogo di preparazione, contesto e decisione docente. F3 non attiva alcuna pubblicazione runtime Docente OS → Atlas.

## Regole di sicurezza e governo

F3 non introduce:

- account studenti;
- profilazione o tracking;
- approvazione automatica;
- adozione automatica di risorse;
- sincronizzazione live con Arena;
- pubblicazione runtime da Docente OS.

## Criteri di accettazione

F3 è pronto per review umana quando:

- la differenza Risorsa / Materiale è visibile senza documentazione esterna;
- `/risorse` è realmente navigabile e filtrabile;
- `/materiali` resta organizzato per classe, disciplina e lezione;
- l'origine Atlas di un materiale è tracciabile quando presente;
- un materiale diretto resta rappresentabile senza inventare una Risorsa Atlas;
- i metadati di accessibilità e diritti sono visibili;
- mobile e desktop non presentano overflow orizzontale;
- build, typecheck, lint, gate TRAMA e gate visuale F3 sono PASS.
