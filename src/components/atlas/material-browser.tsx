"use client";

import { useMemo, useState } from "react";
import { FileText, Image, Link2, MonitorPlay, Presentation, Video } from "lucide-react";
import { publicClasses, publicDisciplines, publishedLessons } from "@/features/materials/fixtures";
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

  return (
    <div className="atlas-material-browser">
      <section className="atlas-context-picker" aria-label="Seleziona classe e disciplina">
        <label>
          <span>Classe</span>
          <select value={classId} onChange={event => setClassId(event.target.value)}>
            {publicClasses.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span>Disciplina</span>
          <select value={disciplineId} onChange={event => setDisciplineId(event.target.value)}>
            {publicDisciplines.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      </section>

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
                  return (
                    <div key={material.id} className="atlas-material-item">
                      <span className="atlas-material-icon"><Icon size={18} aria-hidden={true} /></span>
                      <span>
                        <strong>{material.title}</strong>
                        <small>{material.kind}</small>
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
