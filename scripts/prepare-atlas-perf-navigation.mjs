// PERF-03 local CI-only source derivative. Never change the reference branch
// runtime or expose an untrusted query/flag that selects navigation policy.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {join} from "node:path";
const [mode,out]=process.argv.slice(2);
assert(["detach-first","navigation-first"].includes(mode));
assert.equal(process.env.ATLAS_GATEWAY_PREVIEW,"true");
assert.equal(process.env.ATLAS_GATEWAY_NATIVE_PREVIEW,"true");
assert.notEqual(process.env.ATLAS_GITHUB_PAGES,"true");
const sha=s=>createHash("sha256").update(s).digest("hex");
const parent="src/features/atlas-gateway/gateway-candidate.tsx";
const child="scripts/atlas-gateway-integration/native-preview-runtime.js";
const beforeParent=readFileSync(parent,"utf8"),beforeChild=readFileSync(child,"utf8");
assert(beforeChild.includes("preserveDrawingBuffer:false"));
let p=beforeParent,c=beforeChild;
function replace(src,old,next){assert.equal(src.split(old).length,2,"Unexpected source binding: "+old.slice(0,100));return src.replace(old,next)}
if(mode==="navigation-first"){
 p=replace(p,'import { flushSync } from "react-dom";\n',"");
 const begin=p.indexOf("  // NAV-STAB-01:");
 const end=p.indexOf("  // If the browser restores",begin);
 assert(begin>=0&&end>begin);
 assert(p.slice(begin,end).includes("flushSync(() => {"));
 p=p.slice(0,begin)+`  // PERF-03 experimental policy: start the full document transition while
  // the old frame is still connected. The browser owns its teardown.
  const navigateNative = useCallback((href: string, channel?: string) => {
    if (nativeDeparting.current) return;
    nativeDeparting.current = true;
    const frame = iframe.current;
    // Prevent further pointer/keyboard interaction without removing the frame.
    // Portal-originated departures are already quiesced. Direct links request
    // quiescence best-effort; never wait for a response or GPU release.
    if (frame) {
      frame.inert = true;
      frame.style.pointerEvents = "none";
      if (channel) frame.contentWindow?.postMessage({type:"atlas-native-depart",channel},"*");
    }
    setNotice("Apertura dell’ambiente Atlas…");
    console.info(frame?.isConnected ? "ATLAS_NATIVE_FRAME_RETAINED" : "ATLAS_NATIVE_FRAME_ABSENT");
    console.info("ATLAS_NATIVE_DOCUMENT_NAV_START");
    window.location.assign(href);
  }, []);

`+p.slice(end);
 p=replace(p,'      if (event.source !== iframe.current?.contentWindow || event.origin !== "null") return;','      if (event.source !== iframe.current?.contentWindow || event.origin !== "null" || nativeDeparting.current) return;');
 p=replace(p,'      assetController.abort();\n      setShow3D(false);\n      setNotice("La scena 3D non risponde.', '      assetController.abort();\n      if (nativeDeparting.current) return;\n      setShow3D(false);\n      setNotice("La scena 3D non risponde.');
 p=replace(p,'if (assetController.signal.aborted || !target || target !== iframe.current?.contentWindow) return;','if (assetController.signal.aborted || nativeDeparting.current || !target || target !== iframe.current?.contentWindow) return;');
 p=replace(p,'if (assetController.signal.aborted) return;\n            window.clearTimeout(timer);','if (assetController.signal.aborted || nativeDeparting.current) return;\n            window.clearTimeout(timer);');
 p=replace(p,'navigateNative(portal.href + "/");\n          } else router.push','navigateNative(portal.href + "/", scene.channel);\n          } else router.push');
 p=replace(p,'navigateNative("/");','navigateNative("/", scene?.channel);');
 p=replace(p,'navigateNative(portal.href + "/");\n             }','navigateNative(portal.href + "/", scene?.channel);\n             }');
 // The opaque child trusts only its real parent, exact parent origin and
 // ephemeral channel. No new destination or network access is accepted.
 const marker='addEventListener("resize",()=>{if(ready&&!closing){setCamera();render()}},events);';
 c=replace(c,marker,marker+`
addEventListener("message",event=>{
  if(event.source!==parent||event.origin!==ATLAS_PARENT_ORIGIN)return;
  const d=event.data;
  if(!d||d.type!=="atlas-native-depart"||d.channel!==ATLAS_CHANNEL)return;
  quiesce();
},events);`);
 assert(!p.includes("flushSync"));
 assert(c.includes("preserveDrawingBuffer:false"));
 writeFileSync(parent,p);writeFileSync(child,c);
}
mkdirSync(out,{recursive:true});
const receipt={mode,scope:"isolated CI-only source derivative",reference:{parent:sha(beforeParent),runtime:sha(beforeChild)},candidate:{parent:sha(p),runtime:sha(c)},changed:mode==="navigation-first",studentAuthorized:false,publishable:false};
writeFileSync(join(out,"perf-navigation-variant.json"),JSON.stringify(receipt,null,2)+"\n");
console.log(JSON.stringify(receipt));
