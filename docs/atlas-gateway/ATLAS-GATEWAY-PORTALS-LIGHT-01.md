# ATLAS-GATEWAY-PORTALS-LIGHT-01 — Quattro portali: presenza architettonica, leggerezza visiva

**Data della decisione:** 21 novembre 2026  
**Stato:** specifica artistica e tecnica da implementare; **non** render approvato, non modello Blender concluso, non modifica già applicata al runtime.  
**Inquadramento:** affinamento di [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md) e [MASTER-BLENDER-01](./MASTER-BLENDER-01.md), subordinato a [IMAGE-GEOMETRY-01](./IMAGE-GEOMETRY-01.md). Attuazione dentro la [PR #152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152), non in una nuova esperienza parallela.

## 1. Riferimento illustrato e regola di provenienza

Nuovo allegato dell'ideatore nella conversazione del 21/11/2026: immagine **JPEG reale, 1536 × 960 pixel**, SHA-256 **`b3bb8bb9c184acee97f479c522669059602c0797e4d8e7033a0627fc88ed0e81`** (in questa sessione nominato `1000089007.png`, ma i byte sono JPEG). Contiene quattro grandi portali luminosi con testi incorporati, rotonda a due livelli, lucernario, basamento ATLAS e ingresso centrale. **È una referenza specifica per i quattro portali e per l'equilibrio visivo; non sostituisce automaticamente il PNG canonico ART-DIR-02 e non autorizza misure 3D assolute.** L'allegato dovrà essere depositato in archivio durevole con hash e collegamento verificabile; il percorso temporaneo della chat non costituisce un archivio.

Decisione dell'ideatore: «i 4 portali così», ma con **alleggerimento**, non con ulteriore accumulo di luci, contenuti o dettagli.

## 2. Direzione artistica approvata come obiettivo (NON come risultato)

I quattro portali sono **oggetti architettonici reali**: grandi superfici blu semitrasparenti, bordi arrotondati sottili, spessore leggibile di lato, ancoraggio fisico al pavimento e disposizione lungo l'arco della rotonda. Devono avere **eguale famiglia di materiali e proporzioni**; differiscono nei segni funzionali. Il basamento ellittico basso e convesso resta l'elemento di identità centrale; lucernario e gallerie rimangono percepibili.

La regola progettuale è **sottrarre, non aggiungere**:

1. **Un solo simbolo chiaro, un solo nome, un solo motivo visivo discreto per portale.** Nessun sottotitolo permanente, particelle galleggianti, miniature multiple o sequenze illustrative sovrapposte.
2. **Un solo bordo luminoso per portale**, con emissione contenuta; nessun doppio contorno, alone costante esteso o luce decorativa in competizione col lucernario.
3. **Vetro blu meno saturo e più trasparente**, con texture sottile e zone di riposo; i contenuti restano nitidi e chiaramente separati dal basamento.
4. **Ridurre l'intensità visiva delle riflessioni del pavimento, degli anelli e dei raggi atmosferici**; conservare il contrasto freddo/caldo, ma senza moltiplicare fasci o punti luce.
5. **Contenere la scenografia laterale** (stendardi, verde, scaffali) in ruoli di scala e profondità; nessun nuovo elemento architettonico o decorativo.
6. **Nessuna fascia tipografica invadente** in alto, nessun duplicato del marchio dominante e nessun testo descrittivo lungo prima dell'ingresso. Il marchio principale ATLAS rimane sulla superficie curva del basamento; CTA unica e accessibile.

Non eliminare l'identità dell'immagine né trasformare i portali in semplici schede piatte. **Leggerezza = gerarchia, aria tra gli elementi, superfici credibili, economia luminosa.**

## 3. Vocabolario dei portali

| Posizione | Nome | Simbolo | Unico motivo discreto | Destinazione |
| --- | --- | --- | --- | --- |
| Sinistra | **Curricolo** | Libro aperto | Due-tre piani semitrasparenti di conoscenza | `/curricolo/` |
| Centro-sinistra | **Esplora** | Bussola | Arco planetario e pochi nodi sottili | `/esplora/` |
| Centro-destra | **Percorsi** | Tracciato e nodi | Un itinerario luminoso continuo, non una mappa affollata | `/percorsi/` |
| Destra | **Esperienze** | Soglia/ambiente | Un'apertura verso un paesaggio educativo, senza galleria di tessere | `/esperienze/` |

**Titoli visibili incorporati materialmente nel portale**, mediante texture/UV o grafica prodotta insieme all'asset nella scena Blender, non scritte HTML flottanti. Tutte le denominazioni e le rotte derivano da **un solo contratto dati Atlas**: la generazione della texture usa quei nomi, e il collegamento semantico HTML usa gli stessi nomi per `aria-label`. Una fonte dati, una sola istanza visibile del titolo.

## 4. Geometria Blender

- `PORTAL_MASTER`: unica geometria principale con smussi misurati, telaio, vetro, base di raccordo e retro fisicamente credibile. Quattro istanze parametrizzate (`CURRICOLO`, `ESPLORA`, `PERCORSI`, `ESPERIENZE`). I materiali comuni sono condivisi.
- Spessore, inclinazione e disposizione derivano dal **camera matching dell'immagine canonica** nelle viste `CAM_HERO`, `CAM_SIDE`, `CAM_MOBILE`; non inventare quote metriche sulla base di una sola fotografia sintetica.
- Simbolo, nome e motivo sono livelli grafici discreti e profondamente integrati al vetro; mantenere risoluzione sufficiente alla camera mobile e ridurre la complessità dei motivi, **non** la leggibilità dei nomi.
- Il podio è ellittico, ampio, ribassato e morbidamente convesso. Il marchio ATLAS segue UV, prospettiva e riflessioni della superficie; nessun piano grafico in primo piano a simularne la curvatura.
- Primo controllo: tre render neutri HERO/SIDE/MOBILE; secondo controllo: render Cycles con materiali e luce. Il master Blender non è considerato realizzato finché i file e le prove non esistono.

## 5. Luce e materia: riduzione controllata

- Luce principale: **lucernario freddo**; cornici **ottone caldo** come accento secondario; luce di riempimento minima. Vietato compensare materiali deboli aggiungendo bagliore.
- Un profilo emissivo sobrio per ogni portale; luce indiretta e riflessi preferibilmente precalcolati per la versione web.
- Trattamento del vetro orientato alla leggibilità e alla stabilità su smartphone: controllare trasparenze sovrapposte, ordinamento, sovraesposizione e interferenze fra titoli e fondale.
- Prima del rendering finale, confrontare una versione **senza bagliori aggiunti** e una versione **con accenti minimi**. Se la seconda non migliora la lettura, mantenere la prima.
- Nessun riflesso dinamico totale del pavimento come requisito per il telefono; valutare mappe e superfici statiche compatibili col runtime.

## 6. Traduzione WebGL e accessibilità

- Riutilizzare Three.js r128 e la filiera della PR #152, **non** introdurre un secondo motore.
- Master completo Blender → derivato GLB con geometrie unite/istanziate dove opportuno, materiali e texture condivisi, risorse invisibili escluse, mappe di illuminazione validate su un campione.
- **Niente nuove luci dinamiche per ciascun portale** come scorciatoia per ricreare il render Cycles. Misurare differenze Cycles/WebGL e compatibilità dei formati.
- L'intera superficie visibile di ogni portale è interattiva, senza pulsanti aggiunti o etichette visibili sovrapposte. Nomi per lettore di schermo, navigazione tastiera, fuoco visibile, bersagli mobili di almeno **44 × 44 pixel CSS**; mantenere un equivalente accessibile senza WebGL.
- Stati hover/tocco: un solo cambiamento lieve (luminanza del bordo o messa in rilievo), senza ingrandimenti invasivi, bagliori multipli o movimenti continui. Rispettare `prefers-reduced-motion`.
- Asset e hotspot della vista verticale devono derivare dalla **medesima geometria e camera**, non da una composizione indipendente che cambi l'edificio.
- Un'unica CTA «Entra in Atlas»; marchio ATLAS non duplicato visivamente.

## 7. Accettazione e consegna

**Confronto artistico affiancato**: immagine canonica, nuovo HERO Cycles e nuova vista mobile; aggiungere confronto semplificato degli stessi portali prima/dopo **senza creare un'ulteriore architettura**.

Requisiti **tutti necessari**:
- Quattro portali leggibili in un solo colpo d'occhio; medesima architettura e altezza visiva coerente con la prospettiva.
- Nome visibile **una sola volta su ciascun portale**; nessuna etichetta HTML aggiunta; motivo grafico non compete con il titolo.
- Nessun nuovo pannello, banner, ornamento, cono luminoso o scritta a riempire gli spazi liberi.
- Soglie di qualità e approvazione umana di ART-DIR-02; basamento convesso con marchio integrato; luce fredda/calda coerente.
- Rotte realmente funzionanti; prove desktop 1440×900, verticale 390×844 e 320×568, orizzontale 844×390, più misura prestazioni su dispositivo Android fisico; verificare assenza di scorrimento orizzontale e raggiungibilità dell'ingresso.
- Evidenze: file sorgente Blender, render, GLB, manifest con hash/provenienza/licenze e confronto WebGL, **solo quando materialmente prodotti**.
- Nessun merge, deploy o approvazione artistica automatica.

**Percorso di produzione:** rilievo dell'immagine canonica → camere e sagome dei quattro portali → `PORTAL_MASTER` con le quattro varianti leggere → materiali e luce → confronto Cycles → derivato WebGL con interazione completa → collaudo mobile e approvazione. Questo documento **non costituisce una nuova linea di sviluppo indipendente**.
