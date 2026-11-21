# ATLAS — ARCH-04 · Progetto architettonico delle geometrie
## GEOMETRY-PROJECT-01 · Piano, sezioni, prospetti, nodi e coordinate
**Data:** 21/11/2026 · **Stato:** specifica parametrica del progetto; **non** modello artistico approvato.  
**Sorgente artistica assoluta:** [immagine ART-DIR-02](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.  
**Inventario dati geometrico principale:** [JSON](./ARCH-04-ARCHITECTURAL-GEOMETRY-PROJECT-01.json).  
**Modello laboratorio R2:** [archivio Drive](https://drive.google.com/file/d/1txZ0sBnOh6zeovEGHBx6n5f2DBnfNFcn/view), [produzione PASS](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44867149465). Gli asset del laboratorio sono recuperabili, ma NON qualificati artisticamente.

## 1. Scopo e tavole
L'architettura non si ricostruisce come unica inquadratura fotografica. Il progetto definisce **PL-01 planimetria**, **SE-01 sezione trasversale**, **SE-02 sezione longitudinale**, **PR-01 prospetto fotografico con landmark**, più almeno due viste 3D di riscontro. La geometria visibile deriva dalla fonte; quella nascosta, compreso il fronte di ingresso, è **ipotesi progettuale** da verificare.

## 2. Sistema delle coordinate e centri
X a destra, Y verso il retro dell'atrio, Z verso l'alto, in **unità relative Blender BU, non metri**. Quota ideale del piano finito Z=0. Centro della rotonda `Cᵣ=(0,1.30)`; arco circolare dei portali `Cₚ=(0,−6.3836)`; asse della calotta `Cₐ=(0,−2.00)`. **Tre centri distinti.** Le loro differenze sono proprietà della candidata visiva attuale, non misure edilizie approvate.

## 3. PL-01 — Rotonda, pavimento e distribuzione
Pavimento circolare radius 11,76 BU, centro `(0,1.30,−.24)`, spessore .40 → estradosso Z=−.04 nella candidata. Muro posteriore curvo da −90° a +90° intorno a `Cᵣ`. Basamento strutturale ad anello `r=11.05..11.85`, Z=.02..45. Pareti e nicchie di fondo ai raggi 11.94 e 12.32. Il fronte rimane aperto nel rendering di laboratorio, **non è ancora una soluzione di edificio navigabile**: va progettato come ingresso tridimensionale credibile e compatibile con l'inquadratura, senza una parete artificiale davanti alla camera.

## 4. SE-01 — Due gallerie complete
Campate = **14**, pilastri radiali = **15**; passo = **12,8571°**; asse `θₖ=−90°+k·180°/14`. Pilastri principali r=11,52, sezione `0.25×0.46 BU`; tratti verticali Z `.40–2.43`, `2.64–5.18`, `5.40–7.03`.  
| Livello | R interno | R esterno | Solaio Z | Vetro Z | Corrimano Z |
| --- | --- | --- | --- | --- | --- |
| GALLERY_1 | 10.17 | 11.86 | 2.45–2.63 | 2.68–3.34 | 3.35–3.41 |
| GALLERY_2 | 10.17 | 11.86 | 5.2–5.38 | 5.43–6.09 | 6.1–6.16 |

Cornice sommitale `r=11.16..11.92, Z=7.03..7.21`. Ogni ballatoio ha spessore reale, parapetto in vetro separato, corrimano e arretramento delle nicchie. **N-GAL-01** raccordo pilastro/soletta; **N-GAL-02** parapetto/montante/soletta; **N-GAL-03** nicchia e soffitto ribassato. I pilastri non possono terminare sospesi a pochi centimetri dai solai.

## 5. SE-02 — Grande lucernario e copertura
Centro `(0,1.30)`, foro interno candidato r=6.85, corona `r=6.76..6.98, Z=8.22..8.40`, disco del cielo `r=6.80, Z=8.55`; copertura fino a r=11.55 secondo `z(r)=8.44−1.17·((r−6.85)/4.70)²`, da Z=8.44 (bordo interno) a Z=7.27 (esterno).  
Struttura secondaria: **18 moduli radiali**, spessori candidati vetro .045 e costola .06, 12 razze sul cielo. Le 18 nervature **non coincidono** con 14 campate portanti: richiedono un anello di ripartizione strutturale continuo fra copertura e parete. **N-OCU-01** profilo vetro/corona/luce, **N-OCU-02** copertura/cornice superiore, **N-OCU-03** trasferimento carichi verso pilastri. Il rettangolo visibile del cielo nell'immagine `(454,0,1119,136) px` è **ritagliato dalla fotografia**; non identifica il diametro completo. Nessuna regolazione del raggio va approvata indipendentemente dalla camera.

## 6. PR-01 — Quattro portali su arco
Cerchio dei centri `x²+(y+6.3836)²=9.1441829²`; soluzione `y=−6.3836+√(R²−x²)`.  
| Portale | X | Y | Rotazione Z | Telaio effettivo |
| --- | --- | --- | --- | --- |
| Curricolo | -5.95 | 0.5600 | -0.29 | 3,792 × 5,04 × 0,20 BU |
| Esplora | -2.40 | 2.4400 | -0.11 | 3,792 × 5,04 × 0,20 BU |
| Percorsi | 2.40 | 2.4400 | 0.11 | 3,792 × 5,04 × 0,20 BU |
| Esperienze | 5.95 | 0.5600 | 0.29 | 3,792 × 5,04 × 0,20 BU |

Telaio arrotondato locale `3.16×5.04×.20 BU`, scala orizzontale `1.20`, larghezza risultante **3.792**, centro Z=2.72, base Z≈.20, sommità Z≈5.24. Coppia laterale sempre simmetrica; coppia centrale sempre simmetrica. La base **apparente** dei centrali si vede circa 30 px più in alto nell'immagine, ma le sagome laterali sono più alte in pixel: non dedurre da questo una maggiore **altezza fisica** dei due centrali. Le rotazioni Z correnti `±.29/±.11` non coincidono con una tangente perfetta all'arco e devono essere verificate proiettivamente.

**N-POR-01:** vetro, telaio, cornice vera; **N-POR-02:** base/soglia e fondazioni scenografiche al pavimento; **N-POR-03:** sede di icona, titolo, sottotitolo e illustrazione tridimensionale (completamento VIS-01). Conservare i quattro ID e i collegamenti web autorevoli.

## 7. Podio e anelli
Calotta ellissoidale di centro `(0,−2)`, semiassi **3.58 × 2.38**, quota base .58, altezza 1.59, sommità **2.17**; superficie `(x/3.58)²+((y+2)/2.38)²+((z−.58)/1.59)²=1, z≥.58`.  
Profili ellittici: anello esterno **4.89×3.13 a Z=.22**; secondo **4.42×2.85 a Z=.44**; gola luminosa **4.37×2.80 a Z=.54**. Il marchio ATLAS si mappa come UV curva dalla risorsa originale approvata, senza font ricostruiti.
**N-POD-01:** supporto calotta/ring/pavimento; **N-POD-02:** sezioni metalliche e gola emissiva; **N-POD-03:** supporto UV del logo. Lo zoccolo esterno del portale parte a circa Z=.11 mentre il pavimento è Z=−.04: **va colmato il dislivello geometrico ~.15 BU**. L'anello esterno del podio ha quota minima circa Z=.14: anche questo necessita un supporto, non un'ombra disegnata.

## 8. SE-02 — Ingresso e percorso di navigazione
Definire prima **zona di ingresso**, passaggio tra i due portali centrali, accessibilità alle quattro destinazioni e separazione dal podio. La sovrapposizione in HERO del podio ai pannelli è una proprietà fotografica, **non** una compenetrazione consentita fra volumi. Il settore anteriore nascosto non può essere dato per presente nella geometria ARCH-04: occorrono una soluzione progettuale e una sezione verificata.

## 9. Presenze laterali e attacchi architettonici
Pilastri laterali diagnostici `X=±9.35, Y=5.40`, sezione `.32×.48×6.2` con centro Z=3.62; fioriere `X=±9.12, Y=−1.65`, sezione `1.13×1.08×.82`, centro Z=.44. I drappi, scaffali, vegetazione e illuminazione vanno collocati attraverso agganci reali e ingombri definiti; in ARCH-04 definire **volumi e attacchi**, in VIS-01 dettagli di grafica e materia.

## 10. Camera-fit dell'intera architettura
Camera HERO laboratorio: `(0,−15.8,3.38)`, target `(0,2.2,2.05)`, 30 mm, 16:9. CAMERA SIDE `(5,−13.8,3.56)`, target `(0,2.2,2.22)`, 29 mm. Tre camere verticali 9:16 per d'insieme e coppie.  
Il precedente errore medio delle sagome dei portali era ≈**0.01190** in ARCH-03, ≈**0.01248** in ARCH-04: buon allineamento parziale, ma il **cielo del lucernario resta eccessivamente tagliato**. Serve ottimizzare **camera + copertura + corona + quattro portali + podio**, non una sola dimensione. La misura dell'oculo deve riguardare **l'apertura visibile**, non il bounding box matematico dell'intero disco fuori fotogramma.

## 11. Convalida delle tavole e delle geometrie
| Gate | Accertamento |
| --- | --- |
| GEO-00 | Original reference binary and the approved source hash equal the canonical record; ARCH-03 and ARCH-04 diagnostic blends remain immutable |
| GEO-01 | All primary components, orthographic plan, both building sections, hero elevation, portal components and versioned object IDs exist |
| GEO-02 | Four portal centers lie on one circle; outer pair and inner pair each mirrored; paired frame heights match |
| GEO-03 | Main shell, two decks, balustrades, columns, roof panels, crown and dome are real 3D geometries; no flat photo substitutes |
| GEO-04 | HERO camera fits portals, visibly exposed oculus rim/sky and podium simultaneously; consider occlusion rather than using unoccluded circle bbox |
| GEO-05 | A coherent perimeter support joins roof panel loads to building support; all visible structural joints resolved |
| GEO-06 | No relevant mesh intersections or clearance conflicts among portal bases, podium rings and walkable foreground; balcony slab continuity verified |
| GEO-07 | Mobile overview + left/right focus preserve portal hit targets and full silhouettes; interactive text remains canonical DOM |
| GEO-08 | Art direction explicitly approves geometry for the specific source hash and .blend hash; otherwise VIS-01 is blocked |

Ogni cambiamento deve generare una ricevuta con hash input, quote, rapporto tra coppie, dati di proiezione e confronto delle cinque viste. Niente gate automatico che dichiari approvazione artistica.

## 12. Procedura di costruzione
**ARCH-04a:** completare tavole PL-01, SE-01, SE-02, PR-01 e approvarne i parametri provvisori.  
**ARCH-04b:** ricostruire in Blender appoggi e sezioni reali, portali su unico arco, copertura con ring di ripartizione, podio e settore d'ingresso plausibile, preservando il master storico.  
**ARCH-04c:** confronto fotografico congiunto e cinque viste + sezioni ortografiche; registrare anomalie e scostamenti.  
**ARCH-04d:** conferma artistica esplicita del preciso file Blender/versione.  
**VIS-01:** solo allora simboli, testi, immagini interne, PBR, riflessi, punti luce, raggi e oggetti d'arredo.  
**WEB-01:** solo dopo qualificazione VIS-01, esportazione e test su telefono reale.  

**Principio di governo:** un solo percorso ARCH-04 → VIS-01 → WEB-01, con documenti e contratti versionati; nessuna PR integrata o pagina pubblicata automaticamente. Fonti Blender 5.0: [istanze](https://docs.blender.org/manual/en/5.0/modeling/geometry_nodes/instances/instance_on_points.html), [Curve to Mesh](https://docs.blender.org/manual/en/5.0/modeling/geometry_nodes/curve/operations/curve_to_mesh.html), [camera ortografica](https://docs.blender.org/manual/en/5.0/editors/3dview/navigate/projections.html).
