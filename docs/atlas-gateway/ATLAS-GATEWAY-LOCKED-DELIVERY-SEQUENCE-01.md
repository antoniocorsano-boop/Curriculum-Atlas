# ATLAS-GATEWAY — SEQUENZA OPERATIVA VINCOLANTE 01
## Dalla geometria dell'atrio ART-DIR-02 alla fruizione WebGL
**Blocco decisionale:** 21/11/2026 · **Stato:** sequenza progettuale registrata, non approvazione delle candidate Blender.

## Principio inderogabile
Un solo percorso `ARCH-04 -> VIS-01 -> WEB-01 -> APPROVAZIONE E PUBBLICAZIONE`. Ogni fase utilizza gli artefatti versionati e le prove della precedente; nessuna nuova famiglia di prototipi parallela. Non si considera conclusa una fase sulla base del solo esito PASS di GitHub Actions. La fotografia canonica e il modello ARCH-03 storico non sono mai sovrascritti.

## Riferimenti obbligatori
- **Sorgente ART-DIR-02:** [JPEG canonico in Drive](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`; [misure](./ART-DIR-02-CANONICAL-LANDMARKS.json).
- **Architettura dettagliata:** [specifica geometrica](./ARCH-04-ARCHITECTURAL-GEOMETRY-PROJECT-01.md) e [contratto parametrico JSON](./ARCH-04-ARCHITECTURAL-GEOMETRY-PROJECT-01.json).
- **Tavole:** [PL-01 planimetria](./drawings/ARCH-04-PL-01-PLAN.svg), [SE-01 trasversale](./drawings/ARCH-04-SE-01-TRANSVERSE.svg), [SE-02 longitudinale](./drawings/ARCH-04-SE-02-LONGITUDINAL.svg), [PR-01 allineamento](./drawings/ARCH-04-PR-01-CANONICAL-FIT.svg).
- **Aspetto futuro VIS-01:** [analisi architettonica della fonte](./ATLAS-ARCH-VIS-REFERENCE-ANALYSIS-01.md), [specifica esecutiva dei componenti/materiali/luci](./ATLAS-BLENDER-EXECUTION-SPEC-01.md) e [inventario JSON](./ATLAS-BLENDER-EXECUTION-SPEC-01.json).
- **Modello candidato ultimo:** [ARCH-04 R2 in Drive](https://drive.google.com/file/d/1txZ0sBnOh6zeovEGHBx6n5f2DBnfNFcn/view) ([test GitHub PASS](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44867149465)), **NON APPROVATO ARTISTICAMENTE**.

## Fase 1 — ARCH-04: PROGETTO ARCHITETTONICO E GEOMETRIA, prima priorità
**1A. Progetto:** quote, moduli, centri, formule, disegni 2D, schema costruttivo; individuazione esplicita di ciò che la fotografia non prova. *Stato: elaborati iniziali versionati, approvazione progettuale da verificare*.
**1B. Modellazione Blender:** costruzione e correzione di tutte le giunzioni geometriche reali (basamenti con appoggio, pilastri/solai, ring di ripartizione tetto, arco dei 4 portali, podio, fronti di ingresso); senza materiali definitivi. *Stato: da eseguire sull'ultima candidata in un nuovo commit verificato*.
**1C. Calibrazione compositiva congiunta:** camera, apertura di cielo visibile, corona, quattro portali, volume del podio e due gallerie; confronto HERO + SIDE + 3 viste mobile, oltre alle sezioni ortografiche. Rifiutare una correzione che migliori un solo elemento peggiorando gravemente l'insieme.
**1D. Gate geometrico:** verificare i controlli GEO-00…GEO-08 del [contratto](./ARCH-04-ARCHITECTURAL-GEOMETRY-PROJECT-01.json) e richiedere valutazione artistica umana sul file `.blend` preciso. **Senza esito approvato, non passare a VIS-01.**

## Fase 2 — VIS-01: CONTENUTI, MATERIALI, LUCE E SCENOGRAFIA
**Bloccata fino al Gate ARCH-04.**
Ricostruire con fedeltà individuale per tutti i portali: icona, titolo, sottotitolo, scena illustrativa (strati, rete, gradini, pianeta); superfici PBR (pietra, grafite, ottone, vetri), 12 ruoli di illuminazione, luce zenitale, corona, punti locali, raggi volumetrici, riflessi su pavimento e calotta, librerie, drappi, vegetazione e fioriere. Costruire un master Cycles professionale, con comparazione all'originale e prove di resa laterale. **Gate VIS-01:** verifica artistica umana, inventario PBR/licenze, prova che gli effetti non sono overlay 2D che falliscono con la parallasse.

## Fase 3 — WEB-01: DERIVATO REALE, LEGGERO E NAVIGABILE
**Bloccata fino al Gate VIS-01.**
Derivare dal master approvato una collezione WebGL/glTF ottimizzata; bake dove necessario, texture compresse, qualità su GPU reale, test di caricamento e tempi fotogramma. Integrazione esclusiva nel motore Atlas esistente; nessuna applicazione nuova. Quattro hotspot e controlli DOM accessibili, inclusi i testi operativi e «Entra in Atlas»; prove mobile verticale/orizzontale e revisione dei riflessi rispetto al render Cycles.

## Fase 4 — Qualificazione e pubblicazione separate
Solo con consenso esplicito: verificare privacy, link, curricolo e fallback accessibili, qualità web reale su smartphone, approvazione artistica e commit precisi. Nessuna fusione in main o rilascio studenti automatizzati dalle fasi 1–3.

## Obblighi permanenti di tracciabilità
Ogni elaborato deve riportare **fonte**, **versione/commit**, **stato**, **metodo di produzione**, **asset**, **render effettivi**, **SHA-256**, **esito tecnico**, **esito artistico** e **decisione sul prossimo passo**. Conservare file originale della fonte, prompt/specifiche di ricostruzione, master Blender e derivati. GitHub conserva il progetto editabile; Google Drive contiene copie durevoli di consultazione e archivi dei binari. Registrare nella PR Atlas #152 e nel piano di governo TRAMA #354 le revisioni importanti.

## Stato alla creazione
- Progetto ARCH-04 dati/descrizione: **codificato**, disegni vettoriali predisposti, validazione strutturale da eseguire.
- ARCH-04 R2 modello attuale: **prodotto, tecnicamente PASS, artisticamente non approvato**; occorre adeguarlo ai nodi costruttivi e all'allineamento globale.
- VIS-01: **specificata, non realizzata sul master approvato**.
- WEB-01 e pubblicazione: **non autorizzate**.
