"use client";
import { useEffect, useRef, useState } from "react";
import type { SpecializedRendererProps, SpecializedRendererBinding } from "@/features/experiences/specialized-node";
import { verifyEvidence } from "@/../labs/axf-energy/model.mjs";

const base = "/__axf-energy-review/";
function EnergyRenderer({ onEvidence }: SpecializedRendererProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const container = rootRef.current!;
    const shadow = container.shadowRoot ?? container.attachShadow({mode:"open"});
    async function mount() {
      try {
        const response = await fetch(base + "index.html", {cache:"no-store"});
        if (!response.ok) throw Error("Markup unavailable");
        const doc = new DOMParser().parseFromString(await response.text(), "text/html");
        const main = doc.querySelector("main");
        const style = doc.querySelector("style");
        if (!main || !style) throw Error("Missing local markup");
        const image = main.querySelector("img");
        if (!image || image.getAttribute("src") !== "./assets/PE-02.webp") throw Error("Asset mismatch");
        image.src = base + "assets/PE-02.webp";
        // No authored URLs or remote scripts. Only the exact packaged local lab.
        const moduleUrl = base + "scene.mjs";
        const lab = await import(/* webpackIgnore: true */ moduleUrl) as {
          mountEnergyLab: (root: ShadowRoot, onEvidence: (value: unknown) => void) => () => void;
        };
        if (cancelled) return;
        const hostStyle = document.createElement("style");
        hostStyle.textContent = ":host{display:block;background:#f4f0e7;color:#17333c;font:16px/1.5 system-ui,sans-serif;min-width:0}";
        shadow.replaceChildren(hostStyle, style, main);
        dispose = lab.mountEnergyLab(shadow, value => { if (!cancelled) onEvidence(value); });
      } catch {
        if (!cancelled) { onEvidence(null); setError(true); }
      }
    }
    void mount();
    return () => { cancelled = true; dispose?.(); shadow.replaceChildren(); };
  }, [onEvidence]);
  return <><div ref={rootRef} data-energy-host="true" />{error && <p role="alert">Laboratorio non disponibile.</p>}</>;
}

export const energyReviewBinding: SpecializedRendererBinding={rendererId:"energy-lamp",version:1,Component:EnergyRenderer,verifyEvidence};
/** Only loopback review builds may enable the specialized preview; no production deployment is authorized. */
export function specializedReviewEnabled(){
 return process.env.NEXT_PUBLIC_AXF_REVIEW_ONLY==="true" && typeof window!=="undefined" &&
   ["127.0.0.1","localhost","[::1]"].includes(window.location.hostname);
}
const pinned:Record<string,string>={
 "assets/PE-02.webp":"d9f2586cd74bec970263270b5cbbc859b42867b1f7e871217e7408e55398f6ec",
 "vendor/phaser.esm.js":"f4c5fd140d118c10fa9090641a03c17303bab9bfdc28e0626296777db1bb1bde",
};
export async function verifyEnergyReviewAssets(){
 if(!specializedReviewEnabled())throw Error("AXF_REVIEW_DISABLED");
 for(const [path,expected] of Object.entries(pinned)){
  const r=await fetch(base+path,{cache:"no-store"});
  if(!r.ok)throw Error("AXF_ASSET_MISSING");
  const bytes=await r.arrayBuffer();
  if(bytes.byteLength>4*1024*1024)throw Error("AXF_ASSET_SIZE");
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),x=>x.toString(16).padStart(2,"0")).join("");
  if(digest!==expected)throw Error("AXF_ASSET_INTEGRITY");
 }
}
