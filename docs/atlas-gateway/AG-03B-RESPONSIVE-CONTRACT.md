# AG-03/B — Contratto di maturità della sala Atlas

Stato: CANDIDATA / QUALIFICAZIONE RICHIESTA / NON PUBBLICARE.

## Causa del rilievo
Il collaudo 43823006255 (commit a377d3e) ha verificato il rendering e i nove comandi sul formato 320 × 568, ma ha rilevato scorrimento esterno. Il foglio generale di Atlas riserva al body mobile 70 px più la safe area per la barra inferiore. Il Gateway possiede una navigazione propria: quella riserva si somma al contenitore alto 100dvh.

## Contratto del contenitore
- La modalità immersiva occupa la finestra disponibile; altezza dinamica con alternativa 100vh per browser meno recenti.
- La correzione del body si applica esclusivamente in presenza del Gateway; nessuna modifica alla barra mobile ordinaria di Atlas.
- Intestazione, avviso persistente, scena e navigazione hanno righe distinte. I messaggi non devono cambiare le dimensioni della scena.
- Nove comandi della scena raggiungibili, con superficie di tocco minima verificata; portali duplicati nella navigazione HTML accessibile.
- La scena conserva rotazione dell'atrio, rotazione dei portali, ripristino e zoom. Il modello originale è immutato.
- In condizioni estreme (larghezza inferiore a 320 px o altezza inferiore a 300 px) e con preferenza di movimento ridotto, passaggio alla vista semplificata. Il ritorno al 3D è esplicito.
- La perdita del contesto grafico interrompe la scena e rende disponibili gli accessi HTML; nessuna perdita di navigazione.
- Nessun rilassamento CSP, nessuna dipendenza remota durante l'uso, nessun accesso professionale non autorizzato.

## Gate automatico
La prova WebGL esegue tutti i sei formati anche se uno fallisce. Per ogni formato conserva esito, rilievi e schermate: 320×568, 393×873, 873×393, 768×1024, 1440×1000, 1920×1080. Controlla geometria della finestra e del contenitore, assenza di padding estraneo, intersezione reale dei comandi con il viewport e hit test, stabilità dopo avviso Studio, rotazione dei portali e navigazione. Verifica cambio di orientamento in sessione, viewport insufficiente, riavvio, perdita reale del contesto WebGL in Chromium e preferenza di movimento ridotto. Le prove devono fallire se anche uno dei requisiti non è soddisfatto.

Il collaudo automatico usa Chromium con WebGL software; non costituisce misura delle prestazioni su uno smartphone fisico, né approvazione grafica su LIM. Dopo esito positivo: AG-04 con verifica umana e visiva, dispositivi reali, fluidità, leggibilità, orientamento e qualità architettonica. AG-05 revisione indipendente prima di eventuale integrazione. Home invariata e nessuna distribuzione.
