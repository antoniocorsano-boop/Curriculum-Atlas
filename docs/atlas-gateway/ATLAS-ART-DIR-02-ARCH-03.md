# ATLAS-GATEWAY — ART-DIR-02 / ARCH-03
## Revisione geometrico-compositiva e verifica effettiva — 21 novembre 2026

**Stato:** candidata 3D tecnicamente prodotta e verificata, **NON APPROVATA ARTISTICAMENTE**. Nessuna fusione su `main`, nessuna distribuzione al pubblico/studenti.  
**Fonte artistica vincolante:** [JPEG ART-DIR-02 canonico](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), 1536×864, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`; [landmarks canonici](./ART-DIR-02-CANONICAL-LANDMARKS.json).  
**Provenienza:** [ARCH-02](./ATLAS-ART-DIR-02-ARCH-02.md) e [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md); versione precedente conservata e non modificata.  
**Script Blender:** [rebuild_architecture_03.py](../../scripts/atlas-gateway-production/rebuild_architecture_03.py).  
**Verifica automatizzata:** [atlas-art-dir-02-architecture-03.yml](../../.github/workflows/atlas-art-dir-02-architecture-03.yml); [esecuzione finale #44864929377](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44864929377), commit `e08517198188a9bdb6a6e3b3e7cc0fead4e5dccd`, PASS, 10/10 fasi superate.

### Analisi delle cinque correzioni e risultati

| Componente | Diagnosi da ARCH-02 e fonte | Correzione implementata | Esito dalla prova reale / residuo |
|---|---|---|---|
| **1. Volta e lucernario** | Un unico tetto scuro assorbe l'attenzione; il cielo è separato architettonicamente. | Copertura discontinua modellata in **18 pannelli con aperture reali** e travi radiali, raggio interno dell'oculo **7,65**, corona 3D autonoma; nessuna fotografia applicata a un pannello frontale. | La massa scura è più articolata, ma il lucernario risulta **troppo tagliato nella HERO R2**. Necessaria una riprogettazione ottica e luminosa prima di approvazione. |
| **2. Portali** | L'ingombro proiettato dei quattro accessi è sottodimensionato e troppo basso. | Riposizionamento reale dei root 3D (`Curricolo -5,90; Esplora -2,40; Percorsi +2,40; Esperienze +6,00`, Y distinto), scala comune X 1,20, Z 1,00; calibrazione telecamera HERO `lens=30`, mira Z 2,05. | Nella HERO lo **scostamento medio assoluto delle 16 coordinate normalizzate** rispetto al riferimento è passato da **0,05451456** (ARCH-03 R1) a **0,01189719** (R2), miglioramento **78,2%**. Si tratta solo di confronto dei rettangoli proiettati, non di riconoscimento semantico o qualità PBR. |
| **3. Gallerie** | Parapetti presenti, ma ripetizione meccanica di nicchie e superfici blu scure. | 14 campate con profondità alternate, due piani reali, aperture laterali, elementi espositivi contenuti, due fioriere e geometria vegetale essenziale. | Struttura 3D verificata; la densità di dettaglio e l'illuminazione dei laterali non sono ancora comparabili all'originale. Necessario modulo scenografico professionale, non aggiunta indiscriminata di oggetti. |
| **4. Basamento** | Cupola troppo larga e poco espressiva sul piano prospettico. | Calotta ellittica semiasse **3,58 × 2,38**, base Z 0,58 e altezza 1,59, conservando gli anelli più ampi e il **marchio originale curvato mediante UV**; anteprima di ceramica blu-nera satinata. | Silhouette più equilibrata e marchio identificabile; mancano riflessi credibili, pavimento levigato articolato e vera integrazione luminosa. Il materiale è **solo una prova**, non uno standard artistico approvato. |
| **5. Telefono** | Una sola vista verticale comprime quattro accessi in testi piccoli; il primo tentativo ravvicinato tagliava i pannelli. | Tre camere: verticale complessiva e **due viste focali sinistra/destra**, con focale corretta a **32 mm** per le viste ravvicinate. | I due portali dei rispettivi gruppi sono interamente visibili: sinistra `Curricolo x=.028–.502`, `Esplora x=.471–.910`; destra `Percorsi x=.090–.529`, `Esperienze x=.512–.985`. I controlli effettivi su touch/WebGL **non sono stati ancora realizzati**. |

### Evidenze prodotte, conservate e verificate

- [ARCH-03 R1 — archivio Blender e cinque rendering](https://drive.google.com/file/d/1JIdgIWBnLbGol_HUsj8KgswewWk4djSz/view) (storico; 6.777.121 byte).
- [ARCH-03 R2 — modello Blender, cinque viste, receipt e baseline](https://drive.google.com/file/d/198kW2iGTwP5jrKJnmp-ATA8-l_fiO_EQ/view) (candidata attuale; **6.775.879 byte**).
- [Confronto comparativo canonico, ARCH-02, ARCH-03 R1 e R2](https://drive.google.com/file/d/12Lo3KHFQCwrF5XDeq3E2YrHdpXKyZZBA/view) (445.312 byte).
- [Confronto mobile: quattro portali e due dettagli focali](https://drive.google.com/file/d/1l1rzPUsZeGB0Wc140YvcriwWABUYDkL6/view) (246.305 byte).
- GitHub Actions R2 artefatto `14691810299`, SHA ZIP dichiarato da Actions `0dddb6d3e0031c4a52072014d384a77109c7ce61abc05f07a7c437ef338d92da`; la `architecture-receipt.json` interna contiene SHA-256 indipendenti del master originale, master candidato e cinque rendering.

### Limiti e decisione

**L'allineamento delle sagome dei portali migliora nettamente; la qualità visiva del riferimento non è ancora raggiunta.** Resta da progettare e qualificare il `VIS-01` dedicato a:

1. **Luce zenitale e oculo:** cielo credibile nella HERO, fascio naturale coerente con la struttura e non un disco fotografico sospeso.
2. **Portali informativi:** composizioni volumetriche specifiche (curricolo, esplorazione, percorsi, esperienze), senza duplicare le etichette operative web, senza appiattire la scena a immagine.
3. **Materiali/illuminazione architettonica:** vetri e ottone satinato con proprietà fisicamente plausibili, riflessi del pavimento e differenziazione visiva delle gallerie.
4. **Verifica prestazioni:** separare master Cycles da derivato GLB ottimizzato; nessuna equivalenza automatica tra shader Cycles e glTF. Prova WebGL e usabilità fisica su smartphone prima di G1.

La prova ha utilizzato Cycles 16 campioni con denoising, adatta a diagnosticare i volumi ma non a deliberare la qualità finale. Non sono stati realizzati export `runtime`, messa online o test fisici del dispositivo. **ARCH-02 e ARCH-03 R1 restano recuperabili e non vengono sovrascritti.**

Per le fasi successive utilizzare la documentazione ufficiale delle [telecamere Blender](https://docs.blender.org/manual/en/3.6/render/cameras.html) e delle [limitazioni dell'esportatore glTF](https://docs.blender.org/manual/en/3.6/addons/import_export/scene_gltf2.html).

**Governance:** [Atlas #151](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/151), [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354), [PR #152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152).