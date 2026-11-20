# ATLAS-GATEWAY-HYBRID-01 — Studio di fattibilità e schema di scena ibrida

**Data:** 20 novembre 2026.  
**Stato:** **IPOTESI PROGETTUALE DOCUMENTATA, NON APPROVATA E NON IMPLEMENTATA.**  
**Oggetto:** porta iniziale di ATLAS, a quattro portali.  
**Proposta:** l'ideatore valuta una scena composta principalmente dall'immagine architettonica approvata, conservando in 3D **solo i quattro portali** e, *se necessario*, pochi elementi di arredo. Nessuna necessità di creare un cielo 3D, una cupola o un podio geometrico. L'interazione permane.

## Tavola di composizione

[**Apri lo schema SVG modificabile — HYBRID-SCHEMA-01**](./ATLAS-GATEWAY-HYBRID-SCHEMA-01.svg).

**ATTENZIONE:** lo SVG è una **rappresentazione diagrammatica originale** dei livelli, non il render definitivo di ART-DIR-02 e non utilizza né replica il file PNG canonico. Il disegno non va spacciato per mockup visivo validato sull'immagine.

## 1. Ripartizione esatta della scena

| Componente | Tecnica proposta in prima prova | Motivazione | Limite da verificare |
|---|---|---|---|
| Rotonda, colonne, balconate, librerie e fioriere | **FONDALE 2D** | Massima fedeltà al riferimento artistico | Parallasse assente senza separazione in profondità |
| Lucernario, cielo, fasci di luce | **FONDALE 2D** | Non servono veri cielo, atmosfera e superfici del tetto in 3D | Movimento della camera ridotto o assente |
| Pavimento, giunti e riflessioni | **FONDALE 2D** | Mantiene la fotografia/render approvato | La riflessione dei portali rimossa dal fondale va ricomposta |
| Semisfera/podio, scritta artistica ATLAS, anelli del basamento | **FONDALE 2D + maschera d'occlusione 2D** | Evita un difficile rifacimento geometrico; il podio deve rimanere davanti agli oggetti posteriori | Sagoma precisa, bordi e sovrapposizione corretti |
| I quattro portali Curricolo / Esplora / Percorsi / Esperienze | **QUATTRO OGGETTI 3D AUTENTICI**, uno per accesso | Trasparenza, illuminazione di bordo, risposta a puntatore/tocco, profondità sottile | Registrazione esatta su camera fissa e sfondo |
| Ombre di contatto, riflessi dei portali sul pavimento | **2D composito precalcolato** in prima prova | Leggerezza su smartphone; continuità visiva | Non sono dinamiche per grandi movimenti |
| Elementi d'arredo in primo piano | **2D nella prima prova**; 3D soltanto se aggiungono un miglioramento osservabile | Evitare ingombro e peso superfluo | Test A/B prima di introdurli |
| Marchio, nomi dei portali accessibili, pulsante «Entra in Atlas» | **INTERFACCIA HTML/CSS (DOM)** | Testo nitido, accessibilità, selezione tastiera, rotte reali | Eliminare eventuali duplicati già presenti nell'immagine |

**Decisione provvisoria:** iniziare con **quattro portali 3D e tutto il resto 2D**. L'arredo 3D è opzione successiva, non prerequisito. La tua idea di lasciare il cielo soltanto nell'immagine è coerente con questo scenario.

## 2. Sequenza dei livelli in composizione

I livelli sono ordinati secondo ciò che deve apparire davanti/retro, non secondo l'ordine di caricamento:

```text
VISIBILE ALL'UTENTE
┌────────────────────────────────────────────────────┐
│ L4 · UI HTML/CSS accessibile (logo / accessi / CTA)│
├────────────────────────────────────────────────────┤
│ L3 · Maschera primo piano / sagoma podio + bagliori │
├────────────────────────────────────────────────────┤
│ L2 · Quattro pannelli 3D reali e selezionabili      │
├────────────────────────────────────────────────────┤
│ L1 · Plate: fondale architettonico ripulito         │
└────────────────────────────────────────────────────┘
SORGENTE · PNG ART-DIR-02 canonico, originale integrale
```

**Caso speciale:** una singola fotografia con il podio già presente non genera automaticamente la corretta occlusione: serve una **maschera ritagliata** che riproduca le parti che devono coprire i portali nella scena. Non confondere profondità geometrica con livelli grafici che la simulano.

## 3. Problema fondamentale: togliere le immagini dei pannelli già presenti

L'immagine originale ART-DIR-02 **contiene già i quattro portali e scritte d'interfaccia**. Se si aggiungono i quattro oggetti 3D sull'intera fotografia, appariranno pannelli doppi, riflessi doppi o contorni fantasma.

**Prerequisito reale della variante ibrida:**
1. Recuperare il **PNG canonico originale** `atrio_futuristico_atlas_della_conoscenza.png`, **1672 × 941**, SHA-256 `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`, disponibile come *byte* nel deposito; non sostituirlo con ARENA a cinque pannelli né AG04 a tre.
2. Lavorare **su una copia**, preservando immutato l'originale.
3. Ricostruire in modo controllato le porzioni di architettura nascoste dietro ai portali, anziché limitarsi a coprire il testo: produrre un **fondale vuoto** (*clean plate*); documentare le parti ricostruite e revisionarle.
4. Conservare **maschera del podio**, maschere di riflesso, impronte dei quattro portali e aree per UI; salvare tutti i file, il processo e gli hash.
5. Usare la stessa telecamera virtuale per rendere quattro pannelli 3D coerenti; registrare coordinate e superficie del pavimento in immagine.
6. Verificare bordi, occlusioni e riflessi; vietato approvare il composito soltanto perché il fondo è gradevole.

