# SMART-PERCORSI-BINDING-RESOLVER-01 — Resolver governato del binding

**Stato:** DRAFT / RESOLVER_IMPLEMENTED / NO_ACTIVE_BINDINGS / NOT_RUNTIME_AUTHORIZED  
**Baseline:** `446ff80ef6129f6c38e22d203c0f2339738836f6`

## Scopo

Materializzare il resolver canonico richiesto da SMART-PERCORSI-BRIDGE-01 senza inventare associazioni tra Attività Smart e Percorsi.

Il resolver legge esclusivamente il registro governato:

`governance/smart-percorsi-binding-registry.json`

Il registro iniziale contiene **zero binding attivi**. L'assenza di associazione è uno stato valido e fail-closed.

## Regola di autorità

Il resolver non decide quale Attività Smart appartenga a quale Percorso. Consuma esclusivamente entry già registrate nel file governato. Una nuova entry o una modifica di binding richiede una PR separata, review e decisione umana.

Il resolver:

- non accetta un path arbitrario al registro nel percorso canonico;
- non accetta binding inline dal chiamante;
- non crea automaticamente entry mancanti;
- non converte similarità di nome, activityId o contenuto in un binding;
- non produce Q5/Q6/Q1 né `RUNTIME_AUTHORIZED`.

## Entry canonica

Ogni binding attivo contiene:

- `bindingRef` stabile e univoco;
- `status = ACTIVE`;
- `materialSetId`, `materialSetVersion`, `manifestDigest`;
- `candidateBinding` Percorsi con i quattro campi governati;
- `authorityRef`, `authorityEvidenceRef`;
- `checkedAt` RFC3339;
- `governanceRef` che rinvia alla decisione governata che ha istituito il binding.

Entry `REVOKED`, duplicate, malformate o mancanti non sono risolvibili.

## Output

Il resolver emette una `SmartPathwayBindingEvidence v1` compatibile con SMART-PERCORSI-BRIDGE-01:

- producer/contract version fissi;
- `sourceRef = bindingRef`;
- `evidenceId` derivato deterministicamente dal contenuto canonico dell'entry;
- identità Smart, candidate binding e autorità copiati dall'entry governata.

## Integrazione canonica

`buildSmartPercorsiHandoffFromGovernedRegistry()` compone il bridge con il resolver canonico. Il chiamante passa manifest e contesto, ma non può sostituire l'adapter.

## Stato iniziale

Il registro governato è volutamente vuoto. Pertanto nessuna Attività Smart può ancora produrre un handoff reale verso Percorsi. L'introduzione del primo binding reale sarà una tranche successiva e dovrà indicare esplicitamente il Material Set e il Percorso coinvolti.
