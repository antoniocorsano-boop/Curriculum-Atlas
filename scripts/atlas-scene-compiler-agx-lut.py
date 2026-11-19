"""B2b: sample the exact Blender display transform into a bounded 3D LUT.

The table represents display-encoded RGB bytes, not linear material colors.
Generate independent held-out and real-frame references using Blender itself.
No third-party libraries beyond Blender's NumPy; no writes to the master.
"""
import hashlib, json, math, os, struct, sys, zlib
from pathlib import Path
import bpy
import numpy as np

MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
SOURCE="2cde18aa558edbcf612de535491daa53049bb6cc"
N=97
WIDTH=1024
LIMIT=8.0
K=64.0
def require(ok,msg):
    if not ok: raise RuntimeError(msg)
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return json.loads(p.read_text())
def png_rgb(path):
    """Decode actual RGB8 PNG bytes; no color-space conversion on readback."""
    raw=path.read_bytes()
    require(raw[:8]==b"\x89PNG\r\n\x1a\n","PNG signature")
    at=8;parts=[];header=None
    while at<len(raw):
        size=struct.unpack_from(">I",raw,at)[0];kind=raw[at+4:at+8]
        data=raw[at+8:at+8+size]
        require(len(data)==size and zlib.crc32(kind+data)&0xffffffff==struct.unpack_from(">I",raw,at+8+size)[0],"PNG CRC")
        at+=size+12
        if kind==b"IHDR":header=struct.unpack(">IIBBBBB",data)
        if kind==b"IDAT":parts.append(data)
        if kind==b"IEND":break
    w,h,depth,typ,comp,filt,interlace=header
    require((depth,typ,comp,filt,interlace)==(8,2,0,0,0),"expected noninterlaced RGB8 PNG")
    stride=w*3;data=zlib.decompress(b"".join(parts))
    require(len(data)==h*(stride+1),"PNG scanline size")
    rows=np.empty((h,stride),np.uint8);prev=bytearray(stride)
    for y in range(h):
        base=y*(stride+1);mode=data[base];row=bytearray(data[base+1:base+1+stride])
        require(mode<=4,"PNG filter")
        if mode==2:
            row=bytearray((a+b)&255 for a,b in zip(row,prev))
        elif mode:
            for x in range(stride):
                a=row[x-3] if x>=3 else 0;b=prev[x];c=prev[x-3] if x>=3 else 0
                if mode==1:pred=a
                elif mode==3:pred=(a+b)//2
                else:
                    p=a+b-c;pa,pb,pc=abs(p-a),abs(p-b),abs(p-c)
                    pred=a if pa<=pb and pa<=pc else b if pb<=pc else c
                row[x]=(row[x]+pred)&255
        rows[y]=np.frombuffer(row,np.uint8);prev=row
    return rows.reshape(h,w,3)[::-1].copy()
def save(a,scene,path):
    h,w=a.shape[:2]
    require(a.shape==(h,w,4) and np.isfinite(a).all(),"invalid input")
    im=bpy.data.images.new("ASC B2b linear samples",width=w,height=h,alpha=True,float_buffer=True)
    try:
        im.colorspace_settings.name="Linear Rec.709";im.alpha_mode="NONE"
        im.pixels.foreach_set(np.asarray(a,dtype=np.float32).ravel());im.update()
        q=np.empty(a.size,np.float32);im.pixels.foreach_get(q)
        require(np.array_equal(q.reshape(a.shape)[:,:,:3],a[:,:,:3]),"linear image write drift")
        im.save_render(str(path),scene=scene)
    finally:bpy.data.images.remove(im)
    return png_rgb(path)
def rgba(rgb,w,h):
    a=np.ones((h,w,4),dtype="<f4");a[:,:,:3]=0
    a.reshape(-1,4)[:len(rgb),:3]=rgb
    return a
