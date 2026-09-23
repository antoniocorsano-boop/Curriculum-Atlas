# Atlas S3-V2/F1 — Curricolo verticale di istituto e materiali pubblici

## Decisione di prodotto

Atlas è una vista pubblica dell'istituto, non una vista di una singola disciplina.

Il prodotto deve esporre due strutture collegate ma distinte:

1. **Curricolo verticale di istituto**
   - aree/dipartimenti;
   - discipline;
   - ordini di scuola;
   - classi/annualità;
   - nuclei;
   - obiettivi;
   - prerequisiti;
   - raccordi;
   - provenienza curricolare.

2. **Materiali didattici pubblicati**
   - selezione della classe;
   - selezione della disciplina;
   - elenco delle lezioni in ordine;
   - materiali pubblicati per ciascuna lezione.

## Regola privacy

La selezione di classe e disciplina definisce solo un contesto pubblico.

Atlas non richiede:
- account studente;
- profilo individuale;
- tracking personale;
- registro presenze;
- dati anagrafici.

## Autorità

### Arena

Resta l'autorità curricolare.

F1 usa fixture governate e chiaramente marcate come dati dimostrativi. Nessuna fixture deve essere presentata come dato live proveniente da Arena.

### Atlas

Organizza:
- navigazione pubblica del curricolo;
- visualizzazione delle relazioni;
- materiali didattici pubblicati;
- organizzazione per classe, disciplina e lezione;
- risorse editoriali.

### Docente OS

Resta esterno alla runtime F1.

La pubblicazione effettiva di materiali da Docente OS ad Atlas non è autorizzata da questo slice.

## Navigazione pubblica

### Curricolo

Percorso concettuale:

`Istituto → area/dipartimento → disciplina → ordine di scuola → classe/annualità → nucleo → obiettivo`

### Materiali

Percorso concettuale:

`Classe → disciplina → lezioni → materiali pubblicati`

La pagina Materiali deve risultare utile anche senza conoscere la struttura del curricolo.

## Terminologia

- **Risorsa Atlas**: oggetto editoriale/catalogabile.
- **Materiale didattico**: risorsa effettivamente pubblicata e resa disponibile in relazione a una lezione.
- **Lezione**: contenitore ordinato che raggruppa uno o più materiali pubblicati per una classe e una disciplina.

## Criteri F1 aggiornati

F1 può essere considerato pronto per review umana se:

- il curricolo non appare legato a una sola disciplina;
- la struttura verticale di istituto è comprensibile;
- la provenienza delle fixture non viene confusa con Arena live;
- le annualità sono espandibili/collassabili;
- la gerarchia heading è coerente;
- Materiali consente classe → disciplina → lezione;
- nessun dato personale è richiesto;
- mobile e desktop sono entrambi leggibili;
- build, typecheck, lint e gate TRAMA sono PASS.

## Fuori scope

Non sono ancora autorizzati:
- sincronizzazione runtime con Arena;
- pubblicazione runtime Docente OS → Atlas;
- account studenti;
- personalizzazione individuale;
- tracking;
- analytics personali;
- automazioni di adozione docente.
