import hashlib,json,sys,copy
from pathlib import Path
from bs4 import BeautifulSoup
from html import escape

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def fragment(s):return BeautifulSoup(s,'html.parser')
def p(s):return '<p>'+escape(s)+'</p>'
def replace_contents(tag,html):
    tag.clear()
    for node in list(fragment(html).contents):tag.append(node)
def build(book_path,library_path,data_path,out_book,out_library):
    if sha(book_path)!='e9c55945eafff4d2d9cb3cddb506839a65ade34b7ba53b18bc62b6b17d671cfc':raise ValueError('Wrong original edition')
    if sha(library_path)!='839a3de00ae8644227fc014d06fea5025fb5b9cd20b29997d73b56f24672bb3c':raise ValueError('Wrong F2 baseline')
    data=json.loads(data_path.read_text());assert data['studentAuthorized'] is False
    book=fragment(book_path.read_text());lib=fragment(library_path.read_text())
    original_imgs=[x['src'] for x in book.select('img')]
    for soup,prefix in [(book,''),(lib,'libro-')]:
        def get(id):return soup.find(id=prefix+id)
        root=soup if not prefix else soup.select_one('#libro')
        root.select_one('.lead' if not prefix else '.reader-lead').string=data['lead']
        root.select_one('.notice' if not prefix else '.reader-status').string='Edizione di revisione docente · v0.5 · Non autorizzata alla distribuzione.'
        for ch in data['chapters']:
            sec=get(ch['id']);text=''.join(map(p,ch['paragraphs']))
            if 'poem' in ch:text+='<blockquote class="poesia">'+'<br>'.join(map(escape,ch['poem']))+'</blockquote>'+''.join(map(p,ch['after']))
            replace_contents(sec.select_one('.prose'),text)
        model=data['model']; rows=model['rows']
        for row in rows:
            assert row['input']==row['useful']+row['thermal'] and row['efficiencyPercent']==100*row['useful']/row['input']
        assert len({r['useful'] for r in rows})==1
        # Accessible cards, not a wide table at enlarged text.
        cards=''.join('<div><h3>Lampada '+r['lamp']+'</h3><dl>'+''.join(f'<dt>{label}</dt><dd>{r[key]} {unit}</dd>' for label,key,unit in [('Energia in ingresso','input','J'),('Energia luminosa utile','useful','J'),('Trasferimento termico','thermal','J'),('Quota utile','efficiencyPercent','%')])+'</dl></div>' for r in rows)
        m=get('mappa');old=m.select_one('.outputs');new=fragment('<div class="outputs f3-model">'+cards+'</div>').div;old.insert_after(new);new.insert_before(*list(fragment('<h3>Confronta due lampade</h3>'+p(model['description'])).contents));new.insert_after(fragment(p('Bilancio: 100 = 20 + 80 J; 50 = 20 + 30 J. Quota utile = energia utile / energia in ingresso × 100. Nel modello B richiede metà dell’energia elettrica per lo stesso effetto utile. La luce assorbita dall’ambiente può poi trasformarsi in energia termica.')).p)
        g=data['guide']; guide='<span class="eyebrow">Guida docente</span><h2>Dalla lettura alla spiegazione</h2>'+p(g['audience'])+'<h3>Obiettivi</h3><ul>'+''.join('<li>'+escape(x)+'</li>' for x in g['objectives'])+'</ul><h3>Prerequisiti e durata</h3>'+p(g['prerequisites'])+p(g['duration'])+'<h3>Attività differenziate</h3>'+''.join('<h4>'+escape(a['title'])+'</h4>'+p(a['text']) for a in g['activities'])+'<h3>Evidenze attese</h3>'+p(g['evidence'])+'<h3>Rubrica di osservazione</h3>'+p('Quattro livelli descrittivi, dal lavoro con supporto alla motivazione autonoma. Non è una conversione automatica in voto.')
        labels=['In via di prima acquisizione','Base','Intermedio','Avanzato']
        for row in g['rubric']:
            guide+='<h4>'+escape(row['criterion'])+'</h4><dl class="f3-rubric">'+''.join('<dt>'+escape(l)+'</dt><dd>'+escape(t)+'</dd>' for l,t in zip(labels,row['levels']))+'</dl>'
        guide+='<h3>Raccordo e sicurezza</h3>'+p(g['arena'])+p(g['safety']);replace_contents(get('docente'),guide)
        nav=root.select_one('.index' if not prefix else '.reader-index nav'); nav.append(fragment('<a href="#'+prefix+'docente">Guida docente</a>'))
        # add visible link after map for teacher; keep optional and outside narrative
        get('mappa').append(fragment('<p><a href="#'+prefix+'docente">Apri la guida docente</a></p>'))
        soup.style.append('\n.f3-model dl,.f3-rubric{margin:0}.f3-model dt,.f3-rubric dt{font-weight:700;margin-top:.5rem}.f3-model dd,.f3-rubric dd{margin:0 0 .4rem;overflow-wrap:anywhere}.f3-model h3{margin:0 0 .5rem}.f3-rubric{padding:12px;border:1px solid #c9c4b8;border-radius:8px;background:#fff} #docente li,#libro-docente li{margin-bottom:.5rem}\n')
        assert [i['src'] for i in root.select('img')]==original_imgs
    for el in lib.select('#storie .feature, #storie .feature *'):
        if el.string and 'Edizione 0.4' in el.string:el.string=el.string.replace('Edizione 0.4','Edizione 0.5')
    out_book.write_text(str(book));out_library.write_text(str(lib))
if __name__=='__main__':build(*map(Path,sys.argv[1:]))
