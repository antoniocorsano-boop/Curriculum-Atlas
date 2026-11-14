import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { AppShell } from "@/components/atlas/app-shell";
import { publishedLessons } from "@/features/materials/fixtures";
import storiesCover from "../../public/biblioteca/copertine/storie.webp";
import labsCover from "../../public/biblioteca/copertine/laboratori.webp";
import discoveriesCover from "../../public/biblioteca/copertine/scoperte.webp";
import pathwaysCover from "../../public/biblioteca/copertine/percorsi.webp";
import "./biblioteca.css";

const shelves = [
  { id: "storie", title: "Storie", caption: "Racconti e mondi narrativi", cover: storiesCover },
  { id: "laboratori", title: "Laboratori", caption: "Esperienze e simulazioni", cover: labsCover },
  { id: "scoperte", title: "Scoperte", caption: "Conoscenze e approfondimenti", cover: discoveriesCover },
  { id: "percorsi", title: "Percorsi", caption: "Competenze e crescita", cover: pathwaysCover },
] as const;

const discoveries = [
  { lessonId: "1c-tec-03", materialId: "1c-20260923-infografica" },
  { lessonId: "2c-tec-02", materialId: "m4" },
  { lessonId: "3e-tec-02", materialId: "3e-20260923-infografica" },
];
const labs = [
  { lessonId: "1c-tec-03", materialId: "1c-20260923-scheda" },
  { lessonId: "3e-tec-02", materialId: "3e-20260923-scheda" },
];

function PublishedSelection({ items }: { items: ReadonlyArray<{ lessonId: string; materialId: string }> }) {
  const available = items.flatMap(item => {
    const lesson = publishedLessons.find(entry => entry.id === item.lessonId);
    const material = lesson?.materials.find(entry => entry.id === item.materialId);
    if (!material?.url || !material.url.startsWith("/materials/")) return [];
    return [{ ...item, title: material.title, href: material.url, kind: material.kind }];
  });
  if (available.length === 0) return <p>Nessun materiale disponibile in questa selezione.</p>;
  return <div className="library-works">
    {available.map(item => (
      <Link href={item.href} key={item.materialId} className="library-work" target="_blank" rel="noreferrer">
        <span><small>Tecnologia · {item.kind}</small><strong>{item.title}</strong></span>
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    ))}
  </div>;
}

export default function HomePage() {
  return (
    <AppShell>
      <div className="atlas-library">
        <header className="library-intro">
          <div>
            <span className="library-kicker">Biblioteca educativa</span>
            <h1>ATLAS</h1>
            <p className="library-motto">Esplora · Scopri · Comprendi · Sperimenta</p>
            <p>Entra in una storia, osserva un fenomeno, prova una nuova idea. Scegli da dove cominciare.</p>
          </div>
          <Link href="/esplora" className="library-start"><Compass size={22} aria-hidden="true" /> Esplora la mappa <ArrowRight size={18} aria-hidden="true" /></Link>
        </header>

        <nav className="library-doors" aria-label="Sezioni della biblioteca">
          {shelves.map(({ id, title, caption, cover }) => (
            <Link key={id} href={"#" + id} className="library-door">
              <Image src={cover} alt="" unoptimized sizes="(max-width: 720px) 48vw, 25vw" />
              <div><h2>{title}</h2><p>{caption}</p><ArrowRight size={18} aria-hidden="true" /></div>
            </Link>
          ))}
        </nav>

        <section id="storie" className="library-section" aria-labelledby="library-storie">
          <h2 id="library-storie">Storie</h2>
          <p>La raccolta è in preparazione. Qui troverai i racconti quando saranno pronti per la lettura.</p>
        </section>
        <section id="laboratori" className="library-section" aria-labelledby="library-laboratori">
          <div className="library-section-heading"><div><span className="atlas-eyebrow">Sperimenta</span><h2 id="library-laboratori">Laboratori</h2></div><Link href="/materiali">Materiali delle lezioni <ArrowRight size={16} aria-hidden="true" /></Link></div>
          <p>Attività su carta già disponibili per provare e spiegare le proprie idee.</p>
          <PublishedSelection items={labs} />
        </section>
        <section id="scoperte" className="library-section" aria-labelledby="library-scoperte">
          <div className="library-section-heading"><div><span className="atlas-eyebrow">Comprendi</span><h2 id="library-scoperte">Scoperte</h2></div><Link href="/materiali">Materiali delle lezioni <ArrowRight size={16} aria-hidden="true" /></Link></div>
          <p>Infografiche per osservare come funzionano le cose.</p>
          <PublishedSelection items={discoveries} />
        </section>
        <section id="percorsi" className="library-section" aria-labelledby="library-percorsi">
          <div className="library-section-heading"><div><span className="atlas-eyebrow">Cresci</span><h2 id="library-percorsi">Percorsi</h2></div><Link href="/percorsi">Catalogo dei percorsi <ArrowRight size={16} aria-hidden="true" /></Link></div>
          <p>Esplora le esperienze disponibili per imparare, scegliere, collaborare e affrontare problemi.</p>
        </section>

        <footer className="library-institution">
          <div><strong>Il curricolo, connesso.</strong><p>Arena è la fonte curricolare; Atlas organizza la consultazione e collega i materiali disponibili.</p></div>
          <Link href="/curricolo">Curricolo di istituto</Link>
          <Link href="/risorse">Catalogo delle risorse</Link>
        </footer>
      </div>
    </AppShell>
  );
}
