# Atlas S3-V2/F4 — Mobile + LIM

**Data:** 2026-09-25  
**Stato:** INTEGRATED / VISUAL EVIDENCE PASS  
**Riferimento:** TRAMA R3-F0/S3-V2  
**Baseline validata:** `bc11577eeeeeed9c43ad62ac43fb7561e1197246`

## Esito

F4 è validata sulla stessa baseline dell'Exit F5.

## Copertura

### Mobile 360–430 px

- nessun overflow orizzontale;
- testata compatta e non ambigua;
- ricerca identificabile;
- bottom navigation con cinque destinazioni pubbliche principali e accesso `Altro`;
- target interattivi adeguati;
- Curricolo, Esplora, Materiali e Risorse utilizzabili senza layout desktop compresso.

### LIM 1920×1080

- larghezza leggibile;
- titoli, azioni e filtri distinguibili;
- righe di testo contenute;
- mappe e cataloghi navigabili;
- primo viewport comprensibile.

## Evidenza

Il workflow F4 ha generato screenshot per:

- 360×800;
- 430×932;
- 1920×1080;

sulle superfici Home, Curricolo, Esplora, Materiali e Risorse.

Il difetto iniziale dell'evidenza, causato dal menu mobile `Altro` lasciato aperto prima dello screenshot, è stato corretto sulla stessa PR prima della review finale. La seconda cattura è PASS.

## Invarianti

- nessun cambio di autorità;
- nessun login;
- nessun profilo studente;
- nessun tracking;
- nessuna pubblicazione automatica;
- nessuna modifica Arena o Docente OS.
