# AG-04 — Visibilità spaziale delle campate native

## Punto di partenza
La PR #112 ha qualificato il confronto fotometrico in Chromium/SwiftShader.
P1 HDR bilanciato è la candidata provvisoria per la prova prestazionale;
P2 resta intatta. Nessuna accettazione artistica finale. I cinque moduli
GLB, cielo, HDRI, camere di riferimento, R2 e ALS-01 R4 non cambiano.

L'instancing globale ha 60 chiamate grafiche ma 1.101.794 triangoli
elaborati in tutte e tre le viste. Le mesh individuali ne elaborano
601.658 (atrio), 484.154 (verticale), 476.810 (compatto).

## Intervento
Il modulo riutilizzabile bay-visibility.mjs mantiene le matrici originali
e le sfere conservative nello spazio mondo. A ogni modifica della matrice
di proiezione/vista verifica il frustum e compatta soltanto le istanze
visibili nei batch già esistenti, senza decimazione, cambio di materiale
o eliminazione di oggetti. Gli oggetti non raggruppabili rimangono
individuali. Con camera immobile non riscrive le matrici. Il metodo è
per istanza (non una semplice divisione in settori); non è un algoritmo
di occlusione né un'ottimizzazione del peso dei GLB.

## Qualificazione separata
Tre formati, quattro pose ciascuno: riferimento, rotazione sinistra,
rotazione destra con avvicinamento, ripristino. Confronto P1 a parità
di camera tra batch globale, mesh individuali e batch compattato.
- Almeno 25% di triangoli in meno del batch globale nella vista iniziale.
- In tutte le pose: meno triangoli del batch globale, non più delle
  mesh individuali; chiamate non superiori al batch globale e inferiori
  alle mesh individuali.
- Differenza rispetto a entrambe le immagini di controllo: al massimo
  1% di pixel sopra soglia RGB e errore medio RGB <= 1. Immagine stabile
  a camera immobile; conteggio ripristinato al reset.
- ALS visibile e una sola chiamata aggiuntiva; cielo e cupola conservati.
- Zero errori browser o richieste esterne; immagini e metriche verificate.

La soglia è un controllo tecnico, non una misura di qualità artistica.
Non è una prova su smartphone fisici né una misura FPS/consumo. Il
confronto non integra ancora il master nella route di navigazione,
non autorizza rilascio e non risolve la dipendenza CI dagli artefatti
temporanei. Dopo esito positivo: affinamento materico e raccordo
navigabile, con collaudo su dispositivi reali.
