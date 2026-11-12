# Prologo video — integrazione controllata
Stato: adattatore implementato, video originale MISSING, revisione umana PENDING, nessuna pubblicazione.
Il montaggio originale Missione118_Video_Prologo.mp4 oppure Prologo.mp4 va recuperato e identificato con SHA-256. Non rigenerare voce, immagini o transizioni senza decisione esplicita; nessun file sintetico destinato alla fruizione.

Per il candidato locale, una volta acquisito il file reale e verificata la provenienza:
```sh
M118_PROLOGUE_MP4=/percorso/Prologo.mp4 M118_PROLOGUE_SHA256=<sha256-verificato> node scripts/build-missione118-runtime.mjs artifacts/missione118-video/Missione118.html
```
Il generatore rifiuta path/hash incompleti, impronta errata, dimensioni fuori limite o intestazione non MP4. Il controllo di intestazione non è validazione completa del codec o dei diritti. Il filmato è incorporato in data URI senza ricodifica, nessuna richiesta esterna. Il prologo video è la modalità principale, con riproduzione volontaria, controlli nativi, trascrizione canonica, alternativa per scene e ingresso esplicito nella missione. Senza file, il candidato rimane TEXT_ONLY, non sostituto qualificato. Con file, il manifesto segnala EMBEDDED_VIDEO_UNREVIEWED e hash del video.

Prova locale su HTML del commit db1ccc95 con clip sintetica MP4 di un secondo: Chromium via set_content, viewport 390x844, offline, metadati e riproduzione, trascrizione, passaggio al testo fermo, ritorno al video, ingresso nella missione, nessuna richiesta HTTP esterna o errore JS; rifiuto hash alterato. La navigazione file:// nell'ambiente locale è stata bloccata da policy del browser; non dichiarare qualificato quel percorso video. Il test sintetico non è prova del filmato originale, della sincronizzazione, della pronuncia o di Android reale. CI di regressione testuale e controlli strutturali da acquisire sul nuovo SHA.

Prima del PASS: verifica codec e riproduzione del filmato esatto su browser/Android, confronto trascrizione e sottotitoli, ascolto integrale umano (AX-118, gruppi di senso, pause e continuità), diritti, accessibilità, revisione Q04/Q05/Q06/Q09/Q10/Q11. Nessun invio dati, nessun rilascio.
