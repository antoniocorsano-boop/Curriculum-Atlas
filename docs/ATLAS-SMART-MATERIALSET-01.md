# ATLAS-SMART-MATERIALSET-01 — Contratto del corredo didattico delle Attività smart

Status: `DRAFT_CONTRACT / NO_RUNTIME_AUTHORIZATION / HUMAN_REVIEW_REQUIRED`

Dipende da: `ATLAS-SMART-ACTIVITY-01`.

## 1. Scopo

`materialSetRef` identifica in modo stabile il **corredo didattico coerente** associato a una Attività smart Atlas. Non identifica una cartella né impone duplicazione fisica dei file.

**Vincolo ECO-01/ECO-02:** `materialSetRef` NON costituisce un nuovo percorso materiali tra Atlas e Docente OS. Ogni risorsa Atlas destinata alla preparazione/lezione continua a transitare attraverso i canonici `LessonPreparationManifest.materialSlots`.

Principio di prodotto:

> **rigore interno, semplicità esterna**

Il docente non deve compilare o ricostruire manualmente `materialSetRef`, digest, provenienza, versioni, URL tecnici o mapping verso `materialSlots` nel flusso ordinario.

Invariante tecnico:

`Atlas materialSetRef → risorse governate → mapping deterministico → LessonPreparationManifest.materialSlots → NextLessonPreparation → decisione docente`.

Invariante percepito dal docente:

`lezione → pacchetto pronto → usa / modifica-sostituisci / escludi`.

Nessun runtime di trasformazione è autorizzato da questo documento.

## 2. Identità

Forma logica minima proposta:

```text
materialSetRef = atlas-materialset:<materialSetId>@<version>
```

Requisiti:
- `materialSetId` stabile e non dipendente dal titolo visualizzato;
- `version` immutabile per una fotografia validata del corredo;
- una modifica sostanziale del contenuto genera una nuova versione;
- un eventuale alias `latest` è solo editoriale e non sostituisce il riferimento versionato di una pubblicazione validata;
- l'identità tecnica è normalmente nascosta nella vista docente primaria.

## 3. Manifest concettuale Atlas

Manifest minimo proposto:

```yaml
schemaVersion: atlas.smart.materialset/v1
materialSetId: sistema-tecnologico-analisi
version: 1
activityId: sistema-tecnologico
lessonRef: optional
status: DRAFT | REVIEWED | PUBLISHED | RETIRED
resources:
  - resourceId: sistema-tecnologico-infografica
    kind: INFOGRAPHIC
    title: Analizzare un sistema tecnologico
    audience: STUDENT
    required: true
    publicRef: optional-until-published
    provenanceRef: required-before-publish
    digest: required-before-publish
    materialSlotRole: to-be-mapped-to-canonical-vocabulary
```

È un contratto dati Atlas, non un'autorizzazione a introdurre database, API, nuova persistenza o un manifest parallelo in Docente OS.

## 4. Risorsa

Ogni risorsa deve poter dichiarare internamente:

- `resourceId`;
- `kind`: almeno `INFOGRAPHIC`, `PRESENTATION`, `REFERENCE_TEXT`, `DIAGRAM`, `IMAGE`, `TEACHER_MATERIAL`, `OTHER`;
- `title`;
- `audience`: `STUDENT`, `TEACHER`, `BOTH`;
- `required`;
- `publicRef` quando appropriato;
- `provenanceRef`;
- `digest`;
- `materialSlotRole`, mappato sul vocabolario canonico esistente;
- `mediaType`, `language` e metadati di accessibilità quando necessari.

`kind` descrive formato/uso editoriale Atlas e **non sostituisce** il ruolo canonico del materiale nella preparazione della lezione.

## 5. Regole di provenienza e versione

1. sostituire un file mantenendo lo stesso titolo non conserva automaticamente la validazione precedente;
2. una modifica didatticamente sostanziale richiede nuova versione;
3. correzioni editoriali minori devono comunque restare tracciabili;
4. una Attività smart pubblicata riferisce una versione determinata del material set;
5. una risorsa `TEACHER` non diventa pubblica per semplice presenza nel set;
6. `materialSetRef` non attribuisce autorità curricolare: Arena resta autorità curricolare e Atlas superficie subordinata per pubblicazione/navigazione/LO/materiali.

