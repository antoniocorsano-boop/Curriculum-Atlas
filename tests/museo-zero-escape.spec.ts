import { test, expect } from "@playwright/test";
test.describe("Museo Zero – escape room giocabile", () => {
 test("dal guasto alla riparazione, con tracce e confronto causale", async ({page}) => {
  await page.goto("/percorsi/lab/museo-zero-escape");
  await expect(page.getByRole("heading",{name:/la sala/i})).toBeVisible();
  await page.getByRole("button",{name:/entra nel museo/i}).click();
  await page.getByRole("button",{name:/avvia prova nella sala/i}).click();
  await expect(page.getByText("La proiezione parte in ritardo").first()).toBeVisible();
  await page.getByRole("button",{name:"Ingresso"}).click();
  await page.getByRole("button",{name:"Esamina Nuovo accesso"}).click();
  await page.getByRole("button",{name:"Porta sul banco"}).click();
  await page.getByRole("button",{name:"Laboratorio"}).click();
  await page.getByRole("button",{name:"Esamina Sensore B"}).click();
  await page.getByRole("button",{name:"Porta sul banco"}).click();
  await page.getByRole("button",{name:"Cabina regia"}).click();
  await page.getByRole("button",{name:"Esamina Segnale attivo: A"}).click();
  await page.getByRole("button",{name:"Porta sul banco"}).click();
  await page.getByRole("button",{name:/apri il banco/i}).click();
  await expect(page.getByText(/le tracce mostrano un disallineamento/i)).toBeVisible();
  await page.getByRole("button",{name:"Sensore B"}).click();
  await page.getByRole("button",{name:/avvia prova nella sala/i}).click();
  await page.getByRole("button",{name:"Conferma la soluzione"}).click();
  await expect(page.getByRole("heading",{name:"Sala pronta."})).toBeVisible();
  await page.getByRole("button",{name:"Rigioca l'indagine"}).click();
  await expect(page.getByRole("button",{name:/entra nel museo/i})).toBeVisible();
 });
 test("non basta tentare il sensore corretto senza prova", async ({page}) => {
  await page.goto("/percorsi/lab/museo-zero-escape");
  await page.getByRole("button",{name:/entra nel museo/i}).click();
  await page.getByRole("button",{name:"Sensore B"}).click();
  await page.getByRole("button",{name:/avvia prova nella sala/i}).click();
  await expect(page.getByRole("button",{name:"Conferma la soluzione"})).toBeDisabled();
 });
 test("nessuna trasmissione applicativa di dati", async ({page}) => {
  const sent:string[]=[];
  page.on("request",request=>{if(request.method()==="POST"&&!request.url().includes("/_next/"))sent.push(request.url());});
  await page.goto("/percorsi/lab/museo-zero-escape");
  await page.getByRole("button",{name:/entra nel museo/i}).click();
  await page.getByRole("button",{name:"Esamina Proiezione in ritardo"}).click();
  await page.getByRole("button",{name:"Porta sul banco"}).click();
  expect(sent).toEqual([]);
  await expect(page.getByText(/non autorizzato agli studenti/i)).toBeVisible();
 });
});
