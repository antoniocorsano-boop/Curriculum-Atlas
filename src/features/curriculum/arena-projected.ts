import arenaExport from "./arena-curriculum-export.json";
import type {
  CurricoloBand,
  CurricoloDiscipline,
  CurricoloObjective,
  CurricoloIstituto,
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
  band: ArenaBand,
  text: string,
  index: number,
): CurricoloObjective {
  const base = band.id;
  return {
    id: `${base}-o${index + 1}`,
    code: `${band.id.toUpperCase()}.O${index + 1}`,
    title: shortTitle(text, `Progressione ${band.gradeLabel}`),
    description: text,
    knowledge: [],
    skills: [],
    prerequisites: [],
    connections: [],
    sourceLabel: `Arena · ${source.curriculum.masterId} · ${source.authorityState}`,
    sourceVersion: `${source.curriculum.masterVersion} · ${source.structuralFingerprint.hash}`,
  };
}

function bandFromArena(discipline: ArenaDiscipline, band: ArenaBand): CurricoloBand {
  const objectiveTexts = band.objectives ?? [];

  return {
    id: band.id,
    schoolStage: band.schoolStage,
    gradeLabel: band.gradeLabel,
    subtitle: [band.regime, band.progression].filter(Boolean).join(" · "),
    context: {
      kind: "ordinary",
      sourceSection: band.sourceSection,
      regime: band.regime,
      progression: band.progression,
      competences: band.competences ?? [],
      knowledge: band.knowledge ?? [],
      evidence: band.evidence ?? [],
      connections: band.connections ?? [],
    },
    topics: [{
      id: `${band.id}-progressione`,
      title: discipline.label,
      objectives: objectiveTexts.map((text, index) => objectiveFromBand(band, text, index)),
    }],
  };
}

function axisToDiscipline(axis: ArenaAxis): CurricoloDiscipline {
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
      context: { kind: "axis", sourceSection: axis.sourceSection },
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

export const curricoloIstitutoFixture: CurricoloIstituto = {
  instituteName: source.curriculum.instituteName,
  versionLabel: `Arena ${source.curriculum.masterVersion} · ${source.authorityState === "APPROVED" ? "approvato" : "in validazione · non vigente"}`,
  disciplines: [...ordinary, ...source.curriculum.transversalAxes.map(axisToDiscipline)],
};

// Compatibility alias for consumers that still depend on the pre-TERM-01 API.
export const instituteCurriculumFixture = curricoloIstitutoFixture;

export const arenaCurriculumAuthority = {
  authorityState: source.authorityState,
  sourceState: source.curriculum.sourceState,
  masterVersion: source.curriculum.masterVersion,
  fingerprint: source.structuralFingerprint.hash,
} as const;

type ObjectiveMatch = {
  discipline: CurricoloDiscipline;
  band: CurricoloBand;
  topic: CurricoloBand["topics"][number];
  objective: CurricoloObjective;
};

const objectiveIndex = new Map<string, ObjectiveMatch>();
const legacyIndex = new Map<string, ObjectiveMatch[]>();
const seenBands = new Set<string>();
const seenTopics = new Set<string>();
const seenDisciplines = new Set<string>();
const seenCodes = new Set<string>();

function addUnique(seen: Set<string>, id: string) {
  if (!id || seen.has(id)) throw new Error("Identità curricolare duplicata o vuota: " + id);
  seen.add(id);
}

for (const discipline of curricoloIstitutoFixture.disciplines) {
  addUnique(seenDisciplines, discipline.id);
  for (const band of discipline.bands) {
    addUnique(seenBands, band.id);
    for (const topic of band.topics) {
      addUnique(seenTopics, topic.id);
      topic.objectives.forEach((objective, index) => {
        if (objectiveIndex.has(objective.id)) {
          throw new Error("Obiettivo duplicato: " + objective.id);
        }
        addUnique(seenCodes, objective.code);
        const match = { discipline, band, topic, objective };
        objectiveIndex.set(objective.id, match);
        if (ordinary.includes(discipline)) {
          const oldId = `${discipline.id}-${slug(band.gradeLabel)}-o${index + 1}`;
          const matches = legacyIndex.get(oldId) ?? [];
          matches.push(match);
          legacyIndex.set(oldId, matches);
        }
      });
    }
  }
}

// Exact current-projection IDs only. Historical aliases never resolve silently.
export function findObjective(id: string): ObjectiveMatch | null {
  return objectiveIndex.get(id) ?? null;
}

export function legacyObjectiveMatches(id: string): readonly ObjectiveMatch[] {
  if (objectiveIndex.has(id)) return [];
  return legacyIndex.get(id) ?? [];
}

export function legacyObjectiveRouteIds(): string[] {
  return [...legacyIndex.keys()].filter(id => !objectiveIndex.has(id));
}
