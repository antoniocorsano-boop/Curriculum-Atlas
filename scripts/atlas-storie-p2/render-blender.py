"""Storie P2: isolated Blender preview, derived from RIF-05 parametric geometry.
Not image inference, runtime candidate, or artistic approval."""
import bpy, bmesh, numpy as np, math, hashlib, json, sys, time
from pathlib import Path
from mathutils import Vector

out=Path(sys.argv[sys.argv.index("--")+1]); out.mkdir(parents=True,exist_ok=True)
start=time.monotonic()
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
parts=[]
def material(name,color,rough,has_uv=False):
    m=bpy.data.materials.new(name); m.use_nodes=True
    m.diffuse_color=(*color,1)
    n=m.node_tree.nodes; l=m.node_tree.links
    bs=n.get("Principled BSDF"); bs.inputs["Base Color"].default_value=(*color,1)
    bs.inputs["Metallic"].default_value=.88; bs.inputs["Roughness"].default_value=rough
    # B03: directional brushing follows the page parameterization; slow roughness
    # variation prevents a uniformly polished, plastic-looking reflection.
    coords=n.new("ShaderNodeTexCoord")
    source=coords.outputs["UV" if has_uv else "Generated"]
    def noise(scale,detail):
        stretch=n.new("ShaderNodeVectorMath");stretch.operation="MULTIPLY"
        stretch.inputs[1].default_value=scale
        tex=n.new("ShaderNodeTexNoise");tex.inputs["Scale"].default_value=1
        tex.inputs["Detail"].default_value=detail
        l.new(source,stretch.inputs[0]);l.new(stretch.outputs[0],tex.inputs["Vector"])
        return tex.outputs["Fac"]
    fine=noise((26,230,180),2)
    slow=noise((9,13,9),2)
    grain=n.new("ShaderNodeMapRange")
    grain.inputs["From Min"].default_value=0;grain.inputs["From Max"].default_value=1
    grain.inputs["To Min"].default_value=rough-.065
    grain.inputs["To Max"].default_value=rough+.065
    l.new(slow,grain.inputs["Value"]);l.new(grain.outputs["Result"],bs.inputs["Roughness"])
    bump=n.new("ShaderNodeBump");bump.inputs["Strength"].default_value=.19
    bump.inputs["Distance"].default_value=.0012
    l.new(fine,bump.inputs["Height"]);l.new(bump.outputs["Normal"],bs.inputs["Normal"])
    if has_uv:
        tangent=n.new("ShaderNodeTangent");tangent.direction_type="UV_MAP";tangent.uv_map="BrushUV"
        # Blender v4.2.23 source declares "Anisotropic", not "Anisotropic IOR Level".
        # Fail explicitly on any future interface drift; never silently disable the effect.
        anisotropic=bs.inputs.get("Anisotropic")
        if anisotropic is None:
            raise RuntimeError("Unsupported Principled BSDF interface: "+str([i.name for i in bs.inputs]))
        anisotropic.default_value=.32
        l.new(tangent.outputs["Tangent"],bs.inputs["Tangent"])
    return m

# Exercise the actual pinned Blender node API before allocating meshes or rendering.
# No fallback that silently drops anisotropy, UV tangents or roughness variation.
probe=material("B03_API_preflight",(.45,.20,.065),.39,True)
probe_bs=probe.node_tree.nodes.get("Principled BSDF")
assert abs(probe_bs.inputs["Anisotropic"].default_value-.32)<1e-6
assert all(probe_bs.inputs[key].is_linked for key in ("Tangent","Roughness","Normal"))
print("PASS: B03 material preflight — Blender",bpy.app.version_string,
      "Anisotropic=0.32; tangent, roughness and normal linked",flush=True)
bpy.data.materials.remove(probe)

def mesh(name,v,f,color,rough,uv=None):
    data=bpy.data.meshes.new(name);data.from_pydata(v.tolist(),[],f.tolist());data.update()
    bm=bmesh.new();bm.from_mesh(data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    assert all(e.is_manifold for e in bm.edges) and bm.calc_volume(signed=True)>0
    bm.to_mesh(data);bm.free();data.update()
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o)
    if uv is not None:
        assert len(uv)==len(data.vertices)
        uv_layer=data.uv_layers.new(name="BrushUV")
        for loop in data.loops:uv_layer.data[loop.index].uv=tuple(uv[loop.vertex_index])
    o.data.materials.append(material(name,color,rough,uv is not None))
    for p in data.polygons:p.use_smooth=True
    parts.append(o)
