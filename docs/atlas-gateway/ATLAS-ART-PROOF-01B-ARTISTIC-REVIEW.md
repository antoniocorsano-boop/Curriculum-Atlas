# ATLAS ART-PROOF-01B — Collaudo artistico su due rendering Cycles
**Data:** 21 novembre 2026 · **Esito tecnico:** PASS · **Esito artistico:** NON SUFFICIENTE PER APPROVARE IL GATEWAY 3D · **Decisione umana finale:** APERTA

## 1. Produzione effettiva verificata
- [**GitHub Actions #44872186496**](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44872186496): esecuzione **SUCCESS**. Blender **5.0.1**: modello ARCH-04B ricostruito in copia, modalità solo geometria; il programma artistico genera un file `.blend` indipendente e due immagini Cycles effettive, senza modificare il master precedente.
- Sorgente canonica invariata: [ART-DIR-02 JPEG 1536×864](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`. Nessuna foto canonica viene usata come superficie piana della scena Blender.
- **HERO**: 1280×720, 32 campioni, SHA-256 `fb0b02b21bf4bfd3b16c98a563738c3429bd12b99cabb9c0e39d6d41b3e44efc`.
- **Obliqua 3D**: 1024×576, 24 campioni, SHA-256 `1e590e2cf516dbd88a61506d77b91fc4f71b1eacb0fc884dbadaa161f8b40e39`.
- `.blend` artistico: SHA-256 `ebe34b412d4d2a28035126c440a41962e14043947e7a1ef9da7d87193dd6c1e3`. Sorgente geometrica indipendente SHA-256 `f5442cdbaa76c95173d0d49c605ff709038382b1384cd2eb1cf699907f994c03`.
- [**Archivio ZIP in Drive, 7.382.788 byte**](https://drive.google.com/file/d/1AUkGQjGVD6OH0VUPQkhJySCBJSiRE-P4/view), digest ZIP `9b6902c9a3185ddda5be90d7393b90b4a9592031bcb75ef73c17a86d2c4650ae`; contiene il file Blender, le due immagini, il materiale sorgente, il generatore delle geometrie e le ricevute. Upload e dimensione riletti.
- [**Confronto a quattro viste in Drive, 688.460 byte**](https://drive.google.com/file/d/1Q8taZLAt-qcjQcwntue4aYmXTxh-u48Z/view), SHA-256 `948bd56e2f329ebd8c6c29e8cb27bed21d4888c6eb44b5fed863f3f640457d8c`: immagine ART-DIR-02, nuova HERO, vecchia ARCH-04B e vista obliqua. Rilettura metadati confermata.

## 2. Miglioramenti artistici realmente visibili rispetto ad ARCH-04B
- Quattro portali con **titoli e sottotitoli esatti** e quattro illustrazioni distinte; le illustrazioni sono mesh/curve/figure realmente collocate in coordinate tridimensionali.
- Maggiore presenza di riflessi sul podio e sul pavimento, cornici più luminose, variazioni dei toni del vetro blu, illuminazione più articolata delle gallerie.
- Migliore lettura dell'oculo rispetto all'ARCH-04B precedente, pur restando una geometria e resa diverse dal fotogramma canonico.
- La camera obliqua mostra reale **parallasse** dei portali, della sala, del podio e del globo; il risultato non è una semplice fotografia piatta applicata a una parete.

## 3. Insufficienze determinanti rispetto ad ART-DIR-02
1. **Regia luminosa:** la fonte approvata ha raggi zenitali chiaramente visibili, effetti di chiaroscuro stratificati, punti caldi differenziati e riflessi fisicamente integrati; il nuovo render ha luce diffusa relativamente piatta e fasci atmosferici poco percepibili.
2. **Lucernario/corona:** il fotogramma mostra cielo e nervature reali con una corona d'ottone luminosa sottile; il Blender attuale legge come grande superficie opaca chiara e tetto a costole scure.
3. **Portali:** contenuti distinguibili ma reinterpretati in forma semplificata, e dimensioni/quote sul fotogramma differenti dalla sorgente. Non è riproduzione esatta di simboli, illustrazioni e tipografia.
4. **Materialità:** ottone, pavimentazione, vetro e calotta non raggiungono la brillantezza, microstruttura e profondità della fonte; i riflessi appaiono come macchie ampie e chiare, non una composizione di scie luminose e ombre.
5. **Architettura e arredo:** reticolo dei due ballatoi troppo regolare, scaffalature non sufficientemente definite, piante e drappi semplificati, lateralità scenografica meno ricca.
6. **Composizione:** i portali della HERO risultano piccoli e più bassi nel fotogramma rispetto alla fonte; la zona superiore della sala domina. Il podio presenta proporzioni migliori ma richiederebbe ancora una rimodellazione della disposizione e della regia per essere equivalente.

## 4. Giudizio e proposta conseguente
**Fattibilità geometrica/tecnica del 3D: dimostrata** nel limite di una sala Cycles con due telecamere e asset autonomi.  
**Equivalenza artistica di ART-DIR-02: NON DIMOSTRATA.** Il risultato è visibilmente migliore del precedente, ma ancora distante dal livello d'immagine approvato. Una singola prova negativa non dimostra l'impossibilità generale di creare un prodotto di qualità simile; dimostra che questo processo non l'ha ancora raggiunta.

**Raccomandazione di prodotto:** non avanzare automaticamente da questa prova a nuove microcorrezioni ARCH-04C, né pubblicare il rendering come porta Atlas; **conservare il prototipo A basato sull'immagine canonica come riferimento operativo di alta qualità** e riservare la scena Blender a studi visivi circoscritti o ai mondi didattici realmente tridimensionali. L'eventuale investimento in una pipeline 3D cinematografica completa richiede una decisione artistica/di scopo distinta, fondata sulla differenza osservabile tra immagine e render.

## 5. Governo e stato
- Stato formale: `RENDERED_TECHNICAL_PASS__ARTISTIC_NOT_APPROVED__HUMAN_DECISION_PENDING`.
- **Nessuna** pubblicazione studenti, modifica dell'immagine canonica, esportazione/integrazione GLB runtime o fusione della PR in main.
- Riferimenti: [protocollo ART-PROOF-01](./ATLAS-ART-PROOF-01-PROTOCOL.md), [contratto decisionale](./ATLAS-ART-PROOF-01-DECISION.json), [ARCH-04B precedente](./ARCH-04B-CONSTRUCTION-RESULT-01.md), [PR Atlas #152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152), [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354).
