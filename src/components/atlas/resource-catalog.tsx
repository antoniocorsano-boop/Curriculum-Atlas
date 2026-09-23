"use client";

import Link from "next/link";
import { CheckCircle2, CircleAlert, FileText, Image, Link2, MonitorPlay, Presentation, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { atlasResources, publicDisciplines, publishedLessons } from "@/features/materials/fixtures";
import type { ResourceKind } from "@/features/curriculum/model";

const icons: Record<ResourceKind, React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>> = {
  Scheda: FileText,
  Presentazione: Presentation,
  Infografica: Image,
  Video,
  Link: Link2,
  Documento: MonitorPlay
};

const kinds: Array<"Tutte" | ResourceKind> = ["Tutte", "Scheda", "Presentazione", "Infografica", "Video", "Link", "Documento"];

export function ResourceCatalog() {
  const [disciplineId, setDisciplineId] = useState("tutte");
  const [kind, setKind] = useState<"Tutte" | ResourceKind>("Tutte");

  const publicationCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const lesson of publishedLessons) {
      for (const material of lesson.materials) {
        if (material.resourceId) counts.set(material.resourceId, (counts.get(material.resourceId) ?? 0) + 1);
      }
    }
    return counts;
  }, []);

  const resources = atlasResources.filter(resource =>
    (disciplineId === "tutte" || resource.disciplineId === disciplineId) &&
    (kind === "Tutte" || resource.kind === kind)
  );

  const disciplineLabel = (id: string) => publicDisciplines.find(item => item.id === id)?.label ?? id;

  return (
    <div className="atlas-resource-catalog">
      <section className="atlas-resource-toolbar" aria-label="Filtra il catalogo risorse">
        <label>
          <span>Disciplina</span>
          <select value={disciplineId} onChange={event => setDisciplineId(event.target.value)}>
            <option value="tutte">Tutte le discipline</option>
            {publicDisciplines.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span>Tipologia</span>
          <select value={kind} onChange={event => setKind(event.target.value as "Tutte" | ResourceKind)}>
            {kinds.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </section>

      <div className="atlas-domain-note" role="note">
        <strong>Una risorsa non è automaticamente un materiale di lezione.</strong>
        <span>Diventa materiale solo quando viene pubblicata nel contesto di una specifica lezione.</span>
        <Link href="/materiali">Vedi i materiali pubblicati</Link>
      </div>

      <div className="atlas-resource-grid" aria-live="polite">
        {resources.map(resource => {
          const Icon = icons[resource.kind];
          const uses = publicationCount.get(resource.id) ?? 0;
          return (
            <article key={resource.id} id={resource.id} className="atlas-resource-card">
              <header>
                <span className="atlas-resource-icon"><Icon size={20} aria-hidden={true} /></span>
                <div>
                  <span className="atlas-resource-kicker">{disciplineLabel(resource.disciplineId)} · {resource.kind}</span>
                  <h2>{resource.title}</h2>
                </div>
              </header>
              <p>{resource.summary}</p>
              <div className="atlas-resource-metadata">
                <span>{resource.schoolStages.join(" · ")}</span>
                <span>{resource.rightsLabel}</span>
                <span>Aggiornata: {resource.updatedLabel}</span>
              </div>
              <div className="atlas-resource-status-row">
                <span className={resource.editorialStatus === "Pubblicata" ? "is-ok" : ""}>
                  {resource.editorialStatus === "Pubblicata" ? <CheckCircle2 size={15} aria-hidden={true} /> : <CircleAlert size={15} aria-hidden={true} />}
                  Stato editoriale: {resource.editorialStatus}
                </span>
                <span className={resource.accessibilityStatus === "Verificata" ? "is-ok" : "is-warning"}>
                  {resource.accessibilityStatus === "Verificata"
                    ? <CheckCircle2 size={15} aria-hidden={true} />
                    : <CircleAlert size={15} aria-hidden={true} />}
                  Accessibilità {resource.accessibilityStatus.toLowerCase()}
                </span>
                <span>{uses === 0 ? "Non collegata a lezioni pubbliche" : uses === 1 ? "Collegata a 1 lezione pubblica" : "Collegata a " + uses + " lezioni pubbliche"}</span>
              </div>
              {resource.objectiveIds.length > 0 && (
                <footer>
                  <strong>Collegamenti curricolari</strong>
                  <div className="atlas-chip-row">
                    {resource.objectiveIds.map(id => <Link key={id} className="atlas-chip" href={"/obiettivi/" + id}>{id}</Link>)}
                  </div>
                </footer>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
