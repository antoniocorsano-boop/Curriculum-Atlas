import hashlib,json,sys,os
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
old,baseline,book,lib,data,out=map(Path,sys.argv[1:]);out.mkdir(exist_ok=True,parents=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def parse(p):return BeautifulSoup(p.read_text(),'html.parser')
s0,s2,s5,s3=map(parse,[old,baseline,book,lib]);root=s3.select_one('#libro');m=json.loads(data.read_text())
assert [i['src'] for i in s0.select('img')]==[i['src'] for i in s5.select('img')]==[i['src'] for i in root.select('img')]
assert [i['src'] for i in s2.select('img')]==[i['src'] for i in s3.select('img')]
assert all(str(s2.find(id=k))==str(s3.find(id=k)) for k in ['bisogno','scheda-bisogno','agricoltura','energia','scheda-energia'])
assert all(r['input']==r['useful']+r['thermal'] and r['efficiencyPercent']==100*r['useful']/r['input'] for r in m['model']['rows'])
assert len({r['useful'] for r in m['model']['rows']})==1
for ch in m['chapters']:
    assert s5.find(id=ch['id']).select_one('.prose').get_text(' ',strip=True)==root.find(id='libro-'+ch['id']).select_one('.prose').get_text(' ',strip=True)
assert len(s5.select('.f3-rubric dd'))==len(root.select('.f3-rubric dd'))==12
for soup in [s5, s3]:
    ids=[x['id'] for x in soup.select('[id]')];assert len(ids)==len(set(ids)); assert all(a['href'][1:] in ids for a in soup.select('a[href^="#"]'))
results=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    for w,h in [(320,720),(360,800),(430,932),(1920,1080)]:
        for name,source in [('book',book),('library',lib)]:
            page=b.new_page(viewport={'width':w,'height':h},reduced_motion='reduce');page.set_default_timeout(3000);errors=[];requests=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r: requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
            page.set_content(source.read_text(),wait_until='load');page.add_style_tag(content='*{scroll-behavior:auto!important}');print(name,w,flush=True)
            if name=='library':
                page.evaluate("location.hash='storie'");page.locator('#storie .feature').click();page.locator('#libro').wait_for(state='visible');page.locator('#libro-indice summary').focus();page.keyboard.press('Enter')
            prefix='libro-' if name=='library' else ''
            nav=page.locator('#libro-indice nav' if prefix else '#indice')
            for k in ['cap2','cap3','cap4','mappa','docente']:
                nav.locator(f'a[href="#{prefix+k}"]').evaluate('(a)=>a.click()');page.locator('#'+prefix+k).wait_for(state='visible');assert page.evaluate('location.hash')=='#'+prefix+k
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(name,w,k)
                page.evaluate("document.documentElement.style.fontSize='200%'");assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(name,w,k,'200%');page.evaluate("document.documentElement.style.fontSize=''")
                if w==430 and name=='library' and k in ['mappa','docente']:page.locator('#'+prefix+k).evaluate('(e)=>e.scrollIntoView({block:"start"})');page.screenshot(path=str(out/f'{name}-{k}-{w}.png'))
            assert page.locator('#'+prefix+'docente .f3-rubric dd').count()==12
            if prefix:
                page.locator('#libro .reader-return').evaluate('(a)=>a.click()');page.locator('#storie').wait_for(state='visible');page.evaluate("location.hash='scoperte'");page.locator('#scoperte a[href="#energia"]').click();assert page.locator('#energia .material-text').is_visible()
            assert not errors and not requests,(errors,requests)
            results.append({'surface':name,'viewport':[w,h],'navigationAndReflow':'PASS','externalRequests':0,'errors':0});page.close()
    b.close()
receipt={'version':'0.5','studentAuthorized':False,'state':'HUMAN_REVIEW_REQUIRED','sourceEditionSha256':sha(old),'sourceF2Sha256':sha(baseline),'editionSha256':sha(book),'librarySha256':sha(lib),'originalImagesUnchanged':True,'fiveMaterialsUnchanged':True,'bilanci':'PASS','sameUsefulEnergy':'PASS','rubricDescriptors':12,'results':results,'method':'Chromium set_content, simulated viewports; static identity checks; human review pending.','pending':['Human scientific, narrative, pedagogical and artistic approval','Physical devices and assistive technology','Rights and Arena authority','Full application integration and authorization']}
(out/'qualification-v0.5.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps(receipt,ensure_ascii=False))
