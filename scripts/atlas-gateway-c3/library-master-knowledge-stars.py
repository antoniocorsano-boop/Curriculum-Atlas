"""A5.5a: four symbolic experience stars; independent, offline-only module."""
import hashlib,sys
from pathlib import Path
base=Path(__file__).resolve().parent
sys.path.insert(0,str(base))
import knowledge_composition,adaptive_identity
plan,alternatives,plan_digest=knowledge_composition.load()
adaptive=adaptive_identity.solve(plan)
assert adaptive["status"]=="PASS","SP-06: exhausted adaptive identity budget"
selected=plan["selected"]
composition={"id":selected,"planSha256":plan_digest,"layout":plan["layouts"][selected],"hub":plan["hub"],"hubRadius":plan["hubRadius"],"connectionRadius":plan["connectionRadius"],"paths":alternatives[selected]["paths"],"semantics":plan["semantics"],"identityMeshes":adaptive["meshes"],"identityEvidence":adaptive_identity.evidence(adaptive)}
PARENT="library-master-atmosphere-study.py"
PARENT_BLOB="edca5a6a9d6a97871068bbcfb5a1b9c41a3d28dc"
END='exec(compile(code,'+'__file__,"exec"),globals())'
def once(code,old,new):
    assert code.count(old)==1,old[:120]
    return code.replace(old,new,1)
def parent_source(verify):
    p=base/PARENT;raw=p.read_bytes()
    assert hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\x00"+raw).hexdigest()==PARENT_BLOB
    wrapper=once(raw.decode(),END,"__captured_source__=code")
    old=sys.argv
    try:
        sys.argv=[str(p),"--verify",old[2]] if verify else [str(p)]
        ns={"__file__":str(p),"__name__":"__atlas_parent__"}
        exec(compile(wrapper,str(p),"exec"),ns)
        return ns["__captured_source__"]
    finally:sys.argv=old

