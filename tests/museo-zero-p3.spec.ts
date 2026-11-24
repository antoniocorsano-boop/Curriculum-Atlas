import { test, expect, type Page } from "@playwright/test";
import { loadDocumentedPublicPathways, type DocumentedPathway } from "../src/features/experiences/educational-library";

const LAB = "/experience-lab/museo-zero/";

async function enterTrial(page: Page) {
  await page.getByRole("button", { name: "Vai all’incarico", exact: true }).click();
  await page.getByRole("button", { name: "Osserva la prova", exact: true }).click();
  await expect(page.getByTestId("mz1-stage")).toHaveAttribute("data-state", "0");
}

async function finishOpening(page: Page) {
  for (let i=0; i<3; i++) await page.getByRole("button", { name: "Passo successivo" }).click();
  await expect(page.getByTestId("mz1-stage")).toHaveAttribute("data-state","3");
}

async function finishOpeningFromStepOne(page: Page) {
  for (let i=0; i<2; i++) await page.getByRole("button", { name: "Passo successivo" }).click();
  await expect(page.getByTestId("mz1-stage")).toHaveAttribute("data-state","3");
}

async function collectEvidence(page: Page) {
  await finishOpening(page);
  await page.getByRole("button", { name: "Raccogli gli indizi", exact: true }).click();
  await expect(page.locator('[data-node="MZ2_RECONSTRUCT_DAY"]')).toBeVisible();
  const room = page.locator(".experience-runtime--cinematic");
  await room.getByRole("button", { name: /Percorso invertito/ }).click();
  await room.getByRole("button", { name: "Porta sul banco" }).first().click();
  await room.getByRole("button", { name: /Sala Zero.*Proiezione/i }).click();
  await room.getByRole("button", { name: /Sensor B spostato/ }).click();
  await room.getByRole("button", { name: "Porta sul banco" }).first().click();
  await room.getByRole("button", { name: /Cabina regia/i }).click();
  await room.getByRole("button", { name: /Mappatura cue attiva/ }).click();
  await room.getByRole("button", { name: "Porta sul banco" }).first().click();
  await expect(room.getByText("3 indizi sul banco")).toBeVisible();
}

