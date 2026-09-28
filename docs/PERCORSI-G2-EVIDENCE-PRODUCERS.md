# Percorsi G2 — Evidence Producers Q1–Q8

## Stato

Baseline: `009503e1a2b01e8c5b0e50029bfd4f2ab5622a4b`.
Authority: issue #44 e `PERCORSI-G2-RUNTIME-QUALIFICATION.md`.
Contract version: `percorsi-g2-evidence-producer/v1`.

Stato vincolante: `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`.

Questo documento definisce i produttori di evidenza che alimentano la `QualificationReceipt`. Non implementa né abilita una superficie studente e non modifica il significato di Q9.

## Principio di separazione

Il validatore integrato con PR #48 aggrega e verifica ricevute/binding; non deve simulare la rilevazione dei fenomeni reali. Ogni produttore Q1–Q8 rileva il proprio fenomeno, emette evidenza riferita alla medesima `RuntimeCandidateIdentity` e non può promuovere autonomamente lo stato a `RUNTIME_AUTHORIZED`.

La catena normativa è: fenomeno reale -> `EvidenceProducerResult` -> gate Qn -> `QualificationReceipt` -> autorità umana Q9.

## EvidenceProducerResult v1

Ogni esecuzione di un produttore DEVE emettere un risultato strutturato e versionato con almeno:

- `contractVersion = percorsi-g2-evidence-producer/v1`;
- `producerId` non vuoto e stabile;
- `producerVersion` non vuota e immutabile per la logica eseguita;
- `runId` non vuoto e univoco per esecuzione;
- `gateId` in `Q1..Q8`;
- `candidateBinding` con esattamente `runtimeExactHead`, `pathwayId`, `contentVersion`, `publicationId`;
- `status` in `PASS | FAIL | BLOCKED`;
- `observations`: array strutturato non nullo; ogni osservazione contiene almeno `assertionId`, `outcome`, `evidenceRef` oppure una motivazione machine-readable di assenza dell'evidenza;
- `evidenceRefs`: array di stringhe non vuote e univoche;
- `checkedAt`: data/ora RFC3339 valida;
- `policyVersion`: versione della policy/contratto applicata;
- `dependencyLineage`: elenco dei risultati di altri producer consumati, ciascuno identificato da `producerId`, `producerVersion`, `runId`, `gateId`, `candidateBinding`, `checkedAt`.

Un risultato ambiguo, malformato, con campi obbligatori mancanti o con binding incompatibile NON è convertibile in PASS.

### Mapping verso QualificationReceipt

L'aggregatore può convertire un `EvidenceProducerResult` in gate receipt soltanto se:

1. `gateId` corrisponde al gate di destinazione;
2. i quattro campi di `candidateBinding` sono identici alla `RuntimeCandidateIdentity` della receipt;
3. `producerVersion`, `policyVersion` e lineage sono accettati dalla versione corrente del contratto;
4. `evidenceRefs` soddisfa non-vuotezza/unicità e le osservazioni richieste sono complete;
5. nessuna dipendenza consumata è stata invalidata da una variazione rilevante di candidate, policy o producer.

Il mapping conserva `status`, `evidenceRefs`, `checkedAt` e candidate binding; il riferimento a `producerId/producerVersion/runId` deve restare rintracciabile dall'evidenza del gate.

## Semantica univoca degli stati

- **NOT_RUN**: il producer richiesto non è stato eseguito o non esiste un risultato consumabile. È sintetizzato dall'aggregatore; un producer non emette `NOT_RUN`.
- **BLOCKED**: il producer è stato eseguito, ma infrastruttura, prerequisiti o evidenza necessaria non consentono una conclusione affidabile.
- **FAIL**: il producer è stato eseguito e ha osservato almeno una violazione della policy o un'asserzione obbligatoria negativa.
- **PASS**: il producer è stato eseguito e tutte le asserzioni obbligatorie applicabili sono dimostrate con evidenza valida.

