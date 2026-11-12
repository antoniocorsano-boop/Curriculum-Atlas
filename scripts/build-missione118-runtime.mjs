import {addPrologueVideo} from "./missione118-prologue-video.mjs";
import {addCompletionReceipt} from "./missione118-completion-receipt.mjs";
import {addLocalProgress} from "./missione118-local-progress.mjs";
import {addNarrativeCrawl} from "./missione118-narrative-crawl.mjs";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
const SOURCE="content/staging/missione-118/experience.html";
const SHA="22971583a2a7dc2d45947b4ce19a843a057b05864b9a2b896762728c9519175e";
const digest=x=>createHash("sha256").update(x).digest("hex");
const source=await readFile(SOURCE);
if(digest(source)!==SHA)throw Error("CANONICAL_SOURCE_DRIFT");
let html=source.toString("utf8");
function once(old,replacement){
 if(html.split(old).length!==2)throw Error("PATCH_ANCHOR: "+old.slice(0,70));
 html=html.replace(old,()=>replacement);
}
function between(start,end,replacement){
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 if(a<0||b<0||html.indexOf(start,a+start.length)>=0)throw Error("PATCH_RANGE: "+start);
 html=html.slice(0,a)+replacement+html.slice(b);
}
once('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:; media-src data:; connect-src \'none\'; object-src \'none\'; frame-src \'none\'; worker-src \'none\'; base-uri \'none\'; form-action \'none\'">\n<link rel="icon" href="data:,">');
once("<title>Missione 118 | Narrazione professionale</title>","<title>Missione 118 | Esperienza locale</title>");
once("Missione 118: avventura didattica con prologo narrato, voce narrante integrata e tre ambienti interattivi. Utilizzabile offline.","Missione 118: avventura didattica locale, prologo illustrato e tre ambienti interattivi.");
once("const STORE='missione118-voice-pro-v5';","");
between("try{const previous=JSON.parse(localStorage","const safe=s=>","const save=()=>{}; // R1 session only; R2 adds validated persistence.\n");
between("let activeUtterance=null;","const rooms=","function stopNarration(){st.autoNarrate=false;}\nfunction finishNarration(){stopNarration();st.stage=1;st.phase='intro';st.storyIndex=storyScenes.length-1;st.feedback=null;st.hint=false;render();}\n");
between("function narration(){","function intro(){",[
 "function narration(){",
 " const scene=storyScenes[st.storyIndex];",
 " const footer='<div class=\"narrator-actions\">'+(st.storyIndex>0?btn('← Indietro','storyprev','','secondary'):'')+btn(st.storyIndex===storyScenes.length-1?'Entra nella missione →':'Scena successiva →',st.storyIndex===storyScenes.length-1?'enterMission':'storynext')+(st.storyIndex<storyScenes.length-1?btn('Salta prologo','enterMission','','secondary'):'')+'</div>';",
 " return storyFrame(scene,'<div class=\"narrator-stage\"><span class=\"prompt-meta\">Trasmissione dal 2045</span><span class=\"count\">Scena '+(st.storyIndex+1)+' di '+storyScenes.length+'</span></div><h2 class=\"action-title\">'+safe(scene.title)+'</h2><p class=\"action-subtitle\">'+safe(scene.lede)+'</p>'+narrator(safe(scene.text))+'<p class=\"voice-state\">Esperienza locale: nessun account o invio di dati. In questa versione di prova i progressi restano nella sessione. La narrazione audio non è ancora disponibile.</p>',footer,'PROLOGO ILLUSTRATO');",
 "}",
].join("\n")+"\n");
once("PROLOGO NARRATO · 2045","PROLOGO · 2045");
once("<strong>Voce narrante</strong>","<strong>Narrazione</strong>");
once(" populateVoices();","");
once("case 'exportAudio':saveEmbeddedHTML();break;case 'narrate':startNarration();break;case 'stopvoice':stopNarration();render();break;","");
between("document.addEventListener('change'","document.addEventListener('submit'","");
if(/speechSynthesis|SpeechSynthesisUtterance|recordingImport|voiceSelection|localStorage|sessionStorage|indexedDB|navigator\.sendBeacon|fetch\s*\(|XMLHttpRequest|WebSocket|<script\s+[^>]*src\s*=/i.test(html))throw Error("UNEXPECTED_RUNTIME_CAPABILITY");
html=addCompletionReceipt(addLocalProgress(addNarrativeCrawl(html)));
const videoPath=process.env.M118_PROLOGUE_MP4, expectedVideoSha=process.env.M118_PROLOGUE_SHA256;
if(Boolean(videoPath)!==Boolean(expectedVideoSha))throw Error("PROLOGUE_PATH_AND_HASH_REQUIRED");
let videoSha=null;
if(videoPath){const result=addPrologueVideo(html,await readFile(videoPath),expectedVideoSha);html=result.html;videoSha=result.sha256;}
const output=resolve(process.argv[2]||"artifacts/missione118-runtime/Missione118.html");
await mkdir(dirname(output),{recursive:true});
await writeFile(output,html);
await writeFile(resolve(dirname(output),"manifest.json"),JSON.stringify({contract:"trama.missione118-local-runtime/v0.1",activityId:"trama-missione-118-2026",sourceVersion:"0.1.0-draft",sourceSha256:SHA,entrypoint:"Missione118.html",entrypointSha256:digest(html),mode:"LOCAL_OPTIONAL_PERSISTENCE",checkpoint:"trama.m118-checkpoint/v1",receipt:"trama.m118-completion-receipt/v1",audio:videoSha?"EMBEDDED_VIDEO_UNREVIEWED":"TEXT_ONLY",narrative:videoSha?"VIDEO_WITH_TEXT_ALTERNATIVE":"VERTICAL_CRAWL",prologueVideoSha256:videoSha,prologueReview:videoSha?"PENDING_HUMAN_REVIEW":"MISSING",studentRuntimeAllowed:false,published:false},null,2)+"\n");
console.log("Generated local draft",output,digest(html));
