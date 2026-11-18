# AG-04 — Integrazione candidata R2 + ALS-01 R4

Base: PR #109, ffd9c7b05166d9d433f82d9f2385cc24ddd9a012.
Nessuna approvazione artistica, pubblicazione, autorizzazione studenti o merge.

## Decisione
Il Gateway locale corrente è la sala procedurale Three.js r128, non il master
architettonico Blender. Questa candidata integra nella sala navigabile reale
il GLB R2 esatto (424708 byte, SHA-256
684849b72dfc3314c6383e3a0864fa244145811f3d27fb9bdc76d7fbfd7f92e0)
e il sistema condiviso ALS-01 R4. Non sostituisce l'architettura con il master
Blender e non rivendica parità artistica con i rendering.

## Contratto
- Build locale esplicitamente attivato da ATLAS_GATEWAY_R2_GLB e sottoposto
  ai controlli SHA-256; senza opzione resta la precedente sala.
- GLTFLoader r128 verificato, GLB incorporato e analizzato in memoria, nessun
  caricamento da origini esterne. Il sandbox e il CSP rimangono invariati.
- Tre mesh R2, 9956 vertici, 18 puntini, una chiamata grafica ALS aggiuntiva.
- Traslazione comune di +1,2 sull'asse verticale per la sala procedurale:
  geometria e posizioni relative delle luci restano invariate.
- Sfondo dichiarato chiaro, ottica R4 adattiva; inizialmente statico.
  Comando esplicito Anima luci/Ferma luci; arresto su pagina nascosta e
  preferenza per movimento ridotto. Riutilizzo del ciclo di rendering.
- Gli astri non sono destinazioni né bersagli interattivi. Tre portali,
  contratti di navigazione, accessi diretti e ripiego semplificato invariati.
- La disponibilità del file sorgente R2 per la CI dipende per ora dall'archivio
  14416938462 (scadenza 25 novembre 2026). Prima del consolidamento definitivo
  occorre conservare il GLB verificato in un archivio durevole autorizzato
  e/o qualificare la riproduzione byte-identica senza artefatti a scadenza.

## Qualificazione
La procedura Local WebGL esistente, sul ramo dedicato, prepara il pacchetto
integrato e avvia l'applicazione Next locale. Verifica sei formati, presenza
effettiva dei puntini, topologia, inquadratura, comando luce, rotazione,
accessi semantici, fallback, rete e regressioni.
La verifica indipendente artistica dei risultati e l'integrazione del master
architettonico Blender sono distinte. Il controllo non autorizza il rilascio.
