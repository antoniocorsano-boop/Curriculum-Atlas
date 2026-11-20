(()=>{
const cards=[...document.querySelectorAll('.portal')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const state=new Map();
for(const el of cards){
 const s={x:0,y:0,tx:0,ty:0,active:false,foc:false,frame:0};state.set(el,s);
 function draw(){
  if(reduced.matches){el.style.cssText=el.style.cssText.replace(/;?--rx:[^;]*|;?--ry:[^;]*|;?--grow:[^;]*|;?--lift:[^;]*|;?--halo:[^;]*|;?--brightness:[^;]*/g,'');s.frame=0;return;}
  s.x+=(s.tx-s.x)*.15;s.y+=(s.ty-s.y)*.15;
  const active=s.active||s.foc;
  el.style.setProperty('--rx',`${(-s.y*3).toFixed(3)}deg`);
  el.style.setProperty('--ry',`${(s.x*4).toFixed(3)}deg`);
  el.style.setProperty('--grow',active?'1.025':'1');
  el.style.setProperty('--lift',active?'-3px':'0px');
  el.style.setProperty('--brightness',active?'1.09':'1');
  el.style.setProperty('--halo',active?'7px':'0px');
  if(active||Math.abs(s.x)+Math.abs(s.y)>0.008){s.frame=requestAnimationFrame(draw);}else{s.frame=0;}
 }
 function request(){if(!s.frame&&!reduced.matches)s.frame=requestAnimationFrame(draw)}
 function reset(){s.active=false;s.tx=0;s.ty=0;request()}
 el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){s.active=true;request()}});
 el.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||reduced.matches)return;
  const r=el.getBoundingClientRect();
  // normalized local pointer [-1, 1], clamped even while transform moves
  s.tx=Math.max(-1,Math.min(1,2*(e.clientX-r.left)/r.width-1));
  s.ty=Math.max(-1,Math.min(1,2*(e.clientY-r.top)/r.height-1));
  s.active=true;request();
 });
 el.addEventListener('pointerleave',reset);
 el.addEventListener('focus',()=>{s.foc=true;s.tx=.24;s.ty=-.2;request()});
 el.addEventListener('blur',()=>{s.foc=false;reset()});
 el.addEventListener('pointercancel',reset);
 el.addEventListener('click',()=>{
  document.getElementById('live').textContent=`Portale selezionato: ${el.dataset.name} · prova, nessun collegamento attivato`;
  if(!reduced.matches&&s.active===false){s.active=true;request();setTimeout(()=>{s.active=false;s.tx=0;s.ty=0;request()},360)}
 });
 el.addEventListener('keydown',e=>{if(e.key==='Escape'){el.blur();reset()}});
 reduced.addEventListener?.('change',()=>{reset()});
 }
})();
