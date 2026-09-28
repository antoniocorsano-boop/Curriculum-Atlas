# SMART-PERCORSI-BRIDGE-01 — Handoff governato Smart → Percorsi

**Stato:** DRAFT / CONTRACT_ONLY / NOT_RUNTIME_AUTHORIZED  
**Baseline:** `50ab5fa6de548d357f8e91c99ae3ce0c84fdc6d3`

## Scopo

Definire il confine tra un `atlas.smart.materialset/v1` eleggibile come `PUBLICATION_CANDIDATE` e la catena governata Percorsi Q5 → Q6 → Q1, senza creare una seconda semantica di pubblicazione.

Il bridge produce esclusivamente un descrittore di handoff. **Non produce EvidenceProducerResult Q5**, non autorizza runtime, non pubblica asset e non promuove stati.

## Principi

1. **Identità esplicita, mai inferita.** `runtimeExactHead`, `pathwayId`, `contentVersion` e `publicationId` devono essere forniti dal contesto governato.
2. **Autorità esterna e verificabile.** Il Material Set Smart non è fonte di autorità. `authorityRef` e `authorityEvidenceRef` devono provenire da un contesto governato separato.
3. **Provenienza completa.** Ogni risorsa obbligatoria deve avere `provenanceRef`, digest SHA-256, byteSize e publicationPath deterministico.
4. **Nessuna receipt sintetica.** Il bridge non può emettere Q5, Q6, Q1, `RUNTIME_AUTHORIZED` o una receipt finale di pubblicazione.
5. **Binding Smart ↔ Percorsi esplicito.** Il bridge non può associare liberamente un Material Set a un `pathwayId`: richiede un `smartPathwayBindingRef` governato.
6. **Digest deterministico.** `manifestDigest` è calcolato su una serializzazione canonica ricorsiva del manifest, così l'ordine delle proprietà JSON non cambia l'identità logica.
7. **Fail-closed.** Qualunque mismatch, dato mancante, eligibility diversa da `PUBLICATION_CANDIDATE`, manifest storico, digest invalido o autorità incompleta blocca l'handoff.

## Input minimo

- Material Set Smart canonico;
- `candidateBinding` Percorsi completo;
- `authorityRef`;
- `authorityEvidenceRef`;
- `smartPathwayBindingRef`, riferimento governato che dimostra il legame tra il Material Set Smart e il `pathwayId` Percorsi.

## Output

`atlas.smart.percorsi-handoff/v1` contiene:

- digest del manifest Smart;
- identità del Material Set;
- candidate binding Percorsi;
- autorità governata e relativo riferimento di evidenza;
- `smartPathwayBindingRef` che rende esplicito il legame Smart ↔ Percorsi;
- digest canonico e deterministico del manifest Smart, indipendente dall'ordine delle proprietà JSON;
- sole risorse required con identità, provenienza e digest;
- `handoffState = READY_FOR_Q5_INPUT`;
- `runtimeAuthorized = false`;
- `q5Produced = false`.

L'output è quindi un **input preparatorio per Q5**, non evidenza Q5.

## Invarianti di separazione

Il bridge deve rifiutare:

- `HISTORICAL_NON_PUBLISHABLE`;
- Material Set non `PUBLICATION_CANDIDATE`;
- risorse required senza provenienza/digest/byteSize/publicationPath;
- binding Percorsi incompleto;
- authority mancante o vuota;
- `smartPathwayBindingRef` mancante o vuoto;
- tentativi di fornire `q5Evidence`, `q6Evidence`, `q1Evidence`, `runtimeAuthorized=true` o stati equivalenti.

## Relazione con i contratti esistenti

- Smart resta responsabile della consistenza del Material Set e degli asset.
- Il bridge conserva identità e provenienza ma non decide la transizione editoriale.
- Q5 resta l'unico producer che qualifica la provenienza della transizione editoriale.
- Q6 continua a verificare ammissione e continuità dell'autorità Q5.
- Q1 continua a verificare la superficie osservata.
- Q9 resta l'unica autorità finale per `RUNTIME_AUTHORIZED`.

## Stato operativo

Questa tranche non introduce adapter runtime, route studente, deploy aggiuntivi, credenziali o automazioni di pubblicazione.