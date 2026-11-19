"""Reusable Atlas scene-linear RGB transfer contract, Blender 4.2 / NumPy.

A texture is not a display image. The explicit EXR path must preserve linear
RGB at full float precision, irrespective of bake alpha. Run a known-value
canary before any costly production step. Never change the caller's scene.
"""
import bpy
import hashlib
import struct
from pathlib import Path
import numpy as np

SPACE="Linear Rec.709"
ATOL=2e-6
RTOL=2e-6

def require(ok,message):
    if not ok:
        raise RuntimeError(message)

def pixels(image):
    w,h=image.size
    a=np.empty(w*h*4,np.float32)
    image.pixels.foreach_get(a)
    return a.reshape(h,w,4)

def stats(expected,actual,alpha=None):
    require(expected.shape==actual.shape and np.isfinite(expected).all() and np.isfinite(actual).all(),"invalid round-trip arrays")
    d=np.abs(expected.astype(np.float64)-actual.astype(np.float64))
    tol=ATOL+RTOL*np.abs(expected.astype(np.float64))
    idx=np.unravel_index(int(np.argmax(d)),d.shape)
    result={"maxAbs":float(d.max()),"meanAbs":float(d.mean()),"p99Abs":float(np.percentile(d,99)),"outsideTolerance":int(np.count_nonzero(d>tol)),"samples":int(d.size),"atol":ATOL,"rtol":RTOL,"worstIndex":list(map(int,idx)),"worstExpected":float(expected[idx]),"worstActual":float(actual[idx]),"expectedMin":float(expected.min()),"expectedMax":float(expected.max()),"actualMin":float(actual.min()),"actualMax":float(actual.max())}
    if alpha is not None:
        result["alphaMin"]=float(alpha.min());result["alphaMax"]=float(alpha.max())
        result["alphaGroups"]={}
        for name,mask in (("zero",alpha<=1e-6),("partial",(alpha>1e-6)&(alpha<1-1e-6)),("opaque",alpha>=1-1e-6)):
            result["alphaGroups"][name]={"pixels":int(mask.sum()),"maxAbs":float(d[mask].max()) if mask.any() else None}
    return result

def new_image(name,rgba,alpha_mode):
    h,w=rgba.shape[:2]
    im=bpy.data.images.new(name,width=w,height=h,alpha=True,float_buffer=True)
    try:
        im.colorspace_settings.name=SPACE
        im.alpha_mode=alpha_mode
        im.pixels.foreach_set(np.asarray(rgba,dtype=np.float32).ravel())
        im.update()
        return im
    except Exception:
        bpy.data.images.remove(im);raise

def load_linear(path,opaque=False):
    im=bpy.data.images.load(str(path),check_existing=False)
    try:
        if hasattr(im,"use_half_precision"):
            im.use_half_precision=False
        im.colorspace_settings.name=SPACE
        if opaque:
            im.alpha_mode="NONE"
        return im,pixels(im).copy()
    except Exception:
        bpy.data.images.remove(im);raise

def exr_channels(path):
    """Read only the bounded EXR header, not compressed pixel data."""
    def cstring(f):
        b=bytearray()
        while len(b)<4096:
            x=f.read(1)
            require(x!=b"","truncated EXR header")
            if x==b"\0":return b.decode("ascii")
            b.extend(x)
        raise RuntimeError("EXR header string limit")
    with Path(path).open("rb") as f:
        require(f.read(4)==b"\x76\x2f\x31\x01","EXR magic")
        require(len(f.read(4))==4,"EXR version")
        for _ in range(128):
            name=cstring(f)
            if not name:break
            kind=cstring(f);n=struct.unpack("<I",f.read(4))[0]
            require(n<=4*1024*1024,"EXR attribute too large")
            data=f.read(n);require(len(data)==n,"EXR attribute truncated")
            if name=="channels":
                require(kind=="chlist","invalid EXR channel list")
                channels={};i=0
                while i<len(data) and data[i]:
                    j=data.index(0,i);key=data[i:j].decode("ascii");i=j+1
                    require(i+16<=len(data),"truncated EXR channel")
                    channels[key]=struct.unpack_from("<i",data,i)[0];i+=16
                return channels
    raise RuntimeError("EXR channel list missing")

