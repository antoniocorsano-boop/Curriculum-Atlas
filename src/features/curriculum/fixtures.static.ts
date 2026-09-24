import type { InstituteCurriculum } from "./model";

export const arenaCurriculumAuthority = {
  authorityState: "FIXTURE" as "FIXTURE" | "PROVISIONAL_COMPLETE" | "APPROVED",
  sourceState: "DEMO_FIXTURE",
  masterVersion: "S3-V2/F1",
  fingerprint: "fixture",
} as const;

export const instituteCurriculumFixture: InstituteCurriculum = {
  instituteName: "Istituto Comprensivo · fixture Atlas",
  versionLabel: "S3-V2/F1 · dati dimostrativi non autorevoli",
  disciplines: [
    {
      id: "campi-esperienza",
      label: "Campi di esperienza",
      department: "Scuola dell'infanzia",
      bands: [
        {
          id: "infanzia-conoscenza-mondo",
          schoolStage: "Infanzia",
          gradeLabel: "Percorso verticale",
          subtitle: "Esplorazione, osservazione e prime relazioni",
          topics: [
            {
              id: "infanzia-mondo",
              title: "La conoscenza del mondo",
              objectives: [
                {
                  id: "infanzia-1",
                  code: "INF.1",
                  title: "Osservare fenomeni, oggetti e relazioni",
                  description: "Esplorare il mondo attraverso osservazione, confronto, domande e prime rappresentazioni.",
                  knowledge: ["Oggetti e materiali", "Relazioni", "Spazio e tempo"],
                  skills: ["Osservare", "Confrontare", "Descrivere"],
                  prerequisites: [],
                  connections: ["Scienze", "Matematica", "Tecnologia"],
                  sourceLabel: "Fonte prevista: Arena · fixture di istituto",
                  sourceVersion: "S3-V2/F1"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "italiano",
      label: "Italiano",
      department: "Area linguistico-espressiva",
      bands: [
        {
          id: "ita-primary-5",
          schoolStage: "Primaria",
          gradeLabel: "Classe quinta",
          subtitle: "Comprensione, produzione e riflessione linguistica",
          topics: [
            {
              id: "ita-reading",
              title: "Lettura e comprensione",
              objectives: [
                {
                  id: "ita-5-1",
                  code: "ITA.P5.1",
                  title: "Comprendere testi di diversa tipologia",
                  description: "Comprendere informazioni esplicite e implicite in testi narrativi, informativi e regolativi.",
                  knowledge: ["Tipologie testuali", "Informazioni esplicite e implicite"],
                  skills: ["Comprendere", "Inferire", "Rielaborare"],
                  prerequisites: ["Lettura strumentale"],
                  connections: ["Storia", "Educazione civica"],
                  sourceLabel: "Fonte prevista: Arena · fixture di istituto",
                  sourceVersion: "S3-V2/F1"
                }
              ]
            }
          ]
        },
        {
          id: "ita-secondary-1",
          schoolStage: "Secondaria di primo grado",
          gradeLabel: "Classe prima",
          subtitle: "Comprensione e produzione consapevole",
          topics: [
            {
              id: "ita-text",
              title: "Testi e comunicazione",
              objectives: [
                {
                  id: "ita-s1-1",
                  code: "ITA.S1.1",
                  title: "Analizzare struttura e significato di un testo",
                  description: "Riconoscere organizzazione, informazioni e scelte linguistiche fondamentali.",
                  knowledge: ["Struttura del testo", "Lessico", "Coesione"],
                  skills: ["Analizzare", "Sintetizzare", "Argomentare"],
                  prerequisites: ["Comprensione del testo"],
                  connections: ["Storia", "Geografia"],
                  sourceLabel: "Fonte prevista: Arena · fixture di istituto",
                  sourceVersion: "S3-V2/F1"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "matematica",
      label: "Matematica",
      department: "Area scientifico-matematica-tecnologica",
      bands: [
        {
          id: "math-primary-5",
          schoolStage: "Primaria",
          gradeLabel: "Classe quinta",
          subtitle: "Numeri, spazio, relazioni e dati",
          topics: [
            {
              id: "math-data",
              title: "Dati e relazioni",
              objectives: [
                {
                  id: "math-5-1",
                  code: "MAT.P5.1",
                  title: "Rappresentare e interpretare dati",
                  description: "Organizzare dati e leggerne rappresentazioni semplici in contesti significativi.",
                  knowledge: ["Tabelle", "Grafici", "Frequenze"],
                  skills: ["Rappresentare", "Confrontare", "Interpretare"],
                  prerequisites: ["Calcolo di base"],
                  connections: ["Scienze", "Tecnologia"],
                  sourceLabel: "Fonte prevista: Arena · fixture di istituto",
                  sourceVersion: "S3-V2/F1"
                }
              ]
            }
          ]
        },
        {
          id: "math-secondary-2",
          schoolStage: "Secondaria di primo grado",
          gradeLabel: "Classe seconda",
          subtitle: "Relazioni, proporzioni e rappresentazioni",
          topics: [
            {
              id: "math-relations",
              title: "Relazioni e proporzionalità",
              objectives: [
                {
                  id: "math-s2-1",
                  code: "MAT.S2.1",
                  title: "Interpretare relazioni di proporzionalità",
                  description: "Riconoscere e rappresentare relazioni proporzionali in problemi e situazioni reali.",
                  knowledge: ["Rapporti", "Proporzioni", "Grafici"],
                  skills: ["Risolvere", "Rappresentare", "Generalizzare"],
                  prerequisites: ["Frazioni", "Piano cartesiano"],
                  connections: ["Scienze", "Tecnologia"],
                  sourceLabel: "Fonte prevista: Arena · fixture di istituto",
                  sourceVersion: "S3-V2/F1"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "scienze",
      label: "Scienze",
      department: "Area scientifico-matematica-tecnologica",
      bands: [
        {
          id: "science-secondary-2",
          schoolStage: "Secondaria di primo grado",
          gradeLabel: "Classe seconda",
          subtitle: "Materia, energia e sistemi",
          topics: [
            {
              id: "science-matter",
              title: "Materia e trasformazioni",
              objectives: [
                {
                  id: "sci-s2-1",
                  code: "SCI.S2.1",
                  title: "Interpretare trasformazioni della materia",
                  description: "Osservare e interpretare cambiamenti fisici e semplici trasformazioni in relazione alle condizioni del sistema.",
                  knowledge: ["Stati della materia", "Passaggi di stato", "Temperatura"],
                  skills: ["Osservare", "Descrivere", "Interpretare"],
                  prerequisites: ["Misure e grandezze"],
                  connections: ["Matematica", "Tecnologia"],
                  sourceLabel: "Fonte prevista: Arena · fixture di istituto",
                  sourceVersion: "S3-V2/F1"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "tecnologia",
      label: "Tecnologia",
      department: "Area scientifico-matematica-tecnologica",
      bands: [
        {
          id: "tech-secondary-1",
          schoolStage: "Secondaria di primo grado",
          gradeLabel: "Classe prima",
          subtitle: "Materiali, rappresentazione e sistemi",
          topics: [
            {
              id: "tech-materials",
              title: "Materiali e trasformazioni",
              objectives: [
                {
                  id: "tech-s1-1",
                  code: "TEC.S1.1",
                  title: "Riconoscere proprietà e trasformazioni dei materiali",
                  description: "Osservare materiali, proprietà e trasformazioni mettendoli in relazione con usi e processi.",
                  knowledge: ["Proprietà dei materiali", "Trasformazioni", "Risorse"],
                  skills: ["Osservare", "Confrontare", "Classificare"],
                  prerequisites: ["Misure di base"],
                  connections: ["Scienze"],
                  sourceLabel: "Fonte prevista: Arena · fixture di istituto",
                  sourceVersion: "S3-V2/F1"
                }
              ]
            }
          ]
        },
        {
          id: "tech-secondary-2",
          schoolStage: "Secondaria di primo grado",
          gradeLabel: "Classe seconda",
          subtitle: "Sistemi, processi ed energia",
          topics: [
            {
              id: "tech-systems",
              title: "Sistemi tecnologici",
              objectives: [
                {
                  id: "tech-s2-1",
                  code: "TEC.S2.1",
                  title: "Interpretare un sistema tecnologico",
                  description: "Individuare componenti, flussi, funzioni e relazioni in semplici sistemi tecnologici.",
                  knowledge: ["Sistema tecnologico", "Input e output", "Funzione", "Energia"],
                  skills: ["Analizzare", "Rappresentare", "Mettere in relazione"],
                  prerequisites: ["Proprietà dei materiali"],
                  connections: ["Scienze", "Matematica"],
                  sourceLabel: "Fonte prevista: Arena · fixture di istituto",
                  sourceVersion: "S3-V2/F1"
                }
              ]
            }
          ]
        },
        {
          id: "tech-secondary-3",
          schoolStage: "Secondaria di primo grado",
          gradeLabel: "Classe terza",
          subtitle: "Progettazione, impatto e scelta",
          topics: [
            {
              id: "tech-design",
              title: "Progettazione e valutazione",
              objectives: [
                {
                  id: "tech-s3-1",
                  code: "TEC.S3.1",
                  title: "Valutare soluzioni tecnologiche",
                  description: "Confrontare soluzioni considerando funzione, risorse, impatti, vincoli e contesto d'uso.",
                  knowledge: ["Vincoli di progetto", "Impatto", "Criteri di scelta"],
                  skills: ["Valutare", "Argomentare", "Progettare"],
                  prerequisites: ["Sistemi tecnologici"],
                  connections: ["Scienze", "Matematica", "Educazione civica"],
                  sourceLabel: "Fonte prevista: Arena · fixture di istituto",
                  sourceVersion: "S3-V2/F1"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export function findObjective(id: string) {
  for (const discipline of instituteCurriculumFixture.disciplines) {
    for (const band of discipline.bands) {
      for (const topic of band.topics) {
        const objective = topic.objectives.find(item => item.id === id);
        if (objective) return { discipline, band, topic, objective };
      }
    }
  }
  return null;
}
