import { expect, test } from "@playwright/test";

test.describe("Atlas ingresso web — accesso reale senza immagini o WebGL", () => {
  test("mostra la pagina, i quattro accessi e le due azioni principali", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Che cosa vuoi scoprire oggi?" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Ogni scoperta/ })).toBeVisible();
    const expected = [
      ["esplora", "/esplora"],
      ["esperienze", "/esperienze"],
      ["percorsi", "/percorsi"],
      ["curricolo", "/curricolo"],
    ] as const;
    const nav = page.getByRole("navigation", { name: "Quattro accessi principali di Atlas" });
    await expect(nav.locator("a")).toHaveCount(4);
    for (const [id, href] of expected) {
      const link = page.getByTestId(`atlas-accesso-${id}`);
      await expect(link).toHaveAttribute("href", new RegExp(`^${href}/?$`));
      await expect(link).toBeVisible();
    }
    await expect(page.getByTestId("atlas-ingresso-entra")).toHaveAttribute("href", new RegExp("^/esplora/?$"));
    await expect(page.getByText("Vista pubblica")).toBeVisible();
    await expect(page.getByRole("link", { name: "Materiali", exact: true }).first()).toBeVisible();
  });

  for (const [id, href] of [
    ["esplora", "/esplora"],
    ["esperienze", "/esperienze"],
    ["percorsi", "/percorsi"],
    ["curricolo", "/curricolo"],
  ]) {
    test(`apre veramente la pagina ${id}`, async ({ page }) => {
      await page.goto("/");
      await page.getByTestId(`atlas-accesso-${id}`).click();
      await expect(page).toHaveURL(new RegExp(`${href}/?$`));
      await expect(page.locator("main h1")).toBeVisible();
    });
  }

  test("Esperienze è una pagina autentica, ma nessun candidato non autorizzato è raggiungibile", async ({ page }) => {
    const response = await page.goto("/esperienze/");
    expect(response?.status()).toBe(200);
    await expect(page.getByTestId("atlas-portale-esperienze")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /Qui le idee diventano/ })).toBeVisible();
    await expect(page.getByTestId("esperienze-non-disponibili")).toContainText("Nessuna esperienza è disponibile");
    for (const term of ["Storie", "Laboratori", "Scoperte"]) {
      await expect(page.getByRole("heading", { level: 3, name: term })).toBeVisible();
    }
    await expect(page.getByTestId("atlas-portale-esperienze").locator('a[href*="/lab/"]')).toHaveCount(0);
    await expect(page.getByTestId("atlas-portale-esperienze").locator('a[href*="/percorsi/pw-"]')).toHaveCount(0);
    await expect(page.getByTestId("esperienze-vai-esplora")).toHaveAttribute("href", new RegExp("^/esplora/?$"));
    await expect(page.getByTestId("esperienze-vai-materiali")).toHaveAttribute("href", new RegExp("^/materiali/?$"));
  });

  test("le due azioni di Esperienze aprono contenuti realmente disponibili", async ({ page }) => {
    await page.goto("/esperienze/");
    await page.getByTestId("esperienze-vai-esplora").click();
    await expect(page).toHaveURL(new RegExp("/esplora/?$"));
    await page.goto("/esperienze/");
    await page.getByTestId("esperienze-vai-materiali").click();
    await expect(page).toHaveURL(new RegExp("/materiali/?$"));
  });

  for (const width of [320, 360, 390, 768, 1280]) {
    test("Esperienze accessibile senza overflow a " + width + "px", async ({ page }) => {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
      await page.goto("/esperienze/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);
      await expect(page.getByTestId("esperienze-vai-esplora")).toBeVisible();
    });
  }

  test("Esperienze è accessibile dalla navigazione mobile principale", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navigazione mobile" });
    const experiences = nav.getByRole("link", { name: "Esperienze" });
    await expect(experiences).toBeVisible();
    await experiences.click();
    await expect(page).toHaveURL(new RegExp("/esperienze/?$"));
  });

  test("P2: la prima curiosità si apre da Esplora senza questionari", async ({ page }) => {
    await page.goto("/esplora/");
    await expect(page.getByRole("heading", { level: 1, name: "Da una domanda può nascere un viaggio." })).toBeVisible();
    await expect(page.getByTestId("atlas-esplora-prima-scoperta")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Perché una lampada si scalda se deve fare luce?" })).toBeVisible();
    await expect(page.getByTestId("scoperta-tappa-domanda")).toBeVisible();
    await expect(page.getByTestId("scoperta-tappa-osserva")).toHaveCount(0);
    await expect(page.getByRole("radio")).toHaveCount(0);
  });

  test("P2: domanda → trasformazione → approfondimento realmente collegato", async ({ page }) => {
    await page.goto("/esplora/");
    await page.getByTestId("scoperta-osserva").click();
    await expect(page.getByTestId("scoperta-tappa-osserva")).toBeVisible();
    await expect(page.getByTestId("scoperta-tappa-osserva")).toContainText("Energia elettrica");
    await expect(page.getByTestId("scoperta-tappa-osserva")).toContainText("Luce · effetto utile");
    await expect(page.getByTestId("scoperta-tappa-osserva")).toContainText("Calore · dispersione");
    await page.getByTestId("scoperta-collega").click();
    await expect(page.getByTestId("scoperta-tappa-collega")).toBeVisible();
    const link = page.getByTestId("scoperta-apri-schema");
    const resourcePath = "/materials/2026-09-23/3e/dove-va-l-energia.svg";
    await expect(link).toHaveAttribute("href", resourcePath);
    await expect(page.getByTestId("scoperta-risorsa-esistente").locator("img")).toHaveAttribute("src", resourcePath);
    const asset = await page.request.get(resourcePath);
    expect(asset.status()).toBe(200);
    expect(await asset.text()).toContain("DOVE VA L'ENERGIA?");
  });

  test("P2: dal racconto alla rete e all'obiettivo davvero presente in Arena", async ({ page }) => {
    await page.goto("/esplora/");
    await page.getByTestId("scoperta-osserva").click();
    await page.getByTestId("scoperta-collega").click();
    await page.getByTestId("scoperta-apri-relazioni").click();
    await expect(page).toHaveURL(/#atlas-mappa-conoscenze$/);
    await expect(page.getByRole("button", { name: /Elenco/i })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".atlas-explore-filters select").last()).toHaveValue("tecnologia");
    await expect(page.locator(".atlas-explore-context")).toContainText("analizzare sistemi energetici/produttivi");
    await expect(page.locator(".atlas-explore-context")).toContainText("non vigente");
    await expect(page.locator(".atlas-explore-context a")).toHaveAttribute("href", /^\/obiettivi\//);
  });

  test("P2: si può tornare alla domanda e ripetere l'osservazione", async ({ page }) => {
    await page.goto("/esplora/");
    await page.getByTestId("scoperta-osserva").click();
    await page.getByRole("button", { name: "Torna alla domanda" }).click();
    await expect(page.getByTestId("scoperta-tappa-domanda")).toBeVisible();
    await page.getByTestId("scoperta-osserva").click();
    await page.getByTestId("scoperta-collega").click();
    await page.getByTestId("scoperta-ricomincia").click();
    await expect(page.getByTestId("scoperta-tappa-domanda")).toBeVisible();
  });

  test("P2: la scoperta è percorribile interamente con la tastiera", async ({ page }) => {
    await page.goto("/esplora/");
    const start = page.getByTestId("scoperta-osserva");
    await start.focus();
    await start.press("Enter");
    await expect(page.getByTestId("scoperta-tappa-osserva")).toBeVisible();
    const continueButton = page.getByTestId("scoperta-collega");
    await continueButton.focus();
    await continueButton.press("Enter");
    await expect(page.getByTestId("scoperta-tappa-collega")).toBeVisible();
    const mapLink = page.getByTestId("scoperta-apri-relazioni");
    await mapLink.focus();
    await mapLink.press("Enter");
    await expect(page.locator(".atlas-explore-filters select").last()).toHaveValue("tecnologia");
  });

  for (const width of [320, 360, 390, 768, 1280]) {
    test("P2: nessun taglio della scoperta a " + width + "px", async ({ page }) => {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
      await page.goto("/esplora/");
      for (const phase of [0, 1, 2]) {
        if (phase === 1) await page.getByTestId("scoperta-osserva").click();
        if (phase === 2) await page.getByTestId("scoperta-collega").click();
        const metrics = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(metrics.scroll).toBeLessThanOrEqual(metrics.client);
      }
      await expect(page.getByTestId("scoperta-apri-schema")).toBeVisible();
    });
  }

  test("P2: schema pubblicato locale, nessuna dipendenza da servizi di immagini esterni", async ({ page }) => {
    const external: string[] = [];
    page.on("request", request => {
      const u = new URL(request.url());
      if (u.hostname !== "127.0.0.1" && u.hostname !== "localhost") external.push(request.url());
    });
    await page.goto("/esplora/");
    await page.getByTestId("scoperta-osserva").click();
    await page.getByTestId("scoperta-collega").click();
    await expect(page.getByTestId("scoperta-risorsa-esistente")).toBeVisible();
    expect(external).toEqual([]);
  });

  test("azione principale operativa e navigazione da tastiera", async ({ page }) => {
    await page.goto("/");
    const action = page.getByTestId("atlas-ingresso-entra");
    await action.focus();
    await expect(action).toBeFocused();
    await action.press("Enter");
    await expect(page).toHaveURL(new RegExp("/esplora/?$"));
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
      await expect(page.getByTestId("atlas-accesso-esperienze")).toBeVisible();
    });
  }

  test("rispetta le preferenze di movimento ridotto", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const value = await page.locator('[class*="atmosphere"]').evaluate(el => getComputedStyle(el).animationName);
    expect(value).toBe("none");
  });
});
