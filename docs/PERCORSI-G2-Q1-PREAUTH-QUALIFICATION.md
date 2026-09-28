# Percorsi G2 — Q1 Pre-authorization Reachability Qualification

## Stato

Decisione contrattuale locale per la PR #50. Stato runtime invariato: `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`.

Questa specifica risolve la circolarità Q1↔Q9 senza anticipare Q9, senza trasformare Q1 in Q6 e senza esporre una superficie studente prima dell'autorizzazione finale.

## Principio

Q1 qualifica **la raggiungibilità effettiva del candidato attraverso un probe pre-autorizzazione sigillato**, non la sua pubblicazione agli studenti.

Il probe deve esercitare lo stesso artefatto, lo stesso grafo di route, lo stesso entrypoint e la stessa configurazione di superficie destinati alla pubblicazione, ma dietro un confine tecnico che impedisce l'accesso pubblico/studente. La differenza tra probe e attivazione finale può essere esclusivamente il gate di esposizione governato da Q9; non sono ammessi rebuild, sostituzione di contenuto, modifica di route, entrypoint o identity tra Q1 PASS e Q9.

Quindi:

`QUALIFIED + Q6 PASS -> SEALED_PREAUTH_PROBE -> Q1 PASS -> Q2..Q8 PASS -> review indipendente PASS -> Q9 RUNTIME_AUTHORIZED -> activation-only -> PUBLISHED`

## Invarianti del probe

Per produrre Q1 PASS devono essere dimostrati tutti i seguenti punti:

1. `publicationState=QUALIFIED`; Q1 non richiede e non può simulare `PUBLISHED`.
2. Nessuna decisione `RUNTIME_AUTHORIZED` è presente nel producer Q1.
3. `probeMode=SEALED_PREAUTH` e `publicExposure=false`.
4. Il probe è vincolato alla stessa `candidateBinding` e allo stesso `q6RunId` consumato da Q1.
5. Q1 **avvia direttamente** il runner `SEALED_PREAUTH` tramite l'adapter del probe e consuma internamente la `ProbeObservationReceipt` appena prodotta; una ricevuta preconfezionata o un oggetto che descrive soltanto la superficie non costituiscono input consumabile da Q1.
6. `surfaceArtifactDigest` identifica deterministicamente l'artefatto/grafo di superficie verificato e deve coincidere con il digest **osservato dall'adapter durante il probe**; il solo valore dichiarato dal target non è sufficiente.
7. Route ed entrypoint osservati sono quelli destinati all'attivazione; `/percorsi/lab/**` non è raggiungibile come superficie autorizzabile.
8. La ricevuta è vincolata tramite digest al contenuto osservato; manomissione, `q6RunId` diverso, candidate identity diversa o osservazione antecedente a Q6 falliscono chiusi.
9. Mancanza di authority/receipt, stato non qualificato, route sconosciuta o entrypoint non dichiarato falliscono chiusi.
10. L'attivazione post-Q9 è **activation-only**: può cambiare soltanto il gate di esposizione. Qualunque modifica a codice, contenuto, build/index, route, entrypoint, digest o candidate identity invalida Q1 e richiede revalidation.
11. Il probe non è indicizzato, pubblicizzato o accessibile alla popolazione studente e non costituisce pubblicazione.
12. Merge, deploy tecnico, cache o disponibilità dell'ambiente di probe non equivalgono a Q9 né a `PUBLISHED`.

## Evidenza minima Q1

Q1 non accetta una `ProbeObservationReceipt` fornita dal chiamante. Il suo input è il target sigillato più l'adapter del probe; Q1 esegue il runner e consuma internamente la ricevuta risultante. La ricevuta interna deve includere almeno:

- versione e identità del produttore del probe;
- `probeRunId` e digest della ricevuta;
- `candidateBinding`;
- `publicationId`;
- exact `q6RunId`;
- `publicationState=QUALIFIED`;
- `probeMode=SEALED_PREAUTH`;
- `surfaceArtifactDigest` non vuoto;
- `observedAt` successivo o uguale alla Q6 consumata;
- `reachableRoutes`, `entrypoint`, `publicEntrypoint` e `publicExposure` **osservati dall'esecuzione**;
- comportamenti osservati `DENY` per authority mancante, receipt mancante, stato non pubblicabile e route sconosciuta.

Un semplice oggetto descrittivo della superficie, una ricevuta ricostruita dal chiamante o valori dichiarativi inseriti nel target, anche se formalmente corretti, non possono sostituire l'esecuzione del probe né produrre Q1 PASS.

Q1 PASS significa: **la superficie candidata è stata realmente esercitata e rispetta i confini di raggiungibilità richiesti, restando non esposta agli studenti**. Non significa `RUNTIME_AUTHORIZED` e non significa `PUBLISHED`.

## Attivazione dopo Q9

Q9 resta l'unica autorità finale. Dopo Q9 PASS, l'attivazione può usare l'evidenza Q1 solo se candidate identity, `q6RunId` e `surfaceArtifactDigest` coincidono esattamente con quelli qualificati. Se uno di questi elementi cambia, l'attivazione è bloccata e Q1 torna non consumabile fino a nuova qualificazione.

La transizione `QUALIFIED -> PUBLISHED` resta successiva a Q9.

## Conseguenza sulla semantica

- Q6 prova l'ammissione editoriale.
- Q1 prova la raggiungibilità reale della superficie in un ambiente pre-autorizzazione sigillato.
- Q9 autorizza l'esposizione pubblica.
- `PUBLISHED` registra l'avvenuta transizione autorizzata.

I quattro concetti restano distinti e nessuno implica automaticamente il successivo.


## Adapter runtime

Questa PR materializza il **contratto del producer Q1 e del probe adapter**, ma non autorizza né installa un adapter runtime di produzione. Gli adapter sintetici usati nei test dimostrano la logica fail-closed del producer e non costituiscono una Q1 qualification receipt per un candidato reale.

Un futuro adapter runtime dovrà essere introdotto in una tranche separata, essere vincolato al candidato effettivo e all'ambiente SEALED_PREAUTH, produrre il digest della superficie osservata e passare review indipendente prima che una sua esecuzione possa essere usata come evidenza Q1 reale. Fino ad allora resta valido `PROTOTYPE_ONLY / NOT_RUNTIME_AUTHORIZED`.
