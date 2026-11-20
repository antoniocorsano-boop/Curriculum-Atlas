#!/usr/bin/env python3
"""ATLAS-ATRIUM-BLUEPRINT-01: deterministic vector concept views.

Stdlib only. Input is the versioned, normalized proposed geometry JSON.
Does NOT render an original image, a Blender 3D scene, or a metrically surveyed plan.

usage: python render-blueprint.py ATLAS-ATRIUM-BLUEPRINT-01.json ./out
"""
import json, math, sys, html, pathlib


def svgtext(v):
    return html.escape(str(v), quote=True)


def tag(name, attrs=None, body=""):
    a = " ".join(f'{k.replace("_","-")}="{svgtext(v)}"' for k,v in (attrs or {}).items())
    return f'<{name} {a}>{body}</{name}>'


def coords(c, r, x, y):
    return (c[0]+r*x, c[1]-r*y)


def validate(cfg):
    g=cfg['dimensions_R']; p=cfg['portals']; ang=g['portal_angles_from_rear_y_deg']
    assert len(p)==4 and [q['name'] for q in p]==['Curricolo','Esplora','Percorsi','Esperienze']
    assert len(ang)==4 and ang==[-x for x in reversed(ang)]
    assert 0 < g['portal_width'] < g['portal_radius'] < g['rotunda_outer_radius']
    assert 0 < g['skylight_radius'] < g['gallery_inner_radius'] < 1
    assert len(cfg['cameras_R'])==3
    assert set(cfg['cameras_R'])=={'CAM_HERO','CAM_SIDE','CAM_MOBILE'}
    r = g['portal_radius']; w=g['portal_width']; t=g['portal_thickness']; portals=[]
    for portal,degree in zip(p,ang):
        a=math.radians(degree)
        x,y=r*math.sin(a),r*math.cos(a)
        # Tangential portal tangent and normal in XY plane. The plane faces the visitor.
        tangent=(math.cos(a),-math.sin(a)); normal=(math.sin(a),math.cos(a))
        corners=[]
        for u,v in [(-w/2,-t/2),(w/2,-t/2),(w/2,t/2),(-w/2,t/2)]:
            corners.append((x+u*tangent[0]+v*normal[0], y+u*tangent[1]+v*normal[1]))
        portals.append({'id':portal['id'],'name':portal['name'], 'center_R':[round(x,6),round(y,6),round(g['portal_base_z']+g['portal_height']/2,6)],'angle_deg':degree,'corners_R':[[round(k,6) for k in xy] for xy in corners]})
    def separating_axis(poly1,poly2):
        def axes(poly):
            for k in range(len(poly)):
                ax,ay=poly[k]; bx,by=poly[(k+1)%len(poly)]
                yield (-(by-ay),bx-ax)
        for vx,vy in list(axes(poly1))+list(axes(poly2)):
            p1=[vx*x+vy*y for x,y in poly1];p2=[vx*x+vy*y for x,y in poly2]
            if max(p1)<min(p2) or max(p2)<min(p1):return True
        return False
    for i in range(4):
        for j in range(i+1,4):
            assert separating_axis(portals[i]['corners_R'],portals[j]['corners_R']),f'overlapping portal projections {i},{j}'
    # Adjacent center separation is useful for quick change detection; not exact panel clearance.
    adjacent=[]
    for i in range(3):
        a=portals[i]['center_R'];b=portals[i+1]['center_R']
        adjacent.append({'between':[portals[i]['id'],portals[i+1]['id']], 'center_distance_R':round(math.dist(a[:2],b[:2]),5)})
    return {'schema':'atlas.atrium.blueprint-measures/v1','status':'CONCEPTUAL_GEOMETRY_TESTED_NOT_IMAGE_FITTED', 'coordinate_units':'R', 'portals':portals,'adjacent_portal_center_distances':adjacent,'observations':{'rotunda_diameter_R':2, 'skylight_diameter_R':2*g['skylight_radius'], 'platform_diameter_R':2*g['platform_radius'], 'camera_hero_distance_to_origin_R':math.sqrt(sum(v*v for v in cfg['cameras_R']['CAM_HERO']['position']))}, 'checks':{'four_portals':True,'symmetric_angles':True,'separated_panel_footprints':True,'three_cameras':True},'image_fitting':'NOT_RUN_REFERENCE_PNG_UNAVAILABLE'}


