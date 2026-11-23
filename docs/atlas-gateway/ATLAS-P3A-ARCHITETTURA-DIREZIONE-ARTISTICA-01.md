# ATLAS P3A — Revisione architettonica e artistica: quattro livelli e oculo circolare

**Data:** 23 novembre 2026 · **Stato:** DIREZIONE DI PROVA SELEZIONATA DALL'IDEATORE, NON RENDERING 3D QUALIFICATO · **Perimetro:** PR #188, non integrata.  
**Specifica parametrica vincolante:** [ATLAS-P3A-QUATTRO-LIVELLI-OCULO-CIRCOLARE-01.json](./ATLAS-P3A-QUATTRO-LIVELLI-OCULO-CIRCOLARE-01.json).

## 1. Decisione artistica e continuità
L'ultima proposta visiva dell'ideatore prevede **una galleria aggiuntiva, minore copertura percepita, un lucernario di forma fisicamente circolare e un cielo più naturale**. L'ipotesi P3A è **l'unica variante nuova autorizzata alla prova**, non una riapertura di A/B/C.

Conservare come fonti immutabili:
- [ART-DIR-02 originale](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), riferimento storico dell'identità Atlas;
- [P2A/R4 geometria approvata](https://drive.google.com/file/d/1Jd5AgD15LrYEypK5-SIdFRUoJFEAlerE/view);
- [P2B/R2 finitura Cycles](https://drive.google.com/file/d/1YGaiNuQFOKIlXVwOrL7JVu57MHu6mjVT/view), sorgente Blender P3A senza alterare gli originali;
- [P2C/R3 WebGL realmente funzionante](https://drive.google.com/file/d/1Xs1p-x14k4IZAfRmTFPvIPcRkv24Tx9C/view);
- [ART-REF-03, prova dell'oculo](https://drive.google.com/file/d/1o4aSZreiy8uknolepIfekE1WfosHvQiQ/view) e [ART-REF-04, composizione senza sovrapposizioni di interfaccia](https://drive.google.com/file/d/17oGV8CVbIvLJkA3ZJowh_MH5joRDo99J/view).

**ART-REF-04 è un'illustrazione progettuale, NON il rendering del modello Blender.** Serve a dirigere la prossima prova, non a dimostrarne l'avvenuta realizzazione.

## 2. Specifiche architettoniche

| Componente | Stato P2A/R4 | Obiettivo P3A | Prova richiesta |
|---|---|---|---|
| Livelli | Piano terra + due balconate | **Piano terra + tre balconate** | Quattro quote strutturali distinte in 3D, tre parapetti ben visibili |
| Balconata aggiunta | Seconda galleria, solaio a z≈5,20–5,38 BU | Terza a z≈7,85–8,03 BU; ringhiere z≈8,10–8,81 BU | Continuità col piano sottostante, supporti visivamente plausibili |
| Copertura | Guscio unico P1F con forte massa percepita | **Guscio anulare più alto e sottile**, bordo esterno z≈10,55 BU, spessore 0,12 BU | Copertura unica, chiusa topologicamente, assenza di compenetrazioni |
| Lucernario | Superellisse 6,15×4,20 BU, p=2,7 | **Cerchio reale r=6,25 BU**, 160 segmenti | Raggio costante nel piano XY, foro non mascherato |
| Apertura cielo | Circa 89 BU² di apertura teorica | Circa 123 BU², +38% teorico | Vista zenitale effettiva e cielo leggibile |
| Portali | Quattro pannelli in arco anteriore | **Invariati** con feritoie fisiche | Quattro vetri identici nella scena, senza coprire il podio |
| Podio centrale | Volumetria esistente | **Invariato** | Punto focale riconoscibile anche dalla nuova camera |
| Camera | HERO di P2A/R4 | Eventuale **copia P3A della camera**, soltanto se necessaria | Portali, podio, terza balconata e oculo nella stessa inquadratura |

Le unità BU sono relative alla scena, non metri utilizzabili per un progetto edilizio. Nessuna valutazione strutturale o edilizia è implicita.

**Nota prospettica:** un cerchio orizzontale, visto obliquamente, appare ellittico. È vietato deformarlo in 3D per ottenere un cerchio perfetto sullo schermo; la leggibilità si calibra preferibilmente con una camera esplicitamente documentata.

## 3. Direzione artistica
- **Architettura:** grande profondità, ritmo di quattro quote, parapetti di vetro sottili, montanti scuri e sottile linea di luce calda. Niente fasce opache che riempiano la vista.
- **Colori e superfici:** grafite blu, bronzo/champagne saturo ma contenuto, pavimento lapideo con riflessi moderati e vetro traslucido cobalto. Non convertire la sala in una scena chiara indistinta.
- **Luce:** cielo azzurro credibile con nuvole procedurali, illuminazione zenitale fisica; eventuale alone atmosferico controllato. Evitare fasci bianchi rigidi e luci sovraesposte.
- **Composizione:** il podio e quattro accessi costituiscono il primo piano funzionale; oculo e terza balconata danno verticalità. Il cielo non deve occupare il posto dei contenuti per gli studenti.
- **Significato educativo:** la sala è un ingresso, non il contenuto didattico. Le destinazioni sono Curricolo, Esplora, Percorsi ed Esperienze; la biblioteca deve orientare immediatamente, anche senza rotazione 3D.

## 4. Realizzazione senza perdite
1. Verificare SHA del file Blender P2B/R2 prima di qualsiasi alterazione.
2. Duplicare nella **nuova scena derivata** la seconda galleria, aggiungere parapetti e sostegni veri; non toccare i primi due livelli.
3. Nascondere, senza cancellare, i vecchi tre oggetti di copertura e costruire un solo guscio anulare reale con foro circolare e bordo sottile.
4. Sostituire il vecchio disco cielo con una nuova superficie fisica e materiale procedurale realizzato localmente; modificare solo le luci del derivato.
5. Misurare la scena, renderizzare con Blender Cycles, archiviare .blend + PNG + ricevuta e confrontare il risultato col P2B/R2 e ART-REF-04.
6. Se e solo se la prova 3D supera i controlli, derivare GLB/WebGL dal **nuovo** modello e verificare accessibilità, quattro rotte effettive, GPU, smartphone Android reale e LIM.
7. Conservare anche un'alternativa 2D accessibile per dispositivi che non supportano il 3D.

## 5. Criteri di arresto e scelta conclusiva
**Esito tecnico P3A:** valido soltanto con vera geometria di 4 livelli, oculo circolare verificato, copertura chiusa, sorgente intatta, quattro pannelli, immagine Cycles originale e ricevuta dei controlli.

**Esito artistico P3A:** valutazione separata, su immagine 3D vera, di verticalità, lucernario, luminosità, leggibilità e bilanciamento dei portali; nessuna promozione automatica della sola illustrazione ART-REF-04.

**Decisione finale unica:** se P3A migliora la profondità senza compromettere leggibilità e prestazioni, può sostituire P2A/R4 come *direzione architettonica del prodotto* tramite approvazione esplicita. In caso contrario, P2A/R4 resta il master già approvato. **Nessun ramo parallelo permanente.**

**Divieti:** nessun merge in main, nessuna distribuzione, nessun accesso studenti, nessuna spesa, nessun dato personale. Conservare le prove su GitHub e nel Drive privato con impronte, data, commit e riferimento alla chat.
