// Single source of truth: export the same validated static sample and optical
// parameters used by the Three.js adapter, for offline Blender inspection.
import {readFileSync,writeFileSync} from "node:fs";
import {atlasAnchors,sample,OPTICS,LIMITS,VERSION} from "./core.mjs";
const composition=JSON.parse(readFileSync(new URL("../atlas-gateway-c3/knowledge-composition.json",import.meta.url)));
const anchors=atlasAnchors(composition);
const points=sample(anchors,0,{paused:true});
writeFileSync(process.argv[2],JSON.stringify({version:VERSION,optics:OPTICS,limits:LIMITS,anchors,points,paused:true},null,2)+"\n",{flag:"wx"});
