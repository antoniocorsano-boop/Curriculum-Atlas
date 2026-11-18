"""A5.4b: source-locked naturalistic Mediterranean planting within existing footprints."""
import hashlib,sys
from pathlib import Path
base=Path(__file__).resolve().parent
PARENT="library-master-material-study.py"
PARENT_BLOB="19ef54e9f7ebb1e8ba636ce96131b3d1bb74c6d1"
END='exec(compile(code,'+'__file__,"exec"),globals())'
def once(code,old,new):
    assert code.count(old)==1,old[:120]
    return code.replace(old,new,1)
def between(code,start,end,replacement):
    assert code.count(start)==1 and code.count(end)==1
    a=code.index(start);b=code.index(end,a)
    return code[:a]+replacement+"\n"+code[b:]
def parent_source(verify):
    p=base/PARENT;raw=p.read_bytes()
    assert hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\x00"+raw).hexdigest()==PARENT_BLOB
    wrapper=once(raw.decode(),END,"__captured_source__=code")
    old=sys.argv
    try:
        sys.argv=[str(p),"--verify",old[2]] if verify else [str(p)]
        ns={"__file__":str(p),"__name__":"__atlas_parent__"}
        exec(compile(wrapper,str(p),"exec"),ns)
        return ns["__captured_source__"]
    finally:sys.argv=old

EXTERIOR="""
# A5.4b: overlapping irregular tapered lobes, same two material groups.
exterior_records=[]
cypress_tip=material("Cypress sunlit foliage",(.15,.225,.075),.82)
def crown_tree(x,y,h):
    z0=exterior_height(x,y) if y>=31 else -.18
    rng=random.Random(5402+int((x+100)*100)+int(y*100))
    cylinder("Cypress trunk",.065,z0+h*.26,h*.52,bark,scenery,x,y,10)
    near=y<31
    verts=[];faces=[]
    # One irregular core and several independently tapered side sprays.
    def lobe(cx,cy,low,high,radius,rings,sides,lean):
        n0=len(verts);a0=rng.uniform(0,2*pi)
        for k in range(rings):
            t=k/(rings-1)
            shape=max(.018,sin(pi*(.025+.95*t)))**.85*(1-.55*t)
            for j in range(sides):
                a=2*pi*j/sides
                rr=radius*shape*(1+.13*sin(3*a+a0+5*t)+rng.uniform(-.11,.11))
                verts.append((cx+rr*cos(a)+lean[0]*t,cy+rr*sin(a)+lean[1]*t,z0+low+(high-low)*t))
        for k in range(rings-1):
            for j in range(sides):
                q=n0+k*sides+j;qn=n0+k*sides+(j+1)%sides
                faces.append((q,qn,qn+sides,q+sides))
        faces.extend([tuple(n0+j for j in reversed(range(sides))),tuple(n0+(rings-1)*sides+j for j in range(sides))])
    lobe(x,y,.14*h,h,.135*h,14 if near else 10,14 if near else 10,(rng.uniform(-.06,.06),rng.uniform(-.06,.06)))
    sprays=12 if near else 5
    for i in range(sprays):
        a=i*2.399963+rng.uniform(-.22,.22);t=(i+.5)/sprays
        low=h*(.16+.46*t);high=min(h*.985,low+h*rng.uniform(.23,.37))
        offset=h*(.061*(1-.53*t))
        lobe(x+offset*cos(a),y+offset*sin(a),low,high,h*rng.uniform(.038,.061)*(1-.35*t),7 if near else 5,8 if near else 6,(.04*cos(a),.04*sin(a)))
    obj=mesh("Cypress layered crown",verts,faces,foliage,scenery)
    obj.data.materials.append(cypress_tip)
    for poly in obj.data.polygons:
        poly.use_smooth=True
        # Broad sunlit sprays rather than noisy random face colors.
        z=(poly.center.z-z0)/h
        if sin(poly.center.x*4.0+poly.center.y*2.0+z*15.0)>.45:poly.material_index=1
    exterior_records.append({"x":x,"y":y,"height":h,"near":near,"lobes":1+sprays,"vertices":len(verts),"faces":len(faces)})
"""

