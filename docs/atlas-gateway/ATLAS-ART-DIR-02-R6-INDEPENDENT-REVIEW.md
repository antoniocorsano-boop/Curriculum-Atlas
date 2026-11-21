# ART-DIR-02 — Revisione E indipendente della R6ABCD (21/11/2026)

**Stato:** `REVIEW_COMPLETE__ARTISTIC_FAIL__REMEDIATION_REQUIRED`.  
**Tipo:** controllo artistico separato dai livelli di produzione A-D; revisione condotta da ChatGPT usando le immagini reali. *Non costituisce una seconda valutazione umana o di un agente autonomo distinto.*  
**Riferimento:** JPEG [ART-DIR-02 immutato](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`; [26 osservazioni/16 relazioni](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/work/atlas-gateway-01-foyer/docs/atlas-gateway/ATLAS-ART-DIR-02-VISUAL-READING-02.md).  
**Candidata:** [R6ABCD HERO integrata e master .blend](https://drive.google.com/file/d/1eK5W_OcBEWa86vrN9r8CMLaAToVS-_Zj/view), `.blend` SHA-256 `33768584496e16b7a545f236b6ac3a5da3231358547870f03f79815f54c0fa4d`; [confronto affiancato](https://drive.google.com/file/d/1QK8kBMNto49tjJ7tkBJINVvzIpcpEnyv/view).  
**Provenienza:** [R6ABCD Actions #44938236317](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44938236317) PASS tecnico. [PR #165](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/165) ancora in bozza.

## Esame separato per zone e requisiti

| Codice | Oggetto | Giudizio artistico | Motivazione osservabile |
|---|---|---|---|
| A01 | Cielo visibile | **FAIL** | Disco azzurro ovale piatto, interamente percepibile e sospeso; mancano alte luci e aperture parzialmente ritagliate |
| A02 | Corona lucernario | **FAIL** | Manca la singola sottile linea dorata continua che struttura percettivamente l'oculo |
| A03 | Aste interne contro cielo | **PARTIAL** | Le grosse strutture sono ridotte, ma le poche aste residue non si leggono come sottili controluce |
| A04 | Intradosso della volta | **FAIL** | Evidenti 18 ampie alternanze radiali, su materiali metallici/costellati; l'immagine richiede una superficie scura continua |
| A05 | Fasci zenitali | **FAIL** | Atmosfera quasi priva di fasci blu-bianchi verso il centro; il cielo non illumina percettivamente il foyer |
| A06 | Balconata superiore | PARTIAL | Fasce e livelli presenti ma struttura leggera non abbastanza continua |
| A07 | Parapetti vetrati | PARTIAL | Vetro fisicamente presente; riflessi bianchi, griglia di campate e montanti ancora dominanti |
| A08 | Pilastri | PARTIAL | Ripresi blu-grafite ma alcuni elementi risultano grigi e pallidi in illuminazione |
| A09 | Vetrate perimetrali | **FAIL** | Fasce chiare/quasi bianche senza profondità amber e senza biblioteche visibili |
| A10 | Librerie | **FAIL** | Quattro moduli esistono nel modello ma quasi invisibili nella HERO |
| A11 | Stendardi | PARTIAL | Due elementi presenti e con marchio A; dimensione e contrasto non equivalenti |
| A12 | Alberelli | **FAIL** | Due Pachira reali ma silhouettes poco leggere, troppo sottili e disperse rispetto al primo piano |
| A13 | Vasi alti | PARTIAL | Metallo presente ma geometria e posa troppo poco evidenti |
| A14 | Piante gallerie | PARTIAL | Istanze presenti ma leggibilità secondaria ridotta |
| A15 | Fioriere basse | PARTIAL | Due vasche laterali, composizione tagliata correttamente ma finitura poco champagne |
| A16 | Piante basse | **FAIL** | Masse vegetali deboli rispetto al fogliame ricco e fitto del riferimento |
| A17–20 | 4 vetri | **FAIL** | Lastre molto chiare, quasi grigie; silhouette di pannelli piatti, poco cobalto, poco monumentali; titoli/iconografia visibili |
| A21 | Singoli basamenti luminosi | PARTIAL | 4 placchette fisiche ed emissione dei bordi: scelte corrette, ma ancora non perfettamente integrate nel pavimento |
| A22 | Podio ATLAS | PARTIAL | Curvatura e marchio presenti, ma riflessi bianchi molto forti e superficie quasi specchiante; anelli più spessi del canonico |
| A23 | Pietra pavimento | **FAIL** | Tono molto chiaro e ruvido/rumoroso, non blu-notte levigato lucido |
| A24 | Direttrici prospettiche | **FAIL** | Presenti nel 3D ma quasi invisibili in HERO |
| A25 | Luci ambientali galleria | **FAIL** | Luce fredda omogenea, poche nicchie calde leggibili |
| A26 | Loghi e accesso | PARTIAL | Identità sui vetri; pulsante «Entra in Atlas» va testato nel sito reale, non in Cycles |

I giudizi sono valutazioni qualitative esplicite, **non misure automatiche arbitrarie** né un giudizio dei materiali fisici ricavato con certezza dalla foto sintetica.

## Le tre correzioni artistiche ad alto impatto, in ordine

**E-01 — Prima regia della volta e del cielo, non nuovi dettagli.** Rendere l'intradosso un mantello blu-grafite pressoché continuo; portare in primo piano visivo **una** sottile corona oro-bianco attorno al cielo senza creare tre ulteriori anelli; rendere cielo azzurro più luminoso e non piatto; fare percepire fasci zenitali freddi morbidi. Non aumentare il numero di aste, non inserire acciaio, non cambiare camera HERO.

**E-02 — Riconquistare la profondità dei quattro vetri.** Reagire al loro tono lattiginoso introducendo uno shader cobalto più scuro, trasparenza e riflessione controllate, con luminanza concentrata al bordo e al piede. Mantenere la decisione già approvata: **quattro sole basi metalliche sottili**, senza nuova feritoia e senza duplicazioni. Conservare le radici per questa prima prova: non usare geometrie nuove per mascherare problemi di colore e luce.

**E-03 — Valorizzare le risorse CC0 già acquisite.** Intervenire su scala *percepita* di piante/piante basse, trasparenza del parapetto, retroilluminazione e posizione degli scaffali **senza scaricare altri modelli**. Verificare eventuale occlusione dei quattro accessi e del podio. Aggiungere eventualmente riflessi d'oro indiretti anziché nuove cornici.

**Ordine di accettazione:** prima E-01 + E-02 in un unico esperimento artistico derivato da R6ABCD, due render veri con **camera HERO invariata**, giudizio E sulle immagini; poi E-03 solo se la prima coppia non ha peggiorato i piani della scena.

## Guardrail e condizioni di pubblicazione

1. Produzione in ramo e script non distruttivo con copia locale del master R6ABCD; nulla su main o sulla PR madre #152.
2. Verificare SHAs del master e dei due render, camera, quattro radici, tre collezioni CC0, 4 basamenti, 4 giunti R6B e marchio approvato ancora presente.
3. Bilanciare **luce e materiali con parametri misurabili**, ma non inventare valori artistici «ricavati dalla foto». Evitare luce laser, raggi volumetrici pesanti per il web, effetto piatto uniforme o stampe 2D al posto del 3D.
4. **Nessuna approvazione artistica finché il confronto a stessa inquadratura non è favorevole e validato dall'ideatore.** Solo dopo, collaudo di una campata glTF sul telefono reale con tempi, dimensioni, memoria e interazione.
5. Attenzione alle divergenze canvas/Blender: il pulsante web rimane un elemento DOM accessibile e non va aggiunto al render Cycles.
6. Nessun nuovo costo, nuovo servizio, merge, deploy o rilascio agli studenti.

**Esito finale E (oggi):** `ARTISTIC_FAIL` con tre correzioni delimitate. Non ripetere altri cicli di qualificazione astratta: una sola vera candidata visiva è il prossimo lavoro.
