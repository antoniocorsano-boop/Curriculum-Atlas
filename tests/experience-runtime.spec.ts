import { expect, test } from "@playwright/test";

test("shared experience runtime supports keyboard focus feedback restart and privacy", async ({ page }) => {
  const writes:string[]=[];
  page.on("request", req => { if (["POST","PUT","PATCH","DELETE"].includes(req.method())) writes.push(req.method()+" "+req.url()); });
  await page.goto("/experience-lab/conformance");
  await expect(page.getByRole("heading",{name:"Conformance experience"})).toBeVisible();
  await page.getByRole("radio",{name:"Inspect the evidence"}).check();
  await page.getByRole("button",{name:"Continue"}).click();
  await expect(page.getByRole("heading",{name:"Transfer"})).toBeFocused();
  await expect(page.getByRole("status")).toContainText("evidence");
  await page.getByRole("radio",{name:"Apply the principle"}).check();
  await page.getByRole("button",{name:"Continue"}).click();
  await expect(page.getByRole("heading",{name:"Completed"})).toBeVisible();
  await page.getByRole("button",{name:"Restart"}).click();
  await expect(page.getByRole("heading",{name:"Conformance experience"})).toBeVisible();
  expect(writes).toEqual([]);
});

test("corrupted local state resets safely and mobile remains usable", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("atlas:experience:conformance-smart:v1","{broken"));
  await page.setViewportSize({width:390,height:844});
  await page.goto("/experience-lab/conformance");
  await expect(page.getByRole("heading",{name:"Conformance experience"})).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x","scroll");
});

test("reduced motion and 200 percent zoom preserve the task", async ({ page }) => {
  await page.emulateMedia({ reducedMotion:"reduce" });
  await page.goto("/experience-lab/conformance");
  await page.evaluate(() => document.documentElement.style.fontSize="200%");
  await expect(page.getByRole("radio",{name:"Inspect the evidence"})).toBeVisible();
  await expect(page.getByRole("button",{name:"Continue"})).toBeVisible();
});


test("text interaction persists locally without network writes", async ({ page }) => {
  const writes:string[]=[];
  page.on("request", req => { if (["POST","PUT","PATCH","DELETE"].includes(req.method())) writes.push(req.method()+" "+req.url()); });
  await page.goto("/experience-lab/text-conformance");
  const field=page.getByLabel("Your reasoning");
  await field.fill("I need one more piece of evidence.");
  await page.reload();
  await expect(page.getByLabel("Your reasoning")).toHaveValue("I need one more piece of evidence.");
  await page.getByRole("button",{name:"Continue"}).click();
  await expect(page.getByRole("heading",{name:"Completed"})).toBeVisible();
  expect(writes).toEqual([]);
});


test("SP-01 uses the shared local experience session", async ({ page }) => {
  await page.goto("/attivita/sistema-tecnologico");
  await page.getByLabel("Oppure scegli un altro sistema").fill("Pompa di calore");
  await expect.poll(async () => page.evaluate(() => localStorage.getItem("atlas:experience:sistema-tecnologico:v1"))).not.toBeNull();
});


test("SP-01 shared runtime preserves the seven-step summary and restart", async ({ page }) => {
  await page.goto("/attivita/sistema-tecnologico");
  await page.getByLabel("Oppure scegli un altro sistema").fill("Pompa di calore");
  await page.getByRole("button",{name:"Continua"}).click();
  await page.getByLabel("Quale bisogno soddisfa, quale risultato deve ottenere e quali componenti sono indispensabili?").fill("Riscalda gli ambienti trasferendo energia.");
  await page.getByRole("button",{name:"Continua"}).click();
  await page.getByLabel("Che cosa entra nel sistema? Che cosa viene trasformato? Che cosa otteniamo in uscita?").fill("Entrano energia elettrica e calore ambientale.");
  await page.getByRole("button",{name:"Continua"}).click();
  await page.getByLabel("Da dove proviene, in quale forma entra, come cambia e quale parte diventa utile o viene dissipata?").fill("L'energia elettrica alimenta il ciclo frigorifero.");
  await page.getByRole("button",{name:"Continua"}).click();
  await page.getByLabel("Quali materiali e risorse richiede il sistema? Quale ti sembra più importante o critica?").fill("Metalli, refrigerante, energia.");
  await page.getByRole("button",{name:"Continua"}).click();
  await page.getByLabel("Che cosa accade da materie prime → produzione → trasporto → uso → fine vita? Quali impatti riconosci?").fill("Produzione, uso e recupero del refrigerante incidono sugli impatti.");
  await page.getByRole("button",{name:"Continua"}).click();
  await page.getByLabel("In quale punto interverresti per rendere il sistema più sostenibile e perché la proposta dovrebbe ridurre l'impatto?").fill("Aumenterei efficienza e riparabilità.");
  await page.getByRole("button",{name:"Continua"}).click();
  await expect(page.getByRole("heading",{name:"Riepilogo"})).toBeVisible();
  await expect(page.getByText("Pompa di calore")).toBeVisible();
  await page.getByRole("button",{name:"Ricomincia"}).click();
  await expect(page.getByRole("heading",{name:"Scegli il sistema"})).toBeVisible();
});