INTERIOR="""
# A5.4b: gnarled stems, hierarchical branching and lanceolate folded leaves.
olive_records=[]
def planter(x,y):
    reserve("Olive planter",x,y,2.25,2.25)
    soft_box("Planter plinth",(x,y,.10),(1.34,1.34,.20),stone,bevel=.035)
    soft_box("Planter body",(x,y,.48),(1.18,1.18,.60),stone,bevel=.045)
    soft_box("Planter rim",(x,y,.81),(1.30,1.30,.13),stone,bevel=.025)
    box("Soil inset",(x,y,.878),(.98,.98,.012),bark,decor)
    rng=random.Random(5412+int((x+10)*100))
    start=Vector((x,y,.88));mid=Vector((x-.07,y+.035,1.42));fork=Vector((x+.09,y-.045,1.96))
    tube("Olive curved trunk base",start,mid,.105,.077,bark,12)
    tube("Olive curved trunk upper",mid,fork,.077,.049,bark,12)
    buckets=[([],[]),([],[])]
    branches=0;twigs=0;leaves=0
    for j in range(10):
        a=2*pi*j/10+rng.uniform(-.18,.18);r=rng.uniform(.34,.58)
        elbow=Vector((x+r*.55*cos(a),y+r*.55*sin(a),rng.uniform(2.10,2.35)))
        tip=Vector((x+r*cos(a),y+r*sin(a),rng.uniform(2.40,2.78)))
        tube("Olive branch base",fork,elbow,.035,.021,bark,9)
        tube("Olive branch tip",elbow,tip,.021,.010,bark,8);branches+=1
        for k in range(6):
            t=(k+1)/7
            origin=elbow.lerp(tip,t)
            angle=a+rng.uniform(-1.0,1.0)
            rr=rng.uniform(.13,.24)
            twig=origin+Vector((rr*cos(angle),rr*sin(angle),rng.uniform(.10,.26)))
            tube("Olive fine twig",origin,twig,.009,.003,bark,6);twigs+=1
            for i in range(22):
                q=rng.uniform(0,2*pi);f=rng.uniform(.17,1.12)
                c=origin.lerp(twig,f)+Vector((rng.uniform(-.085,.085),rng.uniform(-.085,.085),rng.uniform(-.085,.085)))
                # Keep all leaf vertices well inside the unchanged planter footprint.
                dx=c.x-x;dy=c.y-y;rad=math.hypot(dx,dy)
                if rad>.91:c.x=x+dx*.91/rad;c.y=y+dy*.91/rad
                length=rng.uniform(.045,.088);width=length*rng.uniform(.22,.29)
                u=Vector((cos(q),sin(q),rng.uniform(-.45,.45))).normalized()*length
                v=Vector((-sin(q),cos(q),rng.uniform(-.14,.14))).normalized()*width
                ridge=Vector((0,0,rng.uniform(.004,.010)))
                verts,faces=buckets[0 if rng.random()<.58 else 1];n=len(verts)
                verts.extend(tuple(p) for p in (c-u,c-u*.32-v,c+u*.38-v*.70,c+u,c+u*.38+v*.70,c-u*.32+v,c+ridge))
                faces.extend((n+i,n+(i+1)%6,n+6) for i in range(6));leaves+=1
    for (verts,faces),mat in zip(buckets,(leaf_light,leaf_dark)):
        obj=mesh("Olive folded foliage",verts,faces,mat,decor)
        assert len(verts)>0
    olive_records.append({"x":x,"y":y,"branches":branches,"twigs":twigs,"leaves":leaves,"foliageVertices":sum(len(v) for v,f in buckets),"foliageTriangles":sum(len(f) for v,f in buckets)})
"""
RECEIPT="""
# The inherited footprint checker has already checked every furnishing vertex.
assert len(exterior_records)==34 and sum(q["near"] for q in exterior_records)==4
assert len(olive_records)==2 and all(q["leaves"]==1320 and q["twigs"]==60 for q in olive_records)
vegetation_study={"phase":"C3.3A5.4b","parent":"C3.3A5.4a","parentBlob":"19ef54e9f7ebb1e8ba636ce96131b3d1bb74c6d1","exterior":exterior_records,"interior":olive_records,"architectureChanged":False,"camerasChanged":False,"lightRigChanged":False,"materialStudyRetained":True,"footprintsRetained":True,"newExternalAssets":False,"browserQualified":False,"artisticApproval":False,"studentAuthorized":False}
(out/"vegetation-study.json").write_text(json.dumps(vegetation_study,indent=2)+"\\n")
"""
if len(sys.argv)>1 and sys.argv[1]=="--verify":
    code=parent_source(True)
    code=once(code,'m["phase"]=="C3.3A5.4a"','m["phase"]=="C3.3A5.4b"')
    code=once(code,'"phase":"C3.3A5.4a"','"phase":"C3.3A5.4b"')
    code=once(code,'study["phase"]==m["phase"]','study["phase"]=="C3.3A5.4a"')
    code=once(code,'(p/"library-verification.json").write_text', '''vegetation=json.loads((p/"vegetation-study.json").read_text())
assert vegetation["phase"]==m["phase"] and vegetation["parent"]=="C3.3A5.4a" and vegetation["parentBlob"]=="19ef54e9f7ebb1e8ba636ce96131b3d1bb74c6d1"
assert "vegetation-study.json" in m["files"] and m["vegetationRefinement"] is True
assert all(vegetation[k] is False for k in ("architectureChanged","camerasChanged","lightRigChanged","newExternalAssets","browserQualified","artisticApproval","studentAuthorized"))
assert vegetation["materialStudyRetained"] and vegetation["footprintsRetained"]
ex=vegetation["exterior"];inside=vegetation["interior"]
assert len(ex)==34 and sum(q["near"] for q in ex)==4 and len(inside)==2
assert all(q["lobes"]==(13 if q["near"] else 6) and q["vertices"]>0 and q["faces"]>0 for q in ex)
assert all(q["leaves"]==1320 and q["branches"]==10 and q["twigs"]==60 and q["foliageVertices"]==9240 and q["foliageTriangles"]==7920 for q in inside)
assert {(q["x"],q["y"]) for q in inside}=={(-6.0,3.45),(6.0,3.45)}
assert any(q.get("name")=="Landscape Olive green" for q in d["nodes"])
assert any(q.get("name")=="Cypress sunlit foliage" for q in d["materials"])
assert all(any(q.get("name")==name for q in sd["nodes"]) for name in ("Scenography Olive leaf light","Scenography Olive leaf shadow"))
receipt.update({"vegetationRefinement":True,"exteriorTrees":34,"interiorTrees":2,"interiorLeaves":2640,"exteriorCrownLobes":sum(q["lobes"] for q in ex)})
(p/"library-verification.json").write_text''')
    sys.argv=[sys.argv[0],sys.argv[2]]
else:
    code=parent_source(False)
    code=between(code,"def crown_tree(x,y,h):","near_trees=",EXTERIOR)
    code=between(code,"def planter(x,y):","def seat(x,y,side):",INTERIOR)
    code=once(code,'leaf_light=material("Olive leaf light",(.13,.23,.07),.69)','leaf_light=material("Olive leaf light",(.18,.27,.115),.68)')
    code=once(code,'leaf_dark=material("Olive leaf shadow",(.045,.11,.028),.78)','leaf_dark=material("Olive leaf shadow",(.065,.13,.052),.79)')
    code=once(code,"# A4.5 — original offline architectural signage, never independent navigation.",RECEIPT+"\n# A4.5 — original offline architectural signage, never independent navigation.")
    code=once(code,'receipt={"phase":"C3.3A5.4a"','receipt={"phase":"C3.3A5.4b","vegetationRefinement":True')
    code=once(code,'"arch-detail.png","material-study.json"):','"arch-detail.png","material-study.json","vegetation-study.json"):')
exec(compile(code,__file__,"exec"),globals())
