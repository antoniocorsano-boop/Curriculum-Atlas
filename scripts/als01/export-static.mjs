// Single source of truth: export the same validated static sample and optical
// parameters used by the Three.js adapter, for offline Blender inspection.
import {readFileSync,writeFileSync} from "node:fs";
import {atlasAnchors,sample,OPTICS,LIMITS,VERSION,resolveOptics} from "./core.mjs";
const composition=JSON.parse(readFileSync(new URL("../atlas-gateway-c3/knowledge-composition.json",import.meta.url)));
const anchors=atlasAnchors(composition);
const points=sample(anchors,0,{paused:true});
// The library's pale stone background is art-directed as light.
const views=Object.fromEntries(["atrium","vertical"].map(name=>{const [width,height]=composition.cameras[name];return [name,resolveOptics({width,height,backdrop:"light"})]}));
writeFileSync(process.argv[2],JSON.stringify({version:VERSION,optics:OPTICS,limits:LIMITS,anchors,points,views,paused:true},null,2)+"\n",{flag:"wx"});
