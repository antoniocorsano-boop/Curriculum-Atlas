# ATLAS-ATRIUM-3D-SEED-02 — Revisione geometrica sperimentale da render reali

**Data:** 20 novembre 2026.  
**Stato:** **GLB-02 prodotto e verificato, confrontato visivamente con GLB-01 mediante renderer 3D VTK; NON certificato ART-DIR-02, NON modello Blender finale.**  
**Base progettuale precedente:** [ATLAS-ATRIUM-BLUEPRINT-01](./ATLAS-ATRIUM-BLUEPRINT-01.md), [SEED-01](./ATLAS-ATRIUM-3D-SEED-01.md).  
**Nuova configurazione versionata:** [ATLAS-ATRIUM-BLUEPRINT-02.json](./ATLAS-ATRIUM-BLUEPRINT-02.json).

## Risultato effettivamente ottenuto

Il generatore 3D preesistente è stato eseguito con il Blueprint-02. Il modello tridimensionale **è reale**, in formato GLB, con **308 mesh** e **68.796 triangoli**; la rilettura dell'esportazione tramite Trimesh ha avuto esito positivo.

- **GLB V2:** `ATLAS-ATRIUM-3D-SEED-02.glb`, **979.756 byte**, SHA-256 `51f280aea8a9e57b4759317a112c170096701eed6b1a1d1b5f5bd3710dcb93a1`.
- **Pacchetto permanente, contenente il GLB, il Blueprint-02 e le viste VTK HERO/SIDE/MOBILE:** [Drive Curriculum Atlas — SEED-02](https://drive.google.com/file/d/1AqK_L45BYeWVZ6cn3RdM-swIxEvzB0HN/view). ZIP **1.406.862 byte**, SHA-256 `7055ae48b97435c7bc870517e7a71e54d64f722d5feefe04efe153f126616220`.
- **Vista di confronto locale:** `atlas-atrium-seed-01-vs-02.png`, SHA-256 `b0456f0143385c815836b7d95deded9c0532c96792df4a1bb666a25c3f457e47`; l'immagine è stata prodotta nel contesto della stessa esecuzione, non contiene render Cycles.
- **Prove precedenti:** [ATLAS-3D-SEED-VIEWS-01](./ATLAS-3D-SEED-VIEWS-01.md), conservate nel [Drive](https://drive.google.com/file/d/1Fsv_KDX4S_pFmlR941Curp_0_iOH35bF/view).

## Correzioni parametriche esplicite: V1 → V2

| Oggetto / controllo | Prima | Seconda versione | Esito osservato |
|---|---:|---:|---|
| Raggio lucernario | 0,34 R | **0,53 R** | Oculo più leggibile nella vista frontale |
| Quota visibile copertura | 1,35 R | **1,28 R** | Cambiamento della silhouette in alto |
| Altezza portali | 0,46 R | **0,60 R** | Portali più presenti |
| Larghezza portali | 0,16 R | **0,18 R** | Maggior presenza frontale |
| Raggio piattaforma | 0,30 R | **0,36 R** | Maggior presenza del nucleo ATLAS |
| Semiasse X podio | 0,22 R | **0,275 R** | Massa centrale più ampia |
| Semiasse Y podio | 0,18 R | **0,225 R** | Rapporto ellittico preservato |
| Altezza podio | 0,14 R | **0,18 R** | Volume più pronunciato |
| Camera SIDE | Esterna, parzialmente occlusa | **Interna alla rotonda** | Profondità meglio osservabile |
| Camera MOBILE | Inquadratura troppo ampia | **FOV orizz. 50° dedicato** | Migliore sfruttamento dello schermo |

**Restano invariati:** quattro portali Curricolo, Esplora, Percorsi, Esperienze, disposizione simmetrica, scheletro a due ordini, struttura tridimensionale vera. La seed originale non viene sovrascritta.

## Problemi reali ancora presenti

1. **La massa della copertura e degli anelli di galleria è eccessiva nel fotogramma HERO**, con ampie fasce scure. Non si corregge soltanto aumentando il diametro dell'oculo o spostando la camera.
2. La **SEED-02 è solo una geometria concettuale**: non comprende vetri rifiniti, libri credibili, branding finale, materiali e luci cinematografici.
3. La nuova HERO rende i portali più grandi, ma la parte inferiore del podio rischia di risultare tagliata: occorre ottimizzare insieme camera, quote e spazi vuoti.
4. Il PNG definitivo ART-DIR-02 con SHA-256 `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336` non è ancora accessibile come sorgente binaria produttiva. **Nessuna misura di errore pixel o approvazione visiva può quindi essere dichiarata.**

## Blender: attività avviata, non certificata

La procedura GitHub Actions [atlas-atrium-seed-blender.yml](../../.github/workflows/atlas-atrium-seed-blender.yml) è stata realmente salvata sul ramo `work/atlas-gateway-01-foyer`. Essa mira alla generazione del GLB da Blueprint-01, all'importazione in Blender, al salvataggio del file `.blend` e alla generazione di tre render con Cycles; **l'esito del relativo job non è ancora disponibile qui**, pertanto **non** si dichiara né Master Blender realizzato né render Cycles eseguito. Per evitare di interrompere un job eventualmente attivo, il processo rimane vincolato a Blueprint-01 finché non ne abbiamo i risultati.

## Decisione di qualità

**Non promuovere SEED-02 a modello definitivo.** Usare il confronto V1/V2 come prova diagnostica per la ricostruzione della copertura e della camera, e tarare le proporzioni sul PNG originale, prima di materiali professionali, WebGL o distribuzione. Conservare i file originali della prova e la loro provenienza.
