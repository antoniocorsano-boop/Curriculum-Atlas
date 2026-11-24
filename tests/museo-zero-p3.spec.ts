import { test, expect, type Page } from "@playwright/test";

const LAB = "/experience-lab/museo-zero/";

async function finishOpening(page: Page) {
  for (let i=0; i<3; i++) await page.getByRole("button", { name: "Passo successivo" }).click();
  await expect(page.getByTestId("mz1-stage")).toHaveAttribute("data-state","3");
}

async function collectEvidence(page: Page) {
  await finishOpening(page);
  await page.getByRole("button", { name: "Continua", exact: true }).click();
  await expect(page.locator('[data-node="MZ2_RECONSTRUCT_DAY"]')).toBeVisible();
  const room = page.locator(".experience-runtime--cinematic");
  await room.getByRole("button", { name: /Percorso invertito/ }).click();
  await room.getByRole("button", { name: "Porta sul banco" }).first().click();
  await room.getByRole("button", { name: /Sala Zero.*Proiezione/i }).click();
  await room.getByRole("button", { name: /Sensor B spostato/ }).click();
  await room.getByRole("button", { name: "Porta sul banco" }).first().click();
  await room.getByRole("button", { name: /Cabina regia/i }).click();
  await room.getByRole("button", { name: /Mappatura cue attiva/ }).click();
  await room.getByRole("button", { name: "Porta sul banco" }).first().click();
  await expect(room.getByText("3 indizi sul banco")).toBeVisible();
}

