# Percorsi G2 — Contratto evolutivo

Status: `PROPOSED / CONTRACT_ONLY / NO_RUNTIME_CHANGE`

Baseline: `7a96587a7e27386d3ecd632fe29a7ec514f6b796` (G1 integrato).

## 1. Scopo
G2 evolve Percorsi da sequenza lineare di scene a grafo didattico versionato. Il contratto separa semantica cognitiva canonica, transizioni, grammatica di presentazione, stato di sessione e completamento. Nessuna parte di questo documento autorizza l'uso con studenti.

## 2. Benchmark e decisioni
H5P Branching Scenario informa branching/terminali/feedback; Twine la separazione nodo-transizione-presentazione; GDevelop modularità/eventi. Sono benchmark, non dipendenze o fonti canoniche.

Adottiamo: grafo esplicito; transizioni dichiarative; terminali espliciti; renderer separato; comportamenti modulari; validazione statica; unità semantiche canoniche.

Non adottiamo: scoring/classifiche; profilazione; analytics studente; dipendenza LMS; formato esterno come fonte canonica; motore di gioco completo senza necessità dimostrata.

## 3. Modello canonico v2.0

```ts
type PathwayDefinition = {
  schemaVersion: "2.0";
  pathwayId: string;
  version: string;
  entryNodeId: string;
  semanticUnits: SemanticUnit[];
  nodes: SceneNode[];
  presentationGrammars: PresentationGrammar[];
  governance: GovernancePolicy;
};

type SemanticUnit = {
  id: string;
  kind: "fact" | "question" | "choice_meaning" | "feedback_meaning" | "terminal_meaning";
  canonicalMeaning: string;
  provenanceRef: string;
};

type ContentRef = {
  semanticUnitIds: string[];
  resourceKey: string;
  locale: string;
};

type CognitiveFunctionRef = {
  registry: "TRAMA_COGNITIVE_FUNCTIONS";
  registryVersion: "1";
  id: string;
};

type CyclePolicy =
  | { mode: "forbidden" }
  | { mode: "bounded"; maxVisitsPerNode: number };

type SceneNode = {
  id: string; // interno: non è contenuto presentabile
  cognitiveFunction: CognitiveFunctionRef;
  contentRef: ContentRef;
  choices: ChoiceTransition[];
  cyclePolicy: CyclePolicy;
  terminal?: TerminalDefinition;
};

type ChoiceTransition = {
  id: string;
  labelRef: ContentRef;
  feedbackRef: ContentRef;
  targetNodeId: string;
};

type TerminalDefinition = {
  terminalId: string;
  contentRef: ContentRef;
  postCompletionActions: Array<"exit" | "new_session">;
};

type PresentationGrammar = {
  id: "L" | "N" | string;
  renderer: string;
  semanticCoverage: string[]; // SemanticUnit.id
};

type GovernancePolicy = {
  authorizationState: "NOT_RUNTIME_AUTHORIZED" | "RUNTIME_AUTHORIZED";
  learnerNetworkWrite: "forbidden";
  learnerTelemetry: "forbidden";
  localPersistence: "forbidden" | "separately_authorized";
  allowedPresentationGrammarIds: string[];
};

type SessionState = {
  sessionId: string; // effimero; non identifica la persona
  currentNodeId: string;
  visitedNodeIds: string[];
  selections: Record<string, string>;
  completion: CompletionState;
};

type CompletionState =
  | { status: "in_progress" }
  | { status: "completed"; terminalId: string };
```

`SessionEffect` non fa parte di v2.0: ogni mutazione ammessa è definita dal motore di navigazione e dal contratto di sessione.

## 4. Risoluzione contenuti e provenienza
`resourceKey` risolve esclusivamente nel registro contenuti versionato associato alla stessa definizione del percorso. Ogni risorsa deve dichiarare locale, unità semantiche coperte e provenienza. Un riferimento mancante, un locale non disponibile o una `semanticUnit` sconosciuta è errore bloccante: nessun fallback silenzioso.

`provenanceRef` deve risolvere una fonte/decisione governata; il validatore controlla la presenza e la forma del riferimento, mentre la validità sostanziale della fonte appartiene al gate editoriale.

## 5. Parità informativa L ↔ N
La parità non è uguaglianza testuale. La fonte canonica è `semanticUnits`. Ogni grammatica autorizzata deve dichiarare `semanticCoverage` uguale all'insieme richiesto dal percorso e ogni risorsa resa deve mappare le unità che esprime.

