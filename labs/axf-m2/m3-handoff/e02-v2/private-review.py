"""Assemble a PRIVATE review copy from the qualified fixture export and the exact E02 master.
No download, deployment, or change to source or original. Requires Python 3.10+.
"""
import argparse, hashlib, json, pathlib, shutil, struct, zipfile
MASTER='509000e27fe51e7c3c3d336029039cf8c6bf52e79fdd0be3d7f722d5a1509eaa'
FIXTURE='c2c2d44f84988df57a32a820334d9f514ed47de9b07696289b2a1944481fb30d'
def sha(b): return hashlib.sha256(b).hexdigest()
def valid_name(name):
    p=pathlib.PurePosixPath(name)
    return bool(name) and not p.is_absolute() and '..' not in p.parts and '\\' not in name
def pack(root, output):
    root=pathlib.Path(root)
    files={p.relative_to(root).as_posix():p.read_bytes() for p in sorted(root.rglob('*')) if p.is_file() and not p.is_symlink()}
    assert 'index.html' in files and 'energy/model.mjs' in files and 'gdevelop/index.html' in files
    matches=[n for n,b in files.items() if sha(b)==FIXTURE and n.startswith('gdevelop/')]
    if len(matches)!=1: raise ValueError(f'Expected one exact fixture PNG in GDevelop export, got {matches}')
    if any(sha(b)==MASTER for b in files.values()): raise ValueError('Real E02 master must not be in public diagnostic archive')
    manifest={'schema':'axf.e02.fixture-export/v1','status':'SYNTHETIC_FIXTURE_ONLY','fixturePath':matches[0],'fixtureSha256':FIXTURE,'masterSha256':MASTER,'files':{n:sha(b) for n,b in files.items()}}
    with zipfile.ZipFile(output,'x',zipfile.ZIP_DEFLATED) as z:
        for n,b in files.items(): z.writestr('runtime/'+n,b)
        z.writestr('manifest.json',json.dumps(manifest,indent=2))
    print('Diagnostic runtime packed; no E02 master:',matches[0])
def assemble(archive, master, output):
    b=pathlib.Path(master).read_bytes()
    if sha(b)!=MASTER or b[:8]!=b'\x89PNG\r\n\x1a\n' or struct.unpack('>II',b[16:24])!=(1536,1024): raise ValueError('Exact master lock mismatch')
    out=pathlib.Path(output)
    if out.exists(): raise FileExistsError(out)
    with zipfile.ZipFile(archive) as z:
        m=json.loads(z.read('manifest.json'))
        if m.get('schema')!='axf.e02.fixture-export/v1' or m.get('status')!='SYNTHETIC_FIXTURE_ONLY' or m.get('fixtureSha256')!=FIXTURE or m.get('masterSha256')!=MASTER: raise ValueError('Manifest identity mismatch')
        files=m['files']; target=m['fixturePath']
        if not target.startswith('gdevelop/') or files.get(target)!=FIXTURE or list(files.values()).count(FIXTURE)!=1: raise ValueError('Fixture path mismatch')
        expected={'manifest.json',*('runtime/'+n for n in files)}
        if len(z.namelist())!=len(expected) or set(z.namelist())!=expected or not all(valid_name(n) for n in files): raise ValueError('Unexpected archive entries')
        data={n:z.read('runtime/'+n) for n in files}
        if any(sha(v)!=files[n] or sha(v)==MASTER for n,v in data.items()): raise ValueError('Runtime checksum mismatch')
        out.mkdir()
        try:
            for n,v in data.items():
                p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b if n==target else v)
            receipt={'schema':'axf.e02.private-review/v1','status':'ASSEMBLED_NOT_QUALIFIED','sourceArchiveSha256':sha(pathlib.Path(archive).read_bytes()),'replacedPath':target,'masterSha256':MASTER,'unchangedFiles':len(files)-1,'publicationAuthorized':False}
            (out/'private-review-receipt.json').write_text(json.dumps(receipt,indent=2))
        except Exception:
            shutil.rmtree(out);raise
    print('Private review assembled; browser qualification still required.')
if __name__=='__main__':
    p=argparse.ArgumentParser(); sub=p.add_subparsers(dest='mode',required=True)
    a=sub.add_parser('pack');a.add_argument('root');a.add_argument('output')
    a=sub.add_parser('assemble');a.add_argument('archive');a.add_argument('master');a.add_argument('output')
    args=p.parse_args()
    if args.mode=='pack': pack(args.root,args.output)
    else: assemble(args.archive,args.master,args.output)