test.describe("P3 — MUSEO ZERO · review-only canonical derivative", () => {
  test("is exclusively a non-authorized, noindex professional review, not a public portal card", async ({ page }) => {
    const response = await page.goto(LAB);
    await enterTrial(page);
    expect(response?.status()).toBe(200);
    await expect(page.getByTestId("museo-zero-p3-review")).toHaveAttribute("data-student-authorized", "false");
    await expect(page.getByTestId("museo-zero-p3-review")).toHaveAttribute("data-runtime-authorized", "false");
    await expect(page.getByTestId("museo-review-notice").getByText(/Solo revisione professionale/)).toBeVisible();
    await expect(page.getByText(/Revisione prodotto: REVISE|controllo umano del prodotto è ancora REVISE/)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('[data-node="MZ1_FAILED_REHEARSAL"]')).toBeVisible();
    await page.goto("/esperienze/");
    await expect(page.locator('a[href*="museo-zero"]')).toHaveCount(0);
    await page.goto("/percorsi/");
    await expect(page.locator('a[href*="museo-zero"]')).toHaveCount(0);
  });


  test("six user-selected images and the story are navigable before the trial", async ({ page }) => {
    await page.setViewportSize({width: 390,height:844});
    await page.goto(LAB);
    const prologue = page.getByTestId("mz-narrative");
    const image = prologue.locator("img");
    const names = ["sala","squadra","omar","teo","regia","lia"];
    await expect(page.getByTestId("mz1-stage")).toHaveCount(0);
    for (let i=0;i<names.length;i++) {
      await expect(image).toHaveAttribute("src", "/media/museo-zero/narrative-v1/"+names[i]+".webp");
      await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
      await expect(image).not.toHaveAttribute("alt", "");
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
      if(i<names.length-1) await prologue.getByRole("button",{name:"Continua",exact:true}).click();
    }
    await prologue.getByRole("button",{name:"Indietro",exact:true}).click();
    await expect(image).toHaveAttribute("src","/media/museo-zero/narrative-v1/regia.webp");
    await prologue.getByRole("button",{name:"Continua",exact:true}).click();
    await expect(prologue).toContainText("mantenendo accessibile il nuovo ingresso");
    await prologue.getByRole("button",{name:"Osserva la prova",exact:true}).click();
    await expect(prologue).toHaveCount(0);
    await expect(page.getByTestId("mz1-stage")).toHaveAttribute("data-state","0");
    await expect(page.locator("#experience-heading")).toBeFocused();
  });

  test("optional educational profile is bound to the approved fascicle, excludes answers and preserves the scene", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(LAB);
    await enterTrial(page);
    const stage = page.getByTestId("mz1-stage");
    await page.getByRole("button", { name: "Passo successivo" }).click();
    await expect(stage).toHaveAttribute("data-state", "1");
    const trigger = page.getByRole("button", { name: "Il progetto educativo" });
    const dialog = page.getByTestId("museo-educational-info");
    await expect(dialog).not.toBeVisible();
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("data-document-version", "MZ-DID-0.1");
    await expect(dialog).toHaveAttribute("data-experience-version", "P3-REVIEW-1");
    await expect(dialog).toHaveAttribute("data-student-authorized", "false");
    await expect(dialog).toContainText("Finalità e competenze");
    await expect(dialog).toContainText("PROVISIONAL_COMPLETE");
    await expect(dialog).not.toContainText(/Sensor [AB]|mappatura [AB]|raccomandazione attesa|soluzioni riservate/i);
    await expect(dialog.locator("a[href]")).toHaveCount(0);
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(stage).toHaveAttribute("data-state", "1");
    await finishOpeningFromStepOne(page);
    await page.getByRole("button", { name: "Raccogli gli indizi", exact: true }).click();
    await trigger.click();
    await dialog.getByRole("button", { name: "Chiudi", exact: true }).click();
    await expect(page.locator('[data-node="MZ2_RECONSTRUCT_DAY"]')).toBeVisible();
  });


  test("public library excludes candidates and review library exposes a documented preview with working filters", async ({ page }) => {
    await page.goto("/esperienze/");
    const publicLibrary = page.getByTestId("atlas-educational-library");
    await expect(publicLibrary).toBeVisible();
    await expect(publicLibrary.getByTestId("educational-library-empty")).toBeVisible();
    await expect(publicLibrary).not.toContainText("Museo Zero");
    await expect(publicLibrary.locator('a[href*="experience-lab"]')).toHaveCount(0);
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("/experience-lab/biblioteca/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByTestId("educational-library-review")).toHaveAttribute("data-student-authorized","false");
    const library = page.getByTestId("atlas-educational-library");
    const card = library.getByTestId("educational-library-card");
    await expect(card).toContainText("Museo Zero");
    await library.getByLabel("Cerca un prodotto").fill("astronomia");
    await expect(card).toHaveCount(0);
    await library.getByLabel("Cerca un prodotto").fill("tecnologia");
    await expect(card).toHaveCount(1);
    await library.getByLabel("Tipologia").selectOption("Storie");
    await expect(card).toHaveCount(0);
    await library.getByLabel("Tipologia").selectOption("Laboratori");
    await expect(card).toHaveCount(1);
    await card.getByText("Il progetto educativo",{exact:true}).click();
    await expect(card.getByText("Finalità e competenze")).toBeVisible();
    await expect(card).toContainText("MZ-DID-0.1");
    await expect(card.getByRole("link",{name:"Apri l’anteprima professionale"})).toHaveAttribute("href","/experience-lab/museo-zero/");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  });

  test("mission is clear before the trial and survives the handoff to investigation", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(LAB);
    await enterTrial(page);
    const mission = page.getByTestId("museo-mission");
    const stage = page.getByTestId("mz1-stage");
    await expect(mission.getByRole("heading", { name: "Il tuo incarico" })).toBeVisible();
    await expect(mission).toContainText("gruppo che prepara Sala Zero per la prova generale");
    await expect(mission).toContainText("mantenga accessibile il nuovo ingresso");
    await expect(mission).toContainText("osserva il passaggio e la risposta della sala");
    await expect(mission).not.toContainText(/Sensor A|Sensor B|mappatura|trigger|cue/i);
    expect(await mission.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect((await mission.boundingBox())!.y).toBeLessThan((await stage.boundingBox())!.y);
    await expect(page.getByRole("button", {name:"Raccogli gli indizi",exact:true})).toHaveCount(0);
    await finishOpening(page);
    await expect(mission).toBeVisible();
    await page.getByRole("button", {name:"Raccogli gli indizi",exact:true}).click();
    await expect(page.locator('[data-node="MZ2_RECONSTRUCT_DAY"]')).toBeVisible();
    await expect(page.getByTestId("museo-mission-reminder")).toContainText("mantenga accessibile il nuovo ingresso");
    await expect(page.getByRole("navigation", {name:"Luoghi del percorso"})).toBeVisible();
  });

  test("first failed rehearsal shows observable delayed room, not just status cards", async ({ page }) => {
    await page.goto(LAB);
    await enterTrial(page);
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-outcome", "delayed");
    const stage = page.getByTestId("mz1-stage");
    await expect(stage).toHaveAttribute("data-state","0");
    await expect.poll(() => stage.locator("img").evaluateAll(imgs => imgs.every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await expect(page.getByRole("button", {name:"Raccogli gli indizi",exact:true})).toHaveCount(0);
    await page.getByRole("button", {name:"Passo successivo"}).click();
    await expect(stage).toHaveAttribute("data-state","1");
    await expect(stage.locator(".mz-opening__projection")).toHaveCSS("opacity","0");
    await page.getByRole("button", {name:"Passo successivo"}).click();
    await expect(page.getByTestId("museo-risposta-sala")).toContainText("parete rimane spenta");
    await page.getByRole("button", {name:"Passo successivo"}).click();
    await expect(stage.locator(".mz-opening__projection")).toHaveCSS("opacity","1");
    await expect(stage.getByRole("button")).toHaveCount(3);
    await stage.getByRole("button",{name:"Esamina: Sensore B"}).click();
    await expect(page.getByRole("heading",{name:"Sensore B"})).toBeVisible();
    await page.getByRole("button",{name:"Ricomincia prova"}).click();
    await expect(stage).toHaveAttribute("data-state","0");
  });

  test("investigation can be followed in non-fixed order, with evidence pinned and timeline reordered", async ({ page }) => {
    await page.goto(LAB);
    await enterTrial(page);
    await collectEvidence(page);
    const decision = page.locator(".experience-decision");
    const choices = decision.getByRole("button", { name: /Metto in fila|Collego subito/ });
    await expect(choices.first()).toBeDisabled();
    await page.getByRole("button", { name: "Metti in fila" }).click();
    await expect(choices.first()).toBeEnabled();
    await expect(page.getByTestId("museo-cronologia")).toBeVisible();
    await expect(page.getByTestId("museo-cronologia").getByRole("listitem")).toHaveCount(3);
    await page.getByRole("button", { name: "Sposta prima: Sensor B spostato" }).click();
    const texts = await page.getByTestId("museo-cronologia").getByRole("listitem").locator("strong").allTextContents();
    expect(texts[0]).toBe("Sensor B spostato");
    await decision.getByRole("button", { name: "Continua" }).click();
    await expect(page.locator('[data-node="MZ3_TIMELINE_LIMIT"]')).toBeVisible();
    await page.getByRole("button", { name: "Collega", exact: true }).click();
    await expect(page.getByTestId("museo-relazioni")).toBeVisible();
    await page.getByTestId("museo-relazioni").getByRole("button", { name: "Collega" }).first().click();
    await page.getByTestId("museo-relazioni").getByRole("button", { name: "Collega" }).last().click();
    await expect(page.getByText("Le relazioni che stai costruendo")).toBeVisible();
    await expect(page.locator(".museo-bench__connections p").first()).toContainText("→");
  });

  test("removing a clue after choosing blocks progress and removes stale connections and pending origin", async ({ page }) => {
    await page.goto(LAB);
    await enterTrial(page);
    await collectEvidence(page);
    await page.getByRole("button", { name: "Collega", exact: true }).click();
    const bench = page.getByTestId("museo-relazioni");
    const decision = page.locator(".experience-decision");
    const next = decision.getByRole("button", { name: "Continua", exact: true });
    const joins = bench.getByRole("button", { name: "Collega", exact: true });
    await joins.first().click();
    await joins.last().click();
    const connections = bench.locator(".museo-bench__connections");
    await expect(connections).toContainText("Percorso invertito");
    await expect(connections).toContainText("Mappatura cue attiva");
    await joins.last().click();
    await expect(bench.getByRole("button", { name: "Scegli un secondo indizio" })).toHaveCount(1);
    await expect(next).toBeEnabled();
    const clue = page.locator(".experience-evidence").filter({ hasText: "Mappatura cue attiva" });
    await clue.getByRole("button", { name: "Sul banco", exact: true }).click();
    await expect(next).toBeDisabled();
    await expect(page.locator('[data-node="MZ2_RECONSTRUCT_DAY"]')).toBeVisible();
    await expect(connections).toContainText("Non hai ancora collegato due indizi.");
    await expect(connections).not.toContainText(/ev-route|ev-mapping/);
    await expect(bench.getByRole("button", { name: "Scegli un secondo indizio" })).toHaveCount(0);
    await clue.getByRole("button", { name: "Porta sul banco", exact: true }).click();
    await expect(next).toBeEnabled();
    await expect(connections).toContainText("Non hai ancora collegato due indizi.");
    await joins.first().click();
    await joins.last().click();
    await expect(connections).toContainText("Mappatura cue attiva");
    await next.click();
    // The canonical CONNECTIONS choice leads directly to the mapping trial.
    await expect(page.locator('[data-node="MZ4_TEST_MAPPING"]')).toBeVisible();
    await page.getByRole("button", { name: "Provo il trigger su Sensor B" }).click();
    await page.getByRole("button", { name: "Continua dalla conseguenza" }).click();
    await expect(page.locator('[data-node="MZ5_COMPARE_RECOVERY"]')).toBeVisible();
    const compare = page.getByRole("button", { name: "Confronta", exact: true });
    await expect(compare).toBeEnabled();
    await compare.click();
    await expect(page.getByTestId("museo-confronto")).toBeVisible();
  });

  test("simulated sensor mapping visibly changes room and preserves authored branched route", async ({ page }) => {
    await page.goto(LAB);
    await enterTrial(page);
    await collectEvidence(page);
    await page.getByRole("button", { name: "Collega", exact: true }).click();
    await page.locator(".experience-decision").getByRole("button", { name: "Continua" }).click();
    await expect(page.locator('[data-node="MZ4_TEST_MAPPING"]')).toBeVisible();
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-outcome", "delayed");
    await page.getByRole("button", { name: "Provo il trigger su Sensor B" }).click();
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-outcome", "stable");
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-after-choice", "true");
    await expect(page.getByTestId("museo-risposta-sala")).toContainText("parete si illumina");
    await page.getByRole("button", { name: "Provo un cue manuale" }).click();
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-outcome", "manual");
    await page.getByRole("button", { name: "Provo il trigger su Sensor B" }).click();
    await page.getByRole("button", { name: "Continua dalla conseguenza" }).click();
    await expect(page.locator('[data-node="MZ5_COMPARE_RECOVERY"]')).toBeVisible();
  });

  test("constraints are actually compared before recommending recovery and closing quietly", async ({ page }) => {
    await page.goto(LAB);
    await enterTrial(page);
    await collectEvidence(page);
    await page.getByRole("button", { name: "Collega", exact: true }).click();
    await page.locator(".experience-decision").getByRole("button", { name: "Continua" }).click();
    await page.getByRole("button", { name: "Provo il trigger su Sensor B" }).click();
    await page.getByRole("button", { name: "Continua dalla conseguenza" }).click();
    await expect(page.locator('[data-node="MZ5_COMPARE_RECOVERY"]')).toBeVisible();
    await page.getByRole("button", { name: "Confronta", exact: true }).click();
    const matrix = page.getByTestId("museo-confronto");
    await expect(matrix).toBeVisible();
    await expect(matrix.getByRole("row")).toHaveCount(4);
    await expect(matrix).toContainText("Nuovo ingresso accessibile");
    await expect(matrix).toContainText("Affidabilità nel tempo");
    await expect(matrix.getByRole("row", { name: /Ripristino il vecchio percorso/ })).toContainText("Non collegato");
    await matrix.getByRole("row", { name: /Aggiorno la mappatura a Sensor B/ }).getByRole("button", { name: "Prova questa soluzione" }).click();
    await expect(page.getByRole("button", { name: "Continua dalla conseguenza" })).toBeEnabled();
    await page.getByRole("button", { name: "Continua dalla conseguenza" }).click();
    await expect(page.locator('[data-node="MZ6_FINAL_REHEARSAL"]')).toBeVisible();
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-outcome", "stable");
    await page.getByRole("button", { name: "Continua" }).click();
    await expect(page.locator('[data-node="MZ7_QUIET_CLOSE"]')).toBeVisible();
    await page.getByRole("button", { name: "Ricomincia" }).click();
    await expect(page.locator('[data-node="MZ1_FAILED_REHEARSAL"]')).toBeVisible();
  });

  test("no learner writes, identity prompt, local persistence or external dependency", async ({ page }) => {
    const writes: string[] = [];
    const externals: string[] = [];
    const diagnostics: string[] = [];
    page.on("pageerror", error => diagnostics.push(error.stack ?? error.message));
    page.on("console", message => { if (message.type() === "error" || message.type() === "warning") diagnostics.push(message.type() + ": " + message.text()); });
    page.on("request", request => {
      const u = new URL(request.url());
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) { writes.push(request.url()); if (u.pathname === "/__nextjs_original-stack-frames") diagnostics.push("Next development diagnostic: " + (request.postData() ?? "").slice(0, 4000)); }
      if (!["127.0.0.1", "localhost"].includes(u.hostname)) externals.push(request.url());
    });
    await page.goto(LAB);
    await enterTrial(page);
    await finishOpening(page);
    await page.getByRole("button", { name: "Raccogli gli indizi", exact: true }).click();
    await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
    expect(diagnostics.filter(message => /Each child in a list should have a unique|Next development diagnostic:/.test(message)), diagnostics.join("\n")).toEqual([]);
    expect(writes, diagnostics.join("\n")).toEqual([]);
    expect(externals).toEqual([]);
    const records = await page.evaluate(() =>
      Object.keys(localStorage).filter(key => key.includes("museo-zero"))
    );
    expect(records).toEqual([]);
  });

  for (const width of [320, 360, 390, 768, 1280]) {
    test("museum review has no document overflow at " + width + "px", async ({ page }) => {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
      await page.goto(LAB);
    await enterTrial(page);
      await expect(page.getByTestId("museo-risposta-sala")).toBeVisible();
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    });
  }

  test("respects reduced-motion preference with a readable non-animated room state", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(LAB);
    await enterTrial(page);
    await expect(page.getByTestId("museo-risposta-sala")).toHaveAttribute("data-outcome", "delayed");
    const transition = await page.locator(".mz-opening__visitor").evaluate(el => getComputedStyle(el).transitionDuration);
    expect(transition).toBe("0s");
    await finishOpening(page);
    await expect(page.getByRole("button",{name:"Raccogli gli indizi",exact:true})).toBeVisible();
  });
});

