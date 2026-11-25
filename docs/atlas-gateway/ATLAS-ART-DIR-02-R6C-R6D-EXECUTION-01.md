> **Aggiornamento di produzione (21/11/2026):** il piano R6C–R6D è stato **eseguito**: [R6C PR #164](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/164) e [R6D PR #163](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/163) hanno controlli Blender PASS; [R6ABCD PR #165](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/165) ha montaggio 3D reale PASS, [Actions #44938236317](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44938236317). **Lettura e giudizio completo:** [R6ABCD-PRODUCTION-RESULT-01](./ATLAS-ART-DIR-02-R6ABCD-PRODUCTION-RESULT-01.md). **La qualità artistica canonica non è ancora raggiunta.** La parte descritta sotto conserva valore come piano storico ed esecutivo; non va più letta come stato corrente «non implementato». Nessun merge/deploy.

# ATLAS ART-DIR-02 — R6C–R6D / PIANO ESECUTIVO 01

**Data:** 21 novembre 2026 · **Stato:** PIANO PRONTO PER PRODUZIONE, **non** modelli R6C/D già realizzati.  
**Scopo:** completare in parallelo la scenografia e i portali della **stessa** porta tridimensionale di Atlas; poi ricomporre il modello e verificarlo artisticamente. Non aprire altri studi geometrici o progetti paralleli.

## 0 — Fonti vincolanti e stato di partenza

- **Immagine canonica immutabile:** [ART-DIR-02](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), JPEG 1536×864, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.
- **Lettura artistica autorevole:** [VISUAL-READING-02](./ATLAS-ART-DIR-02-VISUAL-READING-02.md), 26 elementi A01–A26, 16 relazioni R01–R16, 12 campioni cromatici **descrittivi, non istruzioni PBR numeriche**. [Archivio originale e approfondimento](https://drive.google.com/file/d/16Rnkm8FNzDH_TfXY2QtzKSpFAtOazcWY/view).
- **Master di confronto unico:** [R6AB già prodotto](https://drive.google.com/file/d/1Zf1YXbNQawiAUCR4M1a5Kgaoetix_-qO/view) e verificato, file `atlas-art-dir02-r6ab-integrated.blend`, SHA-256 `3d0bd18967c37d91025d1d2bd2abea3119aaf7da6f098a61d761566e88fd2cc4`. [PR #162](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/162), [prova tecnica #44935005743](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44935005743) SUCCESS, ma **approvazione artistica non concessa**.
- **Base comune specialistica per creare due varianti indipendenti:** R5, SHA-256 `e97dcf65e7cd6a97f031cef99d2d81398c5d42d6493807b4e29cf35e5236b278`, [archivio completo R5](https://drive.google.com/file/d/1XK-acsH4E3jLrMIj5NghXSvfRcALwI4r/view).
- **Incarichi creati:** [R6C #157](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/157), ramo `work/atlas-artdir02-r6c-furnishings`; [R6D #158](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/158), ramo `work/atlas-artdir02-r6d-portals`; coordinamento [#154](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/154); supervisione [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354).
- **Vincolo di progetto:** tutto gratuito, senza crediti/API a pagamento, nessun dato personale, nessuna distribuzione pubblica, nessuna fusione delle PR di bozza prima dell'accettazione. Le 2 corsie sono **compiti da eseguire** con codice e Blender; la loro esistenza non significa agenti già avviati.

## 1 — Struttura produttiva e responsabilità

| Corsia | Responsabilità esclusiva | Script/ramo | Prodotto minimo |
|---|---|---|---|
| **C** | Due tipi di vegetazione + due contenitori; librerie illuminate; due stendardi | `scripts/atlas-gateway-production/r6c_furnishings.py`; `work/atlas-artdir02-r6c-furnishings` | `.blend` variante C, HERO R5 identica, dettaglio arredi, inventario asset/licenze, controllo delle occlusioni |
| **D** | Pannelli blu e loro bordi, quattro **basamenti metallici bassi luminosi**, cupoletta ATLAS e anelli | `scripts/atlas-gateway-production/r6d_portals_podium.py`; `work/atlas-artdir02-r6d-portals` | `.blend` variante D, HERO R5 identica, dettaglio vetri/basamenti, ricevuta 4/4 portali |
| **Montaggio** | Composizione **R6AB+C+D** da un'unica scena 3D, non collage 2D | nuovo script `scripts/atlas-gateway-production/r6abcd_assemble.py`; ramo di integrazione separato | Un solo master, una HERO e due dettagli, tutte le provenienze verificate |
| **E** | Revisione indipendente della fedeltà ART-DIR-02 e della prova web | [#159](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/159) | Esito motivato, anomalie visive, compatibilità mobile verificata |

**Unica sorgente di verità per la scena:** R5 per produzioni isolate; R6AB per montaggio finale. Ogni script di trasformazione deve essere applicabile anche a una **copia** del master R6AB senza spostare elementi A/B, usando nomi e raccolte riservate (`ATLAS R6C •`, `ATLAS R6D •`). Evitare modifiche concorrenti a `blender_master.py`, agli script R2–R5 e al registro canonico. Se un oggetto desiderato non esiste, **fallire con nome e ricevuta** anziché aggiungere surrettiziamente un duplicato.

## 2 — R6C: inventario e lavorazioni degli arredi

| Famiglia | Situazione nel modello | Lavorazione concreta | Criterio nella HERO |
|---|---|---|---|
| **C1 — Vasi alti / alberelli** | Due `ARCH04 • raised botanical planter`, finiture R4 e piante importate R5 | Riutilizzare come punti di posa, sostituire l'attuale pianta non compatibile con un **alberello arioso dal tronco leggibile**, vaso satinato bronzo/champagne di proporzioni slanciate; altezza regolata **nella camera** e non tramite ingrandimenti arbitrari | Silhouette vegetale laterale evidente, niente chiome che coprono l'oculo, i quattro portali o i loro titoli |
| **C2 — Vasi bassi / cespugli** | Mancano le due famiglie distinte in primo piano | Due vasche basse ampie, lievemente ellittiche e lisce, con arbusti a fogliame fitto **diversi dagli alberelli**; solo un modello per famiglia istanziato con varianti leggere | Taglio laterale naturale consentito, coerente col riferimento; non invadere la zona centrale né creare ostacoli |
| **C3 — Vegetazione gallerie** | Due istanze R5 di `Potted Plant 04` sulle gallerie | Mantenere solo dove decorativamente corrette; ridurre e differenziare il verde, senza alberi giganti sopra i parapetti | Presenza secondaria, non protagonista |
| **C4 — Librerie / nicchie** | `ARCH04 • recessed gallery bay` e `ARCH04 • distant gallery interior`; ancora schematiche | Inserire 2–4 gruppi **modulari** di librerie in nicchie realmente esistenti, 1–2 materiali di scaffale, libri con ripetizione variata e piccoli emettitori caldi nascosti | Senso di profondità dietro vetro fumé, senza simulare una parete piatta di libri o rivelare sorgenti LED |
| **C5 — Stendardi** | `ARCH04 • restrained side exhibition banner` e relativo bordo inferiore già presenti | Rivestire gli **oggetti esistenti** in tessuto blu notte, medaglione `A` approvato con oro tenue; evitare doppie insegne e titoli HTML | Due quinte secondarie, leggibili ma subordinate al centro |

### 2.1 Risorse precostituite candidate, verificate come catalogo (NON ancora integrate R6C)

| Sorgente | Uso candidato | Rischio / decisione preliminare |
|---|---|---|
| [Poly Haven — Potted Plant 04](https://polyhaven.com/a/potted_plant_04) | già presente nel master R5, vegetazione **minuta** | CC0, piccolo succulento: **non** promuoverlo ad alberello monumentale |
| [Poly Haven — Pachira Aquatica 01](https://polyhaven.com/a/pachira_aquatica_01) | prova di alberello con tronco visibile | CC0; sorgente dichiarata circa **77.000 triangoli**, e silhouette tropicale non necessariamente simile al canonico: **solo candidato**, versione 1K e riduzione prima del web |
| [Poly Haven — Shrub 01](https://polyhaven.com/a/shrub_01) | studio di vegetazione bassa | CC0, fonte circa **282.000 triangoli**: non importare integralmente nella scena web; prova e forte alleggerimento **o scarto** |
| [Poly Haven — Potted Plant 02](https://polyhaven.com/a/potted_plant_02) | soluzione alternativa per fogliame denso | CC0, circa **70.000 triangoli**, vaso di terracotta da sostituire visivamente con metallo |
| [Poly Haven — Wooden Display Shelves 01](https://polyhaven.com/a/wooden_display_shelves_01) | modulo libreria adattabile | CC0, circa **3.000 triangoli**, fonte legno chiaro da rivestire di grafite/bronzo |
| [Poly Haven — Decorative Book Set 01](https://polyhaven.com/a/decorative_book_set_01) | libri e copertine riutilizzabili | CC0 ma pacchetto completo molto pesante e numerose texture: importare solo **pochi esemplari selezionati** e istanziarli, oppure copertine leggere su libri modulari |

Le indicazioni di peso/poligoni sono riferite ai **sorgenti** dichiarati; non sono misure della variante finale. **Un link di catalogo non è un asset scaricato, integrato o con licenza individuale verificata**. Prima dell'uso: identificativo esatto, URL del file, licenza, autore, data, formato, dipendenze, SHA-256, numero effettivo di triangoli, dimensione delle texture, resa prima/dopo e collocazione in Drive. Preferire glTF/GLB leggero o sorgenti Blender compatibili con la versione usata nel collaudo; se non compatibili, scegliere alternativa senza bloccare l'intera produzione.

### 2.2 Produzione C: quattro operazioni in un'unica sessione di prova
**C-01** Inventario e acquisizione di **un** modello per alberello, **uno** per cespuglio e **uno** per scaffali; scartare quelli che non superano silhouette/leggerezza o che portano a nuove autenticazioni/spese.  
**C-02** Assemblaggio degli arredi come istanze su una copia R5; conservare i contenitori già presenti quando riadattabili; inventario delle nuove mesh per categoria e matrice oggetto–zona A12–A16/A10–A11.  
**C-03** Primo render **HERO 1152×648 con camera identica** + un dettaglio laterale. Controllare che il modello non appaia arredato solo a sinistra e che vasi e alberi non riempiano tutta la visuale.  
**C-04** Correggere solo dimensioni/posizioni/materiali comprovati dalla prima prova; congelare script, assets e manifesto. Nessuna ulteriore ricerca aperta a cataloghi infiniti.

## 3 — R6D: vetri blu, basamenti metallici e podio

### 3.1 Inventario di partenza e proprietà
- Quattro radici `Portale • Curricolo`, `Portale • Esplora`, `Portale • Percorsi`, `Portale • Esperienze`; stessa disposizione tangenziale e stessa camera HERO.
- Lastre figlie `<nome> • vetro cobalto`, grafica originale e pannelli/materiali R2/R4; scritte/icone interne non devono essere ricreate come oggetti esterni.
- `ATLAS • podio ottagonale`, `ATLAS • bordo del podio`, `ATLAS • volume centrale`, marchio originale con provenienza verificata.
- I `PROOF R2 • fine slot lip` e i canali rimangono **archiviati** nel master; la nuova placchetta può coprirli/nasconderli *in render* senza ripetere booleane o perfezionare sezioni.

| Oggetto | Intervento esecutivo | Verifica |
|---|---|---|
| **D1 — 4 vetri** | Materiale blu-cobalto profondo con gradienti/riflessi fisicamente plausibili; bordi oro-bianco e accenti ciano solo presso il piede; non trasformare i portali in pannelli opachi o insegne | Quattro lastre percepite come *vetro monumentale*, non cartelloni; testi e simboli leggibili senza sovrapposizioni |
| **D2 — 4 basamenti** | **Una sola placchetta metallica bassa per ciascun pannello**, ottone/bronzato satinato, profilo caldo continuo e un leggero riflesso ciano sul vetro. Collocazione ricavata dalla **lastra effettiva** (non dal centro sbagliato della feritoia) e rotazione ereditata dalla radice | Esattamente 4 placchette, una per portale; nessun doppio zoccolo, taglio nel pavimento non visibile, nessuna nuova booleana |
| **D3 — podio ATLAS** | Variazione non distruttiva di materiali blu-notte e rugosità, bordi/anelli oro sottili continui; conservare geometria e logo inalterati | Podio basso, prezioso, capace di occultare parzialmente i due vetri centrali come nel riferimento; non cresce fino a coprire titoli |
| **D4 — regia riflessi** | Le sorgenti luminose devono riflettersi selettivamente sul pavimento; evitare doppie emissioni o falsi aloni giganteschi | Rilievo del piede senza illuminare uniformemente tutta la sala |

### 3.2 Specifica parametrica iniziale (candidata, non quote del JPEG)
- Basamento singolo: larghezza relativa alla lastra **1,1–1,4×**; spessore/altezza percepita **1–3% dell'altezza del vetro**; profondità sufficiente a coprire canale preesistente e posizione reale del pannello, senza occupare una superficie sproporzionata.
- Nella scena R2: lastra locale `y≈-0.25 BU` e canale locale `y≈0 BU`; **non** spostare il portale per farlo coincidere col canale. Mettere invece la placchetta in posizione da comprendere visivamente entrambi gli elementi.
- Applicare a tutte e quattro lo stesso componente parametrico istanziato, con materiali identici, evitando quattro modellazioni manuali divergenti.
- Colori e intensità sono **parametri di prova**, non codici esatti della fonte; l'effetto blu profondo / oro caldo / ciano sottile va controllato sulle immagini reali.

### 3.3 Produzione D: quattro operazioni in un'unica sessione di prova
**D-01** Fotografare HERO R5 prima della modifica e registrare le radici, la camera e le mesh/icone associate a ogni portale.  
**D-02** Applicare solo materiali e quattro placchette parametriche; oscurare (non distruggere) eventuali bordi/slit R2 rimasti visibili e ridondanti; **non** ricostruire feritoie o modificare il pavimento.
**D-03** Rielaborare la finitura del podio senza ridimensionarlo a priori; render HERO 1152×648 + dettaglio ravvicinato del basamento.  
**D-04** Revisione tecnica 4/4 lastre, 4/4 supporti, marchio originale invariato, icone presenti, invarianti di camera e posizioni; un solo ciclo mirato di correzione se necessario, quindi congelare variante D.

## 4 — Montaggio R6AB + C + D: una sola scena reale

**M-01:** recuperare [R6AB](https://drive.google.com/file/d/1Zf1YXbNQawiAUCR4M1a5Kgaoetix_-qO/view) verificandone lo SHA del `.blend`.  
**M-02:** verificare che C e D siano state prodotte a partire dal medesimo R5 (impronta certificata), con asset reali e ricevute PASS; applicare a **una copia R6AB** i livelli applicativi C e D, oppure importare soltanto le raccolte/oggetti di proprietà di C/D. **Mai sovrascrivere integralmente il master R6AB con la variante C o D.**  
**M-03:** ordine di composizione `R6AB → R6C → R6D`; preservare lucernario R6A e rivestimenti R6B, quattro radici dei portali, camera HERO e materiali. Conflitti riportati al proprietario della corsia e bloccanti prima del render finale.  
**M-04:** produrre tre immagini Cycles autentiche da **un solo** `.blend`: HERO comparabile all'originale, dettaglio arredi e dettaglio portali, con una tavola a confronto di ART-DIR-02 / R6AB / C / D / R6ABCD.  
**M-05:** registrare sorgente, commit, PR in bozza, SHA di tutti i file, licenze e dipendenze nel documento di montaggio, con ZIP in Drive e lettura dei metadati dopo l'upload.

## 5 — Criteri di accettazione vincolanti, in ordine

| Controllo | Evidenza minima / soglia | Chi decide |
|---|---|---|
| **Origine e riproducibilità** | JPEG canonico e R5/R6AB con SHA validati; ogni asset originale con licenza e impronta; nessun file non tracciato | Automatico |
| **R6C: differenziazione** | **Due famiglie botaniche effettivamente distinte**, vasi alti e bassi, librerie illuminate, 2 stendardi; niente copie dello stesso piccolo succulento per fingere alberelli | Tecnico + revisione artistica |
| **R6D: chiarezza portali** | 4 vetri, **4 placchette uniche**, nessun doppio supporto, logo e simboli originali conservati, camera e radici immutate | Automatico + revisione artistica |
| **Composizione** | C/D coesistono realmente con A/B nello **stesso Blender**, senza duplicazioni, geometrie di partenza perse o asset scollegati | Automatico |
| **Fedeltà artistica** | Confronto sulle **26 categorie**, priorità a atmosfera, monumentalità vetri, rapporto piante/vasi, gallerie con profondità, oro discreto; giudizio **umano** sull'immagine HERO | Ideatore |
| **Web e smartphone** | Solo dopo valutazione artistica positiva, esportare **una campata e un portale**, misurare dimensione GLB, memoria, fluidità, accessibilità e 4 accessi effettivi sul dispositivo. Mai dichiarare fluidità su base del solo Cycles | Prova reale + ideatore |

**Budget di sviluppo indicativo, non risultato misurato:** scegliere texture 1K (2K solo dove visibile in HERO); usare istanze, unire texture quando conveniente, rimuovere displacement e dettagli invisibili nel derivato web. Nel primo esperimento mobile provare a contenere le **risorse aggiuntive inizialmente caricate** entro circa 2–3 MB compressi; ridurre o caricare su richiesta se la misura supera il budget, senza sacrificare i quattro accessi. La dimensione finale dell'intera biblioteca va misurata, non stimata sommando gli ZIP Blender.

## 6 — Una sequenza breve con tre punti decisionali

1. **Prove C e D in parallelo:** un'acquisizione selettiva dei modelli, due script indipendenti, due coppie di render e le ricevute. Non ripetere studi generali sulla geometria o sui cataloghi.
2. **Prova integrata:** montaggio automatizzato A+B+C+D, una HERO e due dettagli, confronto ragionato in un'unica tavola. Se peggiora un settore, ripristinare *quel solo livello*.
3. **Decisione artistica e prova web:** un giudizio motivato su ART-DIR-02; soltanto dopo la scelta positiva, qualifica di una campata mobile e preparazione della pubblicazione (che rimane comunque soggetta ad autorizzazione separata).

## 7 — Output attesi e condizioni di arresto

**R6C:** `r6c_furnishings.py`, catalogo asset verificato, `atlas-r6c-furnishings.blend`, `hero.png`, `furnishings-detail.png`, `receipt.json`.  
**R6D:** `r6d_portals_podium.py`, `atlas-r6d-portals.blend`, `hero.png`, `portal-base-detail.png`, `receipt.json`.  
**R6ABCD:** `r6abcd_assemble.py`, master unico `.blend`, HERO + 2 dettagli + tavola comparativa + rapporto qualità + archivio Drive.  
**R6E:** giudizio indipendente separato e primo collaudo prestazionale web ove applicabile.

**Stato di questo documento:** piano consolidato, non affermare R6C/R6D completi prima dell'effettiva produzione e verifica. Nessun merge in main, nessun deploy, nessuna distribuzione agli studenti, nessun costo obbligatorio, nessun trasferimento dati personali.
