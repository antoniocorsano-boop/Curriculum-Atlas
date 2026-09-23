export type CurriculumObjective = {
  id: string;
  code: string;
  title: string;
  description: string;
  knowledge: string[];
  skills: string[];
  prerequisites: string[];
  connections: string[];
  sourceLabel: string;
  sourceVersion: string;
};

export type CurriculumTopic = {
  id: string;
  title: string;
  objectives: CurriculumObjective[];
};

export type CurriculumBand = {
  id: string;
  schoolStage: "Infanzia" | "Primaria" | "Secondaria di primo grado";
  gradeLabel: string;
  subtitle: string;
  topics: CurriculumTopic[];
};

export type CurriculumDiscipline = {
  id: string;
  label: string;
  department: string;
  bands: CurriculumBand[];
};

export type InstituteCurriculum = {
  instituteName: string;
  versionLabel: string;
  disciplines: CurriculumDiscipline[];
};

export type ResourceKind = "Scheda" | "Presentazione" | "Infografica" | "Video" | "Link" | "Documento";

export type AtlasResource = {
  id: string;
  title: string;
  summary: string;
  kind: ResourceKind;
  disciplineId: string;
  schoolStages: Array<"Primaria" | "Secondaria di primo grado">;
  accessibilityStatus: "Verificata" | "Da verificare";
  rightsLabel: string;
  editorialStatus: "Pubblicata";
  objectiveIds: string[];
  updatedLabel: string;
};

export type PublishedMaterial = {
  id: string;
  title: string;
  kind: ResourceKind;
  resourceId?: string;
};

export type PublishedLesson = {
  id: string;
  classId: string;
  disciplineId: string;
  lessonNumber: number;
  title: string;
  dateLabel?: string;
  materials: PublishedMaterial[];
};

export type PublicClass = {
  id: string;
  label: string;
  schoolStage: "Primaria" | "Secondaria di primo grado";
};
