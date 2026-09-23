import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { instituteCurriculumFixture } from "@/features/curriculum/fixtures";

export function CurriculumTree() {
  const departments = Array.from(new Set(instituteCurriculumFixture.disciplines.map(item => item.department)));

  return (
    <div className="atlas-curriculum-tree">
      {departments.map(department => (
        <section key={department} className="atlas-department">
          <h2>{department}</h2>
          {instituteCurriculumFixture.disciplines
            .filter(item => item.department === department)
            .map(discipline => (
              <section key={discipline.id} className="atlas-discipline-block">
                <h3>{discipline.label}</h3>
                {discipline.bands.map(band => (
                  <details key={band.id} className="atlas-tree-year" open={band.schoolStage === "Secondaria di primo grado"}>
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
