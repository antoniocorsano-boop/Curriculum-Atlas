import { expect, test } from "@playwright/test";

test.describe("Atlas ingresso web — accesso reale senza immagini o WebGL", () => {
  test("mostra la pagina, i quattro accessi e le due azioni principali", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Il curricolo, connesso." })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Lasciati guidare/ })).toBeVisible();
    const expected = [
      ["curricolo", "/curricolo"],
      ["esplora", "/esplora"],
      ["percorsi", "/percorsi"],
      ["materiali", "/materiali"],
    ] as const;
    const nav = page.getByRole("navigation", { name: "Quattro accessi principali di Atlas" });
    await expect(nav.locator("a")).toHaveCount(4);
    for (const [id, href] of expected) {
      const link = page.getByTestId(`atlas-accesso-${id}`);
      await expect(link).toHaveAttribute("href", href);
      await expect(link).toBeVisible();
    }
    await expect(page.getByTestId("atlas-ingresso-entra")).toHaveAttribute("href", "/esplora");
    await expect(page.getByText("Vista pubblica")).toBeVisible();
  });

  for (const [id, href] of [
    ["curricolo", "/curricolo"],
    ["esplora", "/esplora"],
    ["percorsi", "/percorsi"],
    ["materiali", "/materiali"],
  ]) {
    test(`apre veramente la pagina ${id}`, async ({ page }) => {
      await page.goto("/");
      await page.getByTestId(`atlas-accesso-${id}`).click();
      await expect(page).toHaveURL(new RegExp(`${href}/?$`));
      await expect(page.locator("main h1")).toBeVisible();
    });
  }

  test("azione principale operativa e navigazione da tastiera", async ({ page }) => {
    await page.goto("/");
    const action = page.getByTestId("atlas-ingresso-entra");
    await action.focus();
    await expect(action).toBeFocused();
    await action.press("Enter");
    await expect(page).toHaveURL(/\/esplora\/?$/);
  });

  test("nessuna immagine remota o modello 3D necessario", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/");
    expect(requests.filter(url => /\.(?:glb|gltf|png|jpe?g|webp)(?:\?|$)/i.test(url))).toEqual([]);
    expect(requests.filter(url => /^(?:https?:)\/\//.test(url) && !url.startsWith("http://127.0.0.1:3000"))).toEqual([]);
    await expect(page.getByTestId("atlas-ingresso-web")).toBeVisible();
  });

  for (const width of [320, 360, 390, 768, 1280]) {
    test(`nessun taglio orizzontale a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
      await page.goto("/");
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);
      await expect(page.getByTestId("atlas-accesso-curricolo")).toBeVisible();
      await expect(page.getByTestId("atlas-accesso-materiali")).toBeVisible();
    });
  }

  test("rispetta le preferenze di movimento ridotto", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const value = await page.locator('[class*="atmosphere"]').evaluate(el => getComputedStyle(el).animationName);
    expect(value).toBe("none");
  });
});
