import type {
  CurriculumBand,
  CurriculumDiscipline,
  CurriculumObjective,
  CurriculumTopic,
  InstituteCurriculum,
  CurricoloBand,
  CurricoloDiscipline,
  CurricoloIstituto,
  CurricoloObjective,
  CurricoloTopic,
} from "./model";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? (<T>() => T extends B ? 1 : 2) extends
      (<T>() => T extends A ? 1 : 2)
      ? true
      : false
    : false;

type Assert<T extends true> = T;

type _ObjectiveParity = Assert<Equal<CurricoloObjective, CurriculumObjective>>;
type _TopicParity = Assert<Equal<CurricoloTopic, CurriculumTopic>>;
type _BandParity = Assert<Equal<CurricoloBand, CurriculumBand>>;
type _DisciplineParity = Assert<Equal<CurricoloDiscipline, CurriculumDiscipline>>;
type _InstituteParity = Assert<Equal<CurricoloIstituto, InstituteCurriculum>>;

export type CurricoloVocabularyCompatibility = {
  objective: _ObjectiveParity;
  topic: _TopicParity;
  band: _BandParity;
  discipline: _DisciplineParity;
  institute: _InstituteParity;
};
