"""ASC-P2C2A: recover exact qualified EXRs and serialize opaque linear RGBA32F."""
import hashlib,json,os,sys
from pathlib import Path
import bpy
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parent))
from atlas_linear_texture_contract import load_linear,exr_channels

src,out=map(lambda p:Path(p).resolve(),sys.argv[sys.argv.index("--")+1:])
REV="d635d295340609af25ab0eca2c6258f4da7faa79"
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def require(ok,msg):
    if not ok:raise RuntimeError(msg)
r=json.loads((src/"diffuse-bake.json").read_text())
require(r["revision"]==REV and r["status"]=="PASS_DIFFUSE_BAKE_PROBE" and r["masterUnchanged"] and r["bindingsRestored"],"P2C1 receipt")
require(r["transferPreflight"]["passed"] and r["transfer"]["outsideTolerance"]==0,"source transfer")
out.mkdir(parents=True,exist_ok=True)
result={"schema":"atlas.asc01.browser-input/v1","revision":os.environ["ATLAS_EXACT_HEAD"],"sourceRevision":REV,"sourceReceiptSha256":sha(src/"diffuse-bake.json"),"target":r["target"],"images":{}}
for key,receipt in (("canary",r["transferPreflight"]["explicit"]),("diffuse",r["transfer"])):
    path=src/("canary-linear.exr" if key=="canary" else "diffuse-linear.exr")
    require(sha(path)==receipt["sha256"] and exr_channels(path)=={"R":2,"G":2,"B":2},"EXR identity "+key)
    im,a=load_linear(path,opaque=True)
    try:
        require(np.isfinite(a).all() and a.shape[2]==4,"finite RGBA")
        a[:,:,3]=1
        # Serialize IEEE float32 little endian; Blender rows are bottom-up.
        raw=np.ascontiguousarray(a,dtype="<f4")
        file=out/(key+".rgba32f");file.write_bytes(raw.tobytes())
        reread=np.frombuffer(file.read_bytes(),dtype="<f4").reshape(raw.shape)
        require(np.array_equal(raw,reread),"binary write drift")
        result["images"][key]={"width":int(a.shape[1]),"height":int(a.shape[0]),"bytes":file.stat().st_size,"sha256":sha(file),"sourceExrSha256":sha(path),"minRGB":float(a[:,:,:3].min()),"maxRGB":float(a[:,:,:3].max()),"encoding":"linear Rec.709","rowOrder":"bottom-up","layout":"RGBA float32 little endian opaque"}
    finally:bpy.data.images.remove(im)
require(result["images"]["canary"]["maxRGB"]==8 and result["images"]["diffuse"]["width"]==512,"source dimensions/range")
(out/"browser-input.json").write_text(json.dumps(result,indent=2)+"\n")
print("ASC-P2C2A verified input",json.dumps(result))
