# ATLAS P3A/R2 — Soluzione architettonica di riferimento e perimetro artistico

**Data:** 23 novembre 2026  
**Decisione di progetto:** **P3A/R2 è la geometria da cui proseguire per l'atrio Atlas**. L'originaria P2A/R4 resta archivio storico approvato e via di ripristino, non una variante di sviluppo parallela.  
**Limiti:** l'accettazione tecnica architettonica non è una dichiarazione di piena corrispondenza artistica ad ART-REF-04 né di prodotto web pronto.

## 1. Motivazione della scelta
L'ideatore ha richiesto la sostituzione della configurazione a tre quote e lucernario allungato con **piano terra più tre balconate, copertura alleggerita e più alta, un oculo circolare e un cielo migliorato**. L'immagine illustrativa ART-REF-04 ha fornito la direzione, mantenendo portali e podio originari.

Le due prove fisiche della stessa linea P3A hanno reso possibile una scelta fondata su evidenze:
- **P3A/R1:** quattro quote e foro reale superano il collaudo, ma la terza balconata era poco abitabile, senza profondità scenografica, con tetto visivamente pesante.
- **P3A/R2:** diminuzione del dislivello aggiunto, aumento della quota della copertura, finitura chiara del cielo/volta, 12 nicchie con scaffali e volumi in 3D e quattro luci di riempimento. Il podio e i quattro accessi restano visibili.

**Scelta operativa:** congelare la **geometria P3A/R2** ai fini del prossimo sviluppo, evitando ulteriori revisioni volumetriche prive di criticità dimostrate. L'accettazione visiva finale e l'integrazione WebGL richiederanno verifiche separate.

## 2. Misure da sorgente Blender realmente renderizzata

| Indicatore | Esito verificato |
|---|---|
| Livelli | Piano terra e tre balconate (quattro quote) |
| Nuovo solaio terzo livello | Quote reali z 9,1913–9,2356 BU, soletta reale |
| Spazio libero sotto copertura | 2,3144 BU sul bordo esterno |
| Parapetti e sostegni aggiuntivi | 32 campate vetrate, 15 pilastri |
| Terza galleria | 12 nicchie con scaffali e libri modellati; 4 luci localizzate |
| Lucernario | **Cerchio fisico r = 6,25 BU**, 160 segmenti, variazione del raggio < 0,001 BU |
| Guscio di copertura | Una maglia anulare chiusa, 0 spigoli non-manifold, spessore 0,12 BU |
| Apertura teorica | 122,72 BU² contro 89,10 BU² precedenti, +37,72% |
| Portali e podio | Quattro pannelli originali conservati, podio non eliminato |
| Rendering | Blender Cycles 1280×720, 72 campioni e riduzione del rumore |
| Reversibilità | Originale P2B/R2 verificato e non sovrascritto |

Le dimensioni in BU sono relative al modello Blender e non sono quote edilizie.