test("library admission requires an exact authorized, active, documented edition", () => {
  // Synthetic fixture only; never part of the public portfolio.
  const binding = {runtimeExactHead:"a".repeat(40),pathwayId:"pw-synthetic",contentVersion:"1.0",publicationId:"pw-synthetic@1.0"};
  const authorityRef="test:authority", at="2026-11-24T00:00:00Z";
  const entry: DocumentedPathway = {
    pathwayId:binding.pathwayId,version:binding.contentVersion,title:"Prodotto sintetico",
    runtimeAuthorization:"RUNTIME_AUTHORIZED",availability:"ACTIVE",publicationState:"PUBLISHED",
    provenanceRef:"test:provenance",authorityRef,publicPath:"/percorsi/pw-synthetic/",
    runtimeQualificationTarget:{...binding,surfaceArtifactDigest:"b".repeat(64),intendedPublicPath:"/percorsi/pw-synthetic/"},
    runtimeQualificationReceipt:{
      schemaVersion:"percorsi-g2-runtime-qualification/v1",
      candidate:{...binding,authorityRef,publicationState:"QUALIFIED",qualificationContractVersion:"v1"},
      gates:Object.fromEntries(["Q1","Q2","Q3","Q4","Q5","Q6","Q7","Q8"].map(name=>[name,{status:"PASS",evidenceRefs:["test:"+name],reviewerClass:"INDEPENDENT",checkedAt:at,candidateBinding:{...binding}}])),
      decision:{status:"RUNTIME_AUTHORIZED",authorityRef,decidedAt:at},
    },
    educationalProfile:{experienceVersion:binding.contentVersion,publicationId:binding.publicationId,authorityRef,
      documentVersion:"DOC-1",documentDigest:"c".repeat(64),publicDocumentApproved:true,
      form:"Percorsi",discipline:"Tecnologia",audience:"Secondaria",summary:"Scheda sintetica",
      sections:[{title:"Finalità e competenze",text:"Osservare e motivare."}]},
  };
  const item=loadDocumentedPublicPathways([entry]);
  expect(item).toHaveLength(1);
  expect(item[0]).toMatchObject({id:binding.pathwayId,version:binding.contentVersion,documentVersion:"DOC-1",href:entry.publicPath});
  expect(item[0]).not.toHaveProperty("runtimeQualificationReceipt");
  expect(item[0]).not.toHaveProperty("authorityRef");
  const variants: DocumentedPathway[]=[
    {...entry,runtimeAuthorization:"NOT_RUNTIME_AUTHORIZED"},
    {...entry,availability:"WITHDRAWN"},
    {...entry,publicationState:"QUALIFIED"},
    {...entry,publicPath:"/experience-lab/museo-zero/"},
    {...entry,runtimeQualificationReceipt:undefined},
    {...entry,authorityRef:"test:other"},
    {...entry,runtimeQualificationTarget:{...entry.runtimeQualificationTarget,runtimeExactHead:"d".repeat(40)}},
    {...entry,runtimeQualificationTarget:{...entry.runtimeQualificationTarget,surfaceArtifactDigest:"invalid"}},
    {...entry,educationalProfile:undefined},
    {...entry,educationalProfile:{...entry.educationalProfile!,experienceVersion:"2.0"}},
    {...entry,educationalProfile:{...entry.educationalProfile!,publicationId:"different"}},
    {...entry,educationalProfile:{...entry.educationalProfile!,documentDigest:"invalid"}},
    {...entry,educationalProfile:{...entry.educationalProfile!,sections:[]}},
    {...entry,educationalProfile:{...entry.educationalProfile!,sections:[{title:"Finalità",text:"Test"},{title:"Finalità",text:"Duplicato"}]}},
  ];
  for(const variant of variants) expect(loadDocumentedPublicPathways([variant])).toEqual([]);
  expect(loadDocumentedPublicPathways([entry,structuredClone(entry)])).toEqual([]);
  const invalid=structuredClone(entry);
  const receipt=invalid.runtimeQualificationReceipt as {gates:Record<string,{status:string;candidateBinding:Record<string,string>}>};
  receipt.gates.Q3.status="FAIL";
  expect(loadDocumentedPublicPathways([invalid])).toEqual([]);
  receipt.gates.Q3.status="PASS";
  receipt.gates.Q3.candidateBinding.contentVersion="2.0";
  expect(loadDocumentedPublicPathways([invalid])).toEqual([]);
});
