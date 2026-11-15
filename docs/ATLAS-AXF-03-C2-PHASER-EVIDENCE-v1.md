# AXF-03/C2 — Evidenze del candidato Phaser
15 novembre 2026 — PASS del collaudo circoscritto, non qualificazione per produzione.
- [PR laboratorio #94](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/94), head `4891e0037437b3fcfbbeb027cbbb352d3b269517`, non integrata.
- [Esecuzione](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/43691161527), job 132741916597, 4/4 workflow superati sullo stesso head.
- Upstream `phaserjs/template-nextjs@15ab00b32d5954c7ca293e9b966fc014fdb4aa4a`; Phaser 4.2.1, Next 15.5.28, React/ReactDOM 19.1.8; override PostCSS 8.5.23, Nanoid 3.3.18, source-map-js 1.2.2. Configurazione Scale.FIT/CENTER_BOTH e CSS responsivo; scene originali conservate.
- Audit npm completo e produzione: 0 voci alla data della prova. Export statico 2.4M. Non è una garanzia di sicurezza assoluta.
- [Artefatto diagnostico](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/43691161527/artifacts/14152756548), 28 file, digest sha256:fbb89ab38179e91db15a319fef3abb97dbfdbcb539ca0071b0f0e64b19604407; scadenza 22 novembre. PNG non ispezionati direttamente. Log riletti e valori riportati qui per conservazione oltre la scadenza.
| Viewport CSS | Canvas CSS | Metodo | Movimento, pausa, ritorno | Richieste esterne / write / websocket / errori JS-HTTP osservati |
|---|---|---|---|---|
| 320×720 | 304×228 | touch DOM | PASS | 0 |
| 390×844 | 374×280.5 | touch DOM | PASS | 0 |
| 430×932 | 414×310.5 | touch DOM | PASS | 0 |
| 844×390 | 497.984×373.484 | touch DOM | PASS | 0 |
| 1280×800 | 1024×768 | tastiera DOM | PASS | 0 |
Tutte le viewport superano il gate geometrico orizzontale e delle proporzioni 4:3; nessuna eccedenza orizzontale rilevata. Test Chromium emulato, non dispositivi reali; nessuna certificazione LIM, screen reader, accessibilità completa o input diretto canvas. Nessuna prova del modello pedagogico.
## Raccomandazione consultiva
Phaser è candidato prioritario per un rendering interattivo specializzato, non sostituto dell'Experience Engine. Prossimo passo AXF-03/C3: piccolo collaudo dell'input diretto su una scena, alternativa semantica DOM sincronizzata, ciclo mount/unmount senza residui, riproducibilità del lock e prova di rete anche dopo interazioni. Controllo umano su dispositivi reali e licenze/asset prima di integrazione. Separare la validazione della fisica didattica e dell'uso del motore da quella della demo. Successiva prova verticale virtuale Energia, solo se i gate pertinenti sono superati; preservare immagini e contratti Atlas. SceneryStack resta sospeso. Nessun merge, deploy, modifica runtime, autorizzazione studenti o promozione formale di GOV/AXF.
