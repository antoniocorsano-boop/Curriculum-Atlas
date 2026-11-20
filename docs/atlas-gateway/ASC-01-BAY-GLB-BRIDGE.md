# ASC-01 — Raccordo della luce precalcolata con la campata navigabile

20 novembre 2026. **Un solo confronto sul prodotto esistente, non una nuova biblioteca.**

## Elementi di partenza già qualificati
- PR #146, commit abfb83b9c9cf17d5c3e46c79eaa7ac9dab96e3cc: campata reale 04-0 navigabile, 11 oggetti, materiale nel noce incassato con riflessioni, rugosità e conversione AgX; workflow 44572827217 PASS. Riferimento principale per navigazione e resa materica.
- PR #149, commit 4ad58f761246a317461c08dc7c78563a25fa2eda: bake Cycles in GLB autonomo sulla vera superficie "Library bay 04-0-Bay Walnut", immagine sRGB 512×512; GLB 366208 byte, SHA-256 442791262d07bb48bb51800d89a149046067047163d117a04d4fad3395e2a856. Artefatto 14614203407, archivio SHA-256 ca2603da6ce05cecb546550651aa09babb96ad8a5c799702f0e9af242d2492e7.
- PR #150, commit 7c6ebac4171e5187cba8aa3890607238bd29e32d, run 44710650644 PASS: glTF loader Three r128, texcoord 1, derivata non illuminata e zero differenza di pixel con luce azzerata o elevata. Non ha qualificato la superficie all'interno della campata.

## Lavorazione concreta
Riutilizzare la procedura di navigazione e le prove del prodotto #146: recuperare e confrontare esclusivamente i materiali dell'oggetto Walnut 04-0, mantenendo tutti gli altri 10 oggetti e il render AgX intatti. Esporre nella stessa interfaccia un comando **Luce precalcolata**, alternando due rappresentazioni dello stesso oggetto:

1. A: geometria originale Walnut da `bay.f32`, materiale nativo approssimato della campata con le luci dirette, senza cambiare il materiale materico speciale del noce incassato.
2. B: geometria GLB della PR #149 sulla stessa posizione, rotazione inversa dalla convenzione glTF Y-up a Blender Z-up; copiare UV2 nella UV primaria **solo sulla copia** e applicare una `MeshBasicMaterial` sRGB senza doppia illuminazione.
3. A: ripristino reversibile, identico al riferimento.

Prima di rendere, verificare 864 triangoli su entrambi i modelli e differenza massima fra i limiti della geometria di 0,001 unità. Se i limiti non coincidono, dichiarare FAIL e non sovrapporre geometrie. In A e B una sola delle due geometrie Walnut è visibile. Collezionare immagini reali della campata (reference, rotated, restored, mobile, bridge-original, bridge-baked, bridge-restored), ricevute e impronte. La normale navigazione con puntatore e reset resta preservata.

## Controlli e limiti
- La prova è locale: Chromium/SwiftShader, vera Three.js r128, loader pinned, CSP ancora confinata all'origine locale e all'immagine incorporata `blob:`; nessuna risorsa esterna in esecuzione.
- Il confronto **A/B/A è controllato nella stessa scena e inquadratura**. L'eventuale differenza è una prova di sostituzione effettiva, non una perdita o un guadagno artistico misurato automaticamente.
- Il bake della PR #149 non equivale alla luce diffusa lineare della PR #145: importazione sRGB, differenze nella risposta del materiale, nella luce speculare e nella resa AgX vanno sottoposte a revisione ART-100, non nascoste con correzioni numeriche arbitrarie.
- Non modificare master Blender, inquadrature originali, curricolo, modelli pubblici, portali, scena generale, asset del ramo principale. PR in bozza; nessun merge, pubblicazione o accesso studenti.
- A seguito di confronto positivo, scegliere se impiegare la rappresentazione B su superfici molto statiche oppure preservare A su superfici con necessità di riflessioni e dettaglio materico. **Non generalizzare dalla singola superficie alla biblioteca**.
- PR #148 è la linea di consegna web completa; i suoi dati di fruibilità e trasferimento vanno preservati. Questo esperimento è un'ottimizzazione mirata e non autorizza un secondo flusso produttivo.
