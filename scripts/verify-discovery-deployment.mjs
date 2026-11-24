import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "@playwright/test";

// Serve the exact canonical static export beneath its actual prefix, locally.
const root = path.resolve("out");
const prefix = "/Curriculum-Atlas";
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".svg":"image/svg+xml", ".json":"application/json", ".woff2":"font/woff2", ".txt":"text/plain" };
const server = http.createServer((req,res) => {
  const url = new URL(req.url, "http://localhost");
  if (!url.pathname.startsWith(prefix + "/")) { res.writeHead(404).end(); return; }
  const rel = decodeURIComponent(url.pathname.slice(prefix.length + 1));
  let file = path.resolve(root, rel);
  if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403).end(); return; }
  if (fs.statSync(file, {throwIfNoEntry:false})?.isDirectory()) file = path.join(file,"index.html");
  if (!fs.statSync(file, {throwIfNoEntry:false})?.isFile()) { res.writeHead(404).end(); return; }
  res.writeHead(200, {"Content-Type":mime[path.extname(file)] ?? "application/octet-stream"});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0,"127.0.0.1",resolve));
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  const base = "http://127.0.0.1:" + server.address().port;
  const target = prefix + "/materials/2026-09-23/3e/dove-va-l-energia.svg";
  const response = await page.goto(base + prefix + "/esplora/");
  assert.equal(response.status(),200);
  await page.getByTestId("scoperta-osserva").click();
  await page.getByTestId("scoperta-collega").click();
  const img = page.getByTestId("scoperta-risorsa-esistente").locator("img");
  await img.scrollIntoViewIfNeeded();
  assert.equal(await img.getAttribute("src"),target);
  assert.equal(await page.getByTestId("scoperta-apri-schema").getAttribute("href"),target);
  await page.waitForFunction(() => {
    const img = document.querySelector('[data-testid="scoperta-risorsa-esistente"] img');
    return img?.complete && img.naturalWidth > 0;
  });
  assert.equal((await page.request.get(base + target)).status(),200);
  console.log("ATLAS DISCOVERY CANONICAL PREFIX: PASS");
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
