"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicPathwaySummary } from "@/features/pathways/load-public-pathways";
import { safePathwayHref } from "./gateway-policy";
import "./gateway.css";

const categories = ["Tutte", "Storie", "Laboratori", "Scoperte", "Percorsi"] as const;
type Category = typeof categories[number];

export function ExperienceLibrary({ pathways }: { pathways: PublicPathwaySummary[] }) {
  const [category, setCategory] = useState<Category>("Tutte");
  const [query, setQuery] = useState("");
  const authorized = pathways.filter(p => p.availability === "ACTIVE" && safePathwayHref(p.launchHref));
  const results = (category === "Tutte" || category === "Percorsi" ? authorized : [])
    .filter(p => p.title.toLocaleLowerCase("it").includes(query.trim().toLocaleLowerCase("it")));
  return (
    <div className="atlas-gateway-library">
      <Link href="/gateway">← Torna alla sala Atlas</Link>
      <header className="atlas-page-heading">
        <div><span className="atlas-eyebrow">Atlas · Biblioteca della conoscenza</span>
          <h1>Esplora, scopri, comprendi.</h1>
          <p>Scegli un’esperienza oppure cercala per titolo.</p>
        </div>
      </header>
      <label className="atlas-gateway-search">Cerca nelle esperienze
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Titolo dell’esperienza" />
      </label>
      <nav className="atlas-gateway-filters" aria-label="Tipologia di esperienza">
        {categories.map(item => <button key={item} type="button" aria-pressed={category === item}
          onClick={() => setCategory(item)}>{item}</button>)}
      </nav>
      <section aria-live="polite" aria-label="Risultati della ricerca">
        {results.length === 0 ? <p className="atlas-panel">{query.trim()
          ? "Nessuna esperienza autorizzata corrisponde alla ricerca."
          : "Non ci sono ancora esperienze autorizzate in questa sezione."}</p> :
          <div className="atlas-gateway-results">{results.map(p => (
            <article className="atlas-panel" key={p.pathwayId}>
              <span className="atlas-eyebrow">Percorso</span>
              <h2>{p.title}</h2>
              <p>Versione {p.version}</p>
              {safePathwayHref(p.launchHref) && <Link className="atlas-gateway-action" href={p.launchHref}>Apri esperienza →</Link>}
            </article>
          ))}</div>}
      </section>
      <section className="atlas-panel">
        <h2>Altri accessi Atlas</h2>
        <p>I cataloghi esistenti restano distinti dalla biblioteca delle esperienze qualificate.</p>
        <nav className="atlas-gateway-filters" aria-label="Cataloghi esistenti">
          <Link href="/materiali">Materiali di lezione</Link>
          <Link href="/risorse">Risorse Atlas</Link>
          <Link href="/percorsi">Catalogo Percorsi</Link>
        </nav>
      </section>
    </div>
  );
}
