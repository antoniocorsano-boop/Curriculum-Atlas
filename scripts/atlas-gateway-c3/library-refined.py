"""C3.3A2: refined offline architecture derived from preserved C3.3A."""
import bpy,sys,math,random,json,hashlib
from pathlib import Path
from mathutils import Vector
from math import sin,cos,pi
out=Path(sys.argv[sys.argv.index("--")+1]).resolve();out.mkdir(parents=True,exist_ok=True)
src=out.parent/"atlas-c32"/"campata.blend"
ao=out.parent/"atlas-c32b"/"campata-ao.glb"
source_manifest=json.loads((ao.parent/"ao-manifest.json").read_text())
assert hashlib.sha256(ao.read_bytes()).hexdigest()==source_manifest["files"][ao.name]["sha256"]
assert hashlib.sha256(src.read_bytes()).hexdigest()==json.loads((src.parent/"manifest.json").read_text())["files"][src.name]["sha256"]
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
# Richer recess and cover colors, retaining packed source textures.
recess=bpy.data.materials["Recessed walnut"]
tree=recess.node_tree;p=tree.nodes.get("Principled BSDF")
link=p.inputs["Base Color"].links[0];socket=link.from_socket;tree.links.remove(link)
tint=tree.nodes.new("ShaderNodeMixRGB");tint.blend_type="MULTIPLY";tint.inputs[0].default_value=1;tint.inputs[2].default_value=(.48,.34,.24,1)
tree.links.new(socket,tint.inputs[1]);tree.links.new(tint.outputs[0],p.inputs["Base Color"])
for i,c in enumerate([(.10,.022,.014),(.020,.062,.042),(.035,.065,.12),(.27,.12,.035),(.40,.32,.20),(.075,.035,.018)]):
    bpy.data.materials["Book "+str(i)].node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value=(*c,1)
navy=material("Atlas blue stone",(.012,.025,.041),.20,.12)
floor=stone.copy();floor.name="Polished warm stone";p=floor.node_tree.nodes.get("Principled BSDF")
for link in list(p.inputs["Roughness"].links):floor.node_tree.links.remove(link)
p.inputs["Roughness"].default_value=.20
warm=material("Warm luminous brass",(.95,.58,.25),.32,0,3.0)
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
# Reproduce the original RNG sequence to match covers, page blocks and spine details.
book_rows=[];rng=random.Random(118)
for row in range(4):
    x=-1.34;books=[]
    while x<1.24:
        w=rng.uniform(.075,.17);h=rng.uniform(.38,.58);depth=rng.uniform(.18,.28)
        if x+w>1.35:break
        rng.choice(range(6));books.append((x,w,h));x+=w+rng.uniform(.009,.022)
    book_rows.append(books)
def factor(variant,row,index):
    return 1.0 if variant==0 else (.76,.88,1.03,1.10,.95)[(index*3+row*2+variant*2)%5]
def change_z(variant,row,index,z):
    anchor=.31+row*.74
    return anchor+(z-anchor)*factor(variant,row,index)
variant_data={}
book_objects=[o for o in original if o.name.startswith("Bay Book ") or o.name=="Bay Paper"]
assert len(book_objects)==7,[o.name for o in original]
for variant in (1,2):
    for o in book_objects:
        data=o.data.copy();data.name=f"Book variant {variant} {o.name}"
        matrix=o.matrix_world.copy();inverse=matrix.inverted()
        for v in data.vertices:
            p=matrix@v.co;row=int(math.floor((p.z-.31+.0001)/.74))
            assert 0<=row<4,(o.name,p.z)
            books=book_rows[row]
            matches=[k for k,(x,w,h) in enumerate(books) if x-.003<=p.x<=x+w+.003]
            assert len(matches)==1,(o.name,p.x,p.z,matches)
            index=matches[0]
            p.z=change_z(variant,row,index,p.z);v.co=inverse@p
        data.update();variant_data[(variant,o.name)]=data
