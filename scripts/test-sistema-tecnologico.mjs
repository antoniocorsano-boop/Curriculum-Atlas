// @trama-feedback-test
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const storageKey = "atlas:smart:sistema-tecnologico:v1";
const browser = await chromium.launch();

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base + "/attivita/sistema-tecnologico", { waitUntil: "networkidle" });

  await page.getByRole("status").getByText(
    "Nessun account · risposte salvate solo su questo dispositivo"
  ).waitFor();
  await page.getByText("Passaggio 1 di 7").waitFor();

  const field = page.getByPlaceholder("Scrivi qui un sistema diverso…");
  await field.fill("Sistema locale di prova");
  await page.waitForFunction(
    ({ key, expected }) => localStorage.getItem(key)?.includes(expected),
    { key: storageKey, expected: "Sistema locale di prova" }
  );

  const stored = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  if (!stored || !stored.includes("Sistema locale di prova")) {
    throw new Error("Local persistence contract failed");
  }

  await page.reload({ waitUntil: "networkidle" });
  await page.getByPlaceholder("Scrivi qui un sistema diverso…").waitFor();
  if ((await page.getByPlaceholder("Scrivi qui un sistema diverso…").inputValue()) !== "Sistema locale di prova") {
    throw new Error("Local persistence was not restored after reload");
  }

  await page.getByRole("button", { name: "Continua" }).click();
  await page.getByText("Perché esiste?").waitFor();
} finally {
  await browser.close();
}
