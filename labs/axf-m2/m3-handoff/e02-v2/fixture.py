"""M3-C synthetic geometry only. Never packages the E02 master."""
import pathlib,sys,hashlib
from PIL import Image,ImageDraw
root=pathlib.Path(sys.argv[1]); source=pathlib.Path(sys.argv[2])
assets=root/'assets'; assets.mkdir(parents=True,exist_ok=True)
im=Image.new('RGB',(1536,1024),'#c6bca8'); d=ImageDraw.Draw(im)
d.text((30,30),'SYNTHETIC CI FIXTURE - NOT E02 ART',fill='black')
for label,rect,color in [('NOTEBOOK',(25,655,525,970),'#d3e7ce'),('SQUARE',(540,267,880,657),'#ecd2a7'),('BENCH',(990,540,1495,870),'#b2d7e8')]:
    d.rectangle(rect,fill=color,outline='black',width=8);d.text((rect[0]+20,rect[1]+20),label,fill='black')
asset=assets/'AXF-E02-BG-v2-master.png'; im.save(asset)
digest=hashlib.sha256(asset.read_bytes()).hexdigest()
master='509000e27fe51e7c3c3d336029039cf8c6bf52e79fdd0be3d7f722d5a1509eaa'
text=source.read_text()
assert text.count(master)==1 and digest!=master
(root/'build-fixture-only.mjs').write_text(text.replace(master,digest))
(root/'fixture.sha256').write_text(digest+'  '+asset.name+'\n')
