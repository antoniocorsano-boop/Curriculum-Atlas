# ATLAS-SMART-MATERIALSET-01 — Contratto del corredo didattico delle Attività smart

Status: `DRAFT_CONTRACT / NO_RUNTIME_AUTHORIZATION / HUMAN_REVIEW_REQUIRED`

Dipende da: `ATLAS-SMART-ACTIVITY-01`.

## 1. Scopo

`materialSetRef` identifica in modo stabile il **corredo didattico coerente** associato a una Attività smart Atlas. Non identifica una cartella né impone duplicazione fisica dei file.

**Vincolo di compatibilità ECO-01/ECO-02:** `materialSetRef` NON costituisce un nuovo percorso materiali tra Atlas e Docente OS. Ogni risorsa Atlas destinata alla preparazione/lezione deve continuare a transitare attraverso i canonici `LessonPreparationManifest.materialSlots`.

Pertanto:

- `materialSetRef` è un descrittore/aggregatore Atlas del corredo;
- `materialSlots` resta il contratto canonico di trasporto/consumo dei materiali nella preparazione della lezione;
- l'eventuale proiezione di un material set verso Docente OS deve essere una trasformazione deterministica `materialSet resources -> materialSlots`, non un secondo canale;
- nessun runtime di tale trasformazione è autorizzato da questo documento.

Invariante concettuale:

`lezione ↔ LessonPreparationManifest.materialSlots ↔ risorse Atlas`

con `materialSetRef` utilizzabile in Atlas per dichiarare che più risorse appartengono allo stesso corredo didattico.

## 2. Identità

Forma logica minima proposta:

```text
materialSetRef = atlas-materialset:<materialSetId>@<version>
```

Requisiti:
- `materialSetId` stabile e non dipendente dal titolo visualizzato;
- `version` immutabile per una fotografia validata del corredo;
- titolo e descrizione possono cambiare solo generando una nuova versione quando il cambiamento modifica il contenuto didattico o la risorsa effettivamente fruita;
- un alias `latest` può esistere solo per navigazione editoriale e non può sostituire il riferimento versionato usato da una pubblicazione validata.

Il naming resta proposto finché una decisione umana non lo stabilizza.

## 3. Manifest concettuale Atlas

Il manifest minimo proposto è:

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

Questo è un contratto dati Atlas, non un'autorizzazione a introdurre database, API, nuova persistenza o un manifest parallelo in Docente OS.

## 4. Risorsa

Ogni elemento di `resources` deve poter dichiarare:

- `resourceId`: identità stabile nel material set;
- `kind`: almeno `INFOGRAPHIC`, `PRESENTATION`, `REFERENCE_TEXT`, `DIAGRAM`, `IMAGE`, `TEACHER_MATERIAL`, `OTHER`;
- `title`;
- `audience`: `STUDENT`, `TEACHER`, `BOTH`;
- `required`: se la risorsa appartiene alla fotografia minima validata;
- `publicRef`: destinazione pubblica solo quando appropriata;
- `provenanceRef`: riferimento alla provenienza del contenuto;
- `digest`: impronta del contenuto effettivamente validato, quando materializzato/pubblicato;
- `materialSlotRole`: mapping verso il vocabolario canonico dei ruoli di `materialSlots`, da riusare e non ridefinire;
- `mediaType` e `language` quando utili;
- `accessibility`: eventuali metadati necessari, ad esempio testo alternativo o disponibilità di equivalente testuale.

`kind` descrive il formato/uso editoriale Atlas; **non sostituisce il ruolo canonico del materiale nella preparazione della lezione**.

## 5. Regole di provenienza e versione

Una risorsa richiesta non è considerata integra per la pubblicazione se manca la provenienza prevista o se il digest dichiarato non corrisponde al contenuto distribuito.

Regole:

1. sostituire un file mantenendo lo stesso titolo **non** conserva automaticamente la validazione precedente;
2. una modifica didatticamente sostanziale richiede nuova versione del material set;
3. una correzione puramente editoriale può seguire una politica di revisione minore, da definire separatamente, ma deve restare tracciabile;
4. una Attività smart pubblicata deve riferirsi a una versione determinata del material set, non a una collezione mutevole;
5. una risorsa `TEACHER` non può acquisire un `publicRef` studente per semplice presenza nel set;
6. `materialSetRef` non attribuisce autorità curricolare alle risorse: Arena resta l'autorità curricolare e Atlas resta subordinato per pubblicazione/navigazione/LO/materiali.

## 6. Required, optional e sostituzioni nella lezione

`required: true` significa: la risorsa fa parte del pacchetto con cui quella versione dell'attività è stata progettata/validata. Non significa che ogni docente sia obbligato a usarla durante ogni lezione.

Nel contesto Docente OS il docente conserva l'autorità già governata di modificare, escludere, sostituire e adattare le proposte. Questa personalizzazione:

- avviene nel modello canonico della preparazione/lezione e nei suoi `materialSlots`;
- non riscrive il material set Atlas;
- non modifica silenziosamente la versione pubblicata Atlas;
- deve essere distinguibile dal corredo Atlas di provenienza;
- non trasforma un materiale locale in risorsa Atlas o curricolare approvata.

## 7. Esposizione Atlas

Nella pagina dell'Attività smart, quando il material set contiene risorse `STUDENT` o `BOTH` pubblicate, Atlas deve poter mostrare un'area **Materiali dell'attività** con collegamenti riconoscibili per tipo e titolo.

