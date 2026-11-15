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


test("G2 gateway puts all worlds and direct search in the first viewport; contextual filters preserve authority", async ({ page }) => {
  const external: string[] = [];
  page.on("request", request => { if (request.url().includes("invalid.example")) external.push(request.url()); });
  const worlds = page.getByRole("navigation", { name: "Mondi della conoscenza" });
  for (const [width,height] of [[320,740],[390,844],[844,900],[1280,900]]) {
    await page.setViewportSize({ width, height });
    await page.goto(path);
    await expect(worlds.getByRole("button")).toHaveCount(9);
    await expect(page.getByRole("status")).toHaveCount(0);
    await expect(page.getByRole("searchbox")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const search = await page.getByRole("searchbox").boundingBox();
    expect(search!.y + search!.height).toBeLessThanOrEqual(height);
    const boxes = await Promise.all((await worlds.getByRole("button").all()).map(button => button.boundingBox()));
    for (const bounds of boxes) {
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height);
    }
    for (let i=0;i<boxes.length;i++) for (let j=i+1;j<boxes.length;j++) {
      const a=boxes[i]!,b=boxes[j]!;
      expect(Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>1 && Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>1).toBe(false);
    }
  }
  expect(await page.locator("[data-world=energia] .axfPreviewHost__sphere").evaluate(el => getComputedStyle(el).backgroundImage)).toContain("data:image/webp;base64,UklGR");
  expect(await page.locator(".axfPreviewHost__library").evaluate(el => getComputedStyle(el).getPropertyValue("--axf-landscape"))).toBe("");
  await worlds.getByRole("button", { name: "Tecnologia" }).click();
  await expect(page.getByRole("searchbox")).toBeFocused();
  await expect(page.getByRole("status")).toHaveText("1 esperienza disponibile.");
  for (const section of ["Storie","Laboratori","Scoperte","Percorsi"]) await expect(page.getByRole("button", { name: section, exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /La scelta che cambia il sistema/ })).toBeVisible();
  await page.getByRole("button", { name: "Storie", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Nessuna esperienza disponibile.");
  await page.getByRole("button", { name: "Azzera filtri" }).click();
  await expect(page.getByRole("status")).toHaveText("3 esperienze disponibili.");
  await page.getByRole("button", { name: "Esplora i mondi" }).click();
  await expect(page.getByRole("heading", { name: "Esplora Atlas" })).toBeFocused();
  await worlds.getByRole("button", { name: "Energia" }).click();
  await expect(page.getByRole("status")).toHaveText("1 esperienza disponibile.");
  await expect(page.getByRole("link", { name: /Scoperta sintetica/ })).toBeVisible();
  await expect(page.getByText("SYNTHETIC_DENIED")).toHaveCount(0);
  expect(external).toEqual([]);
});

test("standalone discovery is reachable through world, section, search and exact route, while denied registrations are absent", async ({page}) => {
  await page.goto(path);
  await page.getByRole("navigation",{name:"Mondi della conoscenza"}).getByRole("button",{name:"Energia"}).click();
  await page.getByRole("button",{name:"Scoperte",exact:true}).click();
  await page.getByRole("searchbox").fill("sintetica");
  await expect(page.getByRole("status")).toHaveText("1 esperienza disponibile.");
  await page.getByRole("link",{name:/Scoperta sintetica/}).click();
  await expect(page).toHaveURL(/#axf\/standalone-preview-synthetic-discovery$/);
  await expect(page.getByRole("heading",{name:"Vista autonoma sintetica"})).toBeVisible();
  await expect(page.locator(".experience-runtime")).toHaveCount(0);
  await page.getByRole("link",{name:"Atlante",exact:true}).click();
  await expect(page.getByRole("searchbox")).toHaveValue("sintetica");
  await expect(page.getByRole("button",{name:"Scoperte",exact:true})).toHaveAttribute("aria-pressed","true");
  for (const id of ["denied","withdrawn","bad-hash","duplicate"]) {
    await page.goto(path+"#axf/standalone-preview-"+id);
    await expect(page).toHaveURL(/#axf$/);
    await expect(page.getByRole("heading",{name:"Esplora Atlas"})).toBeVisible();
  }
  await page.goto(path+"#axf/standalone-preview-synthetic-discovery");
  await expect(page.getByRole("heading",{name:"Vista autonoma sintetica"})).toBeVisible();
});
