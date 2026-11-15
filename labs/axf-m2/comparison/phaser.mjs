import {Game,Scene,AUTO,Scale} from "./vendor/phaser.esm.js";
class World extends Scene {
 preload(){this.load.tilemapTiledJSON("world","world.json");for(const n of ["table","river","bridge","piazza","quaderno","banco"])this.load.image(n,"assets/"+n+".png")}
 create(){
  const map=this.make.tilemap({key:"world"});
  for(const layer of ["environment","interactions"])for(const o of map.getObjectLayer(layer).objects){
   const image=this.add.image(o.x,o.y,o.name).setOrigin(0);
   if(layer==="interactions"){const a=o.properties.find(p=>p.name==="action").value;image.setInteractive();image.on("pointerup",()=>parent.axfSelect(a))}
  }
  parent.axfReady();
 }
}
new Game({type:AUTO,parent:"game",width:640,height:384,backgroundColor:"#aa8864",scale:{mode:Scale.FIT,autoCenter:Scale.CENTER_BOTH},scene:[World]});
