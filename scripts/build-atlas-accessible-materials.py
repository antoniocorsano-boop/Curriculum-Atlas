#!/usr/bin/env python3
"""Create a local F2 candidate from the exact, trusted F1 library. No public output."""
import base64, hashlib, html, re, sys
from pathlib import Path
from xml.etree import ElementTree as ET

F1='8cf49de09b929646dc98e2db4f4cdba62a02188c60f841a55df685f47f79aaef'
ASSETS={'bisogno':'1deac84adb0f94c09479a0b3f1b2e24652928534','scheda-bisogno':'086bbc990921a309321cebd81ef3bedf92312837','agricoltura':'ec1468d237a36d6802c1d870771609c3bbc299a1','energia':'93a2ac64cb7e66738cb6e0b15999c584d7d4a91e','scheda-energia':'47be892be7ab820d9acdfc8a0f3791893b1182e3'}
E=html.escape

def git_sha(raw): return hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()
def p(s): return '<p>'+E(s)+'</p>'
def h(s): return '<h2>'+E(s)+'</h2>'
def sequence(t): return '<ol class="material-sequence">'+''.join('<li>'+E(x)+'</li>' for x in t)+'</ol>'
def block(title,body): return '<section class="text-block">'+h(title)+body+'</section>'
def examples(rows):
    return '<div class="material-examples">'+''.join('<section><h3>'+E(row[0])+'</h3>'+''.join(p(x) for x in row[1:])+'</section>' for row in rows)+'</div>'
def blanks(rows,cols):
    return '<div class="worksheet-rows" aria-label="Tabella da completare, organizzata per righe">'+''.join('<section class="worksheet-row"><h3>'+E(row)+'</h3><dl>'+''.join('<div><dt>'+E(col)+'</dt><dd><span class="paper-line" aria-hidden="true"></span><span class="material-sr">Da completare su carta</span></dd></div>' for col in cols)+'</dl></section>' for row in rows)+'</div>'
def writing(): return '<div class="paper-space" aria-label="Spazio di lavoro su carta"></div>'
def gaps(t): return '<ol class="gap-list">'+''.join('<li>'+E(x)+'</li>' for x in t)+'</ol>'

def render(key, t):
    # Index mapping follows the source SVG text order; all source strings are retained or joined across visual line breaks.
    if key=='energia':
        return p(t[1])+block('Le tre fasi del sistema energetico',sequence(t[2:5]))+block('Esempi',examples([t[5:8],t[8:11],t[11:14]]))+block(t[14],p(t[15]))+block(t[16],p(t[17]))+p(t[18])+ '<p class="material-note"><strong>Nota per la lettura:</strong> le frecce indicano il passaggio dall’energia in entrata, attraverso la trasformazione, agli effetti. L’energia si conserva: la parte non utile allo scopo viene trasferita all’ambiente. Questa precisazione è aggiuntiva rispetto all’originale.</p>'
    if key=='bisogno':
        return p(t[1])+block('Dal bisogno al bene o servizio',sequence(t[2:6]))+block('Esempi',examples([t[6:9],t[9:12],t[12:15],t[15:18]]))+block(t[18],p(t[19]))+block(t[20],p(t[21]))+p(t[22])
    if key=='agricoltura':
        return p(t[0])+p(t[1])+block('Il flusso del sistema', '<ol class="material-sequence">'+''.join('<li><strong>'+E(t[i])+'</strong>'+p(t[i+1])+p(t[i+2])+'</li>' for i in [2,5,8])+'</ol>')+block(t[11],p(t[12])+p(t[13]))+p(t[14])
    if key=='scheda-energia':
        return p(t[0]+' · '+t[2])+p(t[1])+ '<p class="paper-identity">'+E(t[3])+'<br>'+E(t[4])+'</p>'+block(t[5],p('Colonna di riferimento: '+t[6])+blanks(t[13:17],[t[7]+' '+t[8],t[9],t[10],t[11]+' '+t[12]]))+block(t[17],p(t[18])+writing())+block(t[19],p(t[20])+p(t[21])+writing())+block(t[22],gaps(t[23:27]))
    if key=='scheda-bisogno':
        return p(t[0]+' · '+t[2])+p(t[1])+'<p class="paper-identity">'+E(t[3])+'<br>'+E(t[4])+'</p>'+block(t[5],p('Colonna di riferimento: '+t[6])+blanks(t[10:15],t[7:10]))+block(t[15],p(t[16])+writing())+block(t[17],gaps(t[18:23]))
    raise ValueError(key)

