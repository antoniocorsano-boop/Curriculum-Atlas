# ATLAS-GATEWAY-ENTRY-WEB-01 — Porta iniziale scenografica a tutta schermata

**Data:** 20 novembre 2026.  
**Stato:** **IMPLEMENTATA NEL RAMO `work/atlas-gateway-01-foyer`, NON UNITA A MAIN E NON PUBBLICATA**. La qualifica di laboratorio è distinta dall'approvazione artistica o dalla distribuzione pubblica.  
**PR:** [Atlas #152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152).

## Obiettivo dichiarato dall'ideatore

La pagina di accesso dell'applicazione web Atlas deve occupare interamente lo schermo con **la scenografia interattiva dell'atrio**. Nessun riquadro aggiuntivo, menu laterale, intestazione informativa, footer, vista tecnica o schede separate. Le quattro destinazioni sono fisicamente sovrapposte al fondale, come nell'immagine master. Il marchio usa una **lettera A astratta, lineare, in oro champagne**, non un globo/occhio. Movimento molto leggero dei pannelli, già approvato nella prova HYBRID-HOVER-01. Un solo comando «Entra in Atlas», al livello della scena.

## Realizzazione concreta

| Percorso di codice | Funzione |
|---|---|
| [`src/app/page.tsx`](../../src/app/page.tsx) | La **vera radice `/` dell'app Next.js** visualizza direttamente AtlasEntry, al posto del vecchio AppShell/homepage |
| [`atlas-entry.tsx`](../../src/features/atlas-gateway/atlas-entry.tsx) | Scena e quattro link veri, logo A in SVG geometrico, CTA reale `/esplora/`, tilt mouse ±3°/±4° |
| [`atlas-entry.module.css`](../../src/features/atlas-gateway/atlas-entry.module.css) | Layout full viewport fisso, composizione 16:9 e mobile dedicata 2×2, nascondimento scritte duplicate, accessibilità |
| [`next.config.ts`](../../next.config.ts) | Indicatore di sviluppo disabilitato: nessuna icona tecnica visibile sopra la scenografia |
| [`tests/atlas-gateway-entry.spec.ts`](../../tests/atlas-gateway-entry.spec.ts) | Test reali Playwright su desktop, telefono, collegamenti, logo e movimento ridotto |
| [`atlas-gateway-entry.yml`](../../.github/workflows/atlas-gateway-entry.yml) | Automazione di qualificazione in PR, **nessun deploy pubblico** |

**Contratto delle rotte, non simulate:** Curricolo → `/curricolo/`; Esplora → `/esplora/`; Percorsi → `/percorsi/`; Esperienze → `/esperienze/`. «Entra in Atlas» → `/esplora/`. Le pagine di destinazione esistenti NON sono state sovrascritte.

**Desktop:** la fotografia a 1672×941 mantiene tutte le sue proporzioni tramite il piano di scena coprente; i quattro pannelli interattivi sono allineati alle coordinate relative dei pannelli in immagine, con inclinazione massima di ±4° e ritorno morbido. I comandi sono nella grafica, non in una barra di navigazione separata.

**Smartphone:** mantenere **quattro accessi visibili e usabili** su qualsiasi orientamento; ricomposizione 2×2 sopra il fondale, CTA leggibile, nessun pan orizzontale accidentale e nessuna barra inferiore. Questo è un adattamento mobile deliberato, non un ritaglio che nasconde i portali ai lati.

**Accessibilità:** nomi e descrizioni ARIA, navigazione a tastiera dei collegamenti, contorno di messa a fuoco, rispetto `prefers-reduced-motion: reduce`; il collegamento funziona senza WebGL, senza servizi esterni e senza autenticazioni.

## Risorse effettivamente versionate in GitHub

Sono state trasferite dal precedente pacchetto di prova già prodotto, depositate su Google Drive e **immesse come veri oggetti binari Git nel ramo della PR**, con uno stesso commit di origine `360e1976d005304b4ce2f78cdee2257ffc9e1550`.

| File versione iniziale | Byte | SHA-256 |
|---|---:|---|
| [`plate-prova.jpg`](../../public/atlas-gateway-entry/plate-prova.jpg) | 427.100 | `ab39a32400a1e5bb497a41a48ed30c4c83faa8b3f005f87a61b44cd9b401ae7e` |
| [`portal-curricolo.png`](../../public/atlas-gateway-entry/portal-curricolo.png) | 219.585 | `00e0b08e091304c96ec3960c8759f445de7d7a734a60b11b215d4a4de6a5b244` |
| [`portal-esplora.png`](../../public/atlas-gateway-entry/portal-esplora.png) | 177.550 | `53a70223a21de1852286c8cead6541ed215f63930a88a9d5b948915939d185b2` |
| [`portal-percorsi.png`](../../public/atlas-gateway-entry/portal-percorsi.png) | 165.689 | `374e5a66d8c4c25a0004343c3e0dbeac678c885fae44f9d08c0393b716b50fb2` |
| [`portal-esperienze.png`](../../public/atlas-gateway-entry/portal-esperienze.png) | 210.579 | `ce9ba5e879440513dea77b9dd4197d273f9b2c0786cd44f5ab080c049fffd345` |

**ATTENZIONE IMPORTANTE:** queste cinque risorse derivano dalla **fotografia dimostrativa generata nella conversazione** per la prova HYBRID-HOVER-01, **NON** dal PNG canonico ART-DIR-02 `atrio_futuristico_atlas_della_conoscenza.png`, SHA `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`. Il fondale è stato ricostruito mediante inpainting e NON ha la qualità architettonica definitiva. **La porta funziona tecnicamente**, ma non è approvata come immagine finale; prima della pubblicazione bisogna confrontare e sostituire le risorse con l'elaborazione canonica approvata.

## Test di browser e stato

**PR / commit dell'implementazione iniziale:** `87581bdc4aab4cd7faabf01e088f50fc4d6b8e37`, [GitHub Actions run #44810910576](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44810910576): **SUCCESS**.
- Typecheck PASS.
- Playwright Chromium: fullscreen desktop 1440×900, 4 link e CTA reali, movimento del mouse e ritorno; smartphone 390×844 con 4 link ≥44px e navigazione a Esplora; preferenza movimento ridotto (transform none). **PASS**.
- Sono stati salvati due screenshot reali, non illustrati: `desktop-entire-stage.png` e `phone-entire-stage.png`, nelle evidenze GitHub Actions del run. La versione iniziale mostrava parzialmente il testo originale duplicato e l'indicatore Next di sviluppo: entrambi sono stati corretti successivamente nel CSS/next.config, con nuova verifica avviata sul ramo.
- **Non provati dal run:** navigazione su smartphone Android fisico, fedeltà all'ART-DIR-02 originario, prestazioni su rete reale e navigabilità spaziale tridimensionale. I portali sono ritagli 2D con CSS prospettico, non quattro mesh WebGL 3D. Questi limiti sono espliciti.

## Confine di pubblicazione

La PR è una candidata di implementazione, non la pagina autorizzata agli studenti. **Non eseguire merge o deploy verso la produzione Atlas senza nuova verifica della direzione artistica e autorizzazione esplicita**. L'ingresso ibrido sostituisce la navigabilità architettonica piena prevista da ART-DIR-02 soltanto nella porta di accesso: la documentazione [HYBRID-01](./ATLAS-GATEWAY-HYBRID-01.md) conserva questa divergenza come decisione di prodotto da approvare.

## Prossime verifiche

1. Rivedere lo screenshot **finale** desktop/mobile dopo correzioni di maschera e soppressione dell'indicatore di sviluppo.
2. Consolidare la prova di pagina iniziale funzionante e recuperabile come artefatto permanente, non solo screenshot temporaneo di GitHub.
3. Sostituire il `plate-prova.jpg` con un clean plate professionale a partire dalla **sorgente canonica ART-DIR-02 verificata in byte**, mantenendo invariati rotte e comportamento.
4. Richiedere approvazione visiva e quindi realizzare la pubblicazione nel canale corretto, separatamente da questo sviluppo.
