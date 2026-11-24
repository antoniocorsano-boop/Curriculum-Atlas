import type {
  ExperienceDefinition,
  ExperienceStage,
  ExperienceStageEvidenceKind,
  ExperienceStageLocationPosition,
  ExperienceWorkbenchMode,
  ExperienceWorldSignalState,
} from "@/features/experiences/model";

import type {PreviewIllustratedMedia} from "./edutwin-preview-media";

export type StudioAtlasPreviewSceneKind = "SCENE" | "TRANSFER";

export interface StudioAtlasPreviewWorldSignal {
  id: string;
  label: string;
  state: ExperienceWorldSignalState;
  detail?: string;
}

export interface StudioAtlasPreviewWorldState {
  place: string;
  status: string;
  signals: StudioAtlasPreviewWorldSignal[];
}

export interface StudioAtlasPreviewSceneChoice {
  choiceId: string;
  label: string;
  feedback: string;
  targetSceneId: string;
  worldAfter?: StudioAtlasPreviewWorldState;
}

export interface StudioAtlasPreviewStage {
  visualMode: "CINEMATIC_EDITORIAL";
  focusLocationId?: string;
  locations?: Array<{
    id: string;
    label: string;
    detail: string;
    position: ExperienceStageLocationPosition;
  }>;
  evidence?: Array<{
    id: string;
    label: string;
    detail: string;
    locationId: string;
    kind: ExperienceStageEvidenceKind;
    character?: string;
    hotspot?: { x:number; y:number };
  }>;
  characterBeat?: {
    name: string;
    role: string;
    line: string;
  };
  workbench?: {
    modes: ExperienceWorkbenchMode[];
    prompt: string;
    minEvidence: number;
    transitionMap?: Partial<Record<ExperienceWorkbenchMode, string>>;
  };
}

export interface StudioAtlasPreviewScene {
  sceneId: string;
  kind: StudioAtlasPreviewSceneKind;
  interaction?: "SUMMARY" | "CHOICE";
  title: string;
  visibleSituation: string;
  learnerAction: string;
  consequence: string;
  reveal?: string;
  world?: StudioAtlasPreviewWorldState;
  stage?: StudioAtlasPreviewStage;
  choices?: StudioAtlasPreviewSceneChoice[];
}

export interface StudioAtlasPreviewSnapshot {
  schemaVersion: "studio-atlas.preview-snapshot/v0.1";
  snapshotId: string;
  packageDigest: string;
  pathwayId: string;
  version: string;
  title: string;
  description: string;
  runtimeAuthorized: false;
  studentAuthorized: false;
  scenes: StudioAtlasPreviewScene[];
  edutwinMedia?: PreviewIllustratedMedia;
  sceneMedia?: PreviewIllustratedMedia;
}

const WORLD_SIGNAL_STATES = new Set<ExperienceWorldSignalState>([
  "OFF",
  "READY",
  "ACTIVE",
  "DELAYED",
  "MISMATCH",
  "STABLE",
  "MANUAL",
]);

function validateWorldState(
  world: StudioAtlasPreviewWorldState | undefined,
  prefix: string,
  errors: string[],
) {
  if (!world) return;
  if (!world.place?.trim()) errors.push(`${prefix}:place`);
  if (!world.status?.trim()) errors.push(`${prefix}:status`);
  const signals = Array.isArray(world.signals) ? world.signals : [];
  if (signals.length === 0) errors.push(`${prefix}:signals`);
  const ids = new Set<string>();
  for (const signal of signals) {
    if (!signal?.id?.trim()) errors.push(`${prefix}:signalId`);
    else if (ids.has(signal.id)) errors.push(`${prefix}:duplicateSignal:${signal.id}`);
    else ids.add(signal.id);
    if (!signal?.label?.trim()) errors.push(`${prefix}:signalLabel`);
    if (!WORLD_SIGNAL_STATES.has(signal?.state)) errors.push(`${prefix}:signalState`);
    if (signal?.detail !== undefined && typeof signal.detail !== "string") errors.push(`${prefix}:signalDetail`);
  }
}

