# SMART-PERCORSI-BRIDGE-01 — Handoff governato Smart → Percorsi

**Stato:** DRAFT / CONTRACT_ONLY / NOT_RUNTIME_AUTHORIZED  
**Baseline:** `50ab5fa6de548d357f8e91c99ae3ce0c84fdc6d3`

## Scopo

Definire il confine tra un `atlas.smart.materialset/v1` eleggibile come `PUBLICATION_CANDIDATE` e la catena governata Percorsi Q5 → Q6 → Q1, senza creare una seconda semantica di pubblicazione.

Il bridge produce esclusivamente un descrittore di handoff. **Non produce EvidenceProducerResult Q5**, non autorizza runtime, non pubblica asset e non promuove stati.

## Principi

1. **Identità esplicita.** `runtimeExactHead`, `pathwayId`, `contentVersion` e `publicationId` appartengono al contesto governato e vengono normalizzati ai soli quattro campi ammessi.
2. **Autorità esterna e verificabile.** Il Material Set Smart non è fonte di autorità. `authorityRef` e `authorityEvidenceRef` devono provenire dal contesto governato e coincidere con la binding evidence.
3. **Provenienza completa.** Ogni risorsa obbligatoria deve avere `provenanceRef`, digest SHA-256, byteSize e publicationPath deterministico.
4. **Nessuna receipt sintetica.** Il bridge non può emettere Q5, Q6, Q1, `RUNTIME_AUTHORIZED` o una receipt finale di pubblicazione.
5. **Binding Smart ↔ Percorsi verificato.** Il bridge consuma una `SmartPathwayBindingEvidence v1` strutturata; una stringa opaca non è prova sufficiente.
6. **Digest deterministico.** `manifestDigest` usa una serializzazione canonica ricorsiva del manifest.
7. **Fail-closed.** Binding foreign/stale/mismatched, evidence version non supportata, autorità diversa, dati mancanti o manifest non eleggibile bloccano l'handoff.

## SmartPathwayBindingEvidence v1

L'evidenza consumabile deve contenere:

- `contractVersion = atlas.smart.pathway-binding/v1`;
- `producerId = atlas-smart-pathway-binding`;
- `producerVersion = 1`;
- `evidenceId` immutabile non vuoto;
- `checkedAt` RFC3339;
- `sourceRef` governato non vuoto;
- `materialSetId`, `materialSetVersion`, `manifestDigest`;
- `candidateBinding` completo con i quattro campi Percorsi;
- `authorityRef` e `authorityEvidenceRef`.

Il bridge verifica uguaglianza esatta tra evidence e input corrente per manifest digest, Material Set, candidate binding e autorità. In questa tranche la freshness è **identity/lineage freshness**: una evidence riferita a un diverso exact head, contentVersion, publicationId, Material Set version o digest è stale e viene respinta. `checkedAt` futuro/non RFC3339 è respinto.

## Output

`atlas.smart.percorsi-handoff/v1` contiene:

- digest canonico del manifest Smart;
- identità del Material Set;
- candidate binding normalizzato;
- autorità governata;
- `smartPathwayBinding` con identità/versione/run reference della evidence consumata;
- sole risorse required con identità, provenienza e digest;
- `handoffState = READY_FOR_Q5_INPUT`;
- `runtimeAuthorized = false`;
- `q5Produced = false`.

L'output è un **input preparatorio per Q5**, non evidenza Q5.

## Invarianti di separazione

Il bridge rifiuta:

- `HISTORICAL_NON_PUBLISHABLE` o qualunque stato diverso da `PUBLICATION_CANDIDATE`;
- risorse required incomplete;
- binding Percorsi incompleto;
- proprietà supplementari nel `candidateBinding` di input;
- authority mancante o diversa dalla binding evidence;
- binding evidence foreign, stale, mismatched o con producer/version non supportati;
- tentativi di fornire `q5Evidence`, `q6Evidence`, `q1Evidence` o `runtimeAuthorized=true`.

## Relazione con i contratti esistenti

Smart resta responsabile di Material Set e asset. Il bridge conserva e verifica il collegamento, ma non decide la transizione editoriale. Q5 resta il producer della provenienza della transizione; Q6 verifica ammissione e continuità dell'autorità; Q1 verifica la superficie osservata; Q9 resta l'unica autorità finale per `RUNTIME_AUTHORIZED`.

## Stato operativo

Nessun adapter runtime, route studente, deploy aggiuntivo, credenziale o automazione di pubblicazione viene introdotto da questa tranche.
