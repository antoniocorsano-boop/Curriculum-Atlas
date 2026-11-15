from playwright.sync_api import sync_playwright
from pathlib import Path
import json, hashlib,re,base64,sys,os
p=Path(sys.argv[1]); old=Path(sys.argv[2]).read_text(); html=p.read_text(); evidence=Path(sys.argv[3]); evidence.mkdir(parents=True,exist_ok=True)
assert [hashlib.sha256(base64.b64decode(x)).hexdigest() for x in re.findall(r'data:image/webp;base64,([A-Za-z0-9+/=]+)',old)]==[hashlib.sha256(base64.b64decode(x)).hexdigest() for x in re.findall(r'data:image/webp;base64,([A-Za-z0-9+/=]+)',html[html.index('<section class="view immersive"'):html.index('<section class="view" id="bisogno"')])]
results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
 for width,height in [(320,720),(360,800),(430,932),(1920,1080)]:
  page=b.new_page(viewport={'width':width,'height':height}); errors=[]; req=[]
  page.on('pageerror',lambda e:errors.append(str(e))); page.on('request',lambda r:req.append(r.url) if r.url.startswith(('http:','https:')) else None)
  page.set_content(html);page.locator('.door[href="#storie"]').click();page.locator('.feature').click();page.wait_for_selector('#libro:visible')
  assert page.locator('h1:visible').count()==1 and page.locator('iframe').count()==0
  assert page.locator('#libro img').count()==4
  assert page.locator('#libro img').evaluate_all('(els)=>els.every(x=>x.complete&&x.naturalWidth&&x.alt)')
  y=page.locator('#libro-cap1 img').bounding_box()['y'];assert width not in (360,430) or y<height,(width,y)
  page.screenshot(path=str(evidence / f'reader-{width}.png'))
  page.locator('#libro-indice summary').focus();page.keyboard.press('Enter');assert page.locator('#libro-indice').get_attribute('open') is not None
  for target in ['cap2','cap3','cap4','mappa','cap1']:
   # Native index links; return to the index without hidden iframe routing.
   page.evaluate("document.querySelector('#libro-indice').open=true")
   page.locator(f'#libro-indice a[href="#libro-{target}"]').focus();page.keyboard.press("Enter");page.wait_for_function(f'location.hash==="#libro-{target}"');assert page.evaluate('document.activeElement.id')==f'libro-{target}'
  for zoom in [100,200]:
   page.evaluate(f'document.documentElement.style.fontSize="{zoom}%"'); assert page.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth'),(width,zoom)
  page.evaluate('document.documentElement.style.fontSize="100%"');page.locator('.reader-return').focus();page.keyboard.press('Enter');page.wait_for_selector('#storie:visible'); assert page.evaluate('document.activeElement.classList.contains("feature")')
  page.locator('.feature').click();page.wait_for_selector('#libro:visible');page.go_back();page.wait_for_selector('#storie:visible');assert page.evaluate('document.activeElement.classList.contains("feature")')
  assert not errors and not req,(errors,req)
  results.append({'viewport':[width,height],'firstImageY':round(y),'singleScroll':True,'oneTitle':True,'images':4,'chapterLinks':5,'keyboardIndex':True,'returnFocus':True,'browserBack':True,'reflow200':True,'externalRequests':len(req),'pageErrors':len(errors)})
  page.close()
 b.close()
print(json.dumps(results,indent=2));(evidence/'results.json').write_text(json.dumps(results,indent=2))
