#!/usr/bin/env python3
"""P3A: one reversible architectural candidate on qualified P2B/R2 Blender.
Add THIRD gallery, rebuild single circular-oculus roof, procedural sky, Cycles.
Never modify the approved P2A/R4 or P2B/R2 source binary; no publishing.
"""
import bpy,bmesh,hashlib,json,math,struct,sys
from pathlib import Path
from mathutils import Vector
A=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def arg(flag):
    if flag not in A or A.index(flag)+1>=len(A):raise RuntimeError("Missing "+flag)
    return A[A.index(flag)+1]
def digest(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as f:
        for p in iter(lambda:f.read(1<<20),b""):h.update(p)
    return h.hexdigest()
out=Path(arg("--out")).resolve();out.mkdir(parents=True,exist_ok=True)
spec=json.loads(Path(arg("--spec")).read_text(encoding="utf-8"))
parent=json.loads(Path(arg("--parent-receipt")).read_text(encoding="utf-8"))
src=Path(bpy.data.filepath).resolve()
p=spec["architectural_parameters"];r=p["roof"];g=p["new_gallery"];sources=spec["sources"]
if not (spec["schema"]=="atlas.gateway.arch-art-p3a/v1"
        and spec["status"]=="DIREZIONE_P3A_R2_RAFFINAMENTO_DOPO_PROVA_CYCLES_R1"
        and parent["schema"]=="atlas.artdir02.p2b-material-finish-01/v1"
        and parent["reference_sha256"]==sources["art_dir_02_original_sha256"]
        and parent["source_p2a_blend_sha256"]==sources["p2a_r4_blender_sha256"]
        and parent["source_binary_unchanged"] and parent["original_objects_unchanged"]
        and parent["no_merge"] and parent["no_deploy"]
        and not parent["art_final_approved"] and not parent["web_approved"]
        and src.name==parent["files"]["blend"]["name"]
        and digest(src)==parent["files"]["blend"]["sha256"]
        and digest(src)==sources["p2b_r2_blender_sha256"]):
    raise RuntimeError("P3A must start from unchanged verified P2B/R2 source")
src_hash=digest(src);scene=bpy.context.scene
def need(name,kind=None):
    ob=bpy.data.objects.get(name)
    if ob is None or (kind is not None and ob.type!=kind):raise RuntimeError("Missing "+name)
    return ob
roof_old=need(r["original_single_monolithic_roof"],"MESH")
sky_old=need(r["original_sky"],"MESH")
rim_old=need(r["original_rim"],"MESH")
gallery1=need("ARCH04 • first gallery deck","MESH")
gallery2=need(g["donor_object"],"MESH")
camera_old=need("CAM_HERO_ARCH04","CAMERA")
portals={x:need(x+" • vetro cobalto","MESH") for x in ("Curricolo","Esplora","Percorsi","Esperienze")}
podium=[o for o in scene.objects if "podio" in o.name.lower() or "pedestal" in o.name.lower()]
if not podium:raise RuntimeError("Original podium objects absent")
for ob in (roof_old,sky_old,rim_old,gallery1,gallery2,camera_old,*portals.values()):
    if ob.hide_render:raise RuntimeError("Protected original object invisible "+ob.name)

original_names={ob.name for ob in scene.objects}
def spatial(ob):
    h=hashlib.sha256()
    for row in ob.matrix_world:
        for v in row:h.update(struct.pack("<d",float(v)))
    if ob.type=="MESH":
        h.update(struct.pack("<I",len(ob.data.vertices)))
        for v in ob.data.vertices:
            for x in v.co:h.update(struct.pack("<d",float(x)))
        h.update(struct.pack("<I",len(ob.data.polygons)))
    return h.hexdigest()
protected={ob.name:spatial(ob) for ob in (gallery1,gallery2,camera_old,*portals.values(),*podium)}
# The original sky is a real disc whose first vertex was authored at the centre.
centre=sky_old.matrix_world @ sky_old.data.vertices[0].co
cx,cy=centre.x,centre.y

def pbr(name,color,metal=0.,rough=.4,alpha=1.,emission=None):
    mat=bpy.data.materials.new(name);mat.use_nodes=True
    bs=mat.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value=(*color,alpha)
    bs.inputs["Metallic"].default_value=metal;bs.inputs["Roughness"].default_value=rough
    bs.inputs["Alpha"].default_value=alpha
    if alpha<1.:
        mat.use_nodes=True
        if hasattr(mat,"surface_render_method"):mat.surface_render_method="BLENDED"
        if "Transmission Weight" in bs.inputs:bs.inputs["Transmission Weight"].default_value=.55
    if emission:
        if "Emission Color" in bs.inputs:bs.inputs["Emission Color"].default_value=(*emission,1.)
        if "Emission Strength" in bs.inputs:bs.inputs["Emission Strength"].default_value=1.5
    return mat
graphite=pbr("P3A • copertura in pietra grigio-perla",(.37,.385,.40),.12,.52)
bronze=pbr("P3A • ottone champagne satinato",(.42,.29,.17),.7,.28)
glass=pbr("P3A • vetro parapetti",(.27,.48,.69),.02,.12,.26)
glow=pbr("P3A • filo luminoso oculo",(.88,.60,.30),.3,.25,1.,(.85,.65,.35))
support_mat=pbr("P3A • pilastri grafite",(.08,.12,.18),.24,.43)

def mesh(name,vertices,polygons,material,smooth=True):
    data=bpy.data.meshes.new(name)
    data.from_pydata(vertices,[],polygons);data.update()
    data.materials.append(material)
    ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob)
    if smooth:
        for f in data.polygons:f.use_smooth=True
    return ob
