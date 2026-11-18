"""ART-FINAL: isolated four-star sculptural candidate, not visual approval."""
import bpy, math, hashlib, json, struct, sys
from pathlib import Path
from mathutils import Vector
from math import sin, cos, pi

args=sys.argv[sys.argv.index("--")+1:]
master, previous, out=map(Path,args)
assert bpy.app.version[:3]==(4,2,23)
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(master)=="e3225c61357eafd1467c83b270086d669b6ba2602a364e5d0f2a89964a59e4df"
out.mkdir(parents=True,exist_ok=False)
plan=json.loads((Path(__file__).resolve().parent/"knowledge-composition.json").read_text())
ids=plan["ids"]; assert ids==["storie","laboratori","scoperte","percorsi"] and plan["selected"]=="A"
positions={sid:Vector(p[:3]) for sid,p in zip(ids,plan["layouts"]["A"])}
# Open a copy of the exact C2 master. Never save over the input.
bpy.ops.wm.open_mainfile(filepath=str(master))
scene=bpy.context.scene
book=[o for o in scene.objects if o.type=="MESH" and o.name.startswith("Storie_")]
assert len(book)==15
bpy.context.view_layer.update()
original=[o.matrix_world@v.co for o in book for v in o.data.vertices]
lo=Vector(tuple(min(v[i] for v in original) for i in range(3)))
hi=Vector(tuple(max(v[i] for v in original) for i in range(3)))
center=(lo+hi)/2
scale=.59/max((v-center).length for v in original)
for o in list(scene.objects):
    if o not in book:bpy.data.objects.remove(o,do_unlink=True)
# One warm and one cool vertex-colored glTF material. Procedural C2 detail
# remains in the original master; this is explicitly a geometry-first LOD.
def material(name,metal,rough):
    m=bpy.data.materials.new(name);m.use_nodes=True
    bs=m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Metallic"].default_value=metal
    bs.inputs["Roughness"].default_value=rough
    n=m.node_tree.nodes.new("ShaderNodeVertexColor");n.layer_name="Atlas finish"
    m.node_tree.links.new(n.outputs["Color"],bs.inputs["Base Color"])
    return m
warm=material("Knowledge finish warm",.68,.36)
cool=material("Knowledge finish cool",.55,.34)
groups={"warm":[],"cool":[]};cores={sid:[] for sid in ids}
def activate(o):
    bpy.ops.object.select_all(action="DESELECT");o.select_set(True);bpy.context.view_layer.objects.active=o
def finish(o,sid,color):
    family="warm" if sid in ("storie","scoperte") else "cool"
    o.data.materials.clear();o.data.materials.append(warm if family=="warm" else cool)
    for layer in list(o.data.color_attributes):o.data.color_attributes.remove(layer)
    a=o.data.color_attributes.new(name="Atlas finish",type="FLOAT_COLOR",domain="CORNER")
    for d in a.data:d.color=(*color,1.)
    for p in o.data.polygons:p.use_smooth=True
    groups[family].append(o);cores[sid].append(o)
    return o
for o in book:
    # Transform the open page plane into the frontal XZ plane in Atlas.
    mat=o.data.materials[0];bs=mat.node_tree.nodes.get("Principled BSDF")
    color=tuple(bs.inputs["Base Color"].default_value[:3])
    world=o.matrix_world.copy();o.parent=None
    from mathutils import Matrix
    o.matrix_world=Matrix.Identity(4)
    # Tilt the book toward the atrium camera to expose the layered leaves.
    tilt=Matrix.Rotation(math.radians(-22),3,"X")
    is_page=o.name.rsplit("_",1)[-1].isdigit()
    if is_page:
        layer=int(o.name.rsplit("_",1)[-1])
        # Broad alternating bronze tones remain legible at architectural scale.
        factor=(.80,1.12,.87,1.18,.94,1.23)[layer]
        color=tuple(min(.95,max(.015,c*factor)) for c in color)
    for v in o.data.vertices:
        p=(world@v.co-center)*scale
        v.co=positions["storie"]+tilt@Vector((p.x,-p.z,p.y))
    for uv in list(o.data.uv_layers):o.data.uv_layers.remove(uv)
    o.data.calc_loop_triangles()
    activate(o)
    mod=o.modifiers.new("C2 geometric LOD","DECIMATE")
    mod.ratio=min(1,480/max(1,len(o.data.loop_triangles)))
    bpy.ops.object.modifier_apply(modifier=mod.name)
    finish(o,"storie",color)
