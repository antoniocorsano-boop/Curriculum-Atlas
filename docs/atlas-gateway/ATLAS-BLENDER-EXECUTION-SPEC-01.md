# ATLAS-GATEWAY — ATLAS-BLENDER-EXECUTION-SPEC-01
## Specifica esecutiva ARCH-04 / VIS-01 — modellazione, materiali, luci, risorse, controlli
**Data:** 21 novembre 2026  
**Stato:** PREPRODUZIONE SPECIFICATA, **NESSUN NUOVO MASTER ARTISTICAMENTE APPROVATO**.
**Fonte canonica:** [ART-DIR-02 JPEG](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view); SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`; [landmark](./ART-DIR-02-CANONICAL-LANDMARKS.json), 1536 × 864 px.
**Analisi artistica:** [ARCH-VIS-REFERENCE-ANALYSIS-01](./ATLAS-ARCH-VIS-REFERENCE-ANALYSIS-01.md).
**Contratto macchina:** [ATLAS-BLENDER-EXECUTION-SPEC-01.json](./ATLAS-BLENDER-EXECUTION-SPEC-01.json). **Codice precedente:** [ARCH-03](./ATLAS-ART-DIR-02-ARCH-03.md).

## 1. Mandato e campi standard

Ogni componente ha: `id` stabile, `collection`, `role`, `geometry_type`, `material_ids[]`, `light_ids[]`, `construction`, `priority`, `status`. La denominazione è il contratto: non ricreare oggetti privi di ID o con etichette inventate. Le collezioni sono cartelle per la costruzione di geometrie, risorse e apparecchi luminosi.

- **Autorità artistica:** l'immagine approvata; gli attuali script ARCH-03 sono soltanto la base ricostruibile, non un vincolo a forme o dimensioni sbagliate.
- **Unità:** Blender scene units del laboratorio, **non metri** documentati. Origine al piano finito; X verso destra, Y verso fondo, Z verso alto.
- **Campi numerici:** HEX, rugosità, metallic, temperatura sono proposte tecniche; non valori fisici misurati dall'immagine.
- **Regola di identità:** riutilizzare logo ATLAS canonico approvato (texture originale con SHA verificata), mai ridisegnarlo con un nuovo carattere arbitrario.

## 2. Matrice completa degli oggetti Blender (20 componenti)

| ID Blender | Collezione | Geometria prevista | Materiali | Luci | Priorità |
| --- | --- | --- | --- | --- | --- |
| OBJ_ROTUNDA_SHELL | COL_10_ARCH_SHELL | mesh_sector_curved_shell | MAT_WALL_NAVY, MAT_STEEL_BLACK | L_GALLERY_AMBIENT | P0 |
| OBJ_ARCH_PILASTERS | COL_10_ARCH_SHELL | modular_pier_instances | MAT_STEEL_BLACK, MAT_BRASS_SATIN | L_GALLERY_POINTS | P0 |
| OBJ_GALLERY_DECKS | COL_20_MEZZANINE_BALCONIES | two_annular_sector_decks | MAT_FLOOR_STONE_BLUE, MAT_BRASS_SATIN | L_GALLERY_STRIPS | P0 |
| OBJ_GALLERY_GLASS | COL_20_MEZZANINE_BALCONIES | curved_glass_panels | MAT_GLASS_RAIL, MAT_STEEL_BLACK | L_GALLERY_POINTS | P1 |
| OBJ_OCULUS_OPENING | COL_25_SKYLIGHT_OCULUS | circular_oval_in_projection_cutout | MAT_OCULUS_GLASS, MAT_STEEL_BLACK | L_SKY_AREA, L_SUN | P0 |
| OBJ_OCULUS_RADIAL_STRUCTURE | COL_25_SKYLIGHT_OCULUS | radial_ribs_and_glazing | MAT_STEEL_BLACK, MAT_OCULUS_GLASS | L_SUN | P0 |
| OBJ_OCULUS_RING | COL_25_SKYLIGHT_OCULUS | annular_metal_profile_plus_strip | MAT_BRASS_SATIN, MAT_RING_EMISSIVE_GOLD | L_OCULUS_RING | P0 |
| OBJ_SKY | COL_25_SKYLIGHT_OCULUS | sky_dome_or_uv_disc | MAT_SKY_BACKDROP | L_SKY_AREA, L_SUN | P1 |
| OBJ_FLOOR_STONE | COL_10_ARCH_SHELL | joined_tiles_with_sparse_seams | MAT_FLOOR_STONE_BLUE | L_SKY_AREA, L_PORTAL_LOCAL | P0 |
| OBJ_PODIUM_ELLIPSOID | COL_40_ATLAS_CENTERPIECE | low_ellipsoidal_cap | MAT_CENTER_BLUE_GLOSS | L_PODIUM_FILL | P0 |
| OBJ_PODIUM_RINGS | COL_40_ATLAS_CENTERPIECE | nested_elliptical_profiling | MAT_BRASS_SATIN, MAT_RING_EMISSIVE_GOLD | L_PODIUM_RING | P0 |
| OBJ_ATLAS_BRAND | COL_40_ATLAS_CENTERPIECE | curved_uv_decal_on_ellipsoid | MAT_SIGN_IVORY | L_PODIUM_FILL | P0 |
| OBJ_PORTAL_FRAMES_4 | COL_30_PORTALS | rounded_3d_glazing_and_continuous_rim | MAT_PORTAL_COBALT, MAT_PORTAL_RIM, MAT_BRASS_SATIN | L_PORTAL_LOCAL | P0 |
| OBJ_PORTAL_GRAPHICS_4 | COL_35_PORTAL_VISUALS | per_portal_curves_textures_and_layered_geometry | MAT_SIGN_IVORY, MAT_PORTAL_COBALT | L_PORTAL_LOCAL | P0 |
| OBJ_GALLERY_SHELVES | COL_60_SCENOGRAPHY | curved_library_module_instances | MAT_WALL_NAVY, MAT_BRASS_SATIN | L_SHELF_POINTS | P1 |
| OBJ_BANNERS_LEFT_RIGHT | COL_50_BANNERS | cloth_mesh_with_approved_atlas_roundel | MAT_BANNER_FABRIC, MAT_SIGN_IVORY | L_GALLERY_POINTS | P1 |
| OBJ_PLANTERS_FOREGROUND | COL_60_SCENOGRAPHY | truncated_cylinder_mesh | MAT_PLANTER_METAL | L_PLANT_SPOTS | P1 |
| OBJ_PLANT_FOLIAGE | COL_60_SCENOGRAPHY | instanced_trunk_leaf_clusters | MAT_FOLIAGE | L_PLANT_SPOTS | P1 |
| OBJ_GALLERY_FEATURE_NICHES | COL_60_SCENOGRAPHY | alternating_recesses_with_backing | MAT_STEEL_BLACK, MAT_WALL_NAVY | L_GALLERY_POINTS | P1 |
| OBJ_ENTRY_BUTTON | COL_95_WEB_UI_REFERENCE | DOM_ONLY_NOT_EXPORT | MAT_RING_EMISSIVE_GOLD | — | P0 |

**Specifiche costruttive obbligatorie:** ogni oggetto è definito anche dalla frase di assemblaggio nella chiave `construction` del JSON. I profili metallici hanno geometria propria; vetro e metallo sono oggetti diversi, così come la fonte emissiva e il materiale riflettente. L'opera dovrà garantire vista laterale con reale profondità.

## 3. Catalogo materiali parametrico (15 materiali)

| Materiale | Colore proposto | Metallico | Rugosità | Mappe necessarie |
| --- | --- | --- | --- | --- |
| MAT_FLOOR_STONE_BLUE | #111E30 | 0–0.06 | 0.18–0.34 | base_color, normal, roughness, ambient_occlusion |
| MAT_WALL_NAVY | #101E32 | 0–0.13 | 0.57–0.83 | base_color, roughness |
| MAT_STEEL_BLACK | #263442 | 0.78–1 | 0.29–0.49 | normal, roughness |
| MAT_BRASS_SATIN | #B99256 | 0.92–1 | 0.24–0.42 | normal, roughness |
| MAT_GLASS_RAIL | #B3D7E6 | 0–0.08 | 0.07–0.2 | roughness |
| MAT_OCULUS_GLASS | #ADD9F4 | 0–0.1 | 0.04–0.18 | roughness |
| MAT_SKY_BACKDROP | #71B4EA | 0–0 | 0.8–1 | base_color |
| MAT_PORTAL_COBALT | #12365B | 0–0.15 | 0.14–0.34 | base_color, emissive, roughness |
| MAT_PORTAL_RIM | #FFE3AA | 0–0.1 | 0.23–0.4 | emissive |
| MAT_CENTER_BLUE_GLOSS | #091D3C | 0.15–0.45 | 0.16–0.32 | roughness, normal |
| MAT_RING_EMISSIVE_GOLD | #FFD39A | 0–0.15 | 0.25–0.5 | emissive |
| MAT_BANNER_FABRIC | #10274A | 0–0.05 | 0.66–0.93 | base_color, normal |
| MAT_PLANTER_METAL | #9D8164 | 0.82–1 | 0.29–0.47 | roughness |
| MAT_FOLIAGE | #274A31 | 0–0 | 0.6–0.92 | base_color, normal |
| MAT_SIGN_IVORY | #F6F2E8 | 0–0.1 | 0.35–0.65 | base_color, emissive |

Il valore **HEX è sRGB visivo**: non impostarlo come tripla lineare Blender senza conversione coerente. In Cycles usare Shader Principled e mappe normal/roughness/occlusion. Per ogni materiale conservare nome, parametri, origine texture, licenza, SHA e versione. L'eventuale emissione è **separata dalle proprietà metalliche**. Per il formato glTF controllare espressamente il supporto delle estensioni, trasparenze ed emissioni nel motore Atlas.

## 4. Impianto luce e fenomeni ottici (12 ruoli)

| Sistema | Tipo | Ruolo | Esportazione prevista |
| --- | --- | --- | --- |
| L_SUN | SUN | daylight cool | OFFLINE_AND_RUNTIME_REBUILD |
| L_SKY_AREA | AREA | large cool zenith fill | OFFLINE_ONLY_BAKE_FOR_WEB |
| L_OCULUS_RING | EMISSIVE_MESH | warm architectural strip | EMISSIVE_WITH_BAKED_INFLUENCE |
| L_PORTAL_LOCAL | AREA | soft local blue/gold portal fill | OFFLINE_ONLY_BAKE_OR_LIMITED_RUNTIME |
| L_PODIUM_RING | EMISSIVE_MESH | warm elliptical luminous insert | EMISSIVE_WITH_BAKED_INFLUENCE |
| L_PODIUM_FILL | AREA | soft blue center front reflection | OFFLINE_ONLY_BAKE_FOR_WEB |
| L_GALLERY_AMBIENT | AREA | subtle gallery fill | OFFLINE_ONLY_BAKE_FOR_WEB |
| L_GALLERY_STRIPS | EMISSIVE_MESH | discreet gallery warm linear accents | EMISSIVE_WITH_BAKED_INFLUENCE |
| L_GALLERY_POINTS | POINT | sparse warm niches | BAKED_OR_REDUCED_RUNTIME |
| L_SHELF_POINTS | SPOT | focused shelf warm | BAKED_ONLY |
| L_PLANT_SPOTS | SPOT | warm foliage uplight | BAKED_ONLY |
| L_RAYS_VOLUME | VOLUME_MEDIUM | cool volumetric shafts | OFFLINE_ONLY_RUNTIME_ALTERNATIVE |

L'illuminazione della fonte non è una semplice lista di dodici luci: sono **ruoli** che possono richiedere una o più sorgenti fisiche. Nel master Cycles distinguere fonte (Sun, Area, Point, Spot), materiale emissivo e mezzo volumetrico. Registrare prima/dopo ogni prova: posizione, rotazione, energia, dimensione, colore, esposizione, vista, nome del file render. Gli effetti del volume non sono esportabili come semplice materiale GLB. Il glTF non trasferisce automaticamente luce di mondo e Area light di Blender: per il web servono baking o implementazione runtime specifica.

### Prova luminosa per sottosistemi

1. **Zenitale isolato:** cielo e lucernario, geometria leggibile senza portali luminosi.
2. **Corona e anelli isolati:** evidenziare filo oro caldo, senza bruciare le superfici.
3. **Portali isolati:** distinguere vetro, luce del telaio, emissione interna e luce di contatto.
4. **Gallerie isolate:** alternare nicchie calde e fasce blu profonde, senza l'effetto “tutto illuminato”.
5. **Raggi isolati:** volume tenue, direzione coerente dall'oculo; nessun cono artificiale opaco.
6. **Composito:** controllare che l'incremento dei raggi non oscuri contenuto e testi.

## 5. Quattro portali — ricostruzione fedele della grafica

| Portale | Simbolo | Testo | Illustrazione | Tecnica proposta |
| --- | --- | --- | --- | --- |
| Curricolo | libro aperto | Curricolo / Struttura e obiettivi | quattro lastre geometriche semitrasparenti a piani sovrapposti | mesh_layers_glass_with_gold_underlight |
| Esplora | bussola/freccia circolare | Esplora / Relazioni e connessioni | rete di nodi luminosi interconnessi con archi sottili | node_instances_and_bezier_curves |
| Percorsi | percorso curvo con punti terminali | Percorsi / Itinerari formativi | gradini luminosi ascendenti in prospettiva | stepped_mesh_with_individual_emission_surfaces |
| Esperienze | porta ad archi concentrici | Esperienze / Attività e mondi | orizzonte di globo terrestre curvo blu azzurro | partial_sphere_with_uv_texture_and_atmosphere_rim |

Ogni portal master deve possedere identico profilo geometrico (angoli, vetro, cornice, supporto). Le caratteristiche narrative sono oggetti autonomi; si usano curve, piccole mesh tridimensionali, texture e sequenze UV con file originali tracciati. **Logo, titolo, sottotitolo e illustrazione sono sempre presenti nel render artistico**. Nell'applicazione, testi e destinazioni operative restano definiti dall'unico contratto HTML/Atlas e non devono comparire duplicati in scena.

### Geometria a coppie: due concetti distinti

- Le basi visibili dei centrali (Esplora, Percorsi) sono nell'immagine attorno a y 541–542 px e quelle laterali attorno a y 571–572 px; i **centrali sembrano rialzati**.
- Le sommità dei laterali sono a y 166–167 px, quelle centrali a y 193–194 px; i **laterali occupano un'altezza apparente maggiore**. Questo deriva dal fotogramma, non da una misura 3D.
- Il modello deve riprodurre queste due relazioni in proiezione HERO, senza imporre erroneamente una maggiore altezza fisica ai centrali. Copia e simmetria delle coppie devono essere verificabili.

## 6. Inquadrature ed evidenze richieste

| Camera | Formato | Scopo |
| --- | --- | --- |
| CAM_HERO | 16:9 | match 2D landmarks; skylight partially cut by upper frame, not oversized dark ceiling |
| CAM_SIDE | 16:9 | verify real thickness of portal glass, alcoves, two balcony levels and oculus |
| CAM_MOBILE_OVERVIEW | 9:16 | four portals and podio recognizable; text delegated to DOM |
| CAM_MOBILE_LEFT | 9:16 | Curricolo and Esplora fully visible |
| CAM_MOBILE_RIGHT | 9:16 | Percorsi and Esperienze fully visible |

Registrare per ogni vista: matrice camera, focale, sensore, target, clipping, rapporto d'aspetto, esposizione, stato materiali e screenshot. Il confronto HERO usa bounding box relative dei quattro pannelli, rapporto oculo/fascia scura, centro del podio, silhouette laterali; **un buon errore sui rettangoli non equivale a qualità artistica raggiunta**.

## 7. Ordine di produzione professionale

### ARCH-04 · Blocco architettonico
1. Congelare la fonte canonica e gli asset di ARCH-03 R2; conservare gli hash degli input.
2. Rivedere prima l'inquadratura HERO: oculo, corona, massa della fascia scura, curve delle gallerie.
3. Vincolare il posizionamento dei quattro root di portale a un arco con due coppie simmetriche, verificando la quota di base e la silhouette in immagine.
4. Ricostruire giunti, parapetti, solai, pannelli di copertura e profili in **mesh reali**; controllare con rendering grigio da HERO e SIDE.
5. Ricostruire la calotta ellittica, gli anelli e l'applicazione UV del marchio.

**Arresto ARCH-04:** se la silhouette di HERO non è chiaramente confrontabile, non procedere con shader e atmosfera. Niente modifiche al sito.

### VIS-01 · Aspetto materico e luminoso
6. Assegnare la libreria PBR per gruppi, con campioni singoli approvati per pietra, ottone, vetro e ceramica blu.
7. Impostare la sorgente zenitale e il color management, poi aggiungere corona, portali, podio, gallerie e spot vegetazione in quest'ordine.
8. Attivare i raggi volumetrici soltanto con la geometria corretta e con occlusione reale.
9. Modellare i quattro sistemi narrativi (lastre, rete, scale, globo) e inserire segni grafici e testi approvati per le immagini di riferimento.
10. Allestire scaffalature, drappi, fioriere e vegetazione come sotto-scene ottimizzabili; verificare scala e contrasto.

**Arresto VIS-01:** confronto visivo con l'immagine. Riservare l'approvazione a un esame umano delle viste, non a CI o punteggi automatici.

### WEB-DERIVATION · Solo dopo approvazione artistica
11. Isolare una collezione di esportazione; UV, mappe e baking dei contributi statici.
12. Verificare la compatibilità glTF in Three.js del prodotto esistente e valutare LOD, compressione texture, number of draw calls e tempi GPU reali.
13. Collaudare i quattro portali toccabili e accessibili su telefono reale; il pulsante «Entra in Atlas» resta DOM, con posizione coerente col render.

## 8. Controlli di accettazione e tracciabilità

| Gate | Verifica |
| --- | --- |
| G0_SOURCE | canonical source SHA and source landmark manifest unchanged |
| G1_SCENE | all declared object and material IDs instantiated and mesh volume present for arch elements |
| G2_IMAGE | HERO projection matched against approved landmarks, including oculus relative visual mass and four portal bboxes |
| G3_VISUAL | symbols, text, subtitles and four narrative illustrations visibly faithful; gold-blue materials, reflections, rays and gallery depth pass artistic review |
| G4_MOBILE | four reachable links and two-focus views on real phone, accessible DOM equivalent and no unwanted horizontal scroll |
| G5_WEB | runtime GLB and texture budget, frame pacing, accessibility, real handset tests; evidence recorded before release |

**Evidenze obbligatorie**: `source-manifest.json` (hash della fonte), `scene-inventory.json` (ID e collezioni), `material-library.json`, `lighting-rig.json`, file .blend, rendering `HERO/SIDE/MOBILE/LEFT/RIGHT`, `comparison-visual.jpg`, `gate-results.json` e, solo successivamente, `atlas-gateway.glb` con relazione sulle prestazioni.

**Divieti:** nessuna pagina pubblica modificata, nessuna sostituzione del master approvato, nessun risultato dichiarato fedelmente ricostruito senza comparazione e approvazione. Se un materiale o un effetto è stato solo simulato in Cycles, il manifesto web deve dichiararne il metodo di trasposizione.

## 9. Riferimenti tecnici esterni per l'implementazione

- [Blender — Light Objects (4.5 LTS)](https://docs.blender.org/manual/en/4.5/render/lights/light_object.html).
- [Blender — Esportazione glTF 2.0](https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html).
- [Khronos — PBR in glTF](https://www.khronos.org/gltf/pbr).
- [Khronos — Guida alla creazione di risorse in tempo reale](https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/RealtimeAssetCreationGuidelines.md).

**Stato di consegna:** specifica e inventario sono stati codificati e validati strutturalmente in JSON; **non attestano creazione o rendering del nuovo modello**. PR #152 mantenuta in bozza.
