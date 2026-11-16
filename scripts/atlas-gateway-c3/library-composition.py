"""C3.3A: isolated architectural composition, linked qualified bay modules."""
import bpy,sys,math,random,json,hashlib
from pathlib import Path
from mathutils import Vector
from math import sin,cos,pi
out=Path(sys.argv[sys.argv.index("--")+1]).resolve();out.mkdir(parents=True,exist_ok=True)
src=out.parent/"atlas-c32"/"campata.blend"
ao=out.parent/"atlas-c32b"/"campata-ao.glb"
source_manifest=json.loads((ao.parent/"ao-manifest.json").read_text())
assert hashlib.sha256(ao.read_bytes()).hexdigest()==source_manifest["files"][ao.name]["sha256"]
bpy.ops.wm.open_mainfile(filepath=str(src))
scene=bpy.context.scene
original=[o for o in scene.objects if o.type=="MESH" and o.name.startswith("Bay ")]
assert len(original)==11,len(original)
for o in list(scene.objects):
    if o not in original:bpy.data.objects.remove(o,do_unlink=True)
for o in original:o.hide_render=True;o.hide_set(True)
stone=bpy.data.materials["Warm limestone"];wood=bpy.data.materials["Walnut"];brass=bpy.data.materials["Brushed brass"]
def material(name,color,rough=.5,metal=0,emission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value=(*color,1);p.inputs["Roughness"].default_value=rough;p.inputs["Metallic"].default_value=metal
    if emission:p.inputs["Emission Color"].default_value=(*color,1);p.inputs["Emission Strength"].default_value=emission
    return m
navy=material("Atlas blue stone",(.017,.038,.060),.26,.20)
floor=stone.copy();floor.name="Polished warm stone";p=floor.node_tree.nodes.get("Principled BSDF")
for link in list(p.inputs["Roughness"].links):floor.node_tree.links.remove(link)
p.inputs["Roughness"].default_value=.27
warm=material("Warm luminous brass",(.95,.49,.16),.32,0,2.4)
foliage=material("Olive green",(.09,.16,.045),.8)
hillm=[material("Landscape "+str(i),c,.93) for i,c in enumerate([(.28,.35,.18),(.20,.30,.23),(.32,.40,.42)])]
shell=[];details=[];scenery=[];placements=[];R=10.6;N=18
def mesh(name,vertices,faces,mat,target,uv_scale=1.5):
    data=bpy.data.meshes.new(name);data.from_pydata(vertices,[],faces);data.update()
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);data.materials.append(mat)
    if mat in (stone,wood,floor):
        uv=data.uv_layers.new(name="UVMap")
        for face in data.polygons:
            axis=max(range(3),key=lambda i:abs(face.normal[i]));axes=((1,2),(0,2),(0,1))[axis]
            for li in face.loop_indices:
                co=data.vertices[data.loops[li].vertex_index].co;uv.data[li].uv=(co[axes[0]]/uv_scale,co[axes[1]]/uv_scale)
    target.append(o);return o
def box(name,loc,dim,mat,target=shell,angle=0):
    x,y,z=loc;w,d,h=[v/2 for v in dim]
    v=[(x+u*cos(angle)-v*sin(angle),y+u*sin(angle)+v*cos(angle),z+k) for k in (-h,h) for u,v in ((-w,-d),(w,-d),(w,d),(-w,d))]
    return mesh(name,v,[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],mat,target)
def ring(name,r0,r1,z0,z1,mat,start=0,end=2*pi,steps=96,target=shell):
    # Ring segment, no cap across the central opening.
    v=[]
    for j in range(steps+1):
        t=start+(end-start)*j/steps
        v.extend([(r*sin(t),r*cos(t),z) for r,z in ((r0,z0),(r1,z0),(r1,z1),(r0,z1))])
    faces=[]
    for j in range(steps):
        for k in range(4):faces.append((4*j+k,4*j+(k+1)%4,4*(j+1)+(k+1)%4,4*(j+1)+k))
    faces.extend([(0,3,2,1),tuple(4*steps+k for k in range(4))])
    o=mesh(name,v,faces,mat,target)
    return o
def cylinder(name,r,z,h,mat,target=shell,x=0,y=0,steps=96):
    v=[(x+r*cos(2*pi*j/steps),y+r*sin(2*pi*j/steps),z+k*h/2) for k in (-1,1) for j in range(steps)]
    f=[tuple(reversed(range(steps))),tuple(range(steps,2*steps))]+[(j,(j+1)%steps,(j+1)%steps+steps,j+steps) for j in range(steps)]
    return mesh(name,v,f,mat,target)
def text(name,body,loc,size,mat,rot):
    c=bpy.data.curves.new(name,"FONT");c.body=body;c.align_x="CENTER";c.align_y="CENTER";c.size=size;c.extrude=.006;c.bevel_depth=.002
    o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=rot;c.materials.append(mat)
    bpy.ops.object.select_all(action="DESELECT");o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target="MESH");shell.append(bpy.context.object)