Errore, eccezione o crash del producer = `BLOCKED`, mai PASS. Evidenza mancante = `NOT_RUN` a livello aggregatore, non PASS.

## Binding, lineage e freshness

Ogni evidenza è exact-identity bound. Prima del consumo l'aggregatore DEVE confrontare `runtimeExactHead`, `pathwayId`, `contentVersion` e `publicationId` con il candidato corrente.

Una dipendenza tra producer è consumabile solo se:

- candidate binding identico;
- producer/policy/contract version ancora accettate;
- `runId` esplicitamente registrato nel lineage del consumer;
- nessuna modifica successiva ha invalidato il dominio controllato dalla dipendenza.

Cambio di uno dei quattro campi di candidate identity invalida tutte le evidenze precedenti. Cambio di producer/policy/contract invalida almeno i gate interessati e tutti i consumer transitivi, salvo regola di compatibilità deterministica e documentata. Non è ammesso riuso silenzioso di evidenza stale.

## Q1 — Public Surface Reachability Producer

Confine esclusivo: **raggiungibilità della superficie pubblica/runtime**.

Verifica route/entrypoint effettivamente raggiungibili, assenza di `/percorsi/lab/**` dalla superficie autorizzabile e comportamento fail-closed della superficie quando receipt/authority sono mancanti o lo stato non è pubblicabile. Q1 non accetta una descrizione dichiarativa della superficie né una ricevuta preconfezionata: avvia direttamente il runner `SEALED_PREAUTH` tramite l'adapter di probe e consuma internamente la `ProbeObservationReceipt` appena prodotta, vincolata a candidate identity, exact Q6 run, `surfaceArtifactDigest` e istante di osservazione. Dati dichiarativi presenti nel target non sostituiscono i risultati osservati dall'adapter. Non decide se un artefatto può entrare nell'indice/build editoriale: quello è Q6.

Automatizzabile: inventario route, link graph, policy assertions. Evidenza umana solo se la raggiungibilità non è deducibile automaticamente.

## Q2 — Network & Learner-Write Producer

Esegue una sessione rappresentativa in ambiente isolato e registra richieste originate dall'esperienza. PASS solo se le richieste appartengono alle classi read-only autorizzate e non esistono write, beacon, analytics, telemetria comportamentale o trasmissione di stato/risposte.

Output minimo: metodo, destinazione classificata, classe richiesta, esito policy; nessun payload personale deve essere conservato nell'evidenza.

## Q3 — Local State / Offline / Withdrawal Producer

Verifica namespace e meccanismi di storage, reset, isolamento tra versioni, reload, offline, invalidazione e comportamento dopo `WITHDRAWN`. PASS solo se una nuova sessione ritirata non parte da cache e non ricade nel laboratorio.

## Q4 — Compatibility & Accessibility Producer

Componente ibrido automatico + umano. Produce matrice nominata di browser/dispositivo/viewport/input e risultati per reflow 200%, focus, radio keyboard semantics, struttura annunciabile e reduced motion. La parte con tecnologia assistiva reale deve essere registrata come evidenza umana distinta; senza di essa Q4 resta `BLOCKED`.

## Q5 — Publication Provenance Producer

Verifica la liceità della transizione editoriale, non una sola fotografia dello stato. Ogni evento di transizione qualificabile DEVE conservare almeno:

- `previousState`;
- `requestedTransition`;
- `resultingState`;
- `publicationId`;
- candidate binding;
- `authorityRef` e riferimento all'evidenza dell'autorità;
- `transitionAt` RFC3339;
- identificatore immutabile dell'evento/transizione.

Sono ammesse soltanto le transizioni previste da `LAB -> QUALIFIED -> PUBLISHED -> WITHDRAWN`; il ritiro prevale. Stato sconosciuto, salto non autorizzato, provenienza incompleta, authority mancante o snapshot senza evento verificabile = FAIL/BLOCKED secondo la semantica sopra.

## Q6 — Editorial Admission Producer

Confine esclusivo: **ammissione a build/index/catalogo editoriale pubblicabile**, prima della raggiungibilità runtime verificata da Q1.