## 3. Evidenze permanenti verificate
- [ART-REF-04 — direzione illustrativa, NON costruzione Blender](https://drive.google.com/file/d/17oGV8CVbIvLJkA3ZJowh_MH5joRDo99J/view), PNG SHA-256 `f29897cfac07f0eccba18d51c1751ef0de3339451f1f3657a73e5e8ef4a98fe6`.
- [P3A/R1 storico — modello e rendering Cycles](https://drive.google.com/file/d/1_HYSd4ICin47SWeKdVI5_7rhRqDj2eUE/view).
- [P3A/R2 — MASTER BLENDER MODIFICABILE, immagine Cycles e ricevuta](https://drive.google.com/file/d/1toR1sR_KiQ1oW0VT237HQXAs3_swDfDX/view), ZIP 15.730.684 byte, SHA-256 `2965f0a1e8ce31398afebf3d03be85da9b18635c63981ef67b40b941c16330d5`.
- [P3A/R2 — immagine originale Blender Cycles](https://drive.google.com/file/d/1SDjf24AWkhfFfwrXH2RhO-VRdlsSl-hZ/view), PNG SHA-256 `f29902c2327f0cd690fd3d3c44146393e4c55ff731140ff991673a0d91f52ee4`.
- [Confronto illustrativo/R1/R2](https://drive.google.com/file/d/1jLfwK6pJ2r_YkdilRn0nyIHNya42CNnl/view).
- [GitHub Action — esecuzione Blender qualificata P3A/R2](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/45158391228), SUCCESS.
- [Script ricostruttivo P3A](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/work/atlas-artdir02-p2-composizioni-01/scripts/atlas-gateway-production/p3a_four_gallery_circular_oculus_01.py) e [parametri](./ATLAS-P3A-QUATTRO-LIVELLI-OCULO-CIRCOLARE-01.json).
- **Sorgente Blender P3A/R2** SHA-256 `35371d226c289bd348a1137f63bfd14c74ee79389c4c1b53b522759ca0246d30`.

## 4. Decisione artistica, senza promozioni fittizie
P3A/R2 **migliora** la leggibilità del livello aggiuntivo, l'altezza della sala e la resa del lucernario rispetto a P3A/R1. Nondimeno il materiale non raggiunge la ricchezza visiva ART-REF-04: restano semplificazioni nella profondità delle nicchie, luci e riflessi meno naturali e una luminosità del cielo non ancora identica al riferimento.

La **soluzione architettonica** viene quindi scelta; la **qualità artistica finale** non è automaticamente approvata. Le rifiniture successive potranno modificare materiali, inquadratura, illuminazione e dettagli senza riaprire le quote principali e la forma del foro.

## 5. Unico percorso di completamento del prodotto
1. **Blender P3A/R2:** assumere questo master come sorgente unica delle prossime finiture. Gli originali P2A e P2B restano immutati.
2. **Derivazione WebGL:** esportare un GLB 2.0 dal file P3A/R2, non riutilizzare il vecchio P2C/R3 da architettura a tre livelli. Verificare materiale cielo, vetro, copertura e font.
3. **Quattro azioni effettive:** Curricolo `/curricolo/`, Esplora `/esplora/`, Percorsi `/percorsi/`, Esperienze `/esperienze/`. Verificare su mesh 3D e ripiego accessibile, non aprire contenuti non autorizzati.
4. **Qualificazione dispositivo:** prova su smartphone Android fisico e LIM, compresi prestazioni, leggibilità, accessibilità, rete debole e animazione ridotta.
5. **Autorizzazioni:** solo dopo prove funzionali e decisione esplicita procedere con eventuale integrazione e distribuzione; per l'uso con studenti occorrono le autorizzazioni istituzionali pertinenti.

## 6. Stati di governo
- `P3A_ARCH_DIRECTION_SELECTED = true` (scelta tecnica di progettazione);
- `P3A_R2_REAL_BLENDER_GEOMETRY_PASS = true`;
- `P3A_R2_CYCLES_RENDER_PASS = true`;
- `P3A_ART_FINAL_APPROVED = false`;
- `P3A_WEBGL_QUALIFIED = false`;
- `ANDROID_LIM_QUALIFIED = false`;
- `STUDENT_PUBLICATION_APPROVED = false`;
- `MAIN_MERGE_APPROVED = false`.

Il progetto resta **a costo zero, senza nuovi servizi, senza dati personali scolastici e senza pubblicazione**. La PR #188 rimane in bozza.

## Aggiornamento P3B/R2 — qualificazione WebGL e accessi privati (23 novembre 2026)

La geometria P3A/R2 selezionata è stata effettivamente trasferita in un nuovo GLB WebGL **P3B/R2** (SHA-256 `04b22de9d6c8f4e98a4eb88bf2f0e87141f9bdc685b742589845f977249e7adb`, 1.973.408 byte, 44.809 triangoli), conservando tre gallerie, oculo circolare e quattro portali.

La [qualificazione tecnica dell'export P3B](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/45163398316), la [prova Chromium della scena](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/45163653001) e la [qualificazione dell'accesso nella vera applicazione Next](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/45164858503) sono **superate**. Un clic sul pannello 3D Curricolo apre la pagina `/curricolo/` della vera app in modalità privata; il ripiego mobile con riduzione del movimento consente l'apertura di `/esperienze/`, senza grafica 3D. La pagina sperimentale `/gateway/p3b/` resta disabilitata per impostazione predefinita (404), con assets presenti soltanto nei processi di prova.

Le prove e gli archivi sono documentati in [ATLAS-P3B-WEBGL-NEXT-PRIVATE-QUALIFICATION-01.md](./ATLAS-P3B-WEBGL-NEXT-PRIVATE-QUALIFICATION-01.md). Rimangono **non superati e da riconciliare** alcuni controlli generali preesistenti (foundation, exit, visual F4) che operano su file invariati rispetto al ramo di base. Non considerare la PR integrabile finché non sono risolti.

Stati aggiornati: `P3B_GLTF_TECH_PASS=true`, `P3B_NEXT_PRIVATE_PASS=true`, `P3B_PUBLICATION_APPROVED=false`, `P3B_ART_FINAL_APPROVED=false`, `P3B_ANDROID_LIM_REAL_PASS=false`, `MAIN_MERGE_APPROVED=false`. La vecchia voce `P3A_WEBGL_QUALIFIED=false` sopra descriveva la situazione precedente e **non invalida** questa nuova qualifica tecnica P3B: non è tuttavia ancora una qualificazione dell'esperienza pubblica su dispositivi reali.
