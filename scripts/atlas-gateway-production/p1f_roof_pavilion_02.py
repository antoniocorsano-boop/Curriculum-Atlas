#!/usr/bin/env python3
"""P1F/ROOF-02: one pavilion shell and one genuine elongated skylight.
Load ONLY the SHA-qualified P1F candidate. All legacy roof pieces are retained
but hidden in the new editable derivative; four glass portals are untouched.
"""
import bpy,bmesh,hashlib,json,math,statistics,sys
from pathlib import Path
from mathutils import Vector

argv=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def arg(k):
    if k not in argv or argv.index(k)+1>=len(argv): raise ValueError(k)
    return argv[argv.index(k)+1]
out=Path(arg("--out")).resolve();out.mkdir(exist_ok=True,parents=True)
receipt=json.loads(Path(arg("--parent-receipt")).read_text())
source=Path(bpy.data.filepath)
def sha(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for b in iter(lambda:f.read(1<<20),b""):h.update(b)
    return h.hexdigest()
src_sha=sha(source)
if (receipt["schema"]!="atlas.artdir02.p1f-pavilion-01/v1"
    or source.name!="atlas-p1f-pavilion-01-B-J4.blend"
    or src_sha!=receipt["file"]["blend"]["sha256"]
    or not receipt["source_unmodified"] or receipt["art_approved"]
    or not receipt["no_merge"] or not receipt["no_deploy"]):
    raise RuntimeError("Parent P1F candidate not authenticated")
scene=bpy.context.scene
def need(n):
    x=bpy.data.objects.get(n)
    if x is None:raise RuntimeError("Missing "+n)
    return x
cam=need("CAM_HERO_ARCH04")
rim=need("ARCH B raised oculus rim")
old_roof=need("ATLAS B J4 integrated structural crown and vault")
old_sky=need("ARCH B raised sky opening")
old_collar=need("ATLAS R7 • one dark skylight collar")
first=need("ARCH04 • first gallery deck")
upper=need("ARCH04 • upper gallery deck")
glass=[need(s+" • vetro cobalto") for s in ("Curricolo","Esplora","Percorsi","Esperienze")]
if any(o.type!="MESH" for o in (old_roof,old_sky,old_collar)) or rim.type!="CURVE":
    raise RuntimeError("Qualified geometric structures missing")
original_lights={o.name:o.data.energy for o in scene.objects if o.type=="LIGHT"}
original_glass={o.name:(tuple(tuple(q) for q in o.matrix_world),
                len(o.data.vertices) if o.type=="MESH" else -1) for o in glass}
# Recover genuine roof/rim centre and original camera-aligned axes.
rpts=[]
for sp in rim.data.splines:
    if sp.type=="BEZIER":
        rpts.extend(rim.matrix_world@x.co for x in sp.bezier_points)
    else:
        rpts.extend(rim.matrix_world@Vector(x.co[:3]) for x in sp.points)
cx,cy=statistics.mean(p.x for p in rpts),statistics.mean(p.y for p in rpts)
source_camera=cam.matrix_world.translation
long=Vector((cx-source_camera.x,cy-source_camera.y)).normalized()
side=Vector((-long.y,long.x))
# Larger architectural clear span, not a resized circular collar.
N=192
RINGS=10
N_EXP=2.7
A=6.15
B=4.20
OUTER_R=11.50
INNER_Z=9.68
OUTER_Z=8.02
THICK=.14
def super_xy(theta):
    u=math.cos(theta);v=math.sin(theta)
    return (A*math.copysign(abs(u)**(2./N_EXP),u),
            B*math.copysign(abs(v)**(2./N_EXP),v))
def xyz(theta,t,z):
    x,y=super_xy(theta)
    outerx,outery=OUTER_R*math.cos(theta),OUTER_R*math.sin(theta)
    u,v=x*(1-t)+outerx*t,y*(1-t)+outery*t
    return (cx+u*long.x+v*side.x,cy+u*long.y+v*side.y,z)
def smooth(t):return t*t*(3-2*t)
def under_z(t):return INNER_Z-(INNER_Z-OUTER_Z)*smooth(t)
# First half of the mesh contains a fully connected underside, second half top.
verts=[]
for layer in range(2):
    for k in range(RINGS+1):
        t=k/RINGS
        z=under_z(t)+(THICK if layer else 0.)
        for j in range(N):
            verts.append(xyz(2*math.pi*j/N,t,z))
def vertex(layer,k,j):return layer*(RINGS+1)*N+k*N+(j%N)
faces=[]
for layer in range(2):
    for k in range(RINGS):
        for j in range(N):
            a,b=vertex(layer,k,j),vertex(layer,k,j+1)
            c,d=vertex(layer,k+1,j),vertex(layer,k+1,j+1)
            faces.append((a,c,d,b) if layer==0 else (a,b,d,c))
# Close inner and outer thickness boundaries: one watertight annular solid.
for j in range(N):
    j1=(j+1)%N
    faces.append((vertex(0,0,j),vertex(0,0,j1),vertex(1,0,j1),vertex(1,0,j)))
    faces.append((vertex(0,RINGS,j1),vertex(0,RINGS,j),
                  vertex(1,RINGS,j),vertex(1,RINGS,j1)))
def newmesh(name,coords,polys,mat):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(coords,[],polys);mesh.update()
    mesh.materials.append(mat)
    ob=bpy.data.objects.new(name,mesh)
    scene.collection.objects.link(ob)
    for f in mesh.polygons:f.use_smooth=True
    return ob
roof_mat=bpy.data.materials.get("P1F • volta blu grafite")
if not roof_mat:raise RuntimeError("Parent dark roof finish unavailable")
newroof=newmesh("ATLAS P1F • padiglione lungo copertura monolitica",verts,faces,roof_mat)
bm=bmesh.new()
try:
    bm.from_mesh(newroof.data)
    bm.verts.ensure_lookup_table()
    bm.edges.ensure_lookup_table()
    bm.faces.ensure_lookup_table()
    bm.normal_update()
    nonmanifold=sum(not e.is_manifold for e in bm.edges)
    connected=set(); stack=[bm.verts[0]]
    while stack:
        p=stack.pop()
        if p in connected:continue
        connected.add(p)
        stack.extend(e.other_vert(p) for e in p.link_edges if e.other_vert(p) not in connected)
    topology={"verts":len(bm.verts),"faces":len(bm.faces),
              "nonmanifold_edges":nonmanifold,
              "connected":len(connected)==len(bm.verts),
              "signed_volume":float(bm.calc_volume(signed=True))}
finally:bm.free()
if topology["nonmanifold_edges"] or not topology["connected"] or abs(topology["signed_volume"])<.5:
    raise RuntimeError("Replacement roof is not one closed shell "+str(topology))
# One sky disc at the SINGLE new opening; old textures/material preserved.
sky_material=old_sky.data.materials[0] if old_sky.data.materials else None
if sky_material is None:raise RuntimeError("Original sky image shader missing")
disc=[(cx,cy,INNER_Z+.50)]
for j in range(N):
    disc.append(xyz(2*math.pi*j/N,0.,INNER_Z+.50))
triangles=[(0,j+1,(j+1)%N+1) for j in range(N)]
sky=newmesh("ATLAS P1F • cielo unico del padiglione",disc,triangles,sky_material)
# Map existing sky texture across the new opening without altering original image.
uv=sky.data.uv_layers.new(name="UVMap")
for face in sky.data.polygons:
    for li in face.loop_indices:
        v=sky.data.vertices[sky.data.loops[li].vertex_index].co
        dx=v.x-cx;dy=v.y-cy
        u=(dx*long.x+dy*long.y)/(2*A)+.5
        w=(dx*side.x+dy*side.y)/(2*B)+.5
        uv.data[li].uv=(u,w)
# Single delicate warm border follows the new opening; unlike multiple old collars.
bronze=bpy.data.materials.get("Atrium • ottone satinato")
if not bronze:
    bronze=bpy.data.materials.new("P1F • bordino oro discreto")
    bronze.diffuse_color=(.5,.28,.10,1)
rimv=[]
for rscale,z in ((1.0,INNER_Z-.035),(1.012,INNER_Z-.035),
                 (1.012,INNER_Z+.025),(1.0,INNER_Z+.025)):
    for j in range(N):
        th=2*math.pi*j/N
        x,y=super_xy(th)
        rimv.append((cx+rscale*(x*long.x+y*side.x),
                     cy+rscale*(x*long.y+y*side.y),z))
rimf=[]
for ring in range(4):
    for j in range(N):
        i0=ring*N+j;i1=ring*N+(j+1)%N
        k0=((ring+1)%4)*N+j;k1=((ring+1)%4)*N+(j+1)%N
        rimf.append((i0,i1,k1,k0))
smallrim=newmesh("ATLAS P1F • unico bordino lucernario",rimv,rimf,bronze)
# Historical elements kept for reproducibility, but excluded from rendering.
hidden={o.name:o.hide_render for o in (old_roof,old_sky,old_collar,rim)}
for o in (old_roof,old_sky,old_collar,rim):o.hide_render=True
for o in [newroof,sky,smallrim]:o.hide_render=False
scene.camera=cam
scene.render.engine="CYCLES"
scene.render.resolution_x=1280
scene.render.resolution_y=720
scene.render.resolution_percentage=100
scene.cycles.samples=44
bpy.context.view_layer.cycles.use_denoising=True
scene.render.image_settings.file_format="PNG"
png=out/"atlas-p1f-pavilion-roof02-HERO.png"
scene.render.filepath=str(png)
bpy.ops.render.render(write_still=True)
if not png.exists() or png.stat().st_size<20000:
    raise RuntimeError("Cycles render missing")
blend=out/"atlas-p1f-pavilion-roof02-editable.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(blend),compress=True)
# Geometry-only budget specimen, not yet the optimized full web model.
for o in scene.objects:o.select_set(False)
newroof.select_set(True)
bpy.context.view_layer.objects.active=newroof
glb=out/"atlas-p1f-pavilion-roof02-geometry.glb"
bpy.ops.export_scene.gltf(filepath=str(glb),export_format="GLB",
                           use_selection=True,export_materials="NONE",
                           export_animations=False)
if not glb.exists() or glb.stat().st_size<2000:
    raise RuntimeError("No diagnostic GLB")
if sha(source)!=src_sha:raise RuntimeError("Source binary overwritten")
if {o.name:o.data.energy for o in scene.objects if o.type=="LIGHT"}!=original_lights:
    raise RuntimeError("Source lights changed")
for o in glass:
    state=(tuple(tuple(q) for q in o.matrix_world),
           len(o.data.vertices) if o.type=="MESH" else -1)
    if state!=original_glass[o.name]:
        raise RuntimeError("Glass portal changed "+o.name)
result={"schema":"atlas.artdir02.p1f-roof-pavilion-02/v1",
        "original_qualified_J4_source_sha256":receipt["source"]["sha256"],
        "p1f_parent_sha256":src_sha,
        "canonical_art_sha256":receipt["canonical_art_sha256"],
        "single_roof_mesh_closed":topology,
        "single_sky_disc":sky.name,
        "old_circular_collar_sky_and_vault_render_hidden":hidden,
        "new_crown":{"major_halfspan_bu":A,"minor_halfspan_bu":B,
                     "superellipse_exponent":N_EXP,"inner_height_bu":INNER_Z,
                     "outer_radius_bu":OUTER_R,"outer_height_bu":OUTER_Z,
                     "shell_thickness_bu":THICK},
        "four_glass_portals_geometry_preserved":True,
        "lights_unchanged":True,
        "source_binary_unchanged":True,
        "files":{key:{"name":p.name,"bytes":p.stat().st_size,"sha256":sha(p)}
                 for key,p in (("blend",blend),("render",png),("roof_glb",glb))},
        "art_approved":False,"web_approved":False,
        "no_merge":True,"no_deploy":True,"no_student_data":True,
        "interpretation":"True pavilion roof replaces the rendered historical annular roof; source J4 candidate remains separate and recoverable."}
(out/"atlas-p1f-pavilion-roof02-receipt.json").write_text(
    json.dumps(result,ensure_ascii=False,indent=2))
print("P1F_ROOF02_REAL_SINGLE_PAVILION",json.dumps({
    "source":src_sha,"roof_top":INNER_Z,"topology":topology,
    "blend_sha256":result["files"]["blend"]["sha256"],
    "glb_bytes":glb.stat().st_size
}),flush=True)