Verifica automaticamente che fixture, laboratorio, contenuti non qualificati, receipt/authority mancanti e mismatch di identità non possano essere ammessi all'indice/build/catalogo pubblicabile. L'autorità dell'artefatto e della receipt deve inoltre coincidere con l'`authorityRef` normalizzata dalla specifica evidenza Q5 consumata: una coppia artefatto/receipt internamente coerente ma riferita a un'autorità estranea rispetto a Q5 deve fallire. Il suo output è un'ammissione/rifiuto editoriale verificabile; non prova che una route pubblica sia effettivamente irraggiungibile, responsabilità di Q1.

Handoff: Q6 deve risultare PASS prima che un artefatto sia candidato alla verifica di raggiungibilità Q1; un successivo cambiamento di build/index invalida Q1 se modifica la superficie raggiungibile.

## Q7 — Privacy & Security Producer

Combina i risultati di Q2/Q3 con controlli di sicurezza applicabili all'exact candidate. PASS richiede zero account studente, zero identificatori persistenti introdotti dal percorso, zero learner-write/telemetria e storage conforme. Non duplica artificialmente Q2: consuma Q2/Q3 soltanto tramite `dependencyLineage` conforme alle regole di identity/freshness. Evidenza Q2/Q3 stale, incompatibile o invalidata rende Q7 `BLOCKED` o `FAIL` secondo il fenomeno osservato.

## Q8 — Withdrawal / Kill-Switch Producer

Esegue una prova controllata di disable su publication candidate non pubblica: verifica autorità dell'azione, rimozione/disabilitazione dell'entrypoint, propagazione osservata, impossibilità di nuovo avvio e assenza di fallback verso lab/stale content.

Q8 NON può emettere PASS finché non esiste un **maximum propagation objective** numerico, approvato dall'autorità e identificato da `killSwitchPolicyVersion`. L'evidenza Q8 deve registrare almeno `killSwitchPolicyVersion`, obiettivo massimo approvato, tempo osservato, istante di richiesta disable e istante di propagazione verificata. Se l'obiettivo non è ancora approvato, Q8 = `BLOCKED`; se il tempo osservato supera l'obiettivo, Q8 = `FAIL`.

Qualunque modifica dell'obiettivo o della relativa policy invalida le precedenti evidenze Q8 salvo compatibilità deterministica esplicita.

## Dipendenze e ordine

Ordine normativo per la prima parte: Q5 -> Q6 -> Q1. Per le tranche successive: Q2 e Q3 -> Q7; Q4 può procedere in parallelo quando il candidato UI è congelato; Q8 viene eseguito soltanto quando il maximum propagation objective è approvato. Q8 usa una publication candidate isolata e non richiede esposizione agli studenti.

## Invarianti dei produttori

- nessun produttore scrive `RUNTIME_AUTHORIZED`;
- nessun produttore modifica il contenuto mentre lo qualifica;
- ogni evidenza usa i quattro campi di candidate binding già governati dalla PR #48;
- errore/crash = `BLOCKED`, mai PASS;
- dati di prova sintetici o anonimi; nessun dato personale studente;
- i producer non richiedono account studente;
- evidenze incompatibili, stale o riferite a identity differenti non sono aggregabili;
- il rilevamento concreto e l'aggregazione della receipt restano due livelli separati;
- Q9 resta l'unica autorità capace di produrre la decisione finale di runtime authorization dopo tutti i gate richiesti PASS sulla medesima identity.

## Prima tranche di materializzazione

La prima implementazione deve limitarsi a Q5/Q6/Q1, in quest'ordine, perché sono controlli statici/editoriali e non richiedono una superficie studente attiva. Deve includere schema machine-readable di `EvidenceProducerResult v1`, mapping verso la receipt, casi positivi/negativi e invalidazione lineage. Q2/Q3/Q4/Q7/Q8 saranno aggiunti in tranche successive, ciascuna con casi positivi/negativi e review indipendente.

Fino a Q9 valido: `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`.