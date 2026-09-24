import arenaExport from "./arena-curriculum-export.json";
import type {
  CurriculumBand,
  CurriculumDiscipline,
  CurriculumObjective,
  InstituteCurriculum,
} from "./model";

type ArenaBand = {
  id: string;
  schoolStage: "Infanzia" | "Primaria" | "Secondaria di primo grado";
  gradeLabel: string;
  regime?: string;
  progression?: string;
  competences?: string[];
  objectives?: string[];
  knowledge?: string[];
  evidence?: string[];
  connections?: string[];
  sourceSection?: string;
  sourceText?: string;
};

type ArenaDiscipline = {
  id: string;
  label: string;
  department: string;
  bands: ArenaBand[];
};

type ArenaAxis = {
  id: string;
  label: string;
  kind: string;
  sourceSection: string;
  paragraphs: string[];
};

type ArenaExport = {
  authorityState: "PROVISIONAL_COMPLETE" | "APPROVED";
  structuralFingerprint: { hash: string };
  curriculum: {
    instituteName: string;
    masterId: string;
    masterVersion: string;
    schoolYear: string;
    sourceState: string;
    disciplines: ArenaDiscipline[];
    transversalAxes: ArenaAxis[];
  };
};

const source = arenaExport as ArenaExport;

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function shortTitle(text: string, fallback: string): string {
  const candidate = text.split(/[.;]/)[0]?.trim() || fallback;
  return candidate.length <= 110 ? candidate : candidate.slice(0, 107).trimEnd() + "…";
}

function objectiveFromBand(
  discipline: ArenaDiscipline,
  band: ArenaBand,
  text: string,
  index: number,
): CurriculumObjective {
  const base = `${discipline.id}-${slug(band.gradeLabel)}`;
  return {
    id: `${base}-o${index + 1}`,
    code: `${discipline.id.toUpperCase().slice(0, 8)}.${slug(band.gradeLabel).toUpperCase()}.${index + 1}`,
    title: shortTitle(text, `Progressione ${band.gradeLabel}`),
    description: text || band.progression || band.sourceText || "",
    knowledge: band.knowledge ?? [],
    skills: band.competences ?? [],
    prerequisites: [],
    connections: band.connections ?? [],
    sourceLabel: `Arena · ${source.curriculum.masterId} · ${source.authorityState}`,
    sourceVersion: `${source.curriculum.masterVersion} · ${source.structuralFingerprint.hash}`,
  };
}

function bandFromArena(discipline: ArenaDiscipline, band: ArenaBand): CurriculumBand {
  const objectiveTexts = band.objectives?.length
    ? band.objectives
    : [band.progression || band.sourceText || `Progressione ${band.gradeLabel}`];

  return {
    id: band.id,
    schoolStage: band.schoolStage,
    gradeLabel: band.gradeLabel,
    subtitle: [band.regime, band.progression].filter(Boolean).join(" · "),
    topics: [{
      id: `${discipline.id}-${slug(band.gradeLabel)}-progressione`,
      title: discipline.label,
      objectives: objectiveTexts.map((text, index) => objectiveFromBand(discipline, band, text, index)),
    }],
  };
}

function axisToDiscipline(axis: ArenaAxis): CurriculumDiscipline {
  const description = axis.paragraphs
    .filter((line) => !/^\d+\./.test(line))
    .join("\n\n");

  return {
    id: axis.id,
    label: axis.label,
    department: axis.kind === "TRANSVERSAL_AXIS" ? "Assi trasversali" : "Percorsi integrati",
    bands: [{
      id: `${axis.id}-3-14`,
      schoolStage: "Secondaria di primo grado",
      gradeLabel: "Percorso 3–14",
      subtitle: axis.kind === "TRANSVERSAL_AXIS" ? "Asse trasversale d’istituto" : "Percorso integrato",
      topics: [{
        id: `${axis.id}-quadro`,
        title: axis.label,
        objectives: [{
          id: `${axis.id}-quadro-1`,
          code: `${axis.id.toUpperCase().replace(/-/g, "_")}.1`,
          title: axis.label,
          description,
          knowledge: [],
          skills: [],
          prerequisites: [],
          connections: [],
          sourceLabel: `Arena · ${source.curriculum.masterId} · ${source.authorityState}`,
          sourceVersion: `${source.curriculum.masterVersion} · ${source.structuralFingerprint.hash}`,
        }],
      }],
    }],
  };
}

const ordinary = source.curriculum.disciplines.map((discipline) => ({
  id: discipline.id,
  label: discipline.label,
  department: discipline.department,
  bands: discipline.bands.map((band) => bandFromArena(discipline, band)),
}));

export const instituteCurriculumFixture: InstituteCurriculum = {
  instituteName: source.curriculum.instituteName,
  versionLabel: `Arena ${source.curriculum.masterVersion} · ${source.authorityState === "APPROVED" ? "approvato" : "in validazione · non vigente"}`,
  disciplines: [...ordinary, ...source.curriculum.transversalAxes.map(axisToDiscipline)],
};

export const arenaCurriculumAuthority = {
  authorityState: source.authorityState,
  sourceState: source.curriculum.sourceState,
  masterVersion: source.curriculum.masterVersion,
  fingerprint: source.structuralFingerprint.hash,
} as const;

export function findObjective(id: string) {
  for (const discipline of instituteCurriculumFixture.disciplines) {
    for (const band of discipline.bands) {
      for (const topic of band.topics) {
        const objective = topic.objectives.find((item) => item.id === id);
        if (objective) return { discipline, band, topic, objective };
      }
    }
  }
  return null;
}
