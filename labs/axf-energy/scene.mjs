import {Game,Scene,AUTO,Scale} from "./vendor/phaser.esm.js";
import {initial,act,measure} from "./model.mjs";
let state=initial(), view;
const ids=["A","B","C"];
const reasons=[["same-light","Stessa luce, meno ingresso"],["thermal-loss","Minore energia termica"],["input-only","Solo il valore in ingresso"]];
function dispatch(action){state=act(state,action);render();view?.sync();}
function buttons(parent,values,action,selected,disabled){
  const el=document.getElementById(parent);
  if(!el.children.length)for(const [id,label] of values){const b=document.createElement("button");b.type="button";b.textContent=label;b.dataset.id=id;b.addEventListener("click",()=>dispatch(action(id)));el.append(b)}
  for(const b of el.children){b.disabled=disabled;b.setAttribute("aria-pressed",String(b.dataset.id===selected));}
}
function render(){
  buttons("predictions",ids.map(x=>[x,"Prevedo "+x]),id=>({type:"predict",id}),state.prediction,!!state.trials.length);
  buttons("tests",ids.map(x=>[x,"Prova "+x]),id=>({type:"test",id}),state.active,!state.prediction);
  buttons("revisions",ids.map(x=>[x,"Scelgo "+x]),id=>({type:"revise",id}),state.revision,state.trials.length!==3);
  buttons("reasons",reasons,id=>({type:"explain",reason:id}),state.explanation,!state.revision);
  const m=state.active&&measure(state.active);
  document.getElementById("status").textContent=m?("Lampada "+m.id+": "+m.input+" J in ingresso, "+m.useful+" J luce, "+m.thermal+" J calore, efficienza "+m.efficiency+"%."):state.prediction?"Ipotesi: "+state.prediction+". Prova una lampada.":"Scegli prima un'ipotesi.";
  const body=document.getElementById("trials");body.replaceChildren();
  for(const id of state.trials){const m=measure(id);const tr=document.createElement("tr");for(const v of [id,m.input,m.useful,m.thermal,m.efficiency]){const cell=document.createElement("td");cell.textContent=String(v);tr.append(cell)}body.append(tr)}
  document.getElementById("reflection").textContent=state.explanation?"Ipotesi iniziale: "+state.prediction+". Scelta rivista: "+state.revision+". Criterio: "+reasons.find(r=>r[0]===state.explanation)[1]+". Motiva al docente con le misure.":state.trials.length===3?"Hai tre misure: rivedi la tua ipotesi.":"Confronta tutte e tre le lampade.";
}
document.getElementById("reset").addEventListener("click",()=>dispatch({type:"reset"}));
class Bench extends Scene{
  constructor(){super("Bench")}
  create(){
    view={sync:()=>this.sync()};this.cameras.main.setBackgroundColor("#10263a");
    this.add.text(20,16,"SORGENTI VIRTUALI",{fontSize:"15px",color:"#b8dedf"});
    this.add.rectangle(300,241,172,100,0x173d50).setStrokeStyle(3,0x88d9c9);
    this.add.text(300,245,"STAZIONE",{fontSize:"19px",color:"#e5f6f4"}).setOrigin(.5);
    this.add.line(0,0,386,241,456,241,0x9ab7c5).setOrigin(0);
    this.lamp=this.add.circle(492,242,32,0x43545b).setStrokeStyle(4,0xcda65c);
    this.add.rectangle(492,280,34,12,0x9bb7c5);
    this.lampLabel=this.add.text(492,298,"Luce utile",{fontSize:"17px",color:"#e8f1f5"}).setOrigin(.5);
    this.labels=[];this.tokens=[];
    for(const [i,id] of ids.entries()){
      const x=100+200*i;
      const token=this.add.rectangle(x,102,112,86,0x2b5b76).setStrokeStyle(3,0x87bdce).setInteractive();
      const label=this.add.text(x,102,id,{fontSize:"34px",color:"#ffffff"}).setOrigin(.5).setDepth(2);
      this.input.setDraggable(token);this.tokens.push(token);this.labels.push(label);
      token.on("drag",(_p,dx,dy)=>{if(!state.prediction)return;token.setPosition(dx,dy);label.setPosition(dx,dy)});
      token.on("dragend",()=>{const near=Math.abs(token.x-300)<90&&Math.abs(token.y-241)<65;token.setPosition(x,102);label.setPosition(x,102);if(near)dispatch({type:"test",id})});
    }
    this.readout=this.add.text(20,307,"Formula un'ipotesi",{fontSize:"15px",color:"#d1e8f0"});
    this.flows=[["Ingresso",0x8ab3d2],["Luce utile",0xe1b95d],["Calore",0xbb7443]].map(([label,color],i)=>{
      const y=338+i*24;
      this.add.text(20,y,label,{fontSize:"16px",color:"#e8f1f5"}).setOrigin(0,.5);
      this.add.rectangle(144,y,290,14,0x31495b).setOrigin(0,.5);
      const bar=this.add.rectangle(144,y,290,14,color).setOrigin(0,.5);
      const value=this.add.text(450,y,"—",{fontSize:"17px",color:"#e8f1f5"}).setOrigin(0,.5);
      return {bar,value};
    });
    this.sync();document.getElementById("game").dataset.ready="true";
  }
  sync(){
    if(!this.readout)return;
    const m=state.active&&measure(state.active);
    this.readout.setText(m?"Lampada "+m.id+" · bilancio energetico":state.prediction?"Trascina una lampada nella stazione":"Formula un'ipotesi");
    this.lamp.setFillStyle(m?0xffdf8b:0x43545b);
    this.lampLabel.setText(m?"20 J luce":"Luce utile");
    const values=m?[m.input,m.useful,m.thermal]:[0,0,0];
    for(const [i,item] of this.flows.entries()){
      item.bar.setDisplaySize(values[i]*2.9,14);
      item.value.setText(m?values[i]+" J":"—");
    }
    for(const [i,t] of this.tokens.entries())t.setFillStyle(state.active===ids[i]?0x287f71:0x2b5b76);
  }
}
render();new Game({type:AUTO,width:600,height:400,parent:"game",scale:{mode:Scale.FIT,autoCenter:Scale.CENTER_BOTH},scene:[Bench],backgroundColor:"#10263a"});