def area(name,loc,target,power,color,size):
    d=bpy.data.lights.new(name,"AREA");d.energy=power;d.color=color;d.shape="DISK";d.size=size
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat("-Z","Y").to_euler()
# Original 11 meshes, shared datablocks, copied local placement; 15 positions x 3 levels.
for i in range(N):
    if i in (0,1,N-1):continue
    t=2*pi*i/N;angle=-t
    for level in range(3):
        z=level*3.63
        pos=Vector((R*sin(t),R*cos(t),z))
        for srcobj in original:
            obj=srcobj.copy();obj.data=srcobj.data;scene.collection.objects.link(obj)
            obj.hide_render=False;obj.hide_set(False);obj.name=f"Library bay {i:02d}-{level}-{srcobj.name}"
            loc=srcobj.location.copy();obj.location=pos+Vector((loc.x*cos(angle)-loc.y*sin(angle),loc.x*sin(angle)+loc.y*cos(angle),loc.z))
            obj.rotation_euler.z=srcobj.rotation_euler.z+angle
        placements.append({"sector":i,"level":level,"positionBlender":list(pos),"rotationZ":angle,"detailVariant":(i+level)%2})
        def local(x,y,zz):return (pos.x+x*cos(angle)-y*sin(angle),pos.y+x*sin(angle)+y*cos(angle),z+zz)
        # Decorative foil bands on existing books, exact original seed/spacing. Alternate band patterns.
        rng=random.Random(118)
        for row in range(4):
            shelf=.26+row*.74;x=-1.34;book=0
            while x<1.24:
                w=rng.uniform(.075,.17);h=rng.uniform(.38,.58);depth=rng.uniform(.18,.28)
                if x+w>1.35:break
                rng.choice(range(6))
                if (book+i+level)%3!=0:
                    for frac in ((.20,.78) if (i+level)%2==0 else (.16,.22,.82)):
                        box("Spine tooling",local(x+w/2,-.103,shelf+.05+h*frac),(w*.68,.007,.009),brass,details,angle)
                x+=w+rng.uniform(.009,.022);book+=1
            box("Concealed strip",local(0,-.25,shelf+.69),(2.70,.025,.018),warm,details,angle)
        if i in (2,3,4,5,6,7,11,12,13,14,15,16):
            area("Warm shelf wash",local(0,-.58,2.45),local(0,.05,1.25),30,(1,.67,.35),1.25)
    # Radial piers and pilaster bases on the junctions.
    t2=t+pi/N
    cylinder("Tall stone pier",.23,5.42,10.84,stone,x=10.05*sin(t2),y=10.05*cos(t2),steps=24)
    for z in (.16,3.60,7.23,10.68):cylinder("Pier moulding",.32,z,.18,stone,x=10.05*sin(t2),y=10.05*cos(t2),steps=24)
# Warm limestone balconies, open central sky; protect books with overhanging slabs.
start=1.5*2*pi/N;end=2*pi-start
for z in (3.60,7.23):
    ring("Balcony slab",8.95,11.0,z-.12,z+.12,stone,start,end,90)
    ring("Balcony fascia",8.91,8.96,z-.18,z+.09,brass,start,end,90)
    ring("Rail",8.94,9.00,z+.87,z+.92,brass,start,end,90)
    for j in range(61):
        t=start+(end-start)*j/60
        cylinder("Baluster",.025,z+.48,.82,brass,x=8.97*sin(t),y=8.97*cos(t),steps=8)
ring("Protective crown",9.25,11.6,10.76,11.38,stone)
ring("Crown lower gold",9.23,9.29,10.76,10.80,brass)
ring("Crown upper coping",9.12,11.70,11.38,11.52,stone)
# Rear arch: open central void, no artificial glass or panel.
arch_y=10.0;spring=4.0;radius=4.35;thickness=.62
for side in (-1,1):
    box("Rear arch pier",(side*(radius+thickness/2),arch_y,spring/2),(thickness,1.2,spring),stone)
    box("Rear side pier",(side*6.12,arch_y,4.65),(.72,1.2,9.30),stone)
for j in range(20):
    a=pi*j/20;b=pi*(j+1)/20
    v=[(r*cos(t),arch_y+dy,spring+r*sin(t)) for dy in (-.60,.60) for r,t in ((radius,a),(radius+thickness,a),(radius+thickness,b),(radius,b))]
    mesh("Arch voussoir",v,[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],stone,shell)
