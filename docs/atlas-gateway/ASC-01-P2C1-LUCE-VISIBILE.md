# ASC-01/P2C1 — Trasferimento sperimentale della luce su una superficie visibile

Fonte: master immutabile ASP-01 SHA-256 f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab. Base P2B: PR #133, head b9bff7378eb6b7337efb16e734711906b5fdd328, run 44532708279, artifact 14535186361 SHA-256 dd4d39defc5b5395ba13a34a2ef98606a7f88acf049efbb949bd2ab7b52fa2f0. P1 run 44529643085, artifact 14532419098 SHA-256 d9265cc68d178b2eec7f5f8655cacf5ce6631fdc5afd99267b715e5660ecbfde. P2A run 44531048175, artifact 14534077838 SHA-256 c37b3b289d6c4335a26e1139823e7134831a54ac53f98684cef05953838bb45e.

## Scelta del candidato
La prova P2B ha identificato 0 raggi la cui prima intersezione sia una mesh Paper nelle tre inquadrature, con 48.872 pixel variati solo esponendo artificialmente le pagine. Non ha dimostrato che la luce sia trasferibile o che la geometria complessiva possa essere ridotta senza altri confronti. Concentrarsi dunque sulle superfici visibili e statiche della campata 04-0. Selezionare deterministicamente una singola copertina tra Book 0..5 in base alle prime intersezioni della camera di contesto già qualificata dalla ricevuta P2A (non assumere visibilità senza misura). Se le copertine non sono visibili, provare Walnut e Warm limestone; sospendere se nessuna superficie è visibile.

## Prova produttiva P2C1
A — Cycles originale, tutte le luci native.
B — stesso oggetto con mesh temporanea, UV2 AtlasLightmap non sovrapposte (Smart UV Project), bake DIFFUSE: COLOR + DIRECT + INDIRECT su PNG 512x512 con margine 8 e 16 campioni, applicata a shader Emission (senza doppia luce in Blender). Testare coppia in contesto e atrio con identiche camera, luci, esposizione e geometria. Ripristinare e confrontare A. Conservare il PNG bake, il GLB della derivata selezionata, immagini reali e dati grezzi di qualità e costi. Verificare GLB come contenitore valido con texture incorporata e UV secondaria; non presumere che Blender esporti l'estensione unlit o che la pipeline Three r128 sia già qualificata. Un eventuale shader emission non equivale automaticamente a un MeshBasicMaterial nativo.

Il test deve discriminare successo di bake da qualità estetica. Un'immagine diversa da A non implica regressione né promozione; screenshot, pixel variati, percentuale e differenza media servono al riesame umano. Il fotorealismo, i riflessi, il confronto AgX/ACES, la compatibilità r128 e l'esportazione per l'intera campata sono punti successivi. Non aggiungere texture a pagine occultate. Nessun cambio a runtime, navigazione, font, portali, semantic ID, master, repository principale, pubblicazione o autorizzazioni studenti.

## Sicurezza, riuso ed evoluzione
- Recuperare gli archivi esatti e verificare impronte; nessun download di modelli/strumenti non fissati. Blender già fissato.
- Modificare solo copia in memoria di mesh e materiale; conservare intatti tutte le altre 494+ associazioni e materiali e il master su disco.
- Il GLB rimane derivata sperimentale singola: non sostituire il GLB della biblioteca. Non confrontare prestazioni complessive del browser con prove offline.
- Un futuro P2C2 dovrà provare il canale della texture e l'assenza di richieste esterne nell'attuale Three.js r128 con CSP connect-src none. Se il trasferimento non risulta coerente, tornare al PBR originale invece di forzare una derivata visivamente peggiore.
- La successiva modalità C (PBR con luce indiretta precalcolata e riflessi in tempo reale) resta un esperimento distinto; non applicare due volte la luce indiretta o ambiente.
- Tutte le evidenze, comprese quelle negative, confluiranno nei registri ASP, ART-100 e TRAMA-DE-01 prima di una promozione esplicita.

Fonti operative: Blender 4.2 LTS Render Baking; glTF-Blender-IO materiali ed esportazione UV; contratti di compatibilità del runtime nativo r128 già nel repository.
