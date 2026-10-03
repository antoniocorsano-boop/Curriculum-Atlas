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
