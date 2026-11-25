# ATLAS — ART-DIR-02 / ARCH-02

**Data:** 21 novembre 2026  
**Stato:** candidata geometrica non approvata; **non pubblicare**.  
**Fonte artistica vincolante:** [ART-REFERENCE-CANONICAL-2026-11-21.json](./ART-REFERENCE-CANONICAL-2026-11-21.json) (JPEG 1536×864, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`).  
**Modello precedente:** ARCH-01, commit `719289d`, archivio originale e candidata [conservato in Drive](https://drive.google.com/file/d/1Cny9U0pDCZaJ0wlU2V-1bcAvIHRaINih/view).  
**Confronto visivo ARCH-01:** [archiviato in Drive](https://drive.google.com/file/d/1cVwuNrcpAOMHswqxhHN38mMZialbK_kS/view).

## Decisione ARCH-02

Dal confronto reale ARCH-01 vs riferimento ART-DIR-02 emergono una copertura troppo scura e dominante, balconate meccanicamente ripetitive, una calotta ATLAS troppo piatta e un'inquadratura che sovrarappresenta il tetto. **Non sono approvate correzioni tramite sovrapposizioni 2D**.

### Modifiche geometriche proposte
1. **OCULUS:** aumento del raggio interno da 5,75 a 7,05 unità; corona architettonica più sottile e adeguamento del disco UV del cielo, senza cambiare immagine originale; velatura della copertura con il materiale traslucido già utilizzato nel modello.
2. **GALLERIES:** 14 campate anziché 20, con profondità alternate nelle nicchie e accenti laterali meno frequenti; due impalcati e parapetti reali preservati.
3. **ATLAS_PODIUM:** semiasse ellittico 4,23 × 2,53 invariato, altezza della calotta da 1,27 a 1,44; marchio originale invariato e rimappato sull'ellissoide mediante lo stesso algoritmo.
4. **CAMERA:** piccoli aggiustamenti della mira di HERO/SIDE/MOBILE, mantenendo tre camere 3D reali e un formato dedicato al telefono.

## Produzione verificabile

- Script Blender indipendente: [`rebuild_architecture_02.py`](../../scripts/atlas-gateway-production/rebuild_architecture_02.py).
- Verifica isolata: [`atlas-art-dir-02-architecture-02.yml`](../../.github/workflows/atlas-art-dir-02-architecture-02.yml).
- Input: master esistente, rigenerato dalla procedura consolidata; nessuna modifica del master originale.
- Output attesi: `atlas-foyer-arch02-candidate.blend`, `hero-arch02-cycles.png`, `side-arch02-cycles.png`, `mobile-arch02-cycles.png`, `architecture-receipt.json`.
- Gli output sono **attesi, non attestati** finché l'esecuzione GitHub Actions non termina con successo; sono conservati come artefatti temporanei, poi da archiviare stabilmente in Drive con manifest e hash.

## Criteri di accettazione artistica (verifica umana)

1. La copertura non domina più il primo piano; il lucernario resta leggibile e coerente con la fonte.
2. Le due gallerie mostrano profondità laterale e ritmo costruttivo credibile, senza una fitta griglia artificiosa.
3. La calotta è bassa ma morbidamente convessa; marchio originale e anelli restano leggibili.
4. Tutti e quattro i portali restano riconoscibili nella vista HERO e sul telefono, senza duplicazione di testi UI.
5. HERO e SIDE mostrano volumi reali, non una stampa del riferimento; la resa non dipende da una sola prospettiva.
6. Il confronto con le coordinate normalizzate in `ART-DIR-02-CANONICAL-LANDMARKS.json` documenta gli scostamenti principali, senza promettere corrispondenza perfetta da una sola immagine.
7. Non si passa a materiali, luci finali, GLB o pubblicazione prima del giudizio sulla geometria.

**Invarianti:** ARCH-01 e master originale preservati; nessuna approvazione artistica implicita; nessuna fusione in `main`, distribuzione a studenti o sostituzione delle pagine Atlas.

## Verifica effettiva di ARCH-02 — 21 novembre 2026

**Esito tecnico:** PASS — [GitHub Actions #44863392834](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44863392834), commit `45865c743eddedc83e5a315a8d5334665b440d9e`, 10/10 passi completati con successo. Modello prodotto con 201 mesh, 14 campate, due livelli di gallerie, raggio del lucernario 7,05 e quattro portali preservati. Il file `architecture-receipt.json` conferma master originale non modificato e divieto di pubblicazione.

**Archivio Blender originale e candidata, prove e tre immagini:** [Drive ARCH-02](https://drive.google.com/file/d/1dXA76lWgadrdun35JXMsOUHhRWPeI2ZD/view), ZIP 5.643.977 byte lato GitHub, archiviazione in Drive verificata mediante metadati (il diverso valore può derivare dalla visualizzazione arrotondata). Hash artefatto GitHub: `sha256:ba8acf912a01519cfd6fd7c70451ccfb1ecb563527236a9fb126179476d9afe5`.

**Confronto visuale HERO/SIDE/MOBILE con ART-DIR-02:** [Drive — diagnosi 4 viste](https://drive.google.com/file/d/1jkY-J3z-XJeEPE0FUCfOQ4P1k3H3DrFA/view).

### Esito artistico: NON APPROVATO

- La copertura resta scura e troppo dominante, nonostante l'aumento del lucernario; il cielo non appare integrato nella struttura come nel riferimento.
- I quattro pannelli sono corretti come destinazioni ma **sottodimensionati** e quasi paralleli; mancano la profondità, la qualità visiva e i segni narrativi dell'immagine.
- Le gallerie, pur reali e articolate su due livelli, risultano troppo regolari e prive di differenziazione laterale credibile.
- Il basamento è più convesso, ma luce, materiali, riflessi e scala apparente non corrispondono ancora al riferimento canonico.
- Il rendering MOBILE conserva la scena, ma i quattro accessi sono troppo piccoli per risultare ben leggibili su telefono.

**Decisione di produzione:** non effettuare export web GLB né integrazione/pubblicazione. Conservare ARCH-02 come prova geometrica e avviare la fase successiva soltanto partendo da una correzione di **composizione e scala apparente** (camera matching/portali/podio/lucernario), seguita da allestimento laterale e qualità materica. Evitare cicli di aggiustamenti marginali che non riducano visibilmente la distanza dal riferimento.

**Limite delle prove:** il superamento di GitHub Actions garantisce la produzione delle immagini e l'integrità dei file, non la conformità artistica né le prestazioni su smartphone fisico.
