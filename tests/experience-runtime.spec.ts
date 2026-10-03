import { test, expect } from "@playwright/test";

test.describe("Experience Engine conformance", () => {
  test("supports keyboard flow, announced feedback and restart", async ({ page }) => {
    await page.goto("/experience-lab/conformance");
    await page.getByRole("heading", { name: "Experience Engine conformance" }).focus();
    await page.getByRole("button", { name: "Continua" }).press("Enter");
    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Trasferisci" })).toBeFocused();
    await page.getByRole("button", { name: "Ricomincia" }).click();
    await expect(page.getByRole("heading", { name: "Experience Engine conformance" })).toBeVisible();
  });

  test("recovers from corrupt local state", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("atlas:experience:conformance-smart", "{bad"));
    await page.goto("/experience-lab/conformance");
    await expect(page.getByRole("heading", { name: "Experience Engine conformance" })).toBeVisible();
  });

  test("does not emit learner network writes", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (["POST","PUT","PATCH","DELETE"].includes(request.method())) writes.push(request.method());
    });
    await page.goto("/experience-lab/conformance");
    await page.getByRole("button", { name: "Continua" }).click();
    expect(writes).toEqual([]);
  });

  test("reflows on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/experience-lab/conformance");
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(390);
  });
});


test.describe("PW-MISSING shared-engine conformance", () => {
  test("branches, revises, transfers and completes through ExperienceRuntime", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-missing-information-01");
    await expect(page.locator(".experience-runtime")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quale informazione manca?" })).toBeVisible();

    await page.getByRole("button", { name: "Fare una stima usando ciò che sappiamo" }).click();
    await expect(page.getByRole("status")).toContainText("Una stima può orientare");
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Hai lavorato con una stima" })).toBeFocused();

    await page.getByRole("button", { name: "Riconsiderare la scelta precedente" }).click();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Quale informazione manca?" })).toBeFocused();

    await page.getByRole("button", { name: "Cercare il dato sulla durata" }).click();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Hai cercato il dato mancante" })).toBeFocused();

    await page.getByRole("button", { name: "Posso confrontare le alternative con informazioni pertinenti" }).click();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Stessa strategia, nuovo contesto" })).toBeFocused();

    await page.getByRole("button", { name: "Il tempo di percorrenza" }).click();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Hai completato il percorso" })).toBeFocused();
  });

  test("preserves L and N presentation grammars on the shared runtime", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-missing-information-01");
    await expect(page.locator(".experience-runtime")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quale informazione manca?" })).toBeVisible();
    await page.getByRole("radio", { name: "Narrativo" }).check();
    await expect(page.getByRole("heading", { name: "Due materiali sul tavolo" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cercare quanto dura ciascun materiale" })).toBeVisible();
  });

  test("remains volatile and emits no learner network writes", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.method());
    });
    await page.goto("/percorsi/lab/pw-missing-information-01");
    await page.getByRole("button", { name: "Cercare il dato sulla durata" }).click();
    await page.getByRole("button", { name: "Continua" }).click();
    expect(writes).toEqual([]);
    const localKeys = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.includes("pw-missing-information-01")));
    expect(localKeys).toEqual([]);
  });
});
