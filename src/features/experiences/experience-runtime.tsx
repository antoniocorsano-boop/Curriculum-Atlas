"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type {
  ExperienceDefinition,
  ExperiencePresentation,
  ExperienceStageEvidence,
  ExperienceTransition,
  ExperienceWorkbenchMode,
} from "./model";
import { useExperienceSession } from "./use-experience-session";
import "./experience-runtime.css";

type ResolvedTransition = ExperienceTransition & { key: string };

const MODE_LABELS: Record<ExperienceWorkbenchMode, string> = {
  TIMELINE: "Metti in fila",
  CONNECTIONS: "Collega",
  COMPARE: "Confronta",
};

export function ExperienceRuntime({
  definition,
  presentation,
  onTransition,
}: {
  definition: ExperienceDefinition;
  presentation?: ExperiencePresentation;
  onTransition?: (nodeId: string, transitionId: string, targetNodeId: string) => void;
}) {
  const session = useExperienceSession({
    experienceId: definition.experienceId,
    entryNodeId: definition.graph.entryNodeId,
    statePolicy: definition.runtime.statePolicy,
  });
  const node =
    definition.graph.nodes.find((candidate) => candidate.id === session.currentNodeId) ??
    definition.graph.nodes.find((candidate) => candidate.id === definition.graph.entryNodeId);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const choiceName = useId();
  const [pendingTransition, setPendingTransition] = useState<ResolvedTransition | null>(null);
  const [choiceFeedback, setChoiceFeedback] = useState("");
  const [activeLocationId, setActiveLocationId] = useState("");
  const [activeEvidenceId, setActiveEvidenceId] = useState("");
  const [pinnedEvidenceIds, setPinnedEvidenceIds] = useState<string[]>([]);
  const [evidenceCatalog, setEvidenceCatalog] = useState<Record<string, ExperienceStageEvidence>>({});
  const [workbenchMode, setWorkbenchMode] = useState<ExperienceWorkbenchMode | null>(null);

  const view = node ? presentation?.nodes[node.id] : undefined;
  const transitions = useMemo<ResolvedTransition[]>(() => {
    if (!node) return [];
    return node.transitions.map((transition, index) => {
      const key = transition.id ?? `${node.id}:${index}`;
      const copy = view?.transitions?.[key];
      return {
        ...transition,
        key,
        label: copy?.label ?? transition.label,
        feedback: copy?.feedback ?? transition.feedback,
      };
    });
  }, [node, view]);

  useEffect(() => {
    setPendingTransition(null);
    setChoiceFeedback("");
    setActiveEvidenceId("");
    setWorkbenchMode(null);
    if (node?.stage?.evidence?.length) {
      setEvidenceCatalog((current) => {
        const next = { ...current };
        for (const item of node.stage?.evidence ?? []) next[item.id] = item;
        return next;
      });
    }
    const nextLocation =
      node?.stage?.focusLocationId ??
      node?.stage?.locations?.[0]?.id ??
      "";
    setActiveLocationId(nextLocation);
    if (session.ready) headingRef.current?.focus();
  }, [session.currentNodeId, session.ready, presentation?.id, node?.stage]);

  if (!session.ready || !node) return <p>Preparazione esperienza…</p>;

  const title = view?.title ?? node.title ?? (node.primitive === "TRANSFER" ? "Trasferisci" : node.id);
  const prompt = view?.prompt ?? node.prompt ?? "Osserva, ragiona e procedi.";
  const facts = view?.facts ?? node.facts ?? [];
  const isChoice = node.interaction === "choice";
  const isText = node.interaction === "text";
  const firstTransition = transitions[0];
  const activeWorld = pendingTransition?.worldAfter ?? node.world;
  const worldChangedByChoice = Boolean(pendingTransition?.worldAfter);
  const stage = node.stage;
  const stageEvidence = stage?.evidence ?? [];
  const activeLocation = stage?.locations?.find((location) => location.id === activeLocationId);
  const activeEvidence = activeEvidenceId
    ? stageEvidence.find((item) => item.id === activeEvidenceId)
    : undefined;
  const evidenceHere = stageEvidence.filter((item) => item.locationId === activeLocationId);
  const pinnedEvidence = pinnedEvidenceIds
    .map((id) => evidenceCatalog[id])
    .filter((item): item is ExperienceStageEvidence => Boolean(item));

  function selectTransition(transition: ResolvedTransition) {
    setPendingTransition(transition);
    setChoiceFeedback(
      transition.feedback ?? node!.feedbackCategory.replaceAll("_", " ").toLowerCase(),
    );
  }

  function proceed() {
    const transition = isChoice ? pendingTransition : firstTransition;
    if (transition) {
      onTransition?.(node!.id, transition.key, transition.targetNodeId);
      session.choose(transition.targetNodeId);
    }
  }

  function togglePinned(id: string) {
    setPinnedEvidenceIds((current) =>
      current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id],
    );
  }

  function chooseWorkbenchMode(mode: ExperienceWorkbenchMode) {
    setWorkbenchMode(mode);
    const transitionId = stage?.workbench?.transitionMap?.[mode];
    if (transitionId) {
      const transition = transitions.find((candidate) => candidate.key === transitionId || candidate.id === transitionId);
      if (transition) selectTransition(transition);
    }
  }

  if (stage) {
    return (
      <section
        className="experience-runtime experience-runtime--cinematic"
        aria-labelledby="experience-heading"
        data-session={session.sessionVersion}
        data-node={node.id}
      >
        <div className="experience-cinema">
          <div className="experience-cinema__topline">
            <p className="experience-kicker">Museo Zero · dopo la chiusura</p>
            <span>{activeLocation?.label ?? activeWorld?.place ?? "Sala Zero"}</span>
          </div>

          <div className="experience-cinema__world" data-world-changed={worldChangedByChoice || undefined}>
            <div className="experience-cinema__atmosphere" aria-hidden="true" />
            <div className="experience-cinema__projection" aria-hidden="true" />
            <div className="experience-cinema__floorline" aria-hidden="true" />

            <div className="experience-cinema__copy">
              <p className="experience-cinema__scene">{activeLocation?.detail ?? activeWorld?.place}</p>
              <h1 id="experience-heading" ref={headingRef} tabIndex={-1}>{title}</h1>
              {facts[0] ? <p className="experience-cinema__situation">{facts[0]}</p> : null}
            </div>

            {stage.locations?.length ? (
              <nav className="experience-locations" aria-label="Luoghi di Museo Zero">
                {stage.locations.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    className={activeLocationId === location.id ? "experience-location experience-location--active" : "experience-location"}
                    data-position={location.position.toLowerCase()}
                    onClick={() => {
                      setActiveLocationId(location.id);
                      setActiveEvidenceId("");
                    }}
                  >
                    <span>{location.label}</span>
                    <small>{location.detail}</small>
                  </button>
                ))}
              </nav>
            ) : null}

            {activeWorld ? (
              <div className="experience-causal-rail" aria-label={`Stato del mondo: ${activeWorld.place}`}>
                {activeWorld.signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="experience-causal-rail__signal"
                    data-signal-state={signal.state.toLowerCase()}
                  >
                    <span className="experience-causal-rail__pulse" aria-hidden="true" />
                    <strong>{signal.label}</strong>
                    <small>{signal.detail}</small>
                  </div>
                ))}
              </div>
            ) : null}

            {stage.characterBeat ? (
              <aside className="experience-character">
                <div className="experience-character__silhouette" aria-hidden="true">
                  {stage.characterBeat.name.slice(0, 1)}
                </div>
                <div>
                  <p><strong>{stage.characterBeat.name}</strong> · {stage.characterBeat.role}</p>
                  <blockquote>“{stage.characterBeat.line}”</blockquote>
                </div>
              </aside>
            ) : null}
          </div>

          {stageEvidence.length > 0 ? (
            <section className="experience-investigation" aria-label="Indagine">
              <header>
                <div>
                  <p className="experience-panel__eyebrow">Sul posto</p>
                  <h2>{activeLocation?.label ?? "Indizi"}</h2>
                </div>
                <span>{pinnedEvidenceIds.length} indizi sul banco</span>
              </header>

              <div className="experience-evidence-grid">
                {evidenceHere.map((item) => {
                  const pinned = pinnedEvidenceIds.includes(item.id);
                  return (
                    <article key={item.id} className={activeEvidenceId === item.id ? "experience-evidence experience-evidence--active" : "experience-evidence"}>
                      <button
                        type="button"
                        className="experience-evidence__inspect"
                        onClick={() => setActiveEvidenceId(item.id)}
                      >
                        <span>{item.kind === "PERSON" ? item.character ?? "Voce" : item.kind}</span>
                        <strong>{item.label}</strong>
                      </button>
                      <button
                        type="button"
                        className="experience-evidence__pin"
                        aria-pressed={pinned}
                        onClick={() => togglePinned(item.id)}
                      >
                        {pinned ? "Sul banco" : "Porta sul banco"}
                      </button>
                    </article>
                  );
                })}
              </div>

              {activeEvidence ? (
                <div className="experience-evidence-detail" role="status">
                  <p className="experience-panel__eyebrow">Dettaglio</p>
                  <h3>{activeEvidence.label}</h3>
                  <p>{activeEvidence.detail}</p>
                </div>
              ) : null}
            </section>
          ) : null}

          {stage.workbench ? (
            <section className="experience-workbench">
              <header>
                <div>
                  <p className="experience-panel__eyebrow">Banco di lavoro</p>
                  <h2>{stage.workbench.prompt}</h2>
                </div>
                <span>
                  {pinnedEvidenceIds.length < stage.workbench.minEvidence
                    ? `Porta almeno ${stage.workbench.minEvidence} indizi`
                    : "Indizi sufficienti per provare"}
                </span>
              </header>

              <div className="experience-workbench__modes" role="group" aria-label="Rappresentazione">
                {stage.workbench.modes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={workbenchMode === mode}
                    disabled={pinnedEvidenceIds.length < stage.workbench!.minEvidence}
                    onClick={() => chooseWorkbenchMode(mode)}
                  >
                    {MODE_LABELS[mode]}
                  </button>
                ))}
              </div>

              {workbenchMode ? (
                <div className="experience-workbench__surface" data-mode={workbenchMode.toLowerCase()}>
                  {pinnedEvidence.length === 0 ? (
                    <p>Porta qui gli indizi che vuoi usare.</p>
                  ) : (
                    pinnedEvidence.map((item, index) => (
                      <div key={item.id} className="experience-workbench__item">
                        <span>{workbenchMode === "TIMELINE" ? String(index + 1).padStart(2, "0") : "•"}</span>
                        <div>
                          <strong>{item.label}</strong>
                          <small>{item.detail}</small>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="experience-decision">
            <div>
              <p className="experience-panel__eyebrow">{node.primitive === "TRANSFER" ? "Decisione del team" : "La tua prossima mossa"}</p>
              <h2>{prompt}</h2>
            </div>

            {isChoice ? (
              <div className="experience-decisions" role="group" aria-label={prompt}>
                {transitions.map((transition) => (
                  <button
                    key={transition.key}
                    type="button"
                    aria-pressed={pendingTransition?.key === transition.key}
                    onClick={() => selectTransition(transition)}
                  >
                    {transition.label ?? "Scegli"}
                  </button>
                ))}
              </div>
            ) : null}

            {isText ? (
              <label className="experience-field">
                La tua risposta
                <textarea
                  value={session.responses[node.id] ?? ""}
                  onChange={(event) => session.writeResponse(node.id, event.target.value)}
                />
              </label>
            ) : null}

            {choiceFeedback ? (
              <p role="status" aria-live="polite" aria-atomic="true" className="experience-feedback experience-feedback--cinematic">
                {choiceFeedback}
              </p>
            ) : null}

            <div className="experience-actions experience-actions--cinematic">
              {!node.terminal ? (
                <button
                  type="button"
                  onClick={proceed}
                  disabled={isChoice ? !pendingTransition : !firstTransition}
                >
                  {worldChangedByChoice ? "Continua dalla conseguenza" : "Continua"}
                </button>
              ) : null}

              {node.terminal && definition.mode === "PATHWAY" ? (
                <>
                  <a href="/percorsi">Esci</a>
                  <button type="button" onClick={session.restart}>Ricomincia</button>
                </>
              ) : null}

              {node.terminal && definition.mode === "SMART" ? (
                <>
                  <button type="button" onClick={session.complete}>Completa</button>
                  <button type="button" onClick={session.restart}>Ricomincia</button>
                </>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    );
  }

  return (
    <section
      className="experience-runtime"
      aria-labelledby="experience-heading"
      data-session={session.sessionVersion}
    >
      <p className="experience-kicker">{definition.mode === "SMART" ? "Attività smart" : "Percorso"}</p>
      <h1 id="experience-heading" ref={headingRef} tabIndex={-1}>{title}</h1>

      {activeWorld && (
        <section
          className={worldChangedByChoice ? "experience-world experience-world--changed" : "experience-world"}
          aria-label={`Stato del mondo: ${activeWorld.place}`}
        >
          <div className="experience-world__heading">
            <div>
              <p className="experience-world__eyebrow">{activeWorld.place}</p>
              <h2>{worldChangedByChoice ? "Effetto della prova" : "Stato della scena"}</h2>
            </div>
            <strong className="experience-world__status" role="status" aria-live="polite">
              {activeWorld.status}
            </strong>
          </div>
          <div className="experience-world__signals">
            {activeWorld.signals.map((signal) => (
              <article
                key={signal.id}
                className="experience-world__signal"
                data-signal-state={signal.state.toLowerCase()}
              >
                <div className="experience-world__signal-head">
                  <span aria-hidden="true" className="experience-world__dot" />
                  <strong>{signal.label}</strong>
                  <span className="experience-world__state">{signal.state}</span>
                </div>
                {signal.detail ? <p>{signal.detail}</p> : null}
              </article>
            ))}
          </div>
        </section>
      )}

      {facts.length > 0 && (
        <div className="experience-facts">
          <h2>Quello che sappiamo</h2>
          <ul>{facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        </div>
      )}

      {!isChoice && <p className="experience-prompt">{prompt}</p>}

      {isText && (
        <label className="experience-field">
          La tua risposta
          <textarea
            value={session.responses[node.id] ?? ""}
            onChange={(event) => session.writeResponse(node.id, event.target.value)}
          />
        </label>
      )}

      {isChoice && (
        <fieldset className="experience-choice-group">
          <legend>{prompt}</legend>
          <div className="experience-choices">
            {transitions.map((transition) => (
              <label key={transition.key}>
                <input
                  type="radio"
                  name={choiceName}
                  value={transition.key}
                  checked={pendingTransition?.key === transition.key}
                  onChange={() => selectTransition(transition)}
                />
                <span>{transition.label ?? "Scegli"}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <p role="status" aria-live="polite" aria-atomic="true" className="experience-feedback">
        {choiceFeedback || (isChoice
          ? "Scegli una possibilità: potrai leggere il feedback prima di continuare."
          : node.feedbackCategory.replaceAll("_", " ").toLowerCase())}
      </p>

      <div className="experience-actions">
        {!node.terminal && (
          <button
            type="button"
            onClick={proceed}
            disabled={isChoice ? !pendingTransition : !firstTransition}
          >
            Continua
          </button>
        )}

        {node.terminal && definition.mode === "PATHWAY" && (
          <>
            <a href="/percorsi">Esci</a>
            <button type="button" onClick={session.restart}>Nuovo percorso</button>
          </>
        )}

        {node.terminal && definition.mode === "SMART" && (
          <>
            <button type="button" onClick={session.complete}>Completa</button>
            <button type="button" onClick={session.restart}>Ricomincia</button>
          </>
        )}
      </div>
    </section>
  );
}
