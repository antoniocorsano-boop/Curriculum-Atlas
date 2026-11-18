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
