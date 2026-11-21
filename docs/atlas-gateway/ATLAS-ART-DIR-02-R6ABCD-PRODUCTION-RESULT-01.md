# ATLAS ART-DIR-02 — R6ABCD: produzione unica, evidenze e giudizio artistico

**Data:** 21 novembre 2026. **Stato:** `TECHNICAL_PASS__ARTISTIC_NOT_APPROVED`.  
**Sorgente artistica immutata:** [ART-DIR-02 JPEG canonico](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), 1536×864 pixel, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.  
**Lettura autorevole:** [VISUAL-READING-02](./ATLAS-ART-DIR-02-VISUAL-READING-02.md); il confronto artistico resta subordinato alle 26 schede e 16 relazioni, non alle sole prove automatiche.

## 1. Quattro contributi autentici e un solo modello tridimensionale

| Lavorazione | PR | Collaudo effettivo | Archivio delle prove |
|---|---|---|---|
| **R6A** cielo, lucernario e volta | [#160](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/160) | [#44934521917](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44934521917) PASS | [Drive](https://drive.google.com/file/d/1_yHh7vXFS2zzz98JxwYXLDgOogiOm5Wy/view) |
| **R6B** gallerie, ringhiere, pilastri e giunti | [#161](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/161) | [#44934525743](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44934525743) PASS | [Drive](https://drive.google.com/file/d/136t-ne0Pa1zjIlXEoO8RpMs-lBmABa5J/view) |
| **R6AB** prima scena unificata | [#162](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/162) | [#44935005743](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44935005743) PASS | [Drive](https://drive.google.com/file/d/1Zf1YXbNQawiAUCR4M1a5Kgaoetix_-qO/view) |
| **R6C** due famiglie botaniche, vasi, librerie, stendardi | [#164](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/164) | [#44937611169](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44937611169) PASS | [Drive](https://drive.google.com/file/d/1D_k-v4i4w9j0gQB36cBxX5xUwmY2m3PF/view) |
| **R6D** quattro pannelli, quattro basi metalliche luminose, podio | [#163](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/163) | [#44937201135](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44937201135) PASS | [Drive](https://drive.google.com/file/d/1fEEUWsk20bVZ4ny24FLb6bvaCdARc24Z/view) |
| **R6ABCD** composizione effettiva di A+B+C+D | [#165](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/165) | [#44938236317](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44938236317) **PASS** | [Master finale candidato, 16.707.544 byte](https://drive.google.com/file/d/1eK5W_OcBEWa86vrN9r8CMLaAToVS-_Zj/view) |

**Non è un collage:** il montaggio ha aperto il master R6AB vero, importato tre collezioni origine CC0 e le istanze R6C e gli otto oggetti R6D, poi applicato i materiali C/D alle mesh esistenti. Ha prodotto **un unico .blend**, tre render Cycles e un rapporto verificato. I quattro portali hanno mantenuto le radici, i materiali già presenti da A/B non sono stati sovrascritti indiscriminatamente.

- SHA-256 del **master integrato Blender**: `33768584496e16b7a545f236b6ac3a5da3231358547870f03f79815f54c0fa4d`.
- ZIP GitHub Actions e Drive: `d9e86a9cd1713c3ff16d5c9f0cb65d486941d8878e08a0bfb9e88757dceb0664`.
- R6C: 18 oggetti inseriti; due alberelli Pachira, due gruppi di fogliame `Potted Plant 02`, quattro moduli scaffale, due piante secondarie, quattro vasi metallici e due stendardi; sorgenti CC0 ufficiali e dipendenze archiviate.
- Triangoli dopo alleggerimento dei **modelli sorgente**: Pachira 22.993, Potted Plant 02 17.998, Wooden Display Shelves 01 3.174; gli oggetti utilizzano istanze, non copie indipendenti delle mesh.
- R6D: **esattamente quattro** placchette metalliche basse, quattro sottili bordi luminosi come parte degli stessi supporti e quattro vetri esistenti con materiali aggiornati; logo ATLAS originale conservato, otto vecchie labbra metalliche R2 nascoste; nessuna nuova booleana sul pavimento.
- **Confronto visivo verificato** [ART-DIR-02 originale / R6ABCD HERO](https://drive.google.com/file/d/1QK8kBMNto49tjJ7tkBJINVvzIpcpEnyv/view), 2304×702 pixel, JPEG 703.428 byte, SHA-256 `b96de05f0b66a8e75bad8a1829e4397c0f50bb6d07ccd5aa5e9299e92980da04`.
- Sorgenti originali, hash, ricevute e documentazione conservati; gli archivi di Drive sono stati **letti nuovamente a livello di metadati** e risultano collocati nella stessa cartella progetto del canonico.

### Qualificazione esecutiva

La prima esecuzione montaggio [#44937944056](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44937944056) aveva già prodotto il Blender e tre immagini, ma la serializzazione JSON del registro `c_collections` non accettava un riferimento Blender `Collection`. **Correzione esclusivamente documentale**, senza modificare modelli/materiali/render, commit `c5f29057044bb54b75621d140e790b9d28f741fb`; rilancio [#44938236317](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44938236317) terminato con tutti i controlli **PASS**.

## 2. Revisione visiva rispetto al riferimento canonico — NON APPROVATA

Osservazione diretta della HERO integrata in confronto all'immagine canonica. Le seguenti anomalie sono **artistiche**, non errori di caricamento:

| Priorità | Elemento | Scarto rilevato | Obiettivo del prossimo intervento |
|---|---|---|---|
| **P0** | **Cupola/volta (A01–A05)** | Ampie strisce della copertura ancora troppo evidenti, cielo piano con nuvole stilizzate, raggi zenitali troppo deboli; il riferimento ha una corona più elegante e luminosa | Mascherare percettivamente le nervature con superfici continue; migliorare la **luce**, non aggiungere acciaio né nuova geometria fitta |
| **P0** | **Quattro portali (A17–A21)** | I vetri sembrano quattro pannelli verticali regolari quasi allineati, troppo chiari e poco profondi; la disposizione curva/monumentale e il bordo ottico del canone non emergono | Migliorare resa cobalto, trasparenza e **silhouette percepita** nella HERO, salvaguardando i quattro accessi |
| **P0** | **Podio e regia oro-blu (A22–A25)** | Riflessi bianchi e freddi diffusi; oro del basamento evidente ma luce poco controllata; nel riferimento dominano un anello caldo continuo e riflessi credibili | Rivedere albedo/esposizione/rugosità e posizionamento delle luci; non aggiungere nuove corone decorative |
| **P1** | **Vegetazione (A12–A16)** | Due famiglie realmente diverse, ma alberelli esili e arbusti poco presenti; grandi fioriere basse sono inquadrate marginalmente | Riutilizzare e ridimensionare **gli stessi asset CC0** per una composizione più ricca, senza nuove librerie di modelli |
| **P1** | **Librerie/gallerie (A06–A11/A25)** | Quattro moduli precostruiti importati ma quasi illeggibili nella vista, luce delle nicchie troppo uniforme | Rivedere **posa, materiali e retroilluminazione**, evitando profili e lampade a vista |
| **P1** | **Pavimento (A23–A24)** | Le direttrici prospettiche e riflessioni non sono comparabili alle bande e ai giunti del canone | Operare su rapporto fra riflessi, pavimentazione e ottiche, senza estendere strisce LED |
| **P2** | **Accesso/identità** | Il pulsante «Entra in Atlas» del riferimento appartiene all'interfaccia finale; non è presente nei render Cycles | Verificarlo sul sito mobile, senza duplicarlo come oggetto Blender o testo del portale |

**Diagnosi:** la composizione tecnica è consolidata, ma il divario di fedeltà viene soprattutto da **luce, volumi percepiti e regia dell'inquadratura**, non dalla mancanza di ulteriori microcomponenti. Non riaprire la ricerca infinita di arredi. Priorità a una **prova artistica controllata** sull'illuminazione e la leggibilità dei portali e degli oggetti appena integrati.

## 3. Accettazione e prossimo passo

**Esito attuale:** `R6ABCD_TECHNICAL_PASS__ART_NOT_APPROVED`. Le PR #152, #160, #161, #162, #163, #164 e #165 restano in bozza e non devono essere integrate o pubblicate come se il riferimento fosse raggiunto. L'ideatore deve poter confrontare ART-DIR-02 e R6ABCD.

**Revisione E indipendente [#159](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/159):** valutare la matrice A01–A26, separare problemi di camera/materiale/luci/arredo, prescrivere massimo tre correzioni artistiche ad alto impatto e una prova mobile reale; non dare PASS artistico sulla sola base di CI.

**Produzione successiva (solo in copia R6ABCD):** una prova di direzione artistica focalizzata su (1) regia zenitale/volta scura con meno acciaio visibile; (2) vetri cobalto monumentali e basi luminose nel rapporto prospettico del JPEG; (3) valorizzazione dei prefabs C mediante scala e retroilluminazione. Per ogni prova mantenere la stessa camera HERO e confrontare col canone, prima di variare inquadrature o cambiare motore web.

**Vincoli:** zero costi obbligatori; nessun merge in main, nessun deploy, nessuna pubblicazione agli studenti, nessun trattamento di dati personali; la valutazione visiva è un atto distinto dal collaudo tecnico Blender.