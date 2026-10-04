"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import "./strategy-workbench.css";

type Tool = "sequence" | "cause" | "reread" | "compare";
type Phase =
  | "orient"
  | "choose-order-tool"
  | "try-order-tool"
  | "order-retrieval"
  | "goal-shift"
  | "choose-cause-tool"
  | "cause-build"
  | "principle"
  | "transfer-choice"
  | "transfer-build"
  | "complete";

const expeditionFacts = [
  "Il gruppo parte dalla stazione sul campo.",
  "Attraversa un ponte pedonale.",
  "La pioggia intensa rende inutilizzabile il sentiero basso.",
  "Il gruppo passa sul percorso di cresta, che richiede più tempo.",
  "Raggiunge il punto di osservazione più tardi del previsto.",
];

const orderTokens = ["stazione", "ponte", "pioggia", "cresta", "osservazione"];
const orderPool = ["pioggia", "stazione", "osservazione", "ponte", "cresta"];

const causeTokens = [
  "pioggia intensa",
  "sentiero basso inutilizzabile",
  "percorso di cresta più lungo",
  "arrivo più tardi",
];
const causePool = [
  "percorso di cresta più lungo",
  "arrivo più tardi",
  "pioggia intensa",
  "sentiero basso inutilizzabile",
];

const museumFacts = {
  blu: {
    durata: "45 min",
    accesso: "ascensore",
    pratica: "1 attività pratica",
  },
  verde: {
    durata: "30 min",
    accesso: "solo scale",
    pratica: "2 attività pratiche",
  },
};

const tableOptions = {
  durata: ["—", "30 min", "45 min"],
  accesso: ["—", "ascensore", "solo scale"],
  pratica: ["—", "1 attività pratica", "2 attività pratiche"],
};

const traceLabels = [
  "Ho scelto come prepararmi",
  "Ho cambiato modo",
  "L’ho usato in un caso nuovo",
];

function sameOrder(actual: string[], expected: string[]) {
  return actual.length === expected.length && actual.every((item, index) => item === expected[index]);
}

