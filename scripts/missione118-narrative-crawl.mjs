export function addNarrativeCrawl(source){
 let html=source;
 function once(a,b){if(html.split(a).length!==2)throw Error('CRAWL_ANCHOR '+a.slice(0,80));html=html.replace(a,()=>b)}
 const css=[
 '.crawl-box{flex-shrink:0;padding:12px 14px;margin:0 0 8px;background:#cfe8ff;border-color:#6ea8d9;color:#111111}',
 '.crawl-box strong{color:#163b59}.crawl-window{height:clamp(116px,23vh,196px);overflow:hidden;position:relative;scrollbar-width:none;}',
 '.crawl-window::-webkit-scrollbar{display:none}.crawl-text{padding:36px 2px 56px;font-size:clamp(16px,2vw,21px);line-height:1.65;text-align:center;letter-spacing:.015em;color:#111111;}',
 ' .crawl-text p{font-size:inherit;line-height:inherit;margin:0 0 .85em;color:#111111}.crawl-text p:last-child{margin-bottom:0}',
 '.crawl-controls{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.crawl-controls button{flex:1 1 auto;min-height:44px;font-size:12px;padding:7px 9px;background:#e8f4ff;color:#111111;border:1px solid #47769c}.crawl-controls button:hover{background:#b8daf5}.crawl-controls button:focus-visible{outline-color:#174c77}.crawl-box .crawl-status{font-size:12px;color:#163b59;margin-top:5px}.crawl-box[data-static="true"] .crawl-window{height:auto;overflow:visible;mask-image:none}.crawl-box[data-static="true"] .crawl-text{padding:0;text-align:left;line-height:1.5}.crawl-box[data-static="true"] .crawl-motion{display:none}',
 '#playPane:has(.crawl-box){justify-content:flex-start}.crawl-note{font-size:12px;color:var(--muted);margin-top:4px}',
 '@media(max-width:600px){.crawl-window{height:clamp(112px,19vh,158px)}.crawl-text{font-size:17px;line-height:1.55;padding-top:28px;padding-bottom:48px}.crawl-controls{gap:5px}.crawl-box{padding:9px 10px}.crawl-controls button{min-height:44px}.crawl-note{font-size:11px}}',
 '@media(prefers-reduced-motion:reduce){.crawl-window{scroll-behavior:auto}}'
 ].join('\n');
 const layout=[
 '.stage.prologue .control{padding:clamp(10px,2vw,26px);gap:0}',
 '.stage.prologue .control-heading{margin:0 0 8px;min-height:22px}',
 '.stage.prologue .panel-body{justify-content:flex-start;padding:0 2px;gap:8px}',
 '.stage.prologue .crawl-box{margin:0;display:flex;flex-direction:column;flex:1 0 auto;min-height:0}',
 '.stage.prologue .crawl-box strong{margin:0 0 4px}',
 '.stage.prologue .crawl-window{height:clamp(130px,30vh,300px);flex:1 0 auto}',
 '.stage.prologue .crawl-text{padding:8px 2px 22px;text-align:center;font-size:clamp(17px,2vw,22px);line-height:1.55}',
 '.stage.prologue .crawl-text p{font-size:inherit;line-height:inherit;color:#111111}',
 '.stage.prologue .crawl-controls{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:8px}',
 '.stage.prologue .crawl-controls button{min-width:0;min-height:44px;padding:5px;font-size:12px;line-height:1.2}',
 '.stage.prologue .crawl-box[data-static="true"] .crawl-window{height:auto;flex:none;overflow:visible}',
 '.stage.prologue .crawl-box[data-static="true"] .crawl-controls{grid-template-columns:1fr}',
 '.stage.prologue .crawl-status{margin:4px 0 0;min-height:17px;font-size:11px}',
 '.stage.prologue .stage-footer{margin-top:8px;padding-top:8px;min-height:0}',
 '.stage.prologue .narrator-actions{width:100%;display:grid;grid-template-columns:auto 1fr auto;gap:6px}',
 '.stage.prologue .narrator-actions button{min-height:44px;font-size:12px;padding:8px;min-width:0}',
 '.stage.prologue .narrator-actions .primary{grid-column:2}',
 '.stage.prologue .narrator-actions .skip-prologue{grid-column:3}',
 '.stage.prologue .narrator-actions .prev-prologue{grid-column:1;grid-row:1}',
 '.stage.prologue .narrator-actions .primary:last-child{grid-column:2 / -1}',
 '.stage.prologue .local-note{font-size:11px;color:var(--muted);margin:0}',
 '@media(min-width:951px){.stage.prologue .panel-body{justify-content:center}.stage.prologue .crawl-box{flex:0 0 auto}.stage.prologue .visual-copy h1{max-width:15ch}}',
 '@media(max-width:950px){.stage.prologue{grid-template-rows:minmax(100px,30%) minmax(0,70%)}.stage.prologue .visual-copy h1{font-size:clamp(22px,5.6vw,34px)}.stage.prologue .visual-copy p{display:none}.stage.prologue .control{padding:9px 12px}.stage.prologue .crawl-window{height:clamp(116px,25vh,225px)}.stage.prologue .crawl-text{font-size:17px;line-height:1.55}.stage.prologue .crawl-box{padding:9px 10px}.stage.prologue .crawl-controls button{font-size:11px}.stage.prologue .control-heading{margin-bottom:5px}}',
 '@media(max-width:950px) and (max-height:740px){.stage.prologue{grid-template-rows:minmax(80px,24%) minmax(0,76%)}.stage.prologue .crawl-window{height:clamp(100px,23vh,170px)}.stage.prologue .local-note{display:none}.stage.prologue .panel-body{gap:4px}}',
 '@media(max-width:950px) and (max-height:580px){.stage.prologue{grid-template-rows:minmax(62px,18%) minmax(0,82%)}.stage.prologue .crawl-window{height:100px}.stage.prologue .crawl-controls{grid-template-columns:repeat(2,minmax(0,1fr))}}',
 '@media(max-width:360px){.stage.prologue .crawl-controls button{font-size:10px}.stage.prologue .narrator-actions button{font-size:11px}}'
 ].join('\n');
 once('</style>',css+'\n'+layout+'</style>');
 once('function storyFrame(scene,content,footer=\'\',subhead=\'VOCE NARRANTE\'){\n return \x60<div class="stage">','function storyFrame(scene,content,footer=\'\',subhead=\'VOCE NARRANTE\'){\n return \x60<div class="stage prologue">');
 once('<div class="narrator-stage"><span class="prompt-meta">Trasmissione dal 2045</span><span class="count">Scena \'+(st.storyIndex+1)+\' di \'+storyScenes.length+\'</span></div><h2 class="action-title">\'+safe(scene.title)+\'</h2><p class="action-subtitle">\'+safe(scene.lede)+\'</p>','<p class="action-subtitle" style="margin:0">\'+safe(scene.lede)+\'</p>');
 once("btn('← Indietro','storyprev','','secondary')","btn('← Indietro','storyprev','','secondary prev-prologue')");
 once("btn('Salta prologo','enterMission','','secondary')","btn('Salta','enterMission','','secondary skip-prologue')");
 once('<p class="voice-state">Esperienza locale: nessun account o invio di dati. In questa versione di prova i progressi restano nella sessione.','<p class="local-note">Solo sul dispositivo. I progressi restano nella sessione.');

 const runtime=[
 "let crawlFrame=0,crawlStatic=window.matchMedia('(prefers-reduced-motion: reduce)').matches,crawlWpm=120,crawlRunning=false,crawlElapsed=0,crawlLast=null;",
 "function cancelCrawl(){if(crawlFrame)cancelAnimationFrame(crawlFrame);crawlFrame=0;crawlLast=null;crawlRunning=false;}",
 "function crawlMarkup(text){",
 " const sentences=text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text];",
 " return '<div class=\"narrator-box crawl-box\" data-static=\"'+crawlStatic+'\"><strong>Narrazione</strong><div class=\"crawl-window\" id=\"crawlWindow\" role=\"region\" aria-label=\"Testo della scena\"><div class=\"crawl-text\" id=\"crawlText\">'+sentences.map(s=>'<p>'+safe(s.trim())+'</p>').join('')+'</div></div><div class=\"crawl-controls\"><button type=\"button\" class=\"secondary crawl-motion\" data-action=\"crawl-toggle\" id=\"crawlToggle\">Pausa</button><button type=\"button\" class=\"secondary crawl-motion\" data-action=\"crawl-speed\" id=\"crawlSpeed\">Velocità: normale</button><button type=\"button\" class=\"secondary crawl-motion\" data-action=\"crawl-replay\">Rileggi</button><button type=\"button\" class=\"secondary\" data-action=\"crawl-static\" id=\"crawlStatic\">'+(crawlStatic?'Testo in movimento':'Testo fermo')+'</button></div><p class=\"crawl-status\" id=\"crawlStatus\" aria-live=\"polite\">'+(crawlStatic?'Lettura libera':'Scorrimento della scena')+'</p></div>';",
 "}",
 "function updateCrawlControls(message){",
 " const toggle=document.getElementById('crawlToggle'),speed=document.getElementById('crawlSpeed'),status=document.getElementById('crawlStatus');",
 " if(toggle)toggle.textContent=crawlRunning?'Pausa':'Riprendi';",
 " if(speed)speed.textContent='Velocità: '+({90:'lenta',120:'normale',150:'rapida'}[crawlWpm]);",
 " if(status&&message)status.textContent=message;",
 "}",
 "function crawlTick(now){",
 " const view=document.getElementById('crawlWindow'),text=document.getElementById('crawlText');",
 " if(!view||!text||!crawlRunning||crawlStatic){cancelCrawl();return;}",
 " if(crawlLast!==null)crawlElapsed+=Math.min(100,now-crawlLast)*crawlWpm/120;",
 " crawlLast=now;",
 " const words=Array.from(text.querySelectorAll('p'),p=>p.textContent).join(' ').trim().split(/\\s+/).length;",
 " const duration=words*500+1600;",
 " const progress=Math.min(1,Math.max(0,(crawlElapsed-800)/duration));",
 " view.scrollTop=(view.scrollHeight-view.clientHeight)*progress;",
 " if(progress>=1){cancelCrawl();updateCrawlControls('Fine della lettura. Puoi proseguire o rileggere.');return;}",
 " crawlFrame=requestAnimationFrame(crawlTick);",
 "}",
 "function playCrawl(reset=false){",
 " cancelCrawl();const view=document.getElementById('crawlWindow');if(!view||crawlStatic)return;",
 " if(reset){crawlElapsed=0;view.scrollTop=0;}",
 " crawlRunning=true;updateCrawlControls('Scorrimento della scena');crawlFrame=requestAnimationFrame(crawlTick);",
 "}",
 "function initCrawl(){cancelCrawl();crawlElapsed=0;if(!document.getElementById('crawlWindow'))return;if(!crawlStatic)playCrawl(true);}",
 "function crawlAction(action){",
 " const view=document.getElementById('crawlWindow');if(!view)return;",
 " if(action==='crawl-toggle'){if(crawlRunning){cancelCrawl();updateCrawlControls('In pausa');}else{if(view.scrollTop>=view.scrollHeight-view.clientHeight-1)playCrawl(true);else playCrawl();}}",
 " if(action==='crawl-speed'){crawlWpm=crawlWpm===90?120:crawlWpm===120?150:90;updateCrawlControls();}",
 " if(action==='crawl-replay')playCrawl(true);",
 " if(action==='crawl-static'){crawlStatic=!crawlStatic;render();}",
 "}"
 ].join('\n');
 once('function stopNarration(){st.autoNarrate=false;}',runtime+'\nfunction stopNarration(){cancelCrawl();st.autoNarrate=false;}');
 once('+narrator(safe(scene.text))+','+crawlMarkup(scene.text)+');
 once(" save(); const panel=document.getElementById('playPane'); if(panel)panel.scrollTop=0;"," save(); const panel=document.getElementById('playPane'); if(panel)panel.scrollTop=0; initCrawl();");
 once("switch(b.dataset.action){case 'storynext':","switch(b.dataset.action){case 'crawl-toggle':case 'crawl-speed':case 'crawl-replay':case 'crawl-static':crawlAction(b.dataset.action);break;case 'storynext':");
 once('La narrazione audio non è ancora disponibile.','Puoi seguire il testo in movimento oppure leggerlo da fermo.');
 return html;
}
