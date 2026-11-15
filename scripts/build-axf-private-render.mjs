import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
const exactHead = "118e994deaba5bc6bf836e12130160bbba41ce97";
const actual = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
if (actual !== exactHead) throw new Error("exact source head required");
const temp = ".axf-private-review-entry.tsx";
const tempCss = ".axf-private-review-globals.css";
if (fs.existsSync(temp) || fs.existsSync(tempCss)) throw new Error("temporary entry already exists");
const out = path.resolve(process.argv[2] ?? "../axf-review");
fs.mkdirSync(out, { recursive: true });
const entry = `import { createRoot } from "react-dom/client";
import { AtlasPreviewHost, type AtlasPreviewPlacement, type AtlasPreviewArtwork } from "./src/features/experiences/atlas-preview-host";
import minimal from "./fixtures/studio-atlas-preview/valid/minimal.json";
import orientation from "./fixtures/studio-atlas-preview/valid/edutwin-orientation.json";
import "./.axf-private-review-globals.css";
const snapshots = [minimal, orientation, { ...minimal, pathwayId: "denied", title: "SYNTHETIC_DENIED", studentAuthorized: true }];
const placements: Record<string, AtlasPreviewPlacement> = {
  "studio-preview-fixture-studio-pathway-01": { world: "tecnologia", section: "Percorsi" },
  "studio-preview-fixture-edutwin-orientation": { world: "lettura", section: "Percorsi" },
};
const root = createRoot(document.getElementById("root")!);
const mount = (artwork?: AtlasPreviewArtwork) => root.render(<AtlasPreviewHost snapshots={snapshots} placements={placements} artwork={artwork} />);
mount();
const input = document.getElementById("artwork") as HTMLInputElement;
const status = document.getElementById("art-status")!;
input.addEventListener("change", async () => {
  try {
    const file = input.files?.[0];
    if (!file || file.size > 2000000) throw Error("Invalid private artwork package");
    const value = JSON.parse(await file.text());
    const expected = ["energia","storia","ambiente","scienze","tecnologia","lettura","arte","agricoltura","materiali"];
    if (!value || Object.keys(value).sort().join(",") !== "landscape,portrait,worlds" || Object.keys(value.worlds).sort().join(",") !== [...expected].sort().join(",")) throw Error("Invalid artwork keys");
    const valid = (v: unknown) => typeof v === "string" && v.length <= 800000 && /^data:image\\/webp;base64,UklGR[A-Za-z0-9+/]+={0,2}$/.test(v);
    if (![value.landscape,value.portrait,...expected.map(id=>value.worlds[id])].every(valid)) throw Error("Invalid inline WebP");
    mount(value); status.textContent = "11 immagini private caricate localmente";
  } catch { mount(); status.textContent = "Pacchetto non valido: nessuna immagine privata caricata"; }
});
`;
try {
  const require = createRequire(path.join(process.cwd(),"package.json"));
  const tailwind = require("@tailwindcss/postcss");
  const postcss = createRequire(require.resolve("@tailwindcss/postcss"))("postcss");
  const globalsPath = path.resolve("src/app/globals.css");
  const globals = await postcss([tailwind({base:process.cwd(),optimize:false})]).process(fs.readFileSync(globalsPath,"utf8"),{from:globalsPath,to:path.resolve(tempCss)});
  fs.writeFileSync(tempCss,globals.css,{flag:"wx"});
  fs.writeFileSync(temp, entry, { flag: "wx" });
  const build = spawnSync("pnpm", ["dlx", "esbuild@0.25.5", temp, "--bundle", "--jsx=automatic", "--platform=browser", "--format=iife", '--define:process.env.NODE_ENV="production"', "--minify", "--outfile="+path.join(out,"atlas.js")], {stdio:"inherit"});
  if (build.status !== 0) throw Error("bundle failed");
  const js = fs.readFileSync(path.join(out,"atlas.js"),"utf8");
  const css = fs.readFileSync(path.join(out,"atlas.css"),"utf8");
  const safeJs = js.replace(/<\/script/gi,"<\\/script");
  const safeCss = css.replace(/<\/style/gi,"<\\/style");
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src data:; form-action 'none'; base-uri 'none'"><meta name="robots" content="noindex,nofollow"><title>Atlas · revisione privata G2</title><style>${safeCss}</style></head><body><aside style="padding:12px;background:#fff;color:#12213b"><label for="artwork">Carica assets.private.json (solo sul dispositivo)</label> <input type="file" id="artwork" accept=".json,application/json"><p id="art-status" aria-live="polite">Nessuna immagine privata caricata</p></aside><div id="root"></div><script>${safeJs}</script></body></html>`;
  fs.writeFileSync(path.join(out,"Atlas-G2-review.html"),html);
  const sha = name => createHash("sha256").update(fs.readFileSync(path.join(out,name))).digest("hex");
  const manifest = {sourceHead:exactHead,studentAuthorized:false,runtimeAuthorized:false,privateArtworkIncluded:false,bundler:"esbuild@0.25.5",assets:{html:sha("Atlas-G2-review.html"),js:sha("atlas.js"),css:sha("atlas.css")}};
  fs.writeFileSync(path.join(out,"receipt.json"),JSON.stringify(manifest,null,2)+"\n");
  console.log(JSON.stringify(manifest));
} finally { fs.rmSync(temp,{force:true}); fs.rmSync(tempCss,{force:true}); }
