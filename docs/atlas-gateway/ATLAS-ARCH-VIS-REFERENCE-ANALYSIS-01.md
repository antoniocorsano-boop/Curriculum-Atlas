# ATLAS — ART-DIR-02 · ARCH-VIS-REFERENCE-ANALYSIS-01
## Lettura architettonica, materica, luministica e scenografica dell'immagine canonica
**Data:** 21 novembre 2026 · **Stato:** analisi codificata, NON approvazione del modello tridimensionale.
**Fonte determinante:** [JPEG ART-DIR-02 1536×864](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`. La [direzione artistica ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md) prevale sull'interpretazione di materiali o forme sottodeterminati da un'unica immagine. Le [coordinate osservate](./ART-DIR-02-CANONICAL-LANDMARKS.json) sono in pixel: non definiscono quote reali.
**Derivato tecnico:** [ATLAS-BLENDER-EXECUTION-SPEC-01.json](./ATLAS-BLENDER-EXECUTION-SPEC-01.json).

## 1. Metodo di lettura, livelli di certezza
- **OSSERVATO:** direttamente distinguibile nella fonte canonica (posizione, silhouette, colore apparente, presenza del fenomeno luminoso o oggetto).
- **INTERPRETATO:** possibile ricostruzione fisica, non un fatto deducibile univocamente (vetro versus superficie blu semitrasparente, dimensioni 3D, sorgente esatta dei raggi).
- **PARAMETRO-CANDIDATO:** parametro di prova Blender (HEX, metalness, roughness, forma dell'area light, numero di raggi e campate) da ottimizzare con rendering e revisione artistica.
- **NON PROVATO:** eventuale fotometria, misure in metri, riflettanza reale, materiali industriali esatti, provenienza di una texture o modello. Vietato dichiararli certi senza prova.
Una sola immagine sintetica non permette di recuperare tutte le superfici nascoste o una metrologia ottica affidabile; i parametri non identificabili si risolvono per ricostruzione plausibile e confronto multi-camera.

## 2. Architettura generale: ciò che è realmente visibile
**OSSERVATO:** grande rotonda semicircolare in vista frontale, geometria curvilinea, gallerie su due livelli, molti pilastri verticali sottili, parapetti trasparenti e campate con profondità laterale; fondale blu-grafite quasi nero interrotto da aperture illuminate. Più in alto un oculo circolare appare ellittico per la prospettiva, tagliato dal bordo superiore dell'immagine. Balconate non perfettamente uniformi, librerie/strutture espositive laterali, vegetazione, drappi blu e fioriere.
**SPECIFICA:** shell curva con spessori, solai e balaustre in sezioni geometriche reali, profondità retrostante e oggetti in prospettiva. Distinguere COL_10_ARCH_SHELL, COL_20_MEZZANINE_BALCONIES, COL_25_SKYLIGHT_OCULUS, COL_60_SCENOGRAPHY. In assenza di file sorgente dell'immagine 3D, le parti invisibili sono progettazione, non estrazione.

## 3. Oculo, corona e copertura: distinguere diametro, proiezione e massa scura
**OSSERVATO:** settore centrale di cielo azzurro con nuvole dietro nervature scure; anello metallico e sottile filo continuo oro-caloroso; ampia ma non uniforme fascia superiore blu scura, con gradazione verso le gallerie; raggi chiari in discesa. La parte superiore dell'oculo è fuori fotogramma; dal ritaglio non si può misurare il diametro esterno completo.
**DIAGNOSI:** il problema delle candidate ARCH-02/03 non è dimostrabilmente solo il raggio fisico; è anche l'**eccessiva superficie scura continua proiettata**, il rapporto oculo/fascia/ballatoi e l'inquadratura che taglia il cielo.
**COSTRUZIONE:** OBJ_OCULUS_OPENING (foro vero), OBJ_OCULUS_RADIAL_STRUCTURE (costoloni e pannelli vetrati separati), OBJ_OCULUS_RING (metallo e incavo emissivo), OBJ_SKY (fondale fotografico o cielo procedurale separato dalla luce). Non usare il disco cielo come sorgente unica dell'illuminazione; non usare tetto annerito uniforme per simulare profondità. Testare la **larghezza e l'altezza in pixel** di cielo, anello e fascia contro la HERO, lasciando invariati i quattro portali.
**REGOLA:** prima correggere visibilità e composizione della volta, poi qualità del vetro e intensità della corona; non cambiare raggio per impressione senza render comparativo.

## 4. Portali, arcata, quote e immagini esatte
**OSSERVATO:** quattro pannelli semitrasparenti blu, angoli arrotondati, bordi luminosi chiari, zoccoli e luce di contatto. Allineamento su curva spaziale, coppie simmetriche. Rettangoli identificati nel [manifest landmark](./ART-DIR-02-CANONICAL-LANDMARKS.json):
| Portale | x0 | y0 | x1 | y1 | Simbolo visibile | Illustrazione visibile |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Curricolo | 171 | 166 | 449 | 572 | libro aperto | lastre sovrapposte |
| Esplora | 468 | 193 | 727 | 542 | bussola/freccia | nodi e connessioni |
| Percorsi | 817 | 194 | 1078 | 541 | percorso con nodi | gradini ascendenti |
| Esperienze | 1105 | 167 | 1375 | 571 | porta ad archi | orizzonte terrestre |

**ATTENZIONE ALLA QUOTA:** nel riferimento le **basi visibili dei centrali sono più in alto di circa 29–31 pixel**, mentre le **sommità laterali sono più in alto di 26–28 pixel**: i laterali risultano apparentemente più alti come silhouette, nonostante la richiesta progettuale di una quota centrale lievemente rialzata. Non confondere posizione della base, altezza del telaio e proiezione prospettica. La coppia centrale deve essere simmetrica fra sé, come la coppia laterale. La soluzione in coordinate Blender va determinata con la camera, conservando queste relazioni in immagine; non è dimostrata un'altezza reale dei manufatti.
**CONTENUTI:** i titoli sono “Curricolo”, “Esplora”, “Percorsi”, “Esperienze”. I sottotitoli sono “Struttura e obiettivi”, “Relazioni e connessioni”, “Itinerari formativi”, “Attività e mondi”. Occorrono quattro risorse narrative individuali e riconoscibili, mai pannelli indistinti con un'etichetta.
**COSTRUZIONE:** un master fisico condiviso di telaio e vetro; quattro oggetti/collezioni di grafica per simbolo (curve o mesh), testo e sottotitolo (font autorizzato/texture verificata), immagini stratificate (mesh e texture indipendenti). Preservare l'unica autorità dei testi e dei link nel contratto operativo Atlas/HTML: il render artistico può includere il lettering, ma il GLB non deve duplicare etichette DOM. No sostituzione degli oggetti con una stampa piana del fotogramma.

## 5. Pavimento e riflessi
**OSSERVATO:** pietra scura a lastre con giunti sottili, sfumature blu, specchiature estese ma non nitide; scie verticali e diagonali d'oro e blu partono dalla luce dei portali, dagli anelli del podio e dalle architetture. Nella zona anteriore il pavimento conserva dettaglio e non è uno specchio perfetto.
**COSTRUZIONE:** OBJ_FLOOR_STONE con geometria/UV di piastrelle grandi, più mappe di rugosità e normale, bevel lieve ai bordi, piano di riflessione dove necessario; luce dinamica in Cycles e approccio web differente. Non creare “riflessi” con semplici strisce dipinte che non variano a camera spostata. Portare il comportamento speculare nel derivato web con PBR e illuminazione ambientale adatta.

## 6. Podio ATLAS, metalli e fasce luminose
**OSSERVATO:** grande calotta ellittica ribassata e lucida blu-notte con riflessi morbidi, stemma centrale in alto e lettering ATLAS oro/avorio. Base composta da anelli ellittici a quote diverse, lame luminose sottili inserite in profili d'ottone. Le superfici metalliche sono luminose per **riflessione della luce**; soltanto le strisce integrate sono effettivamente emissive.
**COSTRUZIONE:** OBJ_PODIUM_ELLIPSOID con profilo parametrico, OBJ_PODIUM_RINGS con sezioni 3D distinte, OBJ_ATLAS_BRAND con texture/logo originale approvato e hash; continuità UV sulla curvatura. Separare MAT_BRASS_SATIN da MAT_RING_EMISSIVE_GOLD; la stessa mesh non deve comportarsi come metallo riflettente e fonte luminosa uniforme. Non aumentare indiscriminatamente spessore, altezza, bloom o numero di anelli.

## 7. Fotometria, luci puntuali e luce ambientale
**OSSERVATO:** cielo luminoso e atmosfera fredda; corona dell'oculo e anelli del podio caldi; spot puntiformi disomogenei nelle nicchie, luci radenti sulle piante e riflessi sui pilastri; cornici dei portali con filo luminoso bianco caldo e base blu. Luci più profonde e sparse, non una griglia di LED identici.
**PROGETTO BLENDER:** 12 ruoli, non necessariamente 12 oggetti luce: L_SUN, L_SKY_AREA, L_OCULUS_RING, L_PORTAL_LOCAL, L_PODIUM_RING, L_PODIUM_FILL, L_GALLERY_AMBIENT, L_GALLERY_STRIPS, L_GALLERY_POINTS, L_SHELF_POINTS, L_PLANT_SPOTS, L_RAYS_VOLUME. Ogni ruolo può istanziare più sorgenti, con posizione, orientamento, colore e influenza su superfici.
Le temperature colore nell'inventario sono intervalli visivi candidati, non misure spettrali. Stabilire intensità effettive solo con esposizione/camera e render Cycles; registrare potenze, diametro, ombre, dimensioni e color management al momento della produzione. Rispettare il principio: **poche luci fisiche efficaci + emissioni di dettaglio + contributi precalcolati per il web**.

## 8. Raggi e volume atmosferico
**OSSERVATO:** raggi “god rays” chiari dall'oculo che attraversano il centro e sfiorano i portali; raggi multipli con bordi morbidi, non coni opachi né grafica fissa.
**INTERPRETAZIONE:** densità volumetrica, luci direzionali e occlusione della struttura generano i fasci nel rendering di riferimento; non è possibile ricavarne il numero esatto o la sorgente ottica dal fotogramma.
**BLENDER:** piccolo volume delimitato alla rotonda con Principled Volume a densità tenue, sole orientato e light linking dove supportato, controllo noise/denoising; fare render del volume isolato e composito. La resa WebGL non eredita automaticamente un materiale volumetrico Cycles: progettare proxy controllato o baking applicabile, testando prestazioni e prospettiva laterale.

## 9. Scenografia laterale, vegetazione, drappi e arredi
**OSSERVATO:** fioriere metalliche grandi agli angoli inferiori, piante in vaso sui lati della sala e ballatoi, scaffalature verticali calde negli sfondi, pannelli vetrati, due drappi blu scuro con emblema circolare ATLAS sui pilastri. La maggior parte degli oggetti scenografici è illuminata localmente; non deve competere con i portali.
**BLENDER:** OBJ_PLANTERS_FOREGROUND con bordo metallico reale; OBJ_PLANT_FOLIAGE con tronchi e gruppi di foglie istanziati, variazione di scala; OBJ_GALLERY_SHELVES con moduli reali ma ottimizzati; OBJ_BANNERS_LEFT_RIGHT con cloth sculpted/baked + texture approvata; OBJ_GALLERY_FEATURE_NICHES alternate. Se si usano risorse esterne, registrare provenienza, licenza, possibilità di redistribuzione e checksum. Non trasformare il foyer in una biblioteca interattiva parallela.

## 10. Colori e materiali: separare osservazione e codifica iniziale
**OSSERVATO:** prevalenza blu notte, blu cobalto, nero-grafite, oro/ottone, bianco avorio, verde vegetale, bagliori azzurri e giallo caldo. Il valore cromatico esatto in RGB non può essere trasformato direttamente nel colore PBR senza considerare illuminazione, esposizione e AgX.
**CODIFICA:** la macchina inventaria 15 materiali nominati in [ATLAS-BLENDER-EXECUTION-SPEC-01.json](./ATLAS-BLENDER-EXECUTION-SPEC-01.json). I valori HEX, metallic/roughness, transmission ed emissione sono range iniziali di lavoro; raffinarli con render di campioni e verifiche HERO/SIDE/MOBILE. Non chiamarli campionamento cromatico certificato del riferimento.

## 11. Fotocamere, overlay e mobile
**HERO:** vista centrale 16:9; oculo visibile, parzialmente tagliato in alto, non enorme superficie scura; quattro portali su arco; podio in primo piano; pavimento e anello visibili. Valutare sia landmark in pixel sia peso visivo di zone chiare e scure.
**SIDE:** geometrie laterali e vera parallasse.
**MOBILE:** inquadratura 9:16 d'insieme + due inquadrature sinistra/destra con portali interamente visibili. Non promettere quattro testi leggibili in un fotogramma stretto: per i testi operativi servono overlay DOM e controlli accessibili.
Il logo in alto a sinistra e il pulsante «Entra in Atlas» fanno parte della composizione di riferimento, ma nel prodotto web sono elementi DOM semantici sovrapposti alla scena e mantenuti come **unica sorgente interattiva**, non duplicati in GLB.

## 12. Delimitazione del derivato web
Il master .blend comprende geometria, microstruttura, luci Cycles, atmosfera e asset sorgente. Il GLB conserva soltanto geometrie, UV e materiali esportabili, immagini di texture e l'eventuale emissione PBR: non trasferisce automaticamente area light, illuminazione di mondo né nebbia volumetrica. La compatibilità va verificata con l'esportatore e il motore Atlas, senza presumere identità del render. Riferimenti tecnici ufficiali: [Blender glTF exporter](https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html); [Blender luce](https://docs.blender.org/manual/en/4.5/render/lights/light_object.html); [Khronos PBR](https://www.khronos.org/gltf/pbr).

## 13. Priorità e prove di accettazione
**P0 — architettura/composizione:** oculo, coppie dei portali, podio, pavimento, anelli, marchio; eseguire immagini clay e piano luci spente, verificare silhouette e landmark contro l'immagine.
**P1 — illuminazione e materiali:** campioni metallici, pietra, vetro, cielo, riflessi del podio; verifica luci isolate, diffusione, raggi e controlli di esposizione (nessun tentativo di raggiungere la qualità per semplice aumento dei campioni).
**P2 — identità e scenografia:** tutte le grafiche dei singoli portali, librerie, piante, drappi, nicchie; valutare leggibilità e peso scenico prima dei dettagli minuti.
**P3 — consegna runtime:** baking selettivo e riduzione geometrica, tracciabilità di materiali/licenze, export GLB, test effettivi smartphone e accessibilità.
**Stop di qualità:** un test automatico PASS non equivale a un'accettazione artistica; le candidature restano isolata in PR bozza. Nessuna pubblicazione o fusione prima di un controllo artistico e delle prestazioni.

## 14. Inventario collegato e responsabilità
La fonte è il JPEG ART-DIR-02; il catalogo JSON codifica id, collezioni, primitive, materiali, luci, testi, immagini narrative, camere e criteri di accettazione. Le decisioni e revisioni successive devono essere aggiunte come manifest o sezioni versionate senza sovrascrivere fonte canonica e ARCH-03 R2. Governance: [PR #152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152), [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354).
