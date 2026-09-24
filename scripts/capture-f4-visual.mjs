import { chromium } from "playwright";
import fs from "node:fs/promises";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const viewports = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "lim-1080p", width: 1920, height: 1080 }
];
const surfaces = ["", "curricolo", "esplora", "materiali", "risorse"];

await fs.mkdir("artifacts/f4-visual", { recursive: true });

const browser = await chromium.launch();
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    for (const surface of surfaces) {
      const path = surface ? "/" + surface : "/";
      await page.goto(base + path, { waitUntil: "networkidle" });
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      if (metrics.scrollWidth > metrics.clientWidth) {
        const offenders = await page.evaluate(() => {
          const viewportWidth = document.documentElement.clientWidth;
          return Array.from(document.querySelectorAll("body *"))
            .map((node) => {
              const el = node;
              const rect = el.getBoundingClientRect();
              const style = getComputedStyle(el);
              const overflowsViewport = rect.right > viewportWidth + 1 || rect.left < -1;
              const intrinsicOverflow = el.scrollWidth > el.clientWidth + 1;
              if (!overflowsViewport && !intrinsicOverflow) return null;
              return {
                tag: el.tagName.toLowerCase(),
                id: el.id || "",
                className: typeof el.className === "string" ? el.className : "",
                rect: {
                  left: Math.round(rect.left),
                  right: Math.round(rect.right),
                  width: Math.round(rect.width)
                },
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
                overflowX: style.overflowX,
                minWidth: style.minWidth,
                width: style.width,
                text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 180)
              };
            })
            .filter(Boolean)
            .sort((a, b) => Math.max(b.rect.right - viewportWidth, b.scrollWidth - b.clientWidth) - Math.max(a.rect.right - viewportWidth, a.scrollWidth - a.clientWidth))
            .slice(0, 20);
        });
        console.error("F4 overflow offenders:", JSON.stringify(offenders, null, 2));
        throw new Error(`Horizontal overflow detected on ${path} / ${viewport.name}: ${metrics.scrollWidth} > ${metrics.clientWidth}`);
      }

      if (viewport.name.startsWith("mobile")) {
        const targets = await page.locator(".atlas-mobile-nav > a, .atlas-mobile-more > summary").evaluateAll((nodes) =>
          nodes.map((node) => Math.round(node.getBoundingClientRect().height))
        );
        if (!targets.length || targets.some((height) => height < 44)) {
          throw new Error(`Mobile nav target below 44px on ${path} / ${viewport.name}: ${targets.join(",")}`);
        }

        await page.locator(".atlas-mobile-more > summary").click();
        const secondaryHrefs = await page.locator(".atlas-mobile-more-menu a").evaluateAll((nodes) =>
          nodes
            .map((node) => node.getAttribute("href"))
            .filter(Boolean)
            .map((href) => href.length > 1 ? href.replace(/\/$/, "") : href)
        );
        const requiredSecondary = ["/percorsi", "/obiettivi", "/raccordi", "/impostazioni"];
        if (requiredSecondary.some((href) => !secondaryHrefs.includes(href))) {
          throw new Error(`Incomplete mobile secondary navigation on ${path} / ${viewport.name}: ${secondaryHrefs.join(",")}`);
        }
      }

      await page.screenshot({
        path: `artifacts/f4-visual/${surface || "home"}-${viewport.name}.png`,
        fullPage: viewport.name !== "lim-1080p"
      });
    }

    await context.close();
  }
} finally {
  await browser.close();
}