CSS='''
.material-view {max-width:1020px;margin:auto;min-width:0}.material-view .sectionhead{margin:8px 0 16px}.material-text{max-width:78ch;margin:0 auto;line-height:1.65}.material-text h2{font:600 clamp(1.25rem,2.8vw,1.7rem)/1.25 Georgia,serif;margin:0 0 10px}.material-text h3{font-size:1.02rem;margin:0 0 6px}.material-text p{margin:0 0 10px}.text-block{margin:0 0 14px;padding:14px;border:1px solid #dfe7f0;border-radius:10px;background:white;min-width:0}.material-sequence{padding-inline-start:1.7em;margin:0}.material-sequence li{padding:5px 0}.material-sequence li:not(:last-child){border-bottom:1px solid #dfe7f0}.material-examples{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:10px}.material-examples section,.worksheet-row{border:1px solid #dfe7f0;padding:12px;border-radius:8px;min-width:0}.material-examples p:last-child{margin-bottom:0}.material-note{border-left:4px solid #427d72;padding:10px 12px;background:#e7efec}.worksheet-rows{display:grid;gap:10px}.worksheet-row dl{margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr));gap:8px}.worksheet-row dt{font-weight:650}.worksheet-row dd{margin:0;min-height:28px}.paper-line{display:block;border-bottom:1px solid #78889c;min-height:28px}.paper-space{min-height:100px;border:1px dashed #78889c;border-radius:5px}.paper-identity{overflow-wrap:anywhere;color:#40556a}.gap-list{padding-inline-start:1.5em}.gap-list li{margin-bottom:12px}.material-tools{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}.material-tools button,.visual-tools button,.visual-original summary{font:600 .9rem/1.35 system-ui;color:#164d6b;background:#fff;border:1px solid #9db4c2;border-radius:7px;padding:10px 12px;min-height:44px;cursor:pointer}.material-tools button:focus-visible,.visual-tools button:focus-visible,.visual-original summary:focus-visible,.zoom-window:focus-visible{outline:3px solid #168097;outline-offset:3px}.visual-original{scroll-margin-top:110px;margin:20px auto;max-width:1020px;min-width:0}.visual-original summary{display:list-item}.visual-tools{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:10px 0}.zoom-window{overflow:auto;max-width:100%;max-height:75vh;border:1px solid #dfe7f0;background:white;border-radius:8px}.zoom-window .material{width:100%;max-width:none;padding:8px;margin:0;border:0}.zoom-window img{width:100%;max-width:none;height:auto}.material-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}.material-view .source-note{margin:12px auto;max-width:78ch}.material-view h1{overflow-wrap:anywhere}
@media(max-width:570px){.text-block{padding:11px}.material-view .sectionhead h1{font-size:1.8rem}.worksheet-row dl{grid-template-columns:minmax(0,1fr)}.material-tools button{flex:1 1 120px}}
@media print{body.material-reading{background:white;color:#000}body.material-reading .bar,body.material-reading .foot,body.material-reading .back,body.material-reading .material-tools,body.material-reading .visual-original,body.material-reading .source-note{display:none!important}body.material-reading .wrap,body.material-reading .material-view,body.material-reading .material-text{width:100%;max-width:none;margin:0}body.material-reading .sectionhead{margin:0 0 8pt}body.material-reading .sectionhead h1{font-size:19pt}body.material-reading .material-text{font:11pt/1.35 system-ui}.material-text .text-block{border:0;padding:0;margin:0 0 9pt;break-inside:auto}.material-text h2{font-size:14pt;break-after:avoid}.material-examples section,.worksheet-row{break-inside:avoid;padding:6pt}.worksheet-row dl{grid-template-columns:repeat(2,minmax(0,1fr))}.paper-space{min-height:55pt}.paper-line{min-height:17pt}.material-note{background:white}.gap-list li{margin-bottom:5pt}}
'''
JS='''
function materialZoom(button,delta){const details=button.closest('details');const box=details.querySelector('.material');const label=details.querySelector('[data-zoom-value]');let value=Number(box.dataset.zoom||100);value=delta===0?100:Math.min(300,Math.max(100,value+delta));box.dataset.zoom=String(value);box.style.width=value+'%';label.textContent=value+'%';details.querySelector('[data-zoom="-25"]').disabled=value===100;details.querySelector('[data-zoom="25"]').disabled=value===300;}
for(const btn of document.querySelectorAll('[data-zoom]'))btn.addEventListener('click',()=>materialZoom(btn,Number(btn.dataset.zoom)));
for(const btn of document.querySelectorAll('[data-material-print]'))btn.addEventListener('click',()=>window.print());
for(const btn of document.querySelectorAll('[data-material-visual]'))btn.addEventListener('click',()=>{const details=btn.closest('.material-view').querySelector('.visual-original');details.open=true;details.querySelector('summary').focus({preventScroll:true});details.scrollIntoView({block:'start'});});
'''