# 1. A third physical gallery is derived from the intact second-level deck.
third=gallery2.copy();third.data=gallery2.data.copy()
third.name="ATLAS P3A • third gallery deck"
scene.collection.objects.link(third)
# Set the absolute displacement in WORLD coordinates. Merely editing local
# .location is incorrect if the source has a parent or stale depsgraph matrix.
world=gallery2.matrix_world.copy()
third.parent=None
world.translation.z+=g["vertical_offset_bu"]
third.matrix_world=world
bpy.context.view_layer.update()
third.hide_render=False
third["atlas_arch_level"]=3
third["atlas_source_gallery"]=gallery2.name
def zrange(ob):
    bounds=[ob.matrix_world@Vector(v) for v in ob.bound_box]
    return [min(x.z for x in bounds),max(x.z for x in bounds)]
b2=zrange(gallery2);b3=zrange(third)
if not (.001< b3[0]-b2[0] and abs((b3[1]-b2[1])-g["vertical_offset_bu"])<.005):
    raise RuntimeError("Third gallery is not a displaced real mesh")
# Rear-facing curved glass balustrades, each as a physically thin 3D slab.
zlow=b3[1]+.035
zhigh=zlow+g["glass_height_bu"]
R=g["glass_r_bu"];N=32;segments=[]
for i in range(N):
    t0=math.pi*i/N;t1=math.pi*(i+1)/N
    coords=[]
    for rr in (R-.012,R+.012):
        for zz in (zlow,zhigh):
            for t in (t0,t1):
                coords.append((cx+rr*math.cos(t),cy+rr*math.sin(t),zz))
    faces=[(0,1,3,2),(4,6,7,5),(0,4,5,1),(2,3,7,6),(0,2,6,4),(1,5,7,3)]
    o=mesh("ATLAS P3A • parapetto vetro %02d"%i,coords,faces,glass,False)
    o["atlas_arch_level"]=3;segments.append(o)
# An actual curved top rail and delicate light line, no photograph.
def curve(name,rad,z,mat,bevel):
    c=bpy.data.curves.new(name,"CURVE");c.dimensions="3D";c.resolution_u=8
    c.bevel_depth=bevel;c.bevel_resolution=2
    spl=c.splines.new("POLY");spl.points.add(96)
    for j,pt in enumerate(spl.points):
        t=math.pi*j/96
        pt.co=(cx+rad*math.cos(t),cy+rad*math.sin(t),z,1.)
    c.materials.append(mat)
    ob=bpy.data.objects.new(name,c);scene.collection.objects.link(ob)
    ob["atlas_arch_level"]=3
    return ob
top_rail=curve("ATLAS P3A • profilo parapetto terzo livello",R,zhigh+.03,bronze,.021)
under_rail=curve("ATLAS P3A • linea luce terzo livello",R,b3[1]-.015,glow,.011)
# Lightweight 15 load-bearing-looking members above the existing second tier.
supports=[]
for k in range(g["support_positions"]):
    theta=math.pi*k/(g["support_positions"]-1)
    rr=g["support_pier_axis_r_bu"]
    x,y=cx+rr*math.cos(theta),cy+rr*math.sin(theta)
    z0=7.22;z1=r["outer_underside_z_bu"]-.09
    verts=[]
    M=8;radius=.105
    for z in (z0,z1):
        for j in range(M):
            a=math.tau*j/M
            verts.append((x+radius*math.cos(a),y+radius*math.sin(a),z))
    faces=[tuple(reversed(range(M))),tuple(range(M,2*M))]
    for j in range(M):faces.append((j,(j+1)%M,(j+1)%M+M,j+M))
    ob=mesh("ATLAS P3A • pilastro terzo livello %02d"%k,verts,faces,support_mat)
    ob["atlas_arch_level"]=3
    supports.append(ob)
