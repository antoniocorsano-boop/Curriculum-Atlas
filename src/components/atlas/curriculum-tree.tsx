import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { curriculumFixture } from "@/features/curriculum/fixtures";

export function CurriculumTree() {
  return (
    <div className="atlas-curriculum-tree">
      {curriculumFixture.map(year => (
        <section key={year.id} className="atlas-tree-year">
          <div className="atlas-tree-year-head">
            <strong>{year.label}</strong>
            <span>{year.subtitle}</span>
          </div>
          {year.topics.map(topic => (
            <div key={topic.id} className="atlas-tree-topic">
              <h3>{topic.title}</h3>
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
        </section>
      ))}
    </div>
  );
}
