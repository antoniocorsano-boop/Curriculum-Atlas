# ATLAS ART-DIR-02 — Calibrazione ottica e geometrica R3, prosecuzione R2

**Data:** 21 novembre 2026. **Stato:** prova R3A richiesta al sistema di integrazione; non equivale ad approvazione artistica. **Unica linea di prodotto:** PR #152 / TRAMA #354.

## 1. Decisione architettonica invariata

Fonte canonica: JPEG 1536×864 in Drive, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.

I quattro accessi sono lastre sottili di vetro illuminate, con sagoma arrotondata e grafica integrata, **emergenti da quattro feritoie reali** nel pavimento. Sono tangenti all'arco di circonferenza comune. Si mantengono centro di ipotesi `C=(0,-2)`, simmetria bilaterale, nessun piedistallo indipendente, cupoletta/oculo, podio, luci, materiali e identità realizzati in ART-PROOF-01B. L'interpretazione resta una **ipotesi geometrica** della vista sintetica, non una quota misurata.

## 2. Evidenza che guida la calibrazione

[R2 conclusa](./ATLAS-ART-DIR-02-PORTAL-READING-R2-RESULT-01.md): raggio `R=7,30 BU`, angolo estremo circa `54,6°`; portali percepiti troppo piccoli e arretrati, curva zenitale troppo angolosa. La visione canonica presenta portali più monumentali e connessi al suolo.

**Implicazione matematica:** nel modello vincolato a `C=(0,-2)`, aumentare solo `R` a parità di ascissa `x` produce `y=-2+sqrt(R²-x²)`, ossia allontana i vetri dalla camera e può peggiorarne la presenza apparente. Pertanto raggio, angoli, ascisse, dimensioni delle lastre, distanza camera e focale vanno valutati **insieme**. Nessuna quota R3 viene presentata come misura dell'originale.

## 3. Procedura operativa R3, senza modificare R2

- Sorgente: lo stesso `atlas-art-proof-01b-cinematic.blend`, ricostruito come per R2. **R2 non viene sovrascritta**, né nel codice precedente né nello ZIP Drive.
- Codice distinto: `scripts/atlas-gateway-production/art_proof_01b_portals_calibration_r3.py`. Profili A/B/C di confronto disponibili in codice, con la sola A prodotta per prima per contenere tempi e risorse.
- **Profilo A**: `R=8,3 BU`, `x=±5,95/±2,40`, larghezza lastra `1,18×`, altezza `1,22×`, camera HERO `Y=-14,6`, focale `31,8 mm`. È una **proposta di prova**, non un nuovo canone.
- Profili B/C restano ipotesi per un successivo confronto se A non soddisfa, senza avviare ricostruzioni parallele o tre render costosi non necessari.
- Quattro viste Cycles: **HERO** (proporzioni rispetto alla foto), **OBLIQUE** (vera profondità), **TOP_ORTHO** (continuità dell'arco), **SLOT_DETAIL** (attacco vetro/pavimento, fotografia ravvicinata; non ancora vera sezione tagliata).
- Verifiche documentate: identità fonte, poligoni reali del pavimento, quattro tagli booleanei, tangenzialità, simmetria, distanza tra pannelli lungo l'arco, provenienza/hashes dei file, rettangoli di proiezione HERO rispetto ai quattro riferimenti 2D. L'errore 2D è **diagnostico**, non un punteggio artistico o una soglia di approvazione.

## 4. Criteri di giudizio umano

1. **Monumentalità:** aumentano la presenza visiva dei vetri senza soffocare la scena e senza collisioni, mentre lucernario e podio rimangono leggibili.
2. **Curva:** in pianta l'insieme non sembra una V accentuata; frontalmente rimane una composizione organica di quattro vetri, senza porte architettoniche finte.
3. **Posa:** nessun piede a vista; la luce sembra provenire dalla feritoia e dal bordo vetrato. La vista ravvicinata non sostituisce una futura sezione tecnica.
4. **Fedeltà d'insieme:** confronto fra vera immagine canonica, HERO e OBLIQUE; quando la geometria raggiunge proporzioni attendibili, affrontare criticità non ancora risolte di cupola/oculo, luce, materiali e arredo, senza effetti ornamentali aggiuntivi per mascherarle.
5. **Rilascio:** la qualificazione automatica del file Blender non autorizza approvazione artistica, conversione a WebGL, fusione o distribuzione.

**Traccia di esecuzione:** `.github/workflows/atlas-art-proof-portals-r3.yml`. Conservare l'eventuale artefatto di integrazione e poi archiviare in Drive, con SHA-256 e rimando alla chat e alla PR, prima della successiva modifica.
