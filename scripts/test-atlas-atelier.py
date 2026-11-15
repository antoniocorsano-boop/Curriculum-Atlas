from pathlib import Path
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import sys,json,hashlib
file=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(exist_ok=True,parents=True);html=file.read_text();res=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for w,h in [(320,720),(430,932),(1920,1080)]:
  page=b.new_page(viewport={'width':w,'height':h},reduced_motion='reduce');errs=[];requests=[];page.on('pageerror',lambda e:errs.append(str(e)));page.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) else None);page.set_content(html);page.set_default_timeout(2500)
  def go(id):
   page.locator(f'[data-go="{id}"]:visible').first.click();assert page.locator(f'#{id}').is_visible()
  assert page.locator('.station-card').count()==4
  if w==430:page.screenshot(path=str(out/'hub-430.png'))
  go('piazza');page.locator('[data-observe="calore"]').click();assert 'Non è energia distrutta' in page.locator('#observation').inner_text();assert page.locator('#heat-ray').get_attribute('opacity')=='1'
  go('laboratorio')
  for n in range(40,101,10):
   page.locator('#energy-input').evaluate('(e,n)=>{e.value=n;e.dispatchEvent(new Event("input"))}',n);assert page.locator('#thermal').inner_text()==f'{n-20} J';assert f'{n} = 20 + {n-20}' in page.locator('#lab-explain').inner_text()
  page.locator('[data-case="B"]').click();assert page.locator('#efficiency').inner_text()=='40%';page.locator('#energy-input').focus();page.keyboard.press('ArrowRight');assert page.locator('#thermal').inner_text()=='40 J'
  if w==430:page.screenshot(path=str(out/'lab-430.png'))
  go('atelier');page.locator('#check-build').click();assert 'entrambe' in page.locator('#build-feedback').inner_text();page.locator('#light-choice').select_option('10');page.locator('#heat-choice').select_option('40');page.locator('#check-build').click();assert 'luce utile deve' in page.locator('#build-feedback').inner_text();page.locator('#heat-choice').select_option('30');page.locator('#check-build').click();assert 'sommano 40' in page.locator('#build-feedback').inner_text();page.locator('#light-choice').select_option('20');page.locator('#check-build').click();assert 'coerente' in page.locator('#build-feedback').inner_text();
  for n in [40,100]:
   page.locator('#build-case').select_option(str(n));page.locator('#light-choice').select_option('20');page.locator('#heat-choice').select_option(str(n-20));page.locator('#check-build').click();assert 'coerente' in page.locator('#build-feedback').inner_text()
  if w==430:page.screenshot(path=str(out/'atelier-430.png'))
  go('teatro');
  for v,expected in [('D','90 J invece'),('E','15 J in meno'),('N','i dati bastano')]:
   page.locator(f'[name=decision][value={v}]').check();page.locator('#decision-check').click();assert expected in page.locator('#decision-feedback').inner_text()
  go('hub');go('worlds');assert page.locator('#candidates .candidate').count()==3;assert page.locator('#candidates button').count()==0;go('hub');go('guide')
  # Reflow all seven views, including opened disclosure elements. Programmatic hash traversal.
  for scale in [100,200]:
   page.evaluate('(n)=>document.documentElement.style.fontSize=n+"%"',scale)
   for id in ['worlds','hub','piazza','laboratorio','atelier','teatro','guide']:
    page.evaluate('(id)=>{location.hash=id;window.dispatchEvent(new HashChangeEvent("hashchange"))}',id);page.locator('#'+id).wait_for(state='visible');page.locator('#'+id+' details').evaluate_all('(els)=>els.forEach(e=>e.open=true)');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(w,scale,id,page.evaluate('document.documentElement.scrollWidth'))
  assert not errs,errs;assert not requests,requests;res.append({'viewport':[w,h],'views':7,'reflow100and200':True,'observatory':True,'sevenBalances':True,'keyboardSlider':True,'constructionThreeCasesAndTwoErrorTypes':True,'decisionThreeBranches':True,'candidateWorldsNoninteractive':True,'externalRequests':0,'jsErrors':0});page.close()
 b.close()
result={'candidateSha256':hashlib.sha256(file.read_bytes()).hexdigest(),'results':res,'method':'Chromium set_content; actual control clicks, keyboard slider, programmatic traversal for reflow. Not a physical device or screen reader test.','studentAuthorized':False};(out/'results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
