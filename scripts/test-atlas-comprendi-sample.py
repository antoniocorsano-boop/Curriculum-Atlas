import json, hashlib, sys
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
source, candidate, evidence=map(Path,sys.argv[1:]); evidence.mkdir(parents=True,exist_ok=True)
raw=candidate.read_bytes(); h=hashlib.sha256(raw).hexdigest(); original=BeautifulSoup(source.read_bytes(),'html.parser'); soup=BeautifulSoup(raw,'html.parser')
assert soup.select_one('img')['src']==original.select_one('#libro-cap1 img')['src']
assert len(soup.select('h1'))==1
assert not soup.select('iframe,form,textarea,input[type=text]')
assert len(set(x['id'] for x in soup.select('[id]')))==len(soup.select('[id]'))
for a in soup.select('a[href]'):assert a['href'].startswith('#') and soup.select_one(a['href'])
rows=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width,height in [(320,720),(360,800),(430,932),(1920,1080)]:
  page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce'); errors=[];requests=[]
  page.on('pageerror',lambda e:errors.append(str(e))); page.on('request',lambda r: requests.append(r.url) if r.url.startswith(('http://','https://')) else None)
  page.set_content(raw.decode(),wait_until='load'); assert page.locator('img').evaluate('(e)=>e.complete && e.naturalWidth>0')
  page.screenshot(path=str(evidence/f'hero-{width}.png'))
  for scale in (100,200):
   page.evaluate('(v)=>document.documentElement.style.fontSize=v+"%"',scale)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), (width,scale)
   # Test all expandable explanations in open state.
   page.locator('details').evaluate_all('(nodes)=>nodes.forEach(n=>n.open=true)')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), (width,scale,'details')
   page.locator('details').evaluate_all('(nodes)=>nodes.forEach(n=>n.open=false)')
  page.evaluate('document.documentElement.style.fontSize="100%"')
  page.locator('nav a[href="#sperimenta"]').click(); assert page.evaluate('document.activeElement.id')=='sperimenta'
  page.locator('input[value=meno]').check(); assert 'Previsione annotata' in page.locator('#prediction-note').inner_text()
  page.locator('[data-energy="50"]').click(); assert page.locator('#balance').inner_text()=='50 = 20 + 30'; assert 'coerente' in page.locator('#prediction-note').inner_text()
  page.locator('[data-energy="40"]').click(); assert page.locator('#efficiency').inner_text()=='50%'
  slider=page.locator('#input-energy');slider.focus();slider.press('ArrowRight');assert page.locator('#input-value').inner_text()=='50 J'
  for v in range(40,101,10):
   slider.evaluate('(el,v)=>{el.value=v;el.dispatchEvent(new Event("input",{bubbles:true}))}',v)
   assert page.locator('#balance').inner_text()==f'{v} = 20 + {v-20}'
   assert page.locator('#thermal').inner_text()==f'{v-20} J'
   assert abs(float(page.locator('#efficiency').inner_text().replace('%','').replace(',','.'))-2000/v)<=.051
  page.locator('[data-energy="50"]').click();page.locator('#sperimenta').scroll_into_view_if_needed();page.screenshot(path=str(evidence/f'lab-{width}.png'))
  page.locator('nav a[href="#rielabora"]').click();assert page.evaluate('document.activeElement.id')=='rielabora';page.locator('#rielabora summary').click();assert page.locator('#rielabora details').get_attribute('open') is not None;assert '30 J' in page.locator('#rielabora details').inner_text()
  assert not requests and not errors,(requests,errors)
  rows.append({'viewport':[width,height],'reflow100and200':True,'detailsOpenReflow':True,'keyboardSlider':True,'predictionOptional':True,'sevenBalances':True,'transferReveal':True,'focusNavigation':True,'externalRequests':0,'jsErrors':0});page.close()
 browser.close()
result={'candidateSha256':h,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'originalIllustrationPreserved':True,'results':rows,'method':'Chromium set_content; simulated viewports, click and keyboard, explicit model state sweep. No physical-device or screen-reader certification.','studentAuthorized':False,'state':'HUMAN_REVIEW_REQUIRED'}
(evidence/'comprendi-f6r1-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result))
