// Independent bounded raster oracle. No GPU-derived triangle or UV is used
// to construct candidates. Model vertex transform rounding, screen subpixel
// quantization, perspective interpolation and depth-buffer quantization.
export function rasterOracle({meshes,width,height,subpixelBits,depthBits,points}){
  const eps=2**-24,gamma=n=>n*eps/(1-n*eps);
  const I=(lo,hi)=>[lo,hi],add=(a,b)=>I(a[0]+b[0],a[1]+b[1]),neg=a=>I(-a[1],-a[0]);
  const sub=(a,b)=>add(a,neg(b));
  const mul=(a,b)=>{const v=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]];return I(Math.min(...v),Math.max(...v));};
  const div=(a,b)=>{if(b[0]<=0&&b[1]>=0)throw Error("interval division through zero");return mul(a,I(1/b[1],1/b[0]));};
  const contains=(a,x,t=0)=>Number.isFinite(x)&&x>=a[0]-t&&x<=a[1]+t;
  const hull=(a,b)=>I(Math.min(a[0],b[0]),Math.max(a[1],b[1]));
  const need=(x,m)=>{if(!x)throw Error(m);};
  need(Number.isInteger(subpixelBits)&&subpixelBits>=4&&subpixelBits<=16,"unsupported raster precision");
  need(Number.isInteger(depthBits)&&depthBits>=16&&depthBits<=32,"unsupported depth precision");
  // Full subpixel step covers both nearest and directed rounding; no fitted
  // tolerance from the observed failures. Depth comparison uses two LSBs.
  const step=2**-subpixelBits,depthStep=2/(2**depthBits-1);
  function dotRows(matrix,v){
    const out=[];
    for(let row=0;row<4;row++){
      const coeff=[0,1,2,3].map(k=>Math.fround(matrix[k*4+row]));
      let value=I(0,0),sum=0;
      for(let k=0;k<4;k++){
        const term=mul(I(coeff[k],coeff[k]),v[k]);value=add(value,term);
        sum+=Math.max(Math.abs(term[0]),Math.abs(term[1]));
      }
      const err=gamma(7)*sum+1e-30;
      out.push(I(value[0]-err,value[1]+err));
    }
    return out;
  }
  function projected(m,vertex){
    const v=[0,1,2].map(k=>I(m.positions[vertex*3+k],m.positions[vertex*3+k]));v.push(I(1,1));
    const clip=dotRows(m.projection,dotRows(m.modelView,v));
    need(clip[3][0]>0,"oracle requires positive clip w");
    const nx=div(clip[0],clip[3]),ny=div(clip[1],clip[3]),nz=div(clip[2],clip[3]);
    need(nz[0]>=-1&&nz[1]<=1,"near/far clipping not qualified");
    const x=mul(add(nx,I(1,1)),I(width/2,width/2)),y=mul(add(ny,I(1,1)),I(height/2,height/2));
    return {x:I(x[0]-step,x[1]+step),y:I(y[0]-step,y[1]+step),z:mul(add(nz,I(1,1)),I(.5,.5)),invW:div(I(1,1),clip[3])};
  }
  // Bilinear extrema of a signed edge at a fixed point occur at interval
  // corners. For area, evaluate all 64 possible triangle vertex corners.
  const corners=v=>[[v.x[0],v.y[0]],[v.x[0],v.y[1]],[v.x[1],v.y[0]],[v.x[1],v.y[1]]];
  const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
  function edge(a,b,p){
    let lo=Infinity,hi=-Infinity;
    for(const x of a)for(const y of b){const e=cross(x,y,p);lo=Math.min(lo,e);hi=Math.max(hi,e);}
    return I(lo,hi);
  }
  function area(a,b,c){
    let lo=Infinity,hi=-Infinity;
    for(const x of a)for(const y of b)for(const z of c){const e=cross(x,y,z);lo=Math.min(lo,e);hi=Math.max(hi,e);}
    return I(lo,hi);
  }
  const clip01=a=>I(Math.max(0,a[0]),Math.min(1,a[1]));
  const range=arr=>I(Math.min(...arr.map(a=>a[0])),Math.max(...arr.map(a=>a[1])));
  function candidate(t,p){
    const es=[edge(t.c[1],t.c[2],p),edge(t.c[2],t.c[0],p),edge(t.c[0],t.c[1],p)];
    let possible=null;
    for(const sign of [1,-1]){
      const ar=sign===1?t.area:neg(t.area),e=sign===1?es:es.map(neg);
      if(ar[1]<=0||e.some(v=>v[1]<0))continue;
      const definite=ar[0]>0&&e.every(v=>v[0]>0);
      // If projected area can cross zero, it is an ambiguous subpixel
      // primitive. A conservative convex hull is valid, but never definite.
      const b=ar[0]>0?e.map(v=>clip01(div(v,ar))):[I(0,1),I(0,1),I(0,1)];
      if(b.some(v=>v[0]>v[1]))continue;
      let depth=I(0,0),den=I(0,0),num=[I(0,0),I(0,0)];
      const inv=t.v.map(v=>v.invW);
      for(let k=0;k<3;k++){
        depth=add(depth,mul(b[k],t.v[k].z));
        const weight=mul(b[k],inv[k]);den=add(den,weight);
        if(t.uv)for(let j=0;j<2;j++)num[j]=add(num[j],mul(weight,I(t.uv[k][j],t.uv[k][j])));
      }
      const dz=range(t.v.map(v=>v.z));depth=I(Math.max(dz[0],depth[0]),Math.min(dz[1],depth[1]));
      let uv=null;
      if(t.uv){
        const invRange=range(inv);den=I(Math.max(den[0],invRange[0]),Math.min(den[1],invRange[1]));
        uv=[0,1].map(j=>{const r=range(t.uv.map(v=>I(v[j],v[j]))),q=div(num[j],den);return I(Math.max(r[0],q[0]),Math.min(r[1],q[1]));});
      }
      const one={id:t.id,face:t.face,definite,depth,uv,degenerate:ar[0]<=0};
      if(!possible)possible=one;
      else possible={...one,definite:false,depth:hull(possible.depth,one.depth),uv:uv?uv.map((v,j)=>hull(possible.uv[j],v)):null,degenerate:true};
    }
    return possible;
  }
  const triangles=[];
  let maxScreenUncertainty=0;
  for(const m of meshes){
    need(m.positions.length%9===0,"non-triangle geometry");
    for(let i=0;i<m.positions.length/3;i+=3){
      const v=[0,1,2].map(k=>projected(m,i+k)),c=v.map(corners);
      for(const a of v)maxScreenUncertainty=Math.max(maxScreenUncertainty,(a.x[1]-a.x[0])/2,(a.y[1]-a.y[0])/2);
      triangles.push({id:m.id,face:i/3,v,c,area:area(...c),uv:m.uv?[0,1,2].map(k=>[m.uv[(i+k)*2],m.uv[(i+k)*2+1]]):null,
        x:range(v.map(a=>a.x)),y:range(v.map(a=>a.y))});
    }
  }
  // Fail closed if transforms exceed a small subpixel envelope.
  need(maxScreenUncertainty<=step+.01,"projection uncertainty exceeds supported bound");
  function candidatesAt(p){
    const result=[];
    for(const t of triangles){
      if(!contains(t.x,p[0])||!contains(t.y,p[1]))continue;
      const c=candidate(t,p);if(c)result.push(c);
    }
    return result;
  }
  // Interpolation arithmetic tolerance accounts for float32 fragment varyings,
  // distinct from the original 0.01 RGB threshold. No adjustment per sample.
  const varyingEps=2e-6;
  function evaluate(c,observed){
    const definite=c.filter(t=>t.definite),winner=c.find(t=>t.id===observed.id&&t.face===observed.face);
    if(observed.id===0)return {ok:definite.length===0,reason:definite.length?"background hides definite triangle":"background"};
    if(!winner)return {ok:false,reason:"triangle outside independent projected coverage"};
    if(!contains(winner.depth,observed.depth,depthStep+varyingEps))return {ok:false,reason:"depth outside projected interval",winner};
    if(winner.uv&&(!observed.uv||winner.uv.some((v,i)=>!contains(v,observed.uv[i],varyingEps))))return {ok:false,reason:"UV outside perspective interval",winner};
    const nearer=definite.find(t=>t!==winner&&t.depth[1]+depthStep<winner.depth[0]-depthStep);
    if(nearer)return {ok:false,reason:"definite nearer triangle",winner,nearer};
    return {ok:true,reason:winner.definite?"definite":"subpixel-ambiguous",winner};
  }
  const stats={method:"independent-projected-interval-v1",subpixelBits,depthBits,step,depthStep,varyingEps,maxScreenUncertainty,triangles:triangles.length,points:points.length,bad:0,definite:0,ambiguous:0,background:0,degenerate:0,baked:0,negativeCanaries:{wrongFace:false,wrongUV:false,wrongDepth:false,falseBackground:false},failures:[]};
  const details=[];
  for(const p of points){
    const c=candidatesAt([p.x+.5,p.y+.5]),r=evaluate(c,p);
    if(!r.ok){stats.bad++;if(stats.failures.length<24)stats.failures.push({point:p,result:r,candidates:c.slice(0,12)});}
    else if(p.id===0)stats.background++;
    else if(r.winner.definite)stats.definite++;
    else stats.ambiguous++;
    if(r.winner?.degenerate)stats.degenerate++;
    if(p.id>0&&r.ok)stats.baked++;
    if(r.ok&&p.id>0&&r.winner.definite){
      if(!stats.negativeCanaries.wrongFace)stats.negativeCanaries.wrongFace=!evaluate(c,{...p,face:-1}).ok;
      if(!stats.negativeCanaries.wrongUV&&r.winner.uv){
        const wrong=r.winner.uv[0][1]+.01;
        if(wrong<=1)stats.negativeCanaries.wrongUV=!evaluate(c,{...p,uv:[wrong,p.uv[1]]}).ok;
      }
      if(!stats.negativeCanaries.wrongDepth){
        const wrong=r.winner.depth[0]-.01;
        if(wrong>=0)stats.negativeCanaries.wrongDepth=!evaluate(c,{...p,depth:wrong}).ok;
      }
      if(!stats.negativeCanaries.falseBackground)stats.negativeCanaries.falseBackground=!evaluate(c,{...p,id:0,face:-1}).ok;
    }
    if(p.legacyBad||p.legacyIdentityMismatch)details.push({x:p.x,y:p.y,id:p.id,face:p.face,legacyBad:p.legacyBad,legacyIdentityMismatch:p.legacyIdentityMismatch,result:r,candidateCount:c.length});
  }
  return {...stats,legacyDetails:details};
}
