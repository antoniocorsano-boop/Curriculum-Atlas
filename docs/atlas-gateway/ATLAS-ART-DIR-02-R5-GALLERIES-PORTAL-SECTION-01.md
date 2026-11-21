# ATLAS ART-DIR-02 — R5, riuso degli arredi e studio della sezione dei portali

**Data:** 21 novembre 2026 · **Stato:** `R5_FINISHINGS_IN_CI__PORTAL_SECTION_DESIGN_ONLY`.
**Fonte superiore:** [immagine canonica ART-DIR-02](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.
**Continuità:** R2 geometria vetrata → R4 PBR/vegetazione CC0 → **R5 finiture di galleria e sezione costruttiva**, senza iniziare una scena alternativa.
**PR/controllo:** [Curriculum-Atlas PR #152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152) / [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354).

## A. Studio della sezione: un difetto costruttivo mascherato dalla prospettiva

Il precedente script [R2](../../scripts/atlas-gateway-production/art_proof_01b_portals_corrective.py) genera una vera feritoia booleana nel piano in pietra, ma *la lastra* resta lateralmente sfalsata rispetto alla feritoia e non entra in profondità nel canale.

Sorgenti: [master originale](../../scripts/atlas-gateway-foyer/blender_master.py), con `rounded_slab(... "vetro cobalto", 2.79,4.60,.055,.28,-.25,2.72,...)`; R2, con `slot_depth=.18`, cutter a `y=0` rispetto alla radice del portale, `root.z=-.16`, abbassamento del bordo inferiore `-.30`.

| Parametro nel sistema locale del portale | R2/R4 (fatto dal codice) | Studio correttivo (non ancora applicato) |
| --- | ---: | ---: |
| Centro feritoia, asse locale Y | 0,000 BU | -0,250 BU |
| Bordi feritoia Y | -0,090 / +0,090 BU | -0,340 / -0,160 BU |
| Centro lastra Y | -0,250 BU | -0,250 BU (invariato) |
| Semispessore lastra | 0,0275 BU | 0,0275 BU |
| Intervallo lastra Y | -0,2775 / -0,2225 BU | invariato |
| Distanza minima orizzontale | **0,1325 BU** | **0 BU, lastra contenuta nel canale** |
| Bordo inferiore vetro Z (approssimato dal codice) | -0,040 BU, al pavimento | -0,100 BU, nel canale |
| Fondo del taglio pavimento Z | -0,140 BU | -0,140 BU |
| Fondo/inserti scuri | superficie della piastrina circa -0,110 BU | da mantenere, con vano per diffusione LED |

**Conseguenza:** il successo dei controlli `floor_BOOLEAN` non dimostra l'inserimento del vetro; il codice verifica la topologia del pavimento, non l'intersezione vetro/canale. Non descrivere R2/R4 come se possedessero già la posa costruttiva corretta.

[**Sezione vettoriale di studio A/B, derivata dai parametri dei due script**](https://drive.google.com/file/d/1nb04nf6VpTHWQghAw4dhdr9w6j5hOlP5/view). Le quote sono **unità del modello Blender**, NON misure esecutive, e l'ipotesi B non costituisce un nuovo asset approvato. Conservare il file a corredo della PR e della chat.

### B. Correzione minima da provare in copia diagnostica

1. Non spostare radici, dimensioni apparenti o grafiche dei quattro portali; non ricalibrare di nuovo R2/R3A e non aumentare i basamenti.
2. In una **nuova copia della scena artistica prima del taglio** ripetere i quattro tagli con la stessa larghezza tangenziale e profondità, ma con centro asse locale **Y = -0,25 BU**, in corrispondenza del piano mediano delle lastre; spostare nello stesso modo inserto scuro e due sottili bordi metallici. Non eseguire una seconda booleana su R4 lasciando la vecchia feritoia.
3. Allungare solo la zona terminale bassa della lastra fino al piano `Z≈-0,10 BU`; non traslare l'intero pannello, né i testi, né le immagini. Verificare materiale emittente caldo del canale e vetro blu mediante vera luce, non tramite falso piedistallo.
4. In Blender produrre una **sezione verticale perpendicolare al piano del vetro**, una vista obliqua a quota pavimento e una vista HERO identica alla precedente. Usare `Boolean / Intersect` in copia diagnostica, o taglio di mesh con bisettore: il master artistico rimane integro.
5. Verificare in coordinate 3D: `glass_y_min<=slot_y_max` e `glass_y_max>=slot_y_min`, `glass_bottom_z<floor_top_z`, `glass_bottom_z>inlay_surface_z`, taglio unico per lastra, assenza di sostegni autonomi, nessuna regressione di visibilità/funzionamento.
6. L'artista giudica gli artefatti reali prima della promozione. Correggere il **contatto funzionale** è giustificato; è diverso dal perfezionamento geometrico fine sospeso dall'ideatore.

## C. Nuova priorità artistica R5: rivestimenti e arredi

Il master R4 contiene già **Onyx013** e **Metal010** di ambientCG e **Potted Plant 04** originale di Poly Haven, tutti CC0, con ricevute e dipendenze archiviate in [Drive](https://drive.google.com/file/d/1ecf0SAB-N2orpwzeoMyMAKN-LkM71G8W/view). R5 opera soltanto su copia di questo master:

- **Pareti, rientranze, moduli di fondo:** stesso PBR CC0 con tinta blu-notte meno piatta e rugosità maggiore. Usare mesh architettoniche già presenti.
- **Balconate e parapetti:** metallo bronzato satinato su corrimano, bordo delle gallerie e raccordi; mantenere la geometria originale del vetro architettonico.
- **Due fioriere principali:** ridimensionare automaticamente, in base ai limiti geometrici del vero modello Poly Haven, le istanze esistenti per presenza visiva più appropriata, senza fabbricare nuovi alberi da primitive.
- **Gallerie superiori:** due istanze più piccole del medesimo modello CC0 su superfici esistenti; nessun nuovo catalogo o costo, geometria condivisa.
- **Illuminazione:** conservare il sistema della scena R4 durante il confronto, affinché eventuali differenze dipendano da materiali e arredi. Lavorare su luci e riflessi solo dopo aver osservato il primo risultato.
- **Rete e smartphone:** non trasferire il `.blend` Blender o le texture originali integrali direttamente nel web. Prima qualificare la resa Cycles; successivamente un'unica campata optimizzata GLB nel Three.js già usato da Atlas.

### Produzione e collaudo

- Codice: [upgrade_finishings_r5.py](../../scripts/atlas-gateway-production/upgrade_finishings_r5.py).
- Procedura: [atlas-finishings-r5.yml](../../.github/workflows/atlas-finishings-r5.yml).
- Prima esecuzione: [GitHub Actions #44927533472](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44927533472).
- Prove: materiali/mesh reali e loro quantità, quattro istanze verdi da un modello CC0, conservazione delle quattro trasformazioni delle radici, audit numerico in sezione, foto Cycles HERO e dettaglio galleria, impronte integrità.
- **No promozione automatica:** quattro pannelli corretti in pianta non bastano, il giudizio di fedeltà ART-DIR-02 resta umano. La prova R5 di *finiture* non dichiara di aver corretto la sezione.

**Vincoli:** zero spese obbligatorie, nessuna fusione in main, nessuna distribuzione agli studenti, nessun caricamento dati personali. Ogni asset deve rimanere ricostruibile e collegato all'archivio Drive e all'origine della chat.
