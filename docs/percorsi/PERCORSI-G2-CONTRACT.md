# Percorsi G2 — Contratto evolutivo

Status: `PROPOSED / CONTRACT_ONLY / NO_RUNTIME_CHANGE`

Baseline: `7a96587a7e27386d3ecd632fe29a7ec514f6b796` (G1 integrato).

## 1. Scopo
G2 evolve Percorsi da sequenza lineare di scene a grafo didattico versionato. Il contratto separa contenuto cognitivo, transizioni, grammatica di presentazione, stato di sessione e completamento. Nessuna parte di questo documento autorizza l'uso con studenti.

## 2. Benchmark e decisioni
Il benchmark usa H5P Branching Scenario per branching/terminali/feedback, Twine per separazione nodo-transizione-presentazione e GDevelop per modularità/eventi. I benchmark sono riferimenti progettuali, non dipendenze automatiche.

Adottiamo: grafo esplicito; transizioni dichiarative; terminali espliciti; renderer separato; comportamenti modulari; validazione statica.

Non adottiamo: scoring/classifiche; profilazione; analytics studente; dipendenza LMS; formato proprietario esterno come fonte canonica; motore di gioco completo senza necessità dimostrata.

## 3. Modello canonico

```ts
type PathwayDefinition = {
  schemaVersion: "2.0";
  pathwayId: string;
  version: string;
  entryNodeId: string;
  nodes: SceneNode[];
  presentationGrammars: PresentationGrammar[];
  governance: GovernancePolicy;
};

type SceneNode = {
  id: string;                 // interno, mai mostrato allo studente
  cognitiveFunction: string;
  contentRef: string;
  choices: ChoiceTransition[];
  terminal?: TerminalDefinition;
};

type ChoiceTransition = {
  id: string;
  labelRef: string;
  feedbackRef: string;
  targetNodeId?: string;
  effect?: SessionEffect;
};

type PresentationGrammar = {
  id: "L" | "N" | string;
  renderer: string;
  informationalParityGroup: string;
};

type SessionState = {
  currentNodeId: string;
  visitedNodeIds: string[];
  selections: Record<string, string>;
  completion: CompletionState;
};

type CompletionState =
  | { status: "in_progress" }
  | { status: "completed"; terminalId: string };
```

## 4. Invarianti obbligatori
1. `entryNodeId` deve esistere.
2. Ogni `targetNodeId` deve risolvere un nodo esistente.
3. Ogni cammino autorizzato deve poter raggiungere almeno un terminale.
4. Cicli ammessi solo se esplicitamente dichiarati e limitati; nessun ciclo accidentale.
5. `Termina` produce `CompletionState.completed`; `Ricomincia` crea una nuova sessione. Le due azioni non sono equivalenti.
6. Gli ID tecnici non sono contenuto dell'interfaccia studente.
7. L/N condividono lo stesso contenuto informativo e la stessa struttura cognitiva salvo differenze esplicitamente approvate.
8. Una grammatica visiva non può aggiungere indizi che rendano una scelta più saliente rispetto alle altre condizioni.
9. Feedback centrato sul processo: niente voto, punteggio, classifica o giudizio sulla persona.
10. Nessun nome/account/profilo studente richiesto.
11. Nessuna scrittura server-side delle risposte e nessuna telemetria studente nel contratto G2.
12. Persistenza locale disabilitata finché non autorizzata da un gate separato.
13. Accessibilità è requisito del renderer: semantica, tastiera, focus, annunci dinamici, reflow, contrasto, bersagli tattili e riduzione movimento.
14. Governance/privacy devono essere percepibili senza dominare la scena didattica.

## 5. Validatore G2
Il validatore deve produrre errore bloccante per: nodo orfano; target inesistente; terminale irraggiungibile; ciclo non dichiarato; ID tecnico esposto nel contenuto; divergenza informativa L/N; learner-write di rete; assenza dei requisiti semantici minimi.

Deve produrre evidenza machine-readable con `schemaVersion`, `pathwayId`, `pathwayVersion`, `exactHead`, esito di ciascun invariante e timestamp del collaudo.

## 6. Esperienza G2
La scena mobile privilegia il compito corrente. Governance/privacy restano disponibili e percepibili ma non vengono replicate come grandi blocchi a ogni nodo. Il completamento dispone di una schermata propria con sintesi del processo e azioni distinte: uscita/chiusura e nuova sessione.

La grammatica narrativa è un renderer, non una fonte alternativa di contenuto. Personaggi, immagini, dialoghi e metafore possono essere introdotti solo dopo verifica di parità informativa e accessibilità.

## 7. Gate
Sequenza obbligatoria:
`BENCHMARK_COMPLETE` → `CONTRACT_REVIEW` → `VALIDATOR_PASS` → `UX_PROTOTYPE_REVIEW` → `IMPLEMENTATION_CANDIDATE` → `EXACT_HEAD_REVIEW`.

L'autorizzazione studenti resta un gate separato e richiede anche una verifica umana valida con tecnologia assistiva.
