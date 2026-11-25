# ATLAS ART-DIR-02 — R8: verifica della regia integrata lucernario / gallerie / vetri

**Data:** 21 novembre 2026. **Stato:** `TECHNICAL_PASS__VISUAL_IMPROVEMENT_PARTIAL__ARTISTIC_NOT_APPROVED`.  
**Immagine di riferimento canonica (immutata):** [ART-DIR-02 originale](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), 1536×864, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.  
**Lettura autorevole:** [VISUAL-READING-02](./ATLAS-ART-DIR-02-VISUAL-READING-02.md).  
**Sorgente Blender esatta:** [R7 corretta](https://drive.google.com/file/d/1wwzdaMIZFTBELKYgGIFCHsjo7nezclWI/view), `atlas-art-dir02-r7-light-and-blue-glass.blend`, SHA-256 `4fb946a52b2c2c15e1a42643cf210e9a45c77428c3b9c63bb557d36c6f8a71dc`.  
**Implementazione nuova:** [PR #168 in bozza](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/168), ramo `work/atlas-artdir02-r8-atmosphere`, script `scripts/atlas-gateway-production/r8_integrated_atmosphere.py`, workflow `.github/workflows/atlas-art-dir02-r8.yml`. Nessun merge o pubblicazione.

## 1 — Due prove reali qualificabili e ricostruibili

| Stato | Workflow Blender | Archivio master + render | Identità verificata |
|---|---|---|---|
| R8-01, prima integrazione | [Actions #44942272386](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44942272386) **SUCCESS** | [Drive R8 prima](https://drive.google.com/file/d/15e6Au1pKf0YsgzfGgV5GYn7BhfjblrWM/view), 15.692.550 B | ZIP SHA-256 `0aa6cc3e6d8e2449ca07b11f4ce8fa00139da6ad19391734f99cf5b968326e08`, .blend SHA-256 `380f41561d0b40df5f100edd9f3f83181e89998acd6c8935fa4305ed3da40a4d` |
| R8-02, correzione ottica | [Actions #44942787690](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44942787690) **SUCCESS** | [Drive R8 corretta](https://drive.google.com/file/d/19JWBQ4DQG4a77YbsChtID7ZYFjZ9LUQU/view), 15.680.918 B | ZIP SHA-256 `1f5f509d8fdd7b1f72dc815cca1ace35a75079e49e45d0d61cebb59a70f453dd`, .blend SHA-256 `2d39c43e0690334ce40627266d083e78d4d4238d25a28d0aaec6be33ef6550f8` |

**Confronto visivo effettivo, tre immagini nella stessa HERO:** [Canone ART-DIR-02 / R8-01 / R8-02](https://drive.google.com/file/d/1p3L96mW5L3I2GxKPfeHUKOdcw7wYM4Vp/view), JPEG 447.676 B, SHA-256 `96ae16e52dd32d29940fd8dea10c6361768fe828b3300c4ac1cabbdcf8d3326c`. I file sono tutti collocati nella stessa cartella Drive dell'immagine di riferimento. Metadati letti nuovamente dopo l'upload.

## 2 — Oggetti e modifiche realmente qualificati

- **Lucernario:** raggio della geometria del cielo da `5,3720 BU` a `4,4050 BU` (fattore 0,82); riallineati bordo caldo R7, collare e **quattro nervature originali**; riparametrizzata la **stessa** copertura curva nera, senza reticolo d'acciaio aggiuntivo.
- **Vetrate e gallerie:** modificati i materiali di **42** superfici architettoniche arretrate e **28** pannelli di parapetto esistenti. L'impressione di finestre bianche si attenua, pur con luce calda di biblioteca ancora poco convincente.
- **Librerie:** mantenuti **quattro moduli ufficiali CC0** già nella R6C, lievemente avvicinati alla zona visibile; riuso delle tre collezioni CC0 originali, senza nuovi file 3D.
- **Portali:** adeguate **16 geometrie** esistenti (`telaio/retro/vetro cobalto/cornice` di quattro vetrate), **+11% in larghezza** e **+12% in altezza** solo sui figli; nessuno spostamento delle quattro radici dei portali e delle quattro singole basi metalliche luminose già realizzate.
- **Raggi atmosferici:** da sette volumi già costruiti a quattro visibili, meno regolari. Nessun pannello fotografico usato come scena 3D.
- **R8-02:** ulteriori correzioni ai soli shader/reflection del vetro, alla luce frontale diffusa, alla finitura del podio e alla saturazione del **cielo originale con la stessa immagine packed** (non nuova texture).
- La camera `CAM_HERO_ARCH04`, le quattro radici dei portali, quattro basamenti metallici, tre collezioni CC0, logotipo ATLAS e vera mappa Onyx013 del pavimento sono invariati. Generati `atlas-r8-hero.png` (1152×648) e `atlas-r8-gallery-portals.png` (832×468), entrambi Cycles verificati mediante SHA.

## 3 — Misura indicativa di luminosità, senza giudizio estetico automatizzato

Stessa proporzione 16:9, ritagli normalizzati, media del segnale `Y'=0,2126R+0,7152G+0,0722B` sui JPG/PNG a 8 bit. Questo dato **non misura** la somiglianza visiva, la qualità dell'illuminazione né l'accuratezza materica.

| Regione | ART-DIR-02 | R8-01 | R8-02 |
|---|---:|---:|---:|
| Totale fotogramma | 75,4 | 84,3 | **76,2** |
| Volta (5–95% × 5–23%) | 69,3 | 84,2 | 82,1 |
| Gallerie (2–98% × 20–40%) | 70,0 | 76,9 | 67,6 |
| Quattro portali (10–90% × 30–62%) | 80,6 | 101,0 | **82,5** |
| Pavimento (6–94% × 78–97%) | 80,2 | 81,2 | 77,4 |

**Interpretazione:** la seconda R8 riduce significativamente il divario tonale globale e rende le vetrate più blu scure. Tuttavia la luma media di una zona può essere simile anche quando composizione, riflessi, illuminazione, dettagli e profondità architettonica sono molto diversi. Non usare la prossimità dei numeri come accettazione automatica.

## 4 — Revisione artistica circostanziata

**Miglioramenti visibili:**
1. L'oculo ha una scala apparente più vicina al canone e la volta continua resta leggibile, senza tralicci dominanti.
2. Le quattro vetrate hanno recuperato massa blu e rilievo grafico; meno aspetto lattiginoso.
3. Le gallerie appaiono meno bianche; il colore generale è meno grigiastro.
4. Il modello rimane un unico master Blender realmente ricostruibile.

**Differenze che impediscono ancora ART PASS:**
1. **Cielo e raggi**: oculo ancora troppo simile a un'ellisse uniforme; mancano la profondità e il contrasto molto luminoso delle nuvole, l'occlusione naturale e i fasci meno meccanici.
2. **Architettura interna**: due livelli delle gallerie ancora schematici, aperture non abbastanza profonde, bordi e colonne quasi omogenei; il rapporto vetro fumé/nicchie ambrate del riferimento non è riprodotto.
3. **Portali**: l'intera famiglia è ingrandita ma conserva l'aspetto di quattro pannelli blu regolari, mentre il riferimento integra vetro, diffusione luminosa, grafica complessa e diverse profondità apparenti. Non aggiungere pannelli di testo; la UX rimane responsabilità del sito.
4. **Vegetazione/librerie**: risorse CC0 autentiche ma ancora poco rilevanti visivamente; il riferimento possiede arbusti lucidi, vasche champagne e librerie calde molto presenti ai margini.
5. **Podio/pavimento**: forma e riflessi del podio ancora semplificati, punti luminosi bianchi sul pavimento troppo evidenti; mancano l'eleganza degli anelli e le bande prospettiche luminose più articolate.

**Decisione di revisione:** `R8_TECH_PASS__ARTISTIC_NOT_APPROVED`. R8-02 è la candidata tecnica e di contrasto **più promettente per la successiva valutazione**, non un nuovo riferimento artistico e non il modello autorizzato alla pubblicazione.

## 5 — Continuità e divieti

- Il riferimento ART-DIR-02 e la lettura 02 restano immutati; nessun nuovo servizio e nessuna dipendenza a pagamento.
- Il lavoro successivo, se approvato dall'ideatore, deve essere una **unica revisione scenografica** di luce integrata fra cielo, vetri e gallerie, usando gli asset già acquisiti; non un nuovo master e non un altro ciclo di studio geometrico.
- Il collaudo GLB e la misurazione reale su smartphone sono aperti: **non confondere il rendering Cycles con la prestazione web**.
- [Coordinamento #154](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/154), [revisione E #159](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/159), [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354). Nessuna PR integrata in main e nessuna pubblicazione agli studenti.
