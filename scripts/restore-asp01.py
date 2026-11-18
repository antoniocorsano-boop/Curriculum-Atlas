#!/usr/bin/env python3
"""Restore exact native build inputs from a versioned ASP-01 package, offline."""
import argparse, hashlib, io, json, pathlib, tempfile, zipfile

LOCK = 'd2b9f3e944b3d746c0571eb65fb291a4f0ef31aea7769b7237063c12f49b862e'
SOURCES = {
 'master': ('archives/14431658842-PR111-master.zip','485ccce1129920017a04acc737a581693289950eb250fda2b5fa1e524e8f0d8b'),
 'base': ('archives/14413232678-C3.2.zip','ecc9522d03d802668343bf87a387fa4b5e353fa40b2e4f266e18e9ab25d6383a'),
 'r2': ('archives/14416938462-R2.zip','84f1786ee98dac231f0d8fde0dd34bd1d1724f7ef707c1257b4fc824f3ade3ed'),
}

def digest(b): return hashlib.sha256(b).hexdigest()
def require(ok, why):
    if not ok: raise ValueError(why)
def restore(package, output):
    require(not output.exists(), 'Output already exists')
    require(digest(package.read_bytes()) == LOCK, 'Package hash mismatch')
    with zipfile.ZipFile(package) as z:
        manifest=json.loads(z.read('manifest.json'))
        require(manifest['version']=='1.0.0-draft.1' and manifest['studentAuthorized'] is False and manifest['publishable'] is False,'Package boundary')
        entries={e['path']:e for e in manifest['entries']}
        archives={}
        for key,(name,sha) in SOURCES.items():
            b=z.read(name); require(digest(b)==sha and len(b)==entries[name]['bytes'],name)
            archives[key]=zipfile.ZipFile(io.BytesIO(b))
        files={}
        for info in archives['master'].infolist():
            p=pathlib.PurePosixPath(info.filename)
            require(not p.is_absolute() and '..' not in p.parts and '\\' not in info.filename,'Unsafe member')
            if not info.is_dir():
                target='master-transport/'+info.filename
                require(target not in files,'Duplicate member')
                files[target]=archives['master'].read(info)
        files['ambient.hdr']=archives['base'].read('atlas-c32/assets/kloppenheim_03.hdr')
        files['master-r2/four-stars.glb']=archives['r2'].read('four-stars.glb')
        runtime={'master-transport/library-'+k+'.glb':'scene/01-architecture/library-'+k+'.glb' for k in ['shell','scenography','cupola','portals','bays']}
        runtime.update({'master-r2/four-stars.glb':'scene/05-stars/four-stars.glb','master-transport/atlas-sky-clouds.png':'scene/04-lighting/atlas-sky-clouds.png','ambient.hdr':'scene/04-lighting/kloppenheim_03.hdr'})
        for dest,src in runtime.items():
            b=files[dest]; entry=entries[src]
            require(len(b)==entry['bytes'] and digest(b)==entry['sha256'] and b==z.read(src),'Runtime mismatch '+dest)
        for a in archives.values(): a.close()
    output.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(dir=output.parent) as td:
        staging=pathlib.Path(td)/'restored'; staging.mkdir()
        for name,b in files.items():
            target=staging/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(b)
        result={'status':'PASS','packageSha256':LOCK,'restoredFiles':len(files),'runtimeAssets':len(runtime),'runtimeBytes':sum(len(files[x]) for x in runtime),'studentAuthorized':False,'publishable':False,'files':[{'path':n,'bytes':len(b),'sha256':digest(b)} for n,b in sorted(files.items())]}
        (staging/'restore-receipt.json').write_text(json.dumps(result,indent=2)+'\n')
        staging.rename(output)
    return result
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('package',type=pathlib.Path);p.add_argument('output',type=pathlib.Path);a=p.parse_args();print(json.dumps(restore(a.package,a.output),indent=2))
