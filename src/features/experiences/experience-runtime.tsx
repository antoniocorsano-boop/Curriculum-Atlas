"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ExperienceDefinition, ExperiencePresentation, ExperienceTransition } from "./model";
import { useExperienceSession } from "./use-experience-session";
import "./experience-runtime.css";

type ResolvedTransition = ExperienceTransition & { key: string };

export function ExperienceRuntime({
  definition,
  presentation,
  onNodeVisit,
}: {
  definition: ExperienceDefinition;
  presentation?: ExperiencePresentation;
  onNodeVisit?: (nodeId: string) => void;
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
    if (session.ready) {
      headingRef.current?.focus();
      onNodeVisit?.(session.currentNodeId);
    }
  }, [session.currentNodeId, session.ready, presentation?.id, onNodeVisit]);

  if (!session.ready || !node) return <p>Preparazione esperienza…</p>;

  const title = view?.title ?? node.title ?? (node.primitive === "TRANSFER" ? "Trasferisci" : node.id);
  const prompt = view?.prompt ?? node.prompt ?? "Osserva, ragiona e procedi.";
  const facts = view?.facts ?? node.facts ?? [];
  const isChoice = node.interaction === "choice";
  const isText = node.interaction === "text";
  const firstTransition = transitions[0];

  function selectTransition(transition: ResolvedTransition) {
    setPendingTransition(transition);
    setChoiceFeedback(
      transition.feedback ?? node!.feedbackCategory.replaceAll("_", " ").toLowerCase(),
    );
  }

  function proceed() {
    const transition = isChoice ? pendingTransition : firstTransition;
    if (transition) session.choose(transition.targetNodeId);
  }

  return (
    <section
      className="experience-runtime"
      aria-labelledby="experience-heading"
      data-session={session.sessionVersion}
    >
      <p className="experience-kicker">{definition.mode === "SMART" ? "Attività smart" : "Percorso"}</p>
      <h1 id="experience-heading" ref={headingRef} tabIndex={-1}>{title}</h1>

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
