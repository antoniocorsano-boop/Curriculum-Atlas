# ALS-01 — Sistema di luci astrali riutilizzabile

Stato: pilota isolato; non approvazione artistica o autorizzazione alla pubblicazione.
Base scultorea immutata: ART-FINAL R2, PR #108, GLB SHA-256
684849b72dfc3314c6383e3a0864fa244145811f3d27fb9bdc76d7fbfd7f92e0.

## Uso
Il componente è decorativo, non esprime stati didattici, non identifica
destinazioni, non intercetta azioni e non costituisce informazione indispensabile.
Si applica su un ancoraggio esplicito (id, profilo, centro XYZ Z-up, raggio, fase,
stato, abilitazione), solo dove migliora orientamento o identità. Non applicarlo
automaticamente a ogni oggetto. I profili sono definiti in core.mjs, fonte unica.

| Profilo | Destinazione esemplare | Punti | Periodo | Ampiezza relativa |
| --- | --- | ---: | ---: | ---: |
| Memoria | Storie, libri | 5 | 4,8 s | 8% |
| Processo | Laboratori, nodi | 5 | 4,1 s | 9% |
| Orientamento | Scoperte, mappe | 4 | 4,6 s | 8% |
| Direzione | Percorsi, guide | 4 | 5 s | 8% |
| Soglia | Portali, ingressi | 4 | 5 s | 6% |

Prima applicazione: 18 punti, all'interno degli ingombri R2, senza nuova luce
fisica, senza modifica del modello GLB, dell'architettura o delle destinazioni.
Il piccolo alone di ogni punto è parte del profilo ottico, non un alone
dell'intera scultura. I moti orbitali e direzionali restano rinviati.

## Contratto operativo
- Stati idle, focus, active, quiet: modificano l'intensità entro il limite 0,42.
- Quiet, pausa e preferenza per movimento ridotto sono statici. Nessun lampeggio,
  spegnimento totale o salto temporale della pulsazione. Periodo minimo 3,5 s,
  ampiezza massima 10%, massimo 7 punti per ancora, 64 nell'intera istanza.
- Inizialmente statico; il movimento è una scelta esplicita. Comando visibile,
  raggiungibile da tastiera e tocco, arresto su pagina nascosta o movimento
  ridotto, nessuna ripartenza automatica dopo l'arresto.
- Il chiamante governa l'animazione, le preferenze e il ciclo di vita.
  Il componente non crea timer, reti, dipendenze, sorgenti luminose o accessi.
- Adattatore Three.js: un oggetto Points, una chiamata di disegno addizionale,
  profondità rispettata, alone morbido, nessuna intercettazione del puntatore.
  Aggiornamento via update, stato via setState, rimozione via dispose.
- In Blender il medesimo campionamento statico può alimentare un adattatore
  dedicato; non presumere equivalenza percettiva tra motori.

## Qualificazione
Test deterministici e prova reale in Chromium/Three.js r128, sei formati, su
modello R2 esatto. Verificare presenza visiva, budget, pausa, preferenza per
movimento ridotto, assenza di richieste esterne e regressioni di rotazione.
Restano separati: prova Blender nel contesto architettonico, esame artistico,
integrazione del Gateway, collaudo fisico e autorizzazioni.

Zero nuovi servizi, nessuna spesa autorizzata, nessun merge o deploy.
