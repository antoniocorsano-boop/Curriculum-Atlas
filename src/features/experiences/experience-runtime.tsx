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
import { MuseoZeroOpening, museoZeroMission } from "./museo-zero-opening";
import { museoZeroPortrait } from "./museo-zero-narrative";
import { MuseoZeroRoomResponse, MuseoZeroReviewWorkbench } from "./museo-zero-revision-surfaces";
import type {VerifiedSceneIllustration} from "../pathways/edutwin-preview-media";

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
  verifiedIllustrations,
}: {
  definition: ExperienceDefinition;
  presentation?: ExperiencePresentation;
  verifiedIllustrations?: ReadonlyMap<string,VerifiedSceneIllustration>;
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
  const [evidenceConnections, setEvidenceConnections] = useState<Array<{ from: string; to: string }>>([]);
  const [connectionOriginId, setConnectionOriginId] = useState<string | null>(null);
  const isMuseoZeroReview = definition.experienceId === "studio-preview-pw-strategy-selection-01-museo-zero";

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
  }, [session.currentNodeId, session.ready, session.sessionVersion, presentation?.id, node?.stage]);

  if (!session.ready || !node) return <p>Preparazione esperienza…</p>;

  const title = view?.title ?? node.title ?? (node.primitive === "TRANSFER" ? "Trasferisci" : node.id);
  const prompt = view?.prompt ?? node.prompt ?? "Osserva, ragiona e procedi.";
  const facts = view?.facts ?? node.facts ?? [];
  const isChoice = node.interaction === "choice";
  const isText = node.interaction === "text";
  const firstTransition = transitions[0];
  const isEduTwin = definition.qualificationProfileId === "STUDIO_ATLAS_PREVIEW_V0" && definition.graph.entryNodeId === "edutwin-opening";
  const authoredSummary = isEduTwin && !isChoice && !isText;
  const revealAfterAction = authoredSummary && !node.terminal;
  const actionLabel = authoredSummary ? (pendingTransition ? "Prosegui" : firstTransition?.label ?? prompt) : "Continua";
  const activeWorld = pendingTransition?.worldAfter ?? node.world;
  const worldChangedByChoice = Boolean(pendingTransition?.worldAfter);
  const illustration = isEduTwin ? verifiedIllustrations?.get(node.id) : undefined;
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
  const workbenchReady = !isMuseoZeroReview || !stage?.workbench || (
    pinnedEvidenceIds.length >= stage.workbench.minEvidence && workbenchMode !== null
  );
  function reorderEvidence(id: string, direction: -1 | 1) {
    setPinnedEvidenceIds(current => {
      const index = current.indexOf(id);
      const to = index + direction;
      if (index < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }
  function joinEvidence(id: string) {
    if (!connectionOriginId || connectionOriginId === id) {
      setConnectionOriginId(connectionOriginId === id ? null : id);
      return;
    }
    setEvidenceConnections(current =>
      current.some(pair => pair.from === connectionOriginId && pair.to === id)
        ? current
        : [...current, { from: connectionOriginId, to: id }]
    );
    setConnectionOriginId(null);
  }

  function selectTransition(transition: ResolvedTransition) {
    setPendingTransition(transition);
    setChoiceFeedback(
      transition.feedback ?? node!.feedbackCategory.replaceAll("_", " ").toLowerCase(),
    );
  }

  function proceed() {
    if (!workbenchReady) return;
    // Every authored summary, including the opening, exposes its consequence before navigation.
    if (revealAfterAction && !pendingTransition && firstTransition) {
      selectTransition(firstTransition);
      return;
    }
    const transition = isChoice || revealAfterAction ? pendingTransition : firstTransition;
    if (transition) {
      onTransition?.(node!.id, transition.key, transition.targetNodeId);
      session.choose(transition.targetNodeId);
    }
  }

  function restartExperience() {
    setPinnedEvidenceIds([]);
    setEvidenceCatalog({});
    setActiveEvidenceId("");
    setPendingTransition(null);
    setChoiceFeedback("");
    setWorkbenchMode(null);
    setEvidenceConnections([]);
    setConnectionOriginId(null);
    session.restart();
  }

  function togglePinned(id: string) {
    if (isMuseoZeroReview && pinnedEvidenceIds.includes(id)) {
      setEvidenceConnections(current => current.filter(pair => pair.from !== id && pair.to !== id));
      setConnectionOriginId(current => current === id ? null : current);
    }
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

  if (isMuseoZeroReview && node.id === "MZ1_FAILED_REHEARSAL") {
    return (
      <div className="experience-runtime" data-session={session.sessionVersion} data-node={node.id}>
        <MuseoZeroOpening key={session.sessionVersion} title={title} headingRef={headingRef} onContinue={proceed} />
      </div>
    );
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
            <p className="experience-kicker">Percorso interattivo</p>
            <span>{activeLocation?.label ?? activeWorld?.place ?? title}</span>
          </div>

          {isMuseoZeroReview && !["MZ6_FINAL_REHEARSAL", "MZ7_QUIET_CLOSE"].includes(node.id) ? (
            <div className="mz-mission" data-testid="museo-mission-reminder"><p><strong>La tua missione:</strong> {museoZeroMission}</p></div>
          ) : null}
          <div className="experience-cinema__world" data-world-changed={worldChangedByChoice || undefined}>
            <div className="experience-cinema__atmosphere" aria-hidden="true" />
            <div className="experience-cinema__projection" aria-hidden="true" />
            <div className="experience-cinema__floorline" aria-hidden="true" />

            <div className="experience-cinema__copy">
              <p className="experience-cinema__scene">{activeLocation?.detail ?? activeWorld?.place}</p>
              <h1 id="experience-heading" ref={headingRef} tabIndex={-1}>{title}</h1>
              {facts.map((fact, index) => <p key={index} className="experience-cinema__situation">{fact}</p>)}
            </div>

            {stage.locations?.length ? (
              <nav className="experience-locations" aria-label="Luoghi del percorso">
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
                <p className="experience-causal-rail__status" role="status">{activeWorld.status}</p>
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
                  {isMuseoZeroReview && museoZeroPortrait(stage.characterBeat.name) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="mz-character-portrait" src={museoZeroPortrait(stage.characterBeat.name)!} alt="" />
                  ) : stage.characterBeat.name.slice(0, 1)}
                </div>
                <div>
                  <p><strong>{stage.characterBeat.name}</strong> · {stage.characterBeat.role}</p>
                  <blockquote>“{stage.characterBeat.line}”</blockquote>
                </div>
              </aside>
            ) : null}
          </div>

          {isMuseoZeroReview ? (
            <MuseoZeroRoomResponse world={activeWorld} sceneId={node.id} changed={worldChangedByChoice} />
          ) : null}

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
                  {isMuseoZeroReview && activeEvidence.kind === "PERSON" && museoZeroPortrait(activeEvidence.character ?? "") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="mz-evidence-portrait" src={museoZeroPortrait(activeEvidence.character ?? "")!} alt={activeEvidence.character ?? ""} />
                  ) : null}
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
                isMuseoZeroReview ? (
                  <MuseoZeroReviewWorkbench
                    mode={workbenchMode}
                    sceneId={node.id}
                    evidence={pinnedEvidence}
                    connections={evidenceConnections}
                    connectionOrigin={connectionOriginId}
                    transitions={transitions}
                    pendingKey={pendingTransition?.key ?? null}
                    onReorder={reorderEvidence}
                    onJoin={joinEvidence}
                    onChoose={selectTransition}
                  />
                ) : (
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
                )
              ) : null}
            </section>
          ) : null}

          <section className="experience-decision">
            <div>
              <p className="experience-panel__eyebrow">{node.primitive === "TRANSFER" ? "Decisione del team" : "La tua prossima mossa"}</p>
              <h2>{prompt}</h2>
            </div>

            {isChoice && !(isMuseoZeroReview && node.id === "MZ5_COMPARE_RECOVERY" && workbenchMode === "COMPARE") ? (
              <div className="experience-decisions" role="group" aria-label={prompt}>
                {transitions.map((transition) => (
                  <button
                    key={transition.key}
                    type="button"
                    aria-pressed={pendingTransition?.key === transition.key}
                    onClick={() => selectTransition(transition)}
                    disabled={!workbenchReady}
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
                  disabled={!workbenchReady || (isChoice ? !pendingTransition : !firstTransition)}
                >
                  {authoredSummary ? actionLabel : worldChangedByChoice ? "Continua dalla conseguenza" : "Continua"}
                </button>
              ) : null}

              {node.terminal && definition.mode === "PATHWAY" ? (
                <>
                  <a href="/percorsi">Esci</a>
                  <button type="button" onClick={restartExperience}>Ricomincia</button>
                </>
              ) : null}

              {node.terminal && definition.mode === "SMART" ? (
                <>
                  <button type="button" onClick={session.complete}>Completa</button>
                  <button type="button" onClick={restartExperience}>Ricomincia</button>
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

      {illustration && <figure className="experience-illustration">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={illustration.src} alt={illustration.alt} width={illustration.width} height={illustration.height}/>
        <figcaption>{illustration.role==="SETTING"?"Ambientazione di riferimento":illustration.role==="CHARACTER"?"Personaggio di riferimento":"Illustrazione della scena"}</figcaption>
      </figure>}

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
          {isEduTwin ? <div className="experience-story">{facts.flatMap((fact) => fact.split(/\n\n+/)).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div> : <>
            <h2>Quello che sappiamo</h2>
            <ul>{facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
          </>}
        </div>
      )}

      {!isChoice && !authoredSummary && <p className="experience-prompt">{prompt}</p>}

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
        {choiceFeedback || (isEduTwin ? "" : isChoice
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
            {actionLabel}
          </button>
        )}

        {node.terminal && definition.mode === "PATHWAY" && (
          <>
            <a href="/percorsi">Esci</a>
            <button type="button" onClick={restartExperience}>Nuovo percorso</button>
          </>
        )}

        {node.terminal && definition.mode === "SMART" && (
          <>
            <button type="button" onClick={session.complete}>Completa</button>
            <button type="button" onClick={restartExperience}>Ricomincia</button>
          </>
        )}
      </div>
    </section>
  );
}