def mesh(name,sid,verts,faces,color):
    data=bpy.data.meshes.new(name)
    data.from_pydata([positions[sid]+Vector(v) for v in verts],[],faces);data.update()
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o)
    import bmesh
    bm=bmesh.new();bm.from_mesh(data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    assert all(e.is_manifold for e in bm.edges);bm.to_mesh(data);bm.free()
    return finish(o,sid,color)
def sphere(sid,name,p,r,color,scale=(1,1,1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=r,location=positions[sid]+Vector(p))
    o=bpy.context.object;o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,sid,color)
def tube(sid,name,pts,r,color,sides=10):
    pts=[Vector(p) for p in pts];v=[];f=[]
    for i,p in enumerate(pts):
        t=(pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]).normalized()
        u=t.cross(Vector((0,1,0)))
        if u.length<.001:u=t.cross(Vector((0,0,1)))
        u.normalize();w=t.cross(u)
        v.extend(tuple(p+r*(cos(2*pi*j/sides)*u+sin(2*pi*j/sides)*w)) for j in range(sides))
    for i in range(len(pts)-1):
        for j in range(sides):
            a=i*sides+j;b=i*sides+(j+1)%sides;f.append((a,b,b+sides,a+sides))
    f += [tuple(reversed(range(sides))),tuple((len(pts)-1)*sides+j for j in range(sides))]
    return mesh(name,sid,v,f,color)
blue=(.055,.24,.38);silver=(.23,.44,.58);gold=(.52,.26,.072);pale=(.72,.44,.16)
# Laboratori: dimensional molecular sculpture with satin spheres and metal links.
sid="laboratori";nodes=[(-.31,.02,-.22),(.31,.02,-.22),(0,-.09,.32)]
for i,p in enumerate(nodes):
    for j,q in enumerate(nodes[:i]):
        tube(sid,f"Bond {i}-{j}",[Vector(q).lerp(Vector(p),k/4) for k in range(5)],.065,silver)
    sphere(sid,f"Atom {i}",p,.20,blue if i<2 else silver)
# Scoperte: four curved, double-sided compass blades with sculpted profiles.
sid="scoperte"
for i in range(4):
    angle=i*pi/2
    def rotate(x,y,z):return (cos(angle)*x+sin(angle)*z,y,-sin(angle)*x+cos(angle)*z)
    sections=[(.04,.085,.060),(.18,.145,.115),(.34,.098,.085),(.52,.018,.025),(.55,.004,.008)]
    v=[];f=[];sides=12
    for z,w,d in sections:
        v.extend(rotate(w*cos(2*pi*j/sides),d*sin(2*pi*j/sides),z) for j in range(sides))
    for k in range(len(sections)-1):
        for j in range(sides):
            a=k*sides+j;b=k*sides+(j+1)%sides;f.append((a,b,b+sides,a+sides))
    f += [tuple(reversed(range(sides))),tuple((len(sections)-1)*sides+j for j in range(sides))]
    mesh("Compass blade "+str(i),sid,v,f,pale if i%2==0 else gold)
sphere(sid,"Compass hub",(0,-.025,0),.18,gold,(1,.68,1))
# Percorsi: continuous curved shaft and a broad, explicitly triangular head.
# The head is a shallow double-sided beveled sculpture, not a round cone.
sid="percorsi"
pts=[(-.40+.56*t,.025-.045*sin(pi*t),-.38+.55*t*t) for t in [i/20 for i in range(21)]]
tube(sid,"Ascending ribbon",pts,.084,blue,14)
direction=Vector((.38,0,.925)).normalized()
across=Vector((direction.z,0,-direction.x))
base=Vector(pts[-1])-.04*direction
# Distinct shoulders and tip in the frontal plane, with a rounded edge.
outline=[(-.205,0),(.205,0),(0,.34)]
v=[tuple(base+x*across+h*direction+Vector((0,y,0))) for y in (-.075,.075) for x,h in outline]
f=[(2,1,0),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)]
head=mesh("Ascending arrowhead",sid,v,f,silver)
activate(head)
bevel=head.modifiers.new("Rounded arrow shoulders","BEVEL");bevel.width=.025;bevel.segments=4
bpy.ops.object.modifier_apply(modifier=bevel.name)
# Reapply the constant vertex palette after topology modification.
layer=head.data.color_attributes["Atlas finish"]
for item in layer.data:item.color=(*silver,1.)
for poly in head.data.polygons:poly.use_smooth=True
bpy.context.view_layer.update()
bounds={}
for sid in ids:
    vs=[o.matrix_world@v.co for o in cores[sid] for v in o.data.vertices]
    radius=max((v-positions[sid]).length for v in vs)
    # Rescale only the core around the locked center, never the orbits.
    if radius>.60 or radius<.55:
        s=.59/radius
        for o in cores[sid]:
            mw=o.matrix_world.copy()
            for v in o.data.vertices:v.co=mw.inverted()@(positions[sid]+s*(mw@v.co-positions[sid]))
    vs=[o.matrix_world@v.co for o in cores[sid] for v in o.data.vertices]
    radius=max((v-positions[sid]).length for v in vs)
    assert .55<=radius<=.64
    bounds[sid]={"radiusM":radius,"components":len(cores[sid]),"position":list(positions[sid])}
