export function addNarrativeCrawl(source){
 let html=source;
 function once(a,b){if(html.split(a).length!==2)throw Error('CRAWL_ANCHOR '+a.slice(0,80));html=html.replace(a,()=>b)}
 const css=[
 '.crawl-box{flex-shrink:0;padding:12px 14px;margin:0 0 8px;background:#cfe8ff;border-color:#6ea8d9;color:#111111}',
 '.crawl-box strong{color:#163b59}.crawl-window{height:clamp(116px,23vh,196px);overflow:hidden;position:relative;scrollbar-width:none;}',
 '.crawl-window::-webkit-scrollbar{display:none}.crawl-text{padding:36px 2px 56px;font-size:clamp(16px,2vw,21px);line-height:1.65;text-align:center;letter-spacing:.015em;color:#111111;}',
 ' .crawl-text p{font-size:inherit;line-height:inherit;margin:0 0 .85em;color:#111111}.crawl-text p:last-child{margin-bottom:0}',
 '.crawl-controls{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.crawl-controls button{flex:1 1 auto;min-height:44px;font-size:12px;padding:7px 9px;background:#e8f4ff;color:#111111;border:1px solid #47769c}.crawl-controls button:hover{background:#b8daf5}.crawl-controls button:focus-visible{outline-color:#174c77}.crawl-status{font-size:12px;color:#163b59;margin-top:5px}.crawl-box[data-static="true"] .crawl-window{height:auto;overflow:visible;mask-image:none}.crawl-box[data-static="true"] .crawl-text{padding:0;text-align:left;line-height:1.5}.crawl-box[data-static="true"] .crawl-motion{display:none}',
 '#playPane:has(.crawl-box){justify-content:flex-start}.crawl-note{font-size:12px;color:var(--muted);margin-top:4px}',
 '@media(max-width:600px){.crawl-window{height:clamp(112px,19vh,158px)}.crawl-text{font-size:17px;line-height:1.55;padding-top:28px;padding-bottom:48px}.crawl-controls{gap:5px}.crawl-box{padding:9px 10px}.crawl-controls button{min-height:44px}.crawl-note{font-size:11px}}',
 '@media(prefers-reduced-motion:reduce){.crawl-window{scroll-behavior:auto}}'
 ].join('\n');
 once('</style>',css+'</style>');
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
