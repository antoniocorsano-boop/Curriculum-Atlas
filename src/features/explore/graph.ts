import { instituteCurriculumFixture } from "@/features/curriculum/fixtures";

export type ExploreNodeKind = "institution" | "discipline" | "stage" | "objective" | "connection";

export type ExploreNode = {
  id: string;
  label: string;
  kind: ExploreNodeKind;
  subtitle?: string;
  disciplineId?: string;
  stage?: string;
  objectiveId?: string;
};

export type ExploreEdge = {
  id: string;
  source: string;
  target: string;
  relation: "contains" | "progresses" | "connects";
};

export type ExploreGraph = {
  nodes: ExploreNode[];
  edges: ExploreEdge[];
};

export function buildExploreGraph(): ExploreGraph {
  const nodes: ExploreNode[] = [
    {
      id: "institute",
      label: instituteCurriculumFixture.instituteName,
      kind: "institution",
      subtitle: "Curricolo verticale di istituto"
    }
  ];
  const edges: ExploreEdge[] = [];
  const relationNodes = new Map<string, string>();

  for (const discipline of instituteCurriculumFixture.disciplines) {
    const disciplineNodeId = "discipline:" + discipline.id;
    nodes.push({
      id: disciplineNodeId,
      label: discipline.label,
      kind: "discipline",
      subtitle: discipline.department,
      disciplineId: discipline.id
    });
    edges.push({
      id: "edge:institute:" + discipline.id,
      source: "institute",
      target: disciplineNodeId,
      relation: "contains"
    });

    let previousBandNodeId: string | null = null;

    for (const band of discipline.bands) {
      const bandNodeId = "band:" + band.id;
      nodes.push({
        id: bandNodeId,
        label: band.gradeLabel,
        kind: "stage",
        subtitle: band.schoolStage,
        disciplineId: discipline.id,
        stage: band.schoolStage
      });
      edges.push({
        id: "edge:" + discipline.id + ":" + band.id,
        source: disciplineNodeId,
        target: bandNodeId,
        relation: "contains"
      });

      if (previousBandNodeId) {
        edges.push({
          id: "edge:progress:" + previousBandNodeId + ":" + bandNodeId,
          source: previousBandNodeId,
          target: bandNodeId,
          relation: "progresses"
        });
      }
      previousBandNodeId = bandNodeId;

      for (const topic of band.topics) {
        for (const objective of topic.objectives) {
          const objectiveNodeId = "objective:" + objective.id;
          nodes.push({
            id: objectiveNodeId,
            label: objective.title,
            kind: "objective",
            subtitle: objective.code + " · " + topic.title,
            disciplineId: discipline.id,
            stage: band.schoolStage,
            objectiveId: objective.id
          });
          edges.push({
            id: "edge:" + band.id + ":" + objective.id,
            source: bandNodeId,
            target: objectiveNodeId,
            relation: "contains"
          });

          for (const connection of objective.connections) {
            const key = connection.trim().toLowerCase();
            let connectionNodeId = relationNodes.get(key);
            if (!connectionNodeId) {
              connectionNodeId = "connection:" + key.replace(/\s+/g, "-");
              relationNodes.set(key, connectionNodeId);
              nodes.push({
                id: connectionNodeId,
                label: connection,
                kind: "connection",
                subtitle: "Raccordo interdisciplinare"
              });
            }
            edges.push({
              id: "edge:connect:" + objective.id + ":" + connectionNodeId,
              source: objectiveNodeId,
              target: connectionNodeId,
              relation: "connects"
            });
          }
        }
      }
    }
  }

  return { nodes, edges };
}

export const exploreGraph = buildExploreGraph();
