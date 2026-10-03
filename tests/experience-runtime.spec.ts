import { expect, test } from "@playwright/test";

test("shared experience runtime supports keyboard focus feedback restart and privacy", async ({ page }) => {
  const writes:string[]=[];
  page.on("request", req => { if (["POST","PUT","PATCH","DELETE"].includes(req.method())) writes.push(req.method()+" "+req.url()); });
  await page.goto("/experience-lab/conformance");
  await expect(page.getByRole("heading",{name:"Conformance experience"})).toBeVisible();
  await page.getByRole("radio",{name:"Inspect the evidence"}).check();
  await page.getByRole("button",{name:"Continue"}).click();
  await expect(page.getByRole("heading",{name:"Transfer"})).toBeFocused();
  await expect(page.getByRole("status")).toContainText("evidence");
  await page.getByRole("radio",{name:"Apply the principle"}).check();
  await page.getByRole("button",{name:"Continue"}).click();
  await expect(page.getByRole("heading",{name:"Completed"})).toBeVisible();
  await page.getByRole("button",{name:"Restart"}).click();
  await expect(page.getByRole("heading",{name:"Conformance experience"})).toBeVisible();
  expect(writes).toEqual([]);
});

test("corrupted local state resets safely and mobile remains usable", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("atlas:experience:conformance-smart:v1","{broken"));
  await page.setViewportSize({width:390,height:844});
  await page.goto("/experience-lab/conformance");
  await expect(page.getByRole("heading",{name:"Conformance experience"})).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x","scroll");
});

test("reduced motion and 200 percent zoom preserve the task", async ({ page }) => {
  await page.emulateMedia({ reducedMotion:"reduce" });
  await page.goto("/experience-lab/conformance");
  await page.evaluate(() => document.documentElement.style.fontSize="200%");
  await expect(page.getByRole("radio",{name:"Inspect the evidence"})).toBeVisible();
  await expect(page.getByRole("button",{name:"Continue"})).toBeVisible();
});
