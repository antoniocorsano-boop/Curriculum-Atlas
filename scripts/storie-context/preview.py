"""P6: B04 in existing library, isolated editorial preview only.
No web export, no canonical scene alteration, no student navigation."""
import hashlib,importlib.util,json,math,sys,struct
from pathlib import Path
import bpy
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
LIB=ROOT/"scripts/atlas-gateway-c3"
BOOK=ROOT/"scripts/atlas-storie-p2/render-blender.py"
sys.path.insert(0,str(LIB))
spec=importlib.util.spec_from_file_location("atlas_smart_preview",LIB/"smart-preview.py")
assert spec is not None and spec.loader is not None
pv=importlib.util.module_from_spec(spec)
spec.loader.exec_module(pv)
def blob(p):
    b=p.read_bytes()
    return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\x00"+b).hexdigest()
assert blob(BOOK)=="92c4badfa8347348847d80142c3fd1bd13efb8f7"
candidate=LIB/"library-master-knowledge-stars.py"
assert candidate.is_file()
out=Path(sys.argv[sys.argv.index("--")+1]).resolve()
assert not out.exists()
out.mkdir()
raw=BOOK.read_text()
book_code=raw[raw.index("def material("):raw.index("# One bounded CPU studio render set")]
compile(book_code,str(BOOK),"exec")
source=pv.transform(pv.resolve(candidate))
insert="""
    if key=="storie":
        import bmesh,numpy as np,math
        from mathutils import Matrix
        from bpy_extras.object_utils import world_to_camera_view
        ns={"bpy":bpy,"bmesh":bmesh,"np":np,"math":math,"scene":scene,"parts":[]}
        exec(compile(__BOOK_CODE__, "<B04 source-locked subset>", "exec"),ns)
        book=ns["parts"]
        assert len(book)==15 and sum(len(o.data.polygons) for o in book)==105568
        allv=[v.co.copy() for o in book for v in o.data.vertices]
        lo=Vector(tuple(min(v[i] for v in allv) for i in range(3)))
        hi=Vector(tuple(max(v[i] for v in allv) for i in range(3)))
        center=(lo+hi)*.5
        radius=max((v-center).length for v in allv)
        scale=.56/radius
        rot=Matrix.Rotation(math.radians(12),3,"Z")@Matrix.Rotation(math.radians(105),3,"X")
        for o in book:
            for v in o.data.vertices:v.co=c+rot@((v.co-center)*scale)
            o.data.update()
        bpy.context.view_layer.update()
        actual=max((v.co-c).length for o in book for v in o.data.vertices)
        assert actual<=.56001 and actual<composition["layout"][0][3]
        context_book_parts.extend(book)
        context_book_record.update({"center":list(c),"radius":actual,"scale":scale,"components":len(book),"triangles":sum(len(o.data.polygons) for o in book),"rotationX":105,"rotationZ":12})
        return book[0]
"""
source=pv.once(source,'star_objects=[];star_records=[]','star_objects=[];star_records=[];context_book_parts=[];context_book_record={}')
source=pv.once(source,'    q=composition["identityMeshes"][key]',insert.replace("__BOOK_CODE__",repr(book_code))+'\n    q=composition["identityMeshes"][key]')
source=pv.once(source,"scene.cycles.samples=12","scene.cycles.samples=24")
source=pv.once(source,"scene.render.resolution_percentage=50","scene.render.resolution_percentage=100")
# Existing camera and protected projection guards stay unchanged.
source += '''
assert len(context_book_parts)==15 and len(star_records)==4
assert context_book_record["radius"]<=.56001
assert set(star_projection)=={"atrium","vertical"}
(out/"storie-context-receipt.json").write_text(json.dumps({"status":"CONTEXT_PREVIEW_ONLY","source":"B04","sourceBlob":"92c4badfa8347348847d80142c3fd1bd13efb8f7","book":context_book_record,"starProjection":star_projection,"otherIdentitiesChanged":False,"navigationChanged":False,"webQualified":False,"artisticApproval":False,"publishable":False,"studentAuthorized":False},indent=2))
'''
compile(source,str(candidate),"exec")
print("STORIE_CONTEXT_SOURCE_PREFLIGHT_PASS",flush=True)
old=sys.argv
try:
    sys.argv=[str(candidate),"--",str(out)]
    exec(compile(source,str(candidate),"exec"),{"__file__":str(candidate),"__name__":"__storie_context__"})
finally:sys.argv=old
receipt=json.loads((out/"storie-context-receipt.json").read_text())
receipt["images"]={}
for n,d in (("atrium",(1200,750)),("vertical",(640,960))):
    b=(out/(n+".png")).read_bytes()
    assert struct.unpack_from(">II",b,16)==d
    receipt["images"][n]={"sha256":hashlib.sha256(b).hexdigest(),"bytes":len(b),"dimensions":list(d)}
(out/"storie-context-receipt.json").write_text(json.dumps(receipt,indent=2)+"\n")
assert not list(out.glob("*.glb")) and not list(out.glob("*.blend"))
print("STORIE_CONTEXT_PREVIEW_ONLY",json.dumps(receipt),flush=True)
