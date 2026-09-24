# Atlas S3-V2/F2 — Esplora

## Scopo

Trasformare Atlas da navigatore gerarchico a **atlante delle connessioni** del curricolo verticale di istituto.

## Superficie

Percorso principale:

`Istituto → discipline → ordini/annualità → obiettivi → raccordi interdisciplinari`

La mappa non sostituisce il curricolo gerarchico di F1: offre una seconda rappresentazione orientata alle relazioni.

## Componenti

- `RelationExplorer`
- canvas XYFlow / React Flow
- filtri per ordine di scuola e disciplina
- controllo `Mappa | Elenco`
- pannello contestuale del nodo selezionato
- link dal nodo obiettivo alla pagina F1
- mini mappa e controlli zoom
- equivalente testuale completo

## Dati

F2 deriva il grafo dalle fixture governate di F1.

Non introduce:
- sincronizzazione live con Arena;
- backend autorevole;
- seconda copia del curricolo;
- scritture;
- account o dati personali.

Arena resta la fonte curricolare prevista.

## Tipi di nodo

- Istituto
- Disciplina
- Ordine / annualità
- Obiettivo
- Raccordo interdisciplinare

## Tipi di relazione

- `contains` — appartenenza alla struttura
- `progresses` — progressione interna
- `connects` — raccordo interdisciplinare

La semantica delle relazioni non dipende solo dal colore.

## Accessibilità

La modalità visuale non è mai l'unico accesso ai dati.

Obbligatori:
- modalità Elenco equivalente;
- filtri accessibili;
- selezione nodo con focus percepibile;
- link agli obiettivi raggiungibili da tastiera;
- canvas esclusivamente complementare;
- nessun contenuto essenziale disponibile soltanto via drag/zoom;
- reduced motion rispettato dal sistema generale.

## Responsive

### Desktop
- canvas + pannello contestuale laterale.

### Tablet
- canvas + pannello contestuale sotto quando lo spazio è insufficiente.

### Mobile
- filtri impilati;
- selettore Mappa/Elenco a larghezza piena;
- canvas touch con **viewport iniziale leggibile**, senza fit dell’intero grafo;
- minimappa nascosta quando sottrae spazio utile;
- navigazione per pan/zoom su un sottoinsieme visibile alla volta;
- pannello contestuale sotto;
- Elenco pienamente utilizzabile senza canvas.

### Desktop / LIM
- la panoramica non deve comprimere automaticamente l’intero grafo fino a rendere illeggibili nodi e label;
- il viewport iniziale privilegia una scala leggibile e consente pan/zoom per il resto della rete;
- la minimappa resta un ausilio secondario, non sostituisce la leggibilità del canvas principale.

## Exit F2

F2 può essere candidato a integrazione solo se:

- [ ] typecheck PASS;
- [ ] lint PASS;
- [ ] build PASS;
- [ ] Foundation gate PASS;
- [ ] TRAMA Perceptible Write PASS;
- [ ] screenshot Mappa mobile PASS con nodi leggibili e minimappa non invasiva;
- [ ] screenshot Mappa desktop/LIM PASS con overview leggibile, non miniaturizzata;
- [ ] screenshot Elenco mobile PASS;
- [ ] screenshot Elenco desktop PASS;
- [ ] nessun overflow orizzontale;
- [ ] equivalente elenco presente;
- [ ] Human Visual Review PASS sull'exact head.

## Fuori scope

F2 non autorizza:
- dati Arena live;
- R3-P4;
- Docente OS → Atlas runtime;
- DOS-A1;
- personalizzazione studente;
- tracking individuale.
