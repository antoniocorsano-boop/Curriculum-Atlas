"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { instituteCurriculumFixture } from "@/features/curriculum/fixtures";

const stages = ["Tutti", "Infanzia", "Primaria", "Secondaria di primo grado"] as const;

export function CurriculumTree() {
  const [stage, setStage] = useState<(typeof stages)[number]>("Tutti");
  const [disciplineId, setDisciplineId] = useState("tutte");

  const visibleDisciplines = useMemo(
    () => instituteCurriculumFixture.disciplines
      .filter(item => disciplineId === "tutte" || item.id === disciplineId)
      .map(item => ({
        ...item,
        bands: item.bands.filter(band => stage === "Tutti" || band.schoolStage === stage)
      }))
      .filter(item => item.bands.length > 0),
    [stage, disciplineId]
  );

  const departments = Array.from(new Set(visibleDisciplines.map(item => item.department)));

  return (
    <div className="atlas-curriculum-tree">
      <section className="atlas-curriculum-filters" aria-label="Filtra il curricolo">
        <label>
          <span>Ordine di scuola</span>
          <select value={stage} onChange={event => setStage(event.target.value as (typeof stages)[number])}>
            {stages.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Disciplina</span>
          <select value={disciplineId} onChange={event => setDisciplineId(event.target.value)}>
            <option value="tutte">Tutte le discipline</option>
            {instituteCurriculumFixture.disciplines.map(item => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
      </section>

      {departments.map(department => (
        <section key={department} className="atlas-department">
          <h2>{department}</h2>
          {visibleDisciplines
            .filter(item => item.department === department)
            .map(discipline => (
              <section key={discipline.id} className="atlas-discipline-block">
                <h3>{discipline.label}</h3>
                {discipline.bands.map(band => (
                  <details key={band.id} className="atlas-tree-year" open>
                    <summary className="atlas-tree-year-head">
                      <span>
                        <strong>{band.schoolStage} · {band.gradeLabel}</strong>
                        <small>{band.subtitle}</small>
                      </span>
                    </summary>
                    {band.topics.map(topic => (
                      <div key={topic.id} className="atlas-tree-topic">
                        <h4>{topic.title}</h4>
                        <div className="atlas-tree-objectives">
                          {topic.objectives.map(objective => (
                            <Link key={objective.id} href={"/obiettivi/"+objective.id} className="atlas-objective-row">
                              <span className="atlas-objective-code">{objective.code}</span>
                              <span>{objective.title}</span>
                              <ChevronRight size={16} aria-hidden="true" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </details>
                ))}
              </section>
            ))}
        </section>
      ))}
    </div>
  );
}
