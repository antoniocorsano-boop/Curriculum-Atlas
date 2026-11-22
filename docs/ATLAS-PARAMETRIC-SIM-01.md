# ATLAS SIM-01 — Laboratorio parametrico per la porta architettonica

**Stato:** sperimentazione privata, non pubblicata; configurazioni di progetto, non modelli Blender approvati.

## Correzione tre livelli — SIM-01.2 (22 novembre 2026)

La rilettura diretta del JPEG canonico ART-DIR-02 (1536 × 864, SHA-256 invariato) distingue **tre livelli architettonici**: piano terra, prima galleria e seconda galleria. L'oculo e la copertura sono sovrastanti e non sono un quarto livello. Il precedente disegno procedurale mostrava le prime due fasce, ma riduceva la terza a una cornice di 0,77 BU: si tratta di un errore di interpretazione.

**Geometria di simulazione aggiornata:** la seconda galleria inizia a quota `upperGallery`; la terza fascia sovrastante ha altezza regolabile `thirdLevelHeight` (1,50–2,80 BU), con imposta della copertura `upperGallery + thirdLevelHeight`. La volta si sviluppa sopra tale quota fino al bordo del lucernario (`roofHeight`). La prima galleria resta a quota 3,21 BU. Sono visibili tre fasce vetrate con pilastri e parapetti, non tre cornicioni sovrapposti. La vista in sezione indica i tre livelli; pianta, prospettiva e anteprima mobile condividono gli stessi valori.

**Limite di sicurezza:** `roofHeight > upperGallery + thirdLevelHeight + 1 BU`, con controllo nel navigatore e nel validatore indipendente. Le altezze e le inquadrature iniziali sono state riviste per consentire tre piani leggibili e mantenere il lucernario interamente in vista; 24 cursori complessivi. La focale e la distanza restano modificabili, senza adattamento automatico nascosto. Il contratto della proposta è aggiornato a `atlas.gateway.parametric-selection/v3`, versione simulatore 1.2.0. Le proposte v2 e varianti memorizzate restano nella loro versione storica e non sono convertite implicitamente.

**Nessun intervento nei modelli Blender qualificati.** Il passo seguente richiede un intervento geometrico reversibile nel ramo P1F, con vero rendering Cycles e giudizio sul riferimento ART-DIR-02, senza propagazione automatica su `main` o pubblicazione.


## Correzione orientamento portali — SIM-01.1 (22 novembre 2026)

Rilievo dell'ideatore: i pannelli risultavano erroneamente sul lato vicino all'osservatore. La camera HERO procedurale guarda da **Y negativa** verso il centro; l'arco dei quattro pannelli era centrato su **270° (−Y)**. Ora l'arco è centrato su **90° (+Y)**, sul **lato opposto all'osservatore**, in modo uniforme nelle tre viste e nell'anteprima mobile. La sezione è ora longitudinale lungo l'asse di profondità Y; pianta e sezione indicano il lato dell'osservatore.

La correzione non inverte la telecamera, non altera la natura vetrata dei pannelli e non sposta il podio. Il controllo dei parametri impedisce di esportare proposte nelle quali un pannello, compresi gli estremi della sua larghezza, attraversi verso il semispazio dell'osservatore anche quando si modifica l'angolo di camera.

**Compatibilità:** contratto esportazione `atlas.gateway.parametric-selection/v2`, campo obbligatorio `portal_placement: "far_side_relative_to_camera"`, versione simulatore 1.1.0. Le precedenti proposte v1 e le vecchie varianti locali non vengono reinterpretate in silenzio; restano consultabili nella versione originaria del simulatore. Non si tratta ancora di una modifica dei modelli Blender qualificati.



## Dove si apre

