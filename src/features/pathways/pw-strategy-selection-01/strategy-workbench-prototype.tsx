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
  "Il gruppo passa sul percorso di cresta.",
  "Raggiunge il punto di osservazione più tardi del previsto.",
];

const orderTokens = ["stazione", "ponte", "pioggia", "cresta", "osservazione"];
const orderPool = ["pioggia", "stazione", "osservazione", "ponte", "cresta"];

const causeTokens = [
  "pioggia intensa",
  "sentiero basso inutilizzabile",
  "percorso di cresta",
  "arrivo più tardi",
];
const causePool = [
  "percorso di cresta",
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
  "Strategia ↔ scopo",
  "Cambio strategia",
  "Trasferimento",
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
      return "Ricostruire l’ordine del percorso senza guardare la scheda.";
    }
    if (["goal-shift", "choose-cause-tool", "cause-build", "principle"].includes(phase)) {
      return "Spiegare perché il gruppo ha cambiato percorso.";
    }
    if (["transfer-choice", "transfer-build", "complete"].includes(phase)) {
      return "Confrontare due percorsi di visita per durata, accesso e attività pratiche.";
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
          : "La prova non coincide ancora con la fonte. Puoi cambiare strumento e provare un metodo più direttamente legato all’ordine.",
      );
      return;
    }

    if (tool !== "sequence") {
      setFeedback(
        "La prova è riuscita. Ora confronta questa esperienza con uno strumento pensato direttamente per recuperare una sequenza.",
      );
      return;
    }

    award(0);
    setFeedback("Hai scelto e applicato uno strumento coerente con lo scopo del compito.");
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
          ? "La sequenza mantiene l’ordine, ma non rende esplicito che cosa provoca che cosa. Scegli uno strumento che mostri le relazioni causali."
          : "La rilettura mantiene disponibili i fatti, ma non organizza la relazione richiesta. Scegli uno strumento che mostri le cause e gli effetti.",
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
    setFeedback("Hai cambiato strategia quando è cambiato lo scopo e l’hai applicata al materiale.");
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
    setFeedback("Hai scelto e applicato una strategia adatta in un compito diverso.");
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
          <h1>Stesso obiettivo, strategia diversa</h1>
          <p className="strategyWorkbench__lede">
            Scegli uno strumento, provalo sul materiale e cambialo quando cambia il compito.
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
              <p className="strategyWorkbench__sceneKicker">Prima missione</p>
              <h2>Guarda il materiale prima di scegliere come lavorarci.</h2>
              <p>
                Tra poco la fonte verrà coperta. Non devi imparare “il metodo giusto”: devi capire quale
                strumento serve allo scopo.
              </p>
              <div className="strategyWorkbench__source">
                {expeditionFacts.map((fact, index) => (
                  <p key={fact}><span>{String(index + 1).padStart(2, "0")}</span>{fact}</p>
                ))}
              </div>
              <button type="button" className="strategyWorkbench__primary" onClick={() => setPhase("choose-order-tool")}>
                Apri il banco degli strumenti
              </button>
            </div>
          )}

          {phase === "choose-order-tool" && (
            <div className="strategyWorkbench__scene">
              <p className="strategyWorkbench__sceneKicker">Scegli in base alla missione</p>
              <h2>Quale strumento useresti per prepararti a ricostruire l’ordine?</h2>
              <div className="strategyWorkbench__source strategyWorkbench__source--compact">
                {expeditionFacts.map((fact) => <p key={fact}>{fact}</p>)}
              </div>
              <ToolBench onChoose={chooseOrderTool} />
            </div>
          )}

          {phase === "try-order-tool" && tool === "sequence" && (
            <div className="strategyWorkbench__scene">
              <p className="strategyWorkbench__sceneKicker">Strumento scelto · sequenza + recupero</p>
              <h2>Prima organizza. Poi copri la fonte e prova davvero.</h2>
              <div className="strategyWorkbench__sequencePreview">
                {orderTokens.map((token, index) => (
                  <span key={token}><b>{index + 1}</b>{token}</span>
                ))}
              </div>
              <p className="strategyWorkbench__hint">
                Nella prova successiva resteranno solo parole neutre: la frase sorgente non sarà leggibile.
              </p>
              <button type="button" className="strategyWorkbench__primary" onClick={beginRetrieval}>
                Copri la scheda e prova
              </button>
            </div>
          )}

          {phase === "try-order-tool" && tool === "cause" && (
            <div className="strategyWorkbench__scene">
              <p className="strategyWorkbench__sceneKicker">Strumento scelto · causa-effetto</p>
              <h2>Provalo davvero: costruisci la relazione che vedi nei fatti.</h2>
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
              <p className="strategyWorkbench__sceneKicker">Strumento scelto · rilettura</p>
              <h2>Rileggi il materiale. Poi la fonte verrà coperta.</h2>
              <div className="strategyWorkbench__source">
                {expeditionFacts.map((fact, index) => (
                  <p key={fact}><span>{String(index + 1).padStart(2, "0")}</span>{fact}</p>
                ))}
              </div>
              <button type="button" className="strategyWorkbench__primary" onClick={beginRetrieval}>
                Ho riletto · prova l’ordine
              </button>
            </div>
          )}

          {phase === "order-retrieval" && (
            <div className="strategyWorkbench__scene strategyWorkbench__scene--retrieval">
              <p className="strategyWorkbench__sceneKicker">Modalità recupero</p>
              <h2>La fonte è coperta. Ricostruisci l’ordine usando solo ciò che ricordi.</h2>
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
                      Prova sequenza + recupero
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {phase === "goal-shift" && (
            <div className="strategyWorkbench__scene strategyWorkbench__scene--shift">
              <p className="strategyWorkbench__sceneKicker">Cambio di missione</p>
              <h2>Le informazioni sono le stesse. È cambiato ciò che devi riuscire a fare.</h2>
              <div className="strategyWorkbench__source strategyWorkbench__source--compact">
                {expeditionFacts.map((fact) => <p key={fact}>{fact}</p>)}
              </div>
              <div className="strategyWorkbench__shiftCallout">
                <strong>Prima:</strong> ricostruire l’ordine.
                <span aria-hidden="true">→</span>
                <strong>Adesso:</strong> spiegare perché il gruppo ha cambiato percorso.
              </div>
              <button type="button" className="strategyWorkbench__primary" onClick={() => {
                setFeedback("");
                setPhase("choose-cause-tool");
              }}>
                Torna al banco degli strumenti
              </button>
            </div>
          )}

          {phase === "choose-cause-tool" && (
            <div className="strategyWorkbench__scene">
              <p className="strategyWorkbench__sceneKicker">Nuovo scopo</p>
              <h2>Quale strumento rende visibile che cosa provoca che cosa?</h2>
              <ToolBench onChoose={chooseCauseTool} compact />
              {feedback && <div className="strategyWorkbench__feedback" role="status"><p>{feedback}</p></div>}
            </div>
          )}

          {phase === "cause-build" && (
            <div className="strategyWorkbench__scene">
              <p className="strategyWorkbench__sceneKicker">Applica la nuova strategia</p>
              <h2>Costruisci la catena causa-effetto usando i frammenti disponibili.</h2>
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
              <p className="strategyWorkbench__sceneKicker">Quello che è emerso dal lavoro</p>
              <h2>Le strategie sono strumenti, non etichette personali.</h2>
              <blockquote>
                Prima chiarisco il compito. Poi scelgo una strategia, controllo che cosa rende possibile
                e la cambio se lo scopo o l’evidenza cambiano.
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
              <h2>Due percorsi, tre criteri. Come renderesti il confronto controllabile?</h2>
              <MuseumEvidence />
              <div className="strategyWorkbench__transferTools">
                <button type="button" onClick={() => chooseTransferTool("compare")}>
                  <strong>Griglia di confronto</strong>
                  <span>Organizzo i dati per criterio e percorso.</span>
                </button>
                <button type="button" onClick={() => chooseTransferTool("sequence")}>
                  <strong>Memorizzo un percorso</strong>
                  <span>Ricordo l’ordine delle informazioni del percorso Blu.</span>
                </button>
              </div>
              {feedback && <div className="strategyWorkbench__feedback" role="status"><p>{feedback}</p></div>}
            </div>
          )}

          {phase === "transfer-build" && (
            <div className="strategyWorkbench__scene strategyWorkbench__scene--museum">
              <p className="strategyWorkbench__sceneKicker">Applica il confronto</p>
              <h2>Completa la griglia usando soltanto i dati disponibili.</h2>
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
              <p className="strategyWorkbench__sceneKicker">Traccia finale</p>
              <h2>Non hai trovato “il tuo metodo”. Hai imparato a scegliere uno strumento in base al compito.</h2>
              <p>
                Tre compiti diversi, tre modi diversi di organizzare le informazioni. La traccia descrive
                soltanto ciò che hai fatto qui.
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
            <span className="strategyWorkbench__railLabel">Strumenti</span>
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
        <strong>Sequenza + recupero</strong>
        <small>Metto in ordine e poi provo senza fonte.</small>
      </button>
      <button type="button" onClick={() => onChoose("cause")}>
        <ToolGlyph type="cause" />
        <span className="strategyWorkbench__toolMark">02</span>
        <strong>Mappa causa-effetto</strong>
        <small>Collego ciò che provoca e ciò che accade.</small>
      </button>
      <button type="button" onClick={() => onChoose("reread")}>
        <ToolGlyph type="reread" />
        <span className="strategyWorkbench__toolMark">03</span>
        <strong>Rilettura</strong>
        <small>Ripercorro tutto senza cambiare la struttura.</small>
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
  if (tool === "sequence") return "Sequenza + recupero";
  if (tool === "cause") return "Mappa causa-effetto";
  if (tool === "reread") return "Rilettura";
  return "Griglia di confronto";
}