test.describe("P3 — MUSEO ZERO · review-only canonical derivative", () => {
  test("is exclusively a non-authorized, noindex professional review, not a public portal card", async ({ page }) => {
    const response = await page.goto(LAB);
    expect(response?.status()).toBe(200);
    await expect(page.getByTestId("museo-zero-p3-review")).toHaveAttribute("data-student-authorized", "false");
    await expect(page.getByTestId("museo-zero-p3-review")).toHaveAttribute("data-runtime-authorized", "false");
    await expect(page.getByText(/Solo revisione professionale/)).toBeVisible();
    await expect(page.getByText(/Revisione prodotto: REVISE|controllo umano del prodotto è ancora REVISE/)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('[data-node="MZ1_FAILED_REHEARSAL"]')).toBeVisible();
    await page.goto("/esperienze/");
    await expect(page.locator('a[href*="museo-zero"]')).toHaveCount(0);
    await page.goto("/percorsi/");
    await expect(page.locator('a[href*="museo-zero"]')).toHaveCount(0);
  });

  test("first failed rehearsal shows observable delayed room, not just status cards", async ({ page }) => {
    await page.goto(LAB);
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-outcome", "delayed");
    const stage = page.getByTestId("mz1-stage");
    await expect(stage).toHaveAttribute("data-state","0");
    await expect.poll(() => stage.locator("img").evaluateAll(imgs => imgs.every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await expect(page.getByRole("button", {name:"Continua",exact:true})).toHaveCount(0);
    await page.getByRole("button", {name:"Passo successivo"}).click();
    await expect(stage).toHaveAttribute("data-state","1");
    await expect(stage.locator(".mz-opening__projection")).toHaveCSS("opacity","0");
    await page.getByRole("button", {name:"Passo successivo"}).click();
    await expect(page.getByTestId("museo-risposta-sala")).toContainText("parete rimane spenta");
    await page.getByRole("button", {name:"Passo successivo"}).click();
    await expect(stage.locator(".mz-opening__projection")).toHaveCSS("opacity","1");
    await expect(stage.getByRole("button")).toHaveCount(3);
    await stage.getByRole("button",{name:"Esamina: Sensore B"}).click();
    await expect(page.getByRole("heading",{name:"Sensore B"})).toBeVisible();
    await page.getByRole("button",{name:"Ricomincia prova"}).click();
    await expect(stage).toHaveAttribute("data-state","0");
  });

  test("investigation can be followed in non-fixed order, with evidence pinned and timeline reordered", async ({ page }) => {
    await page.goto(LAB);
    await collectEvidence(page);
    const decision = page.locator(".experience-decision");
    const choices = decision.getByRole("button", { name: /Metto in fila|Collego subito/ });
    await expect(choices.first()).toBeDisabled();
    await page.getByRole("button", { name: "Metti in fila" }).click();
    await expect(choices.first()).toBeEnabled();
    await expect(page.getByTestId("museo-cronologia")).toBeVisible();
    await expect(page.getByTestId("museo-cronologia").getByRole("listitem")).toHaveCount(3);
    await page.getByRole("button", { name: "Sposta prima: Sensor B spostato" }).click();
    const texts = await page.getByTestId("museo-cronologia").getByRole("listitem").locator("strong").allTextContents();
    expect(texts[0]).toBe("Sensor B spostato");
    await decision.getByRole("button", { name: "Continua" }).click();
    await expect(page.locator('[data-node="MZ3_TIMELINE_LIMIT"]')).toBeVisible();
    await page.getByRole("button", { name: "Collega", exact: true }).click();
    await expect(page.getByTestId("museo-relazioni")).toBeVisible();
    await page.getByTestId("museo-relazioni").getByRole("button", { name: "Collega" }).first().click();
    await page.getByTestId("museo-relazioni").getByRole("button", { name: "Collega" }).last().click();
    await expect(page.getByText("Le relazioni che stai costruendo")).toBeVisible();
    await expect(page.locator(".museo-bench__connections p").first()).toContainText("→");
  });

  test("simulated sensor mapping visibly changes room and preserves authored branched route", async ({ page }) => {
    await page.goto(LAB);
    await collectEvidence(page);
    await page.getByRole("button", { name: "Collega", exact: true }).click();
    await page.locator(".experience-decision").getByRole("button", { name: "Continua" }).click();
    await expect(page.locator('[data-node="MZ4_TEST_MAPPING"]')).toBeVisible();
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-outcome", "delayed");
    await page.getByRole("button", { name: "Provo il trigger su Sensor B" }).click();
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-outcome", "stable");
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-after-choice", "true");
    await expect(page.getByTestId("museo-risposta-sala")).toContainText("parete si illumina");
    await page.getByRole("button", { name: "Provo un cue manuale" }).click();
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-outcome", "manual");
    await page.getByRole("button", { name: "Provo il trigger su Sensor B" }).click();
    await page.getByRole("button", { name: "Continua dalla conseguenza" }).click();
    await expect(page.locator('[data-node="MZ5_COMPARE_RECOVERY"]')).toBeVisible();
  });

  test("constraints are actually compared before recommending recovery and closing quietly", async ({ page }) => {
    await page.goto(LAB);
    await collectEvidence(page);
    await page.getByRole("button", { name: "Collega", exact: true }).click();
    await page.locator(".experience-decision").getByRole("button", { name: "Continua" }).click();
    await page.getByRole("button", { name: "Provo il trigger su Sensor B" }).click();
    await page.getByRole("button", { name: "Continua dalla conseguenza" }).click();
    await expect(page.locator('[data-node="MZ5_COMPARE_RECOVERY"]')).toBeVisible();
    await page.getByRole("button", { name: "Confronta", exact: true }).click();
    const matrix = page.getByTestId("museo-confronto");
    await expect(matrix).toBeVisible();
    await expect(matrix.getByRole("row")).toHaveCount(4);
    await expect(matrix).toContainText("Nuovo ingresso accessibile");
    await expect(matrix).toContainText("Affidabilità nel tempo");
    await expect(matrix.getByRole("row", { name: /Ripristino il vecchio percorso/ })).toContainText("Non collegato");
    await matrix.getByRole("row", { name: /Aggiorno la mappatura a Sensor B/ }).getByRole("button", { name: "Prova questa soluzione" }).click();
    await expect(page.getByRole("button", { name: "Continua dalla conseguenza" })).toBeEnabled();
    await page.getByRole("button", { name: "Continua dalla conseguenza" }).click();
    await expect(page.locator('[data-node="MZ6_FINAL_REHEARSAL"]')).toBeVisible();
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-outcome", "stable");
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.locator('[data-node="MZ7_QUIET_CLOSE"]')).toBeVisible();
    await page.getByRole("button", { name: "Ricomincia" }).click();
    await expect(page.locator('[data-node="MZ1_FAILED_REHEARSAL"]')).toBeVisible();
  });

  test("no learner writes, identity prompt, local persistence or external dependency", async ({ page }) => {
    const writes: string[] = [];
    const externals: string[] = [];
    page.on("request", request => {
      const u = new URL(request.url());
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.url());
      if (!["127.0.0.1", "localhost"].includes(u.hostname)) externals.push(request.url());
    });
    await page.goto(LAB);
    await finishOpening(page);
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
    expect(writes).toEqual([]);
    expect(externals).toEqual([]);
    const records = await page.evaluate(() =>
      Object.keys(localStorage).filter(key => key.includes("museo-zero"))
    );
    expect(records).toEqual([]);
  });

  for (const width of [320, 360, 390, 768, 1280]) {
    test("museum review has no document overflow at " + width + "px", async ({ page }) => {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
      await page.goto(LAB);
      await expect(page.getByTestId("museo-risposta-sala")).toBeVisible();
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    });
  }

  test("respects reduced-motion preference with a readable non-animated room state", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(LAB);
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-outcome", "delayed");
    const transition = await page.locator(".mz-opening__visitor").evaluate(el => getComputedStyle(el).transitionDuration);
    expect(transition).toBe("0s");
    await finishOpening(page);
    await expect(page.getByRole("button",{name:"Continua",exact:true})).toBeVisible();
  });
});
