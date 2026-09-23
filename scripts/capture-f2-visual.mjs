import { chromium } from "playwright";
import fs from "node:fs/promises";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1100 }
];

await fs.mkdir("artifacts/f2-visual", { recursive: true });

const browser = await chromium.launch();
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    await page.goto(base + "/esplora", { waitUntil: "networkidle" });

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    if (overflow) {
      throw new Error("Horizontal overflow detected on " + viewport.name);
    }

    await page.screenshot({
      path: `artifacts/f2-visual/esplora-map-${viewport.name}.png`,
      fullPage: true
    });

    await page.getByRole("button", { name: "Elenco" }).click();
    await page.locator(".atlas-equivalent-outline").waitFor();
    await page.getByRole("button", { name: /Istituto Comprensivo/ }).first().waitFor();

    await page.screenshot({
      path: `artifacts/f2-visual/esplora-list-${viewport.name}.png`,
      fullPage: true
    });

    await context.close();
  }
} finally {
  await browser.close();
}
