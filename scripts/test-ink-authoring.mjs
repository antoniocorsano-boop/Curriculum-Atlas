import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Compiler } = require("inkjs/full");
const source = new URL("../fixtures/experience-engine/authoring/museo-zero-prologue.ink", import.meta.url);
const output = new URL("../src/features/experiences/museo-zero-prologue.generated.json", import.meta.url);
const keys = ["image", "title", "speaker", "alt"];

function compilePrologue(text) {
  const story = new Compiler(text).Compile();
  const scenes = [];
  while (story.canContinue) {
    assert.ok(scenes.length < 100, "Prologue exceeds presentation limit");
    const line = story.Continue().trim();
    const tags = story.currentTags || [];
    if (!line && !tags.length) continue;
    assert.ok(line, "Empty narrative line");
    const fields = new Map();
    for (const tag of tags) {
      const split = tag.indexOf(":");
      assert.ok(split > 0, "Invalid presentation tag");
      const key = tag.slice(0, split).trim();
      const value = tag.slice(split + 1).trim();
      assert.ok(keys.includes(key) && !fields.has(key) && value, "Invalid or repeated presentation field");
      fields.set(key, value);
    }
    for (const key of keys) assert.ok(fields.has(key), "Missing presentation field: " + key);
    assert.match(fields.get("image"), /^[a-z0-9-]+$/);
    scenes.push({ image: fields.get("image"), title: fields.get("title"),
      speaker: fields.get("speaker"), text: line, alt: fields.get("alt") });
  }
  assert.equal(story.currentChoices.length, 0, "Branching choices belong to the Atlas graph, not this prologue");
  assert.ok(scenes.length > 0, "No presentation scenes");
  return scenes;
}

const scenes = compilePrologue(readFileSync(source, "utf8"));
assert.equal(scenes.length, 6);
assert.deepEqual(scenes.map(scene => scene.image), ["sala", "squadra", "omar", "teo", "regia", "lia"]);
assert.ok(scenes.at(-1).text.includes("mantenendo accessibile il nuovo ingresso"));
for (const scene of scenes) {
  assert.ok(readFileSync(new URL("../public/media/museo-zero/narrative-v1/" + scene.image + ".webp", import.meta.url)).length > 0);
}
assert.throws(() => compilePrologue("Testo senza metadati\n-> END\n"), /Missing presentation field/);
assert.throws(() => compilePrologue("Testo # image:sala # image:lia # title:Titolo # speaker:Lia # alt:Alt\n-> END\n"), /Invalid or repeated/);
assert.throws(() => compilePrologue("Testo # image:sala # title:Titolo # speaker:Lia # alt:Alt\n* [Scelta]\n    -> END\n"), /Branching choices/);
const generated = JSON.stringify(scenes, null, 2) + "\n";
if (process.argv.includes("--write")) {
  writeFileSync(output, generated);
  console.log("Ink authoring: generated review presentation");
} else {
  assert.equal(readFileSync(output, "utf8"), generated, "Ink source and review presentation drift; regenerate with pnpm generate:experience:ink");
  console.log("Ink authoring: compilation, six scenes, assets, negative cases and generated presentation verified");
}
