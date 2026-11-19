#!/usr/bin/env bash
set -euo pipefail
# Use the Playwright version resolved by the frozen lockfile. Do not substitute
# a system browser, skip tests, or change the browser binary on recovery.
export PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=90000
for attempt in 1 2; do
  if timeout 180 pnpm exec playwright install chromium; then break; fi
  if [[ "$attempt" == 2 ]]; then echo "::error::Pinned Chromium download failed"; exit 1; fi
  sleep 5
done
smoke() {
  timeout 45 node --input-type=module <<'JS'
import {chromium} from "playwright";
const browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
try{
 const page=await browser.newPage();
 const result=await page.evaluate(()=>{
   const canvas=document.createElement("canvas");
   const gl=canvas.getContext("webgl2")||canvas.getContext("webgl");
   if(!gl)return false;
   gl.clearColor(.2,.4,.6,1);gl.clear(gl.COLOR_BUFFER_BIT);
   const p=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);
   return gl.getError()===gl.NO_ERROR&&p[0]===51&&p[1]===102&&p[2]===153&&p[3]===255;
 });
 if(!result)throw Error("Chromium WebGL smoke failed");
 console.log("Pinned Chromium launch and WebGL readback PASS");
}finally{await browser.close()}
JS
}
if smoke; then
  echo "CHROMIUM_READY preinstalled OS libraries; no APT network access required"
  exit 0
fi
echo "::warning::Browser smoke failed; attempting bounded official dependency recovery"
for attempt in 1 2; do
  if timeout 210 pnpm exec playwright install-deps chromium; then
    smoke
    echo "CHROMIUM_READY after dependency recovery"
    exit 0
  fi
  if [[ "$attempt" == 2 ]]; then echo "::error::OS dependency recovery failed; browser tests not qualified"; exit 1; fi
  sleep 5
done
