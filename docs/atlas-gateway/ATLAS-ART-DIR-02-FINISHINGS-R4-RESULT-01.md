# ATLAS ART-DIR-02 — FINISHINGS-FIRST R4: esito della prima prova materica e arredi CC0

**Data:** 21 novembre 2026 · **Stato:** `TECHNICAL_PASS__ARTISTIC_PARTIAL_NOT_APPROVED`.
**Continuità:** modello geometrico/art-prova R2 già conservato → R4 con materiali reali e vegetazione premodellata. **Non è un nuovo progetto; la geometria dei quattro vetri non è stata ricalibrata.**

## 1. Identità, esecuzione e archivio durevole
- Fonte artistica: [ART-DIR-02 JPEG canonico](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.
- Base: R2, quattro pannelli vetrati tangenti alla curva concentrica e fisicamente incassati nel pavimento. Il file R2 resta preservato e indipendente.
- Esecuzione reale [GitHub Actions #44882113520](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44882113520), commit `6f6eebab743dfc4f26d3acb51799cbacbb20b830`: **SUCCESS**, 13/13 passaggi, nessun fallimento.
- [Archivio R4 Blender + sorgenti CC0 + due render + ricevute](https://drive.google.com/file/d/1ecf0SAB-N2orpwzeoMyMAKN-LkM71G8W/view), **33.084.884 byte**, SHA-256 ZIP `e8caacedd77c2a83ad1b2bbdaac2b76d511db99b4b69dca67b4d882f71dc7748`, caricato e metadati riletti da Drive.
- [Tavola di confronto ART-DIR-02 / R2 / R4 HERO / R4 OBLIQUE](https://drive.google.com/file/d/1_lLvzRr6OXzPbVeHlLHebX4vuOZBMvij/view), **740.766 byte**, metadati Drive verificati.
- Impronta SHA-256 del `.blend` R4 `e7e7344353558acaa3145ed09e31c3f5f251fd9dfb9b9ecb5cb42897cafd13e6`.

## 2. Che cosa è stato REALMENTE importato
- **Onyx013**, [ambientCG](https://ambientcg.com/view?id=Onyx013), 1K-JPG CC0: diffuse, roughness e normal map. Applicato al pavimento, con venature volutamente attenuate e tonalità blu-grafite.
- **Metal010**, [ambientCG](https://ambientcg.com/view?id=Metal010), 1K-JPG CC0: famiglia materiale riadattata alla finitura ottone satinato e applicata a **12 elementi** (bordature del podio, fioriere e otto profili delle quattro feritoie).
- **Potted Plant 04**, [Poly Haven](https://polyhaven.com/a/potted_plant_04), variante **glTF 1K CC0** effettivamente acquisita, completa di file binario e mappe. Importata in Blender e istanziata **due volte** sulle fioriere architettoniche già presenti. Non si tratta di un duplicato procedurale o di un'immagine incollata.
- L'acquisizione precedentemente tentata come `.blend` è stata respinta per una incompatibilità del file sorgente (`Missing DNA block`). La soluzione effettiva **non** maschera l'errore: usa glTF originale e relativa dipendenza, con checksum e importazione reale.
- Tutte le immagini sono create con Blender Cycles dal medesimo R2, senza modificare camera, quattro radici dei portali o rotte web. La pipeline salva i sorgenti completi nel pacchetto per riproducibilità.

## 3. Valutazione visiva, senza autocompiacimento
**Miglioramento confermato:** il pavimento appare meno uniforme e più credibile; i materiali sono reali e modulabili; le fioriere contengono modelli fotografici 3D di provenienza verificata, il riuso tramite istanze è qualificato.

**Limiti chiari:** le piante importate sono troppo piccole rispetto alla monumentalità della rotonda e non correggono la povertà scenografica delle gallerie. Lucernario, parapetti e pareti continuano a sembrare costruzioni stilizzate; i render a basso campionamento presentano rumore. Il riferimento ART-DIR-02 resta nettamente superiore per materiali, dettaglio e profondità architettonica. **Non dichiarare APPROVED.**

## 4. Decisione e passo successivo
La strategia **FINISHINGS-FIRST-01** è confermata come **tecnicamente praticabile**: componenti CC0 scaricati e versionati, materiale/istanza importati realmente in Blender, riproducibili senza nuove spese obbligatorie. La nuova fase non è un'altra ricerca geometrica, ma un incremento mirato di **scala e qualità degli arredi secondari** e dei **rivestimenti delle due gallerie**.

Per la prossima lavorazione scegliere un kit minimo di 2–3 oggetti di scala adeguata alla HERO (alberi da interno, fioriere slanciate, arredi espositivi o parapetti) con licenza chiara; mostrare una campata prima/dopo e una vista complessiva HERO con stessi volumi/camera. Dare maggiore profondità alle balconate con materiali architettonici e riflessi; non aumentare indiscriminatamente le emissioni. Valutare poi una vera prova di trasposizione di *una campata* in Three.js r128 e controllare il peso, senza ancora esportare l'intero master Blender come GLB web.

**Governance:** PR Atlas #152 in bozza, TRAMA #354; nessun merge, nessun deploy, nessuna pubblicazione studenti o dati personali. La prova tecnica NON costituisce approvazione artistica o qualifica di fluidità sul dispositivo fisico.
