"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExperienceRuntime } from "./experience-runtime";
import { studioAtlasSnapshotToExperience, validateStudioAtlasPreviewSnapshot } from "../pathways/studio-atlas-preview-adapter";
import "./atlas-preview-host.css";

const ROOT = "#axf";
const routeFor = (id: string) => ROOT + "/" + encodeURIComponent(id);
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("it");

function resolvePreviews(snapshots: readonly unknown[]) {
  const entries = snapshots.flatMap(snapshot => {
    try {
      validateStudioAtlasPreviewSnapshot(snapshot);
      if (snapshot.runtimeAuthorized !== false || snapshot.studentAuthorized !== false) return [];
      const definition = studioAtlasSnapshotToExperience(snapshot);
      if (definition.runtime.statePolicy !== "VOLATILE_MEMORY") return [];
      return [{ id: definition.experienceId, title: snapshot.title, description: snapshot.description, definition }];
    } catch {
      return [];
    }
  });
  return entries.filter(entry => entries.filter(other => other.id === entry.id).length === 1);
}

/** Internal preview composition only. Never use preview snapshots as public catalog authority. */
export function AtlasPreviewHost({ snapshots }: { snapshots: readonly unknown[] }) {
  const entries = useMemo(() => resolvePreviews(snapshots), [snapshots]);
  const [route, setRoute] = useState(ROOT);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const active = entries.find(entry => routeFor(entry.id) === route);
  useEffect(() => {
    const sync = () => {
      const requested = window.location.hash;
      const valid = requested === ROOT || entries.some(entry => routeFor(entry.id) === requested);
      const next = valid ? requested : ROOT;
      if (!valid) window.history.replaceState(window.history.state, "", next);
      setRoute(next);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [entries]);
  useEffect(() => {
    if (!active) searchRef.current?.focus();
  }, [active]);
  const hits = entries.filter(entry => normalize(entry.title + " " + entry.description).includes(normalize(query.trim())));
  return (
    <div className="axfPreviewHost" data-axf-preview="internal">
      <header className="axfPreviewHost__header">
        <a href={ROOT}>Atlante</a>
        <span>Collaudo tecnico · non autorizzato agli studenti</span>
      </header>
      {active ? (
        <ExperienceRuntime key={active.id + "@" + active.definition.version} definition={active.definition} />
      ) : (
        <section aria-labelledby="axf-title" className="axfPreviewHost__library">
          <h1 id="axf-title">Esplora Atlas</h1>
          <p>Seleziona un’esperienza di prova.</p>
          <label htmlFor="axf-search">Cerca un’esperienza</label>
          <input id="axf-search" ref={searchRef} type="search" value={query} onChange={event => setQuery(event.target.value)} />
          <nav aria-label="Esperienze di prova" className="axfPreviewHost__orbit">
            {hits.map(entry => <a key={entry.id} href={routeFor(entry.id)}><span aria-hidden="true">◇</span>{entry.title}</a>)}
          </nav>
          <p role="status">{hits.length === 0 ? "Nessuna esperienza disponibile." : hits.length + " esperienze disponibili."}</p>
        </section>
      )}
    </div>
  );
}
