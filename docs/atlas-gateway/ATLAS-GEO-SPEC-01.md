# ATLAS-GEO-SPEC-01 — Specifica tecnico-geometrica operativa

**Stato:** specifica **progettuale** derivata dal prompt fornito dall'ideatore e da ART-DIR-02, **non** rilievo metrico dal PNG né geometria verificata. Data: 20/11/2026.  
**Fonti:** [prompt integrale](./ATLAS-PROMPT-ART-01.md), [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md), [IMAGE-GEOMETRY-01](./IMAGE-GEOMETRY-01.md).  
**Regola:** distinguere requisiti testuali, ipotesi parametriche, osservazioni misurate dal PNG e revisioni approvate.

## 1. Architettura

| Campo | Specifica |
|---|---|
| Tipologia | Atrio monumentale circolare / rotonda |
| Linguaggio | Contemporaneo, museale, futuristico, culturale |
| Involucro | Volume prevalentemente cilindrico con articolazione architettonica |
| Livelli | Multipli; almeno due ordini chiaramente percepibili nel riferimento |
| Gallerie | Concentriche, balconate e parapetti in vetro |
| Colonne | Slanciate, con spessore e profondità reali |
| Pareti | Blu notte, antracite, metallo brunito e dettagli in ottone |
| Librerie | Scaffalature illuminate laterali, scenografia e non accesso principale |
| Vegetazione | Fioriere monumentali e alberi laterali e sulle balconate |
| Pavimento | Pietra blu scura riflettente, giunti geometrici |

## 2. Copertura e lucernario

| Campo | Specifica |
|---|---|
| Grande apertura | Lucernario sommitale centrale che domina l'immagine |
| Forma visibile | Ellittica nel fotogramma |
| Forma 3D candidata | Circolare **da verificare** con camera e punti di fuga; alternativa ellittica se richiesta dall'immagine |
| Bordo | Corona dorata continua illuminata |
| Cielo | Cielo azzurro con nubi bianche |
| Geometria | Struttura vetrata realmente spessa, nervature e luce zenitale |

## 3. Elemento centrale

| Campo | Specifica |
|---|---|
| Identità | Nucleo ATLAS blu notte, volume scultoreo convesso |
| Linguaggio iniziale | «Semisfera» nel prompt |
| Geometria da verificare | Podio ellittico ribassato con superficie continua, come ART-DIR-02; senza assumere una semisfera perfetta |
| Base | Piattaforma circolare con anelli luminosi concentrici |
| Materiale | Blu notte con riflessi metallici morbidi |
| Segni | Emblema A, scritta ATLAS in oro, bagliori caldo/ambra |

## 4. Portali

**Numero obbligatorio: quattro.** Due a sinistra e due a destra del centro, sull'arco posteriore. Un modello master ripetuto e adattato in quattro varianti, con profondità e spessore reali.

| Ordine da sinistra | Portale | Sottotitolo | Illustrazione |
|---|---|---|---|
| 1 | Curricolo | Struttura e obiettivi | Piani traslucidi sovrapposti |
| 2 | Esplora | Relazioni e connessioni | Rete tridimensionale di nodi luminosi |
| 3 | Percorsi | Itinerari formativi | Scala luminosa crescente |
| 4 | Esperienze | Attività e mondi | Pianeta blu, atmosfera e tracciati digitali |

**Caratteristiche condivise:** vetro cobalto traslucido, cornice bianco-dorata luminosa, angoli arrotondati, curvatura lieve, basi circolari luminose, icone chiare. Testo e interazioni operative tramite UI HTML secondo il contratto Atlas.

## 5. Identità visiva e interfaccia

Marchio ATLAS in alto a sinistra con emblema, sottotitolo «Mondi della conoscenza» e separatore verticale; pulsante dorato «Entra in Atlas» in basso al centro. Gli elementi di interfaccia restano distinti dalla geometria e accessibili.

## 6. Materiali e luce

- Luce zenitale fredda azzurro-bianca; atmosfera con fasci volumetrici controllati, non geometrie finte.
- LED caldi dorati lungo cornicioni, balconate, bordi dei portali e anelli del basamento.
- Scaffalature con illuminazione calda; vetri con riflessi ciano/blu.
- Pavimento riflettente con rugosità variabile; non superficie perfettamente a specchio.
- Palette: blu notte/cobalto, azzurro, oro champagne, ambra, bianco caldo.

## 7. Telecamera

- `CAM_HERO`: vista frontale centrata, altezza umana relativamente bassa, grandangolo moderato, forte simmetria.
- Il podio e l'asse del lucernario definiscono l'asse centrale compositivo; i quattro portali rimangono visibili.
- `CAM_SIDE`: verifica vera profondità, continuità dei due livelli, spessori dei portali e parallasse.
- `CAM_MOBILE`: inquadratura dedicata, non semplice ritaglio del formato panoramico.
- **Nessuna focale, misura assoluta, altezza, diametro o posizione metrica è deducibile con certezza dal solo prompt.**

## 8. Informazione che resta da misurare sul PNG canonico

Asse e posizione del punto di fuga, skyline del lucernario, interassi architettonici, ingombri e silhouette dei portali, curva del podio, altezza relativa dei livelli, direzione delle fughe del pavimento, camera e disambiguazione circolare/ellittica.

**Dopo il rilievo:** riportare misure normalizzate, ipotesi e grado di confidenza in un registro separato e aggiornare la seed soltanto con decisioni versionate.

## 9. Criterio di accettazione

Un render gradevole **non** è una verifica geometrica. Richiesti progetto parametrico, tre viste da un'unica scena, confronto con PNG canonico, geometrie realmente modificabili, approvazione esplicita prima della produzione artistica definitiva e della conversione WebGL.

**Nessuna delle verifiche del PNG e del master Blender è dichiarata completata qui.**
