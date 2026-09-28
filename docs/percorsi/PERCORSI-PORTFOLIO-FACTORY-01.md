# PERCORSI-PORTFOLIO-FACTORY-01

**Stato:** FACTORY_IMPLEMENTED / AUTHORITY_REALIGNED / NOT_RUNTIME_AUTHORIZED

## Correzione di autorità

La prima versione della Factory ha commesso un errore di ricostruzione: ha interpretato gli otto journey operativi B01–B08 come otto Percorsi studente.

La fonte canonica recuperata è invece **TRAMA PR #96**, exact head:

`dfb5b106708bee88016907c13ee0d104c093e7ca`

Riferimenti principali:
- `workflow/CANONICAL-INDEX-v1.md`;
- `workflow/backlog-zero-consolidation-plan-v1.md`;
- `architecture/productive-pathway-workflow-v1.md`;
- `grammars/registry.yaml`;
- `templates/PATHWAY-DOSSIER-TEMPLATE.md`;
- `pedagogical-model.md`.

## Modello corretto

Percorsi non ha un numero fisso di otto elementi.

La struttura corretta è:

`territori di competenza → intake → dossier → evidenze → grammatica → narrativa → safeguards → storyboard → validazione → specifica → autorizzazione runtime separata`

Il registry è **aperto e governato**: contiene solo pathway realmente identificati. Un nuovo pathway entra nel registry mediante decisione governata; la Factory non crea slot vuoti e non inventa nomi.

## Backlog-zero

`BACKLOG_ZERO` significa che ogni artefatto significativo termina il ciclo classificato e rintracciabile. Non significa preallocare un numero di percorsi.

La classificazione canonica TRAMA è:
- `CANONICAL`;
- `SUPPORTING`;
- `EXPERIMENTAL`;
- `SUPERSEDED`;
- `ARCHIVE_CANDIDATE`.

## Territori

I sei territori restano organizzativi, non corsi fissi né dimensioni psicologiche:
1. Conosci te stesso;
2. Impara a imparare;
3. Incontra gli altri;
4. Affronta problemi;
5. Agisci nel mondo;
6. Progetta.

## Factory

La Factory resta valida come automazione di **candidati strutturali**:

`seed registrato → PathwayDefinition G2 → dossier → validator → review`

Non sostituisce W0–W10 di TRAMA e non autorizza qualità pedagogica, pubblicazione o runtime.

## Vincolo

`Verificare e correggere` appartiene al vecchio insieme di journey operativi B01–B08 e non deve comparire come Percorso studente Atlas.

## Runtime

Sempre `NOT_RUNTIME_AUTHORIZED` finché i gate governati non autorizzano esplicitamente il candidato.
