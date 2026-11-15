from pathlib import Path
from bs4 import BeautifulSoup
import json,hashlib,sys
src, contract, template, out=map(Path,sys.argv[1:5])
assert hashlib.sha256(src.read_bytes()).hexdigest()=='50d8ec149f24a21f81856403e3926f661eb87faae1de6f97bd9953a234094e13'
d=json.loads(contract.read_text()); s=BeautifulSoup(src.read_text(),'html.parser'); imgs=s.select('#libro img'); assert len(imgs)==4
html=template.read_text();
for i,img in enumerate(imgs):
 html=html.replace(f'@@IMAGE{i+1}@@',img['src'])
html=html.replace('@@WORLD@@',json.dumps(d,ensure_ascii=False).replace('</','<\\/'))
assert '@@' not in html
out.write_text(html)
