"use client";
import { useState, useCallback, useEffect, useRef, type ComponentType } from "react";

export interface SpecializedRendererProps {
  onEvidence: (evidence: unknown) => void;
}
export interface SpecializedRendererBinding {
  rendererId: string;
  version: 1;
  Component: ComponentType<SpecializedRendererProps>;
  verifyEvidence: (evidence: unknown) => boolean;
}

/** The trusted host, not authored content or the renderer, decides if evidence permits navigation. */
export function SpecializedNode({ binding, title, prompt, onProceed }: {
  binding: SpecializedRendererBinding;
  title: string;
  prompt: string;
  onProceed: (evidence: unknown) => void;
}) {
  const [evidence, setEvidence] = useState<unknown>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  const acceptEvidence = useCallback((value: unknown) => setEvidence(() => value), []);
  function valid(value: unknown) {
    try { return binding.verifyEvidence(value) === true; } catch { return false; }
  }
  const ready = valid(evidence);
  const Renderer = binding.Component;
  return <section className="experience-runtime" aria-label={title}>
    <h1 ref={headingRef} tabIndex={-1}>{title}</h1><p>{prompt}</p>
    <Renderer onEvidence={acceptEvidence} />
    <p role="status">{ready ? "Evidenze raccolte: puoi continuare." : "Completa le prove prima di continuare."}</p>
    <button type="button" disabled={!ready} onClick={() => { if (valid(evidence)) onProceed(evidence); }}>Continua</button>
  </section>;
}
