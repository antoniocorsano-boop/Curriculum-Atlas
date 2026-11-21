# ATLAS — MASTER-BLENDER-01
## Specifica tecnica e artistica del modello Blender professionale dell'Atrio della Conoscenza

**Fonte artistica canonica aggiornata, 21/11/2026:** [ART-REFERENCE-CANONICAL-2026-11-21.json](./ART-REFERENCE-CANONICAL-2026-11-21.json). Il JPEG 1536×864, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`, è stato esplicitamente adottato come originale di lavoro e [archiviato in Drive](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view?usp=drivesdk). **Il precedente requisito di recupero del PNG 1672×941 riportato nella sezione 2 è superato.** Il master Blender di laboratorio esiste ma **non è ancora qualificato artisticamente**. La pre-calibrazione sulla fonte attiva è [qui](./ATLAS-CAMERA-FIT-CANONICAL-02.json): non applicarla al master senza verifiche HERO/SIDE/MOBILE e dell'architettura completa.


**Stato:** specifica di produzione salvata e versionata, **non** modello Blender già realizzato.  
**Data:** 20 novembre 2026.  
**Direzione artistica vincolante:** [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md).  
**Sorgente geometrica obbligatoria:** [IMAGE-GEOMETRY-01](./IMAGE-GEOMETRY-01.md) — progettazione inversa dall'immagine prima di imporre la forma di qualsiasi prototipo o libreria. La vecchia geometria della PR #152 non è una base dimensionale o compositiva vincolante.  
**Piano esecutivo:** [ART-PROD-01](./ATLAS-GATEWAY-PRODUCTION-WORKFLOW-01.md).  
**Decisione produttiva per risorse esterne:** [ASSET-KIT-01](./ASSET-KIT-01.md) — riuso qualificato e verificabile, vincolante per la selezione degli asset; nessuna risorsa esterna considerata approvata senza distinta e prova.  
**Orchestrazione e verifiche:** [FLOW-02](./ATLAS-GATEWAY-CLOSED-LOOP-02.md).  
**Infrastruttura tecnica candidata:** PR Atlas #152, in bozza; non pubblicata.

## 1. Mandato

Costruire **un autentico ambiente tridimensionale** da cui ottenere:
1. un fotogramma Cycles di qualità architettonica **visivamente fedele** all'immagine Atlas scelta dall'ideatore;
2. una vista laterale che dimostri volumi, spessori, profondità e parallasse reali;
3. una vista mobile progettata, non il ritaglio della vista desktop;
4. un **derivato GLB di alta qualità e leggero**, integrabile nella base Three.js già esistente in Atlas;
5. accesso funzionante ai portali **Curricolo, Esplora, Percorsi, Esperienze**, mantenendo un'unica fonte dati per testi e collegamenti.

Non accettare il master geometrico procedurale sviluppato per il prototipo della PR #152 come prodotto artistico, né sostituire l'architettura con una stampa dell'immagine su piani statici.

**Principio:** il Master Blender è la **sorgente artistica professionale**, non l'oggetto finale da caricare senza ottimizzazioni nello smartphone.

## 2. Identità esatta del riferimento visivo e controllo D0

L'immagine **inviata nuovamente dall'ideatore nella conversazione del 20/11/2026** presenta:
- rotonda su **due livelli** e grande lucernario ovale per prospettiva, con cielo e raggi dall'alto;
- quattro grandi portali traslucidi con immagini, cornici e testi in italiano;
- basamento ellittico blu scuro con emblema e marchio **ATLAS**;
- pavimento di pietra scura levigata, riflessi blu/oro, vegetazione laterale e stendardi;
- bottone centrale «Entra in Atlas».

**Confronto verificato il 20 novembre 2026:** l'ultimo allegato ha contenuto **JPEG**, 1536×864 pixel e SHA-256 `cce6bb9d670376e1b75558136b220a71095d15b64843bf1ba89cc9432d3d2cb8`; la fonte PNG originale è 1672×941 e SHA-256 `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`. **Sono file diversi ma rappresentano sostanzialmente lo stesso fotogramma**, come dimostra il confronto ridimensionato (differenza media per canale 1,317 su 255). **Scelta operativa:** il PNG originale, di qualità e risoluzione superiori, rimane il riferimento canonico ART-DIR-02; il JPEG reinviato conferma il soggetto da ricostruire. Non alterare SHA o formato per simulare una corrispondenza binaria. Dettagli nel [registro delle immagini](./ART-REFERENCE-MANIFEST.md).

**Stato di conservazione:** il presente documento conserva l'identità verificata; il **file immagine originale deve ancora essere depositato in un archivio durevole** del progetto. Il percorso locale della chat non è una risorsa GitHub. Il master artistico resta BLOCCATO per l'avvio automatico finché l'originale canonico non è disponibile.

## 3. Architettura della produzione: Master ↔ derivato web

```text
reference/atlas-hero-canonico.(png|jpg) [SHA tracciato]
assets/architecture.blend             [componenti architettonici]
assets/portals.blend                  [telai, vetri, basi e pannelli]
assets/props.blend                    [stendardi, vegetazione, fioriere]
assets/materials.blend                [biblioteca PBR / mappe]
source/atlas-foyer-assembly.blend      [collegamenti e composizione]
source/atlas-foyer-master.blend        [camere, materiali, illuminazione, master approvato]
renders/cycles-hero.png               [riferimento di qualità]
renders/cycles-side.png               [audit geometrico]
renders/cycles-mobile.png             [audit d'uso]
runtime/atlas-foyer-web.glb           [derivato ottimizzato]
runtime/atlas-foyer-manifest.json     [hash, licenze, provenienza e misure]
evidence/visual-comparison/           [confronti e decisione artistica]
```

Le directory sono **struttura da implementare**, non affermazione che i file esistano già. Binari grandi possono risiedere in un deposito versionato collegato tramite manifest e SHA.

**Livello di authoring:** file Blender con tutte le risorse per progettare e renderizzare in Cycles.  
**Livello di distribuzione:** collezione esportabile con UV, superfici, materiali e luci precalcolate coerenti col motore Atlas, senza geometrie nascoste non necessarie o effettistica da render offline.

## 4. Organizzazione del file Blender

Usare collezioni nominate e gerarchia esplicita, con dati sorgente riusabili tramite librerie collegate e, quando necessario, Library Overrides. Le librerie devono conservare origine, licenza e versione.

```text
COL_00_REFERENCE                 [non esportare]
COL_10_ARCH_SHELL                [pareti, archi, struttura, pavimento]
COL_20_MEZZANINE_BALCONIES      [due livelli, logge e parapetti]
COL_25_SKYLIGHT_OCULUS          [struttura, vetrate, cielo visibile]
COL_30_PORTALS                  [quattro istanze coerenti]
COL_40_ATLAS_CENTERPIECE        [podio ellittico e anelli]
COL_50_BANNERS                  [identità/veli laterali]
COL_60_PLANTERS_AND_PROPS       [vegetazione e dettagli di scala]
COL_70_LIGHTS                   [principale, accenti, riempimento]
COL_80_CAMERAS                  [camere di riferimento e collaudo]
COL_90_HELPERS                  [guide/rig, non esportare]
COL_99_RUNTIME_EXPORT           [solo derivato approvato]
```

Oggetti con nomi semantici, senza `Cube.001` o `Sphere.043` nei componenti principali. Per gli elementi modulari privilegiare istanze/collezioni collegate. Preservare la possibilità di rigenerare i derivati senza modificare il master approvato.

## 5. Moduli obbligatori, basati sull'immagine

| Modulo | Geometria artistica necessaria | Segni da preservare |
|---|---|---|
| `ARCH_ROTUNDA` | curvatura vera, pilastri, due livelli, apertura e profondità | edificio monumentale, non un cilindro |
| `ARCH_GALLERIES` | balconate, parapetti, ambienti laterali illuminati | profondità architettonica ai lati |
| `OCULUS` | grande struttura vetrata, corona e profili metallici | cielo visibile, luce zenitale protagonista |
| `FLOOR_STONE` | lastre, giunti, spessori, microvariazioni materiche | riflessi credibili, non superficie-specchio |
| `PORTAL_MASTER` | telaio sagomato, bordo caldo, vetro stratificato, zoccolo | pannello digitale fisicamente integrato |
| `PORTAL_4_VARIANTS` | simboli/illustrazioni delle quattro sezioni | differenze funzionali senza stili incoerenti |
| `ATLAS_PODIUM` | corpo **ellittico** ribassato, convesso, anelli e marchio | non cilindro o emisfera grossolana |
| `PROPS` | fioriere, verde e stendardi, dettagli secondari | ricchezza ambientale senza nuova biblioteca |

**Regola sui testi:** la grafica espositiva del render può avere elementi illustrativi, ma **nomi, sottotitoli, CTA e destinazioni operative** sono definiti una sola volta nel contratto Atlas e restano accessibili tramite HTML. Evitare etichette duplicate fra mesh e componente web.

## 6. Camera matching e documentazione delle viste

- `CAM_HERO`: camera primaria; stessa gerarchia visiva del riferimento, ampiezza del lucernario, portali grandi, basamento davanti e spazio del pavimento. Fissare focale, trasformazione, punto di mira e rapporto d'aspetto; registrare tutto in un documento verificabile.
- `CAM_SIDE`: scostamento laterale controllato per verificare profondità, spessori dei portali, logge e parallasse.
- `CAM_MOBILE`: composizione autonoma in orientamento verticale, leggibilità dei portali e del fulcro.

Eseguire prova di camera matching con fSpy o strumento equivalente **solo se** le linee di fuga sono affidabili; l'immagine artificiale può contenere incoerenze prospettiche. In caso contrario bloccare una camera verificata manualmente mediante sovrapposizioni.

**Gate CAM:** tre viste in grigio (clay) dallo **stesso modello 3D**. Se la silhouette e la prospettiva non corrispondono, non avviare la rifinitura di materiali.

## 7. Look development: materiali reali

Biblioteca comune di materiali con shader **Principled BSDF** quando compatibile con il derivato:
- `MAT_FLOOR_STONE_BLUE`: pietra levigata, venature leggere, roughness non uniforme, giunti;
- `MAT_METAL_GOLD_BRUSHED`: ottone satinato, highlights caldi;
- `MAT_METAL_DARK`: metallo brunito/grafite, riflessi controllati;
- `MAT_GLASS_PORTAL`: più livelli traslucidi e profondità;
- `MAT_EMISSIVE_PORTAL`: linee luminose controllate, non grandi lastre uniformemente emissive;
- `MAT_SKYLIGHT_GLASS`: vetrate e struttura del lucernario;
- `MAT_BANNER_FABRIC`: tessuto con microstruttura;
- `MAT_PLANT_LEAF`, `MAT_PLANTER_METAL`: asset vegetali non eccessivamente dettagliati.

Usare materiali/texture già disponibili con **licenza verificata** (per esempio CC0), registrando autore, URL, licenza, hash, variazioni e condizioni di distribuzione. Non confondere materiale scaricabile gratuitamente con libertà di redistribuirlo.

**Gate MAT:** differenziazione credibile fra pietra, metallo, vetro e tessuto, resa convincente **anche senza bagliore aggiunto in compositing**.

## 8. Direzione della luce

**Render artistico di riferimento: Cycles.**  
**Anteprima rapida: EEVEE**, senza assumerne i risultati identici a Cycles o al WebGL finale.

1. **Luce principale:** cielo/lucernario freddo; raggi coerenti con il varco reale.
2. **Accenti caldi:** ottone lungo la corona, i quattro telai e gli anelli del podio.
3. **Riempimento:** debole, conservando ombre e articolazione dei due livelli.
4. **Riflessi:** pavimento e metalli come superfici fisiche, non grafica sovrapposta.
5. **Atmosfera:** fasci sottili e controllati, con eventuali interventi compositivi misurati.

Conservare un documento con esposizione, gestione colore (AgX ove appropriato), sorgenti, temperature relative, settaggi di rendering e immagini diagnostiche separate.

**Gate LIGHT:** Cycles HERO paragonabile per profondità, lucernario, contrasto e ricchezza materica al riferimento; nessun trucco che fallisca appena la camera si sposta.

## 9. Contratto di derivazione GLB per Atlas

Il master rimane modificabile; l'export **non** deve modificare il master.

- Creare collezione di esportazione controllata, senza helper, camere diagnostiche, luci offline e componenti invisibili.
- Applicare riduzione mirata a geometrie fuori dal cono di fruizione, preservando architettura caratterizzante.
- UV adeguate per PBR e, dove utile, **UV secondarie** per luce/occlusione precalcolata.
- Verificare il baking **su una sola campata architettonica e un portale**, prima dell'intero atrio.
- Non presumere che la luce di Cycles passi automaticamente nel GLB; scegliere espressamente mappe, canali e collegamento Three.js per l'illuminazione precalcolata.
- Esportare glTF 2.0/GLB e verificare materiali, texture, versioni/estensioni e decoder supportati da **Three.js r128** già adottato in Atlas.
- Ottimizzare solo dopo che lo scarto fra Cycles e WebGL è misurato e accettabile.
- Manifest: impronta del master, risorse, provenienza, build, geometrie, materiali, peso trasferito e screenshot della scena reale.

**Gate WEB:** stessa scena riconoscibile nell'anteprima WebGL e nel render Cycles; quattro portali reali, navigazione e fallback accessibile, senza nuove piattaforme.

## 10. Controlli obbligatori di qualità

| Controllo | Prova | Approvatore |
|---|---|---|
| Referenza | SHA e file canonico archiviato | Governo Atlas |
| Camera | viste `CAM_HERO`, `CAM_SIDE`, `CAM_MOBILE` | Direzione artistica |
| Architettura | silhouette, livelli, spessori, parallasse | Artista ambienti + direzione |
| Materiali | pietra/ottone/vetro credibili | Artista look-dev |
| Luce | fotografia Cycles vicina alla ART-DIR-02 | Direzione artistica |
| Confronto | render e immagine affiancati, stesso rapporto | Direzione + ideatore |
| Esportazione | validità GLB, mappe, dimensioni e licenze | Tecnico 3D |
| Prova Web | camera coerente, portali e fluidità browser | Tecnico Atlas |
| Smartphone | prova fisica Android e conferma qualitativa | Ideatore |

**Soglia di qualità:** per architettura, composizione e illuminazione almeno 4/5 nella revisione umana, **oltre ad approvazione esplicita**. Le misure automatiche di somiglianza dei pixel sono diagnostiche, non certificazione di bellezza. Uno studio non approvato non viene promosso al web finale.

## 11. Modalità di lavoro e responsabilità

- **Art director:** traduce ART-DIR-02 in composizione, seleziona asset, blocca camere e approva la qualità.
- **Artista di ambienti Blender:** crea architettura, istanze, moduli, vegetazione e basamento; garantisce realtà 3D.
- **Artista materiali/luci:** costruisce Principled/PBR, luce, Cycles e eventuali mappe baked; può coincidere con l'artista di ambienti.
- **Tecnico 3D web:** deriva il GLB, conserva la qualità e integra nel visualizzatore Atlas.
- **Ideatore Atlas:** approva il confronto finale e l'esperienza Android.
- **Automazione FLOW-02:** controlla identità, render, file, prove e avanzamento; **non inventa una promozione artistica**.

È possibile che un artista generalista copra più ruoli. La disponibilità di competenza artistica qualificata è però condizione produttiva reale, non sostituibile con test automatici o con un semplice script generatore di primitive.

## 12. Sequenza senza dispersione

1. **Riconciliare e depositare il riferimento binario** nuovo con la precedente fonte canonica; allineare FLOW-02 alla decisione senza sostituire o falsificare impronte.
2. **Produrre master e camere** con librerie modulari (prima composizione in grigio).
3. **Approvarne l'architettura** da HERO, SIDE e MOBILE.
4. **Rifinire materiali e luce** in Cycles e produrre confronto A/B con l'immagine.
5. **Ottenere approvazione artistica** vincolata a esatto SHA del .blend e del render.
6. **Derivare variante WebGL** con bake e ottimizzazioni validate nel motore esistente.
7. **Verificare sul dispositivo fisico**, raccogliendo misura e giudizio.
8. **Promuovere solo con autorizzazione separata**, senza merge/deploy automatico.

Le attività tecniche vengono orchestrate da FLOW-02 quando esistono le sorgenti; il lavoro artistico richiede realizzazione effettiva. Un blocco riporta causa e prova, non produce un falso PASS.

## 13. Fonti professionali verificate e da consultare in produzione

- Manuale Blender, **glTF 2.0**: https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html
- Manuale Blender, **Cycles Baking**: https://docs.blender.org/manual/en/latest/render/cycles/baking.html
- Manuale Blender, **Principled BSDF**: https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/principled.html
- Manuale Blender, **Library Overrides**: https://docs.blender.org/manual/en/latest/files/linked_libraries/library_overrides.html
- Manuale Blender, **camere**: https://docs.blender.org/manual/en/latest/render/cameras.html
- Progetto camera matching **fSpy**: https://github.com/stuffmatic/fspy
- **Fit The Camera** (compatibilità Blender 5.2+ da verificare): https://github.com/Tonysa87/FTC-Fit-The-Camera
- Khronos glTF Validator: https://github.com/KhronosGroup/glTF-Validator
- glTF-Transform: https://github.com/donmccurdy/glTF-Transform

Queste fonti documentano strumenti e tecniche. **L'interpretazione architettonica specifica dell'immagine, l'organizzazione del master e la soglia di approvazione sono decisioni del progetto Atlas**, non dichiarazioni attribuite ai produttori dei software.

---

## Stato di consegna

**MASTER-BLENDER-01 = specifica documentale persistente.**  
**atlas-foyer-master.blend conforme ad ART-DIR-02 = da realizzare.**  
**Immagine originale canonica archiviata = ancora da completare.**  
**Pubblicazione studenti = non autorizzata.**

La conclusione del lavoro sarà determinata dalla **conformità artistica verificata dell'atrio tridimensionale**, non dalla quantità di documenti, modifiche o verifiche automatiche.


## Produzione effettiva — ATLAS-ATRIUM-3D-SEED-01 (20/11/2026)

**Artefatto realizzato, diverso da un Master Blender:** un GLB con **308 mesh e 68.796 triangoli**, 979.996 byte, **riaperto e verificato** dopo esportazione, tutte le mesh non vuote e chiuse. Il primo modello 3D contiene rotonda, due gallerie, lucernario con apertura reale, podio convesso, quattro pannelli fisici distinti, scaffalature e vegetazione. Le geometrie sono derivate dalle **ipotesi** del Blueprint-01, non dai pixel dell'immagine ART-DIR-02.

- [Documento e limitazioni](./ATLAS-ATRIUM-3D-SEED-01.md)
- [Rapporto JSON della geometria](./ATLAS-ATRIUM-3D-SEED-01-evidence.json)
- [Generatore riproducibile Python](../../scripts/atlas-gateway-production/generate-atrium-seed.py)
- [Passaggio a Blender / 3 telecamere / render Cycles](../../scripts/atlas-gateway-production/import-atrium-seed-blender.py)
- [Pacchetto **persistente Drive**, contenente GLB, sorgenti, JSON e anteprima](https://drive.google.com/file/d/1kHp7LNSyU4nHAt1yLqDWDy5vkOqpLpJp/view); ID Drive `1kHp7LNSyU4nHAt1yLqDWDy5vkOqpLpJp`, **685.215 byte**, rilettura dei metadati riuscita.
- SHA-256 GLB: `2800580409408efae6cc9181354a622959aee67ffb6620531f1db1e0b40b6ddf` e SHA-256 ZIP `1dd10ab8c18fcfd3d40159daeec3e6261df7d1f33bef2c1695d7ca4b7dce07b1`.

**Prove superate:** export/rilettura GLB, 4 portali distinti, chiusura di ogni mesh, 3 camere nel JSON, script Python sintatticamente validi. **NON eseguito:** importazione con Blender, salvataggio di `.blend`, rendering Cycles, confronto con PNG canonico, approvazione artistica, test WebGL/Android. L'ambiente locale non disponeva di Blender e l'installazione non è riuscita.

**Prossimo ingresso:** eseguire lo script Blender su un runner dotato di Blender e acquisire il PNG canonico, senza sostituirlo con ARENA 5 portali o Biblioteca Atlas 3 portali; poi effettuare la calibrazione mediante sintesi/confronto. Il lavoro appena salvato è un prototipo geometrico, non un risultato fotorealistico.


---

## Addendum operativo vincolante — ARCH-04 / 21 novembre 2026

L'ideatore ha stabilito il seguente ordine obbligatorio: **ARCH-04 geometria e progetto architettonico completo → approvazione esplicita → VIS-01 grafiche/materiali/luci/raggi/arredi → approvazione → WEB-01 derivato leggero e prove smartphone**. Nessuna delle tre fasi può essere considerata compiuta dal solo completamento dei test automatici, né autorizza l'integrazione in `main` o la pubblicazione.

**Documenti autorevoli attuali, senza sostituzione di ART-DIR-02:** [sequenza vincolante](./ATLAS-GATEWAY-LOCKED-DELIVERY-SEQUENCE-01.md); [progetto geometrico architettonico](./ARCH-04-ARCHITECTURAL-GEOMETRY-PROJECT-01.md); [contratto di quote e formule](./ARCH-04-ARCHITECTURAL-GEOMETRY-PROJECT-01.json); tavole [PL-01](./drawings/ARCH-04-PL-01-PLAN.svg), [SE-01](./drawings/ARCH-04-SE-01-TRANSVERSE.svg), [SE-02](./drawings/ARCH-04-SE-02-LONGITUDINAL.svg), [PR-01](./drawings/ARCH-04-PR-01-CANONICAL-FIT.svg).

**Conservazione Drive, copie consultabili:** [progetto geometrico](https://docs.google.com/document/d/1iaGT0h8vebP7dFQAk0MFwm4drD4DgwUWJStQHHFsnTU/edit) e [sequenza permanente](https://docs.google.com/document/d/1T1Ls_nIgFVOeF3u2wnwXshq-XYp8J66jcnIYqM5r3po/edit). Il riferimento canonico resta il [JPEG approvato del 21/11](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`, non i vecchi PNG citati nella storia della sezione 2.

**Problemi aperti (non dare per risolti):** la copertura anteriore ancora parzialmente non modellata; corona e cielo troppo ritagliati in HERO; raccordi di basamenti e anelli al pavimento; connessioni travi/pilastri/solai; differenza fra 14 campate portanti e 18 pannelli di copertura; rotazioni dei portali non necessariamente tangenti all'arco; allineamento prospettico congiunto di portali, oculo e podio. L'ARCH-04 R2 rimane una **candidata** tecnicamente verificata e non approvata artisticamente.
