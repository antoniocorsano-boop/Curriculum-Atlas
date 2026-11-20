# ATLAS-GATEWAY-MOBILE-02 — Accesso smartphone con scenografia verticale integrata

**Data:** 20 novembre 2026  
**Stato:** **IMPLEMENTATO E TESTATO NEL RAMO** `work/atlas-gateway-01-foyer` (PR #152); **non approvato artisticamente, non integrato in main, non pubblicato**.  
**Rapporto con la versione desktop:** il panorama approvato per la prova desktop non viene modificato. Il comportamento mobile cambia in funzione dell'orientamento.

## Decisione di composizione e ragione

L'ideatore propone di abbandonare i quattro pannelli disposti in una griglia 2×2 sopra lo sfondo sfocato del telefono. Le alternative studiate:

1. **Panorama desktop contenuto, con bande scure.** Su 390×844, il fotogramma 1672×941 occuperebbe soltanto circa 390×220 pixel e lascerebbe circa 312 pixel vuoti sopra e sotto. I quattro pannelli risulterebbero troppo minuti come destinazioni primarie.
2. **Scenografia verticale 9:16 autonoma, con quattro portali omologhi più piccoli.** Conserva un'unica rotonda, lucernario, balconate, quattro lastre allineate, pedana, pavimento e profondità. È la soluzione preferita e **implementata in verticale**.
3. **Telefono ruotato orizzontalmente:** usare senza ritaglio il panorama desktop 1672×941, centrato con estensioni laterali scure quando lo schermo è più largo del rapporto fotografico. Il pulsante rimane un vero link sovrapposto al pulsante già visibile nella fotografia, evitando doppioni.

## Risorse e provenienza esatte

- **Risorsa mobile autonoma:** [`public/atlas-gateway-entry/mobile-atrium-01.png`](../../public/atlas-gateway-entry/mobile-atrium-01.png), **948 × 1659 px**, **2.204.582 byte**, SHA-256 `a742aed54e69a9a857540d7b1f39e0486dd5d07597e3e4cf57723fb6f92f347f`. Creato il 20 novembre 2026 come nuovo *candidato scenografico verticale*, non come derivazione geometrica o immagine originale ART-DIR-02. È stato salvato come **blob binario reale** nel repository e in [Google Drive Curriculum Atlas](https://drive.google.com/file/d/1_0DDwW3gBLx7JYI1JjsmcLoxkgqJTlk7/view).
- **Variante compressa conservata localmente e in Biblioteca personale:** `ATLAS-GATEWAY-MOBILE-ART-01.webp`, **212.262 byte**, SHA-256 `c5c37d3e916804f5fe540bfaa3922fd0b424076f9492a617ec7eee4e569f00fb`. **Non ancora integrata nella directory pubblica GitHub**; l'immagine di prodotto attuale è il PNG sopra. Il risparmio potenziale di peso non è ancora acquisito nel sito.
- **Desktop:** [`plate-prova.jpg`](../../public/atlas-gateway-entry/plate-prova.jpg) e quattro pannelli esistenti; non sostituisce il PNG canonico ART-DIR-02 ancora da verificare in byte.
- **Originale canonico non sostituito:** `atrio_futuristico_atlas_della_conoscenza.png`, 1672×941, SHA-256 `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`. La nuova composizione mobile non è dichiarata fedele a tutte le quote, ai materiali e ai dettagli della fotografia originaria.

## Implementazione effettiva

- [`atlas-entry.tsx`](../../src/features/atlas-gateway/atlas-entry.tsx): aggiunta una nuova **composizione mobile** con immagine autonoma e quattro aree di accesso HTML, dotate di titoli visibili e `aria-label` significativi.
- [`atlas-entry.module.css`](../../src/features/atlas-gateway/atlas-entry.module.css): in **orientamento verticale** entro 900 px si mostra una scena unica 948:1659 centrata, con estensione scenografica sfumata anziché bande nere; hotspot calibrati sulle quattro lastre in una singola fila. Desktop invariato; in **orientamento orizzontale** su dispositivo touch basso si conserva l'intero panorama senza ritaglio.
- Le destinazioni reali restano: `/curricolo/`, `/esplora/`, `/percorsi/`, `/esperienze/`. Pulsante «Entra in Atlas» → `/esplora/`, tramite link HTML. **Nessuna rotta fittizia e nessuna interfaccia estranea alla scena.**
- `prefers-reduced-motion` continua a disattivare gli effetti; i portali sono navigabili con tastiera e funzionano senza WebGL. In verticale il tap non fa ruotare l'intera scenografia; è un'area cliccabile sovrapposta a una lastra già illustrata.
- Le coordinate dei quattro hotspot sono CSS in percentuale **dentro la medesima immagine verticale**, quindi il contenimento mantiene l'allineamento a qualsiasi larghezza senza ritagli laterali. Non è una seconda griglia 2×2.

## Verifiche e risultati

[GitHub Actions #44813437248](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44813437248): **SUCCESS**. Su Chromium/Playwright sono stati verificati:
- desktop 1440×900, nessuna AppShell, quattro collegamenti, CTA, tilt e ritorno;
- **telefono verticale 390×844**: la vera immagine verticale 948×1659 caricata, quattro aree cliccabili nella stessa fila, dimensioni minime ≥44px, nessuno scorrimento orizzontale, navigazione Curricolo;
- **telefono ruotato 844×390**: panorama desktop visibile, quattro collegamenti e CTA dentro lo schermo;
- modalità con movimento ridotto.

[GitHub Actions #44813916869](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44813916869): **SUCCESS** dopo il primo riallineamento orizzontale; confronto visivo con screenshot reali. Un residuo di pulsante doppio in modalità orizzontale è stato successivamente corretto sovrapponendo **un link semanticamente cliccabile ma graficamente trasparente** al pulsante già impresso nel panorama; questo successivo commit richiede il relativo esito CI prima di essere dichiarato qualificato.

**Evidenze da conservare:** screenshot `phone-portrait-integrated-atrium.png`, `phone-landscape-panorama.png`, `desktop-entire-stage.png` provenienti da run GitHub, con modello di prova desktop e mobile. Non confondere screenshot del navigatore con il PNG artistico sorgente.

## Limitazioni di prodotto

- L'immagine verticale costituisce un **nuovo candidato artistico** e richiede il giudizio dell'ideatore su qualità, collocazione, leggibilità e continuità con ART-DIR-02.
- La scena verticale è una composizione **2,5D**, con quattro hotspot DOM su pannelli già presenti nella fotografia; non è navigazione architettonica 3D. Le micro-rotazioni 3D/CSS restano nella composizione panoramica desktop, non sono applicate a un'immagine mobile unica.
- La risorsa mobile attuale pesa circa 2,2 MB; la variante WebP da 212 KB è pronta ma **non è ancora distribuita nel prodotto**. Dimensioni e tempi di caricamento devono essere misurati su telefono Android fisico.
- Nessuna pubblicazione istituzionale, migrazione del Master Blender o autorizzazione alla fruizione degli studenti viene effettuata con questa sola revisione.

## Prossima azione di prodotto

Verificare il **render finale nel navigatore** dei due orientamenti dopo la correzione dell'ultimo doppione CTA, raccogliere feedback artistico dell'ideatore e, se approvato, sostituire il PNG mobile con WebP verificato in repository per trasferimento ottimizzato e pianificare la pubblicazione della porta di accesso su un canale autorizzato.