# Actual third-level backdrop: modular reading bays and shallow shelves. These
# are in the editable scene as 3D objects, not pasted picture planes.
back_mat=pbr("P3A • nicchie blu profonde",(.115,.17,.235),.08,.70)
shelf_mat=pbr("P3A • ripiani bronzo satinato",(.33,.25,.17),.44,.48,1.,(.13,.07,.03))
books_mat=pbr("P3A • libri e pannellature",(.36,.42,.46),.1,.68)
def cuboid_vertices(center,half_tan,half_r,half_z,theta):
    cx0,cy0,cz0=center
    radial=Vector((math.cos(theta),math.sin(theta),0))
    tangent=Vector((-math.sin(theta),math.cos(theta),0))
    vertices=[]
    for zsgn in (-1,1):
        for rsgn in (-1,1):
            for tsgn in (-1,1):
                q=Vector((cx0,cy0,cz0))+tangent*(tsgn*half_tan)+radial*(rsgn*half_r)+Vector((0,0,zsgn*half_z))
                vertices.append(tuple(q))
    faces=[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)]
    return vertices,faces
reading_bays=[]
for i in range(12):
    angle=math.pi*(i+.5)/12
    rad=11.66
    centre_bay=(cx+rad*math.cos(angle),cy+rad*math.sin(angle),
                (b3[1]+r["outer_underside_z_bu"])/2)
    height=(r["outer_underside_z_bu"]-b3[1])-.40
    vv,ff=cuboid_vertices(centre_bay,.85,.075,height/2,angle)
    wall=mesh("ATLAS P3A • alcova lettura %02d"%i,vv,ff,back_mat,False)
    reading_bays.append(wall)
    for row in range(3):
        z=b3[1]+.45+row*.50
        sp=(centre_bay[0]-.1*math.cos(angle),centre_bay[1]-.1*math.sin(angle),z)
        vv,ff=cuboid_vertices(sp,.78,.10,.035,angle)
        mesh("ATLAS P3A • scaffale %02d-%d"%(i,row),vv,ff,shelf_mat,False)
        for k in range(6):
            tangent=Vector((-math.sin(angle),math.cos(angle),0))
            cp=Vector((sp[0],sp[1],sp[2]+.16))+tangent*((k-2.5)*.22)
            vv,ff=cuboid_vertices(cp,.068,.056,.12,angle)
            mesh("ATLAS P3A • volume biblioteca %02d-%d-%d"%(i,row,k),vv,ff,books_mat,False)
# Add restrained photometric wash at the new gallery (not many high-cost lights).
upper_lights=[]
for index,theta in enumerate((.18*math.pi,.40*math.pi,.60*math.pi,.82*math.pi)):
    rr=9.9
    light=bpy.data.lights.new("ATLAS P3A • luce nicchie superiori %02d"%index,"AREA")
    light.energy=460.;light.shape="DISK";light.size=3.4
    light.color=(1.,.82,.67)
    obj=bpy.data.objects.new(light.name,light);scene.collection.objects.link(obj)
    obj.location=(cx+rr*math.cos(theta),cy+rr*math.sin(theta),r["outer_underside_z_bu"]-.42)
    target=Vector((cx+11.65*math.cos(theta),cy+11.65*math.sin(theta),b3[1]+.80))
    obj.rotation_euler=(target-obj.location).to_track_quat("-Z","Y").to_euler()
    upper_lights.append(obj)

# 2. New single physically circular oculus, no elliptic/superelliptic deformation.
rad=r["circular_oculus"]["radius_bu"];outer=r["outer_radius_bu"]
if not (0<rad<outer and r["inner_underside_z_bu"]>r["outer_underside_z_bu"] and r["outer_underside_z_bu"]-b3[1]>=g["minimum_headroom_bu"] and r["outer_underside_z_bu"]>z1):
    raise RuntimeError("Roof and new gallery vertical clearance invalid")
N=r["circular_oculus"]["segments"];K=8;thickness=r["thickness_bu"]
def roof_z(t):
    return r["inner_underside_z_bu"]-(r["inner_underside_z_bu"]-r["outer_underside_z_bu"])*(t*t*(3-2*t))
verts=[]
for layer in (0,1):
    for k in range(K+1):
        t=k/K;radius=rad+(outer-rad)*t;z=roof_z(t)+layer*thickness
        for j in range(N):
            a=math.tau*j/N
            verts.append((cx+radius*math.cos(a),cy+radius*math.sin(a),z))
