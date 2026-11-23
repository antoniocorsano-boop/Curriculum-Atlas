# Atlas P3C — Ingresso narrativo guidato: revisione dopo la prova su Android

**Data:** 23 novembre 2026 · **Lavorazione:** P3C/R1, derivata da P3B/R2 · **Stato artistico:** DA VALUTARE SUL TELEFONO DELL'IDEATORE.

## 1. Perché la precedente pagina non era accettabile
La pagina P3B pubblicata su Cloudflare caricava correttamente l'atrio 3D e rispondeva al clic sui pannelli, ma l'immagine trasmessa dallo smartphone dell'ideatore mostrava un modello praticamente immobile, una copertura grigia dominante, nuvole artificiose e portali piccoli, con quattro pulsanti invasivi. Il codice confermava che la camera si spostava solo per 1,3 s e poi restava ferma; non era disponibile il trascinamento.

- [Schermata Android originale della critica](https://drive.google.com/file/d/15fc174U5Ykd0LTb9ysrFmRttsg6pq2q6/view).
- [Rilievi e criteri di accettazione su Atlas #151](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/151#issuecomment-7108461078).
- Esito precedente: `P3B_ART_DIRECTION_ACCEPTANCE=FAIL`, `P3B_MOTION_ACCEPTANCE=FAIL`. Conservare questo dato anche se la tecnica P3B era PASS.

## 2. Ambito della nuova soluzione
La fonte 3D non è stata riaperta: master geometrico Blender P3A/R2 e GLB P3B/R2 originale intatti; 4 livelli, oculo circolare, 4 veri pannelli GLB, 44.809 triangoli e impronta GLB `04b22de9d6c8f4e98a4eb88bf2f0e87141f9bdc685b742589845f977249e7adb`. La revisione P3C cambia **la regia e il visualizzatore**, non la geometria.

**Programma di produzione:** [p3c-guided-viewer.html](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/work/atlas-artdir02-p2-composizioni-01/scripts/atlas-gateway-production/p3c-guided-viewer.html).

**Esperienza implementata:**
1. Stato iniziale con scena già presente, luce d'ambiente animata sobriamente, titolo editoriale chiaro e invito **«Entra nella sala»**.
2. Azione volontaria dell'utente → camera che percorre fisicamente circa 4,6 unità Blender in 2,4 s; non parte senza un gesto.
3. Stato di esplorazione: **trascinamento sul canvas** su mouse o schermo tattile per cambiare realmente l'orientamento, con escursione limitata a circa ±0,60 rad in orizzontale e −0,22/+0,20 in verticale per prevenire disorientamento. La vista da smartphone è calibrata separatamente per dare importanza ai pannelli.
4. Selezione di uno dei quattro accessi mediante pannello tridimensionale o collegamento accessibile: **avvicinamento fisico della camera in 1,35 s**, breve presentazione del mondo scelto e comando «Torna alla sala». Non mostrare un collegamento /curricolo/ come azione compiuta se nella demo non è pubblicato.
5. Ritorno a una camera centrale documentata in 0,85 s, più il comando permanente «Vista iniziale».
6. Modalità `prefers-reduced-motion`: ingresso, focus e ritorno senza animazioni; materiali, contenuto e accessi testuali conservati.
7. Nuovo cielo procedurale morbido, copertura grafite meno dominante, luce calda laterale, leggibilità aumentata e comandi meno ingombranti. Nessun asset esterno, nessun audio commerciale, nessun dato scolastico.

La scena mantiene una sola pagina 3D; i quattro mondi sono presentati come **scelte di orientamento**, senza inventare contenuti già pubblicati o simulare rotte non disponibili.

## 3. Collaudo funzionale indipendente

- [Probe Chromium P3C](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/work/atlas-artdir02-p2-composizioni-01/scripts/atlas-gateway-production/p3c_experience_probe.mjs): controlla il movimento misurando le trasformazioni reali della camera e non accetta il solo evento di clic; verifica 1280×720, 390×844 e modalità mobile a movimento ridotto; conserva schermate per stato iniziale, ingresso, trascinamento, focus.
- [Flusso di pubblicazione e test Cloudflare P3C](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/work/atlas-artdir02-p2-composizioni-01/.github/workflows/atlas-p3c-guided-public-preview-cloudflare.yml): prima la prova sul localhost, poi distribuzione a ramo di anteprima isolato nella stessa infrastruttura gratuita, quindi ripetizione delle prove dal dominio pubblico con controllo SHA del GLB.
- Il primo ciclo ha rilevato un nome camera normalizzato dal caricatore glTF; il secondo ha rilevato un avvicinamento non sufficiente. Entrambi sono stati corretti con evidenza e senza ridurre la severità del controllo.

## 4. Criteri di accettazione e limiti

**Tecnicamente qualificabile:** il modello si carica senza errori; l'ingresso cambia di almeno 3 unità la posizione camera; il trascinamento cambia visibilmente l'orientamento; il focus sposta la posizione verso il portale di almeno 1 unità; i quattro comandi e il ritorno funzionano; la modalità movimento ridotto elimina le animazioni; lo stesso GLB originale è verificato per impronta dopo l'upload.

**Non sostituire l'approvazione artistica dell'ideatore:** le schermate Chromium non certificano un'atmosfera accogliente sul telefono reale, né l'adeguatezza in classe/LIM. Conservarne l'esito ancora aperto. Solo dopo prova dello studente o valutazione pedagogica e prova su dispositivi fisici si potrà stabilire la direzione editoriale definitiva.

**Governance:** versione P3C separata dalla vecchia P3B per confronto e ripristino; PR #188 rimane in bozza, nessun merge in main, nessun aggiornamento della homepage pubblica, nessuna navigazione didattica non autorizzata, nessuna nuova spesa e nessun dato personale. Le anomalie generali foundation/exit/F4 restano distinte e da sanare.

## 5. Seguito
Confrontare sullo stesso smartphone P3B (prova tecnica precedente) e P3C (esperienza guidata nuova), raccogliendo un giudizio su proporzioni, luce, leggibilità e fluidità effettiva. Se il movimento è giudicato utile ma l'immagine resta grezza, intervenire sulle finiture del GLB/materiali e sulla regia delle luci, senza ricominciare con la geometria.

## 6. Esito remoto della calibrazione mobile (23 novembre 2026)

**Pagina pubblica di prova verificata:** https://p3c-guided-experience.atlas-pr-preview.pages.dev/atlas-p3c/

**Versione di produzione della sola anteprima:** commit `7aaaa6d0e6a771ee2afe6d46af0d76d08ba294ce`; [GitHub Actions #45238259317](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/45238259317) **SUCCESS**. Sono stati superati sia i controlli locali sia quelli sull'URL Cloudflare reale: ingresso guidato, vera modifica della posizione della camera di 4,6 BU, trascinamento con effettiva rotazione della vista, avvicinamento a Esplora (camera da z13,5 a z11,2317), ritorno alla vista, comando accessibile, modalità con movimento ridotto, 0 errori JavaScript e 0 richieste non autorizzate a servizi esterni. Chromium ha simulato i formati 1280×720 e 390×844; **non è stato utilizzato un dispositivo Android fisico** per questi controlli.

**Rilievo visivo e correzione:** una prima prova P3C, tecnicamente superata, mostrava ancora un cielo e un oculo troppo ampi su smartphone. La camera P3C è stata ricalibrata senza alterare il modello tridimensionale: alla prima apertura l'oculo resta inquadrato, mentre la vista dopo l'ingresso viene orientata più verso il podio e i portali; in formato verticale il campo visivo è stato portato a 82°. La nuova immagine conserva solo la parte superiore del cerchio e dà più spazio ai pannelli. Non è una certificazione della qualità artistica, ancora da accertare con l'ideatore.

**Pacchetto di prove archiviate in un unico file ZIP nel Drive privato Atlas:** https://drive.google.com/file/d/1VvK12JD8nsdN1KTeNo1Y8J2mwYH80gRA/view ; 3.085.352 byte, SHA-256 `07291d48f5b759ebccf9f769842aba25e62039c65aa6ff45d1aaa25fcb1c6d0a`. Comprende sette file di prova remota: schermate autentiche su smartphone simulato (inizio, ingresso, trascinamento, focus), screenshot desktop e rapporto JSON, oltre al manifesto con URL, commit e impronte digitali. Il file GLB originale P3B/R2 resta archiviato nel Drive esistente; non duplicarlo.

**Stati confermati:** `P3C_PUBLIC_WEBGL_DEMO_PASS=true`; `P3C_GUIDED_ENTRY_PASS=true`; `P3C_POINTER_DRAG_SIMULATED_PASS=true`; `P3C_PORTAL_FOCUS_RETURN_PASS=true`; `P3C_REDUCED_MOTION_PASS=true`; `P3C_ART_FINAL_APPROVED=false`; `ANDROID_PHYSICAL_QUALIFIED=false`; `STUDENT_CONTENT_PUBLISH_APPROVED=false`; `MAIN_MERGE_APPROVED=false`.

La pagina precedente P3B rimane raggiungibile separatamente per confronto e non è stata promossa. È vietato dichiarare «esperienza immersiva definitivamente approvata» prima di una prova e valutazione sul telefono reale dell'ideatore; la qualità visiva rimane un tema aperto, diverso dalla presenza del movimento.
