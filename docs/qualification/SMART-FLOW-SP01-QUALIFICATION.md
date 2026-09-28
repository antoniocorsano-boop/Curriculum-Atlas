# SMART-FLOW SP-01 — Qualification baseline

**Exact head qualificato:** `3698acda6eb997cb45310f51e3f060b29e3e0e36`

## Esito

La CI ha eseguito con esito positivo il workflow `SMART-FLOW SP-01 Qualification`.

Nel job `SP-01 end-to-end fail-closed qualification` sono risultati PASS:

1. checkout dell'exact head;
2. setup Node 24;
3. validatori Smart riusabili (`npm run validate:smart`);
4. collaudo end-to-end SP-01 (`npm run test:smart:sp01`).

Sullo stesso exact head risultavano PASS anche Foundation, F1/F2/F3 Visual Evidence, F4 Mobile/LIM, F5 Exit, MAT-PUB-A, MAT-PUB-B, Percorsi G2 Validator e TRAMA Perceptible Write.

## Cosa qualifica

La baseline qualifica il nucleo riusabile:

`normalize → register → MAT-PUB candidate → [canonical publish boundary] → verify-public → receipt → apply-receipt → MaterialSet validation/readiness`

In particolare conferma che:

- il Material Set non può diventare `packageReady=true` con risorse required irrisolte;
- una preview non costituisce pubblicazione canonica;
- i materiali STUDENT/BOTH richiedono verifica di raggiungibilità anonima prima della receipt finale;
- digest, dimensione, audience e provenienza restano controllati;
- il workflow Smart non introduce un secondo motore di readiness;
- Percorsi resta separato e i relativi controlli continuano a passare;
- nessun nuovo adattatore runtime verso Docente OS è autorizzato.

## Confine ancora aperto

La qualificazione NON autorizza né simula il deploy student-facing definitivo di Atlas. Il solo confine infrastrutturale ancora aperto è la **pubblicazione canonica Atlas** della build che contiene `public/materials/`.

Finché tale canale non è esplicitamente qualificato/autorizzato:

- gli asset restano `CANDIDATE` / publication pending;
- non si usa una URL di preview come `publicRef` canonico;
- non viene prodotta una receipt finale valida per readiness;
- SP-01 resta fail-closed quando una risorsa required non è pubblicata.

## Regola per le attività successive

Le future Attività smart devono riusare questa pipeline e i relativi contratti; non devono ricostruire manualmente registrazione, digest, MAT-PUB, verifica, receipt o readiness. SP-01 resta il caso pilota di regressione del workflow.