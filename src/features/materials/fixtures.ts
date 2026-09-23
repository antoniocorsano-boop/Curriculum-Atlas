import type { PublicClass, PublishedLesson } from "@/features/curriculum/model";

export const publicClasses: PublicClass[] = [
  { id: "1a", label: "1A", schoolStage: "Secondaria di primo grado" },
  { id: "1c", label: "1C", schoolStage: "Secondaria di primo grado" },
  { id: "2a", label: "2A", schoolStage: "Secondaria di primo grado" },
  { id: "2c", label: "2C", schoolStage: "Secondaria di primo grado" },
  { id: "3a", label: "3A", schoolStage: "Secondaria di primo grado" },
  { id: "3c", label: "3C", schoolStage: "Secondaria di primo grado" }
];

export const publicDisciplines = [
  { id: "italiano", label: "Italiano" },
  { id: "matematica", label: "Matematica" },
  { id: "scienze", label: "Scienze" },
  { id: "tecnologia", label: "Tecnologia" }
];

export const publishedLessons: PublishedLesson[] = [
  {
    id: "2c-tec-01",
    classId: "2c",
    disciplineId: "tecnologia",
    lessonNumber: 1,
    title: "Tecnica, tecnologia e sistema tecnologico",
    dateLabel: "Lezione 1",
    materials: [
      { id: "m1", title: "Infografica: tecnica e tecnologia", kind: "Infografica" },
      { id: "m2", title: "Scheda studente", kind: "Scheda" },
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
      { id: "m4", title: "Mappa del sistema agricolo", kind: "Infografica" },
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
      { id: "m6", title: "Schema dei passaggi di stato", kind: "Presentazione" }
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
      { id: "m7", title: "Guida alla lettura", kind: "Scheda" }
    ]
  }
];
