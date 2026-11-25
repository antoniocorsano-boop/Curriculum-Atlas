#!/usr/bin/env python3
"""Render two unapproved Atlas ART-DIR-02 camera alternatives from the EXISTING .blend.

Run in Blender: blender --background atlas-foyer-master.blend --python SCRIPT --
  --fit-json docs/atlas-gateway/ATLAS-CAMERA-FIT-CANONICAL-02.json --out OUT
This never saves or overwrites .blend/.glb nor changes public routes.
"""
import bpy
import sys
import os
import json
import hashlib
from mathutils import Vector

args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
def option(key):
    if key not in args or args.index(key)+1>=len(args):
        raise ValueError('Missing option '+key)
    return args[args.index(key)+1]
source=os.path.abspath(option('--fit-json'))
out=os.path.abspath(option('--out'))
os.makedirs(out,exist_ok=True)
with open(source,encoding='utf8') as f:
    fit=json.load(f)
manifest_path=os.path.join(os.getcwd(),'docs','atlas-gateway','ART-REFERENCE-CANONICAL-2026-11-21.json')
with open(manifest_path,encoding='utf8') as f:
    canon=json.load(f)
if fit['schema']!='atlas.gateway.camera-fit-canonical/v2':
    raise ValueError('Unrecognized camera-fitting contract')
if fit['status']!='NUMERIC_CANDIDATE_FROM_CANONICAL_IMAGE_NOT_APPLIED_NOT_ART_APPROVED':
    raise ValueError('Camera candidate must not be art approved')
if fit['source']['sha256']!=canon['file']['sha256'] or not canon['active']:
    raise ValueError('Camera candidate does not use the active canonical image')
scene=bpy.context.scene
camera=scene.camera
if camera is None or camera.type!='CAMERA':
    raise ValueError('The existing master must contain the actual camera')
portal_names=['Curricolo','Esplora','Percorsi','Esperienze']
roots=[bpy.data.objects.get('Portale • '+label) for label in portal_names]
titles=[bpy.data.objects.get('Portale • titolo '+label) for label in portal_names]
if any(o is None for o in roots+titles):
    raise ValueError('Four architectural portals or original titles are missing')
base_root=[(obj.location.copy(),obj.scale.copy()) for obj in roots]
base_title=[(obj.location.copy(),obj.scale.copy()) for obj in titles]
scene.render.engine='CYCLES'
scene.cycles.samples=8
scene.render.resolution_x=960
scene.render.resolution_y=540
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
records=[]
for label,branch in [('camera_only','CAMERA_ONLY'),('camera_and_layout_candidate','CAMERA_AND_LAYOUT')]:
    values=fit[label]['camera']
    camera.location=(0.0,values['camera_y'],values['camera_z'])
    camera.rotation_euler=(Vector((0,2.9,values['target_z']))-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.lens=values['lens_mm']
    x_scale=values['portal_x_scale']
    width_scale=values['portal_width_scale']
    for obj,(location,scale) in zip(roots,base_root):
        obj.location=location.copy()
        obj.location.x=location.x*x_scale
        obj.scale=scale.copy()
        obj.scale.x=scale.x*width_scale
    for obj,(location,scale) in zip(titles,base_title):
        obj.location=location.copy()
        obj.location.x=location.x*x_scale
        obj.scale=scale.copy()
        obj.scale.x=scale.x*width_scale
    file=os.path.join(out,branch.lower()+'-cycles.png')
    scene.render.filepath=file
    bpy.ops.render.render(write_still=True)
    with open(file,'rb') as f:
        raw=f.read()
    records.append({'variant':branch,'file':os.path.basename(file),
                    'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),
                    'camera_and_layout':values,'render':'Cycles 960x540 8 samples',
                    'art_approved':False})
with open(os.path.join(out,'candidate-receipt.json'),'w',encoding='utf8') as handle:
    json.dump({'schema':'atlas.gateway.art-dir02.camera-comparison/v1',
               'status':'TWO_EXPERIMENTAL_RENDERINGS_NOT_APPROVED',
               'reference_sha256':canon['file']['sha256'],
               'master_unchanged':True,'variants':records,
               'student_authorized':False,'public_release':False},
              handle,ensure_ascii=False,indent=2)
print('ATLAS_CAMERA_CANDIDATES_CREATED',len(records))
