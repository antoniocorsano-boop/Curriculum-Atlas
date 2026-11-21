# ATLAS-3D-SEED-VIEWS-01 — Prove prospettiche effettive e difetti verificati

**Data:** 20 novembre 2026.  
**Stato:** **RENDER DIAGNOSTICI REALI DEL GLB, CON DOTAZIONE LOCALE VTK 9.6**. Non render Blender/Cycles e non equivalenti al riferimento artistico ART-DIR-02.  
**Origine geometria:** [ATLAS-ATRIUM-3D-SEED-01](./ATLAS-ATRIUM-3D-SEED-01.md), fonte GLB SHA-256 `2800580409408efae6cc9181354a622959aee67ffb6620531f1db1e0b40b6ddf`.  
**Riproducibilità:** archivio degli artefatti e del programma VTK salvato nel Drive del progetto [ATLAS-3D-SEED-VIEWS-01](https://drive.google.com/file/d/1Fsv_KDX4S_pFmlR941Curp_0_iOH35bF/view) (ZIP SHA-256 `936a023cc1f558f420a20fac352adca8f4faf1d40f17f6c2d09f832cd9db8fe9`).  
**Compositore:** [ATLAS-ATRIUM-COMPOSER-KIT-01](./ATLAS-ATRIUM-COMPOSER-KIT-01.md), specifiche superiori [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md).

## Esecuzione davvero svolta

Il renderer VTK ha importato **308 attori** del GLB e prodotto **quattro inquadrature di base**: `cam_hero.png` (1280×720), `cam_side.png` (1280×720), `cam_mobile.png` (720×1120), `cam_hero_pitch_test.png` (1280×720). Sono state inoltre renderizzate due varianti per isolare i problemi della camera laterale e mobile: `cam_side_interior_test.png`, `cam_mobile_framed_test.png`. **Tutte le immagini e il sorgente** `render_seed_vtk.py` sono nell'archivio Drive.

La tavola a quattro immagini `ATLAS-3D-SEED-VIEWS-01.png` ha SHA-256 `26fa7000795e01958ac1e3b57415609f98806988486a79745a85b99643bf08d9`. Il file `ATLAS-3D-SEED-VIEWS-01-evidence.json` contiene hash e proprietà di ciascun render.

## Difetti causali osservati (prima qualificazione architettonica)

| Vista | Risultato osservato | Necessità di modifica |
|---|---|---|
| HERO | Quattro portali e podio presenti ma **copertura scura sovradimensionata**, lucernario poco visibile, portali e podio visivamente ridotti | Rivedere pieno/vuoto copertura e la camera; calibrare sulla fonte canonica |
| SIDE dalla seed | Parte prevalente dell'immagine occupata dalla massa della parete laterale | Camera fuori dalla rotonda: usare posizione interna di controllo, mantenendo geometria vera |
| MOBILE dalla seed | La rotonda risulta molto piccola nello schermo | Campo visivo troppo ampio per il rapporto 9:16; utilizzare un'inquadratura mobile dedicata |
| HERO rialzata | Più copertura/oculo ma podio e portali scendono ai margini | L'inclinazione da sola non ripara lo squilibrio geometrico |
| SIDE interna sperimentale | Dimostra meglio la profondità e la presenza di quattro portali | Restano copertura scura e proporzioni da correggere |
| MOBILE ricomposta | Aumenta la leggibilità dei volumi rispetto alla prima versione | Occorre riprogettare luce, corpi architettonici e navigazione |

Parametri delle varianti: [ATLAS-CAMERA-DIAGNOSTIC-02](./ATLAS-CAMERA-DIAGNOSTIC-02.json). La seed 01 e il BLUEPRINT-01 restano intatti, così ogni cambiamento è confrontabile.

## Filiera Blender avviata, ma esito non ancora acquisito

È stato creato il processo automatico [atlas-atrium-seed-blender.yml](../../.github/workflows/atlas-atrium-seed-blender.yml). Su un runner GitHub Actions dotato di accesso al sistema operativo, deve:
1. Installare le dipendenze gratuite `numpy`, `trimesh`, `matplotlib`;
2. Rigenerare il GLB dalla sorgente versionata;
3. Installare Blender, importare il GLB, creare effettivamente `atlas-atrium-3d-seed-01.blend`;
4. Renderizzare `CAM_HERO`, `CAM_SIDE`, `CAM_MOBILE` con Cycles e salvare hash/immagini;
5. Conservare le prove nell'artefatto GitHub Actions, senza pubblicazione.

**Verifica dei fatti:** il file YAML del processo è salvato e riletto da GitHub, ma **non c'è ancora una conferma osservata del completamento del job**, né file `.blend` acquisito o render Cycles scaricato. Gli artefatti Actions hanno durata **30 giorni**, pertanto se ottenuti vanno poi copiati nel deposito permanente.

## Decisione concreta per la revisione geometrica

L'obiettivo non è lucidare questa seed: è ricostruire correttamente i **grandi volumi** e in particolare rendere l'oculo dominante, portali e podio proporzionati, con SIDE interna e MOBILE dedicata. Le proporzioni devono essere finalmente misurate sull'originale a quattro portali quando i suoi byte risultano disponibili alla filiera.

**Non dichiarare:** Master Blender consegnato, fedeltà ART-DIR-02, WebGL prestazionale o approvazione artistica. Questi risultati non seguono automaticamente dai render VTK né dall'esistenza del workflow.
