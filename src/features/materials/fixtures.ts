import type { AtlasResource, PublicClass, PublishedLesson } from "@/features/curriculum/model";

export const publicClasses: PublicClass[] = [
  { id: "5a-primary", label: "5A", schoolStage: "Primaria" },
  { id: "5b-primary", label: "5B", schoolStage: "Primaria" },
  { id: "1a", label: "1A", schoolStage: "Secondaria di primo grado" },
  { id: "1c", label: "1C", schoolStage: "Secondaria di primo grado" },
  { id: "2a", label: "2A", schoolStage: "Secondaria di primo grado" },
  { id: "2c", label: "2C", schoolStage: "Secondaria di primo grado" },
  { id: "3a", label: "3A", schoolStage: "Secondaria di primo grado" },
  { id: "3c", label: "3C", schoolStage: "Secondaria di primo grado" },
  { id: "3e", label: "3E", schoolStage: "Secondaria di primo grado" }
];

export const publicDisciplines = [
  { id: "italiano", label: "Italiano" },
  { id: "matematica", label: "Matematica" },
  { id: "scienze", label: "Scienze" },
  { id: "tecnologia", label: "Tecnologia" }
];

export const atlasResources: AtlasResource[] = [
  {
    id: "r-tec-001",
    title: "Tecnica, tecnologia e sistema tecnologico",
    summary: "Infografica introduttiva per distinguere tecnica, tecnologia e sistema tecnologico con esempi essenziali.",
    kind: "Infografica",
    disciplineId: "tecnologia",
    schoolStages: ["Secondaria di primo grado"],
    accessibilityStatus: "Verificata",
    rightsLabel: "CC BY 4.0",
    editorialStatus: "Pubblicata",
    objectiveIds: ["tech-s2-1"],
    updatedLabel: "Settembre 2026"
  },
  {
    id: "r-tec-002",
    title: "Scheda studente: tecnica e tecnologia",
    summary: "Scheda operativa con definizioni, confronto guidato ed esercizio di riconoscimento.",
    kind: "Scheda",
    disciplineId: "tecnologia",
    schoolStages: ["Secondaria di primo grado"],
    accessibilityStatus: "Verificata",
    rightsLabel: "CC BY 4.0",
    editorialStatus: "Pubblicata",
    objectiveIds: ["tech-s2-1"],
    updatedLabel: "Settembre 2026"
  },
  {
    id: "r-tec-003",
    title: "Agricoltura come sistema tecnologico",
    summary: "Mappa visuale che mette in relazione risorse, processi, strumenti, persone e risultati del sistema agricolo.",
    kind: "Infografica",
    disciplineId: "tecnologia",
    schoolStages: ["Secondaria di primo grado"],
    accessibilityStatus: "Verificata",
    rightsLabel: "CC BY 4.0",
    editorialStatus: "Pubblicata",
    objectiveIds: ["tech-s2-1"],
    updatedLabel: "Settembre 2026"
  },
  {
    id: "r-ita-001",
    title: "Guida alla lettura di un testo informativo",
    summary: "Traccia riutilizzabile per riconoscere scopo, struttura e informazioni principali di un testo.",
    kind: "Scheda",
    disciplineId: "italiano",
    schoolStages: ["Primaria", "Secondaria di primo grado"],
    accessibilityStatus: "Verificata",
    rightsLabel: "CC BY 4.0",
    editorialStatus: "Pubblicata",
    objectiveIds: [],
    updatedLabel: "Settembre 2026"
  },
  {
    id: "r-sci-001",
    title: "Passaggi di stato della materia",
    summary: "Presentazione sintetica dei principali passaggi di stato con schema di trasformazione.",
    kind: "Presentazione",
    disciplineId: "scienze",
    schoolStages: ["Secondaria di primo grado"],
    accessibilityStatus: "Da verificare",
    rightsLabel: "Uso didattico autorizzato",
    editorialStatus: "Pubblicata",
    objectiveIds: [],
    updatedLabel: "Settembre 2026"
  }
];

