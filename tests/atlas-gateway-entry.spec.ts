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

test("Telefono: quattro accessi visibili e nessuna navigazione estranea", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("#atlas-entry-root")).toBeVisible();
  for (const [id] of routeMap) {
    const el = page.locator('[data-portal="' + id + '"]');
    const box = await el.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(391);
  }
  const cta = page.getByRole("link", { name: /Entra in Atlas/i });
  await expect(cta).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("phone-entire-stage.png") });
  await cta.click();
  await expect(page).toHaveURL(/\/esplora\/?$/);
  await expect(page.locator(".atlas-shell")).toBeVisible();
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
