#!/usr/bin/env python3
"""ATLAS P2/COMPOSITIONS-01.
Three real, reversible Blender/Cycles architectural compositions derived from
the SHA-authenticated P1F/ROOF-02 editable scene. No source overwrite, deploy,
student-facing export or automatic artistic approval.
"""
import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view

ARGS = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def option(key):
    if key not in ARGS or ARGS.index(key)+1 == len(ARGS):
        raise RuntimeError("Missing argument "+key)
    return ARGS[ARGS.index(key)+1]

source = Path(bpy.data.filepath).resolve()
out = Path(option("--out")).resolve()
out.mkdir(parents=True,exist_ok=True)
parent = json.loads(Path(option("--parent-receipt")).read_text(encoding="utf-8"))
CANON = "a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
def sha(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda:f.read(1<<20),b""):
            h.update(chunk)
    return h.hexdigest()
source_sha=sha(source)
if (source.name!="atlas-p1f-pavilion-roof02-editable.blend"
    or parent["schema"]!="atlas.artdir02.p1f-roof-pavilion-02/v1"
    or parent["canonical_art_sha256"]!=CANON
    or parent["files"]["blend"]["sha256"]!=source_sha
    or not parent["four_glass_portals_geometry_preserved"]
    or not parent["single_roof_mesh_closed"]["connected"]
    or parent["art_approved"] or parent["web_approved"]
    or not parent["no_merge"] or not parent["no_deploy"]):
    raise RuntimeError("P2 source is not the qualified, unapproved P1F/ROOF-02")
NAMES=("Curricolo","Esplora","Percorsi","Esperienze")
PROFILES={
 "A":{"label":"Monumentale","gallery_rise":0.80,"roof_rise":1.55,
      "depth_scale":1.00,"camera_down":0.35,"pitch_deg":2.0,
      "lens_factor":0.85,"shift_y":0.020,"arc_radius":5.7},
 "B":{"label":"Equilibrata","gallery_rise":0.48,"roof_rise":0.90,
      "depth_scale":1.00,"camera_down":0.22,"pitch_deg":1.0,
      "lens_factor":0.92,"shift_y":0.005,"arc_radius":5.8},
 "C":{"label":"Scenografica","gallery_rise":0.60,"roof_rise":1.15,
      "depth_scale":1.18,"camera_down":0.48,"pitch_deg":3.0,
      "lens_factor":0.83,"shift_y":0.035,"arc_radius":5.9},
}
def require(name,kind=None):
    ob=bpy.data.objects.get(name)
    if ob is None or (kind and ob.type!=kind):
        raise RuntimeError("Missing verified object: "+name)
    return ob
def center(ob):
    return ob.matrix_world @ Vector(ob.data.vertices[0].co)
def xy_distance(a,b):
    return math.hypot(a.x-b.x,a.y-b.y)
def almost(a,b,eps=1e-5):
    return abs(a-b)<eps

