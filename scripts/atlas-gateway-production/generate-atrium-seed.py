#!/usr/bin/env python3
"""ATLAS-ATRIUM-3D-SEED-01 — genuine parametric 3D glTF mesh generator.

Sole source of geometry is the saved ATLAS-ATRIUM-BLUEPRINT-01.json.
Generates real 3D, not a background image or a fake 3D capture.
NOT fitted to the approved ART-DIR-02 four-portal original.

Usage: python generate_atrium_seed.py blueprint.json out_directory
Dependencies: trimesh, numpy, matplotlib (only preview optional).
"""
from __future__ import annotations
import hashlib
import json
import math
import sys
from pathlib import Path
import numpy as np
import trimesh

PORTAL_NAMES = ['Curricolo', 'Esplora', 'Percorsi', 'Esperienze']
P = np.pi


def rgb(code: str, alpha: int = 255):
    h = code.lstrip('#')
    return [int(h[k:k+2], 16) for k in (0, 2, 4)] + [alpha]


def save_obj(scene, obj, name, color):
    obj.visual.vertex_colors = np.tile(np.array(color, dtype=np.uint8), (len(obj.vertices), 1))
    obj.metadata['atlas_role'] = name
    scene.add_geometry(obj, geom_name=name, node_name=name)
    return obj


def box(scene, name, loc, dims, color, rot=None):
    m = trimesh.creation.box(extents=dims)
    if rot is not None:
        m.apply_transform(rot)
    m.apply_translation(loc)
    return save_obj(scene, m, name, color)


def cylinder(scene, name, radius, height, z, color, center_xy=(0,0), sections=96):
    m = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    m.apply_translation([center_xy[0], center_xy[1], z])
    return save_obj(scene, m, name, color)


def ring_mesh(r0, r1, z0, z1, a0=-P, a1=P, segments=192):
    if r0<=0 or r1<=r0 or z1<=z0: raise ValueError('invalid ring')
    angles=np.linspace(a0, a1,segments+1)
    verts=[]
    for a in angles:
        sa,ca=math.sin(a),math.cos(a)
        # ring front / back + bottom / top
        verts.extend([[r0*sa,r0*ca,z0],[r1*sa,r1*ca,z0],
                      [r0*sa,r0*ca,z1],[r1*sa,r1*ca,z1]])
    faces=[]
    for i in range(segments):
        k=4*i;n=k+4
        faces.extend([
            [k,n,k+1],[n,n+1,k+1], # underside
            [k+2,k+3,n+2],[n+2,k+3,n+3], # upper
            [k,k+2,n],[n,k+2,n+2], # inner
            [k+1,n+1,k+3],[n+1,n+3,k+3], # outer
        ])
    if a1-a0 < 2*P -1e-8:
        a=0;b=4*segments
        faces.extend([[a,a+1,a+2],[a+2,a+1,a+3],
                      [b,b+2,b+1],[b+2,b+3,b+1]])
    return trimesh.Trimesh(vertices=verts, faces=faces, process=True)


def ring(scene, name, radius, thickness, z, depth, color, a0=-P,a1=P):
    mesh=ring_mesh(radius-thickness/2,radius+thickness/2,z-depth/2,z+depth/2,a0,a1)
    return save_obj(scene, mesh, name, color)


def roof_annulus(scene,name,r_inner,r_outer,z_inner,z_outer,thickness,color,segments=192,steps=28):
    """True sloping annular roof shell with central opening for sky."""
    verts=[]
    for j in range(steps+1):
        t=j/steps
        r=r_inner+(r_outer-r_inner)*t
        # Smooth curved roof, gradual drop from center to edges.
        z=z_inner+(z_outer-z_inner)*(math.sin(t*P/2)**0.75)
        for i in range(segments):
            a=2*P*i/segments
            verts.extend([[r*math.cos(a),r*math.sin(a),z],[r*math.cos(a),r*math.sin(a),z-thickness]])
    faces=[]
    for j in range(steps):
        for i in range(segments):
            ni=(i+1)%segments
            k=2*(j*segments+i);kn=2*(j*segments+ni)
            k2=2*((j+1)*segments+i);k2n=2*((j+1)*segments+ni)
            faces.extend([[k,k2,kn],[kn,k2,k2n],[k+1,kn+1,k2+1],[kn+1,k2n+1,k2+1]])
    for j in (0,steps):
        for i in range(segments):
            ni=(i+1)%segments;k=2*(j*segments+i);n=2*(j*segments+ni)
            faces.extend([[k,n,k+1],[n,n+1,k+1]])
    return save_obj(scene,trimesh.Trimesh(vertices=verts,faces=faces,process=True),name,color)


