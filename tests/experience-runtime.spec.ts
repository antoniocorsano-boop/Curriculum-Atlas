import { test, expect } from "@playwright/test";

test.describe("Experience Engine conformance", () => {
  test("supports keyboard flow, announced feedback and restart", async ({ page }) => {
    await page.goto("/experience-lab/conformance");
    await page.getByRole("heading", { name: "Experience Engine conformance" }).focus();
    await page.getByRole("button", { name: "Continua" }).press("Enter");
    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Trasferisci" })).toBeFocused();
    await page.getByRole("button", { name: "Ricomincia" }).click();
    await expect(page.getByRole("heading", { name: "Experience Engine conformance" })).toBeVisible();
  });

  test("recovers from corrupt local state", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("atlas:experience:conformance-smart", "{bad"));
    await page.goto("/experience-lab/conformance");
    await expect(page.getByRole("heading", { name: "Experience Engine conformance" })).toBeVisible();
  });

  test("does not emit learner network writes", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (["POST","PUT","PATCH","DELETE"].includes(request.method())) writes.push(request.method());
    });
    await page.goto("/experience-lab/conformance");
    await page.getByRole("button", { name: "Continua" }).click();
    expect(writes).toEqual([]);
  });

  test("reflows on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/experience-lab/conformance");
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(390);
  });
});


