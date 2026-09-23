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

export type CurriculumYear = {
  id: string;
  label: string;
  subtitle: string;
  topics: CurriculumTopic[];
};
