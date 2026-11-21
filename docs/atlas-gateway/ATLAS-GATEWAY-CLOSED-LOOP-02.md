# ATLAS — FLOW-02
## Flusso produttivo unico, verificabile e governato da ART-DIR-02

**Stato:** implementazione iniziale dell'orchestrazione CI realizzata sul ramo PR #152; il prodotto artistico non è ancora completo.  
**Norma estetica:** [ART-DIR-02](./ATLAS-GATEWAY-ART-DIRECTION-02.md).  
**Piano di lavoro dettagliato:** [ART-PROD-01](./ATLAS-GATEWAY-PRODUCTION-WORKFLOW-01.md).  
**Orchestratore eseguibile:** [Atlas ART-DIR-02 — Filiera artistica completa](../../.github/workflows/atlas-art-dir-02-production.yml).  
**Contesto:** Atlas [#151](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/151) e TRAMA [#354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354).

## 1. Che cosa significa «un flusso che porta al risultato»

La domanda principale non è «quale fase svolgiamo adesso?» ma **«il prodotto è visivamente e funzionalmente conforme alla ART-DIR-02?»**.

Il sistema deve funzionare come **un'unica catena tracciata**, avviata o ripresa dalla modifica delle risorse di produzione. Dopo ogni nuova versione del master Blender:
1. verifica che l'immagine di riferimento sia **esattamente quella approvata**;
2. renderizza automaticamente la scena reale **da tre telecamere**;
3. produce un confronto visivo con il riferimento e una diagnosi misurabile;
4. pretende l'approvazione artistica legata agli SHA **di quel master e di quel render**;
5. solo dopo l'approvazione esporta, assembla il vero Atlas, collauda WebGL e archivia le prove;
6. registra **una condizione di avanzamento verificata** o un **blocco causale preciso**, anziché dichiarare «proseguire» all'infinito.

### Cosa può e non può garantire il processo
- **Garantito dal contratto tecnico:** non promuovere un modello diverso da quello approvato, non usare una copia fittizia del riferimento, non mascherare l'assenza del master con la vecchia geometria procedurale, non dichiarare la prova software uguale al collaudo Android.
- **Non garantito automaticamente:** che una sola immagine produca da sé una ricostruzione 3D artisticamente fedele; che un algoritmo di somiglianza visiva riconosca il valore architettonico; che un artista produca un capolavoro in una durata prefissata; che un render offline appaia identico sul dispositivo fisico.
- **Garanzia di governo adottata:** il prodotto non viene definito *conforme* e non viene pubblicato finché **tutti i vincoli misurabili e il giudizio artistico** non sono superati; il processo lascia sempre prove e il motivo di un eventuale arresto.

## 2. Diagramma unico della produzione

```
       ART-DIR-02 + IMMAGINE APPROVATA [SHA obbligatorio]
                             │
                             ▼
               MASTER ARTISTICO BLENDER REALMENTE
               MODELLATO / ASSEMBLATO DA COMPETENZA
                             │
               (aggiornamento versione sorgente)
                             │
                             ▼
                   CI DI ORCHESTRAZIONE
         ┌──────────────────────────────────┐
         │ Preflight sorgenti e riferimenti  │
         │ CAM_HERO / CAM_SIDE / CAM_MOBILE  │
         │ Render Cycles con Blender         │
         │ Immagini A/B, prospettiva, luce   │
         └───────────┬──────────────────────┘
                     │
                     ▼
          APPROVAZIONE ARTISTICA VERIFICABILE?
               │ NO                       │ SÌ
               ▼                          ▼
      RAPPORTO DI SCOSTAMENTO      Derivato GLB e risorse
      → REVISIONE MASTER           Ottimizzazione compatibile
      (non runtime WebGL)           con motore Atlas esistente
               │                          │
               └── cambio master ──┐      ▼
                        │           │  Export reale Atlas
                        └─ nuovo CI │  + prova browser WebGL
                                    │      │
                                    │      ▼
                                    │  ANDROID FISICO APPROVATO?
                                    │   NO → correzione motivata
                                    │   SÌ → PROPOSTA DI RILASCIO
                                    └───────── NO RILASCIO AUTOMATICO
```

**Nessun «procedi» manuale ad ogni passaggio** del tratto tecnico; gli aggiornamenti del master avviano automaticamente l'orchestrazione. La produzione artistica e il giudizio umano restano attività reali, non simili a una funzione software autonoma.

## 3. Contratto degli ingressi / uscite

| Ingresso vincolante | Percorso atteso | Stato attuale |
|---|---|---|
| ART-DIR-02 | `docs/atlas-gateway/ATLAS-GATEWAY-ART-DIRECTION-02.md` | **PRESENTE** |
| Processo ART-PROD-01 | `docs/atlas-gateway/ATLAS-GATEWAY-PRODUCTION-WORKFLOW-01.md` | **PRESENTE** |
| Immagine PNG originale | `visual-factory/atlas-gateway/reference/atlas-hero-approved.png` | **DA ARCHIVIARE** |
| Master artistico Blender | `visual-factory/atlas-gateway/source/atlas-foyer-master.blend` | **DA PRODURRE** |
| Tre camere denominate | `CAM_HERO`, `CAM_SIDE`, `CAM_MOBILE` dentro il master | **DA PRODURRE** |
| Approvazione firmata dell'ideatore | `docs/atlas-gateway/ART-DIR-02-APPROVAL.json` | **NON CONCESSA** |
| Three.js r128/portali | Codice e contratti già presenti nella PR #152 | **BASE TECNICA ESISTENTE** |
| Prova smartphone reale | rapporto da dispositivo fisico / screenshot reali | **DA ESEGUIRE** |

**L'impronta dell'immagine** è `7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336`, dimensioni 1672 × 941. Un'altra immagine non soddisfa il requisito. Il controllo legge i byte PNG reali dal repository, non un collegamento o un nome inventato.

**Approvazione:** schema `atlas.art-dir-02.owned-approval/v1`, con `decision=APPROVED`, `artDirection=ART-DIR-02`, `referenceSha256`, `masterSha256`, `heroRenderSha256`, `reviewer`, `approvedAt`. Questo documento va compilato **solo dopo** il confronto visuale e sotto autorizzazione del responsabile; il controllo riconosce solo la corrispondenza esatta degli SHA. La verifica dell'identità e della legittimità dell'approvazione resta nella revisione GitHub/organizzativa.

## 4. Cosa esegue già il workflow reale

**Codice creato nella PR #152:**
- `scripts/atlas-gateway-production/preflight.mjs`: controlla norme, PNG (header/dimensioni/SHA) e master .blend reale. **Fail-closed**.
- `scripts/atlas-gateway-production/render-master.py`: apre l'autentico .blend, esige le tre camere e texture disponibili, renderizza tre immagini **Cycles**, esporta un GLB e produce un rapporto con SHA.
- `scripts/atlas-gateway-production/compare-render.py`: crea montaggio affiancato immagine / Cycles / differenza, più vista laterale e mobile. Le metriche dei pixel sono **solo diagnostiche**.
- `scripts/atlas-gateway-production/art-approval.mjs`: esige approvazione esplicita coerente con SHA del riferimento, del master e del render; la CI **non** si auto-attribuisce qualità artistica.
- `.github/workflows/atlas-art-dir-02-production.yml`: avvia la filiera a modifiche delle risorse o su richiesta, memorizza i render corrispondenti allo stesso sorgente per evitare di renderizzare nuovamente senza motivo, assembla **l'app reale** invece di quattro pagine finte, poi prova WebGL, salvando artefatti; **nessuna pubblicazione**.

**Confronto dinamico:** il report dimostra «questa immagine proviene da questo master e si discosta in questi punti». Non dimostra «qualità artistica sufficiente». L'approvazione umana costituisce una condizione separata.

## 5. Ciclo di correzione: un solo problema dominante

Quando l'immagine comparata non è approvata:
1. l'art director indica lo **scostamento dominante** fra: camera/proporzioni, architettura, luce/materiali, qualità portali, identità;
2. l'artista modifica **solo la fonte Blender**, senza mascherare il problema con filtri HTML/WebGL;
3. la nuova versione della fonte avvia il CI e rigenera immagini e rapporti con SHA aggiornati;
4. la valutazione confronta il riferimento, la nuova candidata e la versione precedente, per vedere se lo scostamento si è ridotto;
5. se dopo **due revisioni mirate** il problema resta sostanziale, si verifica la causa organizzativa/artistica: asset inadatti, mancanza di competenza, camera impossibile, metodo di illuminazione inadeguato. **Si cambia metodo o componente**, non si prosegue automaticamente per mesi.

Non introdurre limitazioni numeriche sulla qualità (per esempio soglia SSIM «approvato»): una somiglianza pixel elevata può mascherare una scena piatta o incoerente lateralmente.

## 6. I limiti operativi da non nascondere

- L'attuale master `scripts/atlas-gateway-foyer/blender_master.py` è **una dimostrazione procedurale**. Non è il master artistico conforme richiesto da ART-DIR-02 e **non viene automaticamente accettato** dal nuovo preflight.
- I file PNG e .blend di ingresso **non sono ancora presenti** nei percorsi definitivi. Il primo collaudo dell'orchestratore è quindi progettato per restituire **BLOCKED_INPUT**, con artefatto diagnostico: significa che la catena di controllo rileva correttamente il blocco, **non che il prodotto sia completato**.
- Il ramo PR #152 dipende ancora dalla PR biblioteca #148. La dipendenza tecnica va riorganizzata quando sarà disponibile una candidatura artistica reale; non riaprire una biblioteca come prodotto.
- La fase di prova su smartphone reale, con controllo umano dell'esperienza, non può essere surrogata da Chromium software né dall'approvazione di un render.
- GitHub Actions può orchestrare attività **dopo che esistono le risorse e chi le produce**; non è un artista né una fabbrica autonoma in grado di generare, da un solo PNG, architettura tridimensionale professionale garantita.

## 7. Stati e condizioni di completamento

| Stato | Significato | Azione generata dal flusso |
|---|---|---|
| `BLOCKED_INPUT` | Manca immagine originale, master artistico o identità dei byte | Fermare, indicare esattamente l'ingresso mancante |
| `RENDER_EVIDENCE_READY` | Tre immagini reali e report A/B prodotti | Sottoporre la candidata alla direzione artistica |
| `AWAITING_ARTISTIC_APPROVAL` | Evidenze complete, giudizio mancante o insufficiente | Riportare scostamenti e revisionare il master |
| `MASTER_ARTISTICALLY_APPROVED` | Fonte e immagine renderizzata approvate per SHA | Passare automaticamente alla produzione web |
| `WEB_TECHNICALLY_VERIFIED` | GLB, caricamento Three.js e quattro rotte reali verificati | Collaudo smartphone fisico |
| `ANDROID_ACCEPTED` | Fluidità, leggibilità, fedeltà e interazione confermate sul dispositivo | Proporre al responsabile la promozione |
| `PUBLISHED` | Rilascio deliberatamente autorizzato e verificato | Fine del ciclo, senza false dichiarazioni |

**Completamento del progetto:** non «verde in CI», ma qualità ART-DIR-02 approvata + 3D navigabile + rotte reali + prova Android + autorizzazione separata. Se un requisito è assente, lo stato complessivo non può diventare PUBBLICATO.

## 8. Prossima azione che non richiede riaprire la progettazione

**Abilitare gli ingressi reali:** depositare il PNG originale con impronta corretta e produrre o affidare a una competenza Blender il master di architettura/illuminazione di ART-DIR-02 con tre telecamere. È l'unico blocco esterno alla catena automatizzabile oggi.

Una volta che queste risorse esistono, **le revisioni fanno ripartire la filiera senza ordinare passo per passo «procedi»**. Alla prima condizione di qualità non soddisfatta, il sistema mostra la prova e il difetto. Alla prima candidatura approvata, prosegue a web e prove. Nessun nuovo servizio a pagamento, nessun rilascio pubblico implicito.