function validateStage(
  stage: StudioAtlasPreviewStage | undefined,
  prefix: string,
  errors: string[],
) {
  if (stage === undefined) return;
  const nonempty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
  const object = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
  if (!object(stage)) { errors.push(`${prefix}:object`); return; }
  if (stage.visualMode !== "CINEMATIC_EDITORIAL") errors.push(`${prefix}:visualMode`);
  if (stage.locations !== undefined && !Array.isArray(stage.locations)) errors.push(`${prefix}:locations`);
  const locations = Array.isArray(stage.locations) ? stage.locations : [];
  const locationIds = new Set<string>();
  for (const location of locations) {
    if (!object(location)) { errors.push(`${prefix}:locationObject`); continue; }
    if (!nonempty(location.id)) errors.push(`${prefix}:locationId`);
    else if (locationIds.has(location.id)) errors.push(`${prefix}:duplicateLocation:${location.id}`);
    else locationIds.add(location.id);
    if (!nonempty(location.label)) errors.push(`${prefix}:locationLabel`);
    if (!nonempty(location.detail)) errors.push(`${prefix}:locationDetail`);
    if (!["ENTRY", "ROOM", "CONTROL", "LAB"].includes(location.position)) errors.push(`${prefix}:locationPosition`);
  }
  if (stage.focusLocationId !== undefined && (!nonempty(stage.focusLocationId) || !locationIds.has(stage.focusLocationId))) {
    errors.push(`${prefix}:focusLocation`);
  }
  if (stage.evidence !== undefined && !Array.isArray(stage.evidence)) errors.push(`${prefix}:evidence`);
  const evidence = Array.isArray(stage.evidence) ? stage.evidence : [];
  const evidenceIds = new Set<string>();
  for (const item of evidence) {
    if (!object(item)) { errors.push(`${prefix}:evidenceObject`); continue; }
    if (!nonempty(item.id)) errors.push(`${prefix}:evidenceId`);
    else if (evidenceIds.has(item.id)) errors.push(`${prefix}:duplicateEvidence:${item.id}`);
    else evidenceIds.add(item.id);
    if (!nonempty(item.label)) errors.push(`${prefix}:evidenceLabel`);
    if (!nonempty(item.detail)) errors.push(`${prefix}:evidenceDetail`);
    if (!nonempty(item.locationId) || !locationIds.has(item.locationId)) errors.push(`${prefix}:evidenceLocation`);
    if (!["TRACE", "OBJECT", "PERSON", "SYSTEM"].includes(item.kind)) errors.push(`${prefix}:evidenceKind`);
    if (item.character !== undefined && !nonempty(item.character)) errors.push(`${prefix}:evidenceCharacter`);
    if(item.hotspot!==undefined&&(!object(item.hotspot)||Object.keys(item.hotspot).length!==2||![item.hotspot.x,item.hotspot.y].every(v=>typeof v==="number"&&Number.isInteger(v)&&v>=0&&v<=100)))errors.push(`${prefix}:hotspot`);
  }
  if (stage.characterBeat !== undefined) {
    const beat = stage.characterBeat;
    if (!object(beat) || !nonempty(beat.name) || !nonempty(beat.role) || !nonempty(beat.line)) {
      errors.push(`${prefix}:characterBeat`);
    }
  }
  if (stage.workbench !== undefined) {
    const bench = stage.workbench;
    if (!object(bench)) { errors.push(`${prefix}:workbenchObject`); return; }
    if (!nonempty(bench.prompt)) errors.push(`${prefix}:workbenchPrompt`);
    if (!Number.isInteger(bench.minEvidence) || bench.minEvidence < 0) errors.push(`${prefix}:workbenchMinEvidence`);
    const modes = ["TIMELINE", "CONNECTIONS", "COMPARE"];
    if (!Array.isArray(bench.modes) || bench.modes.length === 0 || new Set(bench.modes).size !== bench.modes.length || bench.modes.some(mode => !modes.includes(mode))) {
      errors.push(`${prefix}:workbenchModes`);
    }
    if (bench.transitionMap !== undefined && (!object(bench.transitionMap) ||
      Object.entries(bench.transitionMap).some(([mode, target]) => !modes.includes(mode) || !nonempty(target)))) {
      errors.push(`${prefix}:workbenchTransitionMap`);
    }
  }
}