# Recover the exact prior orbit/trajectory geometry from the verified FAST GLB.
before=set(scene.objects)
bpy.ops.import_scene.gltf(filepath=str(previous))
imported=set(scene.objects)-before
orbit=[o for o in imported if o.type=="MESH" and any(m and m.name.startswith("Knowledge star satin orbit") for m in o.data.materials)]
assert len(orbit)==1
for o in imported:
    if o not in orbit:bpy.data.objects.remove(o,do_unlink=True)
# Save editable independent candidate before merging the two core families.
bpy.ops.wm.save_as_mainfile(filepath=str(out/"four-stars.blend"))
for family,objects in groups.items():
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join()
    o=bpy.context.object;o.name="Knowledge sculpture "+family
    groups[family]=[o]
final=[groups["warm"][0],groups["cool"][0],orbit[0]]
bpy.ops.object.select_all(action="DESELECT")
for o in final:o.select_set(True)
bpy.context.view_layer.objects.active=final[0]
glb=out/"four-stars.glb"
bpy.ops.export_scene.gltf(filepath=str(glb),export_format="GLB",use_selection=True,export_texcoords=False,export_vertex_color="MATERIAL",export_all_vertex_colors=False,export_draco_mesh_compression_enable=False)
raw=glb.read_bytes()
assert struct.unpack_from("<4sII",raw)==(b"glTF",2,len(raw))
n,t=struct.unpack_from("<I4s",raw,12);assert t==b"JSON"
g=json.loads(raw[20:20+n]);pr=[p for m in g["meshes"] for p in m["primitives"]]
nv=sum(g["accessors"][p["attributes"]["POSITION"]]["count"] for p in pr)
assert len(pr)==3 and nv<=18000 and len(raw)<=1024*1024,(len(pr),nv,len(raw))
assert not g.get("extensionsRequired") and not g.get("images") and all("uri" not in b for b in g["buffers"])
(out/"receipt.json").write_text(json.dumps({"status":"GEOMETRY_LOD_CANDIDATE","revision":"ART-FINAL-R2","changedCores":["storie","percorsi"],"sourceC2Sha256":sha(master),"previousModuleSha256":sha(previous),"moduleSha256":sha(glb),"primitives":len(pr),"vertices":nv,"bytes":len(raw),"cores":bounds,"c2MicrostructureBaked":False,"contextRendered":False,"artisticApproval":False,"runtimeQualified":False,"publishable":False,"studentAuthorized":False},indent=2))

# Produce actual isolated studio evidence with the final exported geometry.
# No claim of in-context library rendering, baked microstructure or approval.
scene=bpy.context.scene
world=bpy.data.worlds.new("ART FINAL neutral studio");scene.world=world;world.use_nodes=True
bg=world.node_tree.nodes.get("Background");bg.inputs[0].default_value=(.35,.35,.35,1);bg.inputs[1].default_value=.55
d=bpy.data.cameras.new("Detail camera");d.type="ORTHO";d.ortho_scale=1.6
cam=bpy.data.objects.new("Detail camera",d);scene.collection.objects.link(cam);scene.camera=cam
lights=[]
for name,offset,energy,size in [("Key",(-2,-3,3),230,2.1),("Fill",(2,-2,.8),110,1.9),("Rim",(.3,1.7,2),280,1.6)]:
    ld=bpy.data.lights.new(name,"AREA");ld.energy=energy;ld.shape="DISK";ld.size=size
    lamp=bpy.data.objects.new(name,ld);scene.collection.objects.link(lamp);lights.append((lamp,Vector(offset)))
scene.render.engine="CYCLES";scene.cycles.device="CPU";scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=480;scene.render.resolution_y=480;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.file_format="PNG";scene.render.image_settings.color_mode="RGBA"
scene.view_settings.view_transform="AgX"
for sid in ids:
    c=positions[sid]
    cam.location=c+Vector((.45,-4,.55));cam.rotation_euler=(c-cam.location).to_track_quat("-Z","Y").to_euler()
    for lamp,offset in lights:
        lamp.location=c+offset;lamp.rotation_euler=(c-lamp.location).to_track_quat("-Z","Y").to_euler()
    scene.render.filepath=str(out/("detail-"+sid+".png"));bpy.ops.render.render(write_still=True)
receipt=json.loads((out/"receipt.json").read_text())
receipt["files"]={p.name:{"bytes":p.stat().st_size,"sha256":sha(p)} for p in sorted(out.iterdir()) if p.name!="receipt.json"}
receipt["detailRenderCount"]=4
(out/"receipt.json").write_text(json.dumps(receipt,indent=2))
