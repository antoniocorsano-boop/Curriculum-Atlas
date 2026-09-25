import { chromium } from "playwright";
import fs from "node:fs/promises";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1100 }
];

await fs.mkdir("artifacts/f3-visual", { recursive: true });

const browser = await chromium.launch();
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    for (const surface of ["materiali", "risorse"]) {
      await page.goto(base + "/" + surface, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      if (overflow) throw new Error("Horizontal overflow detected on " + surface + " / " + viewport.name);
      await page.screenshot({
        path: `artifacts/f3-visual/${surface}-${viewport.name}.png`,
        fullPage: true
      });
    }

    await context.close();
  }
} finally {
  await browser.close();
}
