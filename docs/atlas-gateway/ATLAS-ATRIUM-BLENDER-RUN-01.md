# ATLAS-ATRIUM-BLENDER-RUN-01 — Esecuzione reale Blender su SEED-03

**Data:** 20 novembre 2026. **Stato registrato inizialmente:** `RUNNING`, non `PASS`. **Pubblicazione:** non autorizzata.

## Obiettivo prioritario

Acquisire il primo vero sorgente Blender `atlas-atrium-3d-seed-03.blend` dalla geometria tridimensionale effettivamente prodotta e tre render Cycles della **stessa scena**: `cam_hero.png`, `cam_side.png`, `cam_mobile.png`.

**Progetto:** [ATLAS-ATRIUM-BLUEPRINT-03.json](./ATLAS-ATRIUM-BLUEPRINT-03.json), **quattro** portali Curricolo, Esplora, Percorsi, Esperienze.  
**GLB precedente validato localmente:** `ATLAS-ATRIUM-3D-SEED-03.glb`, SHA-256 `7ac7ef7de6560ffa53f952df9634ca78037a6ba8b9e121a5d1a5b41c825f10ba`, **308 oggetti** e **62.652 triangoli**.  
**Blueprint SHA-256:** `7d0ca2764cd58ae9436d5a106167cf84a5ed9fde9ccb53f59cdd65a7c66ae62e`.

## Procedura tecnica esistente e modifica operativa del 20 novembre

- [Workflow SEED-03 in GitHub Actions](../../.github/workflows/atlas-atrium-seed-03-blender.yml).
- È stata eliminata la falsa condizione per cui una differenza tra i byte delle esportazioni GLB su sistemi/librerie diversi comportava `FAIL`, pur conservando lo SHA storico e quello corrente per il confronto. Restano **obbligatorie** le invarianti: GLB reale, quattro portali, mesh 3D, 308 nodi, 62.652 triangoli, rilettura riuscita, sorgenti Blueprint verificati.
- Aggiunto trigger `pull_request` sulla PR #152 per consentire monitoraggio indipendente dall'attivazione `push`.
- [Esecuzione PR #152, run 44802057083](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44802057083), SHA commit `3158fc5e40b3572cbb81a75ffcdf022075e07b5a`. Stato al primo controllo: **`in_progress`**, GLB generato e verificato; fase **installazione Blender in corso**; nessun render ancora verificato.
- [Esecuzione push, run 44802042120](https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/44802042120). **Esecuzione separata e potenzialmente duplicata.** La filiera non è qualificata soltanto perché si è avviata.
- Lo script Python di importazione/rendere Cycles si trova in [import-atrium-seed-03-blender.py](../../scripts/atlas-gateway-production/import-atrium-seed-03-blender.py).

## Contratto di qualificazione

1. **Verificare il job remoto** e leggere eventuali errori (non dichiarare `PASS` dal solo stato `in_progress`).
2. **Scaricare dall'esecuzione riuscita l'archivio reale**; verificare presenza, firma e SHA del `.blend`, tre immagini PNG valide, report JSON e versione del Blueprint; riprodurre legame con GLB.
3. Salvare **immediatamente in Drive Curriculum Atlas** l'archivio firmato, perché la conservazione GitHub Actions per 30 giorni **non è archivio permanente**. Verificare il nuovo file Drive mediante `get_file_metadata`.
4. Riportare in questo documento: numero di run concluso, esito, log, URI Drive verificato, SHA del `.blend`, SHA dei render, dimensioni, versioni del programma e controlli.
5. Se fallisce, correggere **la causa verificata** sul workflow o sullo script; non creare SEED-04 per un errore d'installazione o di API.
6. **Non promuovere la scena:** è ancora SEED-03 sperimentale, **non** confrontata con il PNG canonico a quattro portali, perché il riferimento `atrio_futuristico_atlas_della_conoscenza.png` con SHA `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336` non è disponibile in byte nel deposito produttivo.

## Esempio di esito minimo ammissibile

```text
BLENDER_RENDERED_TECHNICAL_ONLY
.blend exists and re-openable
CAM_HERO, CAM_SIDE, CAM_MOBILE have corresponding nonempty PNGs
artistic_state=NOT_ART_DIR_02_APPROVED
web_state=NOT_PROMOTED
```

**Distinzione permanente:** una prova Blender superata **non** implica fedeltà artistica, completamento del Master professionale o pubblicazione web.
