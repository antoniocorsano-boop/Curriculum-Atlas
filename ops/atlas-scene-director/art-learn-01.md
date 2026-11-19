# ART-LEARN-01 — Apprendimento artistico da scene Blender verificabili

**Stato:** implementato, qualificazione da eseguire. Nessuna approvazione artistica o pubblicazione.

## Decisione

La qualità artistica non si ottiene aggiungendo indefinitamente motori. Studio Atlas osserva scene di riferimento reali, separa osservazioni, prove causali e ipotesi trasferibili, quindi verifica una modifica sul proprio master prima di promuoverla nel repertorio. Non si tratta di addestrare un modello neurale.

Il master Blender resta la fonte autoritativa; ASD gestisce le proposte, ASI osserva e misura, ASP conserva provenienza ed evidenze. Gaffer resta un adattatore sperimentale qualificato P0/P1A, senza trasferimento fedele dei materiali. Nessuna sostituzione del master.

## Riferimento iniziale

- Classroom — Christophe Seux — CC0 1.0, secondo il catalogo ufficiale https://www.blender.org/download/demo-files/.
- Archivio ufficiale: https://mirror.blender.org/demo/test/classroom.zip.
- Impronta attesa: 0f0ecc58d45f12b2f4272a53e2d8e69135518e16e956b118f10c20d8dcfdf5e6; 70.279.690 byte. Provenienza dell'impronta: https://github.com/ArturPHD/blender_dataset_capture_kit/blob/main/docs/SCENE_ASSETS.md; da verificare sul download prima di aprire il file.
- Master Atlas: artefatto 14444143410; SHA-256 del blend f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab.
- Blender 4.2.23, CPU; nessuna infrastruttura a pagamento introdotta. Non si assumono crediti o capacità cloud illimitati.

## Metodo replicabile

1. Recupero di fonte autorizzata e verifica dell'integrità; apertura senza autoexec, sorgente non salvata.
2. Inventario di geometrie, camera, luci, materiali (nodi, collegamenti, input), texture, ambiente, compositore e gestione colore.
3. Rendering della scena di riferimento a risoluzione e campionamento ridotti, con ablazione di una luce e ripristino. Misura della differenza pixel e controllo del ripristino. Non equivale a un giudizio estetico.
4. Osservazione del master Atlas con lo stesso estrattore; confronto documentato. Nessun parametro trasferito automaticamente.
5. Proposta di una tecnica con fonte, motivazione, ambito, vincoli, parametri candidati, prova richiesta e rollback. I nomi candidati non costituiscono binding qualificati.
6. Solo dopo la revisione: prova isolata sul master derivato, rendering comparativo con camera e geometria protette, riesame artistico e qualificazione. Trasferibilità ad altri mondi da provare separatamente.

## Evidenze

Workflow Atlas Scene Observation — ASI-01 L2 Blender, job ART-LEARN-01. Artefatto atlas-art-learn-01-classroom: source.json, reference/observation.json, reference/reference.png, reference/light-ablation.png, reference/restored.png, atlas/observation.json, comparison.json, log. Il rapporto può essere parziale in caso di arresto. Nessuna copia degli asset sorgente nel repository.

## Criterio di promozione

PASS_REFERENCE_STUDY_ONLY attesta il primo studio e non la qualità di Atlas. Il repertorio contiene solo osservazioni e candidati fino a quando una prova su Atlas dimostra effetto, fedeltà, reversibilità e beneficio percepibile. La scelta di un ulteriore riferimento (Barcelona Pavilion o altra scena con licenza verificata) dipende dagli esiti, non da una promessa di fotorealismo. Nessuna autorizzazione a scrivere sul master, al rilascio o all'uso studenti.

## ART-LEARN-02 — Trasferimento controllato della gerarchia luminosa

Decisione basata sullo studio ART-LEARN-01 qualificato alla revisione bca6ac4c07ce3d38a3737ca79f6d57e267528e6a, esecuzione 44392517820, artefatto 14467907953 (SHA-256 7fc44fa16faf32ff1db6f72a03c96d32981049d389582212abe6b9e76284031d). Classroom: ablazione del sole con variazione di 174.589 su 225.348 pixel e ripristino con MAE zero. Atlas: 47 sorgenti, di cui 36 scaffali, 8 corona, 1 sole, 1 cielo, 1 riempimento frontale. Il numero di luci non è un indice di qualità.

**Ipotesi AL-LIGHT-01:** gerarchia funzionale delle luci, con contributo naturale identificabile e luce pratica subordinata. Non trasferire i watt della scena Classroom.

| Prova | Sole | Cielo | Scaffali | Corona | Frontale |
|---|---:|---:|---:|---:|---:|
| 01 Riferimento | 1 | 1 | 1 | 1 | 1 |
| 02 Ablazione sole | nascosto | 1 | 1 | 1 | 1 |
| 03 Gerarchia pratica | 1 | 1 | 0,40 | 0,35 | 0,25 |
| 04 Gerarchia direzionale | 1,35 | 0,75 | 0,40 | 0,35 | 0,25 |
| 05 Ripristino | 1 | 1 | 1 | 1 | 1 |

Moltiplicatori relativi alla configurazione Atlas, proposti per la prova e non qualificati come ricetta universale. Prova 04 modifica insieme sole e cielo: è un confronto composito, non attribuibile separatamente ai due fattori. Nessuna modifica di geometria, camera, materiali, ambiente o esposizione. I cinque rendering usano lo stesso campionamento, risoluzione e gestione del colore. Misure di variazione RGB, luminanza e ripristino, impronte SHA-256 e inventario delle luci vengono conservati in transfer.json. Il master non è salvato e viene verificato a fine prova. Nessun asset Classroom trasferito.

**Stato:** implementato, collaudo e riesame artistico ancora necessari. PASS_CONTROLLED_TRANSFER_CANDIDATES indica solo prova tecnica; prima della promozione al repertorio ASD occorre confrontare le immagini effettive, verificare leggibilità degli elementi educativi, profondità, naturalezza, qualità delle superfici e stabilità delle altre inquadrature. Il principio è riutilizzabile come ipotesi; la configurazione numerica è specifica del mondo biblioteca. Nessuna pubblicazione, approvazione artistica o autorizzazione studenti.