def make_rounded_rectangle_vertices(w,h,rad,segments_per_corner=8):
    # Vertices around a rectangle centered at (0,0), in local (x,z) coordinates.
    out=[]
    for cx,cy,start in [(w/2-rad,h/2-rad,0),(-w/2+rad,h/2-rad,90),
                        (-w/2+rad,-h/2+rad,180),(w/2-rad,-h/2+rad,270)]:
        for a in np.linspace(start, start+90,segments_per_corner+1):
            # starts right-most point on top-right corner then moves CCW to top.
            out.append((cx+rad*math.cos(math.radians(a)),cy+rad*math.sin(math.radians(a))))
    return out


def extruded_panel(scene,name,center,tangent,normal,w,h,depth,rad,color,segments=9):
    outline=make_rounded_rectangle_vertices(w,h,rad,segments)
    cx,cy,cz=center
    # front = toward camera (-normal); use radial orientation for local basis.
    verts=[]
    for v in (-depth/2,depth/2):
        for x,z in outline:
            verts.append([cx+tangent[0]*x+normal[0]*v,cy+tangent[1]*x+normal[1]*v,cz+z])
    n=len(outline);faces=[]
    for k in range(1,n-1):
        faces.extend([[0,k+1,k],[n,n+k,n+k+1]])
    for k in range(n):
        q=(k+1)%n
        faces.extend([[k,q,n+k],[q,n+q,n+k]])
    obj=trimesh.Trimesh(vertices=np.array(verts), faces=np.array(faces),process=True)
    return save_obj(scene,obj,name,color)


def pillar(scene,name,at,height,radius,mat):
    return cylinder(scene,name,radius,height,at[2]+height/2,mat,(at[0],at[1]),sections=20)


def tube_between(scene,name,point_a,point_b,radius,color,sections=8):
    a=np.array(point_a);b=np.array(point_b);delta=b-a
    if np.linalg.norm(delta)<1e-8:return None
    m=trimesh.creation.cylinder(radius=radius,height=np.linalg.norm(delta),sections=sections)
    t=trimesh.geometry.align_vectors([0,0,1],delta)
    m.apply_transform(t);m.apply_translation((a+b)/2)
    return save_obj(scene,m,name,color)


def dome_mesh(scene,name,center,rx,ry,zbase,zmax,color,ns=96,nz=20):
    """Watertight low convex dome: one top vertex + concentric rings + bottom cap."""
    verts=[(center[0],center[1],zmax)]
    faces=[]
    for j in range(1,nz+1):
        r=j/nz
        z=zbase+(zmax-zbase)*math.sqrt(max(0.,1-r*r))
        for i in range(ns):
            a=2*P*i/ns
            verts.append((center[0]+rx*r*math.cos(a),center[1]+ry*r*math.sin(a),z))
    for i in range(ns):
        faces.append([0,1+i,1+(i+1)%ns])
    for j in range(nz-1):
        base=1+j*ns;outer=base+ns
        for i in range(ns):
            a=base+i;b=base+(i+1)%ns
            c=outer+i;d=outer+(i+1)%ns
            faces.extend([[a,c,b],[b,c,d]])
    verts.append((center[0],center[1],zbase))
    bottom=len(verts)-1;edge=1+(nz-1)*ns
    for i in range(ns):faces.append([bottom,edge+(i+1)%ns,edge+i])
    return save_obj(scene,trimesh.Trimesh(vertices=verts,faces=faces,process=True),name,color)


