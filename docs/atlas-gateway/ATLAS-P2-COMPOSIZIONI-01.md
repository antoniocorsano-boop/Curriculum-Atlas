# ATLAS P2/COMPOSIZIONI-01 — Confronto reale su P1F (22 novembre 2026)

## Decisione di direzione artistica

Non ricostruire geometricamente pixel per pixel il riferimento **ART-DIR-02** (SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`). È una sorgente artistica, non un rilievo architettonico metrico.

La nuova direzione adotta una **scenografia 3D a camera privilegiata**: la qualità visiva viene valutata prima della lavorazione di giunti, finiture e prestazioni WebGL. I tre livelli sono piano terra, prima galleria e seconda galleria; non scambiare i livelli con le superfici del lucernario.

## Genealogia non distruttiva

1. Lavorazioni precedenti P1B/P1C/P1D, prova architettonica P1F nella [PR #186](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/186).
2. Sorgente effettiva: **P1F/ROOF-02**, file `atlas-p1f-pavilion-roof02-editable.blend` recuperato dall'esecuzione Blender [#45062409931](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/45062409931).
3. Ricevuta P1F/ROOF-02 verificata prima di ogni trasformazione, compreso SHA-256 della sorgente, chiusura del guscio e integrità del riferimento.
4. Ogni alternativa riapre il medesimo file originale; i risultati derivati non diventano nuovi master prima della scelta artistica.

## Tre varianti volumetriche REALI

| Parametro | A Monumentale | B Equilibrata | C Scenografica |
|---|---:|---:|---:|
| Sollevamento galleria alta (BU) | +0,80 | +0,48 | +0,60 |
| Sollevamento copertura (BU) | +1,55 | +0,90 | +1,15 |
| Allungamento longitudinale progressivo della volta | 1,00 | 1,00 | 1,18 |
| Ribassamento camera (BU) | 0,35 | 0,22 | 0,48 |
| Rotazione ottica aggiuntiva (°) | 2 | 1 | 3 |
| Coefficiente lunghezza focale | 0,85 | 0,92 | 0,83 |
| Raggio arco anteriore (BU), revisione visiva 02 | 5,70 | 5,80 | 5,90 |
| Fattore scala visiva portali XY / Z | 0,50 / 0,63 | 0,50 / 0,63 | 0,50 / 0,63 |

Valori iniziali di progetto, non quote misurate sull'immagine artistica. L'eventuale ampliamento del campo è ulteriormente regolato per mantenere visibili **tutti e quattro** i centri dei pannelli.

### Correzione imprescindibile dei portali

- I quattro pannelli **Curricolo, Esplora, Percorsi, Esperienze** rimangono oggetti Blender nativi, con materiali, figli e identità.
- Sono riposizionati sulla **semicirconferenza anteriore**, dalla parte della camera, non sul bordo posteriore dell'atrio.
- Angoli di distribuzione: `−44°, −16°, +16°, +44°`, ordinati da sinistra a destra e adattati all'asse ottico corrente. Le lastre sono tangenti alla curva.
- Le basi metalliche indipendenti sono trasferite con la stessa trasformazione; non sono aggiunti portali né decorazioni.
- **Revisione visiva 02**: i primi rendering avevano portali enormi che occultavano l'architettura. L'intervento successivo li ridimensiona come oggetti fisici e li sposta più lontano dalla camera, conservando la quota del bordo inferiore del vetro. Il nuovo controllo misura anche il rapporto tra l'ingombro dei pannelli e quello dell'immagine: non considerare valido un render solo perché quattro centri sono inquadrati.
- **Limite residuo esplicito**: i vecchi tagli booleani del pavimento non vengono ricostruiti in questa fase compositiva. Dopo la scelta definitiva occorre chiudere i vecchi tagli e produrre le feritoie fisiche nelle nuove posizioni. Non dichiarare questo dettaglio concluso.

## Prodotti di esecuzione

Il flusso `.github/workflows/atlas-p2-three-compositions.yml` produce, in spazio isolato:

- Tre PNG originali **Cycles** 960 × 540 (A/B/C), non immagini sintetizzate fuori Blender.
- Tre file `.blend` realmente editabili, derivati dalla medesima sorgente.
- Ricevuta `atlas-p2-three-compositions-receipt.json` con posizioni dei portali, parametri, nomi dei file e SHA-256.
- `atlas-p2-confronto.html` per confrontare A/B/C nell'archivio scaricato.
- Resoconto di qualificazione automatica. Nessun GLB web completo o dato di prestazioni mobile è promesso in questa fase.

## Collaudo e criteri della prossima decisione

1. Verificare che tre gallerie/quote (piano terra, prima galleria, seconda galleria) siano percettivamente distinte.
2. Confrontare proporzioni della copertura e resa dell'altezza rispetto all'immagine ART-DIR-02.
3. Verificare che i quattro portali siano **davanti**, non in fondo all'atrio, con curve e spaziatura leggibili.
4. Escludere clipping dei portali, intersezioni di copertura, sovrapposizioni visive e pavimento inadeguato.
5. **Solo dopo la selezione**: correzione feritoie e basamenti, miglioramento illuminazione, materiali, esportazione e collaudo smartphone.

## Stato di governo

- **Ramo in bozza, non integrato**. Nessun merge, pubblicazione agli studenti o spesa.
- ART-DIR-02 immutata, fonte SHA verificata, genealogia preservata.
- Esito del CI = verifica tecnica, **non approvazione artistica**.
- Gli artefatti delle Actions hanno conservazione limitata: il trasferimento verificato in Google Drive è una fase ulteriore da completare.
- Origine della decisione: conversazione Atlas World Composer del 22/11/2026, richiesta di realizzare tre composizioni e sostituire l'iterazione geometrica sull'oculo con un metodo scenografico. URL della chat non fornito.
