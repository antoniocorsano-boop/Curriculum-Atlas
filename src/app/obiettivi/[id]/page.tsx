import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/atlas/app-shell";
import { ProvenancePanel } from "@/components/atlas/provenance-panel";
import { findObjective, curricoloIstitutoFixture, legacyObjectiveMatches, legacyObjectiveRouteIds } from "@/features/curriculum/fixtures";

export function generateStaticParams() {
  const current = curricoloIstitutoFixture.disciplines.flatMap(discipline =>
    discipline.bands.flatMap(band =>
      band.topics.flatMap(topic =>
        topic.objectives.map(objective => ({ id: objective.id }))
      )
    )
  );
  return [...current, ...legacyObjectiveRouteIds().map(id => ({ id }))];
}

export default async function ObjectivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = findObjective(id);
  if (!found) {
    const candidates = legacyObjectiveMatches(id);
    if (!candidates.length) notFound();
    return (
      <AppShell>
        <header className="atlas-page-heading">
          <div>
            <h1>Riferimento curricolare precedente</h1>
            <p>Il collegamento usa un identificativo storico. Seleziona la voce pertinente nella versione corrente; non è garantita una corrispondenza con il contenuto storico.</p>
          </div>
        </header>
        <section className="atlas-panel">
          <h2>Possibili corrispondenze</h2>
          <ul>
            {candidates.map(({ discipline, band, objective }) => (
              <li key={objective.id}>
                <Link href={`/obiettivi/${objective.id}`}>
                  {discipline.label} · {band.schoolStage} · {band.gradeLabel} · {objective.title}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/curricolo">Consulta il curricolo completo</Link>
        </section>
      </AppShell>
    );
  }

  const { discipline, band, topic, objective } = found;

  return (
    <AppShell>
      <nav className="atlas-breadcrumbs" aria-label="Percorso">
        <Link href="/curricolo">Curricolo</Link>
        <span>›</span>
        <span>{discipline.label}</span><span>›</span><span>{band.schoolStage} · {band.gradeLabel}</span>
        <span>›</span>
        <span>{topic.title}</span>
      </nav>

      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">{objective.code} · {discipline.label} · {band.gradeLabel}</span>
          <h1>{objective.title}</h1>
          <p>{objective.description}</p>
        </div>
      </header>

      <div className="atlas-objective-layout">
        <article className="atlas-panel atlas-objective-content">
          <section>
            <h2>Conoscenze essenziali</h2>
            <ul>{objective.knowledge.map(item => <li key={item}>{item}</li>)}</ul>
          </section>
          <section>
            <h2>Abilità</h2>
            <ul>{objective.skills.map(item => <li key={item}>{item}</li>)}</ul>
          </section>
          <section>
            <h2>Prerequisiti</h2>
            <div className="atlas-chip-row">{objective.prerequisites.map(item => <span key={item} className="atlas-chip">{item}</span>)}</div>
          </section>
          <section>
            <h2>Raccordi</h2>
            <div className="atlas-chip-row">{objective.connections.map(item => <span key={item} className="atlas-chip">{item}</span>)}</div>
          </section>
        </article>
        <div className="atlas-curriculum-rail">
          <ProvenancePanel label={objective.sourceLabel} version={objective.sourceVersion} />
          <section className="atlas-panel">
            <h3>Collegamenti rapidi</h3>
            <div className="atlas-quick-list">
              <Link className="atlas-quick-link" href="/risorse"><span>Risorse collegate</span><span>→</span></Link>
              <Link className="atlas-quick-link" href="/percorsi"><span>Percorsi correlati</span><span>→</span></Link>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