test.describe("PW-MISSING shared-engine conformance", () => {
  test("branches, revises, transfers and completes through ExperienceRuntime", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-missing-information-01");
    await expect(page.locator(".experience-runtime")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quale informazione manca?" })).toBeVisible();

    await page.getByRole("radio", { name: "Fare una stima usando ciò che sappiamo" }).check();
    await expect(page.getByRole("status")).toContainText("Una stima può orientare");
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Hai lavorato con una stima" })).toBeFocused();

    await page.getByRole("radio", { name: "Riconsiderare la scelta precedente" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Quale informazione manca?" })).toBeFocused();

    await page.getByRole("radio", { name: "Cercare il dato sulla durata" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Hai cercato il dato mancante" })).toBeFocused();

    await page.getByRole("radio", { name: "Posso confrontare le alternative con informazioni pertinenti" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Stessa strategia, nuovo contesto" })).toBeFocused();

    await page.getByRole("radio", { name: "Il tempo di percorrenza" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Hai completato il percorso" })).toBeFocused();
  });

  test("preserves L and N presentation grammars on the shared runtime", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-missing-information-01");
    await expect(page.locator(".experience-runtime")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quale informazione manca?" })).toBeVisible();
    await page.getByRole("radio", { name: "Narrativo" }).check();
    await expect(page.getByRole("heading", { name: "Due materiali sul tavolo" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Cercare quanto dura ciascun materiale" })).toBeVisible();
  });

  test("remains volatile and emits no learner network writes", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.method());
    });
    await page.goto("/percorsi/lab/pw-missing-information-01");
    await page.getByRole("radio", { name: "Cercare il dato sulla durata" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    expect(writes).toEqual([]);
    const localKeys = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.includes("pw-missing-information-01")));
    expect(localKeys).toEqual([]);
  });
});


test.describe("Smart generality browser proof", () => {
  test("runs fonte-digitale through the shared runtime without learner network writes", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.method());
    });

    await page.goto("/attivita/fonte-digitale");
    await expect(page.locator(".experience-runtime")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Una pagina sembra convincente" })).toBeVisible();

    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Da dove inizi?" })).toBeFocused();

    await page.getByRole("radio", { name: "Controllo chi pubblica e se è responsabile del contenuto" }).check();
    await expect(page.getByRole("status")).toContainText("autore ed ente");
    await page.getByRole("button", { name: "Continua" }).click();

    await page.getByRole("radio", { name: "Cerco dati, fonti citate, data e metodo" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Confronta fuori dalla pagina" })).toBeFocused();

    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Stesso metodo, nuova fonte" })).toBeFocused();

    await page.getByRole("radio", { name: "Controllo autore, prove, data, scopo e confronto indipendente" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Affidabilità come giudizio motivato" })).toBeFocused();

    const localState = await page.evaluate(() => localStorage.getItem("atlas:experience:fonte-digitale"));
    expect(localState).not.toBeNull();
    expect(writes).toEqual([]);
  });
});


test.describe("Public Percorsi catalog", () => {
  test("fails closed when no pathway has explicit runtime authorization", async ({ page }) => {
    await page.goto("/percorsi");
    await expect(page.getByRole("heading", { name: "Percorsi" })).toBeVisible();
    await expect(page.getByText("Nessun percorso è ancora autorizzato per l’uso pubblico")).toBeVisible();
    await expect(page.locator('a[href*="/percorsi/lab/"]')).toHaveCount(0);
  });

  test("renders authorized and withdrawn fixture states without leaking lab routes", async ({ page }) => {
    await page.goto("/experience-lab/pathway-catalog");
    await expect(page.getByRole("link", { name: "Percorso autorizzato" })).toHaveAttribute("href", "/percorsi/demo-authorized");
    await expect(page.getByText("v1.2.0 · TRAMA-TEST-AUTH")).toBeVisible();
    await expect(page.getByText("Percorso ritirato")).toBeVisible();
    await expect(page.getByText("Non disponibile")).toBeVisible();
    await expect(page.getByRole("link", { name: "Percorso ritirato" })).toHaveCount(0);
    await expect(page.getByText("Senza provenienza")).toHaveCount(0);
    await expect(page.locator('a[href*="/percorsi/lab/"]')).toHaveCount(0);
  });
});


test.describe("PW-CONSTRAINTS lab preview boundary", () => {
  test("renders the noindex lab route through the shared runtime", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-constraints-tradeoffs-01");
    await expect(page.locator(".experience-runtime")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Una soluzione, molti vincoli" })).toBeVisible();
  });
});

test.describe("PW-CONSTRAINTS shared-engine runtime readiness", () => {
  test("branches, revises, transfers and completes through ExperienceRuntime", async ({ page }) => {
    await page.goto("/percorsi/pw-constraints-tradeoffs-01");
    await expect(page.locator(".experience-runtime")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Una soluzione, molti vincoli" })).toBeVisible();

    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: /Privilegiare durata e manutenzione ridotta/ }).check();
    await expect(page.getByRole("status")).toContainText("budget");
    await page.getByRole("button", { name: "Continua" }).click();

    await page.getByRole("radio", { name: /Mantengo la soluzione robusta/ }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByText("Il budget disponibile si riduce del 25%")).toBeVisible();

    await page.getByRole("radio", { name: /Riduco elementi non essenziali/ }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await page.getByRole("radio", { name: /Esplicito i vincoli, collego scelte e conseguenze/ }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByText(/Strategia esercitata/)).toBeVisible();
  });

  test("is volatile, emits no learner network writes and reflows on mobile", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.method());
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/percorsi/pw-constraints-tradeoffs-01");
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: /Privilegiare costo iniziale/ }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    expect(writes).toEqual([]);
    const localKeys = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.includes("pw-constraints-tradeoffs-01")));
    expect(localKeys).toEqual([]);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(390);
  });
});

test.describe("PW-MISSING public-surface runtime readiness", () => {
  test("uses the governed public route without persistence or learner writes", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.method());
    });
    await page.goto("/percorsi/pw-missing-information-01");
    await expect(page.locator(".experience-runtime")).toBeVisible();
    await expect(page.getByText("Nessun account, punteggio, profilo o telemetria dello studente.")).toBeVisible();
    await page.getByRole("radio", { name: "Cercare il dato sulla durata" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    expect(writes).toEqual([]);
    const localKeys = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.includes("pw-missing-information-01")));
    expect(localKeys).toEqual([]);
  });
});
