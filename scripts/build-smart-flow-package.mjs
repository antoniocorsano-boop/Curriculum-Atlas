import fs from "node:fs";
import { validateExperienceDefinition } from "./lib/experience-contracts.mjs";

const fail = (message) => { throw new Error(message); };

export function buildSmartFlowPackage({
  intent, plan, experience, materialSet,
  intentRef, planRef, experienceRef, materialSetRef,
  qualificationProfileId = "SMART_FAST_V1",
  qualifiedImplementation = false,
}) {
  if (intent?.schemaVersion !== "atlas.smart.intent/v1") fail("invalid SmartActivityIntent");
  if (plan?.schemaVersion !== "atlas.smart.plan/v1") fail("invalid SmartActivityPlan");
  if (materialSet?.schemaVersion !== "atlas.smart.materialset/v1") fail("invalid Smart MaterialSet");
  const activityId = intent.activityId;
  if (!activityId || plan.activityId !== activityId || experience?.experienceId !== activityId || materialSet.activityId !== activityId) fail("Smart flow activity identity mismatch");
  const experienceValidation = validateExperienceDefinition(experience);
  if (!experienceValidation.valid) fail(`invalid Smart ExperienceDefinition: ${experienceValidation.errors.join(", ")}`);

  const resources = Array.isArray(materialSet.resources) ? materialSet.resources : [];
  const required = resources.filter((resource) => resource.required === true);
  const f2Complete = resources.length > 0;
  const f3Complete = resources.every((resource) => typeof resource.kind === "string" && typeof resource.audience === "string" && Array.isArray(resource.materialSlotRoles) && resource.materialSlotRoles.length > 0);
  const f4Complete = required.length > 0 && required.every((resource) => /^sha256:[a-f0-9]{64}$/.test(resource.digest || "") && Number.isInteger(resource.byteSize) && resource.byteSize >= 0 && typeof resource.provenanceRef === "string" && resource.provenanceRef.length > 0);
  const f5Complete = materialSet.publication?.stage === "PUBLISHED" && materialSet.readiness?.packageReady === true && required.length > 0 && required.every((resource) => typeof resource.publicRef === "string" && resource.publicRef.length > 0 && typeof resource.publicationReceiptRef === "string" && resource.publicationReceiptRef.length > 0 && ((resource.audience !== "STUDENT" && resource.audience !== "BOTH") || resource.anonymousReachabilityVerified === true));
  const f9State = qualifiedImplementation ? "QUALIFIED_IMPLEMENTATION" : "PENDING_QUALIFICATION";
  let teacherStatus = "Pronto";
  if (!f2Complete || !f3Complete || !f4Complete) teacherStatus = "Da rivedere";
  else if (!f5Complete) teacherStatus = "Da completare";
  else if (!qualifiedImplementation) teacherStatus = "Da verificare";

  return {
    schemaVersion: "atlas.smart.flow-package/v1",
    activityId,
    intentRef, planRef, experienceRef, materialSetRef,
    qualificationProfileId,
    readinessAuthority: "MATERIAL_SET",
    runtime: { learnerIdentityRequired: false, telemetryAllowed: false },
    stages: {
      F0: { state: "COMPLETE" },
      F1: { state: "COMPLETE" },
      F2: { state: f2Complete ? "COMPLETE" : "INCOMPLETE" },
      F3: { state: f3Complete ? "COMPLETE" : "INCOMPLETE" },
      F4: { state: f4Complete ? "COMPLETE" : "INCOMPLETE" },
      F5: { state: f5Complete ? "COMPLETE" : "PENDING_CANONICAL_PUBLICATION" },
      F6: { state: f5Complete ? "COMPLETE" : "BLOCKED_BY_F5" },
      F7: { state: "COMPLETE" },
      F8: { state: materialSet.crossSystem?.runtimeAdapterAuthorized === true ? "COMPLETE" : "DEFERRED_NOT_AUTHORIZED" },
      F9: { state: f9State },
      F10: { state: "COMPLETE", teacherStatus },
    },
  };
}

const argv = process.argv.slice(2);
const value = (flag) => { const index = argv.indexOf(flag); return index >= 0 ? argv[index + 1] : undefined; };
if (import.meta.url === `file://${process.argv[1]}`) {
  const intentRef = value("--intent");
  const planRef = value("--plan");
  const experienceRef = value("--experience");
  const materialSetRef = value("--material-set");
  const out = value("--out");
  if (!intentRef || !planRef || !experienceRef || !materialSetRef || !out) {
    console.error("usage: node scripts/build-smart-flow-package.mjs --intent <file> --plan <file> --experience <file> --material-set <file> --out <file> [--qualified-implementation]");
    process.exit(2);
  }
  const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
  const result = buildSmartFlowPackage({
    intent: readJson(intentRef), plan: readJson(planRef), experience: readJson(experienceRef), materialSet: readJson(materialSetRef),
    intentRef, planRef, experienceRef, materialSetRef,
    qualifiedImplementation: argv.includes("--qualified-implementation"),
  });
  fs.writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
  console.log(`BUILT Smart flow ${result.activityId}: ${result.stages.F10.teacherStatus}`);
}
