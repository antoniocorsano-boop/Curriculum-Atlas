import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const requireOne = (s, pattern, label) => {
  const m = s.match(pattern);
  if (!m) throw new Error(`Missing ${label}`);
  return m;
};

// The adapter consumes trusted, locally reviewed Atlas HTML editions, not arbitrary web pages.
// It rejects active content and external links; future formats need an explicit adapter.
export function renderReader(book) {
  if (/<(?:script|iframe|object|embed|form|link|base|svg)\b|\son\w+\s*=|javascript:|url\s*\(/i.test(book)) throw new Error('Active or unsupported edition');
  const main = requireOne(book, /<main class="wrap">([\s\S]+)<\/main>/, 'edition main')[1];
  const title = requireOne(main, /<h1>([^<>]+)<\/h1>/, 'title')[1];
  const intro = requireOne(main, /<p class="lead">([\s\S]*?)<\/p>/, 'lead')[1];
  const notice = requireOne(main, /<p class="notice">([\s\S]*?)<\/p>/, 'review notice')[1];
  const nav = requireOne(main, /<nav class="index" id="indice"[^>]*>([\s\S]*?)<\/nav>/, 'index')[1];
  let chapters = requireOne(main, /(<section id="cap1"[\s\S]+)<footer>/, 'chapters')[1];
  const ids = [...chapters.matchAll(/\bid="([a-zA-Z0-9_-]+)"/g)].map(m=>m[1]);
  if (new Set(ids).size !== ids.length || !ids.includes('cap1')) throw new Error('Duplicate or missing chapter ids');
  const targets = new Set([...ids,'indice']);
  for (const m of (nav+chapters).matchAll(/\bhref="([^"]+)"/g)) if (!m[1].startsWith('#') || !targets.has(m[1].slice(1))) throw new Error('Unsupported link '+m[1]);
  for (const m of chapters.matchAll(/<img\b[^>]*>/g)) if (!/\bsrc="data:image\/webp;base64,[A-Za-z0-9+/=]+"/.test(m[0]) || !/\balt="[^"]+"/.test(m[0])) throw new Error('Image missing embedded resource or alt');
  const namespace = s => s.replace(/\b(id|aria-labelledby)="([a-zA-Z0-9_-]+)"/g, '$1="libro-$2"').replace(/href="#([a-zA-Z0-9_-]+)"/g,'href="#libro-$1"');
  chapters = namespace(chapters).replace(/<section id="libro-([^" ]+)"/g,'<section tabindex="-1" id="libro-$1"');
  return `<section class="view immersive" id="libro" hidden aria-labelledby="heading-libro"><article class="reader-page"><a class="back reader-return" href="#storie">← Storie</a><header class="reader-header"><span class="reader-status">${notice}</span><h1 id="heading-libro" tabindex="-1">${title}</h1><p class="reader-lead">${intro}</p></header><details id="libro-indice" class="reader-index"><summary>Indice del racconto</summary><nav aria-label="Capitoli">${namespace(nav)}</nav></details>${chapters}<footer class="reader-footer"><a class="back" href="#storie">← Torna alla raccolta Storie</a></footer></article></section>`;
}
const readerCSS = `
body.reading .bar{display:none}body.reading .wrap{width:min(100% - 24px,860px);margin:0 auto 24px}body.reading .foot{display:none}
body.reading{background:#f6f2e9}.immersive{color:#182c3b;min-width:0}.reader-page{min-width:0;padding:8px 0 24px}.reader-return{min-height:44px}.reader-status{display:block;font-size:.75rem;color:#695333;line-height:1.35}.reader-header h1{font:600 clamp(1.9rem,5vw,3.4rem)/1.12 Georgia,serif;margin:7px 0 8px;overflow-wrap:anywhere}.reader-lead{margin:0 0 10px;color:#485661;line-height:1.45;font-size:1rem}.reader-index{margin:6px 0 14px;border:1px solid #c9c4b8;border-radius:8px;background:#fff}.reader-index summary{cursor:pointer;min-height:44px;padding:10px 12px;font-weight:650}.reader-index nav,.immersive .turn{display:flex;flex-wrap:wrap;gap:8px;padding:0 10px 10px}.reader-index a,.immersive .turn a{display:inline-flex;align-items:center;min-height:44px;padding:8px 12px;border:1px solid #c9c4b8;border-radius:7px;background:white;color:#155c6c;font-weight:650;min-width:0}.immersive section{border-top:1px solid #d3cbbc;padding:18px 0 24px;scroll-margin-top:12px;min-width:0}.immersive section h2{font:600 clamp(1.6rem,4vw,2.6rem)/1.15 Georgia,serif;margin:5px 0 14px}.immersive .eyebrow{color:#875327;font-weight:750;font-size:.8rem;text-transform:uppercase;letter-spacing:.06em}.immersive figure{margin:0 0 20px}.immersive img{display:block;width:100%;height:auto;border-radius:10px}.immersive figcaption{margin:6px 0 0;font-size:.85rem;color:#485661}.immersive .prose{max-width:65ch;margin:auto;font:clamp(1.1rem,2.6vw,1.35rem)/1.75 Georgia,serif}.immersive .prose p{margin:0 0 1em}.immersive .poesia{margin:20px 0;padding:16px 18px;border-left:4px solid #32685c;background:#e8eee6;font-style:italic}.immersive .turn{padding:8px 0 0;justify-content:space-between}.immersive .chain,.immersive .outputs{display:grid;gap:8px;grid-template-columns:repeat(2,minmax(0,1fr))}.immersive .chain>div,.immersive .outputs>div{min-width:0;padding:12px;border:1px solid #d0cbc0;background:white;border-radius:8px}.immersive .chain small{display:block}.immersive .outputs{margin-top:10px}.immersive #libro-mappa a{color:#155c6c;text-decoration:underline}.immersive :focus-visible{outline:3px solid #a65124;outline-offset:3px}.reader-footer{border-top:1px solid #d3cbbc;padding:10px 0}.immersive section:focus,.reader-header h1:focus{outline:none}
@media(max-width:570px){.reader-lead{font-size:.93rem}.immersive .chain,.immersive .outputs{grid-template-columns:minmax(0,1fr)}.immersive .prose{line-height:1.65}.immersive .turn a{flex:1}}
@media print{body.reading{background:white}.reader-return,.reader-index,.immersive .turn,.reader-footer{display:none!important}.immersive section{break-before:page}.immersive img{max-height:110mm;object-fit:contain}.immersive .prose{font-size:12pt}}
`;
const router = `<script>
const views=[...document.querySelectorAll('.view')];
let previous=null, storyScroll=0;
function route(){
 const id=location.hash.slice(1)||'home';
 const readerTarget=id.startsWith('libro-')?document.getElementById(id):null;
 const view=views.find(x=>x.id===(readerTarget?'libro':id))||views[0];
 if(previous==='storie'&&view.id==='libro') storyScroll=window.scrollY;
 for(const v of views)v.hidden=v!==view;
 document.body.classList.toggle('reading',view.id==='libro');
 for(const a of document.querySelectorAll('[data-nav]')){if(a.dataset.nav===view.id||view.id==='libro'&&a.dataset.nav==='storie')a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
 if(readerTarget){if(readerTarget.id==='libro-indice'){readerTarget.open=true;readerTarget.querySelector('summary').focus({preventScroll:true});}else readerTarget.focus({preventScroll:true});readerTarget.scrollIntoView({block:'start'});}
 else if(previous==='libro'&&view.id==='storie'){view.querySelector('.feature').focus({preventScroll:true});window.scrollTo(0,storyScroll);}
 else{window.scrollTo(0,0);view.querySelector('h1')?.focus({preventScroll:true});}
 previous=view.id;
}
window.addEventListener('hashchange',route);route();
</script>`;
export function buildImmersivePreview(library,book,expectedSha){
 if(!/^[a-f0-9]{64}$/.test(expectedSha)||sha256(book)!==expectedSha)throw new Error('Edition hash mismatch');
 const old= requireOne(library, /<script>const book64\s*=\s*"([A-Za-z0-9+/=]+)";[\s\S]*?<\/script>/, 'previous reader script');
 if(sha256(Buffer.from(old[1],'base64'))!==expectedSha)throw new Error('Library edition differs');
 const view=requireOne(library, /<section class="view" id="libro"[\s\S]*?<\/iframe><\/section>/, 'previous reader');
 let out=library.replace(view[0],()=>renderReader(book)).replace(old[0],()=>router).replace('</style>',()=>readerCSS+'</style>').replace('frame-src blob:;','frame-src \'none\';');
 if(/<iframe\b|const book64\b/.test(out))throw new Error('Nested reader remains');
 return out;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [library,book,expectedSha,output]=process.argv.slice(2);
 if(!library||!book||!output)throw new Error('Usage: node build-immersive-reader.mjs <local-library.html> <edition.html> <sha256> <local-output.html>');
 const html=buildImmersivePreview(readFileSync(library,'utf8'),readFileSync(book,'utf8'),expectedSha);
 writeFileSync(output,html);console.log('F1 candidate SHA-256',sha256(html));
}