def render(cfg,measures):
    g=cfg['dimensions_R']; P=[]
    def line(x1,y1,x2,y2,color='#9ab2be',width=2,dash=None):
        a={'x1':round(x1,2),'y1':round(y1,2),'x2':round(x2,2),'y2':round(y2,2),'stroke':color,'stroke_width':width}
        if dash:a['stroke_dasharray']=dash
        P.append(tag('line',a))
    def circle(x,y,rad,stroke='#284259',sw=2,fill='none',dash=None):
        a={'cx':round(x,2),'cy':round(y,2),'r':round(rad,2),'fill':fill,'stroke':stroke,'stroke_width':sw}
        if dash:a['stroke_dasharray']=dash
        P.append(tag('circle',a))
    def rect(x,y,w,h,fill='none',stroke='#284259',radius=10,sw=2):
        P.append(tag('rect',{'x':x,'y':y,'width':w,'height':h,'rx':radius,'fill':fill,'stroke':stroke,'stroke_width':sw}))
    def text(x,y,s,size=20,color='#152a42',weight=500,anchor='start',extra=None):
        a={'x':x,'y':y,'font_size':size,'fill':color,'font_weight':weight,'text_anchor':anchor};a.update(extra or {})
        P.append(tag('text',a,svgtext(s)))
    def ellipse(x,y,rx,ry,stroke='#c89d53',fill='none',sw=2):
        P.append(tag('ellipse',{'cx':x,'cy':y,'rx':rx,'ry':ry,'stroke':stroke,'stroke_width':sw,'fill':fill}))
    def path(d,stroke='#152a42',width=2,fill='none',dash=None):
        a={'d':d,'stroke':stroke,'stroke_width':width,'fill':fill}
        if dash:a['stroke_dasharray']=dash
        P.append(tag('path',a))
    def smalllabel(x,y,s): text(x,y,s,15,'#546b79')
    P.append('<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1150" viewBox="0 0 1800 1150">')
    P.append('<rect x="0" y="0" width="1800" height="1150" fill="#f7f9f9"/>')
    P.append('<style>text{font-family:DejaVu Sans,Liberation Sans,Arial,sans-serif;letter-spacing:.1px} .panel{fill:#ffffff;stroke:#dee5e7;stroke-width:2}</style>')
    text(60,75,'ATLAS  /  ATRIO DELLA CONOSCENZA',38,'#102c47',700)
    text(60,110,'BLUEPRINT 01  •  geometria parametrica iniziale  •  NON calibrato sull’immagine ART-DIR-02',19,'#536d7d')
    P.append('<rect class="panel" x="40" y="143" width="835" height="825" rx="20"/>')
    P.append('<rect class="panel" x="899" y="143" width="861" height="385" rx="20"/>')
    P.append('<rect class="panel" x="899" y="548" width="861" height="420" rx="20"/>')
    text(70,185,'01  /  PIANTA CONCETTUALE',24,'#102c47',700)
    smalllabel(70,211,'Rotonda R = 1, vista dall’alto · X orizzontale · +Y verso il fondo')
    C=(454,510);s=184
    circle(*C,s,'#163650',4,'#f1f6f8')
    circle(*C,s*g['gallery_inner_radius'],'#a1afb8',2,'none','8 8')
    circle(*C,s*(1-g['wall_shell_thickness']),'#7d929f',1,'none','2 8')
    circle(*C,s*g['skylight_radius'],'#b78e51',4,'#f5f9fa')
    circle(*C,s*g['platform_radius'],'#b78e51',4,'#dfeaf0')
    ellipse(*C,s*g['podium_major_semiaxis_x'],s*g['podium_minor_semiaxis_y'],stroke='#2c547d',fill='#315a79',sw=2)
    # The x and y axes show scale and orientation.
    line(C[0]-s*1.15,C[1],C[0]+s*1.15,C[1],'#cdd9dd',1,'3 5')
    line(C[0],C[1]-s*1.15,C[0],C[1]+s*1.15,'#cdd9dd',1,'3 5')
    text(C[0]+s*1.12,C[1]-12,'+X',13,'#547487')
    text(C[0]+12,C[1]-s*1.11,'+Y',13,'#547487')
    for i,port in enumerate(measures['portals']):
        px,py=port['center_R'][:2]; screen=coords(C,s,px,py)
        angle=g['portal_angles_from_rear_y_deg'][i]
        w=s*g['portal_width'];h=10
        P.append(tag('rect',{'x':-w/2,'y':-h/2,'width':w,'height':h,'rx':4,'fill':'#174b85','stroke':'#e3bb6f','stroke_width':2,'transform':f'translate({screen[0]:.2f} {screen[1]:.2f}) rotate({angle})'}))
        P.append(tag('circle',{'cx':round(screen[0],2),'cy':round(screen[1],2),'r':2.5,'fill':'#ffffff'}))
        # callouts above the arc, grouped neatly into two lines
        locs=[(146,300),(325,260),(555,260),(748,300)]
        tx,ty=locs[i]
        line(screen[0],screen[1]-12,tx,ty+12,'#9db1bd',1,'4 5')
        text(tx,ty,str(i+1),19,'#ab8245',700,anchor='middle')
        text(tx,ty+22,port['name'],16,'#1a4b76',650,anchor='middle')
    # Camera shown as a location marker outside rotonda.
    H=cfg['cameras_R']['CAM_HERO']['position']; cam=coords(C,s,H[0],H[1]);
    line(C[0],C[1]+s*.1,cam[0],cam[1],'#2a6a98',2,'10 8')
    P.append(tag('path',{'d':f'M {cam[0]:.1f} {cam[1]-12:.1f} l -13 25 h 26 z','fill':'#285a81'}))
    text(cam[0]+20,cam[1]-15,'CAM_HERO',17,'#225d87',700)
    text(cam[0]+20,cam[1]+7,'(0; −1,90R; 0,25R)',14,'#647c8a')
    text(70,923,'Legenda:  anello scuro = rotonda  ·  oro = lucernario / base  ·  blu = portali',16,'#536a79')
    # Section panel spans walls, skylight, galleries and central podium.
    text(927,186,'02  /  SEZIONE ASSIALE A–A',24,'#102c47',700)
    smalllabel(927,211,'Sezione schematica su Y = 0 · quota Z in unità R')
    sx=1311; sz0=484; ss=176
    wallx=sx-ss*g['rotunda_outer_radius'];wallx2=sx+ss*g['rotunda_outer_radius']
    line(1018,sz0,1676,sz0,'#263d50',3)
    for wx in (wallx,wallx2):
        line(wx,sz0,wx,sz0-ss*g['roof_edge_z_R'],'#1e465c',12)
    for z in g['levels_z']:
        yy=sz0-ss*z
        for x1,x2 in [(wallx,sx-ss*.54),(sx+ss*.54,wallx2)]:
            line(x1,yy,x2,yy,'#8d9da9',7)
            line(x1,yy-ss*.10,x2,yy-ss*.10,'#b6aa88',2)
    ocy=sz0-ss*g['skylight_center'][2]
    line(sx-ss*g['skylight_radius'],ocy,sx+ss*g['skylight_radius'],ocy,'#b28c4a',8)
    path(f'M {wallx} {sz0-ss*g["roof_edge_z_R"]} Q {sx-ss*.55} {sz0-ss*1.45} {sx-ss*g["skylight_radius"]} {ocy}', '#254c65',3)
    path(f'M {wallx2} {sz0-ss*g["roof_edge_z_R"]} Q {sx+ss*.55} {sz0-ss*1.45} {sx+ss*g["skylight_radius"]} {ocy}', '#254c65',3)
    # Central convex section and raised platform.
    platform=g['platform_radius']*ss;hub=g['podium_major_semiaxis_x']*ss
    basey=sz0-ss*g['platform_top_z']
    line(sx-platform,basey,sx+platform,basey,'#ba9150',9)
    path(f'M {sx-hub} {basey} Q {sx-hub*.93} {basey-ss*.16} {sx} {sz0-ss*g["podium_top_z"]} Q {sx+hub*.93} {basey-ss*.16} {sx+hub} {basey}', '#315e80',3,'#d3e1eb')
    smalllabel(1435,271,'oculo 0,34R')
    smalllabel(1493,354,'+0,78R')
    smalllabel(1493,423,'+0,42R')
    smalllabel(1380,463,'podio +0,14R')
    # portal elevation all at equal size, single projection (not actual camera result)
    text(927,591,'03  /  QUATTRO PORTALI',24,'#102c47',700)
    smalllabel(927,617,'Schema frontale idealizzato; la profondità varia secondo l’arco in pianta')
    names=[(p['name'],p['subtitle']) for p in cfg['portals']]
    cx=[1036,1242,1448,1654];py=669;pw=132;ph=211
    for i,(name,subtitle) in enumerate(names):
        x=cx[i]-pw/2
        rect(x,py,pw,ph,'#153d65','#d5aa62',16,4)
        rect(x+10,py+13,pw-20,ph-28,'#235b92','#88bcda',12,2)
        circle(cx[i],py+47,15,'#e8dbc4',2,'none')
        text(cx[i],py+92,name.upper(),14 if len(name)>9 else 16,'#ffffff',700,'middle')
        text(cx[i],py+116,subtitle.split(' ')[0],11,'#dbe9f3',400,'middle')
        line(cx[i]-31,py+165,cx[i]+31,py+165,'#c6b280',2)
        circle(cx[i],py+170,6,'#e0bd77',2,'#edc97e')
        text(cx[i],922,f'{i+1}. {name}',17,'#1d4f79',650,'middle')
    text(927,946,'Altezza singolo pannello: 0,46R  ·  larghezza: 0,16R',15,'#536a79')
    # footer metadata
    line(48,1000,1753,1000,'#d5dfe5',2)
    text(58,1043,'ATLAS-ATRIUM-BLUEPRINT-01  |  R = unità relativa, NON metri',19,'#183b53',700)
    text(58,1075,'Ipotesi visualizzata, non rilievo dal PNG definitivo. Le quote e la camera vanno corrette mediante confronto con ART-DIR-02.',16,'#6c7b86')
    text(58,1115,'SORGENTI: PROMPT-ART-01 / GEO-SPEC-01 / COMPOSER-SEED-01     ·     20.11.2026',14,'#68808e')
    P.append('</svg>')
    return '\n'.join(P)+'\n'


def main():
    if len(sys.argv)!=3:raise SystemExit('Usage: render-blueprint.py BLUEPRINT.json OUTPUT_DIR')
    src=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
    cfg=json.loads(src.read_text('utf-8'))
    report=validate(cfg)
    svg=render(cfg,report)
    (out/'ATLAS-ATRIUM-BLUEPRINT-01.svg').write_text(svg,encoding='utf-8')
    (out/'ATLAS-ATRIUM-BLUEPRINT-01-measures.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PASS: four ordered portals, symmetry, non-overlap, 3 cameras; SVG + measures saved (no Blender/image fitting).')
    print(json.dumps(report['adjacent_portal_center_distances'],ensure_ascii=False))

if __name__=='__main__':main()