"""Original procedural editorial plates, deterministic SVG + PNG, no external art."""
import argparse, math, json, hashlib
from pathlib import Path
from xml.sax.saxutils import escape
import cairosvg
P={
 "ATLANTE":("#412319","#a77b42","CARTOGRAFIA","TERRARUM", "atlas"),
 "NATURA":("#18372b","#b39a56","STORIA NATURALE","FLORA", "flora"),
 "STORIA":("#421f2c","#bf8c50","MEMORIA E CIVILTÀ","CHRONICA", "history"),
 "GEOMETRIA":("#1c2c46","#b4a06b","FORMA E MISURA","ELEMENTI", "geometry"),
}
def line(x,y,X,Y,stroke,width=2):return f'<path d="M{x:.2f} {y:.2f} L{X:.2f} {Y:.2f}" fill="none" stroke="{stroke}" stroke-width="{width}"/>'
def circle(x,y,r,stroke,width=2,fill="none"):return f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{r:.2f}" stroke="{stroke}" stroke-width="{width}" fill="{fill}"/>'
def path(d,s,w=2,f="none"):return f'<path d="{d}" stroke="{s}" stroke-width="{w}" fill="{f}" stroke-linecap="round" stroke-linejoin="round"/>'
def text(x,y,t,size,s,weight="normal",spacing=4):
 return f'<text x="{x}" y="{y}" fill="{s}" font-family="DejaVu Serif" font-size="{size}" font-weight="{weight}" letter-spacing="{spacing}" text-anchor="middle">{escape(t)}</text>'
def rect(x,y,w,h,s,sw=2,r=0):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="none" stroke="{s}" stroke-width="{sw}"/>'
def motif(kind,cx,cy,r,s):
 a=[]
 if kind=="atlas":
  for k in (.35,.62,.85,1):a.append(circle(cx,cy,r*k,s,2))
  for k in (-.65,0,.65):
   a.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{r*max(.18,abs(k))}" ry="{r}" fill="none" stroke="{s}" stroke-width="2"/>')
  for j in range(16):
   q=j*math.pi/8; rr=r*(1.16 if j%2==0 else .96)
   a.append(line(cx+r*.12*math.cos(q),cy+r*.12*math.sin(q),cx+rr*math.cos(q),cy+rr*math.sin(q),s,3 if j%4==0 else 1.5))
  a.append(path(f"M{cx-r*.64} {cy-r*.22} l{r*.23} {-r*.35} {r*.27} {r*.12} {r*.08} {r*.28} {-r*.23} {r*.13} {-r*.07} {r*.37} {-r*.22} {-r*.1} Z",s,2,s))
  a.append(path(f"M{cx+r*.12} {cy-r*.6} l{r*.35} {r*.12} {r*.17} {r*.34} {-r*.26} {r*.15} {-r*.12} {r*.43} {-r*.24} {-r*.21} {r*.11} {-r*.36} Z",s,2,s))
 elif kind=="flora":
  a.append(path(f"M{cx} {cy+r} Q{cx-r*.20} {cy} {cx+r*.10} {cy-r}",s,4))
  for j in range(7):
   y=cy+r*.77-j*r*.23;x=cx+(.04*j-.1)*r;sign=(-1)**j
   ex=x+sign*r*(.48+.06*(j%3));ey=y-r*.24
   a.append(path(f"M{x} {y} Q{ex} {y+r*.11} {ex} {ey} Q{x} {ey-r*.08} {x} {y} Z",s,2))
   a.append(line(x,y,ex,ey,s,1.3))
  for j in range(8):
   q=j*math.pi/4;X=cx+r*.1+math.cos(q)*r*.19;Y=cy-r+math.sin(q)*r*.19
   a.append(circle(X,Y,r*.12,s,2))
  a.append(circle(cx+r*.1,cy-r,r*.07,s,2,s))
 elif kind=="history":
  a.extend([path(f"M{cx-r} {cy-r*.42} L{cx} {cy-r*.98} {cx+r} {cy-r*.42} Z",s,4),line(cx-r,cy-r*.32,cx+r,cy-r*.32,s,4)])
  for j in range(5):
   x=cx-r*.76+j*r*.38
   a.extend([rect(x-r*.08,cy-r*.28,r*.16,r*.98,s,3),line(x,cy-r*.25,x,cy+r*.67,s,1)])
  for j in range(3):a.append(line(cx-r*(.84+.06*j),cy+r*(.76+.10*j),cx+r*(.84+.06*j),cy+r*(.76+.10*j),s,4))
 elif kind=="geometry":
  for j in range(6):
   q=j*math.pi/3;X=cx+r*.48*math.cos(q);Y=cy+r*.48*math.sin(q)
   a.append(circle(X,Y,r*.48,s,2));a.append(line(cx,cy,X,Y,s,2))
  a.append(circle(cx,cy,r,s,3))
  pts=[(cx+r*math.cos(j*math.pi/3-math.pi/2),cy+r*math.sin(j*math.pi/3-math.pi/2)) for j in range(6)]
  for j in (0,1):a.append(path("M"+" L".join(f"{pts[k][0]} {pts[k][1]}" for k in (j,j+2,j+4))+" Z",s,2))
 return "".join(a)
