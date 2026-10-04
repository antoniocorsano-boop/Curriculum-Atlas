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


test.describe("PW-MISSING product recovery on shared engine", () => {
  test("restores the nine-stage authored flow with revision and transfer", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-missing-information-01");
    await expect(page.locator(".experience-runtime")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Una decisione da prendere" })).toBeVisible();

    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Che cosa manca?" })).toBeFocused();
    await page.getByRole("radio", { name: "Quali risorse sono disponibili" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByRole("heading", { name: "Come decidere?" })).toBeFocused();
    await page.getByRole("radio", { name: "Scegliere subito con i dati presenti" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByRole("heading", { name: "Osserva la conseguenza" })).toBeFocused();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByRole("heading", { name: "Puoi rivedere la scelta" })).toBeFocused();
    await page.getByRole("radio", { name: "Provo un altro modo" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Come decidere?" })).toBeFocused();

    await page.getByRole("radio", { name: "Controllare prima le risorse disponibili" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Tengo la scelta" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByRole("heading", { name: "Diamo un nome alla strategia" })).toBeFocused();
    await page.getByRole("radio", { name: "Individuare il dato mancante e controllarlo prima di decidere" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByRole("heading", { name: "Una situazione diversa" })).toBeFocused();
    await page.getByRole("radio", { name: "Sì: prima controllo ciò che è disponibile" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByRole("heading", { name: "Controllare una fonte" })).toBeFocused();
    await page.getByRole("radio", { name: "Quali prove e fonti sostengono le informazioni" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByRole("heading", { name: "La strategia resta tua" })).toBeFocused();
    await expect(page.getByText(/Hai completato il percorso/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Nuovo percorso" })).toBeVisible();
  });

  test("preserves literal and narrative presentation without changing the task", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-missing-information-01");
    await expect(page.getByRole("heading", { name: "Una decisione da prendere" })).toBeVisible();
    await page.getByRole("radio", { name: "Narrativo" }).check();
    await expect(page.getByRole("heading", { name: "Il punto di partenza" })).toBeVisible();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("radio", { name: "Quali risorse sono disponibili" })).toBeVisible();
  });

  test("keeps pathway choices volatile and emits no learner network writes", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.method());
    });
    await page.goto("/percorsi/lab/pw-missing-information-01");
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Quali risorse sono disponibili" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    expect(writes).toEqual([]);
    const sessionKey = await page.evaluate(() => localStorage.getItem("atlas:experience:pw-missing-information-01"));
    expect(sessionKey).toBeNull();
  });

  test("stores growth evidence locally only after explicit opt-in and can reset it", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.method());
    });
    await page.goto("/percorsi/lab/pw-missing-information-01");
    expect(await page.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"))).toBeNull();

    await page.getByRole("button", { name: "Conserva i miei traguardi su questo dispositivo" }).click();
    await expect(page.locator(".pathwayGrowth__status")).toContainText("Crescita locale attivata");
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Quali risorse sono disponibili" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Controllare prima le risorse disponibili" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Tengo la scelta" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    // Merely arriving at the prompt is not evidence.
    await expect(page.getByText("Riconosco la strategia: cerco il dato pertinente che manca")).toHaveCount(0);
    await page.getByRole("radio", { name: "Individuare il dato mancante e controllarlo prima di decidere" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByText("Riconosco la strategia: cerco il dato pertinente che manca")).toBeVisible();
    await expect(page.locator(".pathwayGrowth__status")).toContainText("Nuovo traguardo conservato");
    const stored = await page.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"));
    expect(stored).toContain("recognise-missing-information-strategy");
    expect(writes).toEqual([]);

    await page.getByRole("button", { name: "Cancella i progressi locali" }).click();
    await expect(page.locator(".pathwayGrowth__status")).toContainText("sono stati cancellati");
    expect(await page.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"))).toBeNull();
  });

  test("does not award growth for prompt arrival or non-qualifying choices", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-missing-information-01");
    await page.getByRole("button", { name: "Conserva i miei traguardi su questo dispositivo" }).click();

    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Quali risorse sono disponibili" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Controllare prima le risorse disponibili" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Tengo la scelta" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByRole("heading", { name: "Diamo un nome alla strategia" })).toBeFocused();
    expect(await page.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"))).not.toContain("recognise-missing-information-strategy");

    await page.getByRole("radio", { name: "Indovinare il dato mancante" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    expect(await page.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"))).not.toContain("recognise-missing-information-strategy");

    await page.getByRole("radio", { name: "No: scelgo senza controllare" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    expect(await page.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"))).not.toContain("choose-strategy-in-changed-context");

    await page.getByRole("radio", { name: "Quale pagina ha l’aspetto più gradevole" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    const stored = await page.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"));
    expect(stored).not.toContain("transfer-to-source-evaluation");
  });

  test("reconciles growth across tabs and a reset cannot be recreated by a stale tab", async ({ page }) => {
    const second = await page.context().newPage();
    await Promise.all([
      page.goto("/percorsi/lab/pw-missing-information-01"),
      second.goto("/percorsi/lab/pw-missing-information-01"),
    ]);

    await page.getByRole("button", { name: "Conserva i miei traguardi su questo dispositivo" }).click();
    await expect(second.getByRole("button", { name: "Cancella i progressi locali" })).toBeVisible();

    // First tab earns the first qualifying achievement.
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Quali risorse sono disponibili" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Controllare prima le risorse disponibili" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Tengo la scelta" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Individuare il dato mancante e controllarlo prima di decidere" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(second.getByText("Riconosco la strategia: cerco il dato pertinente che manca")).toBeVisible();

    // Second tab re-reads and merges instead of replacing the shared record.
    await second.getByRole("button", { name: "Continua" }).click();
    await second.getByRole("radio", { name: "Quali risorse sono disponibili" }).check();
    await second.getByRole("button", { name: "Continua" }).click();
    await second.getByRole("radio", { name: "Controllare prima le risorse disponibili" }).check();
    await second.getByRole("button", { name: "Continua" }).click();
    await second.getByRole("button", { name: "Continua" }).click();
    await second.getByRole("radio", { name: "Tengo la scelta" }).check();
    await second.getByRole("button", { name: "Continua" }).click();
    await second.getByRole("radio", { name: "Individuare il dato mancante e controllarlo prima di decidere" }).check();
    await second.getByRole("button", { name: "Continua" }).click();
    await second.getByRole("radio", { name: "Sì: prima controllo ciò che è disponibile" }).check();
    await second.getByRole("button", { name: "Continua" }).click();

    const merged = await second.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"));
    expect(merged).toContain("recognise-missing-information-strategy");
    expect(merged).toContain("choose-strategy-in-changed-context");

    // Reset in tab one disables storage everywhere.
    await page.getByRole("button", { name: "Cancella i progressi locali" }).click();
    await expect(second.getByRole("button", { name: "Conserva i miei traguardi su questo dispositivo" })).toBeVisible();
    expect(await second.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"))).toBeNull();

    // Even if the second tab continues from an already advanced session, it must not recreate the deleted record.
    await second.getByRole("radio", { name: "Quali prove e fonti sostengono le informazioni" }).check();
    await second.getByRole("button", { name: "Continua" }).click();
    expect(await second.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"))).toBeNull();

    await second.close();
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


test.describe("PW-CONSTRAINTS authored product flow", () => {
  test("renders the noindex lab product preview with explicit review boundary", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-constraints-tradeoffs-01");
    await expect(page.locator(".experience-runtime")).toBeVisible();
    await expect(page.getByText("PROTOTIPO · NON AUTORIZZATO AGLI STUDENTI")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Una soluzione, molti vincoli" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Il brief di progetto" })).toBeVisible();
  });

  test("runs the authored design cycle and awards only the three qualifying outcomes", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (["POST","PUT","PATCH","DELETE"].includes(request.method())) writes.push(request.method());
    });

    await page.goto("/percorsi/lab/pw-constraints-tradeoffs-01");
    await page.getByRole("button", { name: "Conserva i miei traguardi su questo dispositivo" }).click();

    await expect(page.getByRole("heading", { name: "Il brief di progetto" })).toBeVisible();
    await page.getByRole("button", { name: "Continua" }).click();

    await page.getByRole("radio", { name: "A · Sviluppo la soluzione robusta e modulare" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByRole("heading", { name: "Quale compromesso stai accettando?" })).toBeFocused();
    await page.getByRole("radio", { name: "Accetto un costo iniziale maggiore per proteggere durata e manutenzione" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByText("Rendo esplicito un compromesso di progetto")).toBeVisible();

    await page.getByRole("radio", { name: "Mantengo il nucleo robusto, elimino elementi non essenziali e ricontrollo usabilità e risorse" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByText("Il budget disponibile si riduce del 25%.")).toBeVisible();
    await page.getByRole("radio", { name: "Riduco elementi non essenziali e ricontrollo costo, durata e usabilità" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByText("Rivedo una soluzione quando cambia un requisito")).toBeVisible();

    await page.getByRole("radio", { name: "Rendo espliciti i vincoli, collego scelte e conseguenze, scelgo un compromesso e rivedo la soluzione se cambia un requisito" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await page.getByRole("radio", { name: "Uso pannelli modulari più piccoli e riutilizzabili: accetto meno superficie espositiva per facilitare trasporto e montaggio" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByText("Trasferisco il metodo di progetto in una nuova situazione")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Il metodo resta disponibile" })).toBeFocused();

    const stored = await page.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"));
    expect(stored).toContain("explicit-design-tradeoff");
    expect(stored).toContain("revise-changed-requirement");
    expect(stored).toContain("transfer-design-method");
    expect(writes).toEqual([]);
  });

  test("does not award transfer evidence when the learner copies the previous solution", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-constraints-tradeoffs-01");
    await page.getByRole("button", { name: "Conserva i miei traguardi su questo dispositivo" }).click();

    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "A · Sviluppo la soluzione robusta e modulare" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Accetto un costo iniziale maggiore per proteggere durata e manutenzione" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Mantengo il nucleo robusto, elimino elementi non essenziali e ricontrollo usabilità e risorse" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Riduco elementi non essenziali e ricontrollo costo, durata e usabilità" }).check();
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Rendo espliciti i vincoli, collego scelte e conseguenze, scelgo un compromesso e rivedo la soluzione se cambia un requisito" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await expect(page.getByText("Deve passare attraverso un accesso stretto ed essere montata rapidamente.")).toBeVisible();
    await page.getByRole("radio", { name: "Copio la soluzione del cortile perché ha già funzionato" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    const stored = await page.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"));
    expect(stored).not.toContain("transfer-design-method");
    await expect(page.getByText("Trasferisco il metodo di progetto in una nuova situazione")).toHaveCount(0);
  });

  test("does not award tradeoff evidence for a single-constraint claim", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-constraints-tradeoffs-01");
    await page.getByRole("button", { name: "Conserva i miei traguardi su questo dispositivo" }).click();
    await page.getByRole("button", { name: "Continua" }).click();

    await page.getByRole("radio", { name: "B · Sviluppo la soluzione leggera ed economica" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    await page.getByRole("radio", { name: "È la soluzione migliore perché costa meno" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    const stored = await page.evaluate(() => localStorage.getItem("atlas:percorsi:local-growth:v1"));
    expect(stored).not.toContain("explicit-design-tradeoff");
    await expect(page.getByText("Rendo esplicito un compromesso di progetto")).toHaveCount(0);
  });

  test("preserves narrative design-studio presentation without changing the decisions", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-constraints-tradeoffs-01");
    await page.getByRole("radio", { name: "Narrativo" }).check();
    await expect(page.getByRole("heading", { name: "Apri il tavolo di progetto" })).toBeVisible();
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.getByRole("heading", { name: "Due schede sul tavolo" })).toBeFocused();
    await expect(page.getByRole("radio", { name: "A · Sviluppo la soluzione robusta e modulare" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "B · Sviluppo la soluzione leggera ed economica" })).toBeVisible();
  });

  test("remains volatile, emits no learner network writes and reflows on mobile", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.method());
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/percorsi/pw-constraints-tradeoffs-01");

    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "B · Sviluppo la soluzione leggera ed economica" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    expect(writes).toEqual([]);
    const sessionKey = await page.evaluate(() => localStorage.getItem("atlas:experience:pw-constraints-tradeoffs-01"));
    expect(sessionKey).toBeNull();
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
    await page.getByRole("button", { name: "Continua" }).click();
    await page.getByRole("radio", { name: "Quali risorse sono disponibili" }).check();
    await page.getByRole("button", { name: "Continua" }).click();

    expect(writes).toEqual([]);
    const localKeys = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.includes("pw-missing-information-01")));
    expect(localKeys).toEqual([]);
  });
});


test.describe("PW-STRATEGY-SELECTION experience-quality lab prototype", () => {
  test("uses genuine source-hidden retrieval and awards strategy-goal fit only after applied recall", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-strategy-selection-01");
    await expect(page.getByText("PROTOTIPO · NON AUTORIZZATO AGLI STUDENTI")).toBeVisible();

    await page.getByRole("button", { name: "Apri il banco degli strumenti" }).click();
    await page.getByRole("button", { name: /Sequenza \+ recupero/ }).click();
    await page.getByRole("button", { name: "Copri la scheda e prova" }).click();

    await expect(page.getByText("Fonte coperta")).toBeVisible();
    await expect(page.getByText("Il gruppo parte dalla stazione sul campo.")).toHaveCount(0);

    for (const token of ["stazione", "ponte", "pioggia", "cresta", "osservazione"]) {
      await page.getByRole("button", { name: token, exact: true }).click();
    }
    await page.getByRole("button", { name: "Controlla", exact: true }).click();

    await expect(page.getByText("Hai scelto e applicato uno strumento coerente con lo scopo del compito.")).toBeVisible();
    await expect(page.locator('.strategyWorkbench__rail li[data-earned="true"]')).toHaveCount(1);
  });

  test("gates revision and transfer evidence on strategy choice plus applied construction", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-strategy-selection-01");

    await page.getByRole("button", { name: "Apri il banco degli strumenti" }).click();
    await page.getByRole("button", { name: /Sequenza \+ recupero/ }).click();
    await page.getByRole("button", { name: "Copri la scheda e prova" }).click();
    for (const token of ["stazione", "ponte", "pioggia", "cresta", "osservazione"]) {
      await page.getByRole("button", { name: token, exact: true }).click();
    }
    await page.getByRole("button", { name: "Controlla", exact: true }).click();
    await page.getByRole("button", { name: "Continua", exact: true }).click();
    await page.getByRole("button", { name: "Torna al banco degli strumenti" }).click();

    await page.getByRole("button", { name: /Mappa causa-effetto/ }).click();
    for (const token of ["pioggia intensa", "sentiero basso inutilizzabile", "percorso di cresta", "arrivo più tardi"]) {
      await page.getByRole("button", { name: token, exact: true }).click();
    }
    await page.getByRole("button", { name: "Controlla", exact: true }).click();
    await expect(page.locator('.strategyWorkbench__rail li[data-earned="true"]')).toHaveCount(2);
    await page.getByRole("button", { name: "Continua", exact: true }).click();
    await page.getByRole("button", { name: "Prova in una situazione nuova" }).click();

    await page.getByRole("button", { name: /Griglia di confronto/ }).click();
    await expect(page.locator(".strategyWorkbench__rail strong")).toHaveText("Griglia di confronto");
    await page.getByLabel("Durata, percorso Blu").selectOption({ label: "45 min" });
    await page.getByLabel("Durata, percorso Verde").selectOption({ label: "30 min" });
    await page.getByLabel("Accesso, percorso Blu").selectOption({ label: "ascensore" });
    await page.getByLabel("Accesso, percorso Verde").selectOption({ label: "solo scale" });
    await page.getByLabel("Attività pratiche, percorso Blu").selectOption({ label: "1 attività pratica" });
    await page.getByLabel("Attività pratiche, percorso Verde").selectOption({ label: "2 attività pratiche" });
    await page.getByRole("button", { name: "Controlla il confronto" }).click();

    await expect(page.getByText("Hai scelto e applicato una strategia adatta in un compito diverso.")).toBeVisible();
    await expect(page.locator('.strategyWorkbench__rail li[data-earned="true"]')).toHaveCount(3);
  });

  test("remains volatile, emits no learner writes and reflows on mobile", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.method());
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/percorsi/lab/pw-strategy-selection-01");
    await page.getByRole("button", { name: "Apri il banco degli strumenti" }).click();
    await page.getByRole("button", { name: /Rilettura/ }).click();
    await page.getByRole("button", { name: "Ho riletto · prova l’ordine" }).click();

    expect(writes).toEqual([]);
    expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.includes("strategy-selection")))).toEqual([]);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(390);
  });
});


test.describe("PW-STRATEGY-SELECTION interaction regression guards", () => {
  test("moves focus to the heading of each newly rendered scene", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-strategy-selection-01");

    await expect(page.getByRole("heading", { name: "Guarda il materiale prima di scegliere come lavorarci." })).toBeFocused();
    await page.getByRole("button", { name: "Apri il banco degli strumenti" }).click();
    await expect(page.getByRole("heading", { name: "Quale strumento useresti per prepararti a ricostruire l’ordine?" })).toBeFocused();

    await page.getByRole("button", { name: /Sequenza \+ recupero/ }).click();
    await expect(page.getByRole("heading", { name: "Prima organizza. Poi copri la fonte e prova davvero." })).toBeFocused();

    await page.getByRole("button", { name: "Copri la scheda e prova" }).click();
    await expect(page.getByRole("heading", { name: "La fonte è coperta. Ricostruisci l’ordine usando solo ciò che ricordi." })).toBeFocused();
  });

  test("requires a fresh validation after editing a failed order construction", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-strategy-selection-01");
    await page.getByRole("button", { name: "Apri il banco degli strumenti" }).click();
    await page.getByRole("button", { name: /Sequenza \+ recupero/ }).click();
    await page.getByRole("button", { name: "Copri la scheda e prova" }).click();

    for (const token of ["ponte", "stazione", "pioggia", "cresta", "osservazione"]) {
      await page.getByRole("button", { name: token, exact: true }).click();
    }
    await page.getByRole("button", { name: "Controlla", exact: true }).click();
    await expect(page.getByText(/L’ordine non coincide ancora con la fonte/)).toBeVisible();

    await page.getByRole("button", { name: "Svuota" }).click();
    for (const token of ["stazione", "ponte", "pioggia", "cresta", "osservazione"]) {
      await page.getByRole("button", { name: token, exact: true }).click();
    }

    await expect(page.getByRole("button", { name: "Continua", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Controlla", exact: true }).click();
    await expect(page.getByRole("button", { name: "Continua", exact: true })).toBeVisible();
    await expect(page.locator('.strategyWorkbench__rail li[data-earned="true"]')).toHaveCount(1);
  });

  test("requires a fresh validation after editing a failed cause construction", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-strategy-selection-01");
    await page.getByRole("button", { name: "Apri il banco degli strumenti" }).click();
    await page.getByRole("button", { name: /Sequenza \+ recupero/ }).click();
    await page.getByRole("button", { name: "Copri la scheda e prova" }).click();
    for (const token of ["stazione", "ponte", "pioggia", "cresta", "osservazione"]) {
      await page.getByRole("button", { name: token, exact: true }).click();
    }
    await page.getByRole("button", { name: "Controlla", exact: true }).click();
    await page.getByRole("button", { name: "Continua", exact: true }).click();
    await page.getByRole("button", { name: "Torna al banco degli strumenti" }).click();
    await page.getByRole("button", { name: /Mappa causa-effetto/ }).click();

    for (const token of ["arrivo più tardi", "pioggia intensa", "sentiero basso inutilizzabile", "percorso di cresta"]) {
      await page.getByRole("button", { name: token, exact: true }).click();
    }
    await page.getByRole("button", { name: "Controlla", exact: true }).click();
    await expect(page.getByText(/La catena non rende ancora corretta/)).toBeVisible();

    await page.getByRole("button", { name: "Svuota" }).click();
    for (const token of ["pioggia intensa", "sentiero basso inutilizzabile", "percorso di cresta", "arrivo più tardi"]) {
      await page.getByRole("button", { name: token, exact: true }).click();
    }

    await expect(page.getByRole("button", { name: "Continua", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Controlla", exact: true }).click();
    await expect(page.getByRole("button", { name: "Continua", exact: true })).toBeVisible();
    await expect(page.locator('.strategyWorkbench__rail li[data-earned="true"]')).toHaveCount(2);
  });
});


test.describe("PW-STRATEGY-SELECTION transfer validation invalidation", () => {
  test("revokes transfer evidence when a validated comparison is edited", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-strategy-selection-01");
    await page.getByRole("button", { name: "Apri il banco degli strumenti" }).click();
    await page.getByRole("button", { name: /Sequenza \+ recupero/ }).click();
    await page.getByRole("button", { name: "Copri la scheda e prova" }).click();

    for (const token of ["stazione", "ponte", "pioggia", "cresta", "osservazione"]) {
      await page.getByRole("button", { name: token, exact: true }).click();
    }
    await page.getByRole("button", { name: "Controlla", exact: true }).click();
    await page.getByRole("button", { name: "Continua", exact: true }).click();
    await page.getByRole("button", { name: "Torna al banco degli strumenti" }).click();
    await page.getByRole("button", { name: /Mappa causa-effetto/ }).click();

    for (const token of ["pioggia intensa", "sentiero basso inutilizzabile", "percorso di cresta", "arrivo più tardi"]) {
      await page.getByRole("button", { name: token, exact: true }).click();
    }
    await page.getByRole("button", { name: "Controlla", exact: true }).click();
    await page.getByRole("button", { name: "Continua", exact: true }).click();
    await page.getByRole("button", { name: "Prova in una situazione nuova" }).click();
    await page.getByRole("button", { name: /Griglia di confronto/ }).click();

    await page.getByLabel("Durata, percorso Blu").selectOption({ label: "45 min" });
    await page.getByLabel("Durata, percorso Verde").selectOption({ label: "30 min" });
    await page.getByLabel("Accesso, percorso Blu").selectOption({ label: "ascensore" });
    await page.getByLabel("Accesso, percorso Verde").selectOption({ label: "solo scale" });
    await page.getByLabel("Attività pratiche, percorso Blu").selectOption({ label: "1 attività pratica" });
    await page.getByLabel("Attività pratiche, percorso Verde").selectOption({ label: "2 attività pratiche" });
    await page.getByRole("button", { name: "Controlla il confronto" }).click();

    await expect(page.getByRole("button", { name: "Concludi" })).toBeVisible();
    await expect(page.locator('.strategyWorkbench__rail li[data-earned="true"]')).toHaveCount(3);

    await page.getByLabel("Durata, percorso Verde").selectOption({ label: "45 min" });

    await expect(page.getByRole("button", { name: "Concludi" })).toHaveCount(0);
    await expect(page.getByText("Hai scelto e applicato una strategia adatta in un compito diverso.")).toHaveCount(0);
    await expect(page.locator('.strategyWorkbench__rail li[data-earned="true"]')).toHaveCount(2);

    await page.getByRole("button", { name: "Controlla il confronto" }).click();
    await expect(page.getByText(/Il confronto non è ancora completo o coerente/)).toBeVisible();
  });
});


test.describe("PW-STRATEGY-SELECTION construction invalidation completeness", () => {
  test("Svuota revokes a previously validated construction and its trace", async ({ page }) => {
    await page.goto("/percorsi/lab/pw-strategy-selection-01");
    await page.getByRole("button", { name: "Apri il banco degli strumenti" }).click();
    await page.getByRole("button", { name: /Sequenza \+ recupero/ }).click();
    await page.getByRole("button", { name: "Copri la scheda e prova" }).click();

    for (const token of ["stazione", "ponte", "pioggia", "cresta", "osservazione"]) {
      await page.getByRole("button", { name: token, exact: true }).click();
    }
    await page.getByRole("button", { name: "Controlla", exact: true }).click();
    await expect(page.getByText("Hai scelto e applicato uno strumento coerente con lo scopo del compito.")).toBeVisible();
    await expect(page.locator('.strategyWorkbench__rail li[data-earned="true"]')).toHaveCount(1);

    await page.getByRole("button", { name: "Svuota" }).click();

    await expect(page.getByText("Hai scelto e applicato uno strumento coerente con lo scopo del compito.")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Continua", exact: true })).toHaveCount(0);
    await expect(page.locator('.strategyWorkbench__rail li[data-earned="true"]')).toHaveCount(0);
  });
});
