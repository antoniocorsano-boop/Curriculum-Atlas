import type { CurriculumYear } from "./model";

export const curriculumFixture: CurriculumYear[] = [
  {
    id: "year-1",
    label: "Prima annualità",
    subtitle: "Fondamenti e osservazione dei sistemi",
    topics: [
      {
        id: "materials",
        title: "Materiali e trasformazioni",
        objectives: [
          {
            id: "obj-1",
            code: "T.1.1",
            title: "Riconoscere proprietà e trasformazioni dei materiali",
            description: "Osservare materiali, proprietà e trasformazioni mettendoli in relazione con usi, processi e impatti.",
            knowledge: ["Proprietà dei materiali", "Trasformazioni", "Uso consapevole delle risorse"],
            skills: ["Osservare", "Confrontare", "Classificare"],
            prerequisites: ["Misure di base"],
            connections: ["Scienze"],
            sourceLabel: "Arena · fixture governata",
            sourceVersion: "S3-V2/F1"
          }
        ]
      }
    ]
  },
  {
    id: "year-2",
    label: "Seconda annualità",
    subtitle: "Sistemi, processi e relazioni",
    topics: [
      {
        id: "energy",
        title: "Energia e sistemi tecnologici",
        objectives: [
          {
            id: "obj-2",
            code: "T.2.1",
            title: "Interpretare un sistema tecnologico",
            description: "Individuare componenti, flussi, funzioni e relazioni in semplici sistemi tecnologici.",
            knowledge: ["Sistema tecnologico", "Input e output", "Funzione", "Energia"],
            skills: ["Analizzare", "Rappresentare", "Mettere in relazione"],
            prerequisites: ["Proprietà dei materiali"],
            connections: ["Scienze", "Matematica"],
            sourceLabel: "Arena · fixture governata",
            sourceVersion: "S3-V2/F1"
          }
        ]
      }
    ]
  },
  {
    id: "year-3",
    label: "Terza annualità",
    subtitle: "Progettazione, impatto e scelta",
    topics: [
      {
        id: "design",
        title: "Progettazione e valutazione",
        objectives: [
          {
            id: "obj-3",
            code: "T.3.1",
            title: "Valutare soluzioni tecnologiche",
            description: "Confrontare soluzioni considerando funzione, risorse, impatti, vincoli e contesto d'uso.",
            knowledge: ["Vincoli di progetto", "Impatto", "Criteri di scelta"],
            skills: ["Valutare", "Argomentare", "Progettare"],
            prerequisites: ["Sistemi tecnologici"],
            connections: ["Scienze", "Matematica", "Educazione civica"],
            sourceLabel: "Arena · fixture governata",
            sourceVersion: "S3-V2/F1"
          }
        ]
      }
    ]
  }
];

export function findObjective(id: string) {
  for (const year of curriculumFixture) {
    for (const topic of year.topics) {
      const objective = topic.objectives.find(item => item.id === id);
      if (objective) return { year, topic, objective };
    }
  }
  return null;
}
