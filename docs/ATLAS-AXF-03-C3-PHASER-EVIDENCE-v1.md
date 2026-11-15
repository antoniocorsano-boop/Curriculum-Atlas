# AXF-03/C3 — Evidenza tecnica Phaser
15 novembre 2026. PASS circoscritto della prova tecnica; non autorizzazione alla pubblicazione.
- [PR #94](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/94), head esatto `a0e49f0b03e343360ff7034693cc8274cc04c5df`, bozza, non integrata.
- [Run 43695231501](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/43695231501), job 132754165761; 4/4 workflow PASS.
- Base e dipendenze come C2: Phaser 4.2.1, Next 15.5.28, React/ReactDOM 19.1.8, override PostCSS 8.5.23, Nanoid 3.3.18, source-map-js 1.2.2. Import runtime esplicito PhaserMath. Audit completo e produzione: zero voci alla data della prova; export statico 2.4M.
- [Artefatto diagnostico](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/43695231501/artifacts/14154138388), digest sha256:cb898ae1928aa5e5249496e732293d61308f6de6b115dd859fee8e73aa23b695; scadenza 22 novembre. Log riletti, PNG non ispezionati direttamente.
| Viewport CSS | Drag diretto | Alternativa tastiera | Chiusura/riapertura | Listener scena dopo chiusura | Rete esterna/write/websocket/errori JS-HTTP osservati |
|---|---|---|---|---|---|
| 320×720 | touch emulato PASS | PASS | 2/2 | 0 | 0 |
| 390×844 | touch emulato PASS | PASS | 2/2 | 0 | 0 |
| 430×932 | touch emulato PASS | PASS | 2/2 | 0 | 0 |
| 844×390 | touch emulato PASS | PASS | 2/2 | 0 | 0 |
| 1280×800 | mouse PASS | PASS | 2/2 | 0 | 0 |
Tutti i gate C2 sono conservati: movimento/pausa/ritorno e geometria. Il nuovo test osserva il raggiungimento della destinazione mediante drag reale nel browser emulato, equivalente comando HTML da tastiera, reset, evento destroy, distacco del canvas precedente, un solo canvas alla riapertura e zero listener current-scene-ready dopo chiusura. Dieci cicli complessivi. Non dimostra assenza assoluta di perdite di memoria, accessibilità completa, sicurezza assoluta, correttezza pedagogica o uso su hardware reale.
## Decisione consultiva del Governatore
Phaser è il candidato tecnico prioritario come renderer specializzato, non nuova fonte della logica educativa. Passare alla definizione di AXF-04/05: scelta circoscritta e prima scena Energia virtuale con modello deterministico indipendente dal renderer, comandi equivalenti, conservazione energia, evidenze e integrazione contrattuale con Experience Engine. Prima del rilascio: consolidare lock riproducibile, licenze transitive e risorse, verifiche manuali smartphone/LIM e accessibilità, sicurezza dell'host Atlas separata. Il test non autorizza import delle risorse demo o dipendenze nel runtime. Nessun merge, deploy, spesa o pubblicazione studenti.
