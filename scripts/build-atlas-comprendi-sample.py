"""Build the review-only exemplar from the exact qualified local F4 artifact."""
import hashlib, html, sys
from pathlib import Path
from bs4 import BeautifulSoup
SOURCE='50d8ec149f24a21f81856403e3926f661eb87faae1de6f97bd9953a234094e13'
if len(sys.argv)!=4: raise SystemExit('Usage: build <F4-local.html> <template> <output-local.html>')
source,template,out=map(Path,sys.argv[1:]); raw=source.read_bytes()
assert hashlib.sha256(raw).hexdigest()==SOURCE, 'F4 source differs'
assert 'public' not in out.resolve().parts, 'Do not build into public'
img=BeautifulSoup(raw,'html.parser').select_one('#libro-cap1 img'); assert img and img['src'].startswith('data:image/webp;base64,')
t=template.read_text(); assert t.count('@@HERO@@')==t.count('@@ALT@@')==1
result=t.replace('@@HERO@@',img['src']).replace('@@ALT@@',html.escape(img['alt'],quote=True))
out.write_bytes(result.encode());print(hashlib.sha256(out.read_bytes()).hexdigest())
