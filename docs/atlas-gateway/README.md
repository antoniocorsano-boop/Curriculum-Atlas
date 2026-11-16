# Atlas Gateway — Biblioteca immersiva

Baseline di conservazione — 16 novembre 2026 (AG-01).
Stato: prototipo non qualificato; non pubblicare né collegare a Home.

## Risorse preservate
- [Gateway completo](baseline/ATLAS-Biblioteca-3D.html): SHA-256 `d4d595ee70bc41ee28da87a3a27af7b5db2441ab5b34eda8166d697832420314`.
- [Scena Three.js estratta](fonti/scene-threejs.html): SHA-256 `59b063bca75a102d4b808a0cac5c31f4bf57611ff462be5059514032dfba057f`.
Entrambi i file corrispondono byte per byte alla baseline dell'archivio locale ATLAS-Gateway-baseline-2026-11-16.zip. L'archivio conserva anche cinque versioni precedenti e due riferimenti visivi; la schermata personale non è caricata nel repository pubblico.

## Decisioni vincolanti
- Atlas è l'ambiente unitario della conoscenza, non un sottoambiente di Arena.
- Tre portali: Curricolo Atlas, Esperienze Atlas (centrale, studente al centro), Studio Atlas (professionale e riservato). Accesso diretto alle esperienze senza obbligo di attraversare la sala.
- Biblioteca circolare educativa su tre livelli, cupola vetrata, materiali caldi blu/oro, piattaforma bassa senza cupoletta, marchio ATLAS.
- Scena 3D principale, rotazione indipendente di atrio e portali, scorrimento ciclico, zoom a due dita; vista semplificata alternativa.
- Biblioteca editoriale: Storie, Laboratori, Scoperte, Percorsi. I contenuti dimostrativi non sono autorizzati alla pubblicazione.
- Arena resta fonte autoritativa del curricolo; Studio produce e qualifica; Atlas rende fruibile. Nessun dato personale studente, tracking o costo aggiuntivo.
- Non sostituire il catalogo, il curricolo o le esperienze già esistenti con i dati demo.

## Limiti e piano di integrazione
AG-01: preservazione immutata, in docs, fuori dalle superfici di distribuzione. Nessuna modifica al runtime.
AG-02: ricognizione delle rotte reali, delle superfici pubbliche e dei confini professionali; mappatura dei tre portali. DESTINATIONS è attualmente null.
AG-03: separare scena, stili, gesti e routing senza alterare la baseline. Valutare dipendenze locali e licenze: Three.js r128 via cdnjs, Tailwind CDN e Google Fonts sono dipendenze esterne del prototipo. La riservatezza di Studio va garantita dal servizio reale, non da un pulsante.
AG-04: collaudo reale WebGL, desktop/mobile/LIM, tastiera, lettore di schermo, movimento ridotto, prestazioni, perdita contesto, navigazione e assenza di richieste terze non autorizzate.
AG-05: revisione indipendente, confronto visuale con riferimento, approvazione, eventuale integrazione separata. Nessuna pubblicazione agli studenti senza autorizzazione.

La resa WebGL finale della biblioteca non è ancora qualificata. La conservazione non equivale ad approvazione di una release. Non attivare deploy e non collegare demo alla Home in questa fase.
