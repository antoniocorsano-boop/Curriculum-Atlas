import sys,json,hashlib,os
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

def sha(b):return hashlib.sha256(b).hexdigest()
def imgs(s):return [(i.get('src'),i.get('alt')) for i in s.select('img')]
def main():
 src,out,model,folder=map(Path,sys.argv[1:]);folder.mkdir(parents=True,exist_ok=True)
 raw=out.read_text(); m=json.loads(model.read_text());a=BeautifulSoup(src.read_text(),'html.parser');b=BeautifulSoup(raw,'html.parser');assert imgs(a)==imgs(b),'images changed'
 ids=[x['id'] for x in b.select('[id]')];assert len(ids)==len(set(ids)), 'duplicate id';assert all(x['href'][1:] in ids for x in b.select('a[href^="#"]'));assert not b.select('iframe,form,object,embed');assert not b.select('input[name],textarea[name]')
 for id in ['libro','energia','scheda-energia','bisogno','scheda-bisogno','agricoltura']:
  old=a.find(id=id);new=b.find(id=id);assert all(x.get_text(' ',strip=True)==y.get_text(' ',strip=True) for x,y in zip(old.select('.prose,.material-text'),new.select('.prose,.material-text')));assert len(old.select('.prose,.material-text'))==len(new.select('.prose,.material-text'))
 results=[]
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
  for width,height in [(320,720),(360,800),(430,932),(1920,1080)]:
   page=browser.new_page(viewport={'width':width,'height':height});requests=[];errors=[];page.on('request',lambda r: requests.append(r.url) if r.url.startswith(('http:','https:')) else None);page.on('pageerror',lambda e:errors.append(str(e)))
   page.set_content(raw,wait_until='load');page.add_style_tag(content='html{scroll-behavior:auto!important}');page.locator('#home .energy-entry').click();page.locator('#universo-energia').wait_for(state='visible');assert page.locator('#universo-energia .energy-card').count()==4
   if width in (430,1920):page.screenshot(path=str(folder/f'universo-{width}.png'))
   # Entry and return from each card using the visible controls.
   for route in ['libro','energia','laboratorio-energia','mappa-energia']:
    page.locator(f'#universo-energia .energy-card[href="#{route}"]').click();page.locator('#'+route).wait_for(state='visible');assert page.locator('#'+route+' h1').count()==1
    if route=='libro':
     assert page.locator('#libro img').count()==4;page.locator('#libro .reader-index summary').click();page.locator('#libro .reader-index a[href="#libro-cap2"]').click();assert page.evaluate('location.hash')=='#libro-cap2'
    if route=='energia':assert page.locator('#energia .material-text').is_visible()
    if route=='laboratorio-energia':
     for c in m['model']['cases']:
      page.locator('#energy-choice').select_option(c['id']);assert f'{c["input"]} J = 20 J di luce utile + {c["thermal"]} J di calore' in page.locator('#energy-result').inner_text();assert page.locator('#energy-thermal-bar').evaluate('(el)=>el.style.width')==str(c['thermal'])+'%';assert c['input']==c['useful']+c['thermal']
     page.locator('#energy-reset').focus();page.keyboard.press('Enter');assert page.locator('#energy-choice').input_value()=='B';page.locator('#laboratorio-energia .energy-details summary').click();assert page.locator('#laboratorio-energia tbody tr').count()==3
     if width in (430,1920):
      page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(folder/f'laboratorio-{width}.png'))
    if route=='mappa-energia':
     for n in m['concepts']:
      node=page.locator(f'.map-node[data-concept="{n["id"]}"]');node.focus();page.keyboard.press('Enter');assert node.get_attribute('aria-pressed')=='true';assert page.locator(f'.map-concept[data-panel="{n["id"]}"]').is_visible();assert len(page.locator('.map-concept:visible').all())==1
     page.locator('.map-node[data-concept="efficienza"]').click();page.locator('.map-concept:visible button[data-concept="conservazione"]').click();assert page.locator('.map-node[data-concept="conservazione"]').get_attribute('aria-pressed')=='true';assert page.locator('.map-node[data-concept="conservazione"]').evaluate('(el)=>document.activeElement===el')
     page.locator('#mappa-energia .energy-details summary').click();assert page.locator('#mappa-energia .energy-details li').count()==6
     if width in (430,1920):
      page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(folder/f'mappa-{width}.png'))
    back=page.locator(f'#{route} a[href="#universo-energia"]').first;back.click();assert page.locator('#universo-energia').is_visible()
   page.locator('#universo-energia a[href="#scheda-energia"]').click();assert page.locator('#scheda-energia .material-text').is_visible();page.locator('#scheda-energia a[href="#universo-energia"]').click()
   # All 14 views, plus browser history, at ordinary and enlarged text.
   for font in ['100%','200%']:
    page.evaluate('(v)=>document.documentElement.style.fontSize=v',font)
    for id in [v['id'] for v in b.select('.view')]:
     page.evaluate('(id)=>{history.pushState(null,"","#"+id);route()}',id);assert page.locator('#'+id).is_visible();assert page.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth'),(width,font,id,page.evaluate('document.documentElement.scrollWidth'))
   page.evaluate('document.documentElement.style.fontSize="100%"');page.evaluate('history.pushState(null,"","#universo-energia");route()');page.locator('#universo-energia .energy-card[href="#laboratorio-energia"]').click();page.go_back(wait_until='load');page.locator('#universo-energia').wait_for(state='visible');assert not requests and not errors,(requests,errors)
   results.append({'viewport':[width,height],'views':len(b.select('.view')),'normalAnd200NoOverflow':True,'fourActionsAndWorksheet':True,'threeModelCases':True,'sixMapConcepts':True,'keyboardAndHistory':True,'externalRequests':len(requests),'jsErrors':len(errors)})
   page.close()
  browser.close()
 receipt={'state':'IN_VERIFICA','studentAuthorized':False,'sourceSha256':sha(src.read_bytes()),'candidateSha256':sha(out.read_bytes()),'preservedImageOccurrences':len(imgs(a)),'existingContentPreserved':True,'modelBalances':3,'mapConcepts':6,'results':results,'method':'Chromium set_content, simulated viewports, actual click and keyboard interactions for theme, programmatic route traversal for reflow. Not a physical device or assistive technology certification.','pending':['Human editorial, pedagogical, scientific and accessibility review','Physical devices and full application integration','Authority, rights and explicit distribution authorization']};(folder/'universe-f4-results.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps(receipt,ensure_ascii=False))
if __name__=='__main__':main()
