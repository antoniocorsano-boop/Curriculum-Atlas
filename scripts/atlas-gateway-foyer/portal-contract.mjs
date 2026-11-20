// ATLAS-GATEWAY-01 — destinazioni esistenti; niente percorsi simulati.
export const PORTALS = Object.freeze([
  Object.freeze({id:"curricolo", label:"Curricolo", detail:"Struttura e obiettivi", href:"/curricolo/", x:-4.8,z:-1.0,yaw:-0.24}),
  Object.freeze({id:"esplora", label:"Esplora", detail:"Relazioni e connessioni", href:"/esplora/", x:-1.6,z:-2.7,yaw:-0.08}),
  Object.freeze({id:"percorsi", label:"Percorsi", detail:"Itinerari di apprendimento", href:"/percorsi/", x:1.6,z:-2.7,yaw:0.08}),
  Object.freeze({id:"esperienze", label:"Esperienze", detail:"Attività e mondi formativi", href:"/esperienze/", x:4.8,z:-1.0,yaw:0.24})
]);
export const FOYER_SCHEMA="atlas.gateway.foyer/v1";
export function verifyPortalContract(items=PORTALS){
  if(items.length!==4)throw Error("Il gateway richiede quattro destinazioni verificate");
  const ids=new Set(),urls=new Set();
  for(const p of items){
    if(!/^[a-z]+$/.test(p.id)||!/^\/[a-z]+\/$/.test(p.href)||ids.has(p.id)||urls.has(p.href))
      throw Error("Destinazione non valida o ripetuta");
    if(!p.label||!p.detail||![p.x,p.z,p.yaw].every(Number.isFinite))throw Error("Portale non valido");
    ids.add(p.id);urls.add(p.href);
  }
  return true;
}
verifyPortalContract();