# 45 placements: fixed structural data plus three shared book variants.
for i in range(N):
    if i in (0,1,N-1):continue
    t=2*pi*i/N;angle=-t
    for level in range(3):
        z=level*3.63
        pos=Vector((R*sin(t),R*cos(t),z))
        variant=(i*2+level)%3
        for srcobj in original:
            obj=srcobj.copy();obj.data=variant_data.get((variant,srcobj.name),srcobj.data);scene.collection.objects.link(obj)
            if variant and srcobj.name.startswith("Bay Book "):
                idx=int(srcobj.name.rsplit(" ",1)[1]);obj.material_slots[0].link="OBJECT"
                obj.material_slots[0].material=bpy.data.materials["Book "+str((idx+2*variant)%6)]
            obj.hide_render=False;obj.hide_set(False);obj.name=f"Library bay {i:02d}-{level}-{srcobj.name}"
            loc=srcobj.location.copy();obj.location=pos+Vector((loc.x*cos(angle)-loc.y*sin(angle),loc.x*sin(angle)+loc.y*cos(angle),loc.z))
            obj.rotation_euler.z=srcobj.rotation_euler.z+angle
        placements.append({"sector":i,"level":level,"positionBlender":list(pos),"rotationZ":angle,"detailVariant":variant})
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
                    for frac in ((.20,.78) if variant==0 else (.16,.22,.82)):
                        zz=change_z(variant,row,book,shelf+.05+h*frac)
                        box("Spine tooling",local(x+w/2,-.103,zz),(w*.68,.007,.009),brass,details,angle)
                    if (book+variant)%4==0:
                        zz=change_z(variant,row,book,shelf+.05+h*.60)
                        box("Spine label",local(x+w/2,-.104,zz),(w*.54,.008,.026),brass,details,angle)
                x+=w+rng.uniform(.009,.022);book+=1
            box("Concealed strip",local(0,-.25,shelf+.69),(2.70,.025,.018),warm,details,angle)
        if i in (2,3,4,5,6,7,11,12,13,14,15,16):
            area("Warm shelf wash",local(0,-.60,2.50),local(0,.02,1.25),65,(1,.76,.49),1.45)
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
for t in (-math.radians(36),math.radians(36)):
    text("ARENA crown","ARENA",(9.20*sin(t),9.20*cos(t),11.04),.49,brass,(pi/2,0,-t))
for side in (-1,1):
    box("Arch lateral masonry",(side*5.75,arch_y,8.60),(1.25,1.05,1.1),stone)
cylinder("Atrium floor",11.6,-.12,.24,floor,steps=128)
cylinder("Low Atlas medallion",3.35,.035,.07,navy,steps=96)
ring("Medallion border",3.32,3.39,.05,.077,brass)
ring("Floor inlay",4.18,4.23,.002,.012,brass)
text("ATLAS medallion","ATLAS",(0,-.28,.079),1.15,brass,(0,0,0))
# Continuous terrace and near ground, distant photographic landscape in world.
box("Exterior terrace",(0,14.7,-.12),(13.0,8.0,.24),floor,scenery)
box("Exterior ground",(0,20,-.28),(46,22,.20),hillm[0],scenery)
bark=material("Tree bark",(.12,.07,.035),.88)
def crown_tree(x,y,h):
    cylinder("Cypress trunk",.09,h*.27,h*.54,bark,scenery,x,y,12)
    vertices=[];levels=[(.23,.25),(.38,.62),(.58,.52),(.78,.30),(.95,.08),(1,.005)]
    for z,r in levels:
        for j in range(16):
            t=2*pi*j/16;vertices.append((x+r*cos(t),y+r*sin(t),z*h))
    faces=[(a*16+j,a*16+(j+1)%16,(a+1)*16+(j+1)%16,(a+1)*16+j) for a in range(len(levels)-1) for j in range(16)]
    mesh("Cypress crown",vertices,faces,foliage,scenery)