def main():
    master,src,out=map(lambda p:Path(p).resolve(),sys.argv[sys.argv.index("--")+1:])
    require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
    o,b,d=(read(src/n) for n in ("context-oracle.json","context-browser.json","context-display.json"))
    require(o["revision"]==b["revision"]==d["revision"]==SOURCE and o["masterSha256"]==MASTER,"source revision")
    require(b["status"]=="PASS_OPAQUE_CONTEXT_BINDING" and d["status"]=="PASS_OFFLINE_AGX_REFERENCE"
            and b["oracleSha256"]==sha(src/"context-oracle.json") and o["masterUnchanged"] and d["masterUnchanged"],"source evidence")
    require(not b["externalRequests"] and not b["pageErrors"],"source browser integrity")
    p=src/"gpu.rgba32f";require(sha(p)==b["arrays"]["gpu"]["sha256"] and p.stat().st_size==640*480*16,"GPU frame identity")
    frame=np.frombuffer(p.read_bytes(),dtype="<f4").reshape(480,640,4)
    require(np.isfinite(frame).all() and np.all(frame[:,:,3]==1),"frame RGBA")
    require(float(frame[:,:,:3].min())>=0 and float(frame[:,:,:3].max())<=LIMIT,"frame outside LUT domain")
    out.mkdir(parents=True,exist_ok=True)
    original=bpy.context.scene;v=original.view_settings
    require(v.view_transform==d["viewTransform"]=="AgX" and v.look==d["look"]
            and v.exposure==d["exposure"] and v.gamma==d["gamma"]
            and original.display_settings.display_device==d["displayDevice"]=="sRGB","display profile drift")
    require(not v.use_curve_mapping,"unsupported custom curves")
    scene=bpy.data.scenes.new("ASC B2b display reference")
    try:
        scene.display_settings.display_device=d["displayDevice"]
        scene.view_settings.view_transform="AgX";scene.view_settings.look=d["look"]
        scene.view_settings.exposure=d["exposure"];scene.view_settings.gamma=d["gamma"]
        scene.view_settings.use_curve_mapping=False
        scene.render.dither_intensity=0
        fmt=scene.render.image_settings;fmt.file_format="PNG";fmt.color_mode="RGB";fmt.color_depth="8"
        fmt.color_management="FOLLOW_SCENE"
        # r fastest, then g, then b. Log1p allocation includes exact zero.
        levels=np.expm1(np.linspace(0,math.log1p(K*LIMIT),N))/K
        idx=np.arange(N**3);rgb=np.stack((levels[idx%N],levels[(idx//N)%N],levels[idx//(N*N)]),axis=1)
        height=math.ceil(N**3/WIDTH)
        table=save(rgba(rgb,WIDTH,height),scene,out/"lut-reference.png")
        lut=np.full((height,WIDTH,4),255,np.uint8);lut[:,:,:3]=table
        (out/"lut.rgba8").write_bytes(lut.tobytes())
        # Independent holdout: random log-domain RGB, low light and HDR,
        # plus explicit gray ramp and primaries; not sampled lattice points.
        rng=np.random.default_rng(20261119)
        samples=np.expm1(rng.uniform(0,math.log1p(K*LIMIT),(4096,3)))/K
        gray=np.geomspace(1e-6,LIMIT,256)
        extras=np.concatenate([np.zeros((1,3)),np.repeat(gray[:,None],3,axis=1),
                               np.eye(3)*LIMIT,np.eye(3)*.18])
        hold=np.concatenate([samples,extras])
        hw=128;hh=math.ceil(len(hold)/hw)
        hold_rgba=rgba(hold,hw,hh)
        hold_ref=save(hold_rgba,scene,out/"holdout-agx.png")
        frame_ref=save(frame,scene,out/"frame-agx.png")
        for name,a in (("holdout",hold_rgba),("frame",frame)):
            (out/(name+".rgba32f")).write_bytes(np.ascontiguousarray(a,dtype="<f4").tobytes())
        (out/"holdout.rgb8").write_bytes(hold_ref.tobytes());(out/"frame.rgb8").write_bytes(frame_ref.tobytes())
        # A diagnostic table in display space is not a production asset yet.
        files={n:{"sha256":sha(out/n),"bytes":(out/n).stat().st_size}
               for n in ("lut.rgba8","holdout.rgba32f","frame.rgba32f","holdout.rgb8","frame.rgb8",
                         "lut-reference.png","holdout-agx.png","frame-agx.png")}
        report={"schema":"atlas.asc01.agx-lut/v1","revision":os.environ["ATLAS_EXACT_HEAD"],
                "sourceRevision":SOURCE,"masterSha256":MASTER,"masterUnchanged":sha(master)==MASTER,
                "blenderVersion":bpy.app.version_string,"profile":{k:d[k] for k in ("viewTransform","look","exposure","gamma","displayDevice")},
                "lut":{"size":N,"width":WIDTH,"height":height,"domain":[0,LIMIT],"shaperK":K,"packing":"r-fastest-bottom-up","encoding":"display-sRGB RGB8"},
                "cases":{"holdout":{"width":hw,"height":hh,"samples":len(hold)},"frame":{"width":640,"height":480,"samples":640*480}},
                "files":files,"artisticApproval":False,"publishable":False}
        (out/"agx-lut.json").write_text(json.dumps(report,indent=2,allow_nan=False)+"\n")
        print("ASC-B2b LUT",json.dumps(report),flush=True)
    finally:bpy.data.scenes.remove(scene)
    require(sha(master)==MASTER,"master changed")
if __name__=="__main__":main()
