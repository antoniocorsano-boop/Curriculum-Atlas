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
  const context = band.context;

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
          {context?.kind === "ordinary" ? (
            <>
              <section>
                <h2>Contesto della fascia curricolare</h2>
                <p>Le informazioni seguenti riguardano {band.schoolStage} · {band.gradeLabel}, non sono associazioni specifiche convalidate per il singolo obiettivo.</p>
                {context.regime && <p>Quadro indicato da Arena: {context.regime}</p>}
                {context.sourceSection && <p>Sezione di fonte: {context.sourceSection}</p>}
                <h3>Progressione</h3>
                <p>{context.progression || "Non esplicitata nel pacchetto ricevuto."}</p>
              </section>
              {([
                ["Competenze della fascia", context.competences],
                ["Conoscenze della fascia", context.knowledge],
                ["Evidenze previste per la fascia", context.evidence],
                ["Raccordi della fascia", context.connections],
              ] as const).map(([label, values]) => (
                <section key={label}>
                  <h2>{label}</h2>
                  {values.length ? <ul>{values.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>Non esplicitate nel pacchetto ricevuto.</p>}
                </section>
              ))}
              <section>
                <h2>Riferimenti da approfondire</h2>
                <p>Il pacchetto non distingue abilità, prerequisiti, nuclei fondanti, Profilo dello studente e obiettivi generali come riferimenti autonomi per questo obiettivo. Atlas non li ricava automaticamente.</p>
              </section>
            </>
          ) : context?.kind === "axis" ? (
            <section>
              <h2>Quadro del percorso</h2>
              <p>Questa voce presenta un quadro trasversale o integrato, non un singolo OSA.</p>
              {context.sourceSection && <p>Sezione di fonte: {context.sourceSection}</p>}
            </section>
          ) : (
            <section>
              <h2>Contesto non disponibile</h2>
              <p>Non sono disponibili riferimenti di fascia verificabili.</p>
            </section>
          )}
        </article>
        <div className="atlas-curriculum-rail">
          <ProvenancePanel label={objective.sourceLabel} version={objective.sourceVersion} />
          <section className="atlas-panel">
            <h3>Collegamenti rapidi</h3>
            <div className="atlas-quick-list">
              <Link className="atlas-quick-link" href="/risorse"><span>Catalogo risorse</span><span>→</span></Link>
              <Link className="atlas-quick-link" href="/percorsi"><span>Catalogo percorsi</span><span>→</span></Link>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
