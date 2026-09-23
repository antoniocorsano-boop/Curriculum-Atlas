import { chromium } from "playwright";
import fs from "node:fs/promises";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
await fs.mkdir("artifacts/perche-prototype", { recursive: true });

const browser = await chromium.launch();
try {
  for (const viewport of [
    { name: "mobile", width: 390, height: 844 },
    { name: "desktop", width: 1440, height: 1000 }
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      serviceWorkers: "allow"
    });
    const page = await context.newPage();

    await page.goto(base + "/attivita/perche", { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Osserva. Chiedi. Verifica. Spiega." }).waitFor();
    await page.getByRole("button", { name: "Avvia" }).click();
    await page.getByText("Una pianta sul davanzale cresce inclinata verso la finestra. Perché?").waitFor();

    await page.getByRole("button", { name: "Continua" }).click();
    const note = page.getByPlaceholder("Scrivi con parole tue. Non viene inviato ad Atlas.");
    await note.fill("Ipotesi locale di prova");
    const stored = await page.evaluate(() => localStorage.getItem("atlas:perche:perche-p3-spiegazione:v1"));
    if (!stored || !stored.includes("Ipotesi locale di prova")) {
      throw new Error("Local persistence contract failed");
    }

    await page.getByRole("button", { name: "Salva sul dispositivo" }).click();
    await page.getByRole("button", { name: "Disponibile offline" }).waitFor({ timeout: 15000 });

    await page.screenshot({
      path: `artifacts/perche-prototype/activity-${viewport.name}.png`,
      fullPage: true
    });

    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 15000 });
    await page.getByText("Quale spiegazione regge meglio?", { exact: false }).first().waitFor({ timeout: 10000 });
    await context.setOffline(false);

    await context.close();
  }
} finally {
  await browser.close();
}