def ix(layer,k,j):return layer*(K+1)*N+k*N+j%N
faces=[]
for layer in (0,1):
    for k in range(K):
        for j in range(N):
            a,b=ix(layer,k,j),ix(layer,k,j+1);c,d=ix(layer,k+1,j),ix(layer,k+1,j+1)
            faces.append((a,c,d,b) if layer==0 else (a,b,d,c))
for j in range(N):
    j1=(j+1)%N
    faces.extend([(ix(0,0,j),ix(0,0,j1),ix(1,0,j1),ix(1,0,j)),
                  (ix(0,K,j1),ix(0,K,j),ix(1,K,j),ix(1,K,j1))])
newroof=mesh("ATLAS P3A • padiglione unico oculo circolare",verts,faces,graphite)
bm=bmesh.new()
try:
    bm.from_mesh(newroof.data)
    bm.verts.ensure_lookup_table()
    bm.edges.ensure_lookup_table()
    edge_count=sum(not e.is_manifold for e in bm.edges)
    volume=abs(float(bm.calc_volume(signed=True)))
finally:bm.free()
if edge_count or volume<1.0:raise RuntimeError("New annular roof not watertight")
radii=[math.hypot(v[0]-cx,v[1]-cy) for v in verts[:N]]
radius_range=max(radii)-min(radii)
if radius_range>.001:raise RuntimeError("Oculus not a real circle")
# Cylindrical 3D oculus rim, four-sided brass channel.
border_verts=[];border_faces=[]
for radius,z in ((rad-.035,r["inner_underside_z_bu"]-.025),
                 (rad+.02,r["inner_underside_z_bu"]-.025),
                 (rad+.02,r["inner_underside_z_bu"]+.07),
                 (rad-.035,r["inner_underside_z_bu"]+.07)):
    for j in range(N):
        t=math.tau*j/N
        border_verts.append((cx+radius*math.cos(t),cy+radius*math.sin(t),z))
for k in range(4):
    for j in range(N):
        j1=(j+1)%N
        border_faces.append((k*N+j,k*N+j1,((k+1)%4)*N+j1,((k+1)%4)*N+j))
border=mesh("ATLAS P3A • vera cornice oculo circolare",border_verts,border_faces,glow)
# Procedural sky: a real physical luminous disc with no downloaded textures.
skymat=bpy.data.materials.new("ATLAS P3A • cielo azzurro con nuvole procedurali")
skymat.use_nodes=True
nodes=skymat.node_tree.nodes;nodes.clear()
tex=nodes.new("ShaderNodeTexCoord");noise=nodes.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value=4.25
noise.inputs["Detail"].default_value=6.0
noise.inputs["Roughness"].default_value=.58
noise.inputs["Distortion"].default_value=.14
ramp=nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements.remove(ramp.color_ramp.elements[1])
for value,color in ((.0,(.10,.31,.65,1.)),(.40,(.16,.42,.79,1.)),(.51,(.49,.72,.92,1.)),
                    (.62,(.94,.97,1.,1.)),(1.,(1.,1.,1.,1.))):
    el=ramp.color_ramp.elements[0] if value==.0 else ramp.color_ramp.elements.new(value)
    el.position=value;el.color=color
em=nodes.new("ShaderNodeEmission");em.inputs["Strength"].default_value=1.55
output=nodes.new("ShaderNodeOutputMaterial")
links=skymat.node_tree.links
links.new(tex.outputs["Generated"],noise.inputs["Vector"])
links.new(noise.outputs["Fac"],ramp.inputs["Fac"])
links.new(ramp.outputs["Color"],em.inputs["Color"])
links.new(em.outputs[0],output.inputs["Surface"])
skyverts=[(cx,cy,r["inner_underside_z_bu"]+.38)]
for j in range(N):
    t=math.tau*j/N
    skyverts.append((cx+rad*math.cos(t),cy+rad*math.sin(t),r["inner_underside_z_bu"]+.38))
skyfaces=[(0,j+1,(j+1)%N+1) for j in range(N)]
newsky=mesh("ATLAS P3A • cielo fisico circolare",skyverts,skyfaces,skymat)
# Historical originals only hidden for rendering, never deleted.
for ob in (roof_old,sky_old,rim_old):
    ob.hide_render=True