def export_opaque_rgb(rgba,path):
    """Return loaded production texture, raw numeric comparison, and header proof."""
    expected=np.asarray(rgba[:,:,:3],np.float32).copy()
    require(np.isfinite(expected).all(),"non-finite source RGB")
    opaque=np.ones((*expected.shape[:2],4),np.float32);opaque[:,:,:3]=expected
    im=None;scene=None;loaded=None
    try:
        im=new_image("ASC linear RGB export",opaque,"NONE")
        before=pixels(im)[:,:,:3]
        require(stats(expected,before)["outsideTolerance"]==0,"image buffer write drift")
        scene=bpy.data.scenes.new("ASC isolated texture export settings")
        fmt=scene.render.image_settings
        fmt.file_format="OPEN_EXR";fmt.color_mode="RGB";fmt.color_depth="32";fmt.exr_codec="ZIP"
        fmt.color_management="FOLLOW_SCENE"
        scene.view_settings.view_transform="Standard";scene.view_settings.exposure=0;scene.view_settings.gamma=1
        im.save_render(str(path),scene=scene)
        channels=exr_channels(path)
        require(channels=={"R":2,"G":2,"B":2},"EXR must contain exactly RGB FLOAT32 channels")
        loaded,actual=load_linear(path,opaque=True)
        result=stats(expected,actual[:,:,:3],rgba[:,:,3])
        result.update(channels=channels,space=SPACE,format="OPEN_EXR_RGB_FLOAT32_ZIP",alphaPolicy="opaque RGB; bake alpha excluded",sha256=hashlib.sha256(Path(path).read_bytes()).hexdigest(),bytes=Path(path).stat().st_size)
        return loaded,result
    except Exception:
        if loaded is not None:bpy.data.images.remove(loaded)
        raise
    finally:
        if im is not None:bpy.data.images.remove(im)
        if scene is not None:bpy.data.scenes.remove(scene)

def legacy_probe(im,expected,path):
    """Diagnostic reproduction of old implicit save/load, never a pass criterion."""
    try:
        im.filepath_raw=str(path);im.file_format="OPEN_EXR";im.save()
        loaded=bpy.data.images.load(str(path),check_existing=False)
        try:
            default_space=loaded.colorspace_settings.name;default_alpha=loaded.alpha_mode
            got=pixels(loaded).copy()
            result=stats(expected[:,:,:3],got[:,:,:3],expected[:,:,3])
            result.update(defaultSpace=default_space,defaultAlpha=default_alpha,sourceAlpha=im.alpha_mode,sourceSpace=im.colorspace_settings.name,channels=exr_channels(path))
            return result
        finally:
            bpy.data.images.remove(loaded)
    except Exception as e:
        return {"diagnosticError":repr(e)}

def preflight(out):
    # Asymmetric non-square chart reveals row/channel swaps, HDR clipping,
    # transfer functions, float precision and alpha-dependent RGB changes.
    values=np.array([0,.000137,.0031308,.018,.18,.5,.735,1,1.25,2,4,8],np.float32)
    h,w=5,12
    rgb=np.stack([np.roll(values,i) for i in (0,3,7)],axis=1)
    rgba=np.ones((h,w,4),np.float32)
    for y,a in enumerate((0,.125,.5,.875,1)):
        rgba[y,:,:3]=np.roll(rgb,y,axis=0);rgba[y,:,3]=a
    im=new_image("ASC legacy transfer canary",rgba,"STRAIGHT")
    try:
        actual=pixels(im).copy()
        legacy=legacy_probe(im,actual,Path(out)/"canary-legacy.exr")
        source=stats(rgba[:,:,:3],actual[:,:,:3],rgba[:,:,3])
    finally:
        bpy.data.images.remove(im)
    # Explicit path uses declared chart values, independent of legacy storage.
    loaded,corrected=export_opaque_rgb(rgba,Path(out)/"canary-linear.exr")
    bpy.data.images.remove(loaded)
    return {"schema":"atlas.linear-texture-transfer/v1","blender":bpy.app.version_string,"sourceBuffer":source,"legacy":legacy,"explicit":corrected,"passed":corrected["outsideTolerance"]==0}
