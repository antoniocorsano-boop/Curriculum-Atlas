# AG-04 — Trasporto del master nativo nel browser

Stato: candidata separata e reversibile, senza approvazione artistica o pubblicazione.
Base: PR #111 e risorse architettoniche già verificate (prima prova 44313909801).

## Inventario reale
I quattro moduli originali pesano 16.584.056 byte e contengono
231.654 triangoli unici complessivi. Le campate sono 45, con 495 elementi
e 25 datablock di geometria condivisa. L'inventario Blender riporta
855.360 triangoli ripetuti nelle campate prima di qualsiasi ottimizzazione.
L'instancing riduce le chiamate grafiche, non automaticamente i triangoli.

## Prima prova
Il generatore esporta anche le campate effettive con le trasformazioni
native, senza sostituirle con la precedente campata AO. L'esportatore
non modifica i generatori storici né i loro vincoli di accettazione.
La prova WebGL carica quattro moduli architettonici, campate native,
panorama del cielo originale, quattro astri R2 esatti e ALS-01 R4.
La traslazione +1,2 della candidata procedurale non è applicata al master.

Si confronta il rendering delle campate originali con quello a istanze
per geometria/materiale, conservando matrici e materiali; si misurano
numero di chiamate grafiche, triangoli, differenza di pixel e
visibilità dei moduli. È una prova limitata a tre inquadrature,
di cui due corrispondenti ai riferimenti artistici (1200x750 e 640x960)
e una compatta (320x568). Non costituisce ancora il collaudo della
navigazione effettiva o di dispositivi fisici.

## Limiti
Il cielo e le texture sono reali; illuminazione WebGL, mappatura
tonale ACES e camera sono una prima approssimazione. Il master usa
AgX/Cycles, HDRI e sorgenti fisiche; non è garantita parità.
Il baking di illuminazione/occlusione e la parità della campata AO
restano da valutare sulle immagini effettive. Nessuna decimazione
geometrica in questo ciclo; non anticipare ulteriori ottimizzazioni
prima di misurare il risultato. La sala procedurale resta disponibile.

Archivio durevole delle risorse già esportate: Atlas/Archivio artistico/
Atlas-master-moduli-architettonici-verificati.zip, SHA-256
5c3bfd6d7f754c5b628df4312152bfaf4474634d8bb94a8348a61645dbb09332.
La CI utilizza ancora gli artefatti GitHub a scadenza; la conservazione
durevole non equivale alla loro disponibilità automatica per CI.