export function StrategyWorkbenchPrototype() {
  const [phase, setPhase] = useState<Phase>("orient");
  const surfaceRef = useRef<HTMLElement>(null);
  const [tool, setTool] = useState<Tool | null>(null);
  const [orderAttempt, setOrderAttempt] = useState<string[]>([]);
  const [causeAttempt, setCauseAttempt] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [earned, setEarned] = useState<boolean[]>([false, false, false]);
  const [transferTool, setTransferTool] = useState<Tool | null>(null);
  const [table, setTable] = useState({
    bluDurata: "—",
    verdeDurata: "—",
    bluAccesso: "—",
    verdeAccesso: "—",
    bluPratica: "—",
    verdePratica: "—",
  });

  const mission = useMemo(() => {
    if (["orient", "choose-order-tool", "try-order-tool", "order-retrieval"].includes(phase)) {
      return "Tra poco le frasi spariranno: dovrai rimettere gli eventi nell’ordine giusto.";
    }
    if (["goal-shift", "choose-cause-tool", "cause-build", "principle"].includes(phase)) {
      return "Adesso devi spiegare perché il gruppo ha cambiato sentiero e perché è arrivato più tardi.";
    }
    if (["transfer-choice", "transfer-build", "complete"].includes(phase)) {
      return "Scegli il modo più chiaro per confrontare due percorsi di visita.";
    }
    return "";
  }, [phase]);

  useEffect(() => {
    const heading = surfaceRef.current?.querySelector<HTMLHeadingElement>(".strategyWorkbench__scene h2");
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus();
  }, [phase]);

  function award(index: number) {
    setEarned((current) => current.map((value, itemIndex) => (itemIndex === index ? true : value)));
  }

  function chooseOrderTool(nextTool: Tool) {
    setTool(nextTool);
    setFeedback("");
    setOrderAttempt([]);
    setCauseAttempt([]);
    setPhase("try-order-tool");
  }

  function beginRetrieval() {
    setOrderAttempt([]);
    setFeedback("");
    setPhase("order-retrieval");
  }

  function invalidateOrderValidation() {
    setFeedback("");
    setEarned((current) => current.map((value, index) => (index === 0 ? false : value)));
  }

  function addOrderToken(token: string) {
    invalidateOrderValidation();
    if (!orderAttempt.includes(token)) setOrderAttempt((current) => [...current, token]);
  }

  function removeOrderToken(token: string) {
    invalidateOrderValidation();
    setOrderAttempt((current) => current.filter((item) => item !== token));
  }

  function clearOrderAttempt() {
    invalidateOrderValidation();
    setOrderAttempt([]);
  }

  function checkOrder() {
    const correct = sameOrder(orderAttempt, orderTokens);
    if (!correct) {
      setFeedback(
        tool === "sequence"
          ? "L’ordine non coincide ancora con la fonte. Puoi riprovare senza trasformare l’errore in un punteggio."
          : "La prova non coincide ancora con la fonte. Puoi provare un altro modo per prepararti all’ordine.",
      );
      return;
    }

    if (tool !== "sequence") {
      setFeedback(
        "La prova è riuscita. Ora prova anche un modo pensato proprio per ricordare una sequenza.",
      );
      return;
    }

    award(0);
    setFeedback("Hai scelto un modo per prepararti e lo hai usato nella prova.");
  }

  function startSequenceComparison() {
    setTool("sequence");
    setOrderAttempt([]);
    setFeedback("");
    setPhase("try-order-tool");
  }

  function invalidateCauseValidation() {
    setFeedback("");
    setEarned((current) => current.map((value, index) => (index === 1 ? false : value)));
  }

  function addCauseToken(token: string) {
    invalidateCauseValidation();
    if (!causeAttempt.includes(token)) setCauseAttempt((current) => [...current, token]);
  }

  function removeCauseToken(token: string) {
    invalidateCauseValidation();
    setCauseAttempt((current) => current.filter((item) => item !== token));
  }

  function clearCauseAttempt() {
    invalidateCauseValidation();
    setCauseAttempt([]);
  }

  function checkInitialCauseTool() {
    if (!sameOrder(causeAttempt, causeTokens)) {
      setFeedback("La relazione non è ancora coerente con le informazioni disponibili. Riorganizza i passaggi.");
      return;
    }
    setFeedback(
      "La mappa rende visibile perché il percorso è cambiato. Ma la missione attuale chiede ancora di ricostruire l’ordine: ora prova il recupero senza fonte.",
    );
  }

  function chooseCauseTool(nextTool: Tool) {
    setTool(nextTool);
    setCauseAttempt([]);
    if (nextTool !== "cause") {
      setFeedback(
        nextTool === "sequence"
          ? "Mettere in ordine aiuta a vedere prima e dopo, ma qui devi mostrare che cosa ha causato il cambiamento. Prova un altro modo."
          : "Rileggere ti fa rivedere i fatti, ma qui devi mostrare che cosa ha causato il cambiamento. Prova un altro modo.",
      );
      return;
    }
    setFeedback("");
    setPhase("cause-build");
  }

  function checkCauseBuild() {
    if (!sameOrder(causeAttempt, causeTokens)) {
      setFeedback("La catena non rende ancora corretta la relazione causa-effetto. Puoi rivederla.");
      return;
    }
    award(1);
    setFeedback("La domanda è cambiata e tu hai cambiato modo di lavorare.");
  }

  function chooseTransferTool(nextTool: Tool) {
    setTransferTool(nextTool);
    setTool(nextTool);
    if (nextTool !== "compare") {
      setFeedback(
        "Memorizzare un ordine non rende controllabile un confronto per criteri. Puoi tornare al banco degli strumenti e scegliere di nuovo.",
      );
      return;
    }
    setFeedback("");
    setPhase("transfer-build");
  }

  function updateComparison(patch: Partial<typeof table>) {
    setFeedback("");
    setEarned((current) => current.map((value, index) => (index === 2 ? false : value)));
    setTable((current) => ({ ...current, ...patch }));
  }

  function checkTransfer() {
    const correct =
      transferTool === "compare" &&
      table.bluDurata === museumFacts.blu.durata &&
      table.verdeDurata === museumFacts.verde.durata &&
      table.bluAccesso === museumFacts.blu.accesso &&
      table.verdeAccesso === museumFacts.verde.accesso &&
      table.bluPratica === museumFacts.blu.pratica &&
      table.verdePratica === museumFacts.verde.pratica;

    if (!correct) {
      setFeedback("Il confronto non è ancora completo o coerente con i dati. Rivedi le celle prima di controllare di nuovo.");
      return;
    }

    award(2);
    setFeedback("In una situazione nuova hai trovato un modo chiaro per confrontare i dati.");
  }

  function resetPrototype() {
    setPhase("orient");
    setTool(null);
    setTransferTool(null);
    setOrderAttempt([]);
    setCauseAttempt([]);
    setFeedback("");
    setEarned([false, false, false]);
    setTable({
      bluDurata: "—",
      verdeDurata: "—",
      bluAccesso: "—",
      verdeAccesso: "—",
      bluPratica: "—",
      verdePratica: "—",
    });
  }

  return (
    <main className="strategyWorkbench" data-phase={phase}>
      <header className="strategyWorkbench__top">
        <div>
          <p className="strategyWorkbench__eyebrow">Atlas · Percorsi · laboratorio esperienza</p>
          <h1>Missione: rimetti in ordine gli eventi</h1>
          <p className="strategyWorkbench__lede">
            Prima capisci che cosa è successo. Poi scegli come prepararti alla prova.
          </p>
        </div>
        <div className="strategyWorkbench__review">
          <strong>PROTOTIPO · NON AUTORIZZATO AGLI STUDENTI</strong>
          <span>Stato volatile · nessun account · nessuna telemetria</span>
        </div>
      </header>

      <section className="strategyWorkbench__mission" aria-labelledby="mission-title">
        <span>Missione</span>
        <h2 id="mission-title">{mission}</h2>
        <div className="strategyWorkbench__missionProgress" aria-label="Avanzamento del percorso">
          {traceLabels.map((label, index) => (
            <span key={label} title={label} data-earned={earned[index]} aria-label={`${label}: ${earned[index] ? "raggiunto" : "da raggiungere"}`} />
          ))}
        </div>
      </section>

      <div className="strategyWorkbench__layout">
        <section ref={surfaceRef} className="strategyWorkbench__surface" aria-label="Piano di lavoro">
          {phase === "orient" && (
            <div className="strategyWorkbench__scene strategyWorkbench__scene--intro">
              <p className="strategyWorkbench__sceneKicker">Situazione</p>
              <h2>Che cosa è successo durante il percorso?</h2>
              <p>
                Leggi cosa è successo. Tra poco queste frasi verranno coperte e dovrai rimettere gli eventi
                nell’ordine corretto.
              </p>
              <div className="strategyWorkbench__source">
                {expeditionFacts.map((fact, index) => (
                  <p key={fact}><span>{String(index + 1).padStart(2, "0")}</span>{fact}</p>
                ))}
              </div>
              <button type="button" className="strategyWorkbench__primary" onClick={() => setPhase("choose-order-tool")}>
                Ho letto · continua
              </button>
            </div>
          )}

          {phase === "choose-order-tool" && (
            <div className="strategyWorkbench__scene">
              <p className="strategyWorkbench__sceneKicker">Prima della prova</p>
              <h2>Prima della prova, cosa vuoi fare?</h2>
              <div className="strategyWorkbench__source strategyWorkbench__source--compact">
                {expeditionFacts.map((fact) => <p key={fact}>{fact}</p>)}
              </div>
              <ToolBench onChoose={chooseOrderTool} />
            </div>
          )}

          {phase === "try-order-tool" && tool === "sequence" && (
            <div className="strategyWorkbench__scene">
              <p className="strategyWorkbench__sceneKicker">Preparazione</p>
              <h2>Metti a fuoco l’ordine. Poi prova senza guardare.</h2>
              <div className="strategyWorkbench__sequencePreview">
                {orderTokens.map((token, index) => (
                  <span key={token}><b>{index + 1}</b>{token}</span>
                ))}
              </div>
              <p className="strategyWorkbench__hint">
                Quando inizi la prova, le frasi complete spariscono. Restano solo cinque parole-promemoria.
              </p>
              <button type="button" className="strategyWorkbench__primary" onClick={beginRetrieval}>
                Inizia la prova
              </button>
            </div>
          )}

          {phase === "try-order-tool" && tool === "cause" && (
            <div className="strategyWorkbench__scene">
              <p className="strategyWorkbench__sceneKicker">Hai scelto: cause e conseguenze</p>
              <h2>Prova a collegare ciò che ha provocato il cambiamento del percorso.</h2>
              <TokenBuilder
                pool={causePool}
                selected={causeAttempt}
                onAdd={addCauseToken}
                onRemove={removeCauseToken}
                connector="→"
              />
              <div className="strategyWorkbench__actions">
                <button type="button" onClick={clearCauseAttempt}>Svuota</button>
                <button type="button" className="strategyWorkbench__primary" onClick={checkInitialCauseTool}>Controlla la relazione</button>
              </div>
              {feedback && (
                <div className="strategyWorkbench__feedback" role="status">
                  <p>{feedback}</p>
                  {sameOrder(causeAttempt, causeTokens) && (
                    <button type="button" className="strategyWorkbench__primary" onClick={beginRetrieval}>
                      Ora controlla l’ordine
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {phase === "try-order-tool" && tool === "reread" && (
            <div className="strategyWorkbench__scene">
              <p className="strategyWorkbench__sceneKicker">Hai scelto: rileggere</p>
              <h2>Rileggi le cinque frasi. Poi prova a ricordare l’ordine senza guardare.</h2>
              <div className="strategyWorkbench__source">
                {expeditionFacts.map((fact, index) => (
                  <p key={fact}><span>{String(index + 1).padStart(2, "0")}</span>{fact}</p>
                ))}
              </div>
              <button type="button" className="strategyWorkbench__primary" onClick={beginRetrieval}>
                Ho riletto · inizia la prova
              </button>
            </div>
          )}

          {phase === "order-retrieval" && (
            <div className="strategyWorkbench__scene strategyWorkbench__scene--retrieval">
              <p className="strategyWorkbench__sceneKicker">Prova</p>
              <h2>Le frasi sono coperte. Rimetti questi cinque elementi nell’ordine in cui sono accaduti.</h2>
              <div className="strategyWorkbench__covered" aria-hidden="true">
                <span>Fonte coperta</span>
              </div>
              <TokenBuilder
                pool={orderPool}
                selected={orderAttempt}
                onAdd={addOrderToken}
                onRemove={removeOrderToken}
                connector="→"
              />
              <div className="strategyWorkbench__actions">
                <button type="button" onClick={clearOrderAttempt}>Svuota</button>
                <button type="button" className="strategyWorkbench__primary" onClick={checkOrder}>Controlla</button>
              </div>
              {feedback && (
                <div className="strategyWorkbench__feedback" role="status">
                  <p>{feedback}</p>
                  {sameOrder(orderAttempt, orderTokens) && tool === "sequence" && (
                    <button type="button" className="strategyWorkbench__primary" onClick={() => {
                      setFeedback("");
                      setPhase("goal-shift");
                    }}>
                      Continua
                    </button>
                  )}
                  {tool !== "sequence" && (
                    <button type="button" className="strategyWorkbench__primary" onClick={startSequenceComparison}>
                      Prova anche a mettere gli eventi in ordine
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {phase === "goal-shift" && (
            <div className="strategyWorkbench__scene strategyWorkbench__scene--shift">
              <p className="strategyWorkbench__sceneKicker">Nuova domanda</p>
              <h2>Ora non ti serve ricordare l’ordine. Devi capire perché il gruppo ha cambiato sentiero e perché è arrivato più tardi.</h2>
              <div className="strategyWorkbench__source strategyWorkbench__source--compact">
                {expeditionFacts.map((fact) => <p key={fact}>{fact}</p>)}
              </div>
              <div className="strategyWorkbench__shiftCallout">
                <strong>Prima:</strong> “Che cosa è successo prima e dopo?”
                <span aria-hidden="true">→</span>
                <strong>Adesso:</strong> “Che cosa ha fatto cambiare percorso al gruppo e che cosa ha causato il ritardo?”
              </div>
              <button type="button" className="strategyWorkbench__primary" onClick={() => {
                setFeedback("");
                setPhase("choose-cause-tool");
              }}>
                Scegli come affrontare la nuova domanda
              </button>
            </div>
          )}

          {phase === "choose-cause-tool" && (
            <div className="strategyWorkbench__scene">
              <p className="strategyWorkbench__sceneKicker">Nuova domanda</p>
              <h2>Come puoi rendere chiaro che cosa ha causato il cambio di percorso e il ritardo?</h2>
              <ToolBench onChoose={chooseCauseTool} compact />
              {feedback && <div className="strategyWorkbench__feedback" role="status"><p>{feedback}</p></div>}
            </div>
          )}

          {phase === "cause-build" && (
            <div className="strategyWorkbench__scene">
              <p className="strategyWorkbench__sceneKicker">Costruisci la spiegazione</p>
              <h2>Metti in fila le cause e le conseguenze fino all’arrivo in ritardo.</h2>
              <TokenBuilder
                pool={causePool}
                selected={causeAttempt}
                onAdd={addCauseToken}
                onRemove={removeCauseToken}
                connector="→"
              />
              <div className="strategyWorkbench__actions">
                <button type="button" onClick={clearCauseAttempt}>Svuota</button>
                <button type="button" className="strategyWorkbench__primary" onClick={checkCauseBuild}>Controlla</button>
              </div>
              {feedback && (
                <div className="strategyWorkbench__feedback" role="status">
                  <p>{feedback}</p>
                  {sameOrder(causeAttempt, causeTokens) && (
                    <button type="button" className="strategyWorkbench__primary" onClick={() => {
                      setFeedback("");
                      setPhase("principle");
                    }}>
                      Continua
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {phase === "principle" && (
            <div className="strategyWorkbench__scene strategyWorkbench__scene--principle">
              <p className="strategyWorkbench__sceneKicker">Che cosa hai scoperto</p>
              <h2>Lo stesso materiale può richiedere modi diversi di lavorare.</h2>
              <blockquote>
                Prima capisco che cosa devo fare. Poi scelgo un modo per lavorare e lo cambio se la domanda cambia.
              </blockquote>
              <button type="button" className="strategyWorkbench__primary" onClick={() => {
                setFeedback("");
                setPhase("transfer-choice");
              }}>
                Prova in una situazione nuova
              </button>
            </div>
          )}

          {phase === "transfer-choice" && (
            <div className="strategyWorkbench__scene strategyWorkbench__scene--museum">
              <p className="strategyWorkbench__sceneKicker">Nuova situazione · museo</p>
              <h2>Devi scegliere tra due percorsi. Come puoi confrontarli senza confondere i dati?</h2>
              <MuseumEvidence />
              <div className="strategyWorkbench__transferTools">
                <button type="button" onClick={() => chooseTransferTool("compare")}>
                  <strong>Tabella di confronto</strong>
                  <span>Metto durata, accesso e attività uno accanto all’altro.</span>
                </button>
                <button type="button" onClick={() => chooseTransferTool("sequence")}>
                  <strong>Cerco di ricordare un percorso</strong>
                  <span>Provo a ricordare i dati del percorso Blu.</span>
                </button>
              </div>
              {feedback && <div className="strategyWorkbench__feedback" role="status"><p>{feedback}</p></div>}
            </div>
          )}

          {phase === "transfer-build" && (
            <div className="strategyWorkbench__scene strategyWorkbench__scene--museum">
              <p className="strategyWorkbench__sceneKicker">Confronta</p>
              <h2>Completa la tabella: ogni riga deve confrontare lo stesso criterio.</h2>
              <MuseumEvidence />
              <div className="strategyWorkbench__comparison" aria-label="Griglia di confronto">
                <span className="strategyWorkbench__comparisonHead">Criterio</span>
                <span className="strategyWorkbench__comparisonHead">Blu</span>
                <span className="strategyWorkbench__comparisonHead">Verde</span>
                <ComparisonRow
                  label="Durata"
                  options={tableOptions.durata}
                  blue={table.bluDurata}
                  green={table.verdeDurata}
                  onBlue={(value) => updateComparison({ bluDurata: value })}
                  onGreen={(value) => updateComparison({ verdeDurata: value })}
                />
                <ComparisonRow
                  label="Accesso"
                  options={tableOptions.accesso}
                  blue={table.bluAccesso}
                  green={table.verdeAccesso}
                  onBlue={(value) => updateComparison({ bluAccesso: value })}
                  onGreen={(value) => updateComparison({ verdeAccesso: value })}
                />
                <ComparisonRow
                  label="Attività pratiche"
                  options={tableOptions.pratica}
                  blue={table.bluPratica}
                  green={table.verdePratica}
                  onBlue={(value) => updateComparison({ bluPratica: value })}
                  onGreen={(value) => updateComparison({ verdePratica: value })}
                />
              </div>
              <button type="button" className="strategyWorkbench__primary" onClick={checkTransfer}>Controlla il confronto</button>
              {feedback && (
                <div className="strategyWorkbench__feedback" role="status">
                  <p>{feedback}</p>
                  {earned[2] && (
                    <button type="button" className="strategyWorkbench__primary" onClick={() => setPhase("complete")}>
                      Concludi
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {phase === "complete" && (
            <div className="strategyWorkbench__scene strategyWorkbench__scene--complete">
              <p className="strategyWorkbench__sceneKicker">Hai finito</p>
              <h2>Hai cambiato modo di lavorare quando è cambiata la domanda.</h2>
              <p>
                Hai usato ordine, causa-effetto e confronto in tre momenti diversi. Non perché uno sia
                “il tuo modo”, ma perché ogni domanda chiedeva qualcosa di diverso.
              </p>
              <div className="strategyWorkbench__finalTools" aria-label="Strumenti usati">
                <span><b>01</b> Sequenza</span>
                <span><b>02</b> Causa-effetto</span>
                <span><b>03</b> Confronto</span>
              </div>
              <div className="strategyWorkbench__completeTrace">
                {traceLabels.map((label, index) => (
                  <span key={label} data-earned={earned[index]}>{earned[index] ? "✓" : "○"} {label}</span>
                ))}
              </div>
              <div className="strategyWorkbench__actions">
                <Link href="/percorsi/lab">Torna alla libreria lab</Link>
                <button type="button" className="strategyWorkbench__primary" onClick={resetPrototype}>Ricomincia</button>
              </div>
            </div>
          )}
        </section>

        <aside className="strategyWorkbench__rail" aria-label="Tracce della sessione">
          <div>
            <span className="strategyWorkbench__railLabel">Sto usando</span>
            <strong>{tool ? toolLabel(tool) : "Nessuno scelto"}</strong>
          </div>
          <ol>
            {traceLabels.map((label, index) => (
              <li key={label} data-earned={earned[index]}>
                <span aria-hidden="true">{earned[index] ? "●" : "○"}</span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
          <p>
            Queste tracce restano solo nella memoria della pagina. Il prototipo non salva profili né punteggi.
          </p>
        </aside>
      </div>

      <footer className="strategyWorkbench__footer">
        <strong>Experience Quality Gate:</strong> superficie di laboratorio per Human Review. Nessuna autorizzazione runtime o registrazione nella libreria pubblica.
      </footer>
    </main>
  );
}

function ToolBench({
  onChoose,
  compact = false,
}: {
  onChoose: (tool: Tool) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "strategyWorkbench__tools strategyWorkbench__tools--compact" : "strategyWorkbench__tools"}>
      <button type="button" onClick={() => onChoose("sequence")}>
        <ToolGlyph type="sequence" />
        <span className="strategyWorkbench__toolMark">01</span>
        <strong>Metto gli eventi in ordine</strong>
        <small>Li dispongo in sequenza e poi provo a ricordarli.</small>
      </button>
      <button type="button" onClick={() => onChoose("cause")}>
        <ToolGlyph type="cause" />
        <span className="strategyWorkbench__toolMark">02</span>
        <strong>Cerco cause e conseguenze</strong>
        <small>Collego ciò che fa succedere qualcos’altro.</small>
      </button>
      <button type="button" onClick={() => onChoose("reread")}>
        <ToolGlyph type="reread" />
        <span className="strategyWorkbench__toolMark">03</span>
        <strong>Rileggo tutto</strong>
        <small>Rileggo le cinque frasi così come sono.</small>
      </button>
    </div>
  );
}

function ToolGlyph({ type }: { type: Exclude<Tool, "compare"> }) {
  if (type === "sequence") {
    return (
      <span className="strategyWorkbench__toolGlyph" aria-hidden="true">
        <i /><i /><i /><em>→</em>
      </span>
    );
  }
  if (type === "cause") {
    return (
      <span className="strategyWorkbench__toolGlyph strategyWorkbench__toolGlyph--cause" aria-hidden="true">
        <i /><em>→</em><i /><em>→</em><i />
      </span>
    );
  }
  return (
    <span className="strategyWorkbench__toolGlyph strategyWorkbench__toolGlyph--reread" aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

function TokenBuilder({
  pool,
  selected,
  onAdd,
  onRemove,
  connector,
}: {
  pool: string[];
  selected: string[];
  onAdd: (token: string) => void;
  onRemove: (token: string) => void;
  connector: string;
}) {
  const available = pool.filter((token) => !selected.includes(token));
  return (
    <div className="strategyWorkbench__builder">
      <div className="strategyWorkbench__built" aria-label="Struttura costruita">
        {selected.length === 0 ? (
          <span className="strategyWorkbench__placeholder">La struttura comparirà qui.</span>
        ) : (
          selected.map((token, index) => (
            <span className="strategyWorkbench__builtItem" key={token}>
              <button type="button" onClick={() => onRemove(token)} aria-label={`Rimuovi ${token}`}>
                {token}
              </button>
              {index < selected.length - 1 && <i aria-hidden="true">{connector}</i>}
            </span>
          ))
        )}
      </div>
      <div className="strategyWorkbench__pool" aria-label="Frammenti disponibili">
        {available.map((token) => (
          <button type="button" key={token} onClick={() => onAdd(token)}>{token}</button>
        ))}
      </div>
    </div>
  );
}

function MuseumEvidence() {
  return (
    <div className="strategyWorkbench__museumEvidence">
      <div>
        <span>Blu</span>
        <p>45 min · 5 sale · ascensore · 1 attività pratica</p>
      </div>
      <div>
        <span>Verde</span>
        <p>30 min · 3 sale · solo scale · 2 attività pratiche</p>
      </div>
    </div>
  );
}

function ComparisonRow({
  label,
  options,
  blue,
  green,
  onBlue,
  onGreen,
}: {
  label: string;
  options: string[];
  blue: string;
  green: string;
  onBlue: (value: string) => void;
  onGreen: (value: string) => void;
}) {
  return (
    <>
      <strong>{label}</strong>
      <select aria-label={`${label}, percorso Blu`} value={blue} onChange={(event) => onBlue(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      <select aria-label={`${label}, percorso Verde`} value={green} onChange={(event) => onGreen(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </>
  );
}

function toolLabel(tool: Tool) {
  if (tool === "sequence") return "Metto gli eventi in ordine";
  if (tool === "cause") return "Cerco cause e conseguenze";
  if (tool === "reread") return "Rileggo tutto";
  return "Tabella di confronto";
}