def produce(code,p):
    # All alternatives reload EXACTLY the same authenticated candidate.
    bpy.ops.wm.open_mainfile(filepath=str(source))
    scene=bpy.context.scene
    cam=require("CAM_HERO_ARCH04","CAMERA")
    roof=require("ATLAS P1F • padiglione lungo copertura monolitica","MESH")
    sky=require("ATLAS P1F • cielo unico del padiglione","MESH")
    rim=require("ATLAS P1F • unico bordino lucernario","MESH")
    first=require("ARCH04 • first gallery deck","MESH")
    upper=require("ARCH04 • upper gallery deck","MESH")
    roots=[require("Portale • "+n) for n in NAMES]
    panes=[require(n+" • vetro cobalto","MESH") for n in NAMES]
    bases=[require("ATLAS R6D • sole luminous metal base "+n) for n in NAMES]
    if len(roots)!=4 or any(pane.parent!=root for pane,root in zip(panes,roots)):
        raise RuntimeError("Four parented physical portals not found")
    if roof.hide_render or sky.hide_render or rim.hide_render:
        raise RuntimeError("Qualified P1F pavilion is not visible")
    if first.hide_render or upper.hide_render:
        raise RuntimeError("Three-level gallery hierarchy not fully visible")
    c=center(sky)
    cam_xyz=cam.matrix_world.translation.copy()
    forward=Vector((c.x-cam_xyz.x,c.y-cam_xyz.y))
    if forward.length<5.0:
        raise RuntimeError("HERO camera too close for front portal arc")
    forward.normalize()
    side=Vector((-forward.y,forward.x))
    # The portals are on the CAMERA-SIDE semicircle, not behind the rotunda.
    # Tangent vector follows the curve; original glass and labels stay within
    # their established portal root hierarchy. Independent metal bases follow.
    arc_angles=(-44.,-16.,16.,44.)
    moved=[]
    oldcenters={}
    for name,root,pane,base,deg in zip(NAMES,roots,panes,bases,arc_angles):
        old_root=root.matrix_world.copy()
        old_pos=old_root.translation.copy()
        old_bottom=min((pane.matrix_world @ vertex.co).z
                       for vertex in pane.data.vertices)
        oldcenters[name]=[(old_pos.x-c.x)*forward.x+(old_pos.y-c.y)*forward.y,
                          (old_pos.x-c.x)*side.x+(old_pos.y-c.y)*side.y]
        theta=math.radians(deg)
        radius=p["arc_radius"]
        target=Vector((c.x-radius*math.cos(theta)*forward.x+radius*math.sin(theta)*side.x,
                       c.y-radius*math.cos(theta)*forward.y+radius*math.sin(theta)*side.y,
                       old_pos.z))
        tangent=side*math.cos(theta)+forward*math.sin(theta)
        yaw=math.atan2(tangent.y,tangent.x)
        if root.parent is not None:
            raise RuntimeError("Unexpected parented portal root "+name)
        prior_yaw=root.rotation_euler.z
        delta_yaw=yaw-prior_yaw
        root.location=target
        root.rotation_euler.z=yaw
        # First visual inspection revealed oversized foreground panels. Resize
        # the original *physical* roots, not a composited image overlay.
        root.scale=(root.scale.x*.50,root.scale.y*.50,root.scale.z*.63)
        bpy.context.view_layer.update()
        current_bottom=min((pane.matrix_world @ vertex.co).z
                           for vertex in pane.data.vertices)
        dz=old_bottom-current_bottom
        root.location.z+=dz
        target.z+=dz
        # Keep independent original bases proportionate to the reduced glass.
        size=Matrix.Diagonal((.50,.50,1.0,1.0))
        transform=(Matrix.Translation(target)
                   @ Matrix.Rotation(delta_yaw,4,"Z")
                   @ size
                   @ Matrix.Translation(-old_pos))
        # Existing independent base and low-emphasis slit trims, if present.
        associated=[base]
        associated += [o for o in scene.objects if o.name.startswith("PROOF R3 • ")
                       and (o.name.endswith(" "+name)
                            or o.name.endswith(" "+name+" -1")
                            or o.name.endswith(" "+name+" 1"))]
        for extra in associated:
            if extra.parent is None:
                extra.matrix_world=transform @ extra.matrix_world
        moved.append({
            "name":name,"angle_deg":deg,"root_xyz":list(target),
            "tangent_yaw_deg":math.degrees(yaw),"prior_forward_bu":oldcenters[name][0],
            "forward_from_roof_center_bu":-radius*math.cos(theta),
            "visual_portal_scale_xy":0.50,
            "visual_portal_scale_z":0.63,
            "glass_floor_before_and_after_z":[old_bottom,old_bottom],
            "independent_details_moved":[o.name for o in associated],
        })
    bpy.context.view_layer.update()
    if not all((root.matrix_world.translation.xy-Vector((c.x,c.y))).dot(forward)<0
               for root in roots):
        raise RuntimeError("Portal arc not on the camera-facing side")
    if not all(moved[i]["root_xyz"][0] != moved[i+1]["root_xyz"][0] or
               moved[i]["root_xyz"][1] != moved[i+1]["root_xyz"][1]
               for i in range(3)):
        raise RuntimeError("Overlapping portal anchors")
    # Transform the already topologically qualified single roof and its one
    # aperture as one coherent ensemble. A taper leaves the pavilion perimeter
    # stable while broadening the longitudinal opening in option C.
    for ob in (roof,sky,rim):
        ob.data=ob.data.copy()
        inv=ob.matrix_world.inverted()
        world=ob.matrix_world.copy()
        for vertex in ob.data.vertices:
            pt=world@vertex.co
            delta=Vector((pt.x-c.x,pt.y-c.y))
            along=delta.dot(forward)
            across=delta.dot(side)
            r=math.hypot(along,across)
            taper=max(0.,min(1.,(11.5-r)/5.5))
            along*=1.+(p["depth_scale"]-1.)*taper*taper*(3.-2.*taper)
            newworld=Vector((c.x+along*forward.x+across*side.x,
                             c.y+along*forward.y+across*side.y,
                             pt.z+p["roof_rise"]))
            vertex.co=inv@newworld
        ob.data.update()
    upper_names=[]
    for ob in list(scene.objects):
        if ob in (roof,sky,rim) or ob.type not in ("MESH","CURVE"):
            continue
        if ob.name.startswith(("Curricolo","Esplora","Percorsi","Esperienze","Portale •")):
            continue
        s=ob.name.lower()
        if ("upper gallery" in s or "second gallery" in s or
            "upper cornice" in s) and ob not in bases:
            ob.location.z+=p["gallery_rise"]
            upper_names.append(ob.name)
    if upper.name not in upper_names or first.name in upper_names:
        raise RuntimeError("First/upper level change was not selective")
    # No scene-wide floor movement: preserve podium and the original material.
    # The former boolean floor slits require a subsequent floor-specific repair
    # if their former position becomes visible; this is a CLAY COMPOSITION GATE.
    cam.data=cam.data.copy()
    cam.location.z-=p["camera_down"]
    cam.matrix_world=cam.matrix_world @ Matrix.Rotation(
        math.radians(p["pitch_deg"]),4,"X")
    cam.data.lens*=p["lens_factor"]
    cam.data.shift_y+=p["shift_y"]
    scene.camera=cam
    scene.render.resolution_x=960
    scene.render.resolution_y=540
    scene.render.resolution_percentage=100
    scene.render.engine="CYCLES"
    scene.cycles.samples=24
    scene.render.image_settings.file_format="PNG"
    bpy.context.view_layer.cycles.use_denoising=True
    bpy.context.view_layer.update()
    def projected():
        return {name:world_to_camera_view(scene,cam,pane.matrix_world@
                           Vector(tuple(sum((v.co[i] for v in pane.data.vertices),0.)/
                                            len(pane.data.vertices) for i in range(3))))
                for name,pane in zip(NAMES,panes)}
    # Adaptive FOV adjustment for all FOUR centres, without changing anchors.
    fits=False
    for i in range(12):
        v=projected()
        if all((.025 < q.x < .975 and .04 < q.y < .96 and q.z > 0.)
               for q in v.values()):
            fits=True
            break
        cam.data.lens*=.92
        bpy.context.view_layer.update()
    if not fits:
        raise RuntimeError("Could not keep all four portal glass centres in the P2 camera")
    image_path=out/("atlas-p2-"+code+"-"+p["label"].lower()+"-HERO.png")
    scene.render.filepath=str(image_path)
    bpy.ops.render.render(write_still=True)
    if not image_path.is_file() or image_path.stat().st_size<12000:
        raise RuntimeError("Cycles PNG missing for "+code)
    editable=out/("atlas-p2-"+code+"-"+p["label"].lower()+".blend")
    bpy.ops.wm.save_as_mainfile(filepath=str(editable),compress=True)
    if not editable.is_file() or editable.stat().st_size<100000:
        raise RuntimeError("Editable model missing for "+code)
    if sha(source)!=source_sha:
        raise RuntimeError("Original qualified source was overwritten")
    portal_frames={}
    for name,pane in zip(NAMES,panes):
        corners=[world_to_camera_view(scene,cam,pane.matrix_world@Vector(v))
                 for v in pane.bound_box]
        bbox=[min(q.x for q in corners),max(q.x for q in corners),
              min(q.y for q in corners),max(q.y for q in corners)]
        portal_frames[name]={"normalized_bbox":bbox,
                             "width_fraction":bbox[1]-bbox[0],
                             "height_fraction":bbox[3]-bbox[2]}
    if any(v["height_fraction"]>.48 or v["width_fraction"]>.26
           for v in portal_frames.values()):
        raise RuntimeError("A portal still masks too much of the architecture")
    return {
      "code":code,"label":p["label"],"settings":p,
      "roof_existing_mesh_name":roof.name,"roof_faces":len(roof.data.polygons),
      "true_crown_center_xy":[c.x,c.y],
      "portal_arc_camera_side":True,
      "portals":moved,
      "portal_projected_centres":{k:[q.x,q.y,q.z] for k,q in v.items()},
      "portal_projected_bboxes":portal_frames,
      "upper_elements_raised":upper_names,
      "three_levels":{"ground":"Atrio • pavimento lapideo",
          "first_gallery":first.name,"upper_gallery":upper.name},
      "camera":{"location":list(cam.location),"lens_mm":cam.data.lens,
                "shift_y":cam.data.shift_y},
      "files":{"blend":{"name":editable.name,"bytes":editable.stat().st_size,
                        "sha256":sha(editable)},
               "png":{"name":image_path.name,"bytes":image_path.stat().st_size,
                      "sha256":sha(image_path)}},
      "legacy_floor_cuts_verified_at_new_positions":False,
      "art_approved":False,
    }

