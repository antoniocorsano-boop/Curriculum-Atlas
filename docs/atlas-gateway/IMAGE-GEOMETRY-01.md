# ATLAS — IMAGE-GEOMETRY-01
## Riprogettazione geometrica dell'atrio a partire dall'immagine ART-DIR-02

**Decisione dell'ideatore:** 20 novembre 2026.  
**Stato:** **MANDATO ADOTTATO; RILIEVO E MODELLO GEOMETRICO ANCORA DA ESEGUIRE.**  
**Riferimento vincolante:** [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md) e [ART-REFERENCE-MANIFEST](./ART-REFERENCE-MANIFEST.md).  
**Master Blender:** [MASTER-BLENDER-01](./MASTER-BLENDER-01.md).  
**Assemblaggio/riuso:** [ASSET-KIT-01](./ASSET-KIT-01.md).  
**Piano esecutivo:** [ART-PROD-01](./ATLAS-GATEWAY-PRODUCTION-WORKFLOW-01.md).

## 1. Decisione fondamentale — inversione della dipendenza

**NON partire dalla geometria procedurale esistente della PR #152 per adattarla all'immagine. PARTIRE DALL'IMMAGINE per derivarne geometrie, composizione e proporzioni, e solo successivamente costruire il modello Blender.**

Il riferimento visivo approvato è la **sorgente artistica primaria e canonica**; la precedente scena WebGL/Blender di laboratorio può fornire esclusivamente tecnologie, strumenti e componenti che superino un confronto con la nuova ricostruzione. Non è un vincolo per la pianta, i volumi, gli archi, le distanze, le posizioni dei portali o la camera.

Il progetto geometrico non si ricava scegliendo una libreria di asset né copiando una singola prospettiva su piani: è una **ricostruzione architettonica tridimensionale da immagine**, con pianta, sezioni, alzati, superfici reali e geometrie delle parti non visibili inferite in modo coerente.

**Regola d'ordine:** IMAGE-GEOMETRY-01 → progetto geometrico verificato → ASSET-KIT-01 selezione di componenti adeguati → MASTER-BLENDER-01 scena artistica → approvazione Cycles → versione WebGL leggera.

## 2. Fonte e controllo di identità

- File canonico indicato nei documenti correnti: PNG 1672 × 941, SHA-256 `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`.
- L'ultimo invio JPEG 1536 × 864 conferma la stessa impostazione visiva; non sostituire il PNG senza una decisione formale.
- **Condizione preliminare:** recuperare e depositare in un archivio durevole il file con i byte e l'impronta verificata, accessibile alla filiera Blender/CI.
- Un'annotazione del SHA non è prova che il file sia depositato o che la sua geometria sia già stata ricostruita.

## 3. Catena di inferenza, senza false certezze

### IG0 — Ricognizione visiva e tavola di riferimento
- Usare l'immagine canonica completa, senza ritagli che alterino il rapporto della camera.
- Sovrapporre una griglia di lettura, segnare l'asse di simmetria, gli orizzonti possibili, il bordo dell'oculo, i livelli architettonici, la posizione apparente e l'ingombro dei quattro portali, l'ellisse del basamento, l'andamento dei giunti a pavimento, le silhouette delle logge e i confini della scena.
- Produrre `reference-landmarks.json` con coordinate **normalizzate 0–1** e una tavola `reference-annotated.png`, entrambi verificabili.
- Dichiarare separatamente le osservazioni visibili, le interpretazioni e ciò che non si può dedurre.

### IG1 — Camera e sistema di riferimento
- Stimare asse, altezza osservatore, inclinazione, campo visivo e punti/linee di fuga usando le rette effettivamente coerenti.
- Provare fSpy soltanto se le fughe sono geometricamente affidabili; per l'immagine sintetica ammettere incoerenze prospettiche. Non forzare un'unica prospettiva impossibile.
- Fissare una camera HERO documentata; costruire camere SIDE e MOBILE dallo **stesso** modello reale, non con artifici di facciata.
- Distinguere parametri ricostruiti, assunti per progetto e ancora incerti; nessuna misura metrica spacciata per dedotta da un solo fotogramma.

### IG2 — Riprogettazione architettonica
Produrre prima dell'assemblaggio di librerie:
1. **Pianta parametrica:** asse, centro della rotonda, raggio/angolo dell'involucro, posizione quattro portali, ingombro del podio e assi strutturali.
2. **Sezione longitudinale e trasversale:** quote relative dei due livelli, balconate e aperture, spessore della corona dell'oculo, rapporto altezza/diametro.
3. **Alzato/sviluppo modulare:** pilastri, archi, logge, vetri, fioriere e pannelli; numero e interasse da stabilire mediante verifica prospettica.
4. **Componenti identitari:** telaio e spessore del portale master, varianti quattro portali, basamento ellittico ribassato e lucernario reale.
5. **Geometria nascosta:** ricostruzione tecnicamente e visivamente plausibile, registrata come ipotesi progettuale, senza pretendere che fosse visibile nella fonte.