def build(src):
    if hashlib.sha256(src.encode()).hexdigest()!=F1: raise ValueError('F1 input hash mismatch')
    for key,sha in ASSETS.items():
        pat=r'<section class="view" id="'+re.escape(key)+r'"[\s\S]*?</section>'
        # Section attributes may appear in any order; match by id and class.
        pat=r'<section\b(?=[^>]*\bclass="view")(?=[^>]*\bid="'+re.escape(key)+r'")[^>]*>[\s\S]*?</section>'
        matches=list(re.finditer(pat,src))
        if len(matches)!=1: raise ValueError('Unexpected view '+key)
        original=matches[0].group();m=re.search(r'<div class="material">(<img\b[^>]+>)</div>',original)
        if not m: raise ValueError('Missing original image '+key)
        tag=m[1];data=re.search(r'src="data:image/svg\+xml;base64,([A-Za-z0-9+/=]+)"',tag)[1];raw=base64.b64decode(data)
        if git_sha(raw)!=sha: raise ValueError('Source mismatch '+key)
        root=ET.fromstring(raw);t=[''.join(x.itertext()) for x in root.findall('.//{http://www.w3.org/2000/svg}text')]
        text=render(key,t)
        replacement='<div class="material-tools"><button type="button" data-material-print>Stampa versione testuale</button><button type="button" data-material-visual>Apri immagine originale</button></div><div class="material-text" aria-label="Versione testuale del materiale">'+text+'</div><details class="visual-original"><summary>Visualizza l’originale illustrato</summary><div class="visual-tools"><button type="button" data-zoom="-25" aria-label="Riduci ingrandimento" disabled>−</button><span data-zoom-value aria-live="polite">100%</span><button type="button" data-zoom="25" aria-label="Aumenta ingrandimento">+</button><button type="button" data-zoom="0">Ripristina</button></div><p class="source-note">Aumenta l’ingrandimento e scorri nell’area dell’immagine. La versione testuale resta disponibile sopra.</p><div class="zoom-window" tabindex="0" role="region" aria-label="Originale illustrato ingrandibile"><div class="material">'+tag+'</div></div></details>'
        new=original.replace('class="view"','class="view material-view"',1).replace(m[0],replacement,1).replace('Riproduzione esatta del materiale originale. Le schede sono da svolgere su carta; nessun dato viene inserito o raccolto in questa anteprima.','Versione testuale derivata dall’originale, conservato integralmente. Le schede si svolgono su carta; nessun dato viene inserito o raccolto.')
        src=src.replace(original,new,1)
    src=src.replace('</style>',CSS+'</style>',1)
    needle="document.body.classList.toggle('reading',view.id==='libro');"
    if src.count(needle)!=1: raise ValueError('Router mismatch')
    src=src.replace(needle,needle+"\n document.body.classList.toggle('material-reading',view.classList.contains('material-view'));\n",1)
    # Capture the outgoing position before the browser changes the fragment; avoid native history restoration competing with the router.
    src=src.replace("let previous=null, storyScroll=0;", "let previous=null, storyScroll=0;\nhistory.scrollRestoration='manual';\ndocument.addEventListener('click',e=>{const link=e.target.closest('a[href^=\"#\"]');if(!link||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;if(previous==='storie'&&link.hash==='#libro')storyScroll=window.scrollY;e.preventDefault();history.pushState(null,'',link.hash);route();});")
    src=src.replace(" if(previous==='storie'&&view.id==='libro') storyScroll=window.scrollY;", "")
    src=src.replace("window.scrollTo(0,storyScroll);", "window.scrollTo(0,storyScroll);requestAnimationFrame(()=>{if(previous==='storie'){document.querySelector('#storie .feature').focus({preventScroll:true});window.scrollTo(0,storyScroll);}});")
    src=src.replace('</script>',JS+'</script>',1)
    return src

if __name__=='__main__':
    infile,outfile=map(Path,sys.argv[1:3]);out=build(infile.read_text());outfile.write_text(out);print('F2 SHA256',hashlib.sha256(outfile.read_bytes()).hexdigest())
