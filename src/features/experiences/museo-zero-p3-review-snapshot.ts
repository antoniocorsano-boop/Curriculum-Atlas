/**
 * Frozen review-only scene projection of Studio Atlas's canonical MUSEO ZERO.
 * Authoritative original: antoniocorsano-boop/trama-ecosistema
 * Source: products/studio-atlas/lib/canonical/museo-zero.ts
 * Source Git blob: 27037f3af1e12b660e9108d2eaf6be32f1a42f48
 * Full source SHA-256: bda63f478da6c073b8e83b23fa07631cd3a9c7cc39d2c062e8c867f788927236
 * Projection preserves the authored scene, worldAfter, stage, agency and choice data.
 * NEVER import this candidate into the public Experiences catalog.
 * Historical human product review: REVISE; runtimeAuthorized=false; studentAuthorized=false.
 */
import type { StudioAtlasPreviewSnapshot, StudioAtlasPreviewScene, StudioAtlasPreviewStage } from "@/features/pathways/studio-atlas-preview-adapter";

const MUSEO_ZERO_LOCATIONS: NonNullable<StudioAtlasPreviewStage["locations"]> = [
  { id: "entry", label: "Ingresso", detail: "Il nuovo percorso comincia qui.", position: "ENTRY" },
  { id: "room", label: "Sala Zero", detail: "Proiezione, suono e luce reagiscono al visitatore.", position: "ROOM" },
  { id: "control", label: "Cabina regia", detail: "Qui vengono ascoltati trigger e cue.", position: "CONTROL" },
  { id: "lab", label: "Laboratorio", detail: "Etichette, note e tracce delle modifiche.", position: "LAB" },
];

const MUSEO_ZERO_EVIDENCE: NonNullable<StudioAtlasPreviewStage["evidence"]> = [
  {
    id: "ev-route",
    label: "Percorso invertito",
    detail: "La nuova entrata mantiene il passaggio più accessibile; il vecchio segno d’ingresso è ancora visibile.",
    locationId: "entry",
    kind: "TRACE",
  },
  {
    id: "ev-lia",
    label: "Perché il percorso è cambiato",
    detail: "Lia conferma che l’inversione è stata scelta per mantenere il nuovo accesso praticabile.",
    locationId: "entry",
    kind: "PERSON",
    character: "Lia",
  },
  {
    id: "ev-sensor-b",
    label: "Sensor B spostato",
    detail: "L’etichetta di montaggio mostra che Sensor B è stato portato sulla nuova entrata e risponde al passaggio.",
    locationId: "room",
    kind: "OBJECT",
  },
  {
    id: "ev-failed-rehearsal",
    label: "Prova fallita",
    detail: "La registrazione mostra Lia già oltre la soglia quando la proiezione parte; suono e luce seguono in ritardo.",
    locationId: "room",
    kind: "TRACE",
  },
  {
    id: "ev-mapping",
    label: "Mappatura cue attiva",
    detail: "La regia sta ancora ascoltando Sensor A, il riferimento del vecchio ingresso.",
    locationId: "control",
    kind: "SYSTEM",
  },
  {
    id: "ev-teo",
    label: "Il log di Teo",
    detail: "Il cue parte regolarmente, ma troppo tardi rispetto al nuovo percorso del visitatore.",
    locationId: "control",
    kind: "PERSON",
    character: "Teo",
  },
  {
    id: "ev-artwork",
    label: "Grafica aggiornata",
    detail: "Una grafica della proiezione è stata sostituita nello stesso pomeriggio: è un cambiamento reale, ma non spiega il ritardo.",
    locationId: "lab",
    kind: "OBJECT",
  },
  {
    id: "ev-volume",
    label: "Volume regolato",
    detail: "Il volume è stato corretto prima della prova finale; modifica il suono, non il momento in cui il trigger viene ricevuto.",
    locationId: "lab",
    kind: "TRACE",
  },
];

