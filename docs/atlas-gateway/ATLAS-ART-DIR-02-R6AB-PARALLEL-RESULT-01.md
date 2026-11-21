# ATLAS ART-DIR-02 — R6A / R6B / R6AB: esito delle prime lavorazioni a più mani

**Data:** 21 novembre 2026. **Stato globale:** `TECHNICAL_PASS__ARTISTIC_NOT_APPROVED`.

## Fonti e continuità
- [ART-DIR-02 originale](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), JPEG SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.
- [Lettura approfondita 02](./ATLAS-ART-DIR-02-VISUAL-READING-02.md), 26 categorie e 16 relazioni.
- R5 master condiviso: `e97dcf65e7cd6a97f031cef99d2d81398c5d42d6493807b4e29cf35e5236b278` (SHA-256 file `.blend`), [archivio R5](https://drive.google.com/file/d/1XK-acsH4E3jLrMIj5NghXSvfRcALwI4r/view). Ogni lavoro deriva ESATTAMENTE da questa sorgente; nessuna immagine sintetica alternativa o nuova architettura indipendente.

## A. Produzione specialistica parallela riuscita

| Lavorazione | PR/issue | GitHub Actions | Archivio e impronta | Esito |
| --- | --- | --- | --- | --- |
| **R6A** cielo/volta | [PR #160](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/160), [#155](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/155) | [#44934521917](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44934521917) | [Drive 9.466.783 B](https://drive.google.com/file/d/1_yHh7vXFS2zzz98JxwYXLDgOogiOm5Wy/view); ZIP SHA-256 `8efef1a4c46c2eb2cd33cb869f0fb91ebf30f3b642015f0b5109a85a1e9b9122` | TECH PASS; ART NOT APPROVED |
| **R6B** materiali/gallerie | [PR #161](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/161), [#156](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/156) | [#44934525743](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44934525743) | [Drive 9.909.258 B](https://drive.google.com/file/d/136t-ne0Pa1zjIlXEoO8RpMs-lBmABa5J/view); ZIP SHA-256 `1f36a3dfec40b74760edf17707a9bd02c1bd5307efd8102e2df0e5dc8ca67385` | TECH PASS; ART NOT APPROVED |
| **R6AB** unica scena integrata | [PR #162](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/162), [#154](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/154) | [#44935005743](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44935005743) | [Drive 9.735.312 B](https://drive.google.com/file/d/1Zf1YXbNQawiAUCR4M1a5Kgaoetix_-qO/view); ZIP SHA-256 `7528d834b296dfafee86aa79c4d1923c57862984bcb9829be81fad60a36a8a14` | TECH PASS; ART NOT APPROVED |

**Tavola di confronto con sei immagini reali:** [ART-DIR-02 / R5 / R6A / R6B / R6AB HERO+OBLIQUE](https://drive.google.com/file/d/1kqAgrMJUNsA-wI8nkMwayLzwuiJPp4Jf/view), JPEG 1.324.740 B, SHA-256 `0635e0d7395ff6799b4940e717a5543d763288347ae240763b9cbffbbf81a84e`.

## B. Evidenze tecniche

### R6A
- 18 elementi di copertura riallestiti con materiali scuri; 18 travi a vista e parte degli elementi tecnici nascosti nel render.
- Raggio del cielo geometrico da `6.8000 BU` a `5.3720 BU`. Attenzione: **non equivale al diametro assoluto di un lucernario ricavato dal riferimento**; variazione percettiva candidata.
- Quattro nervature radiali conservate contro il cielo. Nuova emissione sulla texture di cielo originale, conservata nel file Blender.
- Nessun cambiamento ai quattro portal-root né alla camera HERO.

### R6B
- 28 superfici di parapetti vetrati fumé; **77** strutture/pilastri scuriti; 46 elementi di telaio e fascia rivestiti; tre grandi superfici di balconata; 4 giunti del pavimento realizzati come vere curve 3D.
- I giunti **non emettono luce** (non sono strisce LED). Le quattro radici dei portali e la camera HERO rimangono invariate.

### R6AB: composizione reale, non sovrapposizione fotografica
- Carica il vero master Blender R6A e importa **solo** i materiali (con assegnazioni) e i 4 giunti del modello R6B in quello stesso spazio 3D.
- Verifica impronte e sorgente R5 comune e riproduce due render Cycles dal modello risultante.
- Impronta `.blend` combinato SHA-256 `3d0bd18967c37d91025d1d2bd2abea3119aaf7da6f098a61d761566e88fd2cc4`, disponibile nel relativo archivio.
- Nessun merge o pubblicazione. Il completamento tecnico **non implica** accettazione artistica o miglioramento delle prestazioni in Three.js.

## C. Lettura critica delle immagini effettive

**Miglioramenti riscontrabili:** nella R6A le nuvole diventano leggibili e si attenua la griglia radiale dentro il cielo; nella R6B le pareti delle gallerie sono più scure e i parapetti risultano meno simili a ringhiere metalliche. I due cambiamenti coesistono in una scena R6AB e il modello è riproducibile.

**Gravi distanze dall'immagine canonica (ART NOT APPROVED):**
1. La **volta** continua a presentare ampie strisce radiali contrastate, leggibili come una gabbia. Il bordo luminoso caldo dell'oculo è insufficiente. Il cielo, sebbene meno grande, rimane un disco piatto con nuvole poco naturali; i raggi zenitali sono quasi impercettibili.
2. I **quattro vetri** rimangono pannelli con aspetto da scheda piatta, più piccoli e meno monumentali delle grandi vetrate originali, con l'effetto di curvatura/disposizione poco percepibile dalla HERO.
3. Il **podio** appare come un elemento basso ma ancora schematico, con riflessi molto freddi; nel riferimento è un monolite scuro con anelli oro continui e un'identità centrale più ricca.
4. **Gli arredi** sono insufficienti: mancano le due categorie botaniche distinte, grandi vasche metalliche basse in primo piano, alberelli slanciati, scaffalature librarie calde e stendardi laterali.
5. Il **pavimento** mostra ancora debolmente le direttrici prospettiche; le luci oro/ciano e i riflessi non ricostruiscono la scena. Il pulsante di ingresso non compare nel render Blender R6AB: la componente di interfaccia e CTA va verificata anche separatamente sul sito, non inventata nel render.
6. Rispetto al riferimento la luce è **uniforme e fredda**, senza sufficiente contrasto artistico tra la volta scura, il cielo abbagliante e le sorgenti oro della galleria.

**Decisione:** nessuna promozione di R6AB a master approvato. Le nuove prove servono a misurare l'utilità dei livelli specialistici, non a sostituire ART-DIR-02.

## D. Passo successivo e responsabilità
- **R6C [#157](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/157):** attivare arredi e vegetazione realmente differenziati, vasi in metallo nei due formati, scaffali librari con luce calda e banner, privilegiando asset precostituiti CC0 e la leggerezza web.
- **R6D [#158](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/158):** un solo basamento metallico luminoso sottile per vetro, trattamento blu profondo e riflessi, non perfezionamento dell'incasso in feritoia; trattamento del podio.
- **R6A rifinitura:** ridurre percezione del reticolo della volta e dare più credibilità al cielo e ai raggi solo dopo avere acquisito feedback sul confronto.
- **R6B rifinitura:** eliminare eccessiva luminosità delle finestre, migliorare trasparenza e riflessi delle ringhiere senza industrializzare i telai.
- **Revisione E [#159](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/159):** giudizio indipendente sul modello complessivo e solo successivamente campata GLB/Three.js, con prestazioni mobili reali.

L'unico utente approva l'arte; le corsie AI/Blender sono autonome a livello di codice e collaudo, **non persone o agenti in background**. Tracciatura in [MULTIWORK-R6-01](./ATLAS-ART-DIR-02-MULTIWORK-R6-01.md) e [R6-SOLO-01](./ATLAS-ART-DIR-02-R6-SOLO-EXECUTION-01.md). Nessuna modifica al reference JPEG, nessun merge e nessun deploy.
