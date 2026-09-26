import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseURL = process.env.G1_BASE_URL ?? "http://127.0.0.1:3000";
const route = `${baseURL}/percorsi/lab/pw-missing-information-01`;
const scenes = [
  "S1_ORIENT", "S2_MISSING_INFO", "S3_CHOOSE_PROCESS", "S4_CONSEQUENCE",
  "S5_REVISE", "S6_NAME_STRATEGY", "S7_CHANGED_CONTEXT", "S8_TRANSFER_PROBE",
  "S9_TRACE_CONTROL",
];
const viewports = {
  desktop: { width: 1440, height: 1000 },
  smartphone: { width: 390, height: 844 },
  reflow320: { width: 320, height: 800 },
};

await fs.mkdir("artifacts/g1-pathway", { recursive: true });
const browser = await chromium.launch({ headless: true });
const evidence = [];

try {
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    for (const condition of ["L", "N"]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const learnerWrites = [];
      const consoleErrors = [];
      const pageErrors = [];

      page.on("request", (request) => {
        const data = request.postData() ?? "";
        if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) || /S[1-9]_|keep-local|discard|resources|popular|evidence/.test(data)) {
          learnerWrites.push({ method: request.method(), url: request.url(), data });
        }
      });
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      page.on("pageerror", (error) => pageErrors.push(error.message));

      await page.goto(route, { waitUntil: "networkidle" });
      await page.getByRole("heading", { name: "Prima di decidere, cosa manca?" }).waitFor();
      if (condition === "N") await page.getByLabel("Narrativa").check();
      else await page.getByLabel("Letterale").check();

      // Semantica minima verificabile.
      if (await page.locator("fieldset").count() !== 1) throw new Error("Manca fieldset della condizione");
      if (await page.locator("progress").count() !== 1) throw new Error("Manca progress semantico");
      if (await page.locator('[aria-live="polite"]').count() !== 1) throw new Error("Manca regione aria-live");

      // Tastiera/focus: i controlli principali devono essere raggiungibili e avere un indicatore focus visibile.
      await page.keyboard.press("Tab");
      let focusableSeen = 0;
      for (let i = 0; i < 12; i += 1) {
        const active = page.locator(":focus");
        if (await active.count()) {
          const tag = await active.evaluate((el) => el.tagName);
          if (["INPUT", "BUTTON", "A"].includes(tag)) focusableSeen += 1;
          const outline = await active.evaluate((el) => {
            const s = getComputedStyle(el);
            return { width: s.outlineWidth, style: s.outlineStyle, shadow: s.boxShadow };
          });
          if (outline.style === "none" && outline.shadow === "none") throw new Error(`Focus non visibile su ${tag}`);
        }
        await page.keyboard.press("Tab");
      }
      if (focusableSeen < 3) throw new Error("Ordine focus non verificabile: pochi controlli raggiunti");

      // Reflow: nessun overflow orizzontale alla larghezza di prova.
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (overflow) throw new Error(`${condition}/${viewportName}: overflow orizzontale`);

      // Bersagli tattili: i pulsanti di scelta devono avere almeno 44px su un asse.
      const smallTargets = await page.locator(".pathwayScene__options button, .pathwayScene__actions button").evaluateAll((els) => els.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width < 44 || r.height < 44;
      }).map((el) => ({ text: el.textContent?.trim(), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })));
      if (smallTargets.length) throw new Error(`Bersagli tattili sotto 44x44: ${JSON.stringify(smallTargets)}`);

      for (let i = 0; i < scenes.length; i += 1) {
        const scene = scenes[i];
        const step = page.locator(".pathwayScene__step");
        if ((await step.textContent())?.trim() !== scene) throw new Error(`${condition}/${viewportName}: attesa ${scene}`);
        if ((await page.locator(".pathwayScene__options button").count()) < 1) throw new Error(`${scene}: nessuna scelta`);
        await page.locator(".pathwayScene__options button").first().click();
        await page.getByRole("heading", { name: "Che cosa possiamo osservare" }).waitFor();
        if (i < scenes.length - 1) await page.getByRole("button", { name: "Continua" }).click();
      }

      await page.screenshot({ path: `artifacts/g1-pathway/${condition}-${viewportName}-S9.png`, fullPage: true });

      // Stato volatile: un reload deve ripartire dalla prima scena senza conservare la scelta.
      await page.reload({ waitUntil: "networkidle" });
      if ((await page.locator(".pathwayScene__step").textContent())?.trim() !== "S1_ORIENT") throw new Error("Lo stato non è volatile dopo reload");
      const pressed = await page.locator('.pathwayScene__options button[aria-pressed="true"]').count();
      if (pressed !== 0) throw new Error("Una risposta è sopravvissuta al reload");

      // Privacy: nessuna risposta/identificatore deve produrre scritture o comparire in payload di rete.
      if (learnerWrites.length) throw new Error(`Traffico learner-sensitive rilevato: ${JSON.stringify(learnerWrites)}`);
      if (consoleErrors.length || pageErrors.length) throw new Error(`Errori runtime: ${JSON.stringify({ consoleErrors, pageErrors })}`);

      evidence.push({ condition, viewport: viewportName, scenes: scenes.length, learnerWrites: 0, runtimeErrors: 0, volatileState: true, semanticControls: true, keyboardFocus: true, horizontalOverflow: false, touchTargets44: true });
      await context.close();
    }
  }

  await fs.writeFile("artifacts/g1-pathway/evidence.json", JSON.stringify({ route, evidence, note: "Automated evidence supplements, but does not replace, human screen-reader and visual contrast review." }, null, 2));
  console.log(`G1 accessibility/privacy collaudo PASS: ${evidence.length} combinazioni, 9 scene ciascuna.`);
} finally {
  await browser.close();
}
