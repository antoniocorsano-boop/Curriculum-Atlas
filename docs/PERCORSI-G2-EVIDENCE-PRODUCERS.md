# Percorsi G2 — Evidence Producers Q1–Q8

## Stato

Baseline: `009503e1a2b01e8c5b0e50029bfd4f2ab5622a4b`.
Authority: issue #44 e `PERCORSI-G2-RUNTIME-QUALIFICATION.md`.

Stato vincolante: `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`.

Questo documento definisce i produttori di evidenza che alimentano la `QualificationReceipt`. Non implementa né abilita una superficie studente e non modifica il significato di Q9.

## Principio di separazione

Il validatore integrato con PR #48 aggrega e verifica ricevute/binding; non deve simulare la rilevazione dei fenomeni reali. Ogni produttore Q1–Q8 rileva il proprio fenomeno, emette evidenza riferita alla medesima `RuntimeCandidateIdentity` e non può promuovere autonomamente lo stato a `RUNTIME_AUTHORIZED`.

Ogni evidenza deve contenere almeno: `producerId`, `gateId`, `candidateBinding`, `status`, `observations`, `evidenceRefs`, `checkedAt`, `producerVersion`. Stati ammessi: `PASS | FAIL | BLOCKED`. Evidenza mancante o non interpretabile = gate non PASS.

## Q1 — Public Surface Boundary Producer

Verifica route/entrypoint, assenza di `/percorsi/lab/**` dalla superficie autorizzabile e comportamento fail-closed per receipt/authority mancanti o stati non pubblicabili.

Automatizzabile: inventario route, link graph, policy assertions. Evidenza umana solo se l'architettura informativa non è deducibile automaticamente.

## Q2 — Network & Learner-Write Producer

Esegue una sessione rappresentativa in ambiente isolato e registra richieste originate dall'esperienza. PASS solo se le richieste appartengono alle classi read-only autorizzate e non esistono write, beacon, analytics, telemetria comportamentale o trasmissione di stato/risposte.

Output minimo: metodo, destinazione classificata, classe richiesta, esito policy; nessun payload personale deve essere conservato nell'evidenza.

## Q3 — Local State / Offline / Withdrawal Producer

Verifica namespace e meccanismi di storage, reset, isolamento tra versioni, reload, offline, invalidazione e comportamento dopo `WITHDRAWN`. PASS solo se una nuova sessione ritirata non parte da cache e non ricade nel laboratorio.

## Q4 — Compatibility & Accessibility Producer

Componente ibrido automatico + umano. Produce matrice nominata di browser/dispositivo/viewport/input e risultati per reflow 200%, focus, radio keyboard semantics, struttura annunciabile e reduced motion. La parte con tecnologia assistiva reale deve essere registrata come evidenza umana distinta; senza di essa Q4 resta `BLOCKED`.

## Q5 — Publication Provenance Producer

Verifica `LAB -> QUALIFIED -> PUBLISHED -> WITHDRAWN`, provenienza, `authorityRef`, publication identity e precedenza del ritiro. Stati/transizioni sconosciuti o metadati mancanti = FAIL.

## Q6 — Editorial Boundary Producer

Verifica automaticamente che fixture, laboratorio, contenuti non qualificati, receipt/authority mancanti e mismatch di identità non possano entrare nell'indice/superficie pubblicabile.

## Q7 — Privacy & Security Producer

Combina i risultati di Q2/Q3 con controlli di sicurezza applicabili all'exact candidate. PASS richiede zero account studente, zero identificatori persistenti introdotti dal percorso, zero learner-write/telemetria e storage conforme. Non duplica artificialmente Q2: ne consuma l'evidenza vincolata alla stessa identity.

## Q8 — Withdrawal / Kill-Switch Producer

Esegue una prova controllata di disable su publication candidate non pubblica: verifica autorità dell'azione, rimozione/disabilitazione dell'entrypoint, propagazione osservata, impossibilità di nuovo avvio e assenza di fallback verso lab/stale content. Registra il tempo osservato; l'obiettivo operativo definitivo resta soggetto ad approvazione prima di Q9.

## Dipendenze e ordine

Ordine raccomandato: Q1, Q5, Q6 -> Q2, Q3 -> Q7 -> Q4 -> Q8. Q4 può procedere in parallelo quando il candidato UI è congelato. Q8 usa una publication candidate isolata e non richiede esposizione agli studenti.

## Invarianti dei produttori

- nessun produttore scrive `RUNTIME_AUTHORIZED`;
- nessun produttore modifica il contenuto mentre lo qualifica;
- ogni evidenza è exact-identity bound;
- un producer error/crash produce `BLOCKED`, mai PASS;
- dati di prova sintetici o anonimi; nessun dato personale studente;
- i producer non richiedono account studente;
- evidenze incompatibili o riferite a identity differenti non sono aggregabili;
- il rilevamento concreto e l'aggregazione della receipt restano due livelli separati.

## Prima tranche di materializzazione

La prima implementazione deve limitarsi a Q1/Q5/Q6 perché sono controlli statici/editoriali e non richiedono una superficie studente attiva. Q2/Q3/Q4/Q7/Q8 saranno aggiunti in tranche successive, ciascuna con casi positivi/negativi e review indipendente.

Fino a Q9 valido: `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`.