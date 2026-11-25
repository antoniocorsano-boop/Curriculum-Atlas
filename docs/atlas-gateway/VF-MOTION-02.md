# VF-MOTION-02 — Regia temporale dichiarativa
Sottolavorazione di TRAMA #354; stessa PR Atlas #152. Nessuna nuova libreria, modifica a main, pubblicazione o nuovo ramo.
## Contratto
`atlas.scene.timeline/v1`: durata intera 500–10000 ms, 2–24 fotogrammi chiave ordinati, canali numerici limitati (orbita, inclinazione, luce, particelle, salita), identificativi di fase inerti, inizio/fine neutri. Interpolazione smoothstep e orologio monotono fornito dal motore. Nessun codice eseguibile, URL o comando narrativo nel dato. Il modello e la selezione dei portali non sono alterati.
## Dimostrazione
Anteprima tecnica esistente `/atrio/?vf-motion=2`: avvio volontario, ingresso → rivelazione → messa a fuoco → quiete in 4,5 s. Regia relativa alla vista scelta, limite spaziale già previsto dall'atrio. La luce e la posizione delle particelle seguono lo stesso tempo della camera. La modalità precedente `vf-motion=1` resta disponibile. Comandi camera e interazione sul canvas interrompono la regia; arresto manuale, pagina nascosta e movimento ridotto ripristinano lo stato neutro. Il DOM conserva gli accessi.
## Verifica e limite
Test deterministico del contratto, rifiuto di dati fuori limite, prova di ciclo e arresto; Chromium software desktop/mobile con acquisizione immagine durante la sequenza. Qualificazione reale e misure sul telefono fisico ancora necessarie. Nessuna transizione fra mondi, editor World Composer, animazione di mesh indipendenti o pubblicazione in questa consegna; la ricetta è il primo nucleo riusabile, non il contratto definitivo di produzione.