# Sky daylight, physically located above the podium with the oculus.
day=bpy.data.lights.new("ATLAS P3A • luce zenitale ampia","AREA")
day.energy=4200.;day.shape="DISK";day.size=10.;day.color=(.81,.91,1.)
dayobj=bpy.data.objects.new("ATLAS P3A • luce zenitale ampia",day)
scene.collection.objects.link(dayobj)
dayobj.location=(cx,cy,r["inner_underside_z_bu"]-.7)
direction=Vector((0.,-2.,.8))-dayobj.location
dayobj.rotation_euler=direction.to_track_quat("-Z","Y").to_euler()
# 3. Independent HERO camera. Previous R4 source camera cannot change.
cam=camera_old.copy();cam.data=camera_old.data.copy();cam.name="ATLAS P3A • CAMERA HERO"
scene.collection.objects.link(cam);scene.camera=cam
cam.data.lens=camera_old.data.lens*.82
cam.data.shift_y=camera_old.data.shift_y+.027
# Independent spatial validation before rendering.
if any(name not in bpy.data.objects for name in original_names):
    raise RuntimeError("Original architecture deleted")
changed=[name for name,previous in protected.items() if spatial(need(name))!=previous]
if changed:raise RuntimeError("Original architecture moved or deformed "+str(changed))
if digest(src)!=src_hash:raise RuntimeError("Original P2B source changed")
scene.render.engine="CYCLES"
scene.cycles.samples=72
scene.render.resolution_x=1280;scene.render.resolution_y=720
scene.render.resolution_percentage=100;scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
scene.view_settings.view_transform="AgX"
scene.view_settings.exposure=.04
bpy.context.view_layer.update()
png=out/"atlas-p3a-four-level-circular-oculus-HERO.png"
scene.render.filepath=str(png)
bpy.ops.render.render(write_still=True)
if not png.exists() or png.stat().st_size<100000:raise RuntimeError("Real Cycles render missing")
blend=out/"atlas-p3a-four-level-circular-oculus-editable.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(blend),compress=True)
area0=4*6.15*4.20*math.gamma(1+1/2.7)**2/math.gamma(1+2/2.7)
area1=math.pi*rad**2
receipt={
 "schema":"atlas.gateway.arch-art-p3a-cycles-result/v1",
 "prior_architecture":"P2A/R4 immutable; candidate does not supersede approval",
 "source_blender_sha256":src_hash,
 "source_blender_intact":digest(src)==src_hash,
 "original_objects_intact":True,
 "original_protected_objects_count":len(protected),
 "old_roof_preserved_hidden":True,
 "four_orig_portals_verified":len(portals),
 "gallery_levels_ground_included":4,
 "gallery3":{"object":third.name,"z_world_range":b3,"real_deck":len(third.data.polygons)>0,
   "glass_segments":len(segments),"supports":len(supports),
   "reading_bays":len(reading_bays),"upper_ambient_lights":len(upper_lights),
   "headroom_above_deck_bu":r["outer_underside_z_bu"]-b3[1],
   "top_rail":top_rail.name,"under_rail":under_rail.name},
 "roof":{"single_watertight_mesh":edge_count==0,"nonmanifold_edges":edge_count,
   "absolute_volume_bu3":volume,"radius_bu":rad,"radius_spread_bu":radius_range,
   "circular_sample_count":N,"outer_radius_bu":outer,"thickness_bu":thickness,
   "opening_area_prior_bu2":area0,"opening_area_candidate_bu2":area1,
   "opening_increase_percent":100*(area1/area0-1)},
 "sky":{"physical_disc":newsky.name,"procedural_non_external":True,
        "additional_daylight":dayobj.name},
 "camera":{"independent":cam.name,"lens_mm":cam.data.lens},
 "files":{key:{"name":file.name,"bytes":file.stat().st_size,"sha256":digest(file)}
          for key,file in (("blend",blend),("render",png))},
 "art_final_approved":False,"web_product_approved":False,"student_publication_approved":False,
 "no_merge":True,"no_deploy":True,
 "limitations":["Rendered view requires artistic review vs ART-REF-04.",
                "Not yet exported or browser-tested as WebGL.",
                "Real Android/LIM and accessibility testing still required."]
}
(out/"atlas-p3a-qualification-receipt.json").write_text(json.dumps(receipt,indent=2,ensure_ascii=False),encoding="utf-8")
print("ATLAS_P3A_FOUR_LEVEL_CIRCLE_GEOMETRY_AND_CYCLES_PASS",
      json.dumps({"third_gallery_range":b3,"circle_radius":rad,"roof_nonmanifold":edge_count,
                  "opening_increase_pct":round(receipt["roof"]["opening_increase_percent"],1),
                  "render_sha256":receipt["files"]["render"]["sha256"]}),flush=True)