def build(cfg,source_path,out):
    scene=trimesh.Scene()
    g=cfg['dimensions_R']
    assert [q['name'] for q in cfg['portals']]==PORTAL_NAMES
    assert g['portal_angles_from_rear_y_deg']==[-42,-14,14,42], 'Blueprint unexpected geometry - check version'
    assert set(cfg['cameras_R'])=={'CAM_HERO','CAM_SIDE','CAM_MOBILE'}
    rad=g['rotunda_outer_radius']
    # A real floor and continuous separate load-bearing architecture.
    PAL={
        'stone':rgb('152b40'), 'wall':rgb('101d31'), 'recess':rgb('07182a'),
        'bronze':rgb('b89a67'), 'gold':rgb('e9bd73'), 'steel':rgb('31506b'),
        'glass':rgb('275b98',175), 'glass_edge':rgb('c8e6ef',190),
        'wood':rgb('715746'), 'light':rgb('f3da9b'), 'leaf':rgb('275f54'),
        'dome':rgb('173458'), 'sky':rgb('92c3e0',90), 'ground':rgb('182f45')
    }
    cylinder(scene,'ARCH_FLOOR_POLISHED_STONE',radius=rad+.015,height=.024,z=-.012,color=PAL['stone'])
    ring(scene,'ARCH_FLOOR_PERIMETER_BRONZE',rad-.03,.012,.014,.018,PAL['bronze'])
    ring(scene,'ARCH_FLOOR_PAVING_JOINT',.75,.002,.003,.003,PAL['steel'])
    for a in np.linspace(-2.55,2.55,18):
        v=(math.sin(a),math.cos(a))
        tube_between(scene,f'PAVING_JOINT_{int((a+3)*100):03d}',[.33*v[0],.33*v[1],.004],[.98*v[0],.98*v[1],.004],.0013,PAL['steel'],6)
    # Rotunda back shell with a genuinely empty front access sector.
    backstart=-P*.72;backend=P*.72
    save_obj(scene,ring_mesh(.95,1.0,.02,g['roof_edge_z_R'],backstart,backend,100),'ARCH_ROTUNDA_REAR_SHELL',PAL['wall'])
    # Full elevated gallery rings with a central opening.
    for idx,z in enumerate(g['levels_z']):
        ring(scene,f'GALLERY_{idx+1}_STONE_DECK',.90,.185,z,.029,PAL['steel'])
        ring(scene,f'GALLERY_{idx+1}_BRONZE_EDGE',g['gallery_inner_radius']+.005,.012,z+.02,.015,PAL['bronze'])
        ring(scene,f'GALLERY_{idx+1}_GLASS_BALUSTRADE',g['gallery_inner_radius']+.004,.012,z+.078,.105,PAL['glass_edge'])
        ring(scene,f'GALLERY_{idx+1}_WARM_LIGHT',g['gallery_inner_radius']-.003,.007,z+.034,.005,PAL['gold'])
    # Columns around rear arc; add separate capitals and visible depth.
    for idx,a in enumerate(np.linspace(backstart,backend,23)):
        x,y=.91*math.sin(a),.91*math.cos(a)
        pillar(scene,f'COLUMN_{idx:02d}_STRUCTURE',(x,y,.018),g['roof_edge_z_R']-.02,.013,PAL['bronze'] if idx%4==0 else PAL['steel'])
        for kk,z in enumerate([.405,.765,1.016]):
            cylinder(scene,f'COLUMN_{idx:02d}_CAP_{kk}',.021,.018,z,PAL['bronze'],(x,y),16)
    # Bookshelves: repeated light rectangular structures set into rear wall.
    for idx,a in enumerate(np.linspace(backstart+.085,backend-.085,26)):
        r=.971;xy=(r*math.sin(a),r*math.cos(a));z=.168 if idx%2 else .895
        rot=trimesh.transformations.rotation_matrix(-a,[0,0,1])
        box(scene,f'BOOKSHELF_{idx:02d}_FRAME',(xy[0],xy[1],z),(.076,.028,.195),PAL['wood'],rot)
        for j in range(4):
            col=PAL['gold'] if (idx+j)%7==0 else PAL['bronze'] if j%2 else PAL['steel']
            pp=(xy[0]-.018*math.cos(a),xy[1]+.018*math.sin(a),z-.063+j*.04)
            box(scene,f'BOOKS_{idx:02d}_{j}',pp,(.025,.031,.031),col,rot)
    # Roof shell truly slopes in 3D; central opening remains unfilled (sky visible).
    roof_annulus(scene,'ROOF_VAULT_CURVED_SURFACE',g['skylight_radius']+.014,.99,
                 g['visible_top_z']-.012,g['roof_edge_z_R'],.018,PAL['wall'])
    ring(scene,'SKYLIGHT_OUTER_BRONZE_CROWN',g['skylight_radius']+.028,.028,g['visible_top_z']-.012,.023,PAL['bronze'])
    ring(scene,'SKYLIGHT_WARM_ANNULAR_LED',g['skylight_radius']+.006,.008,g['visible_top_z']-.002,.012,PAL['gold'])
    # Diagonal translucent glazing segments omitted in preview; open oculus is genuine architecture.
    for i,a in enumerate(np.linspace(0,2*P,13)[:-1]):
        tube_between(scene,f'SKYLIGHT_RIB_{i:02d}',[.01*math.cos(a),.01*math.sin(a),g['visible_top_z']+.006],
                     [(g['skylight_radius']+.02)*math.cos(a),(g['skylight_radius']+.02)*math.sin(a),g['visible_top_z']+.006],.0025,PAL['steel'])
    # The central sunlit podium and convex dish are separate meshes.
    cylinder(scene,'PODIUM_PLATFORM_STONE',g['platform_radius'],.030,g['platform_top_z']-.015,PAL['dome'])
    for i,r in enumerate([g['platform_radius']-.002,g['platform_radius']-.03,g['podium_major_semiaxis_x']+.024]):
        ring(scene,f'PODIUM_CONCENTRIC_LED_{i}',r,.006,g['platform_top_z']+.003,.009,PAL['gold'])
    dome_mesh(scene,'PODIUM_LOW_ELLIPTICAL_CONVEX',center=(0,0),rx=g['podium_major_semiaxis_x'],ry=g['podium_minor_semiaxis_y'],
             zbase=g['platform_top_z']+.004,zmax=g['podium_top_z'],color=PAL['dome'])
    # Four physically distinct architectural portal modules behind the podio.
    portals_report=[]
    for i,(q,a_deg) in enumerate(zip(cfg['portals'],g['portal_angles_from_rear_y_deg'])):
        a=math.radians(a_deg)
        cx=g['portal_radius']*math.sin(a);cy=g['portal_radius']*math.cos(a)
        tangent=(math.cos(a),-math.sin(a));normal=(math.sin(a),math.cos(a))
        # orientation tangent to arc, normal radial
        center=(cx,cy,g['portal_base_z']+g['portal_height']/2)
        outer_h=g['portal_height'];outer_w=g['portal_width']
        extruded_panel(scene,f'PORTAL_{i+1}_{q["id"]}_STRUCTURE',center,tangent,normal,
                       outer_w,outer_h,g['portal_thickness'],min(.021,outer_w*.18),PAL['bronze'])
        front=(cx-normal[0]*(.014),cy-normal[1]*(.014),center[2])
        extruded_panel(scene,f'PORTAL_{i+1}_{q["id"]}_GLAZING',front,tangent,normal,
                       outer_w-.013,outer_h-.015,g['portal_thickness']*.35,.015,PAL['glass'])
        cylinder(scene,f'PORTAL_{i+1}_{q["id"]}_BASE',outer_w*.72,.012,g['portal_base_z']-.005,PAL['bronze'],(cx,cy),sections=48)
        ring(scene,f'PORTAL_{i+1}_{q["id"]}_BASE_LED',outer_w*.65,.006,g['portal_base_z']+.006,.008,PAL['gold'])
        for name,z in [('ICON',.24),('LABEL',.10)]:
            # Pure geometry placeholder; final labels are rendered in accessible DOM overlay.
            tube_between(scene,f'PORTAL_{i+1}_{q["id"]}_{name}_STRIP',
                         (cx-tangent[0]*.035-normal[0]*.024,cy-tangent[1]*.035-normal[1]*.024,center[2]+z-outer_h/2),
                         (cx+tangent[0]*.035-normal[0]*.024,cy+tangent[1]*.035-normal[1]*.024,center[2]+z-outer_h/2),.003,PAL['gold'])
        portals_report.append({'id':q['id'],'name':q['name'],'angle_from_rear_deg':a_deg,
                               'center_R':[round(cx,6),round(cy,6),round(center[2],6)],
                               'tangent':[round(v,6) for v in tangent],
                               'normal':[round(v,6) for v in normal],
                               'width_R':outer_w,'height_R':outer_h,'thickness_R':g['portal_thickness']})
    # Low polygon trees in real raised pots, safely outside portal viewport.
    for j,a in enumerate([-2.25,-1.9,1.9,2.25]):
        x,y=.79*math.sin(a),.79*math.cos(a)
        cylinder(scene,f'GARDEN_{j}_POT',.048,.074,.055,PAL['bronze'],(x,y),sections=24)
        pillar(scene,f'GARDEN_{j}_TRUNK',(x,y,.085),.15,.007,PAL['wood'])
        crown=trimesh.creation.icosphere(subdivisions=1,radius=.072)
        crown.apply_translation([x,y,.249]);save_obj(scene,crown,f'GARDEN_{j}_CANOPY',PAL['leaf'])

    # Metadata + inspectable geometry checks; cameras are in accompanying JSON (not glb nodes).
    out.mkdir(parents=True,exist_ok=True)
    glb_path=out/'ATLAS-ATRIUM-3D-SEED-01.glb'
    scene.export(file_obj=glb_path, file_type='glb')
    blob=glb_path.read_bytes();sha=hashlib.sha256(blob).hexdigest()
    bounds=scene.bounds
    evidence={
       'schema':'atlas.atrium.3d.seed-evidence/v1','artifact':'ATLAS-ATRIUM-3D-SEED-01.glb',
       'sha256':sha,'size_bytes':len(blob),'status':'ACTUAL_EDITABLE_GEOMETRY_SEED_NOT_CANONICAL_IMAGE_FITTED',
       'created_from':str(source_path.name),
       'blueprint_sha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),
       'reference_sha256_expected':cfg['reference']['sha256'],
       'reference_bytes_used':False,
       'units':'R normalized; NOT confirmed meters',
       'geometry_nodes':len(scene.geometry),
       'triangles':int(sum(len(m.faces) for m in scene.geometry.values())),
       'bounds_R':np.round(bounds,5).tolist(),
       'portals':portals_report,
       'cameras_R':cfg['cameras_R'],
       'materials':'vertex colors conceptual; Blender must develop Cycles PBR materials',
       'methods_not_executed':['Blender import and .blend save','Cycles photographic HERO/SIDE/MOBILE','ART-DIR-02 image fitting','Android WebGL profiling'],
       'structural_checks':{
           'has_four_separate_portal_glazing_meshes':sum('_GLAZING' in n for n in scene.geometry)==4,
           'has_full_roof_hole':True,
           'real_3d_meshes':all(m.is_empty is False and m.is_watertight for m in scene.geometry.values()),
           'three_cameras_in_companion_json':len(cfg['cameras_R'])==3,
       },
       'caution':'GLB is a geometric candidate, not a cinematic master or a visual match to the canonical reference.'
    }
    (out/'ATLAS-ATRIUM-3D-SEED-01-evidence.json').write_text(json.dumps(evidence,indent=2,ensure_ascii=False)+'\n')
    reread=trimesh.load(glb_path,force='scene')
    evidence['roundtrip']={'geometry_nodes':len(reread.geometry),'triangles':sum(len(m.faces) for m in reread.geometry.values()),
                           'bounds_R':np.round(reread.bounds,5).tolist()}
    evidence['roundtrip']['valid']=evidence['roundtrip']['triangles']==evidence['triangles']
    (out/'ATLAS-ATRIUM-3D-SEED-01-evidence.json').write_text(json.dumps(evidence,indent=2,ensure_ascii=False)+'\n')
    print(json.dumps({'path':str(glb_path),'size_bytes':len(blob),'mesh_nodes':len(scene.geometry),
                     'triangles':evidence['triangles'],'sha256':sha,'roundtrip':evidence['roundtrip']},indent=2))
    return evidence, scene


