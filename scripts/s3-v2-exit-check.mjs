import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const routes = ["/", "/curricolo", "/esplora", "/materiali", "/risorse", "/percorsi", "/obiettivi", "/raccordi", "/impostazioni"];
const requiredPrimary = ["/", "/esplora", "/curricolo", "/materiali", "/risorse"];
const requiredSecondary = ["/percorsi", "/obiettivi", "/raccordi", "/impostazioni"];

const browser = await chromium.launch();
try {
  for (const viewport of [
    { name: "mobile-360", width: 360, height: 800 },
    { name: "desktop", width: 1440, height: 1000 },
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    for (const route of routes) {
      const response = await page.goto(base + route, { waitUntil: "networkidle" });
      if (!response?.ok()) throw new Error(`Route ${route} failed on ${viewport.name}: ${response?.status()}`);

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      if (metrics.scrollWidth > metrics.clientWidth) {
        throw new Error(`Horizontal overflow on ${route} / ${viewport.name}: ${metrics.scrollWidth} > ${metrics.clientWidth}`);
      }

      if (await page.locator('input[type="password"]').count()) {
        throw new Error(`Password input unexpectedly exposed on public Atlas route ${route}`);
      }
      if (await page.locator('a[href*="login"], a[href*="signin"], a[href*="register"]').count()) {
        throw new Error(`Authentication affordance unexpectedly exposed on public Atlas route ${route}`);
      }

      await page.getByText("Vista pubblica", { exact: true }).first().waitFor({ state: "visible" });

      if (viewport.name === "mobile-360") {
        const primary = await page.locator(".atlas-mobile-nav > a").evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("href")).filter(Boolean).map((href) => href.length > 1 ? href.replace(/\/$/, "") : href)
        );
        for (const href of requiredPrimary) {
          if (!primary.includes(href)) throw new Error(`Missing primary mobile destination ${href} on ${route}`);
        }

        const more = page.locator(".atlas-mobile-more > summary");
        await more.click();
        const secondary = await page.locator(".atlas-mobile-more-menu a").evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("href")).filter(Boolean).map((href) => href.length > 1 ? href.replace(/\/$/, "") : href)
        );
        for (const href of requiredSecondary) {
          if (!secondary.includes(href)) throw new Error(`Missing secondary mobile destination ${href} on ${route}`);
        }
        await more.click();
      }

      if (route === "/esplora") {
        const listButton = page.getByRole("button", { name: /Elenco/i });
        await listButton.waitFor({ state: "visible" });
        await listButton.click();
        if (!(await listButton.getAttribute("aria-pressed"))?.includes("true")) {
          throw new Error("Esplora textual list alternative did not activate");
        }
      }

      if (route === "/curricolo") {
        const body = await page.locator("body").innerText();
        if (!/Infanzia/i.test(body) || !/Primaria/i.test(body) || !/Secondaria/i.test(body)) {
          throw new Error("Complete institute curriculum stages are not visible on /curricolo");
        }
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
