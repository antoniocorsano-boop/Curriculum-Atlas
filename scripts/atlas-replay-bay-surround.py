"""Recover exact LBC-01 textures from the archived successful bake.
No Cycles baking, mesh mutation or revision rewriting. Verify every byte.
"""
import sys, json, hashlib
from pathlib import Path
import bpy
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parent))
from atlas_linear_texture_contract import load_linear, exr_channels

root=Path(sys.argv[sys.argv.index("--")+1]).resolve()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def need(x,msg):
    if not x:raise RuntimeError(msg)
manifest=root/"baked-surround.json"
q=json.loads(manifest.read_text())
need(sha(manifest)=="093930d2f4b928ef8a86e89845ff34558cf82e01d6af5f3b28f62bfeb01f5034","original manifest")
need(q["revision"]=="34bd5bbd3281abdcbc1a9fbe4c5de59dc750020e" and q["status"]=="PASS_BAY_SURROUND_PACKAGE","qualified bake")
need(q["masterUnchanged"] and q["bindingsRestored"] and q["uvPreflight"]["passed"] and len(q["objects"])==9,"source receipt")
items=[]
for i,item in enumerate(q["objects"]):
    key="surface-%02d"%i
    need(item["id"]==key and item["state"]=="PASS_BAKED_SURFACE","surface identity")
    e=root/(key+".exr");g=root/(key+".f32");t=root/(key+".rgba32f")
    need(sha(e)==item["transfer"]["sha256"] and sha(g)==item["geometrySha256"],"archive identity "+key)
    need(exr_channels(e)=={"R":2,"G":2,"B":2},"EXR contract "+key)
    im,a=load_linear(e,opaque=True)
    try:
        need(a.shape==(item["height"],item["width"],4) and np.isfinite(a).all(),"image shape "+key)
        a[:,:,3]=1
        t.write_bytes(np.ascontiguousarray(a,dtype="<f4").tobytes())
        need(sha(t)==item["textureSha256"],"exact raw replay "+key)
    finally:bpy.data.images.remove(im)
    items.append({"id":key,"exrSha256":sha(e),"geometrySha256":sha(g),"textureSha256":sha(t)})
receipt={"schema":"atlas.library.bay-replay/v1","sourceRevision":q["revision"],"manifestSha256":sha(manifest),"objects":items,"rebaked":False,"status":"PASS_EXACT_BAKE_REPLAY"}
(root/"replay.json").write_text(json.dumps(receipt,indent=2)+"\n")
print("ASC BAKE REPLAY",json.dumps(receipt),flush=True)
