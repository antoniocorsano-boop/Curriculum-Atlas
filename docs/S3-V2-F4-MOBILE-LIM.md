# Atlas S3-V2/F4 — Mobile + LIM

**Data:** 2026-09-24  
**Stato:** IMPLEMENTATION CONTRACT / ACTIVE  
**Riferimento:** TRAMA R3-F0/S3-V2

## Scopo

F4 consolida Atlas come esperienza pubblica realmente fruibile su smartphone, tablet, desktop e LIM senza introdurre nuove capacità di dominio.

## Principi

- Atlas resta pubblico e senza account/profilo studente.
- La shell non simula un utente autenticato.
- Le azioni principali devono restare raggiungibili con target tattili adeguati.
- La navigazione mobile privilegia i percorsi già maturi e pubblici.
- LIM significa leggibilità e gerarchia a distanza, non semplice allargamento del desktop.
- Nessun runtime Docente OS → Atlas viene autorizzato.

## Perimetro

### Mobile 360–430 px

- nessun overflow orizzontale;
- testata compatta e non ambigua;
- ricerca sempre identificabile;
- bottom navigation con cinque destinazioni pubbliche principali e accesso `Altro` alle sezioni secondarie;
- target interattivi ≥ 44 px quando applicabile;
- Curricolo, Esplora, Materiali e Risorse utilizzabili senza layout desktop compresso.

### LIM 1920×1080

- contenuto con larghezza massima leggibile;
- titoli, azioni e filtri distinguibili a distanza;
- nessun allungamento incontrollato delle righe di testo;
- mappe e cataloghi restano navigabili;
- primo viewport comprensibile senza dipendere dallo scroll.

## Correzioni F4 iniziali

- rimozione del falso profilo/utente “TR” dalla testata pubblica;
- sostituzione con indicatore statico “Vista pubblica”;
- navigazione mobile esplicita: Home, Esplora, Curricolo, Materiali, Risorse;
- accesso mobile `Altro` a Percorsi, Obiettivi, Raccordi e Impostazioni, così nessuna sezione resta raggiungibile solo dalla sidebar desktop;
- target tattili della bottom navigation;
- contenimento della larghezza del contenuto su LIM.

## Gate automatico

Il workflow F4 produce evidenza su:

- 360×800;
- 430×932;
- 1920×1080;

per le superfici:

- Home;
- Curricolo;
- Esplora;
- Materiali;
- Risorse.

Il gate fallisce in presenza di overflow orizzontale, target mobile sotto 44 px o perdita di raggiungibilità delle sezioni secondarie.

## Gate umano

Prima dell’Exit F5 verificare:

- gerarchia del primo viewport;
- leggibilità da LIM;
- comfort dei target su smartphone reale;
- comprensibilità della navigazione senza conoscenza dell’architettura;
- coerenza tra vista visuale e alternativa testuale di Esplora;
- assenza di elementi che suggeriscano account o tracking.

## Non effetti

- nessun cambio di autorità;
- nessun login;
- nessun profilo studente;
- nessun tracking;
- nessuna pubblicazione automatica;
- nessuna modifica Arena o Docente OS.