Il validatore può quindi verificare meccanicamente copertura, omissioni e aggiunte semantiche. La qualità dell'equivalenza linguistica resta oggetto di review umana/editoriale. Nessuna grammatica può introdurre una semantic unit non presente nella definizione canonica o alterare la salienza di una scelta tramite metadati di correttezza.

## 6. Semantica grafo
1. `entryNodeId` deve esistere.
2. Ogni `targetNodeId` deve esistere.
3. Un nodo non terminale deve avere almeno una scelta.
4. Un nodo terminale non può avere `choices`; dopo il completamento sono ammesse solo `postCompletionActions` governate.
5. Ogni nodo raggiungibile deve poter raggiungere un terminale.
6. Un ciclo è valido solo se tutti i nodi coinvolti dichiarano `cyclePolicy.mode="bounded"` e un limite positivo; `forbidden` rende qualsiasi ciclo bloccante.
7. `maxVisitsPerNode` deve essere finito e >= 1. Il superamento porta a errore controllato, non a navigazione infinita.
8. Gli ID tecnici non sono contenuto presentabile.

## 7. Sessione, completamento e riavvio
`Termina` è una transizione verso `CompletionState.completed` e rende la schermata terminale. `new_session` crea un nuovo `sessionId`, ripristina `currentNodeId=entryNodeId`, `visitedNodeIds=[]`, `selections={}` e `completion={status:"in_progress"}`.

Nessuno stato della sessione precedente viene ereditato. Con `localPersistence="forbidden"` il riavvio non legge né scrive persistenza locale. `exit` chiude l'esperienza senza creare una nuova sessione.

## 8. Governance e privacy
Per G2 contract-only: `authorizationState=NOT_RUNTIME_AUTHORIZED`, `learnerNetworkWrite=forbidden`, `learnerTelemetry=forbidden`, `localPersistence=forbidden`. Una modifica futura richiede un contratto/versione e gate separati; non può essere ottenuta mediante configurazione implicita del renderer.

Nessun nome, account o profilo studente è richiesto. Feedback centrato sul processo: niente voto, punteggio, classifica o giudizio sulla persona.

## 9. Accessibilità: tre livelli di evidenza
**Static contract checks:** ruoli/nomi/stati richiesti dai componenti, ordine logico dichiarabile, regioni di feedback annunciabili, assenza di informazione affidata al solo colore, requisiti di focus e reduced-motion nel contratto renderer.

**Runtime automated checks:** tastiera, focus, semantica DOM/accessibility tree dove automatizzabile, contrasto, reflow/zoom, target size, annunci dinamici, reduced motion.

**Human assistive-technology gate:** verifica separata con tecnologia assistiva reale. I primi due livelli non possono essere usati per dichiarare questo terzo PASS.

## 10. Validatore G2
Errori bloccanti: riferimenti mancanti; nodo/target orfano; terminale irraggiungibile; terminale con ordinary choices; ciclo non autorizzato/non limitato; funzione cognitiva fuori registro; semantic unit sconosciuta; divergenza di copertura L/N; ID tecnico esposto; policy learner-write/telemetry incompatibile; requisito statico di accessibilità assente.

Output machine-readable minimo:
`schemaVersion`, `pathwayId`, `pathwayVersion`, `exactHead`, `validatorVersion`, `checks[] {id,status,evidence}`, `timestamp`.

## 11. Compatibilità e migrazione
`schemaVersion` usa `major.minor`.
- stesso major: un consumer può accettare una minor successiva solo se dichiara esplicitamente supporto; nessuna interpretazione permissiva di campi sconosciuti che incidono sulla semantica;
- major diverso: rifiuto fino a migrazione esplicita;
- ogni migrazione deve essere deterministica, versionata, testata con fixture before/after e non può cambiare semantic units senza nuova versione del percorso;
- nessun auto-upgrade silenzioso in runtime.

## 12. Esperienza G2
La scena mobile privilegia il compito corrente. Governance/privacy restano percepibili senza essere replicate come grandi blocchi a ogni nodo. Il completamento ha schermata propria e distingue `exit` da `new_session`.

La grammatica narrativa è un renderer, non una fonte alternativa. Personaggi, immagini, dialoghi e metafore sono ammessi solo se mappati alle semantic units canoniche e verificati per accessibilità e parità.

## 13. Gate
`BENCHMARK_COMPLETE` → `CONTRACT_REVIEW` → `VALIDATOR_PASS` → `UX_PROTOTYPE_REVIEW` → `IMPLEMENTATION_CANDIDATE` → `EXACT_HEAD_REVIEW`.

L'autorizzazione studenti resta un gate separato e richiede anche una verifica umana valida con tecnologia assistiva.
