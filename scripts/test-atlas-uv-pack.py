"""Replay the deterministic UV pack on the actual historical B1 geometry."""
import sys,json,hashlib
from pathlib import Path
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parent))
from atlas_uv_pack import pack
path=Path(sys.argv[sys.argv.index("--")+1])
b=json.loads(path.read_text())
assert b["revision"]=="6593b1f33fe00db7797ebab2708c3b86a365a5c1"
assert b["triangles"]==108
u=np.array(b["uv"],np.float64)
v=[tuple(round(x,7) for x in p) for p in b["positions"]]
tri=np.arange(len(u)).reshape(-1,3)
a,r=pack(u,tri,v)
c,s=pack(u,tri,v)
assert np.array_equal(a,c) and r==s
assert r["islands"]==6 and r["relativeScale"]**2>=.65
assert r["borderPixels"]>=8 and r["gapPixels"]>=18
for i,(x,y,w,h) in enumerate(r["rectangles"]):
    assert min(x,y)>=9-1e-8 and max(x+w,y+h)<=503+1e-8
    for ax,ay,aw,ah in r["rectangles"][:i]:
        assert max(ax-x-w,x-ax-aw,ay-y-h,y-ay-ah)>=20-1e-7
print("ASC UV pack preflight",json.dumps(r),flush=True)
