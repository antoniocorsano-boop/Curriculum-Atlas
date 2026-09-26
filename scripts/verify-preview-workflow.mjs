import fs from "node:fs";

const path = ".github/workflows/atlas-pr-preview-build.yml";
const source = fs.readFileSync(path, "utf8");

const required = [
  "permissions:\n  contents: read",
  "persist-credentials: false",
  "ref: ${{ inputs.exact_head }}",
  "Upload immutable preview candidate",
  "retention-days: 7",
  'ATLAS_GITHUB_PAGES: "true"',
];

for (const token of required) {
  if (!source.includes(token)) throw new Error(`Preview workflow missing required invariant: ${token}`);
}

const forbidden = [
  "pages: write",
  "id-token: write",
  "actions/deploy-pages",
  "environment: github-pages",
  "environment:\n      name: github-pages",
];

for (const token of forbidden) {
  if (source.includes(token)) throw new Error(`Preview workflow violates production isolation: ${token}`);
}

console.log("Atlas PR Preview workflow isolation: PASS");
