#!/usr/bin/env python3
import base64,hashlib,json,re,sys,unicodedata
from pathlib import Path
from xml.etree import ElementTree as ET
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

# Reuse generator without requiring a particular import path.
import importlib.util
spec=importlib.util.spec_from_file_location('builder',Path(__file__).with_name('build-atlas-accessible-materials.py'));builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
ASSETS=builder.ASSETS
source,candidate,out=map(Path,sys.argv[1:4]);out.mkdir(exist_ok=True,parents=True)
html=candidate.read_text();old=BeautifulSoup(source.read_text(),'html.parser');new=BeautifulSoup(html,'html.parser')
assert str(old.select_one('#libro'))==str(new.select_one('#libro'))
assert [i['src'] for i in old.select('img')]==[i['src'] for i in new.select('img')]
def norm(s):return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',s).replace('’',"'")).strip().casefold()
coverage={}
for key,sha in ASSETS.items():
    view=new.find(id=key);raw=base64.b64decode(view.img['src'].split(',')[1]);assert builder.git_sha(raw)==sha
    text=norm(view.select_one('.material-text').get_text(' ',strip=True)+' '+view.h1.get_text(' ',strip=True));root=ET.fromstring(raw)
    original=[''.join(x.itertext()) for x in root.findall('.//{http://www.w3.org/2000/svg}text')]
    missing=[s for s in original if norm(s) not in text];assert not missing,(key,missing)
    coverage[key]={'sourceTextElements':len(original),'represented':len(original),'gitBlob':sha}
results=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=__import__('os').environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox']);
    for w,h in [(320,720),(360,800),(430,932),(1920,1080)]:
        page=b.new_page(viewport={'width':w,'height':h});errors=[];requests=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r: requests.append(r.url) if r.url.startswith(('https:','http:')) else None)
        page.set_content(html,wait_until='load');page.evaluate('window.print=()=>{window.printCalls=(window.printCalls||0)+1}')
        for key in ASSETS:
            parent='laboratori' if key.startswith('scheda') else 'scoperte'
            page.evaluate(f"location.hash='{parent}'");page.locator(f'#{parent} a[href="#{key}"]').click();v=page.locator('#'+key);v.wait_for(state='visible');assert v.locator('.material-text').is_visible();assert not v.locator('.zoom-window').is_visible()
            assert page.evaluate('document.activeElement.id')=='heading-'+key
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            summary=v.locator('summary');v.get_by_role('button',name='Apri immagine originale').focus();page.keyboard.press('Enter');assert v.locator('.zoom-window').is_visible();assert summary.evaluate('(e)=>document.activeElement===e')
            plus=v.get_by_role('button',name='Aumenta ingrandimento');plus.focus();page.keyboard.press('Enter');assert v.locator('[data-zoom-value]').inner_text()=='125%'
            assert v.locator('.zoom-window').evaluate('(e)=>e.scrollWidth>e.clientWidth');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            v.get_by_role('button',name='Ripristina').click();assert v.locator('[data-zoom-value]').inner_text()=='100%'
            summary.click();assert not v.locator('.zoom-window').is_visible()
            page.evaluate("document.documentElement.style.fontSize='200%'");assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(w,key,'200%');page.evaluate("document.documentElement.style.fontSize=''")
            v.get_by_role('button',name='Stampa versione testuale').click();assert page.evaluate('window.printCalls')>0
            page.emulate_media(media='print');assert not page.locator('.bar').is_visible() and not v.locator('.visual-original').is_visible() and v.locator('.material-text').is_visible();page.emulate_media(media='screen')
            if key in ['energia','scheda-energia'] and w in [430,1920]:
                page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(out/f'{key}-{w}.png'),full_page=False)
            v.locator('.back').click();page.locator('#'+parent).wait_for(state='visible')
        # Regression: actual reader and return, at 200% including nonzero scroll on Storie when feasible.
        page.evaluate("location.hash='storie'");page.locator('#storie').wait_for(state='visible');page.evaluate("document.documentElement.style.fontSize='200%';window.scrollTo(0,document.body.scrollHeight)");story_scroll=page.evaluate('scrollY');page.locator('#storie .feature').evaluate('(a)=>a.click()');page.locator('#libro').wait_for(state='visible');page.locator('#libro-indice summary').focus();page.keyboard.press('Enter');page.locator('#libro-indice a[href="#libro-cap2"]').click();assert page.evaluate('document.activeElement.id')=='libro-cap2';page.locator('#libro .reader-return').evaluate('(a)=>a.click()');page.locator('#storie').wait_for(state='visible');page.wait_for_function('(y)=>Math.abs(scrollY-y)<=2',arg=story_scroll,timeout=3000);restored=page.evaluate('scrollY');assert abs(restored-story_scroll)<=2,(w,story_scroll,restored);page.wait_for_function('document.activeElement.classList.contains("feature")',timeout=3000)
        page.go_back();page.locator('#libro').wait_for(state='visible');assert page.evaluate('location.hash')=='#libro-cap2';page.go_forward();page.locator('#storie').wait_for(state='visible');assert not requests and not errors,(requests,errors);results.append({'viewport':[w,h],'materials':5,'coverage':'PASS','keyboardZoomAndReturn':'PASS','normalAnd200Reflow':'PASS','printInvocationAndMedia':'PASS','readerRegression':'PASS','storyScrollBefore':story_scroll,'storyScrollRestored':restored,'externalRequests':0,'pageErrors':0});page.close()
    # Actual print rendering (browser PDF, internal evidence only).
    page=b.new_page(viewport={'width':430,'height':932});page.set_content(html,wait_until='load');page.evaluate("location.hash='scheda-energia'");page.locator('#scheda-energia').wait_for(state='visible');page.pdf(path=str(out/'scheda-energia-print.pdf'),format='A4',print_background=False);b.close()
receipt={'candidateSha256':hashlib.sha256(candidate.read_bytes()).hexdigest(),'sourceF1Sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'studentAuthorized':False,'originalReaderAndImagesUnchanged':True,'coverage':coverage,'results':results,'method':'Chromium set_content, emulated viewports, keyboard events, intercepted print call and print CSS; actual PDF generated for energy worksheet. Source text normalization coverage is not independent pedagogical or accessibility certification.','pending':['Manual screen reader review','Physical smartphone/LIM and printer review','Human semantic and pedagogical equivalence review','Full application integration and publication authorization']}
(out/'materials-f2-results.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps(receipt,ensure_ascii=False))
