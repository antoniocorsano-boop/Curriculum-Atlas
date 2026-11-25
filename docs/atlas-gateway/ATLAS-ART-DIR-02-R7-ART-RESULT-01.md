# ATLAS ART-DIR-02 — R7: prova artistica controllata, valutazione e archivio

**Data:** 21 novembre 2026. **Stato:** `TECHNICAL_PASS__PARTIAL_ART_IMPROVEMENT__ARTISTIC_NOT_APPROVED`.  
**Fonte artistica immutata:** [JPEG ART-DIR-02](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.  
**Lettura fonte:** [VISUAL-READING-02](./ATLAS-ART-DIR-02-VISUAL-READING-02.md) con 26 elementi e 16 relazioni.  
**Revisione E sulla R6ABCD:** [PR #166](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/166), [rapporto di revisione](https://github.com/antoniocorsano-boop/Curriculum-Atlas/blob/work/atlas-artdir02-r6e-assurance/docs/atlas-gateway/ATLAS-ART-DIR-02-R6-INDEPENDENT-REVIEW.md). La revisione è funzionalmente separata dalla produzione; non costituisce un nuovo valutatore umano indipendente.

## 1. Materiali e provenienza verificata

**Base concreta:** vero master Blender R6ABCD `atlas-art-dir02-r6abcd-integrated.blend` SHA-256 `33768584496e16b7a545f236b6ac3a5da3231358547870f03f79815f54c0fa4d`, proveniente dalla [PR #165](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/165), non scena ricostruita da zero.

**Intervento specialistico:** [PR #167 R7](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/167), ramo `work/atlas-artdir02-r7-art-light`, script `scripts/atlas-gateway-production/r7_art_light_proof.py` e workflow `.github/workflows/atlas-art-dir02-r7.yml`.

| Prova effettiva | Esito tecnico | Archivio e impronte |
|---|---|---|
| **R7 iniziale** ([Actions #44940194976](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44940194976)) | SUCCESS, due vere immagini Cycles | [ZIP prima prova](https://drive.google.com/file/d/1GUcYWTtvIP4FmoMUBUacrwTu9GiG-SyO/view) 15.834.610 B, SHA-256 `546d7703936b23791d8522f593678cdc1dee00b91281c63a82627b6eaec25b91`; .blend SHA `0fa679052750b165b890f64f81a5b598ff0118d8f4c5864c0ca06b4418d734fe` |
| **R7 corretta** ([Actions #44940701200](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44940701200)) | **SUCCESS**, sorgente + modello + camera/radici/CC0 + due immagini effettivamente verificate | [ZIP definitiva di prova](https://drive.google.com/file/d/1wwzdaMIZFTBELKYgGIFCHsjo7nezclWI/view) 15.833.121 B, SHA-256 `6f218e70c1624c6798a68cc10b7a1270497fb363808e80b9045346a6870ba396`; .blend SHA `4fb946a52b2c2c15e1a42643cf210e9a45c77428c3b9c63bb557d36c6f8a71dc` |

**Copia originale di ogni fase conservata in Drive, stessa cartella dell'immagine canonica.** Metadati e dimensioni dei tre nuovi archivi/immagini R7 corretti verificati dopo l'upload. Non sono stati prodotti file GLB di pubblicazione né nuovi modelli esterni.

**Confronto diretto:** [ART-DIR-02 originale / R7 corretta](https://drive.google.com/file/d/1OnZudpNXt_cZsyl3a6GxKt-eWuSyBzoH/view), 474.228 B, SHA-256 `b63b48743d914fd02c1c9750607ef305cd39e27a8cd8e9a4f21f0f408b323d93`.  
**Storico a quattro viste:** [ART-DIR-02 / R6ABCD / R7 iniziale / R7 corretta](https://drive.google.com/file/d/1O7CP_deevAWaIFiBZtRvwIkAOlu149Ea/view), 420.976 B, SHA-256 `1edee92c8a4d31e4678e21ec5f94045426648332ffbf93f59784df6d776d4e97`.

## 2. Interventi realmente applicati, senza nuova scenografia

1. **Volta:** preservate ma nascoste al rendering le 18 superfici radiali ARCH04, sostituite **percettivamente** da un'unica pelle curva continua blu-grafite che segue la formula geometrica originale della volta. Niente nuove nervature o travi d'acciaio.
2. **Lucernario:** mantenuto il cielo con texture originale incorporata nel master; aggiunti un unico collare scuro e un'unica linea ottica oro-ambra. **Difetto scoperto nella prima prova:** linea a z=8,486 BU, nascosta dal collare opaco a z=8,455 dalla vista inferiore. **Correzione effettiva nella seconda prova:** linea a z=8,405 BU, quindi visibile e realizzata con shader emissivo puro; non sono stati aggiunti altri anelli.
3. **Luce zenitale:** utilizzati i sette veri volumi atmosferici già presenti, ridotta la densità nella correzione successiva e regolata l'area luminosa superiore. Rimangono esclusivamente effetti da Blender Cycles non ancora trasferiti al browser.
4. **Vetri:** riassegnati i materiali delle quattro lastre autentiche a un cobalto più scuro e meno emissivo, senza cambiare le quattro radici, i simboli originali, le quattro singole basi metalliche già approvate o la telecamera.
5. **Pavimentazione:** scurito e lucidato l'autentico materiale CC0 Onyx013 lavorando sulla sua miscela e rugosità, conservando mappe e normali originali; non sono stati aggiunti falsi LED sul pavimento.
6. **Podio:** rugosità e tinta blu scuro controllate, logotipo approvato conservato.
7. **Arredi:** preservate tutte e tre le collezioni di veri modelli CC0 importati nella R6C, senza nuovi acquisti o duplicazioni di modelli.

## 3. Valutazione artistica della R7 corretta contro ART-DIR-02

**Miglioramenti reali:** il soffitto non presenta più una gabbia radiale dominante; il nuovo anello oro è visibile in continuità; la pietra torna più profonda e meno uniforme; la prova resta una vera architettura 3D ricostruibile.

**Difetti artistici ancora determinanti:**
- **L'oculo** continua a sembrare un disco azzurro sospeso in alto, anziché un'apertura integrata in una volta concava con cielo abbagliante. La corona visibile è un miglioramento locale, non la soluzione completa.
- **I raggi** rimangono troppo simili a una cortina verticale omogenea; il riferimento li distribuisce con gradiente atmosferico più sottile e una sorgente altissima.
- **I quattro pannelli** hanno ancora un effetto da cartello luminoso blu chiaro, poco traslucido e meno monumentale del canonico. La profondità cromatica cresce, ma la composizione e il rapporto fra corpo del vetro, bordo e sfondo sono insufficienti.
- **Le gallerie** sono grigie, sovraesposte in molte zone, e le librerie reali dietro il parapetto sono scarsamente percepibili. Le due famiglie vegetali sono presenti, ma ancora esili.
- **Il podio** resta troppo riflettente in alcune zone e ha superfici e anelli più semplici del riferimento. Le alte luci bianche sul pavimento hanno una geometria poco convincente.
- La HERO Blender non contiene il vero pulsante HTML «Entra in Atlas», che va verificato nel sito e non aggiunto al modello 3D.

**Esito di arte:** `NOT APPROVED`. Non promuovere R7 a master definitivo; resta una **variante artistica tecnicamente qualificata e reversibile**.

## 4. Riscontro comparativo di luminosità

Stessa proporzione d'inquadratura 16:9 e zone normalizzate equivalenti per original JPEG e HERO Cycles. Valori medi indicativi Y' 8-bit `0,2126R + 0,7152G + 0,0722B`. Non sono valori radiometrici e **non misurano da soli la somiglianza**.

| Regione | Canone | R6ABCD | R7 prima | R7 corretta |
|---|---:|---:|---:|---:|
| Volta 5–95% × 5–23% | 69,4 | 88,2 | 97,1 | 97,5 |
| Gallerie 2–98% × 20–40% | 70,0 | 79,8 | 88,4 | 85,1 |
| Area portali 10–90% × 30–62% | 80,7 | 109,1 | 108,4 | 103,6 |
| Pavimento 6–94% × 78–97% | 80,2 | 97,1 | 83,6 | 82,6 |
| Intero fotogramma | 75,4 | 92,1 | 91,9 | 89,9 |

**Interpretazione prudente:** il pavimento ora è meno chiaro e l'area portali migliora moderatamente; la zona alta risulta più luminosa a causa di cielo/raggi, ma non è ancora più fedele perché conta anche l'inquadratura dell'oculo. Dunque non dichiarare progresso artistico generale tramite questi soli numeri.

## 5. Prossima decisione produttiva

Non ricominciare modellazione dell'atrio e non acquisire nuovi asset. **Fermare la proliferazione di varianti autonome**: selezionare una composizione derivata dal master integrato già versionato e una valutazione visiva umana, quindi concentrare una sola lavorazione professionale su **architettura percepita del lucernario e ridistribuzione della luce sulle gallerie/portali**, con prova HERO invariata. La dimensione assoluta dell'oculo non è ricavabile dalla foto sintetica: non inventare quote. Evitare di promuovere la PR principale o la resa Web prima dell'approvazione artistica.

**Stato rilascio:** PR #152, #165, #166, #167 restano in bozza. Nessun merge su main, nessun deploy, nessuna disponibilità per gli studenti o approvazione automatica. Il test GLB su smartphone reale è ancora da eseguire solo quando esiste una scena artisticamente candidata; nessun dato personale trattato.
