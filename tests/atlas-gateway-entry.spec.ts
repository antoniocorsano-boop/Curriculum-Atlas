import { test, expect } from "@playwright/test";

const routeMap = [
  ["curricolo", "/curricolo/"],
  ["esplora", "/esplora/"],
  ["percorsi", "/percorsi/"],
  ["esperienze", "/esperienze/"],
] as const;

test("Desktop: l'intera finestra è occupata dall'atrio e i portali sono navigabili", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const entry = page.locator("#atlas-entry-root");
  await expect(entry).toBeVisible();
  const box = await entry.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box!.width - 1440)).toBeLessThanOrEqual(1);
  expect(Math.abs(box!.height - 900)).toBeLessThanOrEqual(1);
  expect(await page.locator(".atlas-sidebar, .atlas-topbar, footer").count()).toBe(0);
  for (const [id, href] of routeMap) {
    await expect(page.locator('[data-portal="' + id + '"]')).toHaveAttribute("href", href);
    await expect(page.locator('[data-portal="' + id + '"]')).toBeVisible();
  }
  expect(await page.locator(".entry-logo-globe").count()).toBe(0);
  // The original art already contains branding on the convex podium and the CTA.
  await expect(page.locator('[class*="podiumScreen"], [class*="podiumEmblem"]')).toHaveCount(0);
  const approvedBrand = page.locator('img[src*="atlas-logo-approved-01.svg"]');
  await expect(approvedBrand).toBeVisible();
  await expect(approvedBrand).toHaveAttribute("alt", "ATLAS");
  await expect(approvedBrand).toHaveJSProperty("naturalWidth", 1312);
  const photo = page.locator('img[src*="plate-prova.jpg"]');
  await expect(photo).toBeVisible();
  expect(await photo.evaluate((e) => (e as HTMLImageElement).naturalWidth)).toBeGreaterThan(1000);
  await expect(page.getByRole("link", { name: /Entra in Atlas/i })).toHaveAttribute("href", "/esplora/");

  const portal = page.locator('[data-portal="esplora"]');
  const r = await portal.boundingBox();
  expect(r).not.toBeNull();
  await page.mouse.move(r!.x + r!.width * 0.77, r!.y + r!.height * 0.32);
  await expect.poll(() => portal.evaluate((el) => el.style.getPropertyValue("--tilt-y"))).not.toBe("");
  await page.mouse.move(6, 750);
  await expect.poll(() => portal.evaluate((el) => el.style.getPropertyValue("--tilt-y"))).toBe("");
  await page.screenshot({ path: testInfo.outputPath("desktop-entire-stage.png") });
});

test("Telefono verticale: atrio unitario 9:16 con quattro portali cliccabili sullo stesso piano", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("#atlas-entry-root")).toBeVisible();
  await expect(page.locator('img[src*="mobile-atrium-01.png"]')).toBeVisible();
  await expect(page.locator('img[src*="atlas-logo-approved-01.svg"]')).toBeVisible();
  const art = page.locator('img[src*="mobile-atrium-01.png"]');
  expect(await art.evaluate(e => (e as HTMLImageElement).naturalWidth)).toBe(948);
  await expect(page.locator('[data-portal="curricolo"]')).toBeHidden();
  const yCenters: number[] = [];
  for (const [id, href] of routeMap) {
    const el = page.locator('[data-mobile-portal="' + id + '"]');
    await expect(el).toBeVisible();
    await expect(el).toHaveAttribute("href", href);
    await expect(el).toHaveAttribute("aria-label", new RegExp("^" + id, "i"));
    // Portal visuals belong to the image; the hit area has no superimposed label.
    await expect(el).toBeEmpty();
    const box = await el.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(391);
    // The center of the interactive panel must resolve to the link itself.
    const exposed = await el.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === node;
    });
    expect(exposed).toBe(true);
    yCenters.push(box!.y + box!.height / 2);
  }
  // A single architectural row; the previous layout detached portals into a 2x2 grid.
  expect(Math.max(...yCenters) - Math.min(...yCenters)).toBeLessThan(42);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole("link", { name: /Entra in Atlas/i })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("phone-portrait-integrated-atrium.png") });
  await page.locator('[data-mobile-portal="curricolo"]').click();
  await expect(page).toHaveURL(/\/curricolo\/?$/);
  await expect(page.locator(".atlas-shell")).toBeVisible();
  await context.close();
});

test("Telefono ruotato: panorama completo e collegamenti interattivi", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator('img[src*="mobile-atrium-01.png"]')).toBeHidden();
  await expect(page.locator('img[src*="plate-prova.jpg"]')).toBeVisible();
  for (const [id, href] of routeMap) {
    const el = page.locator('[data-portal="' + id + '"]');
    await expect(el).toBeVisible();
    await expect(el).toHaveAttribute("href", href);
    const rect = await el.boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.width).toBeGreaterThanOrEqual(44);
  }
  const enter = page.getByRole("link", { name: /Entra in Atlas/i });
  await expect(enter).toBeVisible();
  const ctaBox = await enter.boundingBox();
  expect(ctaBox).not.toBeNull();
  expect(ctaBox!.y).toBeGreaterThanOrEqual(0);
  expect(ctaBox!.y + ctaBox!.height).toBeLessThanOrEqual(390);
  await page.screenshot({ path: testInfo.outputPath("phone-landscape-panorama.png") });
  await context.close();
});

test("Preferenza movimento ridotto: rotazione disattivata", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }, reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  const portal = page.locator('[data-portal="curricolo"]');
  await portal.hover();
  expect(await portal.evaluate((e) => getComputedStyle(e).transform)).toBe("none");
  await context.close();
});
