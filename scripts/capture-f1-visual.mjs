import { chromium } from "playwright";
import fs from "node:fs/promises";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const targets = [
  { name: "curricolo", path: "/curricolo" },
  { name: "materiali", path: "/materiali" },
  { name: "obiettivo-tecnologia", path: "/obiettivi/tech-s2-1" }
];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1100 }
];

await fs.mkdir("artifacts/f1-visual", { recursive: true });

const browser = await chromium.launch();
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    for (const target of targets) {
      await page.goto(base + target.path, { waitUntil: "networkidle" });
      await page.screenshot({
        path: `artifacts/f1-visual/${target.name}-${viewport.name}.png`,
        fullPage: true
      });
    }

    await context.close();
  }
} finally {
  await browser.close();
}