Fissare un sistema di scala coerente, anche con un'unità relativa iniziale; solo dopo definire eventuali dimensioni metriche di progetto. Salvare una tabella dei parametri con tolleranze e grado di certezza.

### IG3 — Modello Blender geometrico neutro
- Costruire un **unico modello 3D** con componenti nominati secondo MASTER-BLENDER-01, senza texture che mascherino errori di forma.
- Prevedere mesh o curve realmente tridimensionali per la rotonda, i due livelli, la struttura dell'oculo, i quattro portali e l'ellisse del podio; superfici laterali e spessori dove la camera può muoversi.
- Ottenere render neutri `clay-hero.png`, `clay-side.png` e `clay-mobile.png`.
- L'assemblaggio da librerie esterne **segue** la verifica delle geometrie e delle dimensioni richieste, non la precede.

### IG4 — Confronto in sovrapposizione e revisione
- Confrontare HERO con l'immagine sorgente nello stesso rapporto d'aspetto, mediante sovrapposizione, silhouette, ingombri/centri dei portali, bordo dell'oculo, livelli e contorno del podio.
- Registrare deviazioni percettive e geometriche per sottosistema; correggere **camera o progetto geometrico** prima di aggiungere materiali e luci.
- Validare SIDE per reale profondità e MOBILE per una composizione autonoma.
- Acquisire valutazione visiva dell'ideatore prima della modellazione artistica dei dettagli; non dichiarare equivalenza artistica per il solo superamento automatico di test.

## 4. Distinta geometrica preliminare ricavabile dalla descrizione del riferimento

Questa tabella indica **che cosa misurare e riprogettare** quando i pixel della fonte sono disponibili; non contiene quote inventate.

| Parte | Osservazioni disponibili | Grandezze/forme da derivare o progettare | Incertezza |
|---|---|---|---|
| Rotonda | Atrio curvo su due livelli | centro, raggio, arco visibile, spessore, altezza relativa | profondità e porzioni nascoste |
| Gallerie | Logge e parapetti laterali | quote dei due piani, interassi, sezioni | continuità fuori campo |
| Oculo | Grande lucernario vetrato in sommità | diametro/proiezione, inclinazione, corona, nervature | proiezione ellittica vs forma reale |
| Portali | Quattro grandi portali traslucidi | profili, dimensioni relative, spessori, posizioni lungo arco | distanza reciproca in profondità |
| Podio ATLAS | Basamento ellittico basso e largo | semiassi, quota, curvatura convessa, anelli | dimensioni metriche assolute |
| Pavimento | Pietra scura con giunti prospettici | piano, direzioni delle fughe, modulo lastre | scala assoluta |
| Decorazioni | Vegetazione, stendardi, luci calde | volume di ingombro e posizionamento | dettagli secondari |

## 5. Prove concrete di completamento

- [ ] PNG canonico materialmente archiviato e SHA verificato.
- [ ] Tavola annotata con riferimenti e file di punti normalizzati **estratti realmente dall'immagine**.
- [ ] Camera HERO documentata, ipotesi esplicite e parametri riproducibili.
- [ ] Pianta, due sezioni e alzato/sviluppo geometrico parametrici, coerenti fra loro.
- [ ] `.blend` geometrico neutro, con HERO/SIDE/MOBILE e geometria realmente tridimensionale.
- [ ] Confronti e sovrapposizioni dell'HERO contro la fonte; eventuali scarti registrati.
- [ ] Approvazione compositiva dell'ideatore. **Solo allora** approvare il kit di moduli ASSET-KIT-01 per adattarlo al progetto.

**GO/NO-GO:** l'esistenza di una precedente scena geometrica non costituisce superamento di IG0–IG4. Nessuna definizione geometrica definitiva è attribuibile alla fonte senza un rilievo effettivo e il suo confronto visivo.

## 6. Conseguenze per gli altri piani

- MASTER-BLENDER-01: la fase di camera/clay è un **processo di reverse design dall'immagine**, non il miglioramento della precedente geometria WebGL.
- ART-PROD-01: **IG0–IG4 devono precedere la selezione finale ASSET-KIT e la rifinitura artistica**. L'ordine D1/D2 viene reinterpretato in questo senso; le prove tecniche isolate possono svolgersi in parallelo, ma non cambiano la geometria finale.
- ASSET-KIT-01: i cataloghi si consultano sulla base degli ingombri e dello stile derivati; se un asset non corrisponde, si adatta o si scarta.
- PR #152: conserva valore per il runtime, le interazioni e i test, ma non è la fonte delle quote geometriche o della camera definitiva.
- Nessun merge, deploy o pubblicazione studente conseguono a questa decisione.

**Prossima operazione esecutiva:** ottenere il PNG effettivo nella filiera, effettuare il rilievo visivo IG0 e la ricostruzione di camera IG1, quindi produrre pianta/sezioni IG2. La stesura di questo documento non è l'esecuzione di tali operazioni.