results={}
for code,profile in PROFILES.items():
    print("P2_START_"+code,flush=True)
    results[code]=produce(code,profile)
    print("P2_RENDERED_"+code,flush=True)
report={
 "schema":"atlas.artdir02.p2-compositions-01/v1",
 "date":"2026-11-22",
 "original_art_reference_sha256":CANON,
 "source_p1f_roof02_sha256":source_sha,
 "source_binary_unchanged":sha(source)==source_sha,
 "source_existing_model":True,
 "profiles":results,
 "three_distinct_approaches":len(set((v["settings"]["roof_rise"],
         v["settings"]["depth_scale"],v["settings"]["gallery_rise"])
            for v in results.values()))==3,
 "no_merge":True,"no_deploy":True,"no_student_data":True,
 "art_approved":False,"web_approved":False,
 "limitations":["Real floor cutouts were not repositioned; finish after choice.",
                "These are Cycles concept clay comparisons, not WebGL FPS tests.",
                "Human visual comparison with ART-DIR-02 is mandatory."],
}
if not report["source_binary_unchanged"] or not report["three_distinct_approaches"]:
    raise RuntimeError("P2 lineage or alternatives verification failure")
receipt=out/"atlas-p2-three-compositions-receipt.json"
receipt.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
html_parts=[]
for k,data in results.items():
    im=data["files"]["png"]["name"]
    html_parts.append("<article><img src='"+im+"' alt='Variante "+k+" - "+
                      data["label"]+"'><h2>"+k+" · "+data["label"]+
                      "</h2><p>Tre livelli; portali su semicerchio verso la camera.</p></article>")
(out/"atlas-p2-confronto.html").write_text(
    "<!doctype html><html lang='it'><meta charset='utf-8'>"
    "<meta name='viewport' content='width=device-width, initial-scale=1'>"
    "<title>ATLAS P2 - confronto tre composizioni</title>"
    "<style>body{margin:0;background:#101723;color:#ece9e2;font-family:system-ui}"
    "header{padding:1.4rem}main{display:grid;grid-template-columns:repeat(auto-fit,"
    "minmax(min(100%,320px),1fr));gap:1rem;padding:1rem}"
    "article{border:1px solid #3c475a;border-radius:16px;overflow:hidden}"
    "img{width:100%;height:auto}h2,p{margin:1rem}p{color:#b6c0d3}</style>"
    "<header><h1>ATLAS P2 / Comparazione compositiva</h1>"
    "<p>Render Blender autentici. Nessuna variante approvata.</p></header>"
    "<main>"+"".join(html_parts)+"</main></html>",
    encoding="utf-8")
print("ATLAS_P2_THREE_REAL_CYCLES_VARIANTS",json.dumps(
 {"source_sha256":source_sha,
  "receipt_sha256":sha(receipt),
  "files":[r["files"]["png"]["name"] for r in results.values()]}),flush=True)
