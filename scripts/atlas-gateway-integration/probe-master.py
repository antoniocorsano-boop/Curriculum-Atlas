"""Draft-only architecture transport probe. Not production or artistic acceptance."""
import ast,bpy,hashlib,importlib.util,json,sys,struct,math
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
LIB=HERE.parent/"atlas-gateway-c3"
sys.path.insert(0,str(LIB))
spec=importlib.util.spec_from_file_location("atlas_smart_preview",LIB/"smart-preview.py")
pv=importlib.util.module_from_spec(spec);spec.loader.exec_module(pv)
candidate=LIB/"library-master-knowledge-stars.py"
out=Path(sys.argv[sys.argv.index("--")+1]).resolve()
assert not out.exists()
for p in ("atlas-c32/campata.blend","atlas-c32/manifest.json","atlas-c32b/campata-ao.glb","atlas-c32b/ao-manifest.json"):
    assert (out.parent/p).is_file(),p
source=pv.resolve(candidate)
# Preserve all source locks, construction and the four original architecture
# exports; never export the historical stars or alter production acceptance.
tree=ast.parse(source);expected={"library-shell.glb","library-scenography.glb","library-portals.glb","library-cupola.glb","library-knowledge-stars.glb"}
calls={}
for node in tree.body:
    if isinstance(node,ast.Expr) and isinstance(node.value,ast.Call) and ast.unparse(node.value.func)=="bpy.ops.export_scene.gltf":
        line=ast.get_source_segment(source,node)
        names=[name for name in expected if name in line]
        assert len(names)==1 and node.lineno==node.end_lineno,line
        calls[names[0]]=line
assert set(calls)==expected,calls
source=pv.once(source,calls["library-knowledge-stars.glb"],"pass # exact R2 supplied separately; old star export excluded")
# Run construction and selected exports only, not render or final production receipt.
marker='for i,(name,w,h,pos,target,lens) in enumerate(views):'
assert source.count(marker)==1
source=source.split(marker,1)[0]
assert "save_as_mainfile" not in source and "bpy.ops.render.render(" not in source
ast.parse(source)
ns={"__file__":str(candidate),"__name__":"__atlas_architecture_probe__"}
old=sys.argv
try:
    sys.argv=[str(candidate),"--",str(out)]
    exec(compile(source,str(candidate),"exec"),ns)
finally:sys.argv=old
scene=ns["scene"];bpy.context.view_layer.update()
def xyz(v):return [float(v.x),float(v.z),float(-v.y)]
def bounds(objects):
    points=[o.matrix_world@Vector(v) for o in objects for v in o.bound_box]
    assert points
    p=[xyz(v) for v in points]
    return {"min":[min(v[i] for v in p) for i in range(3)],"max":[max(v[i] for v in p) for i in range(3)]}
def record(path):
    b=path.read_bytes()
    assert b[:4]==b"glTF" and struct.unpack_from("<II",b,4)==(2,len(b))
    n,kind=struct.unpack_from("<II",b,12);assert kind==0x4e4f534a
    g=json.loads(b[20:20+n])
    assert all("uri" not in x for x in g.get("buffers",[])) and all("uri" not in x for x in g.get("images",[]))
    prim=[p for m in g.get("meshes",[]) for p in m["primitives"]]
    accessor=g["accessors"]
    tris=sum((accessor[p["indices"]]["count"] if "indices" in p else accessor[p["attributes"]["POSITION"]]["count"])//3 for p in prim if p.get("mode",4)==4)
    return {"sha256":hashlib.sha256(b).hexdigest(),"bytes":len(b),"uniquePrimitives":len(prim),"uniqueTriangles":tris,"uniqueVertices":sum(accessor[p["attributes"]["POSITION"]]["count"] for p in prim),"nodes":len(g.get("nodes",[])),"materials":len(g.get("materials",[])),"images":len(g.get("images",[])),"extensionsUsed":g.get("extensionsUsed",[]),"extensionsRequired":g.get("extensionsRequired",[])}
files={name:record(out/name) for name in sorted(expected-{"library-knowledge-stars.glb"})}
assert not (out/"library-knowledge-stars.glb").exists()
bay=[o for o in scene.objects if o.type=="MESH" and o.name.startswith("Library bay ") and not o.hide_render]
assert len(bay)>0 and len(ns["placements"])==45
# Native bay payload: linked meshes retain their exact transforms and materials.
# Exports the actual visible bay instances, not the obsolete single AO bay.
bpy.ops.object.select_all(action="DESELECT")
for o in bay:o.select_set(True)
bpy.context.view_layer.objects.active=bay[0]
bpy.ops.export_scene.gltf(filepath=str(out/"library-bays.glb"),export_format="GLB",use_selection=True,export_texcoords=True,export_draco_mesh_compression_enable=False)
bay_file=record(out/"library-bays.glb")
assert bay_file["nodes"]>=len(bay) and bay_file["uniquePrimitives"]<=len(bay),bay_file

# Preserve real transforms and distinct mesh identities, not an assumed
# equivalence with the old single AO bay.
bay_meshes={}
instances=[]
for o in bay:
    key=o.data.name
    if key not in bay_meshes:
        o.data.calc_loop_triangles()
        bay_meshes[key]={"vertices":len(o.data.vertices),"triangles":len(o.data.loop_triangles)}
    instances.append({"name":o.name,"mesh":key,"matrixBlender":[list(row) for row in o.matrix_world]})
portal_layout=ns["portal_layout"]
views=[{"id":name,"width":w,"height":h,"position":xyz(Vector(pos)),"target":xyz(Vector(target)),"lensMm":lens} for name,w,h,pos,target,lens in ns["views"]]
report={"status":"DRAFT_ARCHITECTURE_TRANSPORT_PROBE","source":pv.identity(candidate),"files":files,"placements":ns["placements"],"bay":{"instances":len(instances),"uniqueMeshes":len(bay_meshes),"meshInventory":bay_meshes,"transforms":instances,"boundsThree":bounds(bay),"nativePayload":bay_file,"aoReference":record(out.parent/"atlas-c32b/campata-ao.glb"),"aoParityQualified":False},"portals":portal_layout,"cameras":views,"coordinateConvention":"Blender x,y,z -> Three x,z,-y; no procedural +1.2 shift in native architecture","totalArchitectureBytes":sum(f["bytes"] for f in files.values())+bay_file["bytes"],"rendered":False,"browserQualified":False,"artisticApproval":False,"studentAuthorized":False,"publishable":False}
(out/"architecture-transport-receipt.json").write_text(json.dumps(report,indent=2)+"\n")
print("ARCHITECTURE_TRANSPORT_PROBE",json.dumps({k:report[k] for k in ("status","files","totalArchitectureBytes","cameras")}),flush=True)