La ricostruzione delle aree coperte dai portali è una **nuova interpretazione**: la fotografia da sola non rivela ciò che si trova dietro.

## 4. Regia e interazione

- **Camera iniziale bloccata** rispetto al fondale 2D. Si animano le **lastre 3D**, non una navigazione libera dell'architettura; inclinazioni minime e risposta luminosa. Lo scorrimento del telefono non deve muovere sfondo e pannelli in modo incoerente.
- **Selezione reale** dei quattro portali via puntatore/tocco e tastiera, con gli stessi collegamenti Atlas già presenti: Curricolo, Esplora, Percorsi, Esperienze. Non inventare rotte nuove.
- **Text UI in DOM** anche se le etichette sono associate visivamente al portale: mantenere una sola fonte testuale operativa, senza doppi testi sulla texture 3D.
- **Pulsante «Entra in Atlas»** gestito dal DOM, non stampato nel PNG di fondale se la UI lo disegna.
- Le ombre e i riflessi precalcolati non devono essere presentati come illuminazione fisica dinamica.
- **Riduzione del movimento:** nessuna oscillazione/parallasse obbligatoria; stato iniziale utilizzabile anche senza WebGL.

## 5. Smartphone e accessibilità

Il rapporto della fotografia canonica è panoramico, mentre la visualizzazione su smartphone può essere verticale. Un semplice `background-size: cover` rischia di **tagliare uno o più portali**; un `contain` senza un disegno dedicato può rendere i pannelli troppo piccoli.

Progettare **una composizione mobile esplicita**: fondale adattato o inquadratura guidata a tappe, con quattro destinazioni sempre raggiungibili anche se non tutte compaiono simultaneamente in grande. Controllare lettura, messa a fuoco da tastiera, nomi, pulsanti, riduzione movimento e touch.

Se WebGL non si avvia, la **stessa immagine** con quattro aree DOM accessibili deve mantenere **tutte** le destinazioni funzionanti.

## 6. Metodologia per decidere, senza scartare il 3D completo

**Variante A (prima prova, prioritaria):** fondale 2D + quattro portali 3D + maschera del podio + UI DOM.

**Variante B (solo se utile):** A + pochi arredi 3D e un secondo piano grafico per il primo piano. Richiede controllo in più delle maschere, riflessi e prestazioni.

**Progetto C (già in corso):** atrio **interamente tridimensionale** governato da ART-DIR-02 e relativo Master Blender. **Non è eliminato** da questo studio; rimangono intatti SEED-03, rapporti, workflow Blender, PR #152 e relative decisioni. L'ibrido è una **alternativa di prodotto da confrontare**, non una sostituzione automatica di ART-DIR-02.

| Criterio di scelta | Ibrido A | 3D completo C |
|---|---|---|
| Fedeltà della vista iniziale | Potenzialmente alta, se il clean plate è riuscito | Dipende dalla qualità della ricostruzione artistica |
| Navigazione libera | **No** | **Sì**, compatibilmente con il progetto |
| Effetto di profondità | Selettivo sui portali | Architettura e oggetti |
| Peso web | Verosimilmente inferiore, **da misurare** | Dipende dalle ottimizzazioni e dagli asset |
| Rischio principale | Fondale ripulito, allineamento e occlusioni | Qualità/modello/luci e prestazioni |

## 7. Prove richieste prima di decidere

- [ ] **H1 — Integrità:** acquisire realmente il PNG canonico, salvare copia e hash.
- [ ] **H2 — Fondale:** clean plate senza portali e scritte duplicate, revisione visiva delle ricostruzioni.
- [ ] **H3 — Composito:** quattro pannelli 3D riconoscibili, prospettiva precisa, podio occludente e luci di contatto credibili.
- [ ] **H4 — Interazione:** quattro rotte reali; tastiera, touch, fallback solo DOM.
- [ ] **H5 — Smartphone:** quattro accessi leggibili e cliccabili in composizione dedicata, senza ritagli involontari.
- [ ] **H6 — Prestazioni:** dimensione effettiva di immagini+JS+3D, caricamento, fluidità reale su Android.
- [ ] **H7 — Decisione artistica:** confronto affiancato con ART-DIR-02 e con l'attuale 3D completo, scelta espressa dell'ideatore.

**NESSUNO di H1–H7 è dichiarato completato solo con la presente tavola.**

## 8. Coerenza con i documenti esistenti

La [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md) attualmente prescrive **ambiente realmente tridimensionale e navigabile**, con lucernario, basamento, pareti e piani laterali geometrici. **L'ibrido a camera fissa contraddice quel requisito funzionale**. Non si può chiamare «conforme ART-DIR-02» senza una **revisione/deroga deliberata**. La fedeltà **visiva** alla fotografia può essere conservata, ma è un criterio diverso dalla navigabilità spaziale.

Restano vigenti: [IMAGE-GEOMETRY-01](./IMAGE-GEOMETRY-01.md), [ATLAS-ATRIUM-COMPOSER-KIT-01](./ATLAS-ATRIUM-COMPOSER-KIT-01.md) e gli archivi Blender già verificati su Drive.

**Governance:** [Atlas #151](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/151), [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354), [PR #152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152). Questo documento non richiede merge, cambio di rotte, pubblicazione o dismissione del lavoro già realizzato.
