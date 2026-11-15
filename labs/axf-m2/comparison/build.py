"""Build both renderers from the exact same exported Tiled map and original PNGs."""
import json, pathlib, copy, sys, shutil, uuid
from PIL import Image, ImageDraw, ImageFont
root=pathlib.Path(sys.argv[1]); source=pathlib.Path(sys.argv[2]); out=pathlib.Path(sys.argv[3])
m=json.loads((root/'world.json').read_text())
template=json.loads(source.read_text())
scene=template['layouts'][0]; sprite=copy.deepcopy(next(o for o in scene['objects'] if o['type']=='Sprite'))
layer=copy.deepcopy(next(l for l in scene['layers'] if l['name']==''))
out.mkdir(parents=True,exist_ok=True)
assets=out/'assets'; assets.mkdir(exist_ok=True)
def uid(name): return str(uuid.uuid5(uuid.NAMESPACE_URL,'atlas-m2-c/'+name))
labels={'piazza':'Piazza','quaderno':'Quaderno','banco':'Banco'}
colors={'table':'#e6cca0','river':'#679cb5','bridge':'#b58659'}
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',22)
objects=[]; instances=[]; resources=[]
for z,o in enumerate(o for l in m['layers'] for o in l['objects']):
    name=o['name']; width=int(o['width']); height=int(o['height'])
    img=Image.new('RGBA',(width,height),colors.get(name,'#f8f0dc'))
    d=ImageDraw.Draw(img)
    if name in labels:
        d.rectangle((1,1,width-2,height-2),outline='#205e55',width=3)
        d.text((width/2,height/2),labels[name],font=font,fill='#203c41',anchor='mm')
    filename=f'assets/{name}.png'; img.save(out/filename)
    resources.append({'file':filename,'name':filename,'kind':'image','metadata':'','smoothed':True,'userAdded':True})
    s=copy.deepcopy(sprite); s.update(name=name,persistentUuid=uid(name),assetStoreId='',behaviors=[],variables=[],effects=[])
    s['animations']=[{'name':'','useMultipleDirections':False,'directions':[{'looping':False,'timeBetweenFrames':0.08,'sprites':[{'image':filename,'hasCustomCollisionMask':False,'points':[],'originPoint':{'name':'origine','x':0,'y':0},'centerPoint':{'automatic':True,'name':'centre','x':0,'y':0},'customCollisionMask':[]}]}]}]
    objects.append(s)
    instances.append({'name':name,'persistentUuid':uid(name+'/instance'),'x':o['x'],'y':o['y'],'angle':0,'customSize':False,'width':0,'height':0,'layer':'','zOrder':z,'numberProperties':[],'stringProperties':[],'initialVariables':[]})
zones={o['name']:next(p['value'] for p in o['properties'] if p['name']=='action') for l in m['layers'] if l['name']=='interactions' for o in l['objects']}
assert len(zones)==3
code="""if (!runtimeScene.__axfReady) {
 runtimeScene.__axfReady=true;
 gdjs.evtTools.input.touchSimulateMouse(runtimeScene,true);
 parent.axfReady();
}
if (gdjs.evtTools.input.isMouseButtonReleased(runtimeScene,"Left")) {
 const x=gdjs.evtTools.input.getCursorX(runtimeScene,"",0), y=gdjs.evtTools.input.getCursorY(runtimeScene,"",0);
 for (const [name,action] of Object.entries(ZONES)) {
  const o=runtimeScene.getObjects(name)[0];
  if(o && x>=o.getX() && x<=o.getX()+o.getWidth() && y>=o.getY() && y<=o.getY()+o.getHeight()) parent.axfSelect(action);
 }
}""".replace('ZONES',json.dumps(zones))
scene.update(name='Atelier',title='',mangledName='Atelier',r=170,v=136,b=100,objects=objects,instances=instances,layers=[layer],objectsGroups=[],variables=[],behaviorsSharedData=[],objectsFolderStructure={'folderName':'__ROOT','children':[{'objectName':o['name']} for o in objects]},events=[{'type':'BuiltinCommonInstructions::Standard','conditions':[{'type':{'value':'SceneJustBegins'},'parameters':['']}],'actions':[{'type':{'value':'EnableMetrics'},'parameters':['','no']}]},{'type':'BuiltinCommonInstructions::JsCode','inlineCode':code,'parameterObjects':'','useStrict':True,'eventsSheetExpanded':True}])
template.update(firstLayout='Atelier',layouts=[scene],objects=[],objectsGroups=[],variables=[],externalEvents=[],externalLayouts=[],eventsFunctionsExtensions=[],tests=[])
template['resources']['resources']=resources
p=template['properties']; p.update(name='Atlas M2-C',windowWidth=640,windowHeight=384,adaptGameResolutionAtRuntime=False,orientation='default',projectUuid=uid('project'),templateSlug='',latestCompilationDirectory='')
# Keep upstream editor/export terms; no attempt to remove required branding.
(out/'atelier.json').write_text(json.dumps(template,ensure_ascii=False,indent=2))