def plate(name,side,mask=False):
 bg,ink,subtitle,edition,kind=P[name];s="#ffffff" if mask else ink;bg="#000000" if mask else bg
 w,h=(1024,1536) if side=="cover" else (512,1536)
 a=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><rect width="{w}" height="{h}" fill="{bg}"/>']
 if side=="cover":
  a.extend([rect(43,43,w-86,h-86,s,3,12),rect(62,62,w-124,h-124,s,1.5,8),rect(90,90,w-180,h-180,s,5,4)])
  for x,y,dx,dy in [(112,112,1,1),(912,112,-1,1),(112,1424,1,-1),(912,1424,-1,-1)]:
   for j in range(3):
    a.append(path(f"M{x} {y+dy*(35+j*22)} Q{x+dx*(48+j*18)} {y+dy*(48+j*18)} {x+dx*(35+j*22)} {y}",s,2))
   a.append(circle(x+dx*32,y+dy*32,8,s,2,s))
  a.extend([text(512,265,"STUDIO ATLAS",32,s,spacing=7),line(244,300,780,300,s,2),text(512,410,name,78 if name!="GEOMETRIA" else 60,s,"bold",3),text(512,473,subtitle,29,s,spacing=4),circle(512,815,278,s,2),circle(512,815,294,s,4),motif(kind,512,815,226,s),text(512,1235,edition,35,s,spacing=6),line(290,1275,734,1275,s,2),text(512,1330,"BIBLIOTECA · I",24,s,spacing=4)])
 else:
  a.extend([rect(24,34,464,1468,s,4,10),rect(44,54,424,1428,s,1.5,6)])
  for y in (120,310,1155,1400):
   a.extend([line(60,y,452,y,s,3),line(80,y+12,432,y+12,s,1.5)])
  a.extend([motif(kind,256,220,63,s),f'<g transform="translate(256 730) rotate(-90)">{text(0,19,name,72,s,"bold",6)}</g>',motif(kind,256,1276,75,s),text(256,1450,"I",35,s,"bold")])
 a.append("</svg>");return "".join(a)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
if __name__=="__main__":
 parser=argparse.ArgumentParser();parser.add_argument("out",type=Path);a=parser.parse_args();a.out.mkdir(parents=True,exist_ok=True)
 manifest={"schema":"atlas.editorial-plates/v1","source":"original deterministic vector design","assets":{}}
 for name in P:
  for side in ("cover","spine"):
   for mode in ("color","foil"):
    key=f"{name.lower()}-{side}-{mode}";svg=a.out/(key+".svg");png=a.out/(key+".png")
    svg.write_text(plate(name,side,mode=="foil"),encoding="utf8")
    cairosvg.svg2png(bytestring=svg.read_bytes(),write_to=str(png))
    manifest["assets"][key]={"svgSha256":sha(svg),"pngSha256":sha(png),"size":[1024 if side=="cover" else 512,1536]}
 (a.out/"plates.json").write_text(json.dumps(manifest,indent=2)+"\n")