La navigazione non deve obbligare lo studente a scaricare o stampare un documento per poter completare l'attività. Un file scaricabile può essere un supporto, non il prerequisito operativo implicito.

Le risorse `TEACHER` non compaiono nella superficie pubblica studente.

## 8. Proiezione verso Docente OS

La lezione deve poter ricevere una vista del pacchetto:

```text
Prima della lezione
├─ Materiali da mostrare / consultare
├─ Attività smart da aprire o condividere
└─ Eventuali materiali docente
```

Questa vista **deve derivare dai canonici `LessonPreparationManifest.materialSlots`**. Non è autorizzato un consumo diretto di `materialSetRef` da parte di Docente OS come percorso alternativo.

Proiezione concettuale futura:

```text
Atlas materialSetRef
  -> risorse versionate/provenienza
  -> mapping ai ruoli canonici
  -> LessonPreparationManifest.materialSlots
  -> NextLessonPreparation / revisione docente
```

Il docente mantiene la decisione finale. Il trasporto può in futuro essere automatizzato secondo governance, ma `automatic transport != automatic persistence != institutional authority`.

## 9. Validazione minima

Prima della pubblicazione canonica di una Attività smart con material set:

- `materialSetRef` deve risolversi a una versione determinata;
- tutti i `required` devono esistere;
- le risorse pubbliche studente devono essere raggiungibili senza autenticazione aggiuntiva;
- audience e superficie di esposizione devono coincidere;
- provenienza e digest richiesti devono essere presenti e coerenti;
- nessun collegamento deve puntare a una risorsa ritirata o mancante;
- attività e materiali devono risultare coerenti sul piano concettuale e visuale;
- ogni risorsa destinata alla lezione deve avere un mapping valido verso il vocabolario canonico `materialSlots` prima di qualsiasi integrazione cross-system;
- nessuna risorsa Atlas può bypassare `materialSlots` per arrivare a Docente OS;
- la decisione di pubblicazione resta umana.

Fail closed per mismatch di versione, provenienza/digest richiesti mancanti, risorsa obbligatoria assente o mapping cross-system non valido.

## 10. SP-01 — manifest iniziale proposto

Identità proposta:

```text
activityId: sistema-tecnologico
materialSetRef: atlas-materialset:sistema-tecnologico-analisi@1
```

Corredo minimo da materializzare/ricollegare:

1. `sistema-tecnologico-infografica-metodo` — `INFOGRAPHIC` — `STUDENT` — required;
2. `sistema-tecnologico-infografica-dispositivo-elettronico` — `INFOGRAPHIC` — `STUDENT` — required;
3. `sistema-tecnologico-presentazione-lim` — `PRESENTATION` — `BOTH` — required;
4. eventuale testo di riferimento — `REFERENCE_TEXT` — audience da confermare — optional.

L'Attività smart interattiva non viene duplicata dentro `resources`: è il soggetto che riferisce il material set.

Prima di assegnare `publicRef`, `provenanceRef`, `digest` e `materialSlotRole` reali occorre individuare le risorse effettivamente pubblicate/materializzate e il vocabolario canonico applicabile. **È vietato inventare URL, digest o nuovi ruoli quando esiste già un vocabolario governato.**

## 11. Esito del controllo di compatibilità ECO-01/ECO-02

Controllo eseguito rispetto alla memoria governata integrata Arena/Docente OS.

### Compatibile

- Atlas come superficie subordinata per pubblicazione/navigazione/LO/materiali;
- Docente OS teacher-first;
- personalizzazione finale del docente;
- riferimenti versionati e provenienza visibile;
- nessuna approvazione automatica;
- nessuna nuova persistenza server autorizzata;
- nessuna modifica automatica dei contratti Percorsi.

### Correzione necessaria recepita

La prima formulazione di `materialSetRef` poteva essere interpretata come un percorso parallelo `Atlas materialSet -> Docente OS`. Questo sarebbe in conflitto con l'invariante ECO-01/ECO-02 secondo cui **ogni risorsa Atlas-backed deve restare nei canonici `LessonPreparationManifest.materialSlots` e nessun percorso materiali parallelo è autorizzato**.

Il contratto è quindi corretto: `materialSetRef` è un aggregatore Atlas e, per l'uso nella lezione, deve essere proiettato nei `materialSlots` canonici.

### Non ancora verificato / da risolvere prima del runtime

- schema fisico esatto e vocabolario corrente dei `materialSlots` nelle baseline integrate;
- mapping uno-a-uno o uno-a-molti tra `kind` Atlas e ruoli canonici;
- eventuale identificatore di provenienza Atlas già previsto dal contratto canonico;
- regole esatte di digest/versionamento già presenti, da riusare senza duplicazione.

Questi punti bloccano una implementazione cross-system, **non** la progettazione locale Atlas del material set.

## 12. Decisioni ancora umane

Prima della stabilizzazione devono essere confermati:

- naming definitivo del riferimento (`materialSetRef` è la proposta corrente);
- politica versioni maggiori/minori;
- fonte canonica e formato fisico del manifest Atlas;
- mapping esatto sul contratto `LessonPreparationManifest.materialSlots` già integrato;
- materializzazione e provenienza delle tre risorse SP-01 già prodotte;
- comportamento UI definitivo in Atlas;
- qualsiasi successiva integrazione con Docente OS, che resta separatamente governata.