export function validateStudioAtlasPreviewSnapshot(
  value: unknown,
): asserts value is StudioAtlasPreviewSnapshot {
  const snapshot = value as Partial<StudioAtlasPreviewSnapshot> | null;
  const errors: string[] = [];

  if (snapshot?.schemaVersion !== "studio-atlas.preview-snapshot/v0.1") errors.push("schemaVersion");
  if (!snapshot?.snapshotId?.trim()) errors.push("snapshotId");
  if (!snapshot?.pathwayId?.trim()) errors.push("pathwayId");
  if (!snapshot?.version?.trim()) errors.push("version");
  if (!snapshot?.title?.trim()) errors.push("title");
  if (!snapshot?.description?.trim()) errors.push("description");
  if (!snapshot?.packageDigest || !/^[0-9a-f]{64}$/.test(snapshot.packageDigest)) errors.push("packageDigest");
  if (snapshot?.runtimeAuthorized !== false) errors.push("runtimeAuthorized");
  if (snapshot?.studentAuthorized !== false) errors.push("studentAuthorized");

  const scenes = Array.isArray(snapshot?.scenes) ? snapshot.scenes : [];
  if (scenes.length === 0) errors.push("scenes");

  const ids = new Set<string>();
  const allSceneIds = new Set(
    scenes
      .map((scene) => scene?.sceneId?.trim())
      .filter((sceneId): sceneId is string => Boolean(sceneId)),
  );
  let transferCount = 0;
  for (const [sceneIndex, scene] of scenes.entries()) {
    if (!scene?.sceneId?.trim()) errors.push("sceneId");
    else if (ids.has(scene.sceneId)) errors.push(`duplicateScene:${scene.sceneId}`);
    else ids.add(scene.sceneId);

    if (scene?.kind !== "SCENE" && scene?.kind !== "TRANSFER") errors.push(`sceneKind:${scene?.sceneId ?? "unknown"}`);
    if (scene?.kind === "TRANSFER") transferCount += 1;
    if (!scene?.title?.trim()) errors.push(`sceneTitle:${scene?.sceneId ?? "unknown"}`);
    if (!scene?.visibleSituation?.trim()) errors.push(`visibleSituation:${scene?.sceneId ?? "unknown"}`);
    if (!scene?.learnerAction?.trim()) errors.push(`learnerAction:${scene?.sceneId ?? "unknown"}`);
    if (!scene?.consequence?.trim()) errors.push(`consequence:${scene?.sceneId ?? "unknown"}`);
    validateWorldState(scene?.world, `world:${scene?.sceneId ?? "unknown"}`, errors);
    validateStage(scene?.stage, `stage:${scene?.sceneId ?? "unknown"}`, errors);

    const interaction = scene?.interaction ?? "SUMMARY";
    if (interaction !== "SUMMARY" && interaction !== "CHOICE") {
      errors.push(`interaction:${scene?.sceneId ?? "unknown"}`);
    }

    if (interaction === "CHOICE") {
      const choices = Array.isArray(scene?.choices) ? scene.choices : [];
      if (choices.length < 2) errors.push(`choices:${scene?.sceneId ?? "unknown"}`);
      const choiceIds = new Set<string>();
      for (const choice of choices) {
        if (!choice?.choiceId?.trim()) errors.push(`choiceId:${scene?.sceneId ?? "unknown"}`);
        else if (choiceIds.has(choice.choiceId)) errors.push(`duplicateChoice:${scene?.sceneId ?? "unknown"}`);
        else choiceIds.add(choice.choiceId);
        if (!choice?.label?.trim()) errors.push(`choiceLabel:${scene?.sceneId ?? "unknown"}`);
        if (!choice?.feedback?.trim()) errors.push(`choiceFeedback:${scene?.sceneId ?? "unknown"}`);
        validateWorldState(
          choice?.worldAfter,
          `choiceWorld:${scene?.sceneId ?? "unknown"}:${choice?.choiceId ?? "unknown"}`,
          errors,
        );
        if (!choice?.targetSceneId?.trim()) {
          errors.push(`choiceTarget:${scene?.sceneId ?? "unknown"}`);
        } else if (!allSceneIds.has(choice.targetSceneId)) {
          errors.push(`choiceTargetMissing:${scene?.sceneId ?? "unknown"}`);
        }
      }
      if (
        new Set(choices.map((choice) => choice?.targetSceneId?.trim()).filter(Boolean)).size < 2
      ) {
        errors.push(`choiceTargetsNotDivergent:${scene?.sceneId ?? "unknown"}`);
      }
      if (sceneIndex === scenes.length - 1) {
        errors.push(`terminalChoice:${scene?.sceneId ?? "unknown"}`);
      }
    }
  }

  if (transferCount === 0) errors.push("transferRequired");

  if (errors.length > 0) {
    throw new Error(`STUDIO_ATLAS_PREVIEW_INVALID:${errors.join(",")}`);
  }
}

