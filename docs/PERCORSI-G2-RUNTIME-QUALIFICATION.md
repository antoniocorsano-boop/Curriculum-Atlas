# Percorsi G2 — Runtime Qualification Gate

## Stato e autorità

Authority di avanzamento: issue #44.
Baseline di partenza: `323d9f445e69216303b4c88f814b87657b7dc378`.
Stato vincolante fino a decisione Q9 valida: `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`.

Questo contratto non autorizza il runtime studente e non modifica G2.4. Definisce condizioni, identità, evidenze e casi negativi necessari per una futura decisione umana separata. Il merge di questo documento o di artefatti preparatori non equivale mai a `RUNTIME_AUTHORIZED`.

## Invarianti

- nessun account studente;
- nessun learner-write;
- nessuna analytics, telemetria comportamentale, profilazione, classifica o punteggio studente;
- nessuna risposta, scelta, identificatore personale o profilo inviato ad Atlas;
- sessione anonima e locale;
- contenuto cognitivo separato dalla grammatica di presentazione;
- laboratorio e superficie pubblica autorizzata distinti;
- H1/H2 PASS di G2.4 non equivalgono ad autorizzazione runtime;
- ogni gate è fail-closed: evidenza assente, invalida, scaduta o riferita a identità diverse non vale come PASS;
- nessuna promozione implicita può derivare da merge, deploy tecnico, cache, manifest obsoleto o fallback.

## Identità immutabile del candidato

Una qualificazione si riferisce a una `RuntimeCandidateIdentity` composta almeno da:

- `runtimeExactHead`: SHA esatto del codice candidato;
- `pathwayId`: identificatore stabile del percorso;
- `contentVersion`: versione immutabile del contenuto cognitivo;
- `publicationId`: identità della pubblicazione candidata;
- `publicationState`: stato editoriale corrente;
- `authorityRef`: riferimento verificabile all'autorità/decisione editoriale;
- `qualificationContractVersion`: versione di questo contratto.

Q1–Q8 devono riferirsi alla stessa identità. Un mismatch in uno dei campi invalida l'aggregazione dei PASS.

## QualificationReceipt leggibile automaticamente

La decisione Q9 deve consumare una ricevuta strutturata, non il solo testo della PR. Schema logico minimo:

```json
{
  "schemaVersion": "percorsi-g2-runtime-qualification/v1",
  "candidate": {
    "runtimeExactHead": "<sha>",
    "pathwayId": "<id>",
    "contentVersion": "<immutable-version>",
    "publicationId": "<id>",
    "publicationState": "QUALIFIED",
    "authorityRef": "<ref>",
    "qualificationContractVersion": "v1"
  },
  "gates": {
    "Q1": {"status":"PASS","evidenceRefs":["<ref>"],"reviewerClass":"<class>","checkedAt":"<RFC3339>"},
    "Q2": {"status":"PASS","evidenceRefs":["<ref>"],"reviewerClass":"<class>","checkedAt":"<RFC3339>"},
    "Q3": {"status":"PASS","evidenceRefs":["<ref>"],"reviewerClass":"<class>","checkedAt":"<RFC3339>"},
    "Q4": {"status":"PASS","evidenceRefs":["<ref>"],"reviewerClass":"<class>","checkedAt":"<RFC3339>"},
    "Q5": {"status":"PASS","evidenceRefs":["<ref>"],"reviewerClass":"<class>","checkedAt":"<RFC3339>"},
    "Q6": {"status":"PASS","evidenceRefs":["<ref>"],"reviewerClass":"<class>","checkedAt":"<RFC3339>"},
    "Q7": {"status":"PASS","evidenceRefs":["<ref>"],"reviewerClass":"<class>","checkedAt":"<RFC3339>"},
    "Q8": {"status":"PASS","evidenceRefs":["<ref>"],"reviewerClass":"<class>","checkedAt":"<RFC3339>"}
  },
  "decision": {"status":"NOT_RUNTIME_AUTHORIZED","authorityRef":null,"decidedAt":null}
}
```

Per ogni gate lo stato ammesso è `NOT_RUN | PASS | FAIL | BLOCKED`. Solo otto `PASS` validi consentono di sottoporre Q9 alla decisione umana. `reviewerClass` identifica il tipo di evidenza/autore (automatico, umano-accessibilità, indipendente, autorità finale); non contiene dati personali dello studente.

## Q1 — Superficie pubblica e ingresso

Deve esistere una route pubblica distinta dal laboratorio e un ingresso coerente dall'architettura informativa Atlas. `/percorsi/lab/**` non è mai superficie studente autorizzata.

Criteri PASS:

