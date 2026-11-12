import {createHash} from 'node:crypto';
export function addPrologueVideo(source, bytes, expectedSha256) {
 if (!Buffer.isBuffer(bytes) || bytes.length < 16 || bytes.length > 20*1024*1024 || bytes.toString('ascii',4,8)!=='ftyp') throw Error('PROLOGUE_MP4_INVALID');
 const sha256=createHash('sha256').update(bytes).digest('hex');
 if (!/^[a-f0-9]{64}$/.test(expectedSha256||'') || sha256!==expectedSha256) throw Error('PROLOGUE_HASH_MISMATCH');
 let html=source;
 function once(a,b){if(html.split(a).length!==2)throw Error('VIDEO_ANCHOR '+a.slice(0,70));html=html.replace(a,()=>b)}
 const data='data:video/mp4;base64,'+bytes.toString('base64');
 const runtime=`
let prologueMode='video';
const prologueVideoSrc=${JSON.stringify(data)};
function videoPrologue(){
 const scene=storyScenes[0];
 const transcript='<div class="prologue-transcript"><h2>Trascrizione del prologo</h2>'+storyScenes.map(s=>'<section><h3>'+safe(s.title)+'</h3><p>'+safe(s.text)+'</p></section>').join('')+'</div>';
 const content='<h2 class="video-title">Il futuro è da riprogettare</h2><video id="prologueVideo" controls playsinline preload="metadata" aria-label="Video introduttivo Missione 118" src="'+prologueVideoSrc+'"></video><button type="button" id="prologuePlay" class="primary" data-action="prologue-play">Riproduci il video</button><p id="prologueVideoError" role="status" hidden>Il video non è riproducibile su questo dispositivo. Puoi leggere il prologo.</p><p class="local-note">Riproduzione locale. Puoi guardare il video o leggere la trascrizione.</p><details class="video-transcript"><summary>Leggi la trascrizione</summary>'+transcript+'</details>';
 const footer='<div class="video-actions">'+btn('Leggi per scene','prologue-text','','secondary')+btn('Entra nella missione →','enterMission')+'</div>';
 return storyFrame(scene,content,footer,'PROLOGO VIDEO');
}
function initPrologueVideo(){const video=document.getElementById('prologueVideo');if(!video)return;const report=()=>{const msg=document.getElementById('prologueVideoError');if(msg)msg.hidden=false;};video.addEventListener('error',report,{once:true});if(video.error)report();const button=document.getElementById('prologuePlay');const sync=()=>{if(button)button.textContent=video.paused?'Riproduci il video':'Metti in pausa';};video.addEventListener('play',sync);video.addEventListener('pause',sync);video.addEventListener('ended',sync);sync();}function togglePrologueVideo(){const v=document.getElementById('prologueVideo');if(!v)return;if(v.paused)v.play().catch(()=>{const msg=document.getElementById('prologueVideoError');if(msg)msg.hidden=false;});else v.pause();}
`;
 once('function narration(){',runtime+"\nfunction narration(){\n if(prologueMode==='video')return videoPrologue();");
 once("'+crawlMarkup(scene.text)+'", "'+crawlMarkup(scene.text)+btn('Torna al video','prologue-video','','secondary')+'");
 once("initCrawl();\n}","initCrawl(); initPrologueVideo();\n}");
 once("switch(b.dataset.action){case 'crawl-toggle':", "switch(b.dataset.action){case 'prologue-play':togglePrologueVideo();break;case 'prologue-text':prologueMode='text';crawlStatic=true;render();break;case 'prologue-video':stopNarration();prologueMode='video';render();break;case 'crawl-toggle':");
 once('function restart(){progressController.resetProgress();}',"function restart(){prologueMode='video';progressController.resetProgress();}");
 const css=`.stage.prologue:has(#prologueVideo) #playPane{justify-content:flex-start;gap:10px}.video-title{font-size:clamp(20px,3vw,30px);margin:0;color:#f3ecdf}.stage.prologue video{display:block;width:100%;max-height:44vh;min-height:100px;aspect-ratio:16/9;background:#071522;border:1px solid #416477;border-radius:10px}.video-transcript{color:#f3ecdf;font-size:14px;line-height:1.5}.video-transcript summary{cursor:pointer;color:#75e6d5;min-height:44px;display:flex;align-items:center}.prologue-transcript h2{font-size:18px}.prologue-transcript h3{font-size:15px;color:#75e6d5}.prologue-transcript p{font-size:14px}.video-actions{width:100%;display:flex;gap:8px;flex-wrap:wrap}.video-actions button{flex:1;min-height:44px}.stage.prologue:has(#prologueVideo) .section-chip{display:none}@media(max-width:950px){.stage.prologue:has(#prologueVideo){grid-template-rows:minmax(80px,24%) minmax(0,76%)}.stage.prologue video{max-height:33vh}}`;
 once('</style>',css+".stage.prologue:has(#prologueVideo){grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr);background:#08192b}.stage.prologue:has(#prologueVideo) .visual{display:none}.stage.prologue:has(#prologueVideo) .control{width:100%;max-width:1000px;margin:0 auto;border:0;padding:clamp(14px,3vw,32px)}.stage.prologue:has(#prologueVideo) video{max-height:52vh;min-height:0;flex-shrink:0;object-fit:contain}.stage.prologue:has(#prologueVideo) #playPane{padding:0;gap:14px}.stage.prologue:has(#prologueVideo) .video-title{font-size:clamp(24px,4vw,38px);line-height:1.15}.stage.prologue:has(#prologueVideo) .video-actions button{min-width:0}@media(max-width:600px){.brandtxt small{display:none}.brandtxt strong{font-size:12px;letter-spacing:.025em}.top{gap:6px;padding:6px 9px}.brand{gap:6px}.topright{gap:5px}.hp{width:12px}.head-progress{gap:3px}.mini-button{padding:6px 7px}.stage.prologue:has(#prologueVideo) .control{padding:16px 14px}.stage.prologue:has(#prologueVideo) video{max-height:48vh}}"+'</style>');
 return {html,sha256};
}
