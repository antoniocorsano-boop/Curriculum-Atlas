import {readFileSync,writeFileSync} from "node:fs";
import {atlasAnchors,sample,VERSION} from "./core.mjs";
const composition=JSON.parse(readFileSync(new URL("../atlas-gateway-c3/knowledge-composition.json",import.meta.url)));
const anchors=atlasAnchors(composition);
writeFileSync(process.argv[2],JSON.stringify({schemaVersion:VERSION,coordinateSystem:"Blender XYZ",mode:"static",anchors,points:sample(anchors,0,{paused:true})},null,2)+"\n");
