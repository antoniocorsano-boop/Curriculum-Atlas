"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ExperienceRuntime } from "./experience-runtime";
import { studioAtlasSnapshotToExperience, validateStudioAtlasPreviewSnapshot } from "../pathways/studio-atlas-preview-adapter";
import "./atlas-preview-host.css";

const ROOT = "#axf";
const routeFor = (id: string) => ROOT + "/" + encodeURIComponent(id);
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("it");

const WORLDS = [
  ["energia", "Energia"], ["storia", "Storia e società"], ["ambiente", "Ambiente e territori"],
  ["scienze", "Scienze"], ["tecnologia", "Tecnologia"], ["lettura", "Lettura e idee"],
  ["arte", "Arte e creatività"], ["agricoltura", "Agricoltura e cibo"], ["materiali", "Materiali"],
] as const;
type WorldId = typeof WORLDS[number][0];
const SECTIONS = ["Storie", "Laboratori", "Scoperte", "Percorsi"] as const;
type Section = typeof SECTIONS[number];
export type AtlasPreviewArtwork = { landscape?: string; portrait?: string; worlds?: Partial<Record<WorldId, string>> };
export type AtlasPreviewPlacement = { world: WorldId; section: Section };
/** A trusted, compiled private preview registration. Never a public catalogue or content-supplied URL. */
export type AtlasStandalonePreview = Readonly<{
  id: string;
  title: string;
  description: string;
  version: string;
  sha256: string;
  world: WorldId;
  section: "Scoperte";
  availability: "ACTIVE";
  runtimeAuthorized: false;
  studentAuthorized: false;
  render: () => ReactNode;
}>;
function validStandalone(value: AtlasStandalonePreview): boolean {
  return !!value && Object.keys(value).sort().join(",") === "availability,description,id,render,runtimeAuthorized,section,sha256,studentAuthorized,title,version,world" &&
    typeof value.id === "string" && /^standalone-preview-[a-z0-9-]{3,80}$/.test(value.id) &&
    typeof value.title === "string" && value.title.trim().length > 0 && value.title.length <= 150 &&
    typeof value.description === "string" && value.description.trim().length > 0 && value.description.length <= 500 &&
    typeof value.version === "string" && /^[0-9]+\.[0-9]+\.[0-9]+(?:-[a-z0-9.-]+)?$/.test(value.version) &&
    typeof value.sha256 === "string" && /^[a-f0-9]{64}$/.test(value.sha256) &&
    WORLDS.some(([id]) => id === value.world) && value.section === "Scoperte" &&
    value.availability === "ACTIVE" && value.runtimeAuthorized === false && value.studentAuthorized === false &&
    typeof value.render === "function";
}
const noStandalone: readonly AtlasStandalonePreview[] = Object.freeze([]);
const noPlacements: Readonly<Record<string, AtlasPreviewPlacement>> = Object.freeze({});
// Only inline WebP artwork supplied by a trusted private preview host, never remote URLs, HTML, or SVG.
function artworkUrl(value: unknown): string | undefined {
  return typeof value === "string" && value.length <= 800000 && /^data:image\/webp;base64,UklGR[A-Za-z0-9+/]+={0,2}$/.test(value)
    ? 'url("' + value + '")' : undefined;
}
function resolvePreviews(snapshots: readonly unknown[]) {
  const entries = snapshots.flatMap(snapshot => {
    try {
      validateStudioAtlasPreviewSnapshot(snapshot);
      if (snapshot.runtimeAuthorized !== false || snapshot.studentAuthorized !== false) return [];
      const definition = studioAtlasSnapshotToExperience(snapshot);
      if (definition.runtime.statePolicy !== "VOLATILE_MEMORY") return [];
      return [{ kind: "engine" as const, id: definition.experienceId, title: snapshot.title, description: snapshot.description, definition }];
    } catch {
      return [];
    }
  });
  return entries.filter(entry => entries.filter(other => other.id === entry.id).length === 1);
}