for x,y,h in [(-5.3,13.8,4.4),(5.3,13.8,4.4),(-7.2,18.3,5.1),(7.2,18.3,5.1)]:
    crown_tree(x,y,h)
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
instances=[o for o in scene.objects if o.type=="MESH" and o.name.startswith("Library bay ")]
assert len(placements)==45 and len(instances)==495 and len({o.data.as_pointer() for o in instances})==25
assert all(not o.hide_render for o in instances)
# Export architecture separately; repeating bay data is not included in shell payload.
bpy.ops.object.select_all(action="DESELECT")
for obj in shell+details+scenery:obj.select_set(True)
bpy.context.view_layer.objects.active=shell[0]
bpy.ops.export_scene.gltf(filepath=str(out/"library-shell.glb"),export_format="GLB",use_selection=True,export_texcoords=True,export_draco_mesh_compression_enable=False)
world=bpy.data.worlds.new("Locked photographic daylight");world.use_nodes=True;scene.world=world
tree=world.node_tree;nodes=tree.nodes;links=tree.links
hdr=src.parent/"assets"/"kloppenheim_03.hdr"
assert hashlib.sha256(hdr.read_bytes()).hexdigest()=="cf7220b7d6705577e772c28a75cfd67ef508b342904e24d20f227a38fe853130"
env=nodes.new("ShaderNodeTexEnvironment");env.image=bpy.data.images.load(str(hdr),check_existing=True);env.image.pack()
coords=nodes.new("ShaderNodeTexCoord");mapping=nodes.new("ShaderNodeMapping");mapping.inputs["Rotation"].default_value[2]=math.radians(110)
links.new(coords.outputs["Normal"],mapping.inputs["Vector"]);links.new(mapping.outputs["Vector"],env.inputs["Vector"])
light=nodes.get("Background");links.new(env.outputs["Color"],light.inputs["Color"]);light.inputs["Strength"].default_value=.38
visible=nodes.new("ShaderNodeBackground");links.new(env.outputs["Color"],visible.inputs["Color"]);visible.inputs["Strength"].default_value=.80
path=nodes.new("ShaderNodeLightPath");mix=nodes.new("ShaderNodeMixShader");links.new(path.outputs["Is Camera Ray"],mix.inputs[0]);links.new(light.outputs[0],mix.inputs[1]);links.new(visible.outputs[0],mix.inputs[2]);links.new(mix.outputs[0],nodes.get("World Output").inputs["Surface"])
area("Diffuse skylight",(0,-1,10.5),(0,0,0),2100,(1,.94,.85),8.0)
area("Warm frontal fill",(0,-7,5),(0,5,3),420,(1,.86,.70),5)
scene.render.engine="CYCLES";scene.cycles.device="CPU";scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.cycles.denoiser="OPENIMAGEDENOISE"
scene.render.image_settings.file_format="PNG"
views=[("atrium",1200,750,(0,-8.6,2.35),(0,4.0,4.1),18),("vertical",640,960,(0,-8.8,2.5),(0,3.5,4.2),18),("detail",900,700,(0,-5.0,2.3),(8.6,4.6,3.3),32)]
for i,(name,w,h,pos,target,lens) in enumerate(views):
    data=bpy.data.cameras.new(name);cam=bpy.data.objects.new(name,data);scene.collection.objects.link(cam);cam.location=pos;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat("-Z","Y").to_euler();data.lens=lens;data.clip_end=150
    scene.camera=cam;scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.resolution_percentage=100;scene.render.filepath=str(out/(name+".png"))
    if i==0:bpy.ops.wm.save_as_mainfile(filepath=str(out/"library.blend"))
    bpy.ops.render.render(write_still=True)
receipt={"phase":"C3.3A2","sourceBlendSha256":hashlib.sha256(src.read_bytes()).hexdigest(),"qualifiedBayGlbSha256":source_manifest["files"][ao.name]["sha256"],"levels":3,"sectors":N,"radius":R,"openSectors":[0,1,17],"bayCount":len(placements),"sharedBayMeshCount":25,"bookVariants":3,"variantGLBsProduced":False,"skySource":"Poly Haven kloppenheim_03 locked HDRI","skySha256":"cf7220b7d6705577e772c28a75cfd67ef508b342904e24d20f227a38fe853130","shellObjects":len(shell)+len(details)+len(scenery),"occlusionInOfflineRender":"Cycles physical shading; variant AO not yet baked","fullLightBake":False,"studentAuthorized":False,"portalsIntegrated":False,"placements":placements,"files":{}}
for name in ("library.blend","library-shell.glb","atrium.png","vertical.png","detail.png"):
    b=(out/name).read_bytes();receipt["files"][name]={"bytes":len(b),"sha256":hashlib.sha256(b).hexdigest()}
(out/"library-manifest.json").write_text(json.dumps(receipt,indent=2)+"\n")
print(json.dumps({k:v for k,v in receipt.items() if k!="placements"},indent=2))