- route pubblica e entrypoint sono dichiarati nel candidato;
- nessun link pubblico presenta `/percorsi/lab/**` come runtime autorizzato;
- route sconosciute, candidate prive di ricevuta o stati editoriali non pubblicabili falliscono chiuse.

Evidenza: mappa route/entrypoint e test automatico dei confini.

## Q2 — Sessione anonima, locale e rete

Lo stato della sessione resta sul dispositivo. Il runtime non invia risposte, scelte, progressi, identificatori personali o profili.

Richieste di rete originate dall'esperienza studente sono ammesse esclusivamente per recuperare risorse statiche/versionate necessarie alla fruizione (`GET`/equivalente read-only). Sono vietati endpoint di scrittura, beacon, analytics, telemetria comportamentale e invii di stato sessione. Eventuali richieste tecniche ulteriori devono essere enumerate e autorizzate esplicitamente prima del PASS; l'assenza di enumerazione le rende vietate.

Evidenza: ispezione del flusso dati e cattura di rete che dimostrino zero learner-write e zero telemetria.

## Q3 — Offline, PWA, persistenza e reset

Sono consentiti solo cache applicative/statiche e stato di sessione locale strettamente necessario, senza identificatori utente. La specifica del candidato deve dichiarare i meccanismi di storage usati, chiavi/namespace, durata e regole di eliminazione.

Criteri PASS:

- cache e contenuto sono version-pinned a `publicationId` + `contentVersion`;
- `reset` elimina integralmente lo stato della sessione del percorso, senza incidere sulle evidenze governate;
- l'aggiornamento a una nuova versione non mescola stato tra versioni;
- una pubblicazione `WITHDRAWN` non può essere avviata da cache come nuova sessione;
- quando online, lo stato di ritiro prevale su manifest/cache locali; offline, un artefatto di cui non è possibile confermare l'autorizzazione corrente deve fallire chiuso per l'avvio di una nuova sessione, mostrando uno stato non distruttivo e non il laboratorio;
- la politica di scadenza/invalidation è esplicita e verificabile.

Evidenza: matrice online/offline/reload/reset/update/withdrawal e ispezione storage.

## Q4 — Matrice minima di compatibilità e accessibilità

Il candidato deve superare almeno:

- desktop: Chromium corrente supportato + Firefox corrente supportato, tastiera;
- smartphone: viewport/touch reale o dispositivo reale rappresentativo, orientamento verticale e orizzontale;
- LIM o ambiente desktop a grande schermo rappresentativo con input disponibile;
- ingrandimento/reflow almeno al 200% e controllo assenza di perdita funzionale;
- focus order e focus visibile;
- semantica e comportamento nativo dei radio: Tab entra/esce dal gruppo, frecce cambiano scelta, Spazio seleziona dove applicabile;
- semantica annunciabile di heading, fieldset/legend, stato e feedback;
- preferenza `prefers-reduced-motion` rispettata per eventuali movimenti non essenziali;
- almeno una prova umana con tecnologia assistiva reale compatibile con la piattaforma scelta, includendo navigazione e comprensione delle alternative e del feedback.

La matrice deve nominare browser/versione, dispositivo/viewport, tipo di input e tecnologia assistiva quando usata. Un controllo automatico non sostituisce la prova umana richiesta.

Evidenza: matrice firmata logicamente e vincolata alla `RuntimeCandidateIdentity`.

## Q5 — Provenienza, versione, stati e ritiro

Macchina a stati editoriale minima:

`LAB -> QUALIFIED -> PUBLISHED -> WITHDRAWN`

Regole:

- `LAB`: mai pubblicabile agli studenti;
- `QUALIFIED`: ha superato i controlli richiesti ma non è ancora autorizzato alla superficie pubblica;
- `PUBLISHED`: richiede Q9 valido e publication identity coerente;
- `WITHDRAWN`: non può essere avviato come nuova sessione pubblica;
- nessuna transizione implicita; ogni transizione conserva provenienza e authority reference;
- metadati mancanti, sconosciuti, invalidi o incoerenti determinano fail-closed;
- il ritiro prevale su manifest, indici e cache obsolete alla prima verifica online utile.

Evidenza: contratto di publication identity, registro transizioni e prova di ritiro.

## Q6 — Confine editoriale e promozione fail-closed

Solo contenuti con `publicationState=QUALIFIED` e identità completa possono essere sottoposti a Q9; solo contenuti con decisione Q9 valida possono diventare `PUBLISHED`. Fixture, prototipi, scenari di laboratorio, contenuti non approvati o con authority metadata mancanti non raggiungono la superficie studente.

Evidenza: validatore machine-checkable che rifiuti almeno LAB, receipt assente, authorityRef assente, mismatch di versione e stato sconosciuto.

## Q7 — Privacy e sicurezza

