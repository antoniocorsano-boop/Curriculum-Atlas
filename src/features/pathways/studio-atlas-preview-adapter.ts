import type { ExperienceDefinition } from "@/features/experiences/model";

export type StudioAtlasPreviewSceneKind = "SCENE" | "TRANSFER";

export interface StudioAtlasPreviewScene {
  sceneId: string;
  kind: StudioAtlasPreviewSceneKind;
  title: string;
  visibleSituation: string;
  learnerAction: string;
  consequence: string;
  reveal?: string;
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
  let transferCount = 0;
  for (const scene of scenes) {
    if (!scene?.sceneId?.trim()) errors.push("sceneId");
    else if (ids.has(scene.sceneId)) errors.push(`duplicateScene:${scene.sceneId}`);
    else ids.add(scene.sceneId);

    if (scene?.kind !== "SCENE" && scene?.kind !== "TRANSFER") errors.push(`sceneKind:${scene?.sceneId ?? "unknown"}`);
    if (scene?.kind === "TRANSFER") transferCount += 1;
    if (!scene?.title?.trim()) errors.push(`sceneTitle:${scene?.sceneId ?? "unknown"}`);
    if (!scene?.visibleSituation?.trim()) errors.push(`visibleSituation:${scene?.sceneId ?? "unknown"}`);
    if (!scene?.learnerAction?.trim()) errors.push(`learnerAction:${scene?.sceneId ?? "unknown"}`);
    if (!scene?.consequence?.trim()) errors.push(`consequence:${scene?.sceneId ?? "unknown"}`);
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

  const nodes = snapshot.scenes.map((scene, index) => {
    const next = snapshot.scenes[index + 1];
    const isTerminal = index === snapshot.scenes.length - 1;
    const primitive =
      scene.kind === "TRANSFER" ? "TRANSFER" :
      index === 0 ? "EXPLORE" :
      "INVESTIGATE";

    return {
      id: scene.sceneId,
      primitive,
      interaction: "summary",
      title: scene.title,
      prompt: scene.learnerAction,
      facts: [
        scene.visibleSituation,
        ...(scene.reveal?.trim() ? [scene.reveal.trim()] : []),
      ],
      feedbackCategory:
        scene.kind === "TRANSFER" ? "TRANSFER_SUCCESSFUL" :
        index === 0 ? "EVIDENCE_INCOMPLETE" :
        "EVIDENCE_SUPPORTED",
      terminal: isTerminal || undefined,
      transitions: isTerminal
        ? []
        : [{
            id: "continue",
            targetNodeId: next.sceneId,
            label: "Continua",
            feedback: scene.consequence,
          }],
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
