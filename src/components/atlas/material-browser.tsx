"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText, Image, Link2, MonitorPlay, Presentation, Video } from "lucide-react";
import { atlasResources, publicClasses, publicDisciplines, publishedLessons } from "@/features/materials/fixtures";
import type { PublishedMaterial } from "@/features/curriculum/model";

const icons: Record<PublishedMaterial["kind"], React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>> = {
  Scheda: FileText,
  Presentazione: Presentation,
  Infografica: Image,
  Video,
  Link: Link2,
  Documento: MonitorPlay
};

export function MaterialBrowser() {
  const [classId, setClassId] = useState("2c");
  const [disciplineId, setDisciplineId] = useState("tecnologia");

  const lessons = useMemo(
    () => publishedLessons
      .filter(item => item.classId === classId && item.disciplineId === disciplineId)
      .sort((a, b) => a.lessonNumber - b.lessonNumber),
    [classId, disciplineId]
  );

  const resourceById = useMemo(
    () => new Map(atlasResources.map(resource => [resource.id, resource])),
    []
  );

  return (
    <div className="atlas-material-browser">
      <section className="atlas-context-picker" aria-label="Seleziona classe e disciplina">
        <label>
          <span>Classe</span>
          <select value={classId} onChange={event => setClassId(event.target.value)}>
            <optgroup label="Primaria">
              {publicClasses.filter(item => item.schoolStage === "Primaria").map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </optgroup>
            <optgroup label="Secondaria di primo grado">
              {publicClasses.filter(item => item.schoolStage === "Secondaria di primo grado").map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </optgroup>
          </select>
        </label>
        <label>
          <span>Disciplina</span>
          <select value={disciplineId} onChange={event => setDisciplineId(event.target.value)}>
            {publicDisciplines.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      </section>

      <div className="atlas-domain-note" role="note">
        <strong>Qui trovi solo ciò che è stato pubblicato per una lezione.</strong>
        <span>Il catalogo generale delle risorse riusabili è separato in Risorse Atlas.</span>
        <Link href="/risorse">Apri Risorse Atlas</Link>
      </div>

      {lessons.length ? (
        <div className="atlas-lesson-list">
          {lessons.map(lesson => (
            <article key={lesson.id} className="atlas-lesson-card">
              <header>
                <span className="atlas-lesson-number">{lesson.dateLabel ?? ("Lezione " + lesson.lessonNumber)}</span>
                <h2>{lesson.title}</h2>
              </header>
              <div className="atlas-material-list">
                {lesson.materials.map(material => {
                  const Icon = icons[material.kind];
                  const resource = material.resourceId ? resourceById.get(material.resourceId) : undefined;
                  return (
                    <div key={material.id} className="atlas-material-item">
                      <span className="atlas-material-icon"><Icon size={18} aria-hidden={true} /></span>
                      <span>
                        <strong>{material.title}</strong>
                        <small>{material.kind} · Pubblicato per questa lezione</small>
                        {material.url ? (
                          <Link className="atlas-material-origin" href={material.url} target="_blank" rel="noreferrer">
                            Apri materiale
                          </Link>
                        ) : null}
                        {resource ? (
                          <Link className="atlas-material-origin" href={"/risorse#" + resource.id}>
                            Deriva dalla risorsa Atlas “{resource.title}”
                          </Link>
                        ) : (
                          <small className="atlas-material-origin-neutral">Materiale pubblicato direttamente per la lezione</small>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="atlas-panel atlas-empty-state">
          <h2>Nessun materiale pubblicato</h2>
          <p>Per questa combinazione di classe e disciplina non risultano ancora materiali disponibili.</p>
        </section>
      )}
    </div>
  );
}
