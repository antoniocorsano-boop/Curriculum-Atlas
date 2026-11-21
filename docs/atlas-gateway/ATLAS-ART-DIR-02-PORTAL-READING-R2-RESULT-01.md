# Atlas ART-DIR-02 — Esito della lettura correttiva dei quattro portali, R2

**Data:** 21 novembre 2026 · **Progetto continuativo:** ARCH-04 / ART-PROOF-01B · **Stato:** produzione e geometria verificate, **approvazione artistica negata in attesa di ulteriore confronto umano**. Nessun nuovo progetto, nessuna pubblicazione.

## 1. Catena di provenienza e file reali
- **Unica sorgente canonica**: [ART-DIR-02 JPEG approvato](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view) 1536×864, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe` (file riletto e hash nuovamente verificato).
- **PR di continuità:** [Curriculum-Atlas #152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152), ramo `work/atlas-gateway-01-foyer`. **Esecuzione finale verificata:** [GitHub Actions #44876788900](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44876788900), commit `ef39d027123c4f0aac96da9f2d1948b8741c1e95`, **SUCCESS**. Esecuzione precedente [#44875383727](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44875383727) SUCCESS, ma con vista zenitale occultata dalla copertura. Quest'ultima non va usata per valutare l'arco dei portali.
- [**Archivio integrale della revisione finale in Drive**](https://drive.google.com/file/d/1rN2O92uio8vXdAldXB5nhZmyGpLg-iXg/view), ZIP 9.214.461 byte, SHA-256 `c7a581f13092222fbdfcabc7630951b166e2b450b3c86e4ed527914ecefe5ac9`; include master, candidata geometrica, master artistico di origine, nuovo file Blender, 3 immagini Cycles, ricevute e GLB di riferimento storico. SHA-256 **.blend candidato corretto** `d477245479a29e39fcac5b08574f2465a3f404dda7b8d7c69fbd22c8f88badcb`.
- [**Tavola di confronto R2 vs immagine canonica**](https://drive.google.com/file/d/1Kt1NveSO73AlZg2oTtMafUjulh_FV7vH/view) (522.924 byte, SHA-256 `640b2ec7e1a14d26e68edfaa3cfa40144a17e72b7990ab23f640b609e84fc6b2`). La tavola accosta riferimento, HERO, OBLIQUE e **vista ortografica zenitale aggiornata**.
- Generatore invariato in origine, con [correzione esecutiva dei portali](../../scripts/atlas-gateway-production/art_proof_01b_portals_corrective.py), manifest geometrico [ARCH-04](./ARCH-04-ARCHITECTURAL-GEOMETRY-PROJECT-01.json) e [analisi canonica §15](./ATLAS-ARCH-VIS-REFERENCE-ANALYSIS-01.md).

## 2. Accertamento tecnico
- Centri dei pannelli definiti rispetto al podio `C=(0,-2)`, raggio di prova comune **R=7,30 BU**, quattro pannelli in coppie speculari. La curva originaria `C_old=(0,-6.3836)` non era concentrica alla cupoletta.
- Distanze e tangenzialità calcolate: coppia laterale `x=±5.95`, `y≈2.22936`; coppia centrale `x=±2.40`, `y≈4.89420`; `yaw=-asin(x/R)`. Errore di ortogonalità tangente/raggio **0** entro la precisione del manifesto.
- Rimossi i quattro zoccoli originali e i quattro piedi aggiuntivi della candidata ARCH-04B; creati **quattro intagli reali** tramite operazioni booleane sulla pietra del pavimento, con gole scure, bordini metallici minimali e parte inferiore dei vetri prolungata nell'incasso. I poligoni del pavimento sono passati da **82 a 106**. Questa variazione è un fatto tecnico, non una prova della qualità visiva.
- Tre immagini Cycles: **HERO** 1152×648, **OBLIQUE** 896×504, **TOP_ORTHO** 900×900. Nell'ultima esecuzione la telecamera TOP è stata abbassata sotto la copertura e ora mostra effettivamente pannelli, podio e pavimento: permette di riconoscere la configurazione ad arco e gli attacchi.
- Fonte, logo e geometrie precedenti conservati; file del nuovo modello separato; nessuna modifica del sito o integrazione in main. Prova realizzata sul file preciso, ricevuta hash verificata.

## 3. Risultato artistico del confronto
**Conferme della nuova interpretazione:** in pianta si vede finalmente una geometria di pannelli collegata alla circonferenza del podio e l'assenza di piedistalli autonomi; da davanti i portali rimangono pannelli distinti e l'intervento non distrugge la scena preesistente.

**Problemi aperti che impediscono l'approvazione:**
1. Nel **riferimento canonico** i portali sono grandi, avvolgono il podio e comunicano leggerezza emergendo quasi dal suolo. Nella HERO R2 risultano ancora **più piccoli e più arretrati** e la loro connessione con la feritoia è quasi invisibile.
2. La curvatura in **TOP_ORTHO** è matematica, ma i laterali hanno un angolo di circa `|asin(5.95/7.3)|=54.6°`, tale da far apparire l'insieme come una **V pronunciata** invece di un arco leggero. L'orientamento è corretto rispetto al cerchio scelto; non significa che il **raggio scelto** sia esteticamente corretto.
3. La vista HERO non è ancora un buon corrispondente dell'ART-DIR-02: altezze apparenti dei pannelli, ampiezza dell'arco, relazione cupoletta/portali e composizione del lucernario non coincidono; la correzione geometrica isolata non può risolvere da sola materiali, rays, riflessi e arredi.
4. La prova zenitale aggiornata è un'ottima diagnostica, ma non sostituisce un **dettaglio sezionato del piano di posa** per verificare che la lastra entri davvero nel canale e vi rimanga visivamente credibile.

**Esito:** `GEOMETRY_PASS__ARTISTIC_NOT_APPROVED`. L'ipotesi della **concentricità è realizzabile** in Blender ed è testata, ma il suo raggio attuale e la composizione non sono qualificati come fedeli all'immagine. Non confondere prova geometrica con risultato desiderato.

## 4. Sequenza correttiva senza ripartire da zero
Nella **stessa scena ART-PROOF-01B** e nello stesso ramo PR #152:
- bloccare identità, grafica, materiali, luce, cupoletta e immagine originale;
- calibrare **insieme raggio dell'arco R, angoli degli estremi, dimensioni apparenti dei quattro pannelli e posizione/focale della telecamera** usando i rettangoli canonici e la relazione fisica col podio, non il solo centro comune;
- effettuare un riscontro specifico in **TOP** (forma dell'arco), **HERO** (proporzioni percepite), **OBLIQUE** (parallasse) e **SEZIONE DI POSA** (feritoia e vetro);
- una volta ottenuto un chiaro miglioramento, sottoporlo alla revisione artistica umana, senza anticipare il rilascio web.

Il lavoro precedente rimane la base storica e funzionale, non è stato abbandonato. **Nessuna approvazione automatica, nessun rilascio.**
