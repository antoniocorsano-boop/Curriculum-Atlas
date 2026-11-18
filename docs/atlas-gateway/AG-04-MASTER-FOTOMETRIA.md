# AG-04 — Master nativo: riferimento artistico e fotometria WebGL

Decisione di direzione (18 novembre 2026): il master Blender nativo è il riferimento artistico della biblioteca Atlas. La sala procedurale resta una variante tecnica reversibile; non deve sostituire o alterare il master. L'approvazione della direzione non è autorizzazione al rilascio.

## Contratto di conservazione
- Fonte: PR #111, commit 9d935f00290264083d00fe60b9baf649d3f1199b, prova nativa 44315745076, artefatto architettonico 14431658842.
- Cinque moduli architettonici byte-identici, cupola e cielo originali inclusi, 45 campate, portali e camere native. Nessuna traslazione procedurale.
- R2 SHA-256 684849b72dfc3314c6383e3a0864fa244145811f3d27fb9bdc76d7fbfd7f92e0, ALS-01 R4 invariati. Nessuna modifica alle destinazioni.
- Riferimenti Cycles: artefatto 14431145676, candidate-atrium.png e candidate-vertical.png. La prova usa entrambe le immagini con verifica SHA.
- Ambiente HDR già acquisito nel progetto: kloppenheim_03.hdr, CC0 (Poly Haven), SHA-256 cf7220b7d6705577e772c28a75cfd67ef508b342904e24d20f227a38fe853130. Non è un nuovo asset. Separare cielo visibile e ambiente di riflessione.

## Confronto reale
Il primo rendering WebGL è troppo chiaro e uniforme rispetto al master: nicchie, pavimento, portali e medaglione perdono contrasto. Conservare architettura e materiali sorgente; confrontare controllo e due sole ipotesi:
- P1: HDRI originale, direzione solare originale (43° elevazione, -55° azimut Blender), intensità ambiente .27; esposizione .82, luce diffusa e direzionale ridimensionate.
- P2: stessa sorgente e direzione, esposizione .75 e ombre direzionali statiche PCF. La shadow map non si rigenera ad ogni fotogramma; misurare costo iniziale e a regime.
Sono tarature WebGL, non equivalenze fisiche con potenze Cycles, AgX o luce indiretta. Non modificare texture, colori di base, geometrie o pulsazione ALS. Il test conserva nove immagini (tre formati per tre configurazioni) e misure RGB per le due viste Blender; le differenze di pixel orientano il riesame senza automatizzare l'approvazione artistica.

## Prestazioni da non confondere con qualità
La PR #111 ha ridotto le chiamate da 251/181/171 a 60 nei tre formati; i triangoli disegnati sono però saliti da 601658/484154/476810 a 1101794, perché il batching globale delle campate rende inutilizzabile il culling individuale. Non dichiarare il master ottimizzato per telefono. Dopo il confronto fotometrico, priorità alla suddivisione in gruppi spaziali e culling (conservando geometria e immagini). L'occlusione indiretta e la parità delle microstrutture rimangono aperte.

Nessun nuovo servizio, nessun deploy. Il collaudo è isolato e non autorizza studenti o pubblicazione. Le fonti sono archiviate, ma la CI dipende ancora da artefatti temporanei; prima della consegna definitiva serve il recupero automatico durevole.
