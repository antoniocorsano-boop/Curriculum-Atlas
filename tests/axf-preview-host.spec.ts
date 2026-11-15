import { test, expect } from "@playwright/test";

const path = "/experience-lab/axf-host-ci";
const first = "#axf/studio-preview-fixture-studio-pathway-01";
const second = "#axf/studio-preview-fixture-edutwin-orientation";

test("AXF host mounts the real engine and preserves authored choice semantics", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", request => { if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.method()); });
  await page.goto(path);
  await expect(page.getByRole("heading", { name: "Esplora Atlas" })).toBeVisible();
  await expect(page.getByText("SYNTHETIC_DENIED")).toHaveCount(0);
  await page.getByRole("searchbox").fill("sistema");
  await page.getByRole("link", { name: /La scelta che cambia il sistema/ }).click();
  await expect(page).toHaveURL(new RegExp(first + "$"));
  await expect(page.locator(".experience-runtime")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qualcosa non torna" })).toBeVisible();
  await page.getByRole("button", { name: "Continua" }).click();
  await expect(page.getByRole("heading", { name: "Prova una modifica" })).toBeVisible();
  await page.getByRole("radio", { name: "Cambio la relazione e verifico l’esito" }).check();
  await page.getByRole("button", { name: "Continua" }).click();
  await expect(page.getByRole("heading", { name: "Un sistema diverso" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("searchbox")).toHaveValue("sistema");
  await page.goForward();
  await expect(page.getByRole("heading", { name: "Qualcosa non torna" })).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith("atlas:experience:")))).toEqual([]);
  expect(writes).toEqual([]);
});

test("AXF host handles direct links, invalid previews, reload and mobile reflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(path + second);
  await expect(page.getByRole("heading", { name: "Prima della visita" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Prima della visita" })).toBeVisible();
  await page.getByRole("link", { name: "Atlante", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Esplora Atlas" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.goto(path + "#axf/studio-preview-denied");
  await expect(page.getByRole("heading", { name: "Esplora Atlas" })).toBeVisible();
  await expect(page).toHaveURL(/#axf$/);
  await page.getByRole("searchbox").fill("xxxxxxxx");
  await expect(page.getByRole("status")).toHaveText("Nessuna esperienza disponibile.");
});


test("G2 presentation keeps nine worlds, four sections, direct search and denies untrusted artwork", async ({ page }) => {
  const external: string[] = [];
  page.on("request", request => { if (request.url().includes("invalid.example")) external.push(request.url()); });
  await page.goto(path);
  const worlds = page.getByRole("navigation", { name: "Mondi della conoscenza" });
  await expect(worlds.getByRole("button")).toHaveCount(9);
  await expect(page.getByRole("button", { name: "Storie", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Laboratori", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Scoperte", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Percorsi", exact: true })).toBeVisible();
  await worlds.getByRole("button", { name: "Tecnologia" }).click();
  await expect(page.getByRole("status")).toHaveText("1 esperienza disponibile.");
  await expect(page.getByRole("link", { name: /La scelta che cambia il sistema/ })).toBeVisible();
  await page.getByRole("button", { name: "Storie", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Nessuna esperienza disponibile.");
  await page.getByRole("button", { name: "Azzera filtri" }).click();
  await expect(page.getByRole("status")).toHaveText("2 esperienze disponibili.");
  await worlds.getByRole("button", { name: "Energia" }).click();
  await expect(page.getByRole("status")).toHaveText("Nessuna esperienza disponibile.");
  await expect(page.getByText("SYNTHETIC_DENIED")).toHaveCount(0);
  expect(external).toEqual([]);
  expect(await page.locator("[data-world=energia] .axfPreviewHost__sphere").evaluate(el => getComputedStyle(el).backgroundImage)).toContain("data:image/webp;base64,UklGR");
  expect(await page.locator(".axfPreviewHost__library").evaluate(el => getComputedStyle(el).getPropertyValue("--axf-landscape"))).toBe("");
  for (const width of [320, 390, 844, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const button of await worlds.getByRole("button").all()) {
      const bounds = await button.boundingBox();
      expect(bounds?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(bounds?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  }
});
