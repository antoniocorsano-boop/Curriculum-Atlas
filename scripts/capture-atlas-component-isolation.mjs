import assert from "node:assert/strict";
import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const siteDir = path.resolve(process.env.ATLAS_ISOLATION_SITE || "artifacts/atlas-component-isolation/site");
const outDir = path.resolve(process.env.ATLAS_ISOLATION_OUT || "artifacts/atlas-component-isolation/evidence");
const port = Number(process.env.ATLAS_ISOLATION_PORT || 4178);
const exactHead = process.env.ATLAS_EXACT_HEAD || null;
const runId = process.env.ATLAS_RUN_ID || null;
const dependencyGraphFile = path.join(outDir, "resolved-dependencies.json");

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
]);

function resolveRequest(requestUrl) {
  const url = new URL(requestUrl || "/", `http://127.0.0.1:${port}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const candidate = path.resolve(siteDir, `.${pathname}`);
  if (candidate !== siteDir && !candidate.startsWith(siteDir + path.sep)) return null;
  return candidate;
}

const server = createServer(async (req, res) => {
  try {
    const file = resolveRequest(req.url);
    if (!file) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const body = await fs.readFile(file);
    res.writeHead(200, {
      "Content-Type": mime.get(path.extname(file)) || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
});

async function startServer() {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
}

async function closeServer() {
  if (!server.listening) return;
  await new Promise((resolve) => server.close(resolve));
}

async function viewportState(page) {
  return page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    activeTarget: document.documentElement.dataset.atlasIsolationTarget || null,
  }));
}

async function verifyRelationExplorer(page) {
  await page.locator(".atlas-explore").waitFor();
  await page.getByRole("region", { name: "Mappa relazionale del curricolo" }).waitFor();
  await page.getByRole("button", { name: "Elenco" }).click();
  await page.locator(".atlas-equivalent-outline").waitFor();
  const outlineButtons = page.locator(".atlas-equivalent-outline button");
  const selectableNodes = await outlineButtons.count();
  assert.ok(selectableNodes > 1, "RelationExplorer isolated outline must expose more than the initially selected institution node");
  const alternateNode = outlineButtons.nth(1);
  const alternateLabel = (await alternateNode.locator("strong").innerText()).trim();
  await alternateNode.click();
  await alternateNode.waitFor();
  assert.equal(await alternateNode.getAttribute("aria-current"), "true", "Selecting an alternate node must update aria-current");
  const selectedHeading = (await page.locator(".atlas-explore-context h2").innerText()).trim();
  assert.equal(selectedHeading, alternateLabel, "Selecting an alternate node must update the context panel");
  await page.getByRole("button", { name: "Mappa" }).click();
  await page.getByLabel("Mappa relazionale interattiva del curricolo").waitFor();
  return {
    map: true,
    equivalentOutline: true,
    selectableNodes,
    alternateSelectionVerified: true,
  };
}

async function verifyCurriculumTree(page) {
  await page.locator(".atlas-curriculum-tree").waitFor();
  const details = page.locator(".atlas-tree-year");
  const count = await details.count();
  assert.ok(count > 0, "CurriculumTree isolated host must render disclosure groups");

  const first = details.first();
  assert.equal(await first.evaluate((node) => node.hasAttribute("open")), true, "First disclosure should begin open");
  await first.locator("summary").click();
  assert.equal(await first.evaluate((node) => node.hasAttribute("open")), false, "Native disclosure must close");
  await first.locator("summary").click();
  assert.equal(await first.evaluate((node) => node.hasAttribute("open")), true, "Native disclosure must reopen");

  const stage = page.getByLabel("Ordine di scuola");
  await stage.selectOption({ label: "Primaria" });
  const filteredGroups = page.locator(".atlas-tree-year");
  const filteredCount = await filteredGroups.count();
  assert.ok(filteredCount > 0, "Stage filtering must retain matching disclosure groups");
  assert.ok(filteredCount < count, "Stage filtering must reduce the initially rendered disclosure groups");
  const filteredLabels = await filteredGroups.locator("summary strong").allInnerTexts();
  assert.ok(filteredLabels.every(label => label.trim().startsWith("Primaria ·")), "Every filtered disclosure group must belong to Primaria");

  return {
    nativeDisclosure: true,
    initialGroups: count,
    stageFilter: "Primaria",
    filteredGroups: filteredCount,
    stageFilterVerified: true,
  };
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  await startServer();

  let browser = null;
  try {
    browser = await chromium.launch({ headless: true });

    const dependencyGraph = await fs.readFile(dependencyGraphFile);
    const dependencyGraphSha256 = "sha256:" + createHash("sha256").update(dependencyGraph).digest("hex");

    const evidence = {
      schemaVersion: "trama.atlas.component-isolation-evidence/v1",
      exactHead,
      runId,
      generatedAt: new Date().toISOString(),
      runtimeSurfaceChanged: false,
      productDependencyAdded: false,
      dependencyGraph: {
        ref: "resolved-dependencies.json",
        sha256: dependencyGraphSha256,
      },
      targets: [],
      status: "PASS",
    };

    const viewports = [
      { label: "mobile-390", width: 390, height: 844 },
      { label: "desktop-1280", width: 1280, height: 900 },
    ];

    for (const target of [
      { id: "ATLAS.RELATION_EXPLORER.FAMILY", query: "relation-explorer", verify: verifyRelationExplorer },
      { id: "ATLAS.CURRICULUM_TREE.DISCLOSURE", query: "curriculum-tree", verify: verifyCurriculumTree },
    ]) {
      const observations = [];

      for (const viewport of viewports) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          serviceWorkers: "block",
        });
        const page = await context.newPage();
        const diagnostics = [];
        page.on("pageerror", (error) => diagnostics.push({ type: "pageerror", message: error.message, stack: error.stack || null }));
        page.on("console", (message) => {
          if (["error", "warning"].includes(message.type())) {
            diagnostics.push({ type: "console", level: message.type(), message: message.text() });
          }
        });
        page.on("requestfailed", (request) => diagnostics.push({
          type: "requestfailed",
          url: request.url(),
          error: request.failure()?.errorText || null,
        }));

        await page.goto(`http://127.0.0.1:${port}/?target=${target.query}`, { waitUntil: "networkidle" });
        try {
          await page.locator('html[data-atlas-isolation-ready="true"]').waitFor({ timeout: 8000 });
        } catch (error) {
          const bodyText = await page.locator("body").innerText().catch(() => "");
          throw new Error(
            `ATLAS_ISOLATION_NOT_READY target=${target.query} viewport=${viewport.label} diagnostics=${JSON.stringify(diagnostics)} body=${bodyText.slice(0, 500)} cause=${error.message}`
          );
        }

        const checks = await target.verify(page);
        await page.waitForTimeout(50);
        assert.deepEqual(diagnostics, [], `Browser diagnostics must remain empty for isolated ${target.query} at ${viewport.label}: ${JSON.stringify(diagnostics)}`);
        const layout = await viewportState(page);
        assert.equal(layout.activeTarget, target.query);
        assert.ok(
          layout.scrollWidth <= layout.clientWidth + 1,
          `Horizontal overflow in isolated ${target.query} at ${viewport.label}: ${layout.scrollWidth} > ${layout.clientWidth}`
        );

        const screenshot = path.join(outDir, `${target.query}-${viewport.label}.png`);
        await page.screenshot({ path: screenshot, fullPage: true });

        observations.push({
          viewport: { width: viewport.width, height: viewport.height },
          noHorizontalOverflow: true,
          checks,
          screenshot: path.relative(outDir, screenshot).split(path.sep).join("/"),
          status: "PASS",
        });

        await context.close();
      }

      evidence.targets.push({
        componentId: target.id,
        evidenceType: "ISOLATED",
        host: "test-infrastructure/atlas-component-isolation",
        observations,
        status: "PASS",
      });
    }

    await fs.writeFile(path.join(outDir, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n", "utf8");
    process.stdout.write("TRAMA_ATLAS_COMPONENT_ISOLATION_R1_PASS\n");
  } finally {
    if (browser) await browser.close();
    await closeServer();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
