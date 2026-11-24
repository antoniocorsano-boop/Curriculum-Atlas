"use client";

import { useState } from "react";
import Link from "next/link";
import { libraryForms, type EducationalLibraryItem } from "./educational-library";
import "./educational-library.css";

function fold(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("it"); }

export function EducationalLibrary({ items, reviewOnly = false }: { items: EducationalLibraryItem[]; reviewOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [audience, setAudience] = useState("");
  const disciplines = [...new Set(items.map(item => item.discipline))].sort();
  const audiences = [...new Set(items.map(item => item.audience))].sort();
  const results = items.filter(item => (!form || item.form === form) && (!discipline || item.discipline === discipline) &&
    (!audience || item.audience === audience) && fold([item.title,item.summary,item.discipline,item.audience,...item.sections.map(s=>s.text)].join(" ")).includes(fold(query.trim())));
  return (
    <section className="educational-library" aria-labelledby="educational-library-title" data-testid="atlas-educational-library" data-review-only={reviewOnly ? "true" : "false"}>
      <header>
        <p className="educational-library__eyebrow">Atlas · Biblioteca educativa</p>
        <h2 id="educational-library-title">Scegli cosa vuoi vivere e approfondire.</h2>
        <p>Storie, laboratori, scoperte e percorsi accompagnati dal loro progetto educativo: finalità, destinatari, competenze e modalità di utilizzo.</p>
        {reviewOnly && <p role="note">Solo revisione professionale. Le schede candidate non sono pubblicate per gli studenti.</p>}
      </header>
      {items.length === 0 ? (
        <div data-testid="educational-library-empty">
          <h3>Nessun prodotto documentato è ancora autorizzato.</h3>
          <p>La biblioteca mostrerà solo edizioni pubblicate, con documentazione educativa verificata. Nel frattempo puoi consultare <Link href="/curricolo/">il curricolo</Link>, <Link href="/materiali/">i materiali</Link> e <Link href="/percorsi/">i percorsi</Link>.</p>
        </div>
      ) : <>
        <div className="educational-library__filters">
          <label>Cerca un prodotto<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Titolo, tema, competenza…" /></label>
          <label>Tipologia<select value={form} onChange={e=>setForm(e.target.value)}><option value="">Tutte</option>{libraryForms.map(value=><option key={value}>{value}</option>)}</select></label>
          <label>Disciplina<select value={discipline} onChange={e=>setDiscipline(e.target.value)}><option value="">Tutte</option>{disciplines.map(value=><option key={value}>{value}</option>)}</select></label>
          <label>Destinatari<select value={audience} onChange={e=>setAudience(e.target.value)}><option value="">Tutti</option>{audiences.map(value=><option key={value}>{value}</option>)}</select></label>
        </div>
        <p role="status">{results.length} {results.length === 1 ? "prodotto" : "prodotti"}</p>
        {results.length === 0 && <p>Nessun risultato. Modifica i filtri.</p>}
        <div className="educational-library__grid">{results.map(item => (
          <article key={item.id} className="educational-library__card" data-testid="educational-library-card">
            <p className="educational-library__eyebrow">{item.form} · {item.discipline}</p>
            <h3>{item.title}</h3><p>{item.audience}</p><p>{item.summary}</p>
            <details><summary>Il progetto educativo</summary><dl>{item.sections.map(section=><div key={section.title}><dt>{section.title}</dt><dd>{section.text}</dd></div>)}</dl></details>
            <p className="educational-library__edition">Edizione {item.version} · Documento {item.documentVersion}</p>
            <Link href={item.href}>{reviewOnly ? "Apri l’anteprima professionale" : "Entra nell’esperienza"}</Link>
          </article>
        ))}</div>
      </>}
    </section>
  );
}