export function studioAtlasSnapshotToExperience(
  value: unknown,
): ExperienceDefinition {
  validateStudioAtlasPreviewSnapshot(value);
  const snapshot = value;
  // Reserved opening id emitted by the EduTwin draft compiler.
  // Preserve the existing presentation of all other Studio Atlas paths.
  const isEduTwin = snapshot.scenes[0].sceneId === "edutwin-opening";
  const withReveal = (feedback: string, reveal?: string) =>
    [feedback, ...(reveal?.trim() ? [reveal.trim()] : [])].join("\n\n");

  const nodes = snapshot.scenes.map((scene, index) => {
    const next = snapshot.scenes[index + 1];
    const isTerminal = index === snapshot.scenes.length - 1;
    const interaction = scene.interaction === "CHOICE" ? "choice" : "summary";
    const primitive =
      scene.kind === "TRANSFER" ? "TRANSFER" :
      interaction === "choice" ? "CHOOSE" :
      index === 0 ? "EXPLORE" :
      "INVESTIGATE";

    const transitions = isTerminal
      ? []
      : interaction === "choice"
        ? (scene.choices ?? []).map((choice) => ({
            id: choice.choiceId,
            targetNodeId: choice.targetSceneId,
            label: choice.label,
            feedback: isEduTwin ? withReveal(choice.feedback, scene.reveal) : choice.feedback,
            worldAfter: choice.worldAfter,
          }))
        : [{
            id: "continue",
            targetNodeId: next.sceneId,
            label: isEduTwin ? scene.learnerAction : "Continua",
            feedback: isEduTwin ? withReveal(scene.consequence, scene.reveal) : scene.consequence,
          }];

    return {
      id: scene.sceneId,
      primitive,
      interaction,
      title: scene.title,
      prompt: scene.learnerAction,
      facts: [
        scene.visibleSituation,
        ...(isEduTwin && isTerminal && scene.consequence.trim() !== scene.visibleSituation.trim() ? [scene.consequence] : []),
        ...((!isEduTwin || isTerminal) && scene.reveal?.trim() ? [scene.reveal.trim()] : []),
      ],
      world: scene.world,
      stage: scene.stage as ExperienceStage | undefined,
      feedbackCategory:
        scene.kind === "TRANSFER" ? "TRANSFER_SUCCESSFUL" :
        interaction === "choice" ? "ALTERNATIVE_PLAUSIBLE" :
        index === 0 ? "EVIDENCE_INCOMPLETE" :
        "EVIDENCE_SUPPORTED",
      terminal: isTerminal || undefined,
      transitions,
    } satisfies ExperienceDefinition["graph"]["nodes"][number];
  });

  return {
    schemaVersion: "atlas.experience/v1",
    experienceId: `studio-preview-${snapshot.pathwayId}`,
    version: snapshot.version,
    mode: "PATHWAY",
    kernelRef: `studio-atlas:${snapshot.packageDigest.slice(0, 16)}`,
    qualificationProfileId: "STUDIO_ATLAS_PREVIEW_V0",
    runtime: {
      statePolicy: "VOLATILE_MEMORY",
      learnerIdentityRequired: false,
      telemetryAllowed: false,
    },
    presentationGrammarIds: ["studio-atlas-preview"],
    graph: {
      entryNodeId: nodes[0].id,
      nodes,
    },
  };
}
