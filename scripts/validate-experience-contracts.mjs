import fs from "node:fs";
import { validateChallengeKernel, validateExperienceDefinition } from "./lib/experience-contracts.mjs";

const [kind, file] = process.argv.slice(2);
if (!kind || !file || !["kernel", "experience"].includes(kind)) {
  console.error("usage: node scripts/validate-experience-contracts.mjs <kernel|experience> <file.json>");
  process.exit(2);
}
const value = JSON.parse(fs.readFileSync(file, "utf8"));
const outcome = kind === "kernel" ? validateChallengeKernel(value) : validateExperienceDefinition(value);
if (!outcome.valid) {
  console.error(outcome.errors.join("\n"));
  process.exit(1);
}
console.log(`PASS ${kind} ${file}`);
