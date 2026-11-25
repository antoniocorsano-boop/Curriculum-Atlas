# ATLAS-WORKFLOW-REALIZATION-01 — Realizzazione dell'atrio con compositore inverso

**Data:** 20 novembre 2026.  
**Stato:** processo documentato e persistente; **non equivale alla scena 3D prodotta o collaudata**.  
**Vincolo superiore:** ART-DIR-02; **input fisico necessario**: PNG canonico a quattro portali con SHA verificato.

## Catena obbligatoria e non ridondante

```text
ATLAS-PROMPT-ART-01 (intenzione) + ART-DIR-02/PNG canonico (vincolo visivo)
  → ATLAS-GEO-SPEC-01 (elementi osservabili e parametri da ricostruire)
  → ATLAS-COMPOSER-SEED-01 (ipotesi relative versionate)
  → compositore parametrico Blender (geometrie vere e CAM_HERO)
  → render in grigio / confronto landmark e silhouette
  → correzione camera, volumi, quattro portali, oculo, podio
  → approvazione geometrica / SIDE e MOBILE
  → ASSET-KIT-01 (moduli/materiali professionali adeguati alla geometria)
  → Master Blender + render Cycles e approvazione artistica
  → derivato GLB + Three.js r128 esistente e prove Android
  → proposta di pubblicazione separata
```

## F0 — Materializzare l'originale
- Verificare recupero nel Drive/repository dell'immagine originale, nome, formato, risoluzione e SHA.
- Non sostituirla con screenshot, JPEG reinviato o altra generazione.
- Prove: byte accessibili alla CI, SHA-256 e manifest di origine.

## F1 — Parametrizzazione e rilievo
- Annotare pixel e landmark sul file canonico (assi, lucernario, due ordini, quattro portali, ellisse podio, giunti).
- Tracciare confidenza di ogni misura/proiezione e assunzioni per parti occluse.
- Definire camera HERO e revisione della seed; nessuna metrica assoluta inventata.

## F2 — Generazione geometrica
- Creare da una specifica JSON un autentico `.blend` editabile con COL architettura, lucernario, portali, podio, tre camere.
- Verificare che la struttura non dipenda da immagini piane o dalla geometria procedurale PR #152.
- Ottenere pianta/sezioni, clay-HERO, clay-SIDE, clay-MOBILE e `geometry-evidence.json`.

## F3 — Analisi mediante sintesi
- Renderizzare dalla camera HERO e proiettare landmark dal 3D al 2D.
- Confrontare prima ingombri, prospettiva e silhouette; aggiornare **un insieme di parametri alla volta**, conservando precedente e nuovo SHA.
- Stop alla modellazione dettagliata se il confronto geometrico è ancora insufficiente.
- La somiglianza visiva non dimostra automaticamente correttezza della forma nascosta.

## F4 — Qualità professionale
- Riutilizzare moduli/texture con provenienza e licenze verificate secondo ASSET-KIT-01.
- Materiali PBR, luci Cycles, contrasto freddo/caldo, riflessioni credibili; rendere HERO/SIDE/MOBILE.
- Confronto A/B, approvazione artistica espressa dall'ideatore legata a SHA della scena/render.

## F5 — Web
- Derivare GLB leggero e scene/mobile coerenti senza alterare il Master artistico.
- Validare formati ed estensioni, materiali, illuminazione precalcolata, rotte portali e fallback DOM.
- Misurare sul telefono Android reale; autorizzazione rilascio distinta.

## Regola anti-confusione

Non dichiarare un file `.blend` esistente perché esiste lo script, né un rendering corretto perché il programma supera `py_compile`. Un testo di progettazione è **salvato** quando il file è stato scritto e riletto; una scena è **realizzata** soltanto quando risultano materiali e prove reali. Un PASS tecnico non è un'approvazione artistica.

## Consegna immediata successiva

**ATLAS-ATRIUM-BLUEPRINT-01**: pianta, sezione e schema spaziale iniziali **da produrre**, con quote parametriche e incertezze chiaramente indicate; non è dato già acquisito dal PNG.

**Allegato tecnico storico:** nella conversazione precedente è stato prodotto il pacchetto `atlas_inverse_composer_prototipo.zip` (programma e seed preliminare), ma non è ancora depositato e riqualificato nel repository. Il kit qui descritto non dichiara l'esecuzione Blender.
