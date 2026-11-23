# ATLAS P3B/R2 — Quattro livelli in WebGL e integrazione privata nella vera app

**Data:** 23 novembre 2026 · **Stato:** ESPORTAZIONE E INTEGRAZIONE PRIVATA QUALIFICATE; NON ART_FINAL, NON ANDROID/LIM, NON PUBBLICAZIONE.  
**Ramo:** `work/atlas-artdir02-p2-composizioni-01` · **PR:** [#188](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/188), in bozza, non integrata.

## 1. Scena unica, provenienza e risultati reali

La nuova sorgente tridimensionale **P3B/R2** discende dal master architettonico **P3A/R2** (Blender SHA-256 `35371d226c289bd348a1137f63bfd14c74ee79389c4c1b53b522759ca0246d30`). Non utilizza la vecchia scena a tre livelli P2C né un'immagine che simula il 3D. La sorgente Blender non è stata sovrascritta.

**Verifica Blender → glTF 2.0:** [GitHub Actions #45163398316](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/45163398316), **PASS**.
- GLB autentico `atlas-p3b-atrio-4-livelli-oculo-circolare.glb` — **1.973.408 byte**, SHA-256 `04b22de9d6c8f4e98a4eb88bf2f0e87141f9bdc685b742589845f977249e7adb`.
- 44.809 triangoli, 621 nodi, 603 maglie, 32 parapetti del terzo livello, camera autentica P3A e quattro pannelli semantici.
- Oculo circolare con raggio architettonico 6,25 BU; cielo locale elaborato nel processo Blender e inserito come trama grafica nel GLB. Il cielo è **una superficie 3D testurizzata**, non una fotografia dell'intero atrio.
- I due glifi storici `ATLAS R6C • satin A on banner ±1` che risultavano sospesi nella vista sono esclusi **solo dal derivato WebGL**. Nessuna cancellazione nel Blender.

**Verifica WebGL isolata:** [GitHub Actions #45163653001](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/45163653001), **PASS**. Chromium su desktop 1280×720 e smartphone simulato 390×844 carica il vero modello; 4/4 destinazioni via pulsanti accessibili e 4/4 selezioni di vere maglie 3D via intersezione prospettica.

## 2. Collegamento alla vera applicazione Atlas

**Implementato nel medesimo ramo:** `src/app/gateway/p3b/page.tsx`, `src/features/atlas-gateway/p3b-private-gateway.tsx`, relativo foglio di stile e i programmi di prova. È una **rotta riservata**, non il nuovo ingresso pubblico.

La modalità di prova deve essere esplicitamente abilitata con `ATLAS_P3B_PRIVATE_PREVIEW=true`; quando disabilitata restituisce **404**. Il modello e le librerie vengono preparati esclusivamente in una cartella temporanea `public/atlas-p3b-preview/` del laboratorio GitHub Actions. `next.config.ts` blocca tale cartella nei normali processi pubblici/statici. Nessun file binario P3B è stato inserito nel ramo principale o pubblicato sul sito.

**Prova effettiva Next.js:** [GitHub Actions #45164858503](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/45164858503) **PASS**, con Chromium. Risultati:
- La pagina privata presenta la scena WebGL autentica, e il suo canvas ha dimensioni effettive **1280×494** (corretto il precedente riquadro di altezza insufficiente).
- Il clic sul pannello 3D **Curricolo** causa la reale navigazione all'app `/curricolo/`, non solo un evento di prova.
- I quattro collegamenti tradizionali e le destinazioni canoniche sono sempre disponibili.
- Su viewport 390×844 con `prefers-reduced-motion: reduce`, il 3D non si avvia e un collegamento porta correttamente a `/esperienze/`.
- Con modalità privata disattivata la rotta `/gateway/p3b/` restituisce 404. Nessun contenuto viene reso accessibile agli studenti.

**Destinazioni verificate:** Curricolo `/curricolo/`, Esplora `/esplora/`, Percorsi `/percorsi/`, Esperienze `/esperienze/`. Non cambiare la policy storica della precedente candidata a tre porte per adeguare P3B; le due modalità rimangono indipendenti.

## 3. Evidenze recuperabili in Google Drive privato

| Risorsa | Archivio permanente | SHA-256 del pacchetto |
|---|---|---|
| P3B/R2 GLB vero + cielo + ricevuta | [Archivio GLB P3B/R2](https://drive.google.com/file/d/1AyEhl5CgIecV7pSxiLpPbOccqKQJ543C/view), 613.577 byte | `32a0c1ea01070566fd0918c6c2040935f13f9ebe019863658602c3aadf328d8e` |
| Anteprima WebGL isolata, desktop/telefono, 4 prove di selezione | [Archivio Chromium P3B/R2](https://drive.google.com/file/d/1QxAy6JYnv1rI4EO7n8jsju6Qo-g-UKdP/view), 2.103.280 byte | `705c39946bc4f14a54026eaded9383d24848c08e6f8caee735e0de808ceb7fe5` |
| Integrazione nella vera app Next e fotografie reali | [Archivio Next privato](https://drive.google.com/file/d/1pouA0owzMm-eUM9j7LQTOoLHJqbaHuKx/view), 475.901 byte | `a28e27e80e612abba2b44a933c335a8d0bc20202478ce1678f01512ad6133cca` |
| Master Blender editabile | [P3A/R2 architettonico](https://drive.google.com/file/d/1toR1sR_KiQ1oW0VT237HQXAs3_swDfDX/view) | Conservato da precedente qualifica |

La schermata Next reale è `p3b-next-desktop-before-click.png`; quella mobile della modalità accessibile è `p3b-next-mobile-fallback.png`. Non sono immagini generate artificialmente.

## 4. Verifiche generali del ramo: rilievi non occultati

L'introduzione della rotta Next ha attivato anche verifiche storiche più ampie, alcune non superate. Le tre sorgenti controllate sono **identiche al ramo di base**: `src/app/page.tsx` (`631e540f...`), `src/components/atlas/app-shell.tsx` (`d9751ed5...`), `src/app/globals.css` (`ae09d79b...`); anche `scripts/capture-f4-visual.mjs` e `scripts/s3-v2-exit-check.mjs` risultano identici al ramo di base.

- **foundation:** ricerca nella pagina iniziale la frase storica `Il curricolo, connesso`; il componente attuale è `AtlasEntry`, già nel ramo di base. Test da aggiornare o requisito da riconciliare con la governance, non modifica richiesta a P3B.
- **exit:** attende il testo `Vista pubblica` della vecchia interfaccia; la pagina iniziale usa già una diversa rappresentazione. Verificare l'intento attuale del controllo.
- **visual (F4):** il test segnala sulla schermata mobile 360 px un bersaglio di navigazione inferiore a 44 px. Va classificato con prova visiva indipendente: potrebbe essere un difetto di accessibilità corrente oppure una procedura non aggiornata. Non dichiararlo automaticamente falso positivo.

**Decisione:** nessuna integrazione della PR finché queste verifiche non sono riconciliate. Non alterare la pagina iniziale o test storici solo per ottenere un verde apparente.

## 5. Stato approvazioni e seguito unico

- `P3A_ARCHITECTURAL_DIRECTION_SELECTED = true`
- `P3B_R2_GLTF_VERIFIED = true`
- `P3B_R2_CHROMIUM_DESKTOP_MOBILE_SIMULATED_PASS = true`
- `P3B_NEXT_PRIVATE_REAL_ROUTE_PASS = true`
- `P3B_ACCESSIBLE_REDUCED_MOTION_PASS = true`
- `P3B_PUBLIC_ROUTE_DISABLED_BY_DEFAULT_PASS = true`
- `P3B_FINAL_ART_DIRECTION_APPROVED = false`
- `P3B_ANDROID_PHYSICAL_QUALIFIED = false`
- `P3B_LIM_PHYSICAL_QUALIFIED = false`
- `P3B_MAIN_MERGE_APPROVED = false`
- `P3B_STUDENT_PUBLICATION_APPROVED = false`

**Successivo intervento circoscritto:** riesame artistico della luce e dei dettagli WebGL rispetto al Cycles P3A/R2, collaudo su un telefono Android fisico e LIM, risoluzione indipendente dei controlli storici F4/foundation/exit, quindi decisione esplicita di integrazione e pubblicazione. Vincoli invariabili: costo zero, nessun dato personale studente su cloud, nessuna distribuzione implicita.