box("Rear lintel",(0,arch_y,9.48),(13.0,1.05,.65),stone)
text("ARENA left","ARENA",(-5.40,arch_y-.55,9.48),.48,brass,(pi/2,0,0))
text("ARENA right","ARENA",(5.40,arch_y-.55,9.48),.48,brass,(pi/2,0,0))
cylinder("Atrium floor",11.6,-.12,.24,floor,steps=128)
cylinder("Low Atlas medallion",3.35,.035,.07,navy,steps=96)
ring("Medallion border",3.32,3.39,.05,.077,brass)
ring("Floor inlay",4.18,4.23,.002,.012,brass)
text("ATLAS medallion","ATLAS",(0,-.28,.079),.83,brass,(0,0,0))
# Landscape beyond arch: deliberately procedural, not a photographic panorama.
rng=random.Random(23)
for j,mat in enumerate(hillm):
    vertices=[]
    for y in (15+5*j,20+5*j):
        for k in range(45):
            x=-26+k*52/44;z=.4+j*.95+1.2*(sin(x*.16+j)+1)+.35*sin(x*.53+j)
            vertices.append((x,y,z if y==15+5*j else z-.4))
    mesh("Distant hills",vertices,[(k,k+1,k+46,k+45) for k in range(44)],mat,scenery)
box("Exterior ground",(0,23,-.22),(54,27,.28),hillm[0],scenery)
# Join only new architectural geometry and ornament by material; preserve shared bay meshes.
def merge_group(objects,prefix):
    groups={}
    for obj in objects:groups.setdefault(obj.data.materials[0].name,[]).append(obj)
    result=[]
    for name,group in groups.items():
        bpy.ops.object.select_all(action="DESELECT")
        for obj in group:obj.select_set(True)
        bpy.context.view_layer.objects.active=group[0]
        if len(group)>1:bpy.ops.object.join()
        obj=bpy.context.object;obj.name=prefix+" "+name;result.append(obj)
    return result
shell=merge_group(shell,"Shell");details=merge_group(details,"Detail");scenery=merge_group(scenery,"Landscape")
for obj in original:bpy.data.objects.remove(obj,do_unlink=True)
# Export architecture separately; repeating bay data is not included in shell payload.
bpy.ops.object.select_all(action="DESELECT")
for obj in shell+details+scenery:obj.select_set(True)
bpy.context.view_layer.objects.active=shell[0]
bpy.ops.export_scene.gltf(filepath=str(out/"library-shell.glb"),export_format="GLB",use_selection=True,export_texcoords=True,export_draco_mesh_compression_enable=False)
world=bpy.data.worlds.new("Open daylight");world.use_nodes=True;scene.world=world
tree=world.node_tree;sky=tree.nodes.new("ShaderNodeTexSky");sky.sky_type="NISHITA";sky.sun_elevation=math.radians(42);sky.sun_rotation=math.radians(110);sky.sun_disc=False
tree.links.new(sky.outputs["Color"],tree.nodes["Background"].inputs["Color"]);tree.nodes["Background"].inputs["Strength"].default_value=.28
area("Diffuse skylight",(0,-1,10.5),(0,0,0),1800,(1,.92,.79),8.0)
area("Warm frontal fill",(0,-7,5),(0,5,3),650,(1,.83,.63),5)
scene.render.engine="CYCLES";scene.cycles.device="CPU";scene.cycles.samples=20;scene.cycles.use_denoising=True;scene.cycles.denoiser="OPENIMAGEDENOISE"
scene.render.image_settings.file_format="PNG"
views=[("atrium",1200,750,(0,-8.6,2.35),(0,4.0,4.1),18),("vertical",640,960,(0,-8.8,2.5),(0,3.5,4.2),18),("detail",900,700,(0,-5.0,2.3),(8.6,4.6,3.3),32)]
for i,(name,w,h,pos,target,lens) in enumerate(views):
    data=bpy.data.cameras.new(name);cam=bpy.data.objects.new(name,data);scene.collection.objects.link(cam);cam.location=pos;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat("-Z","Y").to_euler();data.lens=lens;data.clip_end=150
    scene.camera=cam;scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.resolution_percentage=100;scene.render.filepath=str(out/(name+".png"))
    if i==0:bpy.ops.wm.save_as_mainfile(filepath=str(out/"library.blend"))
    bpy.ops.render.render(write_still=True)
receipt={"phase":"C3.3A","sourceBlendSha256":hashlib.sha256(src.read_bytes()).hexdigest(),"qualifiedBayGlbSha256":source_manifest["files"][ao.name]["sha256"],"levels":3,"sectors":N,"radius":R,"openSectors":[0,1,17],"bayCount":len(placements),"sharedBayMeshCount":11,"shellObjects":len(shell)+len(details)+len(scenery),"occlusionInOfflineRender":"Cycles physical shading; browser module AO unchanged","fullLightBake":False,"studentAuthorized":False,"portalsIntegrated":False,"placements":placements,"files":{}}
for name in ("library.blend","library-shell.glb","atrium.png","vertical.png","detail.png"):
    b=(out/name).read_bytes();receipt["files"][name]={"bytes":len(b),"sha256":hashlib.sha256(b).hexdigest()}
(out/"library-manifest.json").write_text(json.dumps(receipt,indent=2)+"\n")
print(json.dumps({k:v for k,v in receipt.items() if k!="placements"},indent=2))