const scenes: StudioAtlasPreviewScene[] = [
      {
        sceneId: "MZ1_FAILED_REHEARSAL",
        kind: "SCENE",
        interaction: "SUMMARY",
        title: "Qualcosa non torna",
        visibleSituation:
          "Lia attraversa la nuova entrata. Il sensore si accende, ma la parete resta buia; proiezione, suono e luce arrivano quando lei è già oltre.",
        learnerAction:
          "Osserva la prova fallita e individua quali elementi sembrano fuori sincronia.",
        consequence:
          "La sala non è pronta, ma il fallimento rende visibile il problema da spiegare.",
        reveal:
          "Il sensore fisico sembra funzionare: il problema non coincide automaticamente con un guasto hardware.",
        world: {
          place: "Sala Zero",
          status: "La sala reagisce dopo il passaggio del visitatore",
          signals: [
            { id: "sensor-b", label: "Sensor B · nuova entrata", state: "ACTIVE", detail: "Il sensore rileva il passaggio." },
            { id: "cue-map", label: "Mappatura regia", state: "MISMATCH", detail: "Il cue attivo non segue il nuovo ingresso." },
            { id: "projection", label: "Proiezione", state: "DELAYED", detail: "Parte quando Lia è già oltre." },
            { id: "sound-light", label: "Suono e luce", state: "DELAYED", detail: "Seguono la proiezione in ritardo." },
          ],
        },
        stage: {
          visualMode: "CINEMATIC_EDITORIAL",
          focusLocationId: "room",
          locations: MUSEO_ZERO_LOCATIONS,
          characterBeat: {
            name: "Omar",
            role: "installazione",
            line: "Il sensore si accende. Allora perché parte tutto dopo?",
          },
        },
        choices: [],
      },
      {
        sceneId: "MZ2_RECONSTRUCT_DAY",
        kind: "SCENE",
        interaction: "CHOICE",
        title: "Tutti hanno cambiato qualcosa",
        visibleSituation:
          "Lia, Omar e Teo ricordano modifiche diverse. Note, orari e tracce sono distribuiti tra ingresso, laboratorio e regia.",
        learnerAction:
          "Scegli come organizzare per prima cosa le informazioni che hai raccolto.",
        consequence:
          "Il modo in cui organizzi le informazioni rende alcune domande più facili da affrontare e altre ancora opache.",
        reveal:
          "Sapere quando è avvenuto un cambiamento non significa ancora sapere se lo ha causato.",
        world: {
          place: "Museo Zero · indizi della giornata",
          status: "Le modifiche sono note, ma la relazione causale è ancora incerta",
          signals: [
            { id: "route", label: "Percorso visitatori", state: "ACTIVE", detail: "È stato invertito per mantenere accessibile la nuova entrata." },
            { id: "sensor-b", label: "Sensor B", state: "READY", detail: "È stato spostato sul nuovo ingresso." },
            { id: "control", label: "Regia", state: "MISMATCH", detail: "La configurazione non è ancora stata collegata con certezza alle altre modifiche." },
            { id: "rehearsal-log", label: "Log prova", state: "DELAYED", detail: "Registra la risposta tardiva della sala." },
          ],
        },
        stage: {
          visualMode: "CINEMATIC_EDITORIAL",
          focusLocationId: "entry",
          locations: MUSEO_ZERO_LOCATIONS,
          evidence: MUSEO_ZERO_EVIDENCE,
          characterBeat: {
            name: "Lia",
            role: "spazio e percorso",
            line: "Ognuno di noi ha cambiato qualcosa oggi. Serve rimettere insieme i pezzi.",
          },
          workbench: {
            modes: ["TIMELINE", "CONNECTIONS", "COMPARE"],
            prompt: "Porta gli indizi sul banco e scegli come guardarli",
            minEvidence: 3,
            transitionMap: {
              TIMELINE: "timeline",
              CONNECTIONS: "connections",
              COMPARE: "compare-fixes",
            },
          },
        },
        choices: [
          {
            choiceId: "timeline",
            targetSceneId: "MZ3_TIMELINE_LIMIT",
            label: "Metto in fila i cambiamenti della giornata",
            feedback:
              "La sequenza temporale chiarisce che percorso e sensore sono cambiati prima della prova fallita. Ora sai quando, ma non ancora perché.",
          },
          {
            choiceId: "connections",
            targetSceneId: "MZ4_TEST_MAPPING",
            label: "Collego subito percorso, sensore e regia",
            feedback:
              "Le relazioni sono promettenti, ma senza ordinare alcune modifiche rischi di attribuire importanza a coincidenze.",
          },
          {
            choiceId: "compare-fixes",
            targetSceneId: "MZ3_TIMELINE_LIMIT",
            label: "Confronto già le possibili soluzioni",
            feedback:
              "È troppo presto: prima devi capire quale relazione spiega davvero il ritardo.",
          },
        ],
      },
      {
        sceneId: "MZ3_TIMELINE_LIMIT",
        kind: "SCENE",
        interaction: "SUMMARY",
        title: "La timeline non basta",
        visibleSituation:
          "La sequenza è coerente: il percorso è stato invertito, Sensor B è stato spostato, poi la prova ha fallito. Anche grafica e volume erano cambiati.",
        learnerAction:
          "Decidi quale relazione devi osservare per passare da 'quando' a 'perché'.",
        consequence:
          "L’attenzione si sposta dalla cronologia alla dipendenza tra ingresso, sensore ascoltato e cue attivi.",
        reveal:
          "Una rappresentazione utile per una domanda può diventare insufficiente quando cambia la domanda.",
        world: {
          place: "Timeline dell’allestimento",
          status: "La sequenza temporale è chiara, ma non spiega perché la sala reagisce tardi",
          signals: [
            { id: "route-change", label: "Cambio percorso", state: "READY", detail: "Avviene prima della prova fallita." },
            { id: "sensor-move", label: "Spostamento Sensor B", state: "READY", detail: "Avviene prima della prova fallita." },
            { id: "graphics-volume", label: "Grafica e volume", state: "READY", detail: "Cambiano nello stesso pomeriggio ma non spiegano il ritardo." },
            { id: "causal-link", label: "Relazione causale", state: "MISMATCH", detail: "La timeline da sola non la rende visibile." },
          ],
        },
        stage: {
          visualMode: "CINEMATIC_EDITORIAL",
          focusLocationId: "control",
          locations: MUSEO_ZERO_LOCATIONS,
          characterBeat: {
            name: "Teo",
            role: "regia e prove",
            line: "Ora sappiamo quando. Ma non ancora perché parte tardi.",
          },
          workbench: {
            modes: ["TIMELINE", "CONNECTIONS"],
            prompt: "La sequenza è chiara: cambia rappresentazione per cercare la relazione",
            minEvidence: 3,
          },
        },
        choices: [],
      },
      {
        sceneId: "MZ4_TEST_MAPPING",
        kind: "SCENE",
        interaction: "CHOICE",
        title: "Prova il collegamento",
        visibleSituation:
          "Nella simulazione la nuova entrata usa Sensor B, mentre la regia risulta ancora mappata sul vecchio Sensor A.",
        learnerAction:
          "Scegli quale configurazione provare nella simulazione e osserva la risposta della sala.",
        consequence:
          "La conseguenza della prova permette di confrontare la tua spiegazione con il comportamento del sistema.",
        reveal:
          "Il mondo, non un punteggio, deve mostrare se il modello spiega il problema.",
        world: {
          place: "Simulazione · Sala Zero",
          status: "Il nuovo ingresso usa Sensor B, ma la regia ascolta ancora Sensor A",
          signals: [
            { id: "sensor-b", label: "Sensor B", state: "ACTIVE", detail: "Rileva il visitatore al nuovo ingresso." },
            { id: "trigger-map", label: "Trigger regia", state: "MISMATCH", detail: "È ancora associato a Sensor A." },
            { id: "projection", label: "Proiezione", state: "DELAYED", detail: "Riceve il cue troppo tardi." },
            { id: "sequence", label: "Sequenza sala", state: "DELAYED", detail: "Suono e luce seguono il ritardo." },
          ],
        },
        stage: {
          visualMode: "CINEMATIC_EDITORIAL",
          focusLocationId: "room",
          locations: MUSEO_ZERO_LOCATIONS,
          characterBeat: {
            name: "Teo",
            role: "regia e prove",
            line: "Proviamolo qui. Se la relazione è giusta, deve essere la sala a mostrarcelo.",
          },
        },
        choices: [
          {
            choiceId: "current-a",
            targetSceneId: "MZ3_TIMELINE_LIMIT",
            label: "Mantengo il trigger su Sensor A",
            worldAfter: {
              place: "Simulazione · Sala Zero",
              status: "Il ritardo si ripete: la configurazione continua ad ascoltare il riferimento sbagliato",
              signals: [
                { id: "sensor-b", label: "Sensor B", state: "ACTIVE", detail: "Il nuovo ingresso viene rilevato." },
                { id: "trigger-map", label: "Trigger su Sensor A", state: "MISMATCH", detail: "La regia non usa il segnale del nuovo ingresso." },
                { id: "projection", label: "Proiezione", state: "DELAYED", detail: "Parte quando il visitatore è già oltre." },
              ],
            },
            feedback:
              "Il visitatore supera la nuova entrata e la sala continua a partire tardi: il fallimento si ripete.",
          },
          {
            choiceId: "switch-b",
            targetSceneId: "MZ5_COMPARE_RECOVERY",
            label: "Provo il trigger su Sensor B",
            worldAfter: {
              place: "Simulazione · Sala Zero",
              status: "La sala risponde nel momento previsto: la mappatura aggiornata spiega il problema",
              signals: [
                { id: "sensor-b", label: "Sensor B", state: "ACTIVE", detail: "Rileva il passaggio al nuovo ingresso." },
                { id: "trigger-map", label: "Trigger su Sensor B", state: "ACTIVE", detail: "La regia ascolta il segnale corretto." },
                { id: "projection", label: "Proiezione", state: "STABLE", detail: "Parte all’ingresso." },
                { id: "sequence", label: "Suono e luce", state: "STABLE", detail: "Restano sincronizzati." },
              ],
            },
            feedback:
              "La proiezione parte all’ingresso e la sequenza torna sincronizzata: la relazione causale è fortemente supportata.",
          },
          {
            choiceId: "manual",
            targetSceneId: "MZ5_COMPARE_RECOVERY",
            label: "Provo un cue manuale",
            worldAfter: {
              place: "Simulazione · Sala Zero",
              status: "La prova riesce, ma dipende dall’intervento dell’operatore",
              signals: [
                { id: "sensor-b", label: "Sensor B", state: "ACTIVE", detail: "Il sensore continua a funzionare." },
                { id: "manual-cue", label: "Cue operatore", state: "MANUAL", detail: "Un operatore deve intervenire al momento giusto." },
                { id: "projection", label: "Proiezione", state: "STABLE", detail: "Parte correttamente in questa prova." },
                { id: "repeatability", label: "Ripetibilità", state: "MISMATCH", detail: "Il risultato non è garantito visita dopo visita." },
              ],
            },
            feedback:
              "La sala può funzionare in una prova, ma il risultato dipende dal tempismo dell’operatore e non è stabile.",
          },
        ],
      },
      {
        sceneId: "MZ5_COMPARE_RECOVERY",
        kind: "TRANSFER",
        interaction: "CHOICE",
        title: "Quale soluzione regge davvero?",
        visibleSituation:
          "Il team può ripristinare il vecchio percorso, aggiornare la mappatura a Sensor B oppure usare temporaneamente un cue manuale.",
        learnerAction:
          "Confronta accessibilità, affidabilità e lavoro necessario e raccomanda una soluzione da provare.",
        consequence:
          "La raccomandazione cambia la configurazione della prova finale e rende visibili i compromessi.",
        reveal:
          "La scelta migliore dipende dai vincoli condivisi, non solo dalla soluzione che sembra più rapida.",
        world: {
          place: "Banco decisione · Sala Zero",
          status: "Tre soluzioni possono far ripartire la sala, ma non rispettano allo stesso modo i vincoli",
          signals: [
            { id: "accessibility", label: "Accessibilità del percorso", state: "ACTIVE", detail: "Il nuovo ingresso deve restare utilizzabile." },
            { id: "reliability", label: "Affidabilità", state: "MISMATCH", detail: "La soluzione deve funzionare in visite ripetute." },
            { id: "workload", label: "Lavoro richiesto", state: "READY", detail: "Il team ha poco tempo prima della prova generale." },
          ],
        },
        stage: {
          visualMode: "CINEMATIC_EDITORIAL",
          focusLocationId: "control",
          locations: MUSEO_ZERO_LOCATIONS,
          characterBeat: {
            name: "Lia",
            role: "spazio e percorso",
            line: "Va bene farla partire. Ma il nuovo ingresso deve restare e domani deve funzionare ogni volta.",
          },
          workbench: {
            modes: ["COMPARE"],
            prompt: "Confronta le soluzioni usando gli indizi che hai già raccolto",
            minEvidence: 3,
          },
        },
        choices: [
          {
            choiceId: "restore-old-route",
            targetSceneId: "MZ4_TEST_MAPPING",
            label: "Ripristino il vecchio percorso",
            worldAfter: {
              place: "Confronto soluzione",
              status: "Il vecchio percorso riduce il lavoro in regia ma sacrifica il nuovo assetto accessibile",
              signals: [
                { id: "accessibility", label: "Accessibilità del percorso", state: "MISMATCH", detail: "Il nuovo ingresso non viene mantenuto." },
                { id: "reliability", label: "Affidabilità tecnica", state: "STABLE", detail: "La vecchia configurazione è conosciuta." },
                { id: "workload", label: "Lavoro fisico", state: "DELAYED", detail: "Serve ripristinare il percorso precedente." },
              ],
            },
            feedback:
              "Riduce il cambiamento in regia, ma entra in conflitto con il nuovo percorso e richiede nuovo lavoro fisico.",
          },
          {
            choiceId: "update-mapping",
            targetSceneId: "MZ6_FINAL_REHEARSAL",
            label: "Aggiorno la mappatura a Sensor B",
            worldAfter: {
              place: "Confronto soluzione",
              status: "La mappatura a Sensor B mantiene il percorso accessibile e produce una risposta stabile",
              signals: [
                { id: "accessibility", label: "Accessibilità del percorso", state: "STABLE", detail: "La nuova entrata resta utilizzabile." },
                { id: "reliability", label: "Affidabilità", state: "STABLE", detail: "La simulazione risponde in modo ripetibile." },
                { id: "workload", label: "Lavoro richiesto", state: "READY", detail: "La modifica è circoscritta alla configurazione." },
              ],
            },
            feedback:
              "Mantiene il percorso accessibile, richiede una modifica contenuta e nella simulazione produce un comportamento stabile.",
          },
          {
            choiceId: "manual-cue",
            targetSceneId: "MZ4_TEST_MAPPING",
            label: "Uso il cue manuale",
            worldAfter: {
              place: "Confronto soluzione",
              status: "Il cue manuale è praticabile come ripiego, ma resta fragile per l’uso ripetuto",
              signals: [
                { id: "accessibility", label: "Accessibilità del percorso", state: "STABLE", detail: "Il nuovo ingresso resta utilizzabile." },
                { id: "reliability", label: "Affidabilità", state: "MANUAL", detail: "Dipende dal tempismo dell’operatore." },
                { id: "workload", label: "Carico operativo", state: "MISMATCH", detail: "Richiede attenzione continua durante le visite." },
              ],
            },
            feedback:
              "È un buon ripiego temporaneo, ma resta meno affidabile per visite ripetute.",
          },
        ],
      },
      {
        sceneId: "MZ6_FINAL_REHEARSAL",
        kind: "SCENE",
        interaction: "SUMMARY",
        title: "La sala torna coerente",
        visibleSituation:
          "Lia attraversa di nuovo la sala. Questa volta proiezione, suono e luce seguono il visitatore nel momento previsto.",
        learnerAction:
          "Osserva la prova finale e confrontala con il primo fallimento.",
        consequence:
          "Il team può procedere alla prova generale e il nuovo percorso resta utilizzabile.",
        reveal:
          "Il sensore non era rotto: la configurazione ascoltava il riferimento sbagliato.",
        world: {
          place: "Sala Zero · prova finale",
          status: "Ingresso, trigger e risposta della sala sono di nuovo sincronizzati",
          signals: [
            { id: "sensor-b", label: "Sensor B", state: "ACTIVE", detail: "Rileva il passaggio nel punto corretto." },
            { id: "trigger-map", label: "Trigger regia", state: "ACTIVE", detail: "Ascolta Sensor B." },
            { id: "projection", label: "Proiezione", state: "STABLE", detail: "Parte al momento previsto." },
            { id: "sound-light", label: "Suono e luce", state: "STABLE", detail: "Seguono la sequenza senza ritardo." },
          ],
        },
        stage: {
          visualMode: "CINEMATIC_EDITORIAL",
          focusLocationId: "room",
          locations: MUSEO_ZERO_LOCATIONS,
          characterBeat: {
            name: "Omar",
            role: "installazione",
            line: "Quindi il sensore era a posto. Era il collegamento.",
          },
        },
        choices: [],
      },
      {
        sceneId: "MZ7_QUIET_CLOSE",
        kind: "SCENE",
        interaction: "SUMMARY",
        title: "Pronta per la prova generale",
        visibleSituation:
          "Sala Zero resta accesa nella configurazione corretta. Il museo torna silenzioso e il team chiude la sessione di allestimento.",
        learnerAction:
          "Concludi la prova e lascia il mondo nello stato raggiunto.",
        consequence:
          "Il Percorso si chiude senza punteggio o morale esplicita.",
        reveal:
          "SALA ZERO — PRONTA PER LA PROVA GENERALE.",
        world: {
          place: "Sala Zero · chiusura",
          status: "La configurazione resta stabile e pronta per la prova generale",
          signals: [
            { id: "room", label: "Sala Zero", state: "STABLE", detail: "La sequenza è pronta." },
            { id: "route", label: "Percorso accessibile", state: "STABLE", detail: "La nuova entrata resta attiva." },
            { id: "team", label: "Sessione di allestimento", state: "OFF", detail: "Il team può chiudere la prova." },
          ],
        },
        stage: {
          visualMode: "CINEMATIC_EDITORIAL",
          focusLocationId: "room",
          locations: MUSEO_ZERO_LOCATIONS,
          characterBeat: {
            name: "Lia",
            role: "spazio e percorso",
            line: "Perfetto. Il nuovo percorso può restare.",
          },
        },
        choices: [],
      },
    ];

export const museoZeroP3ReviewSnapshot: StudioAtlasPreviewSnapshot = {
  schemaVersion: "studio-atlas.preview-snapshot/v0.1",
  snapshotId: "museo-zero-p3-review-27037f3af1e1",
  packageDigest: "bda63f478da6c073b8e83b23fa07631cd3a9c7cc39d2c062e8c867f788927236",
  pathwayId: "pw-strategy-selection-01-museo-zero",
  version: "P3-REVIEW-1",
  title: "Museo Zero · La sala che non torna",
  description: "Indaga in quattro luoghi, raccogli indizi e prova una riparazione simulata.",
  runtimeAuthorized: false,
  studentAuthorized: false,
  scenes,
};