/** Internal preview composition only. Placement and artwork have no publication authority. */
export function AtlasPreviewHost({ snapshots, artwork, placements = noPlacements, standalone = noStandalone }: {
  snapshots: readonly unknown[];
  artwork?: AtlasPreviewArtwork;
  placements?: Readonly<Record<string, AtlasPreviewPlacement>>;
  standalone?: readonly AtlasStandalonePreview[];
}) {
  const entries = useMemo(() => {
    const combined = [...resolvePreviews(snapshots), ...standalone.filter(validStandalone).map(resource => ({ kind: "standalone" as const, id: resource.id, title: resource.title, description: resource.description, resource }))];
    return combined.filter(entry => combined.filter(other => other.id === entry.id).length === 1);
  }, [snapshots, standalone]);
  const [route, setRoute] = useState(ROOT);
  const [query, setQuery] = useState("");
  const [world, setWorld] = useState<WorldId | "">("");
  const [section, setSection] = useState<Section | "">("");
  const [browsing, setBrowsing] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const wasBrowsing = useRef(false);
  const wasActive = useRef(false);
  const lastStandalone = useRef<string | null>(null);
  const returnRef = useRef<HTMLAnchorElement>(null);
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
    if (active?.kind === "standalone") {
      lastStandalone.current = active.id;
      returnRef.current?.focus({ preventScroll: true });
    }
    if (!active && wasActive.current) {
      setBrowsing(true);
      if (!lastStandalone.current) searchRef.current?.focus({ preventScroll: true });
    }
    wasActive.current = !!active;
  }, [active]);
  useEffect(() => {
    if (!active && browsing && lastStandalone.current) {
      const result = document.getElementById("axf-result-" + lastStandalone.current);
      (result ?? searchRef.current)?.focus({ preventScroll: true });
      lastStandalone.current = null;
    } else if (!active && browsing && !wasBrowsing.current) searchRef.current?.focus({ preventScroll: true });
    if (!active && !browsing && wasBrowsing.current) titleRef.current?.focus({ preventScroll: true });
    wasBrowsing.current = browsing;
  }, [active, browsing]);
  const hits = entries.filter(entry => {
    const placement = entry.kind === "standalone" ? entry.resource : placements[entry.id];
    return (!world || placement?.world === world) && (!section || placement?.section === section) &&
      normalize(entry.title + " " + entry.description).includes(normalize(query.trim()));
  });
  const filtered = !!(query.trim() || world || section);
  const selectedWorld = WORLDS.find(([id]) => id === world)?.[1];
  const landscape = artworkUrl(artwork?.landscape);
  const portrait = artworkUrl(artwork?.portrait);
  const artStyle = { "--axf-landscape": landscape, "--axf-portrait": portrait ?? landscape } as CSSProperties;
  const results = (
    <section className="axfPreviewHost__results" aria-label="Risultati della ricerca">
      <p role="status">{hits.length === 0 ? "Nessuna esperienza disponibile." : hits.length === 1 ? "1 esperienza disponibile." : hits.length + " esperienze disponibili."}</p>
      <nav aria-label="Esperienze di prova">
        {hits.map(entry => <a key={entry.id} id={"axf-result-" + entry.id} href={routeFor(entry.id)}><strong>{entry.title}</strong><small>{entry.description}</small></a>)}
      </nav>
    </section>
  );
  return (
    <div className="axfPreviewHost" data-axf-preview="internal" data-surface={active?.kind === "standalone" ? "standalone" : undefined}>
      {active && <header className="axfPreviewHost__header" data-compact={active.kind === "standalone" ? "true" : undefined}>
        <a href={ROOT} ref={returnRef}>{active.kind === "standalone" && <span aria-hidden="true">‹ </span>}Atlante</a>
        {active.kind === "standalone" ? <div className="axfPreviewHost__context"><span>{WORLDS.find(([id]) => id === active.resource.world)?.[1]} · {active.resource.section}</span><small title="Collaudo tecnico · non autorizzato agli studenti">Anteprima privata</small></div> : <span>Collaudo tecnico · non autorizzato agli studenti</span>}
      </header>}
      {active ? (
        active.kind === "engine" ? <ExperienceRuntime key={active.id + "@" + active.definition.version} definition={active.definition} /> : <section className="axfPreviewHost__standalone" aria-label={active.title} key={active.id + "@" + active.resource.version}>{active.resource.render()}</section>
      ) : (
        <section aria-labelledby="axf-title" className="axfPreviewHost__library" data-browsing={browsing} style={artStyle}>
          <div className="axfPreviewHost__title">
            <h1 id="axf-title" ref={titleRef} tabIndex={-1} aria-label="Esplora Atlas">Atlas</h1>
            <p>La conoscenza come esperienza</p>
          </div>
          {!browsing && <nav aria-label="Mondi della conoscenza" className="axfPreviewHost__orbit">
            {WORLDS.map(([id, title]) => <button className="axfPreviewHost__world" type="button" key={id} data-world={id} aria-pressed={world === id} onClick={() => { setWorld(id); setQuery(""); setSection(""); setBrowsing(true); }}>
              <span aria-hidden="true" className="axfPreviewHost__sphere" style={{ backgroundImage: artworkUrl(artwork?.worlds?.[id]) }} />
              <span className="axfPreviewHost__worldLabel">{title}</span>
            </button>)}
          </nav>}
          <div className="axfPreviewHost__search">
            <label htmlFor="axf-search" className="axfPreviewHost__searchLabel">Cerca un’esperienza</label>
            <input id="axf-search" ref={searchRef} type="search" placeholder="Cerca un’esperienza" value={query} onFocus={() => setBrowsing(true)} onChange={event => { setQuery(event.target.value); setBrowsing(true); }} />
            {!browsing ? <p className="axfPreviewHost__hint">Esplora i mondi · oppure cerca direttamente</p> : <>
              <div className="axfPreviewHost__browseActions">
                <button type="button" onClick={() => setBrowsing(false)}>Esplora i mondi</button>
                {selectedWorld && <button type="button" onClick={() => setWorld("")}>{selectedWorld} · rimuovi filtro</button>}
                {filtered && <button type="button" onClick={() => { setQuery(""); setWorld(""); setSection(""); }}>Azzera filtri</button>}
              </div>
              <div className="axfPreviewHost__sections" aria-label="Tipi di esperienza">
                {SECTIONS.map(item => <button type="button" key={item} aria-pressed={section === item} onClick={() => setSection(section === item ? "" : item)}>{item}</button>)}
              </div>
            </>}
          </div>
          {browsing && results}
          <p className="axfPreviewHost__notice">Anteprima privata · non autorizzata agli studenti</p>
        </section>
      )}
    </div>
  );
}
