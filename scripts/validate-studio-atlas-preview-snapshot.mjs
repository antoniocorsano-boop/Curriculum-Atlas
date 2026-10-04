#!/usr/bin/env node
import fs from "node:fs";

const [file, mode = "valid"] = process.argv.slice(2);
if (!file) {
  console.error("usage: validate-studio-atlas-preview-snapshot.mjs <file> [valid|invalid]");
  process.exit(2);
}

function validate(snapshot) {
  const errors = [];
  if (snapshot?.schemaVersion !== "studio-atlas.preview-snapshot/v0.1") errors.push("schemaVersion");
  if (!snapshot?.snapshotId?.trim()) errors.push("snapshotId");
  if (!snapshot?.pathwayId?.trim()) errors.push("pathwayId");
  if (!snapshot?.version?.trim()) errors.push("version");
  if (!snapshot?.title?.trim()) errors.push("title");
  if (!snapshot?.description?.trim()) errors.push("description");
  if (!/^[0-9a-f]{64}$/.test(snapshot?.packageDigest ?? "")) errors.push("packageDigest");
  if (snapshot?.runtimeAuthorized !== false) errors.push("runtimeAuthorized");
  if (snapshot?.studentAuthorized !== false) errors.push("studentAuthorized");

  const scenes = Array.isArray(snapshot?.scenes) ? snapshot.scenes : [];
  if (scenes.length === 0) errors.push("scenes");

  const ids = new Set();
  let transfers = 0;
  for (const [sceneIndex, scene] of scenes.entries()) {
    if (!scene?.sceneId?.trim()) errors.push("sceneId");
    else if (ids.has(scene.sceneId)) errors.push("duplicateScene");
    else ids.add(scene.sceneId);
    if (!["SCENE", "TRANSFER"].includes(scene?.kind)) errors.push("sceneKind");
    if (scene?.kind === "TRANSFER") transfers += 1;
    for (const key of ["title", "visibleSituation", "learnerAction", "consequence"]) {
      if (!scene?.[key]?.trim()) errors.push(`${key}:${scene?.sceneId ?? "unknown"}`);
    }

    const interaction = scene?.interaction ?? "SUMMARY";
    if (!["SUMMARY", "CHOICE"].includes(interaction)) errors.push(`interaction:${scene?.sceneId ?? "unknown"}`);
    if (interaction === "CHOICE") {
      const choices = Array.isArray(scene?.choices) ? scene.choices : [];
      if (choices.length < 2) errors.push(`choices:${scene?.sceneId ?? "unknown"}`);
      for (const choice of choices) {
        if (!choice?.choiceId?.trim()) errors.push(`choiceId:${scene?.sceneId ?? "unknown"}`);
        if (!choice?.label?.trim()) errors.push(`choiceLabel:${scene?.sceneId ?? "unknown"}`);
        if (!choice?.feedback?.trim()) errors.push(`choiceFeedback:${scene?.sceneId ?? "unknown"}`);
      }
      if (sceneIndex === scenes.length - 1) errors.push(`terminalChoice:${scene?.sceneId ?? "unknown"}`);
    }
  }
  if (transfers === 0) errors.push("transferRequired");
  return errors;
}

const snapshot = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = validate(snapshot);
const valid = errors.length === 0;

if (mode === "invalid") {
  if (valid) {
    console.error("expected invalid snapshot");
    process.exit(1);
  }
  console.log("Studio Atlas preview invalid fixture rejected:", errors.join(", "));
  process.exit(0);
}

if (!valid) {
  console.error("Studio Atlas preview snapshot invalid:", errors.join(", "));
  process.exit(1);
}
console.log("Studio Atlas preview snapshot PASS");
