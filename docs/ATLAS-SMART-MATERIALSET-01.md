# ATLAS-SMART-MATERIALSET-01 — Contratto del corredo didattico delle Attività smart

Status: `DRAFT_CONTRACT / NO_RUNTIME_AUTHORIZATION / HUMAN_REVIEW_REQUIRED`

Dipende da: `ATLAS-SMART-ACTIVITY-01`.

## 1. Scopo

`materialSetRef` identifica in modo stabile il **corredo didattico coerente** associato a una Attività smart Atlas. Non identifica una cartella né impone duplicazione fisica dei file: identifica un insieme governato di risorse e le loro relazioni con attività e lezione.

Invariante:

`lezione ↔ materialSet ↔ Attività smart Atlas`.

Attività e materiali possono evolvere separatamente, ma una versione pubblicata dell'attività deve sapere con quale versione del corredo è stata validata.

## 2. Identità

Forma logica minima:

```text
materialSetRef = atlas-materialset:<materialSetId>@<version>
```

Requisiti:
- `materialSetId` stabile e non dipendente dal titolo visualizzato;
- `version` immutabile per una fotografia validata del corredo;
- titolo e descrizione possono cambiare solo generando una nuova versione quando il cambiamento modifica il contenuto didattico o la risorsa effettivamente fruita;
- un alias `latest` può esistere solo per navigazione editoriale e non può sostituire il riferimento versionato usato da una pubblicazione validata.

## 3. Manifest concettuale

Il manifest minimo è:

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
```

Questo è un contratto dati, non un'autorizzazione a introdurre database, API o nuova persistenza.

## 4. Risorsa

Ogni elemento di `resources` deve poter dichiarare:

- `resourceId`: identità stabile nel material set;
- `kind`: almeno `INFOGRAPHIC`, `PRESENTATION`, `REFERENCE_TEXT`, `DIAGRAM`, `IMAGE`, `TEACHER_MATERIAL`, `OTHER`;
- `title`;
- `audience`: `STUDENT`, `TEACHER`, `BOTH`;
- `required`: se la risorsa appartiene alla fotografia minima validata;
- `publicRef`: destinazione pubblica solo quando appropriata;
- `provenanceRef`: riferimento alla provenienza/autorità del contenuto;
- `digest`: impronta del contenuto effettivamente validato, quando materializzato/pubblicato;
- `mediaType` e `language` quando utili;
- `accessibility`: eventuali metadati necessari, ad esempio testo alternativo o disponibilità di equivalente testuale.

## 5. Regole di provenienza e versione

Una risorsa richiesta non è considerata integra per la pubblicazione se manca la provenienza o se il digest dichiarato non corrisponde al contenuto distribuito.

Regole:

1. sostituire un file mantenendo lo stesso titolo **non** conserva automaticamente la validazione precedente;
2. una modifica didatticamente sostanziale richiede nuova versione del material set;
3. una correzione puramente editoriale può seguire una politica di revisione minore, da definire separatamente, ma deve restare tracciabile;
4. una Attività smart pubblicata deve riferirsi a una versione determinata del material set, non a una collezione mutevole;
5. una risorsa `TEACHER` non può acquisire un `publicRef` studente per semplice presenza nel set.

## 6. Required, optional e sostituzioni nella lezione

`required: true` significa: la risorsa fa parte del pacchetto con cui quella versione dell'attività è stata progettata/validata. Non significa che ogni docente sia obbligato a usarla durante ogni lezione.

Nel contesto Docente OS il docente può accettare, sostituire, escludere o aggiungere materiali per la propria lezione. Questa personalizzazione:

- non riscrive il material set canonico;
- non modifica silenziosamente la versione pubblicata Atlas;
- deve essere distinguibile dal corredo canonico;
- non trasforma un materiale locale in risorsa Atlas approvata.

## 7. Esposizione Atlas

Nella pagina dell'Attività smart, quando il material set contiene risorse `STUDENT` o `BOTH` pubblicate, Atlas deve poter mostrare un'area **Materiali dell'attività** con collegamenti riconoscibili per tipo e titolo.

La navigazione non deve obbligare lo studente a scaricare o stampare un documento per poter completare l'attività. Un file scaricabile può essere un supporto, non il prerequisito operativo implicito.

Le risorse `TEACHER` non compaiono nella superficie pubblica studente.

## 8. Esposizione Docente OS

La lezione deve poter ricevere una vista del pacchetto:

```text
Prima della lezione
├─ Materiali da mostrare / consultare
├─ Attività smart da aprire o condividere
└─ Eventuali materiali docente
```

L'autorità dei contenuti resta quella prevista dall'ecosistema. Docente OS consuma riferimenti e consente personalizzazione contestuale; non diventa il repository canonico del material set.

## 9. Validazione minima

Prima della pubblicazione canonica di una Attività smart con material set:

- `materialSetRef` deve risolversi a una versione determinata;
- tutti i `required` devono esistere;
- le risorse pubbliche studente devono essere raggiungibili senza autenticazione aggiuntiva;
- audience e superficie di esposizione devono coincidere;
- provenienza e digest richiesti devono essere presenti e coerenti;
- nessun collegamento deve puntare a una risorsa ritirata o mancante;
- attività e materiali devono risultare coerenti sul piano concettuale e visuale;
- la decisione di pubblicazione resta umana.

Fail closed per mismatch di versione, provenienza/digest richiesti mancanti o risorsa obbligatoria assente.

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

Prima di assegnare `publicRef`, `provenanceRef` e `digest` reali occorre individuare le risorse effettivamente pubblicate o materializzate. **È vietato inventare URL o digest.**

## 11. Compatibilità con il lavoro esistente

Questo contratto preserva:

- Atlas come superficie pubblica;
- Docente OS teacher-first e personalizzabile;
- nessuna approvazione automatica;
- nessuna nuova persistenza server autorizzata;
- nessuna modifica automatica dei contratti Percorsi;
- possibilità di riuso futuro dello stesso modello per altre Attività smart.

## 12. Decisioni ancora umane

Prima della stabilizzazione devono essere confermati:

- naming definitivo del riferimento (`materialSetRef` è la proposta corrente);
- politica versioni maggiori/minori;
- fonte canonica e formato fisico del manifest;
- mapping con eventuali contratti materiali già esistenti nell'ecosistema, per evitare duplicazioni;
- materializzazione e provenienza delle tre risorse SP-01 già prodotte;
- comportamento UI definitivo in Atlas e Docente OS.