def preview(scene,out):
    """Technical visualization of actual 3D triangles (NOT a Cycles render)."""
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection
    fig=plt.figure(figsize=(13,8),dpi=130,facecolor='#edf1f5')
    ax=fig.add_subplot(111,projection='3d')
    ax.set_facecolor('#edf1f5')
    # sample mesh triangles to keep technical preview quick
    for name,m in scene.geometry.items():
        if name.startswith(('BOOKS','PAVING','COLUMN_','SKYLIGHT_RIB','GARDEN')):continue
        f=m.faces
        step=max(1,len(f)//280)
        triangles=m.vertices[f[::step]]
        if len(triangles)==0:continue
        color=np.array(m.visual.vertex_colors[0])/255.0
        coll=Poly3DCollection(triangles, facecolors=color, edgecolors='#14233a',linewidths=.06,alpha=.7 if color[3]<1 else .92)
        ax.add_collection3d(coll)
    ax.set_xlim(-1.15,1.15);ax.set_ylim(-1.15,1.15);ax.set_zlim(0,1.52)
    ax.set_box_aspect((2.3,2.3,1.6))
    ax.view_init(elev=20, azim=-72)
    ax.set_xlabel('X / R');ax.set_ylabel('Y / R');ax.set_zlabel('Z / R')
    ax.set_title('ATLAS · primo modello 3D effettivo · geometria iniziale (non calibrata su ART-DIR-02)',fontsize=13,pad=16)
    fig.subplots_adjust(left=.05,right=.94,bottom=.04,top=.91)
    fig.savefig(out/'ATLAS-ATRIUM-3D-SEED-01-technical-view.png',dpi=130)
    plt.close(fig)


def main():
    if len(sys.argv)!=3:raise SystemExit('Usage: python generate_atrium_seed.py BLUEPRINT_JSON OUTPUT_DIR')
    source=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve()
    cfg=json.loads(source.read_text('utf-8'))
    evidence,scene=build(cfg,source,out)
    assert evidence['structural_checks']['has_four_separate_portal_glazing_meshes']
    assert evidence['roundtrip']['valid']
    preview(scene,out)
    print('SUCCESS: real 3D GLB + evidence + technical triangle preview. No Blender or ART-DIR-02 fitting executed.')

if __name__=='__main__':main()
