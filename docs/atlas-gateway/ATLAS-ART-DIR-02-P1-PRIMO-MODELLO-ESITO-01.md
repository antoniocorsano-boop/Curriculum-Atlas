# ATLAS ART-DIR-02 — P1: primo vero modello geometrico neutro e studio prospettico

**Data:** 21 novembre 2026. **Stato:** `BLENDER_TECHNICAL_PASS__P1_PERSPECTIVE_PARTIAL__ART_NOT_APPROVED`.

## Sorgente e progetto

- **Riferimento artistico immutabile:** [JPEG ART-DIR-02](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`, 1536×864.
- **Protocollo approvato:** [MASTER-PERCETTIVO-PARAMETRICO-01](./ATLAS-ART-DIR-02-MASTER-PERCETTIVO-PARAMETRICO-01.md), registro [PARAMS-01](./ATLAS-ART-DIR-02-PERCEPTUAL-PARAMS-01.json), studio delle 26 aree [VISUAL-READING-02](./ATLAS-ART-DIR-02-VISUAL-READING-02.md).
- **Master fisico di partenza:** R8-02 [Drive](https://drive.google.com/file/d/19JWBQ4DQG4a77YbsChtID7ZYFjZ9LUQU/view), `atlas-art-dir02-r8-integrated-atmosphere.blend`, SHA-256 `2d39c43e0690334ce40627266d083e78d4d4238d25a28d0aaec6be33ef6550f8`.
- **Produzione P1:** [PR #169 in bozza](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/169), ramo `work/atlas-artdir02-p1-clay-spatial`, [Actions #44946997116](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44946997116) **TECH PASS**, dopo rettifica del nome archivio R8. Script `scripts/atlas-gateway-production/p1_perceptual_clay.py`, workflow `.github/workflows/atlas-art-dir02-p1-clay.yml`.

## Archivio qualificato

- [**Drive: MASTER P1 neutro + prima/dopo + ricevuta**](https://drive.google.com/file/d/15SBPenEvYFjCB7Z7DHL9mRn7HQKjJF8F/view), ZIP 15.977.524 byte, SHA-256 `29c0059d690ae1a373a78c4abd2ddd051e34efddb19ddaa3e051517f223331e3`.
- File Blender **veramente modificabile** `atlas-art-dir02-p1-perceptual-clay.blend`, 12.947.292 byte, SHA-256 `d35c42c2f4b50dafa01dfb7ab27a113ec9c954b09b6629e2239c54b589833a3b`.
- Due rendering Cycles originali: `atlas-p1-r8-neutral-baseline.png` (960×540), `atlas-p1-perceptual-clay.png` (1152×648); ricevuta JSON con parametri, ancore e SHA. Il modello `.blend` conserva inalterati i materiali originali; il grigio deriva da un **material override** del livello di vista, reversibile.
- [**Tavola originale ART-DIR-02 contro P1**](https://drive.google.com/file/d/1DfqGRBR9HyMuT-UfXJFg4YHiVqoa7B5_/view); [**R8 neutro contro P1 neutro**](https://drive.google.com/file/d/1euOJazkwhR5IL7af30YmInFuhY-izC9w/view). Tavole di confronto costruite solo con veri render e il JPEG originale, non alternative sintetiche.

## Interventi P1 reali

Il modello conserva la vera architettura Blender di R8 e modifica le trasformazioni di **288 oggetti architettonici esistenti**; ricolloca 12 istanze decorative con geometrie già presenti, conserva tre collezioni di risorse CC0 e quattro veri basamenti metallici. Non sono stati acquisiti o generati arredi.

Il pannello `ATLAS_P1_PARAMETRIC_CONTROL` è un oggetto Blender con proprietà editabili e uno script che applica deterministicamente la configurazione. **Per ora non sono ancora driver aggiornati in tempo reale all'atto del trascinamento dei valori**: la riproducibilità è garantita dallo script e dalla ricevuta, non da una interfaccia a cursori già collegata agli oggetti.

| Parametro sperimentale | P1 |
|---|---:|
| Moltiplicatore ampiezza atrio | **1,135** |
| Moltiplicatore altezza atrio | **1,22** |
| Apertura orizzontale delle due radici interne | **1,25** |
| Apertura orizzontale delle due radici esterne | **1,14** |
| Focale camera risultante | **32 mm** |
| Posizione camera risultante | **(0, −18,3, 3,55)** unità Blender |
| Punto osservato in asse | (0, 2,7, 2,7) |
| Decentramento verticale camera | **−0,06** |

Questi valori sono scelte **scenografiche candidate**, non misure metriche dell'immagine generata.

## Valutazione quantitativa degli ancoraggi dei quattro pannelli

Stessa fotocamera proiettiva interna Blender; coordinate riferite alla larghezza del fotogramma da 0 (sinistra) a 1 (destra). I bersagli artistici sono **contorni manuali approssimati**, con incertezza nominale ~18 px.

| Centro portale | ART-DIR-02 indicativo | R8 geometria originale | P1 |
|---|---:|---:|---:|
| Curricolo | 0,200 | 0,255 | **0,208** |
| Esplora | 0,389 | 0,413 | **0,385** |
| Percorsi | 0,616 | 0,587 | **0,615** |
| Esperienze | 0,801 | 0,745 | **0,792** |

L'errore quadratico pesato delle sole posizioni, estremi verticali e centri dei quattro pannelli passa da **0,3321** a **0,0020**: riduzione del 99,4%, **ma soltanto rispetto a queste 12 ancore**. Non è una misura di fedeltà della sala o una verifica di prospettiva globalmente consistente.

**Gap centrale:** in P1 i bordi proiettati delle **mesh vetrate** Esplora/Percorsi lasciano circa **8,7% della larghezza** (`0,54331−0,45669`), contro il riferimento manuale di circa 6–6,5%. È un *leggero eccesso di separazione da correggere*, non una corrispondenza perfetta.

## Difetto determinante: oculo scomparso

La HERO neutra P1, a differenza del JPEG ART-DIR-02 e della R8 neutra, **non mostra più il lucernario**: la combinazione di sala più alta, spostamento della camera e inquadratura adattata solo alle lastre proietta il cielo interamente fuori dalla sommità del fotogramma.

**Non approvare P1 in questo stato.** Questo è esattamente il rischio previsto dalla specifica: una vista sintetica può proporre relazioni prospettiche incompatibili con una unica calibrazione metrico-geometrica. Il buon allineamento dei portali, da solo, non valida la scena.

Ulteriori limiti: il modello neutro è volutamente privo delle caratteristiche luminose canoniche, perciò questa prova **non** misura l'effetto del cielo, dei bordi cobalto o dei riflessi. La doppia galleria appare regolare e molto ripetitiva. L'aspetto chiaro del fotogramma neutro non è un nuovo progetto cromatico: è il materiale di controllo.

## Nuovo obiettivo P1B — controllo simultaneo degli ancoraggi

Senza tornare a progettare tutto da zero, estendere lo **stesso** sistema parametrico:
1. **Aggiungere almeno tre ancore non appartenenti ai portali:** bordo inferiore visibile del lucernario (nell'ART-DIR-02 ~10–15% dell'altezza), posizione della cornice della galleria superiore e profilo superiore/punto frontale del podio. Tenere anche il gap centrale, invece di ottimizzare solo i centri.
2. **Confrontare due ipotesi con stessa immagine:** calibrazione con camera unificata e libertà prospettica locale per lucernario/gallerie, segnalando chiaramente quale relazione richiede una correzione scenografica artistica.
3. Riprodurre il secondo clay con cielo **effettivamente visibile** senza perdere i quattro ingressi. Un risultato non approvato non deve diventare il master automatico di P2.
4. In P2, quando le quattro radici sono riposizionate, ricollaudare tutte le zone cliccabili dell'interfaccia web. Il semplice cambiamento del layout Blender non prova che gli accessi sul sito funzionino.

## Stato operativo e sicurezza

`P1_BLENDER_PASS__PERCEPTUAL_GATE_NOT_PASSED`. Fonte R8 intatta, modello P1 editabile e archiviato, due render reali e ancore riproducibili; niente merge, pubblicazione studenti, deploy, nuovo servizio o nuove risorse a pagamento. **fSpy non è ancora stato eseguito**; questo è un primo aggiustamento prospettico interno a Blender su coordinate manuali, non un risultato di fotogrammetria.
