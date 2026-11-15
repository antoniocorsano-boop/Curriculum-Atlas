import {Game,Scene,AUTO,Scale} from "./vendor/phaser.esm.js";
const actions={"inspect-square":"La luce si è affievolita. Causa non nota.","inspect-notebook":"Confronto virtuale: stesso servizio, ingressi differenti.","open-bench":"Banco virtuale: prova le lampade."};
let selection=null;const shapes=new Map();
function select(action){if(!Object.hasOwn(actions,action))throw Error("Unknown action");selection=action;document.getElementById("status").textContent=actions[action];for(const [key,shape] of shapes)shape.setStrokeStyle(key===selection?5:2,key===selection?0xf2cb65:0x205e55);}
for(const b of document.querySelectorAll("button[data-action]"))b.addEventListener("click",()=>select(b.dataset.action));
class World extends Scene {
 preload(){this.load.tilemapTiledJSON("world","world.json")}
 create(){
 const map=this.make.tilemap({key:"world"});
 const scenery=map.getObjectLayer("environment").objects;
 const colors={table:0xe6cca0,river:0x679cb5,bridge:0xb58659};
 for(const o of scenery)this.add.rectangle(o.x,o.y,o.width,o.height,colors[o.name]).setOrigin(0);
 const zones=map.getObjectLayer("interactions").objects;
 if(zones.length!==3)throw Error("Wrong object count");
 for(const o of zones){
 const a=o.properties.find(p=>p.name==="action").value;
 if(!Object.hasOwn(actions,a)||shapes.has(a))throw Error("Wrong binding");
 const shape=this.add.rectangle(o.x,o.y,o.width,o.height,0xf8f0dc).setOrigin(0).setStrokeStyle(2,0x205e55).setInteractive();
 shape.on("pointerdown",()=>select(a));shapes.set(a,shape);
 this.add.text(o.x+o.width/2,o.y+o.height/2,o.name,{fontSize:"22px",color:"#203c41"}).setOrigin(.5);
 }
 document.getElementById("game").dataset.ready="true";
 }
}
new Game({type:AUTO,parent:"game",width:640,height:384,backgroundColor:"#aa8864",scale:{mode:Scale.FIT,autoCenter:Scale.CENTER_BOTH},scene:[World]});
