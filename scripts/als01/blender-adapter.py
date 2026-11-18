"""ALS-01 offline adapter: camera-facing, depth-tested optical points.
Consumes the canonical exported JS static sample. No physical lights, bloom,
architecture modifications or production scene export.
"""
import bpy,math
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

def make_points(scene,sample):
    optics=sample["optics"];limits=sample["limits"]
    assert optics["revision"]=="ALS-01-R3" and sample["paused"] is True
    assert len(sample["points"])==18 and len(sample["anchors"])==4
    result=[]
    for p in sample["points"]:
        assert 0<p["opacity"]<=limits["maxOpacity"]
        assert all(math.isfinite(x) for x in p["position"])
        a=next(a for a in sample["anchors"] if a["id"]==p["anchorId"])
        assert (Vector(p["position"])-Vector(a["center"])).length<=a["radius"]*limits["maxRadiusFraction"]
        name="ALS-01 "+p["anchorId"]+" "+str(p["index"])
        mesh=bpy.data.meshes.new(name)
        mesh.from_pydata([(-1,-1,0),(1,-1,0),(1,1,0),(-1,1,0)],[],[(0,1,2,3)])
        mesh.update();uv=mesh.uv_layers.new(name="Optical UV")
        for i,xy in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=xy
        o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o)
        o.location=p["position"];o.hide_render=True
        for flag in ("visible_diffuse","visible_glossy","visible_transmission","visible_volume_scatter","visible_shadow"):
            setattr(o,flag,False)
        m=bpy.data.materials.new(name);m.use_nodes=True
        n=m.node_tree.nodes;n.clear();l=m.node_tree.links
        def mathnode(op,a,b):
            q=n.new("ShaderNodeMath");q.operation=op
            for i,v in enumerate((a,b)):
                if isinstance(v,(float,int)):q.inputs[i].default_value=v
                else:l.new(v,q.inputs[i])
            return q.outputs[0]
        tex=n.new("ShaderNodeTexCoord")
        d=n.new("ShaderNodeVectorMath");d.operation="DISTANCE"
        l.new(tex.outputs["UV"],d.inputs[0]);d.inputs[1].default_value=(.5,.5,0)
        radius=mathnode("MULTIPLY",d.outputs["Value"],2.)
        def inverse_smooth(lo,hi):
            q=n.new("ShaderNodeMapRange");q.clamp=True;q.interpolation_type="SMOOTHSTEP"
            l.new(radius,q.inputs["Value"]);q.inputs["From Min"].default_value=lo;q.inputs["From Max"].default_value=hi
            q.inputs["To Min"].default_value=1.;q.inputs["To Max"].default_value=0.
            return q.outputs["Result"]
        core=inverse_smooth(optics["coreInner"],optics["coreOuter"])
        halo=mathnode("MULTIPLY",inverse_smooth(optics["haloInner"],optics["haloOuter"]),optics["haloWeight"])
        alpha=mathnode("MULTIPLY",mathnode("MAXIMUM",core,halo),p["opacity"])
        ray=n.new("ShaderNodeLightPath")
        alpha=mathnode("MULTIPLY",alpha,ray.outputs["Is Camera Ray"])
        clear=n.new("ShaderNodeBsdfTransparent")
        emit=n.new("ShaderNodeEmission");emit.inputs["Color"].default_value=(*p["color"],1);emit.inputs["Strength"].default_value=1.6
        mix=n.new("ShaderNodeMixShader");l.new(alpha,mix.inputs[0]);l.new(clear.outputs[0],mix.inputs[1]);l.new(emit.outputs[0],mix.inputs[2])
        output=n.new("ShaderNodeOutputMaterial");l.new(mix.outputs[0],output.inputs["Surface"])
        o.data.materials.append(m);result.append((o,p))
    return result

def position_points(scene,camera,points,optics,protected):
    assert camera.data.type=="PERSP"
    bpy.context.view_layer.update()
    height=scene.render.resolution_y*scene.render.resolution_percentage/100
    width=scene.render.resolution_x*scene.render.resolution_percentage/100
    frame=camera.data.view_frame(scene=scene)
    rotation=camera.matrix_world.to_quaternion()
    inverse=camera.matrix_world.inverted()
    records=[]
    for o,p in points:
        depth=-(inverse@Vector(p["position"])).z
        assert depth>0
        span=(max(v.y for v in frame)-min(v.y for v in frame))*depth/abs(frame[0].z)
        diameter=max(optics["minDiameterPx"],min(optics["maxDiameterPx"],2*p["radius"]*height/span*optics["diameterScale"]))
        radius=diameter*span/(2*height)
        o.rotation_mode="QUATERNION";o.rotation_quaternion=rotation
        o.scale=(radius,radius,radius)
        q=world_to_camera_view(scene,camera,o.location)
        # Actual projected rectangle, allowing for the camera-facing quad.
        projected=[world_to_camera_view(scene,camera,o.location+rotation@Vector((x*radius,y*radius,0))) for x,y in ((-1,-1),(1,-1),(1,1),(-1,1))]
        box=[min(v.x for v in projected),max(v.x for v in projected),min(v.y for v in projected),max(v.y for v in projected)]
        assert 0<=box[0]<box[1]<=1 and 0<=box[2]<box[3]<=1,(p["anchorId"],box)
        for region in [protected["arena"],*protected["portals"]]:
            assert box[1]<region[0] or box[0]>region[1] or box[3]<region[2] or box[2]>region[3],(p["anchorId"],box,region)
        records.append({"id":p["anchorId"],"index":p["index"],"center":[q.x,q.y],"box":box,"diameterPx":diameter})
    bpy.context.view_layer.update()
    return records
