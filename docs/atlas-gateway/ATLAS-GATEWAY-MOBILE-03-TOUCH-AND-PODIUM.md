# ATLAS-GATEWAY-MOBILE-03 — Portali touch e marchio sul basamento

**Data:** 20 novembre 2026
**Ramo:** `work/atlas-gateway-01-foyer` / PR #152
**Stato:** correzioni delle sovrapposizioni HTML/CSS implementate; **integrazione artistica del basamento verticale NON completata**; non approvato artisticamente, non pubblicato.

## Decisione artistica

L'ideatore rifiuta le scritte sovrapposte ai quattro portali, poiché i portali sono parte integrante dell'immagine. La superficie dell'oggetto deve costituire il bersaglio interattivo, senza etichette visibili incollate dalla pagina. Il marchio ATLAS deve apparire fisicamente collocato sulla superficie curva e convessa del basamento, con corretta prospettiva, curvatura, materiale, luci e ombreggiatura; **non** basta un testo DOM, uno SVG piatto o una decalcomania generica.

Nel master artistico, il basamento è **ellittico, ampio, basso, con volume superiore morbidamente convesso** (ART-DIR-02, §3); non sostituirlo con una sfera intera, una statua di Atlante o un cilindro alto.

## Interventi sul runtime completati

1. **Verticale:** eliminati i quattro `<span>` con i titoli visibili dentro gli hotspot. Rimangono collegamenti nativi `<a>`, `aria-label` descrittivi, focus tastiera e dimensioni toccabili. Nessuna iscrizione disegnata sui pannelli già presenti nella fotografia.
2. **Panoramico desktop/telefono ruotato:** tolta la maschera `podiumScreen` e il marchio sostitutivo `podiumEmblem`: si vede senza ulteriori sovrapposizioni l'iscrizione **ATLAS già incorporata** nel file `plate-prova.jpg`. Eliminata la seconda intestazione HTML visibile: il panorama include quella originale.
3. **CTA nel panorama:** area di link trasparente sopra il pulsante contenuto nella fotografia, senza duplicato testuale; nella scena verticale il pulsante HTML è visibile perché assente dall'immagine.
4. Prove automatiche: assenza etichette DOM sugli hotspot, nomi accessibili conservati, touch al centro del portale, assenza di maschera aggiuntiva sul basamento desktop; mantenere verifiche precedenti su rotte, viewport e orientamenti.

## Difetto artistico residuo — priorità alta

Il file **verticale attualmente montato**, `public/atlas-gateway-entry/mobile-atrium-01.png` (948×1659, SHA-256 `a742aed54e69a9a857540d7b1f39e0486dd5d07597e3e4cf57723fb6f92f347f`), mostra un disco/palco quasi piano, privo di un emblema ATLAS. **Non possiede una semisfera convincente sulla quale proiettare correttamente la denominazione.** La pagina web non deve simulare tale forma incollando una scritta DOM sul disco.

Necessita una nuova risorsa artistica derivata **dallo stesso disegno verticale**, modificando **solo il basamento centrale**: volume superiore convesso e molto basso coerente con la vista originale ART-DIR-02; iscrizione ATLAS tipograficamente corretta sulla superficie fisica, con deformazione prospettica conforme alla curvatura; ombreggiatura, riflessi e bordi integrati. Inquadrare sempre i quattro stessi portali e il lucernario; non trasformare l'atrio in un edificio classicheggiante né introdurre figure mitologiche.

**Conservare** il precedente PNG e creare risorsa `mobile-atrium-02` solo dopo confronto visivo affiancato, ricalcolo di hotspot, verifica integrità, peso e prove su smartphone. Se si adopera Blender, mappare la denominazione mediante texture/decal proiettata sulle coordinate UV della superficie ellissoidale e verificarne il render con la camera finale. In alternativa utilizzare un edit controllato del fondale, ma richiede approvazione artistica e nuova provenienza.

## Condizioni di accettazione

- Nessuna etichetta visibile indipendente sui quattro accessi (neppure al tocco o nell'orientamento ruotato).
- I quattro bersagli hanno la stessa posizione e dimensione dei quattro pannelli illustrati, restano accessibili con tastiera/lettore di schermo e funzionano senza WebGL.
- Sul desktop il marchio originale non è coperto o duplicato.
- Sul verticale il basamento convesso porta **ATLAS** come parte della materia: testo non sospeso, senza deformazioni tipografiche o ombre incoerenti.
- Prove reali: desktop 1440×900, verticale 390×844 e 320×568, orizzontale 844×390; nessuno scorrimento orizzontale; «Entra in Atlas» raggiungibile; confronto screenshot + rilettura dell'asset.
- Non dichiarare APPROVATO finché l'immagine verticale ricostruita non sostituisce la precedente e la revisione umana non la giudica coerente con ART-DIR-02.

## Provenienza e vincoli

- Sorgente: [MOBILE-ART-PROVENANCE-01](./ATLAS-GATEWAY-MOBILE-ART-PROVENANCE-01.md)
- Direzione artistica: [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md)
- Configurazione mobile: [MOBILE-02](./ATLAS-GATEWAY-MOBILE-02.md)
- Prima implementazione: [PR #152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152)
- Nessuna pubblicazione, integrazione in `main`, cambiamento di rotte o autorizzazione studenti.