export const publishedLessons: PublishedLesson[] = [
  {
    id: "5a-ita-01",
    classId: "5a-primary",
    disciplineId: "italiano",
    lessonNumber: 1,
    title: "Comprendere un testo informativo",
    dateLabel: "Lezione 1",
    materials: [
      { id: "m0a", title: "Guida alla lettura", kind: "Scheda", resourceId: "r-ita-001" },
      { id: "m0b", title: "Mappa delle informazioni", kind: "Infografica" }
    ]
  },
  {
    id: "5a-mat-01",
    classId: "5a-primary",
    disciplineId: "matematica",
    lessonNumber: 1,
    title: "Leggere e rappresentare dati",
    dateLabel: "Lezione 1",
    materials: [
      { id: "m0c", title: "Esercizi su tabelle e grafici", kind: "Scheda" }
    ]
  },
  {
    id: "2c-tec-01",
    classId: "2c",
    disciplineId: "tecnologia",
    lessonNumber: 1,
    title: "Tecnica, tecnologia e sistema tecnologico",
    dateLabel: "Lezione 1",
    materials: [
      { id: "m1", title: "Infografica: tecnica e tecnologia", kind: "Infografica", resourceId: "r-tec-001" },
      { id: "m2", title: "Scheda studente", kind: "Scheda", resourceId: "r-tec-002" },
      { id: "m3", title: "Sintesi della lezione", kind: "Documento" }
    ]
  },
  {
    id: "2c-tec-02",
    classId: "2c",
    disciplineId: "tecnologia",
    lessonNumber: 2,
    title: "Agricoltura come sistema tecnologico",
    dateLabel: "Lezione 2",
    materials: [
      { id: "m4", title: "Mappa del sistema agricolo", kind: "Infografica", resourceId: "r-tec-003" },
      { id: "m5", title: "Attività guidata", kind: "Scheda" }
    ]
  },
  {
    id: "2c-sci-01",
    classId: "2c",
    disciplineId: "scienze",
    lessonNumber: 1,
    title: "Materia e passaggi di stato",
    dateLabel: "Lezione 1",
    materials: [
      { id: "m6", title: "Schema dei passaggi di stato", kind: "Presentazione", resourceId: "r-sci-001" }
    ]
  },
  {
    id: "1a-ita-01",
    classId: "1a",
    disciplineId: "italiano",
    lessonNumber: 1,
    title: "Comprendere la struttura di un testo",
    dateLabel: "Lezione 1",
    materials: [
      { id: "m7", title: "Guida alla lettura", kind: "Scheda", resourceId: "r-ita-001" }
    ]
  },
  {
    id: "1c-tec-03",
    classId: "1c",
    disciplineId: "tecnologia",
    lessonNumber: 3,
    title: "Dal bisogno alla soluzione tecnica",
    dateLabel: "23 settembre 2026",
    materials: [
      { id: "1c-20260923-infografica", title: "Dal bisogno alla soluzione tecnica", kind: "Infografica", url: "/materials/2026-09-23/1c/dal-bisogno-alla-soluzione-tecnica.svg" },
      { id: "1c-20260923-scheda", title: "Scheda studente: bisogno e soluzione", kind: "Scheda", url: "/materials/2026-09-23/1c/scheda-studente.svg" }
    ]
  },
  {
    id: "3e-tec-02",
    classId: "3e",
    disciplineId: "tecnologia",
    lessonNumber: 2,
    title: "Dove va l'energia? Effetto utile e dispersioni",
    dateLabel: "23 settembre 2026",
    materials: [
      { id: "3e-20260923-infografica", title: "Dove va l'energia?", kind: "Infografica", url: "/materials/2026-09-23/3e/dove-va-l-energia.svg" },
      { id: "3e-20260923-scheda", title: "Scheda studente: trasformazioni e dispersioni", kind: "Scheda", url: "/materials/2026-09-23/3e/scheda-studente.svg" }
    ]
  }
];