Sul candidato esatto devono essere rieseguiti i controlli pertinenti. Criteri obbligatori:

- zero learner-write;
- zero telemetria/analytics comportamentale studente;
- zero account/autenticazione studente;
- zero dati personali o identificatori persistenti introdotti dal percorso;
- nessun endpoint di scrittura raggiunto durante la matrice di esercizio;
- storage locale conforme a Q3;
- dipendenze e superficie pubblica sottoposte ai gate di sicurezza applicabili all'ecosistema.

Evidenza: receipt di privacy/security riferita alla stessa `RuntimeCandidateIdentity` e cattura di rete rappresentativa.

## Q8 — Rollback e kill-switch

L'autorità di pubblicazione Atlas deve poter portare una pubblicazione `PUBLISHED -> WITHDRAWN` senza modifica del contenuto storico o delle evidenze. Il kill-switch opera sulla `publicationId` e rimuove/disabilita entrypoint e avvio di nuove sessioni pubbliche.

Criteri PASS:

- esiste un'azione governata e auditabile di disable/withdraw;
- la propagazione è verificata su indice/manifest/superficie pubblica;
- la verifica online successiva non consente un nuovo avvio della pubblicazione ritirata;
- nessun fallback conduce a `/percorsi/lab/**` o a una copia stale presentata come autorizzata;
- la procedura dichiara un obiettivo di propagazione misurabile e il test registra il tempo osservato; il valore operativo definitivo deve essere approvato prima di Q9.

Evidenza: prova controllata di rollback/disable e receipt di propagazione.

## Q9 — Decisione umana finale

L'autorità umana di pubblicazione definita dalla governance Atlas può registrare `RUNTIME_AUTHORIZED` solo quando:

1. esiste una `QualificationReceipt` valida;
2. Q1–Q8 sono tutti `PASS`;
3. tutti i gate si riferiscono alla medesima `RuntimeCandidateIdentity`;
4. `publicationState=QUALIFIED` al momento della decisione;
5. non esistono FAIL/BLOCKED o evidenze scadute/invalidate;
6. la review indipendente del candidato è PASS.

La decisione Q9 registra `authorityRef`, timestamp e identità completa del candidato. Solo dopo tale decisione è ammessa la transizione `QUALIFIED -> PUBLISHED`.

### Invalidazione e revalidation

- modifica di `runtimeExactHead`: invalida Q1–Q8 salvo evidenza deterministica di non impatto formalmente prevista dal validatore; in assenza di tale prova, re-run completo;
- modifica di `contentVersion`, `pathwayId` o `publicationId`: nuova candidate identity, re-run completo;
- modifica di route/entrypoint: invalida almeno Q1, Q4, Q7, Q8;
- modifica di storage/offline/network: invalida almeno Q2, Q3, Q7, Q8;
- modifica UI/interazione: invalida almeno Q4 e i gate di sicurezza/accessibilità impattati;
- modifica di authority/publication metadata: invalida Q5, Q6, Q8 e Q9;
- qualunque mismatch non classificato fallisce chiuso e richiede review indipendente dell'impatto.

Una precedente decisione `RUNTIME_AUTHORIZED` non si trasferisce automaticamente a una nuova identity.

## Casi negativi obbligatori

Il validatore/qualificazione deve dimostrare che ciascuno dei seguenti casi produce `NOT_RUNTIME_AUTHORIZED` e impedisce `PUBLISHED`:

1. `QualificationReceipt` assente o illeggibile;
2. `runtimeExactHead` diverso tra gate e candidato;
3. `contentVersion` o `publicationId` non approvati/mismatched;
4. learner-write rilevato;
5. analytics o telemetria comportamentale rilevata;
6. pubblicazione `WITHDRAWN` ancora avviabile da cache/offline come nuova sessione;
7. matrice Q4 incompleta o prova umana di tecnologia assistiva assente;
8. kill-switch/withdrawal che non propaga o conduce al laboratorio come fallback;
9. authorityRef mancante/invalidabile o stato editoriale sconosciuto;
10. almeno un gate `FAIL`, `BLOCKED` o `NOT_RUN`.

## Ordine di lavoro

1. formalizzare schema machine-readable e validator non-runtime;
2. formalizzare publication state machine e identity binding;
3. produrre candidato isolato senza esposizione pubblica;
4. eseguire Q1–Q8 e produrre `QualificationReceipt` exact-identity;
5. eseguire matrice umana Q4;
6. congelare la `RuntimeCandidateIdentity`;
7. eseguire review indipendente;
8. sottoporre Q9 all'autorità umana;
9. solo dopo Q9 PASS, consentire `QUALIFIED -> PUBLISHED`.

Fino al completamento valido di Q9 lo stato resta `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`.