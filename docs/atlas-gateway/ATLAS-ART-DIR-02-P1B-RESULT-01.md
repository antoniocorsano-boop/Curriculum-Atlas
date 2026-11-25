# ART-DIR-02 — P1B | Prima correzione reale a vincoli multipli

**Data:** 22 novembre 2026 · **Stato:** `REAL_BLENDER_TECH_PASS__MULTIANCHOR_SCREEN_GATE_PASS__ART_NOT_APPROVED`.  
**Attenzione:** è una prova geometrica **neutra** su un'immagine sintetica, non fotogrammetria fSpy, non un modello metricamente certificato e non una scena artistica approvata.

## 1. Fonti immutabili e produzione riproducibile

- Immagine originale ART-DIR-02 [Drive](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view), SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.
- Modello neutro P1 [Drive](https://drive.google.com/file/d/15SBPenEvYFjCB7Z7DHL9mRn7HQKjJF8F/view), `.blend` SHA-256 `d35c42c2f4b50dafa01dfb7ab27a113ec9c954b09b6629e2239c54b589833a3b` — **sorgente non alterata**.
- [PR #170 P1B](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/170) in bozza; ramo `work/atlas-artdir02-p1b-multianchor`, script `scripts/atlas-gateway-production/p1b_multianchor_clay.py`, workflow `.github/workflows/atlas-art-dir02-p1b.yml`.
- [Actions #44976549294](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44976549294) — **tutti i controlli tecnici PASS**. Una prima esecuzione #44976386952 è stata **annullata** dopo aver alleggerito il campionamento prospettico; non è una prova finale.
- Archivio master **Blender editabile + due render Cycles + JSON di misurazione**: [Drive P1B](https://drive.google.com/file/d/1Tvv8gJLjVaPuvAox_Gu1CBQlVBdPkmYM/view), ZIP 16.055.054 byte SHA-256 `c3dedca191e425fe7a7fdbef3e75cf9e2154591119c306168c280cdc89095446`, file `atlas-art-dir02-p1b-multianchor-clay.blend` 12.955.372 byte SHA-256 `e16fa837ea85d27eff225c3a4e4fc8ff63e00a298a597d8710d32d3536351c7c`.
- [Confronto canonico ART-DIR-02 / P1B](https://drive.google.com/file/d/1yaSHYAU1K2xozD6JMDUuHWn-1u0MUuFB/view) — JPEG 570.282 byte SHA-256 `6758ee9d9ef623a098339298c12f0179d376d9d005dacafd0f6f002fbb0a309f`.
- [Confronto P1 neutro / P1B neutro](https://drive.google.com/file/d/1WYOBNrUrS3f13cnP5peyN2GiTUF0m4Dd/view) — JPEG 638.823 byte SHA-256 `98870529bb3cadc46e3e4f04d6fe856188572230ef9aece750672d8a3f7c1070`.

## 2. Che cosa è stato effettivamente modificato nel modello

1. Il modello `.blend` P1 è stato riaperto, verificando impronta SHA e 4 portali semantici, 4 basamenti metallici, 3 collezioni di modelli CC0; nessun modello è stato ricreato da immagini o sostituito con un dipinto.
2. La ricerca ottimizza **contemporaneamente** 4 pannelli (centri, alto e basso, distanza centrale), l'orlo dell'oculo, due livelli di parapetti e il profilo del podio.
3. Il gap centrale P1 è stato contratto con **moltiplicatore 0,944 delle coordinate orizzontali delle sole radici interne**. Portali esterni e basi semantiche originali sono conservati; **i quattro riferimenti di interazione web devono essere ricollaudati in P2**, non assumere che gli hotspot siano già corretti.
4. Per rendere visibile la volta senza alterare la distribuzione buona dei portali, è stata introdotta **una trasformazione scenografica continua della parte alta**, applicata a 288 oggetti architettonici originali. Formula `z_new = z_old − delta × smoothstep((z_old−4,35)/6,05)`. Questa scelta **non è una dimostrazione che tale geometria sia un edificio reale**.
5. I materiali originali restano nella scena, ma il `View Layer` utilizza un rivestimento grigio neutro per testare la composizione; **non si giudicano qui luce, colore, riflessi o resa finale dei portali**.
6. La ricevuta contiene parametri, costo geometrico delle ancore, immagini, oggetti e file SHA-256. Nessun nuovo acquisto o provider aggiunto.

## 3. Valori della soluzione prodotta

| Controllo | Valore P1B |
|---|---:|
| Focale | **31,5 mm** |
| Camera Blender | **(0; −18,3; 3,4)** |
| Quota osservata verso il fondo | **2,5 BU** |
| Decentramento verticale | **−0,05** |
| Fattore x dei portali interni rispetto a P1 | **0,944** |
| Deformazione scenografica massima della zona superiore | **3,55 BU** |
| Quattro centri dei portali | 0,213 / 0,394 / 0,607 / 0,788 della larghezza |
| Distanza proiettata tra le lastre interne | **7,32% della larghezza** |

**Il cielo non era visibile in P1:** bordo inferiore dell'anello a `v=−0,1045` (sopra il fotogramma). Nella P1B è ora **a `v=0,1346`**, con bordo superiore a `v=−0,0155`: l'oculo rientra nell'immagine, con parte superiore tagliata, come nel riferimento.

| Vincolo geometrico | P1 | P1B | Valutazione |
|---|---:|---:|---|
| Bordo inferiore orlo del lucernario `v` | −0,1045 | **0,1346** | **Soddisfatto** |
| Separazione centrale | ~8,7% | **7,32%** | Miglioramento, un po' superiore al riferimento di ~6% |
| Centro Curricolo `u` | 0,2089 | **0,2134** | Entro intervallo di lettura |
| Centro Esplora `u` | 0,3857 | **0,3938** | Entro intervallo |
| Centro Percorsi `u` | 0,6150 | **0,6068** | Entro intervallo |
| Centro Esperienze `u` | 0,7920 | **0,7875** | Entro intervallo |
| Posizione galleria superiore `v` (campione centrale) | 0,1290 | **0,2332** | Rientrata in scena |
| Posizione galleria inferiore `v` | 0,3018 | **0,3098** | Quasi conservata |
| Podio: bordo superiore `v` | 0,4617 | **0,4607** | Conservato |

**Nota di correttezza:** il punteggio numerico delle sole ancore dei portali passa da **0,00301 a 0,00444** (lievemente peggiore) perché ora vengono rispettati anche altri elementi. Non attribuire erroneamente alla P1B un miglioramento di ogni singola misura.

## 4. Prove e giudizio qualitativo

- Il collaudo automatico verifica: **oculo visibile, quattro centri plausibili, distanza centrale plausibile, ordine dei livelli delle gallerie, portali entro errore prestabilito e podio visibile**. Tutti e sei sono risultati `true` sulla vera scena.
- Il confronto visivo mostra che la P1B **ha recuperato l'oculo senza perdere i portali**, che era precisamente il difetto bloccante di P1.
- **Rilievo artistico sostanziale:** la zona superiore risulta troppo appiattita e l'oculo troppo simile a un disco ovale bianco; la copertura e le balconate perdono parte della profondità monumentale vista nel riferimento. La deformazione continua forte (3,55 BU) è un indizio che la nostra proiezione unica non spiega in maniera convincente tutta l'immagine sintetica.
- Le due gallerie tecnicamente sono ordinate, ma la separazione centrale misurata si riduce da 17,3% a circa **7,7% del fotogramma**: serve verificare **l'altezza percepita del volume** prima di dichiarare superata la fedeltà geometrica.
- Il podio conserva il proprio ingombro generale ma non ha la complessità scultorea della sorgente; i vetri sono volutamente privi di materiali fotografici nella prova clay.

**Giudizio:** `P1B_TECH_PASS__PERSPECTIVE_SCREEN_GATE_PASS__ARTISTIC_NOT_APPROVED`. È una **prova riuscita di fattibilità del metodo** e una nuova base modificabile; non la geometria finale approvata e non una scena da distribuire sul web.

## 5. Decisione esecutiva successiva

**Non aprire un altro studio astratto e non riavviare R2–R8.** Il prossimo intervento, se richiesto, deve essere **una singola rifinitura geometrica sulla stessa P1B**, verificando come ridurre la deformazione della parte superiore e recuperare profondità concava della volta senza far uscire l'oculo dall'immagine. Solo dopo approvazione della geometria, provare la regia luminosa professionale. L'attuale controllo numerico non autorizza il passaggio cieco a un'altra iterazione di luci.

**Invarianti:** fonte originale e P1 immutati; la PR #170 è bozza; nessun merge, deploy, pubblicazione agli studenti né trattamento di dati personali. Programmi, ricevute e archivi consentono la riproduzione.