STARS="""
# A5.5a: unified spatial constellation, no animated or clickable behavior.
composition=__COMPOSITION_LITERAL__
# Semantics are the four experience forms in the source-locked gateway policy,
# Non sono discipline, relazioni del curricolo approvate o nuovi portali.
star_policy=(Path(__file__).resolve().parents[2]/"src/features/atlas-gateway/gateway-policy.ts").read_bytes()
assert hashlib.sha1(b"blob "+str(len(star_policy)).encode()+b"\\x00"+star_policy).hexdigest()=="fe1d43c5622b1b7889ad9bb7c188373fddd9bebf"
assert "Esplora storie, laboratori, scoperte e percorsi." in star_policy.decode()
star_objects=[];star_records=[]
star_gold=material("Knowledge star warm light",(.65,.32,.10),.36,.25,.65)
star_cool=material("Knowledge star cool light",(.14,.37,.61),.38,.22,.55)
star_orbit=material("Knowledge star satin orbit",(.79,.53,.23),.30,.65,.75)
# SP-06: the very meshes tested in the projected silhouette cycle.
def star_core(name,c,r,mat,seed):
    sid=composition["identityEvidence"]["shapeKinds"]
    key=("storie","laboratori","scoperte","percorsi")[seed-5500]
    q=composition["identityMeshes"][key]
    return mesh(name,[tuple(c+Vector(p)) for p in q["vertices"]],q["faces"],mat,star_objects)
def orbit(name,c,normal,r,minor):
    axis=Vector(normal).normalized();u=axis.cross(Vector((0,0,1)))
    if u.length<.01:u=axis.cross(Vector((1,0,0)))
    u.normalize();v=axis.cross(u);verts=[];faces=[];steps=64;sides=6
    for i in range(steps):
        t=2*pi*i/steps;rad=cos(t)*u+sin(t)*v
        for j in range(sides):
            q=2*pi*j/sides;verts.append(tuple(c+(r+minor*cos(q))*rad+minor*sin(q)*axis))
    for i in range(steps):
        for j in range(sides):
            faces.append((i*sides+j,((i+1)%steps)*sides+j,((i+1)%steps)*sides+(j+1)%sides,i*sides+(j+1)%sides))
    o=mesh(name,verts,faces,star_orbit,star_objects)
    for f in o.data.polygons:f.use_smooth=True
    return o
star_specs=[
    ("storie","Storie",.35,star_gold,[(.15,-.95,.30)],"Narrazione e interpretazione"),
    ("laboratori","Laboratori",.39,star_cool,[(.45,-.80,.39),(-.65,-.62,.43)],"Sperimentazione e costruzione"),
    ("scoperte","Scoperte",.40,star_gold,[(.10,-.72,.68),(.80,-.55,.24)],"Osservazione e indagine"),
    ("percorsi","Percorsi",.34,star_cool,[(-.15,-.95,.30)],"Organizzazione e approfondimento"),
]
for idx,(sid,label,r,mat,normals,meaning) in enumerate(star_specs):
    x,y,z,rb=composition["layout"][idx];pos=(x,y,z)
    c=Vector(pos);start=len(star_objects)
    star_core("Knowledge core "+sid,c,r,mat,5500+idx)
    for i,n in enumerate(normals):orbit("Knowledge orbit "+sid+" "+str(i),c,n,rb-(.09 if len(normals)==2 else .025)+i*.065,.016)
    bpy.context.view_layer.update()
    vertices=[o.matrix_world@v.co for o in star_objects[start:] for v in o.data.vertices]
    extent=max((v-c).length for v in vertices)
    assert extent<=rb and min(v.z for v in vertices)>6.0
    star_records.append({"id":sid,"label":label,"meaning":meaning,"portalId":"esperienze","positionBlender":list(pos),"radiusBound":rb,"measuredRadius":extent,"identityKind":composition["identityEvidence"]["shapeKinds"][sid],"identityScale":composition["identityEvidence"]["selectedScales"][sid],"rings":len(normals),"interactive":False,"href":None})
assert len(star_records)==4 and sum(q["rings"] for q in star_records)==6
assert all((Vector(a["positionBlender"])-Vector(b["positionBlender"])).length>=1.3 for i,a in enumerate(star_records) for b in star_records[:i])
# Four symbolic trajectories converge on a shared experience emblem; no invented
# discipline relations or independent navigation. Use the existing orbit material.
def luminous_path(name,points,r):
    pts=[Vector(p) for p in points];verts=[];faces=[];sides=8
    for i,p in enumerate(pts):
        tangent=(pts[min(i+1,len(pts)-1)]-pts[max(i-1,0)]).normalized()
        u=tangent.cross(Vector((0,0,1)))
        if u.length<.01:u=tangent.cross(Vector((0,1,0)))
        u.normalize();v=tangent.cross(u)
        for j in range(sides):
            a=2*pi*j/sides;verts.append(tuple(p+r*(cos(a)*u+sin(a)*v)))
    for i in range(len(pts)-1):
        for j in range(sides):
            a=i*sides+j;b=i*sides+(j+1)%sides
            faces.append((a,b,b+sides,a+sides))
    faces.extend((tuple(reversed(range(sides))),tuple((len(pts)-1)*sides+j for j in range(sides))))
    obj=mesh(name,verts,faces,star_orbit,star_objects)
    for f in obj.data.polygons:f.use_smooth=True
    return obj
connection_records=[]
for q,points in zip(star_records,composition["paths"]):
    obj=luminous_path("Knowledge trajectory "+q["id"],points,.019)
    bpy.context.view_layer.update()
    assert min((obj.matrix_world@v.co).z for v in obj.data.vertices)>5.0
    connection_records.append({"from":q["id"],"to":"esperienze","samples":len(points),"radius":.019,"interactive":False})
hub=Vector(composition["hub"])
orbit("Knowledge common emblem outer",hub,(0,-1,.20),.22,.014)
orbit("Knowledge common emblem inner",hub,(0,-1,.20),.12,.010)
assert len(connection_records)==4
# Do not merge stars into shell or decor. Three shared materials, independent GLB.
star_objects=merge_group(star_objects,"Knowledge stars")
assert len(star_objects)==3
bpy.ops.object.select_all(action="DESELECT")
for obj in star_objects:obj.select_set(True)
bpy.context.view_layer.objects.active=star_objects[0]
bpy.ops.export_scene.gltf(filepath=str(out/"library-knowledge-stars.glb"),export_format="GLB",use_selection=True,export_texcoords=False,export_draco_mesh_compression_enable=False)
"""
PROJECTION="""
# Independent geometric projection guard for the existing frontal cameras.
# Conservative box projection: the star's radius cube encloses all its geometry.
from bpy_extras.object_utils import world_to_camera_view
import itertools
star_projection={}
connection_projection={}
def project_box(bounds):
    points=[world_to_camera_view(scene,scene.camera,Vector(p)) for p in itertools.product((bounds[0],bounds[1]),(bounds[2],bounds[3]),(bounds[4],bounds[5]))]
    assert all(p.z>0 for p in points)
    return [min(p.x for p in points),max(p.x for p in points),min(p.y for p in points),max(p.y for p in points)]
def overlaps(a,b,margin=.004):
    return a[0]<b[1]+margin and a[1]>b[0]-margin and a[2]<b[3]+margin and a[3]>b[2]-margin
def guard_star_projection(name):
    if name not in ("atrium","vertical","portrait-focus"):return
    bpy.context.view_layer.update()
    sign=next(o for o in shell if o.name=="Shell Arena patinated bronze")
    v=[sign.matrix_world@p.co for p in sign.data.vertices]
    sign_box=project_box([min(p.x for p in v),max(p.x for p in v),min(p.y for p in v),max(p.y for p in v),min(p.z for p in v),max(p.z for p in v)])
    portal_boxes=[project_box(q["actualBoundsXYZ"]) for q in portal_layout]
    boxes=[]
    for q in star_records:
        x,y,z=q["positionBlender"];r=q["radiusBound"]
        box=project_box([x-r,x+r,y-r,y+r,z-r,z+r])
        assert min(box)>=.015 and max(box)<=.985,(name,q["id"],box)
        assert not overlaps(box,sign_box) and not any(overlaps(box,b) for b in portal_boxes),(name,q["id"],box,sign_box,portal_boxes)
        assert not any(overlaps(box,b) for b in boxes),(name,q["id"],box)
        boxes.append(box)
    star_projection[name]={"stars":boxes,"arena":sign_box,"portals":portal_boxes}
    x,y,z=composition["hub"];r=composition["hubRadius"]
    hub_box=project_box([x-r,x+r,y-r,y+r,z-r,z+r])
    assert min(hub_box)>=.015 and max(hub_box)<=.985
    protected=[sign_box,*portal_boxes]
    assert not any(overlaps(hub_box,b) for b in protected+boxes),(name,"hub",hub_box)
    counts=[]
    for i,points in enumerate(composition["paths"]):
        r=composition["connectionRadius"]
        for x,y,z in points:
            b=project_box([x-r,x+r,y-r,y+r,z-r,z+r])
            assert min(b)>=.015 and max(b)<=.985
            assert not any(overlaps(b,p) for p in protected+[p for j,p in enumerate(boxes) if j!=i]),(name,i,b)
        counts.append(len(points))
    connection_projection[name]={"hub":hub_box,"pathSampleCounts":counts,"protectedClear":True}
"""
RECEIPT="""
assert set(star_projection)=={"atrium","vertical","portrait-focus"}
star_study={"phase":"C3.3A5.5a","parent":"C3.3A5.4c","parentBlob":"edca5a6a9d6a97871068bbcfb5a1b9c41a3d28dc","policyBlob":"fe1d43c5622b1b7889ad9bb7c188373fddd9bebf","semantics":"forme simboliche di esperienza, non relazioni del curricolo","stars":star_records,"projection":star_projection,"architectureChanged":False,"camerasChanged":False,"navigationChanged":False,"newLightSources":0,"connectionsProduced":True,"composition":{"id":composition["id"],"planSha256":composition["planSha256"],"semantics":composition["semantics"]},"connections":connection_records,"connectionProjection":connection_projection,"identityStudy":composition["identityEvidence"],"interactive":False,"browserQualified":False,"artisticApproval":False,"studentAuthorized":False}
(out/"knowledge-stars-study.json").write_text(json.dumps(star_study,indent=2)+"\\n")
"""
if len(sys.argv)>1 and sys.argv[1]=="--verify":
    code=parent_source(True)
    code=once(code,'m["phase"]=="C3.3A5.4c"','m["phase"]=="C3.3A5.5a"')
    code=once(code,'"phase":"C3.3A5.4c"','"phase":"C3.3A5.5a"')
    code=once(code,'atmosphere["phase"]==m["phase"]','atmosphere["phase"]=="C3.3A5.4c"')
    code=once(code,'(p/"library-verification.json").write_text', '''stars=json.loads((p/"knowledge-stars-study.json").read_text())
assert stars["phase"]==m["phase"] and stars["parent"]=="C3.3A5.4c" and stars["parentBlob"]=="edca5a6a9d6a97871068bbcfb5a1b9c41a3d28dc"
assert stars["policyBlob"]==m["portalPolicyBlob"] and m["knowledgeStars"] is True
assert all(stars[k] is False for k in ("architectureChanged","camerasChanged","navigationChanged","interactive","browserQualified","artisticApproval","studentAuthorized"))
assert stars["connectionsProduced"] is True and stars["composition"]["id"]=="A"
from adaptive_identity import solve,evidence
from knowledge_composition import load
ap,_,_=load();expected_identity=evidence(solve(ap))
assert stars["identityStudy"]==expected_identity and expected_identity["status"]=="PASS"
assert all(q["identityKind"]==expected_identity["shapeKinds"][q["id"]] and q["identityScale"]==expected_identity["selectedScales"][q["id"]] for q in stars["stars"])
assert len(stars["connections"])==4 and [q["from"] for q in stars["connections"]]==[q["id"] for q in stars["stars"]]
assert all(q["to"]=="esperienze" and q["samples"]==49 and q["interactive"] is False for q in stars["connections"])
assert set(stars["connectionProjection"])=={"atrium","vertical","portrait-focus"}
assert all(q["protectedClear"] is True and q["pathSampleCounts"]==[49]*4 for q in stars["connectionProjection"].values())
assert stars["newLightSources"]==0
assert [q["id"] for q in stars["stars"]]==["storie","laboratori","scoperte","percorsi"]
assert all(q["portalId"]=="esperienze" and q["interactive"] is False and q["href"] is None and 0<q["measuredRadius"]<=q["radiusBound"]<=.71 for q in stars["stars"])
assert sum(q["rings"] for q in stars["stars"])==6
assert set(stars["projection"])=={"atrium","vertical","portrait-focus"}
def overlap(a,b,margin=.004):
    return a[0]<b[1]+margin and a[1]>b[0]-margin and a[2]<b[3]+margin and a[3]>b[2]-margin
for name,q in stars["projection"].items():
    assert len(q["stars"])==4 and len(q["portals"])==3
    for i,a in enumerate(q["stars"]):
        assert min(a)>=.015 and max(a)<=.985
        assert not any(overlap(a,b) for b in [q["arena"],*q["portals"],*q["stars"][:i]])
assert {"library-knowledge-stars.glb","knowledge-stars-study.json"}<=set(m["files"])
kb=(p/"library-knowledge-stars.glb").read_bytes();assert struct.unpack_from("<4sII",kb)==(b"glTF",2,len(kb))
kn,kt=struct.unpack_from("<I4s",kb,12);assert kt==b"JSON";kd=json.loads(kb[20:20+kn])
assert not kd.get("extensionsRequired") and all("uri" not in q for k in ("buffers","images") for q in kd.get(k,[]))
kp=sum(len(q["primitives"]) for q in kd["meshes"])
kv=sum(kd["accessors"][q["attributes"]["POSITION"]]["count"] for mesh in kd["meshes"] for q in mesh["primitives"])
assert kp==3 and kv<=18000 and len(kb)<=1024*1024,(kp,kv,len(kb))
assert not any("Knowledge stars" in q.get("name","") for data in (d,sd,pd,cd) for q in data["nodes"])
assert len([q for q in kd["nodes"] if q.get("name","").startswith("Knowledge stars ")])==3
receipt.update({"knowledgeStars":4,"starRings":6,"starPrimitives":kp,"starVertices":kv,"starBytes":len(kb),"starProjectionViews":3,"connectionsProduced":True,"symbolicTrajectories":4,"adaptiveIdentityAttempts":stars["identityStudy"]["selectedAttempt"]})
(p/"library-verification.json").write_text''')
    sys.argv=[sys.argv[0],sys.argv[2]]
else:
    code=parent_source(False)
    code=once(code,'world=bpy.data.worlds.new("Locked photographic daylight")',STARS.replace("__COMPOSITION_LITERAL__",repr(composition))+'\nworld=bpy.data.worlds.new("Locked photographic daylight")')
    code=once(code,'for i,(name,w,h,pos,target,lens) in enumerate(views):',PROJECTION+'\nfor i,(name,w,h,pos,target,lens) in enumerate(views):')
    code=once(code,'    if i==0:bpy.ops.wm.save_as_mainfile(filepath=str(out/"library.blend"))','    guard_star_projection(name)\n    if i==0:bpy.ops.wm.save_as_mainfile(filepath=str(out/"library.blend"))')
    code=once(code,'receipt={"phase":"C3.3A5.4c"',RECEIPT+'\nreceipt={"phase":"C3.3A5.5a","knowledgeStars":True')
    code=once(code,'"vegetation-study.json","atmosphere-study.json"):','"vegetation-study.json","atmosphere-study.json","library-knowledge-stars.glb","knowledge-stars-study.json"):')
exec(compile(code,__file__,"exec"),globals())
