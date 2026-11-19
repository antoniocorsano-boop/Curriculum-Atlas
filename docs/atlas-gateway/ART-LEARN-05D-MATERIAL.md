# ART-LEARN-05D — Finitura materica circoscritta
Base PR #123, head d6d5871943f13103dfd62299cb099e1001a1cdfe. Artefatto esatto 14523702251, ZIP SHA-256 240635f0a1e64e5f7b0dde2854c1adfab044bba88a480b6ac11776d1d0841eec. Riesame artistico PR #123 commento 7008659726: identità editoriali migliorate, ma dorature scure, nervature cromaticamente incoerenti, carta quasi bianca e senza stratificazione leggibile.
## Decisioni sperimentali
- Conservare ogni oggetto, vertice, faccia, posa, dimensione nominale e le 16 mappe originali 05C; copiare i dati e i materiali prima della modifica.
- Tintura dei bordi e nervature dalla palette sRGB delle tavole convertita in spazio lineare; rafforzare moderatamente il micro-rilievo esistente.
- Mantenere i disegni originali. Usare la maschera indipendente per una tinta della foglia più leggibile, metallicità .62 e rugosità .35 per il metallo; minore attenuazione del colore da parte della grana. Valori da qualificare, non standard universali.
- Carta con UV metriche esplicite: coordinata U attraverso lo spessore in unità scena, V lungo il taglio; passo individuale .28 mm, segnatura 1.6 mm, irregolarità di fase limitata a .13 mm. Colore multiscala e rilievo da shader, non fogli geometricamente separati. La visibilità effettiva delle linee richiede verifica ravvicinata.
## Collaudo
Confronto contro la libreria esatta 05C in uno studio identico per ciascuna coppia: dorsi, piatti, pagine, macro dorso, macro taglio carta; 11 PNG con rollback dorsi. Geometrie uguali, impronta della sorgente e stato dei suoi materiali conservati, 16 mappe incorporate, riapertura con entrambe le librerie non disponibili. Riesame visivo obbligatorio: titoli e contrasto senza riflessi bruciati, concordanza delle nervature, grana non artificiale, carta con linee e variazione credibili. PASS tecnico non prova fotorealismo né qualificazione WebGL.
## Confini
Non estendere a nuove opere né intervenire sul master, main, pubblicazione o autorizzazione studenti. Nessun nuovo servizio a pagamento. La campata semplificata con profondità geometrica (seguito di PERF-05B/P2) resta priorità successiva, non ancora implementata.