## 6. Esperienza ordinaria del docente

La procedura ordinaria deve richiedere il **minimo numero di decisioni necessarie**.

### Flusso canonico

1. il docente prepara o richiede l'attività per una lezione;
2. Atlas compone automaticamente **Attività smart + corredo didattico coerente**;
3. il sistema controlla in background identità, versione, audience, provenienza, integrità e disponibilità;
4. il pacchetto viene proiettato nei canonici `materialSlots`;
5. Docente OS lo presenta in **Prima della lezione**;
6. il docente sceglie, quando necessario: **Usa**, **Modifica/Sostituisci**, **Escludi**;
7. Atlas espone agli studenti solo attività e materiali `STUDENT/BOTH` pubblicabili.

Il docente non deve effettuare passaggi tecnici intermedi per ottenere il pacchetto.

### Progressive disclosure

Vista primaria:
- titolo dell'attività;
- materiali disponibili, riconoscibili per funzione;
- anteprima;
- destinatari quando rilevanti;
- stato semplice: **Pronto** oppure **Da verificare**;
- azioni professionali essenziali.

Vista `Dettagli`:
- versione;
- provenienza;
- digest/impronta;
- identificatori tecnici;
- mapping e altre evidenze di integrità.

I dettagli tecnici non devono occupare il percorso primario.

## 7. Personalizzazione della lezione

`required: true` significa che la risorsa appartiene alla fotografia minima validata del pacchetto; non obbliga ogni docente a usarla in ogni lezione.

Il docente conserva l'autorità governata di modificare, escludere, sostituire e adattare le proposte. La personalizzazione:

- avviene nel modello canonico della preparazione/lezione e nei suoi `materialSlots`;
- non riscrive il material set Atlas;
- non modifica silenziosamente la versione pubblicata;
- resta distinguibile dal corredo Atlas di provenienza;
- non trasforma materiale locale in risorsa Atlas o curricolare approvata.

## 8. Esposizione Atlas allo studente

Nella pagina dell'Attività smart, Atlas mostra quando pertinenti i **Materiali dell'attività** destinati a `STUDENT/BOTH`.

Vincoli:
- nessuna autenticazione aggiuntiva per le risorse pubbliche previste;
- nessun materiale `TEACHER` esposto accidentalmente;
- nessun obbligo di download o stampa per completare l'attività;
- il materiale può supportare il compito senza anticiparne meccanicamente la risposta;
- attività e materiali condividono una grammatica concettuale/visuale riconoscibile.

## 9. Proiezione verso Docente OS

La vista prevista è semplice:

```text
Prima della lezione
└─ Analizzare un sistema tecnologico              [Pronto]
   ├─ Attività smart
   ├─ Infografica metodo
   ├─ Infografica dispositivo elettronico
   └─ Presentazione LIM

   Usa     Modifica/Sostituisci     Escludi     Dettagli
```

Questa vista **deriva dai canonici `LessonPreparationManifest.materialSlots`**. Docente OS non consuma `materialSetRef` come canale alternativo.

Proiezione tecnica futura:

```text
Atlas materialSetRef
  → risorse versionate/provenienza
  → mapping ai ruoli canonici
  → LessonPreparationManifest.materialSlots
  → NextLessonPreparation
  → revisione docente
```

`automatic transport != automatic persistence != institutional authority`.

## 10. Stati e gestione degli errori

Gli stati visibili devono restare pochi e comprensibili:

- **Pronto**: il pacchetto può essere utilizzato nel perimetro previsto;
- **Da verificare**: almeno un elemento richiede attenzione prima di dichiarare il pacchetto integralmente pronto.

I sottostati tecnici restano nei dettagli/log.

Se una singola risorsa presenta un problema, il sistema deve:

1. identificare la risorsa interessata;
2. spiegare il problema in linguaggio operativo;
3. offrire, quando consentito, **Riprova**, **Sostituisci**, **Escludi**;
4. preservare il resto del pacchetto quando il contratto lo consente.