`public/atlas-gateway/simulatore-parametrico.html` è un singolo file HTML autosufficiente, utilizzabile nel navigatore anche senza accesso a Internet. Contiene direttamente il JPEG canonico ART-DIR-02 (SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`), senza richieste di rete né servizi a pagamento.

Quando il file sarà eventualmente esposto in una distribuzione autorizzata di Next.js, il relativo percorso statico sarà `/atlas-gateway/simulatore-parametrico.html`. **Questa PR non autorizza pubblicazione o deploy.** Non bisogna trattare il percorso teorico come URL già disponibile in produzione.

## Funzioni

- **24 cursori di precisione**, con campo numerico sincronizzato e vincoli geometrici.
- Volumi e gallerie: raggio atrio, quota seconda galleria, altezza del terzo livello, quota oculo, curvatura volta, allungamento planimetrico.
- Oculo: raggio, rapporto ellittico, transizione verso lati più rettilinei (superellisse), orientamento, bordatura e raccordo corto.
- Portali: arco di disposizione, raggio dal centro, spostamenti laterali e in profondità, altezza e larghezza delle quattro lastre, luminosità figurativa.
- Camera: altezza, distanza, inclinazione relativa alla HERO, rotazione laterale, focale.
- Quattro configurazioni iniziali: circolare, ellittica, padiglione allungato, atrio elevato.
- Viste **prospettiva, pianta, sezione**, anteprima mobile permanente durante il controllo, screenshot non necessario per salvare i parametri.
- Confronto di due varianti **A/B**, memorizzazione locale quando autorizzata dal browser, richiamo, ripristino.
- Esportazione, copia e reimportazione di un **JSON di selezione** con data e provenienza canonica.
- Anteprima tramite grafica 3D procedurale proiettata su Canvas 2D. **Non** è un rendering fisico o una manipolazione diretta della maglia originale.

## Contratto JSON e validazione

Schema logico `atlas.gateway.parametric-selection/v3`, unita `BU`, asse `Z` verticale. Il file contiene `parameters`, modello di origine `A/B × J3/J4`, checksum del canone, snapshot A/B e:

```json
{
  "portal_placement": "far_side_relative_to_camera",
  "architecture_levels": {"count": 3, "ground_floor_z": 0, "first_gallery_z": 3.21, "second_gallery_z": 5.95, "roof_spring_z": 8.15},
  "decision": {
    "status": "proposta_da_qualificare",
    "art_approved": false,
    "user_selection_recorded": true,
    "ready_for_blender_review": true,
    "automatically_merge": false,
    "automatically_publish": false
  }
}
```

Validatore (solo lettura):

```bash
python3 scripts/atlas-gateway-production/validate_parametric_selection.py fixtures/atlas-gateway/parametric-selection-example.json
```

## Processo di consolidamento, con conferma umana

1. L'ideatore sperimenta sul simulatore, eventualmente salva A e B.
2. Esporta il JSON che considera più convincente; lo fornisce al processo di studio Blender.
3. Un adattatore Blender futuro, esplicito e verificato, traduce la proposta in **copie temporanee** dei quattro modelli, non in mutazioni immediate dei `.blend` qualificati.
4. Il nuovo rendering Cycles viene comparato a ART-DIR-02, verificando continuità oculo-corona, visibilità dei pannelli, posizione delle gallerie e prestazioni web/mobile.
5. Solo un'approvazione umana distinta dopo le evidenze può promuovere i parametri da proposta a scelta artistica. Nessun merge o deploy automatico.

## Provenienza

- Immagine artistica: [ART-DIR-02](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view).
- Qualificazione originaria quattro modelli: P1D-OCULUS-03, GitHub Actions `45008316673`.
- Stato geometrico di riferimento: PR #185 (identificativo repository GitHub 1376266693), raccordo corto, 24 rendering Cycles e quattro ricevute, commit `1676e546a0d97c1e74b0a41c59aa900e989e1a26`.
- Nessun dato personale o scolastico, nessun caricamento automatico a servizi esterni.
- Origine: conversazione Atlas World Composer del 22 novembre 2026, richiesta di simulatore con cursori per deformazioni, forme e posizioni. URL chat non disponibile.

**Limite esplicito:** i parametri di una superellisse ellittica non corrispondono automaticamente a una deformazione topologicamente valida della cupola J3/J4. La trasformazione geometrica richiede una verifica Blender successiva.