def sheet(side,layer,cover=False):
    nu,nv=49,37
    u,v=np.meshgrid(np.linspace(0,1,nu),np.linspace(-1,1,nv),indexing="ij")
    length=1.19 if cover else 1.12-.019*layer
    width=.72 if cover else .665-.010*layer
    x=side*(.035-.021*np.exp(-(u/.075)**2)+length*u*(1-.065*v*v)+.025*u*u*v)
    y=width*v*(1-.035*u*u)+.035*u*u*(side*.3+v)
    if cover:
        z=-.15+.16*np.sin(np.pi*u*.88)+.10*u*u+.025*v*v
        thick=.065
    else:
        z=-.064+.067*layer+(.16+.016*layer)*np.sin(np.pi*u*.94)+(.11+.045*layer)*u**3+(.035+.013*layer)*u**2*v*v+.033*u*v*side+.018*u**3*np.sin(np.pi*v)*side
        z+=.026*layer*u**2
        # Soften the page root at the binding; keep the outer profile unchanged.
        z-=.085*u*np.exp(-(u/.085)**2)
        edge_distance=np.minimum(np.minimum(u,1-u),1-np.abs(v))
        z+=.008*np.exp(-((edge_distance-.048)/.019)**2)*np.sin(np.pi*u)**.35
        thick=.030
    top=np.stack([x,y,z],axis=-1);bot=top.copy();bot[:,:,2]-=thick
    pts=np.concatenate([top.reshape(-1,3),bot.reshape(-1,3)])
    f=[]; n=nu*nv
    for i in range(nu-1):
        for j in range(nv-1):
            a=i*nv+j;b=a+nv;c=b+1;d=a+1
            f.extend([(a,b,c),(a,c,d),(n+a,n+c,n+b),(n+a,n+d,n+c)])
    edge=[i*nv for i in range(nu)]+[(nu-1)*nv+j for j in range(1,nv)]+[i*nv+nv-1 for i in range(nu-2,-1,-1)]+[j for j in range(nv-2,0,-1)]
    for a,b in zip(edge,edge[1:]+edge[:1]):f.extend([(a,a+n,b+n),(a,b+n,b)])
    f=np.array(f)
    if side<0:f=f[:,::-1]
    color=(.26,.103,.037) if cover else (.41+.025*layer,.175+.022*layer,.052+.012*layer)
    uv_top=np.stack([u,(v+1)/2],axis=-1).reshape(-1,2)
    uv=np.concatenate([uv_top,uv_top])
    mesh(f"Storie_{side}_{'cover' if cover else layer}",pts,f,color,.45 if cover else .39,uv)
for s in [-1,1]:
    sheet(s,0,True)
    for j in range(6):sheet(s,j)
n,m=64,32;ang=np.linspace(0,2*np.pi,n,endpoint=False);yy=np.linspace(-.695,.695,m)
v=[]
for y in yy:
    taper=.87+.13*np.cos(np.pi*y/.695/2)
    # Rounded binding section, recessed behind the page ends rather than a protruding roller.
    for a in ang:
        c,s=math.cos(a),math.sin(a)
        v.append([.098*math.copysign(abs(c)**.65,c)*taper,y,.005+.25*math.copysign(abs(s)**.80,s)*taper])
v.extend([[0,yy[0],.005],[0,yy[-1],.005]])
f=[]
for j in range(m-1):
    for i in range(n):
        a=j*n+i;b=j*n+(i+1)%n;c=b+n;d=a+n;f.extend([(a,b,c),(a,c,d)])
for i in range(n):f.extend([(m*n,(i+1)%n,i),(m*n+1,(m-1)*n+i,(m-1)*n+(i+1)%n)])
mesh("Storie_spine",np.array(v),np.array(f),(.20,.075,.026),.46)
assert len(parts)==15 and sum(len(o.data.polygons) for o in parts)==105568
# One bounded CPU studio render set, no environment file or ground plane.
world=bpy.data.worlds.new("Studio");scene.world=world;world.use_nodes=True
world.node_tree.nodes.get("Background").inputs[0].default_value=(.22,.22,.22,1)
world.node_tree.nodes.get("Background").inputs[1].default_value=.43
target=Vector((0,0,.22))
def aim(o,p):o.rotation_euler=(p-o.location).to_track_quat("-Z","Y").to_euler()
def area(name,loc,power,size,strip=None):
    d=bpy.data.lights.new(name,"AREA");d.energy=power
    d.shape="RECTANGLE" if strip else "DISK";d.size=size
    if strip:d.size_y=strip
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;aim(o,target)
# Broad key plus two elongated reflections reveal curvature without a white wash.
area("Softbox",(-3,-4,5),900,3.8,2.2)
area("Fill",(4,-1,3),550,3)
area("Rim",(-.5,4,5),1050,3.5,1.1)
area("Top",(0,0,6),320,3.2,1.3)
d=bpy.data.cameras.new("Camera");d.type="ORTHO";d.ortho_scale=3.1
cam=bpy.data.objects.new("Camera",d);scene.collection.objects.link(cam);scene.camera=cam
cam.location=(2.9,-5.7,4.3);aim(cam,target)
scene.render.engine="CYCLES";scene.cycles.device="CPU";scene.cycles.samples=48
scene.cycles.use_denoising=True
scene.render.resolution_x=1024;scene.render.resolution_y=1024;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.file_format="PNG";scene.render.image_settings.color_mode="RGBA"
scene.view_settings.view_transform="AgX"
scene.view_settings.exposure=-.30
# Preserve master and separate mesh-only interchange file.
bpy.ops.wm.save_as_mainfile(filepath=str(out/"storie-preview.blend"))
bpy.ops.object.select_all(action="DESELECT")
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0]
bpy.ops.export_scene.gltf(filepath=str(out/"storie-preview.glb"),export_format="GLB",use_selection=True,export_cameras=False,export_lights=False)
for name,loc in [("obliqua",(2.9,-5.7,4.3)),("frontale",(0,-6,2.4))]:
    cam.location=loc;aim(cam,target)
    scene.render.filepath=str(out/f"storie-{name}.png");bpy.ops.render.render(write_still=True)
files={p.name:{"sha256":hashlib.sha256(p.read_bytes()).hexdigest(),"bytes":p.stat().st_size} for p in out.iterdir() if p.suffix in (".blend",".glb",".png")}
assert len(files)==4 and all(x["bytes"]>0 for x in files.values())
(out/"evidence.json").write_text(json.dumps({"status":"PREVIEW_NOT_APPROVED","revision":"B03","blender":bpy.app.version_string,"components":len(parts),"triangles":sum(len(o.data.polygons) for o in parts),"cpuOnly":True,"seconds":round(time.monotonic()-start,2),"files":files,"referenceLocked":False,"humanApproved":False,"imageInference":False,"publicationAuthorized":False,"runtimeQualified":False},indent=2))