Se manca o non è integra una risorsa `required`, il pacchetto non può essere dichiarato integralmente **Pronto**. Nessun errore deve essere nascosto dietro uno stato positivo.

## 11. Validazione minima automatizzabile

Prima della pubblicazione/uso governato il sistema deve poter verificare automaticamente:

- risoluzione di `materialSetRef` a una versione determinata;
- esistenza dei `required`;
- raggiungibilità delle risorse studente dichiarate pubbliche;
- coerenza `audience ↔ superficie`;
- provenienza e digest previsti;
- assenza di riferimenti a risorse ritirate/mancanti;
- mapping valido verso `materialSlots` per le risorse destinate alla lezione;
- coerenza minima tra attività e corredo.

Fail closed per mismatch di versione, provenienza/digest richiesti mancanti, risorsa obbligatoria assente o mapping cross-system non valido.

Questi controlli devono essere **automatici e invisibili nel caso positivo**: non diventano una lista di conferme manuali per il docente.

## 12. SP-01 — pacchetto di riferimento

```text
activityId: sistema-tecnologico
materialSetRef: atlas-materialset:sistema-tecnologico-analisi@1
```

Pacchetto minimo:

1. `sistema-tecnologico-infografica-metodo` — `INFOGRAPHIC` — `STUDENT` — required;
2. `sistema-tecnologico-infografica-dispositivo-elettronico` — `INFOGRAPHIC` — `STUDENT` — required;
3. `sistema-tecnologico-presentazione-lim` — `PRESENTATION` — `BOTH` — required;
4. eventuale testo di riferimento — `REFERENCE_TEXT` — audience da confermare — optional.

L'Attività smart interattiva è il soggetto che riferisce il material set e non viene duplicata in `resources`.

Prima di assegnare `publicRef`, `provenanceRef`, `digest` e `materialSlotRole` reali occorre individuare risorse effettive e vocabolario canonico. È vietato inventare URL, digest o nuovi ruoli.

### Risultato utente atteso

Il docente deve percepire una sola unità:

**Analizzare un sistema tecnologico** — `Pronto/Da verificare`

con attività e tre materiali già raccolti. Non deve ricostruire collegamenti, cercare file o verificare manualmente versioni e provenienza.

## 13. Esito compatibilità ECO-01/ECO-02

Compatibile con:
- Atlas come superficie subordinata per pubblicazione/navigazione/LO/materiali;
- Docente OS teacher-first;
- personalizzazione finale del docente;
- riferimenti versionati e provenienza;
- nessuna approvazione automatica;
- nessuna nuova persistenza server autorizzata;
- nessuna modifica automatica dei contratti Percorsi.

Correzione già recepita: `materialSetRef` è aggregatore Atlas e non percorso parallelo verso Docente OS.

Prima del runtime restano da risolvere:
- schema fisico e vocabolario corrente di `materialSlots`;
- mapping tra `kind` Atlas e ruoli canonici;
- identificatore di provenienza Atlas già previsto dal contratto canonico;
- regole di digest/versionamento già esistenti da riusare.

Questi punti bloccano l'implementazione cross-system, non la progettazione locale Atlas.

## 14. Criterio di accettazione della semplicità

Una implementazione non è conforme se, nel caso ordinario, il docente deve:

- copiare/incollare URL tecnici;
- scegliere manualmente versioni o digest;
- conoscere `materialSetRef` o `materialSlots`;
- ricostruire il pacchetto cercando file separati;
- confermare individualmente controlli tecnici già verificabili dal sistema;
- ripetere la stessa scelta in Atlas e Docente OS senza necessità didattica.

Obiettivo: **una richiesta didattica → un pacchetto coerente → una decisione professionale**.

## 15. Decisioni ancora umane

Prima della stabilizzazione devono essere confermati:
- naming definitivo `materialSetRef`;
- politica versioni maggiori/minori;
- fonte canonica e formato fisico del manifest Atlas;
- mapping esatto su `LessonPreparationManifest.materialSlots`;
- materializzazione/provenienza delle risorse SP-01;
- comportamento UI definitivo in Atlas;
- qualsiasi integrazione runtime con Docente OS, separatamente governata.
