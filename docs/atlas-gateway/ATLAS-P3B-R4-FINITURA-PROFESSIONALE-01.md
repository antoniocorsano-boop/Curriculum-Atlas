# ATLAS P3B/R4 — Finitura architettonica professionale: candidata visiva

**Data:** 23 novembre 2026 · **Sorgente immutabile:** Blender P3A/R2, SHA-256 `35371d226c289bd348a1137f63bfd14c74ee79389c4c1b53b522759ca0246d30`.  
**Linea esistente:** PR #188, nessun nuovo padiglione e nessuna sostituzione del modello P3A/R2.  
**Stato:** PROVA ARTISTICA R4 DA VALUTARE; non approvazione, non pubblicazione.

## Scopo
Il difetto osservato non è l'assenza del 3D, bensì la differenza tra geometria tecnicamente corretta e esperienza architettonica convincente. Le animazioni P3C non risolvono matericità, illuminazione e composizione. Questa revisione interviene **solo sulla resa della scena Blender**, lasciando il GLB P3B/R2 e i portali interattivi inalterati.

## Intervento effettivo
- **Materiali:** cinque gruppi PBR con due scale procedurali di variazione cromatica e rugosità; microporosità tramite rilievo simulato per pietra, pavimento, gallerie e pilastri; vetro cobalto senza rilievo artificioso, con trasmissione e rugosità calibrate. Nessuna trama acquistata, nessuna risorsa esterna.
- **Illuminazione:** cielo fisico e illuminazione diffusa, tre luci architettoniche a grande superficie, quattro accenti ancorati ai **veri pannelli di vetro** mediante i loro perimetri 3D. Non vengono aggiunti falsi oggetti di arredo o portali.
- **Fotografia:** gestione cromatica AgX quando disponibile, altrimenti Filmic; lieve regolazione dell'esposizione; fotogrammi veri Blender Cycles 1280×720 e 390×844, 64 campioni con riduzione del rumore.
- **Integrità:** stessa camera principale, stessi quattro livelli, oculo di raggio 6,25 BU, stessi portali, stesse trasformazioni/geometrie; master originale non modificato. Output solo derivato .blend, due PNG e ricevuta con SHA.

## Filiera e responsabilità
La specifica deterministica è `docs/atlas-gateway/ATLAS-P3B-R4-FINITURA-PROFESSIONALE-01.json`. Il generatore è l'adattatore già governato `scripts/atlas-gateway-production/atlas_art_direction_capability.py`, compatibile con la vecchia R3. La prova GitHub `atlas-art-finish-r4.yml` usa lo stesso master qualificato, senza servizi a pagamento, caricamento pubblico né pubblicazione agli studenti.

**Non considerare i nodi procedurali Cycles trasferiti automaticamente al browser.** Un eventuale GLB R4 richiederà una successiva lavorazione esplicita delle mappe PBR e dell'illuminazione precalcolata, controllata su dispositivo reale.

## Verifica artistica prima di proseguire
1. **Composizione:** si riconoscono subito quattro portali, podio, terza balconata, profondità e oculo; il cielo non domina.
2. **Materia:** pavimento, copertura, montanti, gallerie e vetro non sono più superfici uniformi; riflessioni plausibili e assenza di artefatti.
3. **Luce:** atmosfera accogliente, contrasti equilibrati, leggibilità del primo piano, niente illuminazione teatrale eccessiva.
4. **Telefono:** l'inquadratura verticale non nasconde i portali né taglia i riferimenti per orientarsi.
5. **Fidelità:** confronto visivo con ART-REF-04, **distinguendo riferimento illustrato e render vero**.

Il revisore deve vedere le due immagini originali e registrare accettazione o rilievi. **Un controllo automatico verde prova soltanto la qualità tecnica dell'esecuzione, non la qualità estetica.**

## Restrizioni
`ART_FINAL_APPROVED=false`, `WEB_TRANSLATION_QUALIFIED=false`, `ANDROID_PHYSICAL_QUALIFIED=false`, `STUDENT_PUBLICATION_APPROVED=false`, `MAIN_MERGE_APPROVED=false`. Non sovrascrivere P3A/R2, non promuovere automaticamente la scena pubblica, non aprire nuovi servizi o abbonamenti. Conservare su Drive un unico archivio della candidata approvata, evitando copie delle versioni intermedie. 
