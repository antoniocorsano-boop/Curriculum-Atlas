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

/**
 * TRAMA-TERM-01 canonical domain vocabulary.
 *
 * The Curriculum* exports above remain as compatibility names for the
 * existing Atlas v1 code and Arena→Atlas contracts. New internal domain work
 * should prefer the Curricolo* names below.
 */
export type CurricoloObjective = CurriculumObjective;
export type CurricoloTopic = CurriculumTopic;
export type CurricoloBand = CurriculumBand;
export type CurricoloDiscipline = CurriculumDiscipline;
export type CurricoloIstituto = InstituteCurriculum;

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
  editorialStatus: "Catalogata" | "Pubblicata";
  objectiveIds: string[];
  updatedLabel: string;
};

export type PublishedMaterial = {
  id: string;
  title: string;
  kind: ResourceKind;
  resourceId?: string;
  url?: string;
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
