# ATLAS-GATEWAY-HYBRID-HOVER-01 — Prima prova interattiva dei quattro portali

**Data:** 20 novembre 2026.  
**Stato:** `BROWSER_TECHNICAL_INTERACTION_PASS` per l'effetto puntatore/tastiera; **NON** è un test Android fisico o un prodotto 3D integrato; **non pubblicato**.

## Scopo

Verificare sul riferimento Atlas a quattro portali l'effetto richiesto dall'ideatore: **quando il mouse attraversa un portale, il pannello si inclina di pochi gradi seguendo la posizione del cursore, avanza leggermente e aumenta il bagliore**, poi ritorna dolcemente nella posizione iniziale. Nessun movimento continuo della camera o del fondale.

## Artefatti effettivamente prodotti

- **Prova HTML funzionante** con `index.html`, quattro immagini con maschere di ritaglio, fondo ricostruito da una copia dell'immagine e logica JS. Per la visione offline aprire `index.html` dopo aver estratto tutti i file dallo ZIP.
- [Archivio permanente nel Drive di Curriculum Atlas](https://drive.google.com/file/d/1oSA1KSp_hJp2eipYCM7oaFsfEhqyARwr/view): `ATLAS-GATEWAY-HYBRID-HOVER-01-prova-interattiva-2026-11-20.zip`, **6.549.540 byte**, SHA-256 `a31c5f34b293621d6612f3cfbccfb02835749d84390ab6e1a3154cfcb93ab258`, **14 componenti**, ZIP riaperto e verificato; metadati Drive riletti dopo l'archiviazione.
- [Sorgente JavaScript riusabile](../../scripts/atlas-gateway-foyer/hybrid-hover-01/interactions.js) — identico al codice di interazione della prova HTML, verificato in rilettura GitHub; il pacchetto Drive conserva il codice completo e tutti gli asset.
- Due schermate di evidenza contenute nello ZIP: `preview-riposo.png` e `preview-mouse-esplora.png`.
- `BROWSER-EVIDENCE-01.json` nel pacchetto: parametri, risultati e verifiche.

## Parametri in prova

| Proprietà | Valore |
|---|---|
| Rotazione sull'asse X | massimo ±3° |
| Rotazione sull'asse Y | massimo ±4° |
| Ingrandimento selezione | 1,025× |
| Piccolo sollevamento | 3 px |
| Luminosità pannello attivo | +9% |
| Bagliore | 7 px |
| Interpolazione | 0,15 per fotogramma, avvicinamento/ritorno |
| Mouse | Direzione e ampiezza in funzione della posizione interna al portale |
| Tocco | Attivazione discreta, senza inseguimento continuo del dito |
| Tastiera | Focus portale + selezione da Invio, Escape per uscire |
| Preferenza riduzione movimento | Nessuna rotazione o ingrandimento |

## Verifiche eseguite

Test con Chromium/Playwright: rilevati **4 pulsanti portale indipendenti**, inclinazione attiva per mouse (esempio +1,474° X e +1,966° Y), ritorno vicino a zero dopo uscita (+0,041° e +0,055°), click di selezione, focus via Tab, attivazione via Invio, stile `transform: none` con `prefers-reduced-motion: reduce`, zero eccezioni JavaScript. Screenshot desktop reali prodotti con risorse incorporate nella pagina per aggirare il blocco della navigazione `file://` nell'ambiente di prova. **Non** collaudato su smartphone fisico.

## Vincoli di veridicità

1. **Questa prima prova utilizza pannelli 2D ritagliati e trasformazioni CSS prospettiche**, non **quattro mesh tridimensionali WebGL**. Serve a scegliere l'intensità e il comportamento dei micro-movimenti prima di trasferirli alle mesh reali.
2. Il fondale è derivato dall'immagine Atlas **generata nella conversazione del 20/11** e **non** dal PNG canonico originale ART-DIR-02 1672×941 con SHA-256 `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`, non ancora materializzato nel deposito produttivo. L'immagine della dimostrazione (1672×941) ha SHA-256 `fdaa269ce150194e3ca55f576ba039f799cd297185e5d4e0e131b4b44f3e37c2`, **diversa dall'originale approvato**.
3. Il fondo `plate-prova.jpg` rimuove i quattro pannelli mediante **inpainting automatico approssimativo** delle parti coperte; serve soltanto a rendere leggibile la rotazione. Non è un fondale approvato o una ricostruzione credibile delle superfici nascoste.
4. I quattro clic mostrano feedback dimostrativo. **Non sono state modificate né simulate rotte ufficiali Atlas**.
5. L'effetto non cancella il lavoro Master Blender/SEED-03 e non qualifica lo schema ibrido come sostituzione del 3D navigabile.
6. Lo studio non modifica il runtime pubblico, non effettua merge e non autorizza pubblicazione.

## Passaggio successivo

Se il movimento piace all'ideatore, trasformare il comportamento in componente **reale 3D WebGL** riutilizzando la geometria dei quattro portali e il runtime esistente (senza nuove dipendenze a pagamento); raccogliere un fondale pulito approvato e ripristinare la corretta occlusione del podio. Conservare l'immagine ART-DIR-02 come autorità visiva e validare l'anteprima Android e l'accessibilità.

**Origine decisione:** [ATLAS-GATEWAY-HYBRID-01](./ATLAS-GATEWAY-HYBRID-01.md), [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md), [Atlas #151](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/151), [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354).
