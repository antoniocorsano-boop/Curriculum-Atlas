// Tests actual Next.js P3B private feature, not only an isolated HTML viewer.
// No student data, publishing, login, external navigation or commercial APIs.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const base = process.env.ATLAS_P3B_NEXT_URL || "http://127.0.0.1:3000/gateway/p3b/";
const out = resolve(process.env.ATLAS_P3B_NEXT_EVIDENCE || ".atlas-p3b-next-evidence");
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: [
  "--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader",
  "--disable-gpu-sandbox", "--enable-unsafe-swiftshader"
] });
const results = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 760 }, reducedMotion: "no-preference"
  });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const response = await page.goto(base, { waitUntil: "domcontentloaded", timeout: 120000 });
  if (response?.status() !== 200) throw Error("Private Next route did not return 200");
  await page.locator("h1").waitFor();
  const links = await page.locator("nav[aria-label='Quattro destinazioni effettive di Atlas'] a").evaluateAll(nodes =>
    nodes.map(n => ({ id: n.getAttribute("data-p3b-link"), href: n.getAttribute("href") })));
  const expected = ["curricolo", "esplora", "percorsi", "esperienze"];
  if (links.length !== 4 || links.some((x, i) => x.id !== expected[i] || x.href !== "/" + x.id + "/")) {
    throw Error("Four actual Next.js fallback links missing: " + JSON.stringify(links));
  }
  const iframe = page.locator("iframe[title='Atrio Atlas 3D autentico con quattro portali']");
  await iframe.waitFor({ timeout: 45000 });
  await page.waitForFunction(() => {
    const frame = document.querySelector("iframe[title='Atrio Atlas 3D autentico con quattro portali']");
    return !!frame?.contentWindow?.__ATLAS_P3B_PRIVATE_TEST__?.ready;
  }, { timeout: 90000 });
  const state = await iframe.evaluate(el => {
    const s = el.contentWindow.__ATLAS_P3B_PRIVATE_TEST__;
    return { ready: s.ready, error: s.error, portals: s.portalCount,
      camera: s.camera?.name, scene: !!s.scene, canvas: !!el.contentDocument?.querySelector("canvas"),
      intro: s.intro, glassRefined: s.glassRefined, lightRig: s.lightRig, art: s.art };
  });
  if (!state.ready || state.portals !== 4 || !state.camera?.includes("P3A") || !state.canvas || !state.scene) {
    throw Error("Real model in Next iframe not verified " + JSON.stringify(state));
  }
  if (state.art?.profile !== "p3b-pbr-sky-v2" || state.art.skyApplied !== 1
      || state.art.roofApplied !== 1 || state.art.floorApplied !== 1
      || state.art.materialFamilies < 5 || state.art.externalAssetsAdded
      || !state.art.sourceGlbPreserved || !state.art.sourceGeometryPreserved) {
    throw Error("P3B local artistic finishing contract failed: " + JSON.stringify(state.art));
  }
  if (!state.intro?.started || !state.intro.completed || state.intro.skipped
      || state.intro.finalPositionError > 1e-8 || state.intro.finalRotationError > 1e-8
      || state.glassRefined !== 4 || state.lightRig !== "cinematic-balanced-v1") {
    throw Error("Cinematic entrance did not finish on original GLB camera: " + JSON.stringify(state));
  }
  const dimensions = await iframe.evaluate(el => {
    const frame = el.getBoundingClientRect();
    const canvas = el.contentDocument?.querySelector("canvas")?.getBoundingClientRect();
    return { frameWidth: frame.width, frameHeight: frame.height,
      canvasWidth: canvas?.width ?? 0, canvasHeight: canvas?.height ?? 0 };
  });
  if (dimensions.frameWidth < 900 || dimensions.frameHeight < 350
      || dimensions.canvasHeight < 350 || dimensions.canvasWidth < 900) {
    throw Error("The embedded 3D atrium is visually compressed: " + JSON.stringify(dimensions));
  }
  await page.screenshot({ path: resolve(out, "p3b-next-desktop-before-click.png") });
  // Click the true Curricolo 3D glass mesh, not a link or a fake image hotspot.
  const click = await iframe.evaluate(el => {
    const win = el.contentWindow, s = win.__ATLAS_P3B_PRIVATE_TEST__;
    let pane = null;
    s.scene.traverse(obj => {
      if (obj.isMesh && obj.userData?.atlas_portal_id === "curricolo" && obj.userData?.atlas_hit_target) pane = obj;
    });
    if (!pane) return { error: "Curricolo 3D glass not found" };
    const rect = s.renderer.domElement.getBoundingClientRect();
    const projected = new win.THREE.Box3().setFromObject(pane).getCenter().project(s.camera);
    const x = rect.left + (projected.x + 1) * rect.width / 2;
    const y = rect.top + (1 - projected.y) * rect.height / 2;
    s.renderer.domElement.dispatchEvent(new win.PointerEvent("pointerup", {
      bubbles: true, pointerType: "mouse", button: 0, clientX: x, clientY: y
    }));
    return { x, y, target: "curricolo" };
  });
  if (click.error) throw Error(JSON.stringify(click));
  await page.waitForURL(/\/curricolo\/?$/, { timeout: 60000 });
  results.push({ scenario: "desktop-actual-next-3d-route", passed: true,
    model: state, dimensions, click, destination: new URL(page.url()).pathname, errors });
  if (errors.length) throw Error("Unexpected JS errors: " + errors.join("; "));
  await page.close();

  // Reduced-motion mode never needs GPU to access the real Atlas routes.
  const fallback = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, reducedMotion: "reduce"
  });
  const fallbackResp = await fallback.goto(base, { waitUntil: "domcontentloaded", timeout: 120000 });
  if (fallbackResp?.status() !== 200) throw Error("Private Next route absent in fallback mode");
  await fallback.locator("[data-p3b-link='esperienze']").waitFor();
  if (await fallback.locator("iframe").count()) throw Error("Reduced-motion fallback incorrectly loads WebGL");
  await fallback.screenshot({ path: resolve(out, "p3b-next-mobile-fallback.png"), fullPage: true });
  await fallback.locator("[data-p3b-link='esperienze']").click();
  await fallback.waitForURL(/\/esperienze\/?$/, { timeout: 60000 });
  results.push({ scenario: "mobile-reduced-motion-real-route", passed: true,
    destination: new URL(fallback.url()).pathname, framebufferDisabled: true });
  await fallback.close();
  const report = {
    schema: "atlas.p3b.next-private-integration/v1",
    real3DNavigationToExistingNextRoute: true,
    accessibleFourRouteFallback: true,
    reducedMotionDoesNotStartWebGL: true,
    publicPublicationAuthorized: false,
    realAndroidQualified: false,
    results
  };
  writeFileSync(resolve(out, "p3b-next-private-integration-report.json"), JSON.stringify(report, null, 2));
  console.log("ATLAS_P3B_NEXT_TRUE_3D_TO_FOUR_ROUTES_AND_FALLBACK_PASS", JSON.stringify(report));
} finally {
  await browser.close();
}
