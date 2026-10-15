/* ---------- Workout Quest cast: pixel sprites + scenes ---------- */
const SKINS=["#F6D5BC","#E7B48C","#C98D60","#9A633F","#6A4128"];
const HAIRS=["#2A1D15","#6B4024","#A3662E","#D9B66B","#141414"];
const STYLES=["Spiky","Short","Buzz","Curly","Bun"];
const OUTFITS={
  tee:{top:"#C9CED6",trim:"#A9AFB8",bottom:"#585D66",cover:"tee"},
  tank:{top:"#F2F3F5",trim:"#D5D9DF",bottom:"#30343C",cover:"tank",stripe:"#8E97A3",extras:["wristbands"]},
  runner:{top:"#F2F3F5",trim:"#D5D9DF",bottom:"#3E7D5A",cover:"tank",stripe:"#E8F2EC",extras:["wristbands"]},
  hoodie:{top:"#5E6874",trim:"#434A54",bottom:"#2B2F38",cover:"hoodie"},
  stringer:{top:"#1E1F26",trim:"#E8B33C",bottom:"#3A3F4B",cover:"stringer"},
  singlet:{top:"#B3262D",trim:"#F2F2F2",bottom:"#B3262D",cover:"singlet"},
  track:{top:"#2D3E73",trim:"#22305C",bottom:"#2D3E73",cover:"track",pants:"#2D3E73",stripe:"#F2F3F5"},
  crop:{top:"#2E9E6A",trim:"#23805A",bottom:"#2F3E66",cover:"crop",pants:"#2F3E66"},
  aerobic:{top:"#8E44D9",trim:"#C04BD8",bottom:"#E94BA8",cover:"crop",pants:"#E94BA8"}
};
const INK="#1B1E26";
function shadeOf(hex,amt){const v=parseInt(hex.slice(1),16);let r=v>>16,g=v>>8&255,b=v&255;r=Math.max(0,Math.round(r*(1-amt)));g=Math.max(0,Math.round(g*(1-amt)));b=Math.max(0,Math.round(b*(1-amt)));return "#"+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
function makeCanvas(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;return c}
function outline(cv){
  const x=cv.getContext("2d"), W=cv.width, H=cv.height, img=x.getImageData(0,0,W,H), d=img.data, op=i=>d[i*4+3]>0, out=[];
  for(let yy=0;yy<H;yy++) for(let xx=0;xx<W;xx++){const i=yy*W+xx; if(op(i)) continue;
    if((xx>0&&op(i-1))||(xx<W-1&&op(i+1))||(yy>0&&op(i-W))||(yy<H-1&&op(i+W))) out.push(i)}
  for(const i of out){d[i*4]=0x15;d[i*4+1]=0x17;d[i*4+2]=0x1d;d[i*4+3]=255}
  x.putImageData(img,0,0); return cv;
}

const SPR_W=40, SPR_H=48;
const sprCanvases={};
function sprCanvas(slot){return sprCanvases[slot]||(sprCanvases[slot]=makeCanvas(SPR_W,SPR_H))}

/* o: {m,f,pose,frame,blink,expr,skin,hair|hairColor,style,outfit|outfitDef,head,gear,extras,brows,shoe,sweat,silhouette} */
function drawSprite(o,slot="hero"){
  const cv=sprCanvas(slot), x=cv.getContext("2d"); x.clearRect(0,0,SPR_W,SPR_H);
  const P=(a,b,w,h,c)=>{if(w<=0||h<=0)return;x.fillStyle=c;x.fillRect(a,b,w,h)};
  const cx=20, skin=o.skinColor||SKINS[o.skin]||SKINS[1], sk2=shadeOf(skin,.16), hair=o.hairColor||HAIRS[o.hair]||HAIRS[1];
  const O=o.outfitDef||OUTFITS[o.outfit]||OUTFITS.tee, top=O.top, top2=shadeOf(O.top,.22);
  const extras=[...(O.extras||[]),...(o.extras||[])];
  const m=o.m, f=o.f, fr=o.frame%2, pose=o.pose;
  const Y = pose==="cheer"&&fr ? -2 : 0;
  const breathe = (pose==="idle"||pose==="sleepy"||pose==="sad") && fr ? 1 : 0;
  const slump = pose==="sleepy"||pose==="sad" ? 1 : 0;
  const U = Y - breathe;
  const sw=14+m*2, ww=Math.min(sw+3, 10+f*2), at=3+Math.floor(m/2), lw=4+Math.floor(m/3);
  const edgeL=cx-Math.floor(sw/2), edgeR=edgeL+sw;
  const lax=edgeL-at, rax=edgeR, sy=19+U;
  const hx=cx-5, hy=6+U+slump;
  const sleeveFull=O.cover==="hoodie"||O.cover==="track", sleeve=O.cover==="tee"?4:0;
  const armCol=(row)=> sleeveFull||row<sleeve ? top : skin;
  const vArm=(ax,ay,h,shadeCol=true)=>{for(let r=0;r<h;r++) P(ax,ay+r,at,1,armCol(r)); if(shadeCol&&!sleeveFull) P(ax,ay+sleeve,1,Math.max(0,h-sleeve),sk2); if(O.cover==="track") P(ax+(ax<cx?0:at-1),ay,1,h,O.stripe)};
  const hand=(ax,ay,w=at,h=2)=>{P(ax,ay,w,h,skin); if(o.gear==="wraps") P(ax,ay-1,w,1,"#D9483B"); else if(extras.includes("wristbands")) P(ax,ay-1,w,1,"#2BB5B0")};
  const shoe=o.shoe||"#F1F2F4";

  if(O.cover==="hoodie") P(cx-6,hy+8,12,5,O.trim);
  // ponytail behind
  const st=typeof o.style==="string"?o.style:(STYLES[o.style]||"Spiky");
  if(st==="Ponytail"){P(hx+9,hy+1,3,3,hair);P(hx+11,hy+3,3,7,hair);P(hx+12,hy+10,2,2,hair)}
  if(st==="BigCurly"){P(hx-3,hy-2,16,13,hair);P(hx-4,hy+2,2,8,hair);P(hx+12,hy+2,2,8,hair)}

  // legs + shoes
  const legL=cx-1-lw, legR=cx+1, legCol=O.pants||skin, legSh=O.pants?shadeOf(O.pants,.2):sk2;
  P(legL,35+Y,lw,8,legCol); P(legR,35+Y,lw,8,legCol); P(legL,35+Y,1,8,legSh); P(legR,35+Y,1,8,legSh);
  if(O.cover==="track"){P(legL,35+Y,1,8,O.stripe);P(legR+lw-1,35+Y,1,8,O.stripe)}
  if(extras.includes("warmers")){P(legL-1,40+Y,lw+1,3,"#F2D33C");P(legR,40+Y,lw+1,3,"#F2D33C")}
  else if(!O.pants){P(legL,41+Y,lw,2,"#F1F2F4");P(legR,41+Y,lw,2,"#F1F2F4")}
  P(legL-1,43+Y,lw+1,2,shoe); P(legR,43+Y,lw+1,2,shoe); P(legL-1,45+Y,lw+1,1,"#8E97A3"); P(legR,45+Y,lw+1,1,"#8E97A3");
  // shorts
  const shw=Math.max(ww,2*lw+3), shx=cx-Math.floor(shw/2);
  P(shx,30+Y,shw,6,O.bottom); P(cx,34+Y,1,2,shadeOf(O.bottom,.35));
  if(O.stripe&&!O.pants){P(shx,30+Y,1,6,O.stripe);P(shx+shw-1,30+Y,1,6,O.stripe)}
  // torso
  const t0=19+U, rows=(30+Y)-t0;
  for(let r=0;r<rows;r++){
    const k=rows>1?r/(rows-1):0;
    let w=Math.round(sw+(ww-sw)*k); if(k>=.5&&k<=.92) w+=Math.max(0,f-1);
    const xl=cx-Math.floor(w/2), yy=t0+r;
    P(xl,yy,w,1,skin); P(xl,yy,1,1,sk2);
    const cov=O.cover;
    if(cov==="tee"||cov==="hoodie"||cov==="track"){P(xl,yy,w,1,top);P(xl,yy,1,1,top2); if(r===0) P(cx-1,yy,2,1,cov==="track"?O.trim:skin); if(cov==="track") P(cx,yy,1,1,O.trim)}
    else if(cov==="tank"||cov==="singlet"){
      if(r<=2){P(xl+2,yy,w-4,1,top); if(r<=1) P(cx-2,yy,4,1,skin)} else {P(xl,yy,w,1,top);P(xl,yy,1,1,top2)}
      if(cov==="singlet"&&r===5) P(xl,yy,w,1,O.trim);
    } else if(cov==="stringer"){
      if(r<=5){P(cx-4,yy,1,1,top);P(cx+3,yy,1,1,top)} else {P(xl+1,yy,w-2,1,top)}
      if(r===rows-1) P(xl+1,yy,w-2,1,O.trim);
    } else if(cov==="crop"){
      if(r<=1){P(cx-4,yy,1,1,top);P(cx+3,yy,1,1,top)} else if(r<=6){P(xl+1,yy,w-2,1,top); if(r===6) P(xl+1,yy,w-2,1,O.trim)}
    }
  }
  // muscle definition
  if(m>=2&&(O.cover==="tank"||O.cover==="stringer")){P(cx-4,t0+4,3,1,shadeOf(O.cover==="tank"?top:skin,.12));P(cx+1,t0+4,3,1,shadeOf(O.cover==="tank"?top:skin,.12))}
  if(O.cover==="hoodie"){P(cx-2,t0,1,3,"#E6E8EC");P(cx+1,t0,1,3,"#E6E8EC")}
  if(O.cover==="tee") P(cx-Math.floor(ww/2),29+Y,ww,1,O.trim);
  if(extras.includes("towel")){P(cx-5,t0,2,7,"#F4F5F7");P(cx+3,t0,2,7,"#F4F5F7");P(cx-5,t0,10,1,"#F4F5F7");P(cx-5,t0+6,2,1,"#D5D9DF");P(cx+3,t0+6,2,1,"#D5D9DF")}
  if(extras.includes("whistle")){P(cx-3,t0,1,4,"#D9483B");P(cx+2,t0,1,4,"#D9483B");P(cx-3,t0+4,6,1,"#D9483B");P(cx-1,t0+5,2,2,"#E8B33C")}
  if(o.gear==="belt"){const bw=Math.max(ww,10)+1;P(cx-Math.floor(bw/2),28+Y,bw,2,"#5B3A22");P(cx-1,28+Y,2,2,"#E8B33C")}

  // arms
  const peak=1+Math.floor(m/2);
  const idleL=()=>{vArm(lax,sy,11);hand(lax,sy+11)};
  const idleR=()=>{vArm(rax,sy,11);hand(rax,sy+11)};
  if(pose==="cheer"){
    vArm(lax-1,sy-5,6,false); vArm(lax-2,sy-10,5,false); hand(lax-2,sy-12);
    vArm(rax+1,sy-5,6,false); vArm(rax+2,sy-10,5,false); hand(rax+2,sy-12);
  } else if(pose==="flex"){
    for(const side of [-1,1]){
      const ux= side<0? lax-4 : rax, fx= side<0? lax-4 : rax+4-at+1;
      P(ux,sy,at+4,at, sleeveFull?top:skin); if(sleeve) P(side<0?lax-1:rax,sy,Math.min(at+1,4),at,top);
      P(fx,sy-6,at,6,sleeveFull?top:skin); hand(fx,sy-8);
      if(!sleeveFull) P(side<0? lax-3 : rax+1,sy-peak,3,peak,skin);
    }
  } else if(pose==="lift"){
    const barY= fr? hy+9 : hy-5, ah= sy-barY-1;
    vArm(lax+(fr?0:-1),barY+1,ah,false); vArm(rax+(fr?0:1),barY+1,ah,false);
    const bx=lax-7, bw=(rax+at+7)-bx;
    P(bx,barY,bw,1,"#9AA3AE");
    P(bx,barY-3,2,7,"#3A3F49"); P(bx+2,barY-2,1,5,"#555C68");
    P(bx+bw-2,barY-3,2,7,"#3A3F49"); P(bx+bw-3,barY-2,1,5,"#555C68");
  } else if(pose==="eat"||pose==="drink"){
    idleL();
    vArm(rax,sy,5); vArm(rax-1,sy-4,5,false); hand(cx+3,hy+8,3,2);
    if(pose==="eat"){P(cx+3,hy+4,4,4,"#B8732E");P(cx+4,hy+4,2,1,"#D99A55");P(cx+7,hy+7,2,2,"#F2F2F2")}
    else {P(cx+3,hy+2,3,7,"#8FD3F4");P(cx+3,hy+2,1,7,"#5DB4E0");P(cx+3,hy+1,3,1,"#F2F3F5")}
  } else if(pose==="highfive"||pose==="wave"||pose==="point"){
    idleL();
    const wx = pose==="wave"&&fr ? 1 : 0;
    vArm(rax+1+wx,sy-8,9,false); P(rax+wx,sy-12,at+2,4,skin); P(rax+wx,sy-13,1,1,skin); P(rax+2+wx,sy-13,1,1,skin); P(rax+4+wx,sy-13,1,1,skin);
  } else {
    idleL(); idleR();
  }
  // held extras (idle-ish arms)
  if(extras.includes("clipboard")&&!["cheer","flex","lift","highfive","wave","point"].includes(pose)){P(rax-1,sy+5,6,8,"#8A5A2B");P(rax,sy+6,4,6,"#F4F5F7");P(rax,sy+7,3,1,"#9AA3AE");P(rax,sy+9,3,1,"#9AA3AE");P(rax+1,sy+4,2,2,"#9AA3AE")}
  if((extras.includes("bottle")||o.gear==="shaker")&&!["cheer","flex","lift","eat","drink","highfive","wave","point"].includes(pose)){P(rax+at,sy+7,3,6,"#8FD3F4");P(rax+at,sy+7,3,1,"#F2F3F5");P(rax+at,sy+8,1,5,"#5DB4E0")}

  // head
  P(hx,hy,10,10,skin); P(hx+9,hy+1,1,9,sk2); P(hx-1,hy+4,1,2,skin); P(hx+10,hy+4,1,2,sk2);
  P(cx-2,hy+10,4,2,skin); P(cx-2,hy+10,1,2,sk2);
  if(o.jowls){P(hx,hy+7,1,3,sk2);P(hx+9,hy+7,1,3,sk2)}
  // hair
  if(st==="Spiky"){P(hx,hy-1,10,3,hair);P(hx-1,hy,1,4,hair);P(hx+10,hy,1,3,hair);P(hx+1,hy-3,2,2,hair);P(hx+4,hy-4,2,3,hair);P(hx+7,hy-3,2,2,hair);P(hx+9,hy-2,2,2,hair);P(hx,hy+2,2,1,hair);P(hx+3,hy+2,2,1,hair)}
  else if(st==="Short"){P(hx,hy-1,10,3,hair);P(hx-1,hy,1,4,hair);P(hx+10,hy,1,4,hair);P(hx,hy+2,3,1,hair)}
  else if(st==="Buzz"){P(hx+1,hy-1,8,1,hair);P(hx,hy,10,1,hair);P(hx-1,hy+1,1,2,hair);P(hx+10,hy+1,1,2,hair)}
  else if(st==="Curly"){for(let i=0;i<6;i++) P(hx-1+i*2,hy-2+(i%2),3,3,hair); P(hx-1,hy,12,2,hair);P(hx-1,hy+2,1,3,hair);P(hx+10,hy+2,1,3,hair)}
  else if(st==="Bun"){P(hx,hy-1,10,2,hair);P(hx+3,hy-4,4,3,hair);P(hx-1,hy,1,3,hair);P(hx+10,hy,1,3,hair)}
  else if(st==="Ponytail"){P(hx,hy-1,10,3,hair);P(hx-1,hy,1,5,hair);P(hx+10,hy,1,3,hair);P(hx+1,hy+2,4,1,hair)}
  else if(st==="Gray"){P(hx+1,hy-1,8,2,hair);P(hx-1,hy+1,2,5,hair);P(hx+9,hy+1,2,5,hair);P(hx,hy,2,2,hair);P(hx+8,hy,2,2,hair)}
  else if(st==="BigCurly"){P(hx,hy-1,10,3,hair);P(hx-1,hy,2,7,hair);P(hx+9,hy,2,7,hair)}
  // head items
  if(o.head==="band"||extras.includes("band")){const bc=o.bandColor||"#F4F5F7";P(hx-1,hy+2,12,1,bc);P(hx-4,hy+3,3,1,bc);P(hx-3,hy+4,2,1,bc)}
  if(o.head==="cap"){P(hx-1,hy-2,12,4,"#2350C8");P(hx-1,hy+1,12,1,"#1A3A94");P(hx-4,hy+1,3,1,"#1A3A94")}
  if(o.head==="phones"||extras.includes("headset")){P(hx,hy-2,10,1,"#24262D");P(hx-2,hy+3,2,4,"#C04BD8");P(hx+10,hy+3,2,4,"#C04BD8");if(extras.includes("headset")){P(hx-1,hy+7,1,1,"#24262D");P(hx,hy+8,3,1,"#24262D")}}
  if(o.head==="crown"){P(hx+1,hy-4,8,2,"#E8B33C");P(hx+1,hy-6,1,2,"#E8B33C");P(hx+4,hy-6,2,2,"#E8B33C");P(hx+8,hy-6,1,2,"#E8B33C");P(hx+4,hy-4,2,1,"#D9483B")}
  // face
  const e=o.expr, ey=hy+4, eye=o.silhouette?"#F0464E":INK;
  if(o.brows){P(hx+1,ey-2,3,1,hair==="#C4C8CF"?"#8E949C":shadeOf(hair,.3));P(hx+6,ey-2,3,1,hair==="#C4C8CF"?"#8E949C":shadeOf(hair,.3)); if(e==="stern"){P(hx+3,ey-1,1,1,INK);P(hx+6,ey-1,1,1,INK)}}
  if(o.blink&&!["sleepy","happy"].includes(e)){P(hx+2,ey+1,2,1,eye);P(hx+6,ey+1,2,1,eye)}
  else if(e==="sleepy"){P(hx+2,ey+1,2,1,eye);P(hx+6,ey+1,2,1,eye)}
  else if(e==="happy"){P(hx+2,ey+1,1,1,eye);P(hx+3,ey,1,1,eye);P(hx+4,ey+1,1,1,eye);P(hx+5,ey+1,1,1,eye);P(hx+6,ey,1,1,eye);P(hx+7,ey+1,1,1,eye)}
  else if(e==="excited"){P(hx+2,ey,2,2,eye);P(hx+6,ey,2,2,eye);P(hx+2,ey,1,1,"#FFFFFF");P(hx+6,ey,1,1,"#FFFFFF")}
  else if(e==="angry"){P(hx+2,ey,2,2,eye);P(hx+6,ey,2,2,eye);P(hx+1,ey-1,3,1,eye);P(hx+6,ey-1,3,1,eye)}
  else {P(hx+2,ey,1,2,eye);P(hx+7,ey,1,2,eye)}
  const my=hy+7;
  if(e==="happy"||e==="smile"){P(hx+3,my,1,1,INK);P(hx+4,my+1,2,1,INK);P(hx+6,my,1,1,INK)}
  else if(e==="excited"){P(hx+3,my,4,2,"#6B2B2B");P(hx+3,my,4,1,"#FFFFFF")}
  else if(e==="chew"){ if(fr) P(hx+4,my,2,2,"#6B2B2B"); else P(hx+4,my+1,2,1,INK)}
  else if(e==="frown"||e==="angry"){P(hx+3,my+1,1,1,INK);P(hx+4,my,2,1,INK);P(hx+6,my+1,1,1,INK)}
  else if(e==="strain"){P(hx+3,my,4,1,INK);P(hx+3,my+1,4,1,"#FFFFFF")}
  else if(e==="stern"){P(hx+3,my+1,4,1,INK)}
  else {P(hx+4,my+1,2,1,INK)}
  if(e==="happy"||e==="excited"){P(hx+1,my,1,1,"#E78C8C");P(hx+8,my,1,1,"#E78C8C")}
  if(o.sweat){P(hx+10,hy-1,1,1,"#9ED6F2");P(hx+10,hy,1,2,"#5DB4E0")}
  if(pose==="sleepy"){const zx=hx+11, zy=hy-4-(fr?1:0);P(zx,zy,3,1,"#9AA3AE");P(zx+1,zy+1,1,1,"#9AA3AE");P(zx,zy+2,3,1,"#9AA3AE");P(zx+4,zy-3,2,1,"#9AA3AE");P(zx+4,zy-2,1,1,"#9AA3AE");P(zx+4,zy-1,2,1,"#9AA3AE")}

  if(o.silhouette){ // treadmill shadow: everything dark slate except eyes
    const img=x.getImageData(0,0,SPR_W,SPR_H), d=img.data;
    for(let i=0;i<d.length;i+=4){ if(!d[i+3]) continue; const red=d[i]===0xF0&&d[i+1]===0x46; if(!red){const l=(d[i]+d[i+1]+d[i+2])/3; const v=34+l*0.12; d[i]=v;d[i+1]=v+4;d[i+2]=v+14} }
    x.putImageData(img,0,0);
  }
  return outline(cv);
}

/* allies (from the Workout Quest sheet) */
const ALLIES={
  coach:{name:"Coach Brock", o:{m:2,f:3,skinColor:"#E3A982",hairColor:"#C4C8CF",style:"Gray",outfitDef:OUTFITS.track,extras:["whistle","clipboard"],brows:true,jowls:true,shoe:"#F1F2F4"}, expr:"stern"},
  buddy:{name:"Gym Companion", o:{m:0,f:1,skinColor:"#F1C7A5",hairColor:"#7A4A2A",style:"Ponytail",outfitDef:OUTFITS.crop,extras:["towel","bottle"],shoe:"#B9A6F0"}, expr:"smile"},
  cardio:{name:"Cardio Master", o:{m:0,f:1,skinColor:"#F1C7A5",hairColor:"#B5572B",style:"BigCurly",outfitDef:OUTFITS.aerobic,extras:["band","headset","warmers","wristbands"],bandColor:"#F2D33C",shoe:"#F3A6CE"}, expr:"excited"}
};
function drawAlly(id,pose,frame,blink){const A=ALLIES[id];return drawSprite({...A.o,pose,frame,blink,expr:pose==="idle"?A.expr:(pose==="flex"||pose==="cheer"?"excited":A.expr)},"ally")}

/* Heavy dumbbell goblin: 30 x 30 */
const gobCv=makeCanvas(30,30);
function drawGoblin(ko,frame){
  const x=gobCv.getContext("2d"); x.clearRect(0,0,30,30);
  const P=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
  const g="#5DB34A", g2="#3F8A33", sh=ko?0:(frame%2);
  if(ko){
    // flattened goblin, barbell dropped
    P(4,22,22,2,"#9AA3AE"); P(2,18,4,9,"#3A3F49"); P(24,18,4,9,"#3A3F49");
    P(9,15,12,7,g); P(9,15,12,1,g2); P(7,14,3,3,g); P(20,14,3,3,g);
    P(12,17,2,1,INK); P(16,17,2,1,INK); P(13,19,4,1,INK); P(10,21,10,2,"#B33A2E");
    P(8,9,2,2,"#F5D06B"); P(14,7,2,2,"#F5D06B"); P(20,9,2,2,"#F5D06B");
  } else {
    const y=sh;
    // barbell overhead
    P(1,3+y,28,2,"#9AA3AE"); P(0,0+y,5,8,"#3A3F49"); P(1,1+y,3,6,"#555C68"); P(25,0+y,5,8,"#3A3F49"); P(26,1+y,3,6,"#555C68");
    // arms up
    P(8,5+y,3,8,g); P(19,5+y,3,8,g); P(8,4+y,3,2,g2); P(19,4+y,3,2,g2);
    // head with ears
    P(10,9,10,8,g); P(6,10,4,2,g); P(5,9,2,2,g); P(20,10,4,2,g); P(23,9,2,2,g);
    P(11,11,3,1,INK); P(16,11,3,1,INK); P(12,12,2,2,"#F5D06B"); P(16,12,2,2,"#F5D06B"); P(12,13,1,1,INK); P(17,13,1,1,INK);
    P(12,15,6,1,INK); P(13,15,1,1,"#F4F5F7"); P(16,15,1,1,"#F4F5F7");
    // body + shorts + legs
    P(10,17,10,5,g); P(10,17,1,5,g2); P(10,22,10,3,"#B33A2E"); P(10,25,3,3,g); P(17,25,3,3,g); P(9,28,4,2,g2); P(17,28,4,2,g2);
    // strain lines
    if(frame%2){P(4,10,2,1,"#F4F5F7");P(25,10,2,1,"#F4F5F7");P(14,6,2,1,"#F4F5F7")}
  }
  return outline(gobCv);
}
/* treadmill for the shadow: drawn into scene under the sprite */
function drawTreadmill(x,ox,oy){
  const P=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(ox+a,oy+b,w,h)};
  P(0,0,30,3,"#3A3F49"); P(0,3,30,1,"#262A33"); P(25,-20,2,20,"#6B7380"); P(20,-21,8,2,"#6B7380"); P(18,-23,4,3,"#3A3F49");
}

/* Iron Colossus boss: 64 x 48 */
const bossCv=makeCanvas(64,48);
function drawColossus(hp,maxHp,frame){
  const x=bossCv.getContext("2d"); x.clearRect(0,0,64,48);
  const P=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
  const ko=hp<=0, hurt=hp<=Math.ceil(maxHp/2), sh=ko?0:frame%2;
  // stand
  P(50,2,3,40,"#6B7380"); P(40,2,12,2,"#6B7380"); P(46,42,16,3,"#4A505B"); P(58,40,4,4,"#3A3F49");
  // punching bag
  const bx=36, by=6+sh;
  P(bx+4,by-4,1,4,"#9AA3AE"); P(bx+8,by-4,1,4,"#9AA3AE");
  P(bx,by,14,30,ko?"#8A6E66":"#D2582E"); P(bx,by,2,30,ko?"#6E5650":"#A9431F"); P(bx,by,14,2,"#A9431F"); P(bx,by+28,14,2,"#A9431F");
  P(bx+2,by+8,4,5,"#F4F5F7"); P(bx+8,by+8,4,5,"#F4F5F7");
  if(ko){P(bx+3,by+9,2,1,INK);P(bx+3,by+11,2,1,INK);P(bx+9,by+9,2,1,INK);P(bx+9,by+11,2,1,INK)}
  else {P(bx+3+(hurt?0:1),by+10,2,2,INK); P(bx+9+(hurt?0:1),by+10,2,2,INK)}
  P(bx+4,by+16,6,1,INK); if(hurt) P(bx+5,by+17,4,1,INK);
  // robot body
  const rx=6, ry=12-sh;
  P(rx,ry,26,22,ko?"#7D838C":"#9AA3AE"); P(rx,ry,26,2,"#B9C0C9"); P(rx,ry,2,22,"#7D838C");
  P(rx+4,ry+5,18,10,"#4A505B");
  P(rx+6,ry+7,6,6,"#F2D7B0"); P(rx+14,ry+7,6,6,"#F2D7B0");
  if(ko){P(rx+7,ry+8,4,1,INK);P(rx+7,ry+11,4,1,INK);P(rx+15,ry+8,4,1,INK);P(rx+15,ry+11,4,1,INK)}
  else {P(rx+8,ry+9,3,3,INK);P(rx+16,ry+9,3,3,INK);P(rx+8,ry+9,1,1,"#F4F5F7");P(rx+16,ry+9,1,1,"#F4F5F7")}
  P(rx+6,ry+17,14,2,"#7D838C");
  // glove arm
  P(rx-4,ry+8,5,6,"#B8732E"); P(rx-6,ry+16,8,9,"#C42F39"); P(rx-6,ry+16,8,2,"#E0574F"); P(rx-6,ry+23,8,2,"#8F1F27");
  P(rx+26,ry+10,4,10,"#B8732E");
  // legs
  P(rx+4,ry+22,7,8,"#6B7380"); P(rx+15,ry+22,7,8,"#6B7380"); P(rx+2,ry+30,10,3,"#8A5A2B"); P(rx+14,ry+30,10,3,"#8A5A2B");
  if(hurt&&!ko){P(rx+27,ry-3,1,3,"#5DC8E0");P(rx+30,ry-1,2,1,"#5DC8E0");P(bx+15,by+2,1,3,"#5DC8E0")}
  if(ko){P(8,2,2,2,"#F5D06B");P(18,0,2,2,"#F5D06B");P(28,2,2,2,"#F5D06B")}
  return outline(bossCv);
}

/* scenes: 96 x 64 logical pixels */
const SCN_W=96, SCN_H=64;
function drawScene(x,id){
  const P=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
  if(id==="gym"){
    P(0,0,96,46,"#CFD6DF"); for(let i=0;i<4;i++){P(6+i*22,6,18,32,"#9EC0D8");P(7+i*22,7,2,30,"#C4DBEA");P(6+i*22,38,18,1,"#7F8C99")}
    P(0,46,96,18,"#23262C"); for(let i=0;i<40;i++) P((i*37)%96,47+(i*11)%16,1,1,"#33373F");
    P(2,40,20,2,"#5A606B"); [["#C42F39",3],["#2350C8",8],["#B98000",13],["#1D7F51",18]].forEach(([c,xx])=>{P(xx,37,3,3,c)});
  } else if(id==="roof"){
    const bands=["#2B2452","#40306A","#5E3A78","#8A4479","#B5506E","#D86A5C","#EE8C52","#F5AE58"];
    bands.forEach((c,i)=>P(0,i*5,96,5,c)); P(0,40,96,6,"#F5AE58");
    P(36,32,24,8,"#FFD27A"); P(40,29,16,3,"#FFD27A"); P(44,27,8,2,"#FFD27A");
    [[0,22,10],[10,28,8],[18,18,9],[27,30,7],[60,24,9],[69,16,8],[77,26,10],[87,20,9]].forEach(([bx,by,bw])=>{P(bx,by+10,bw,36-by,"#1E1A35");for(let wy=by+13;wy<44;wy+=4)for(let wx=bx+1;wx<bx+bw-1;wx+=3) if((wx*7+wy*3)%5<2) P(wx,wy,1,1,"#F5C25C")});
    P(0,46,96,18,"#3A3946"); P(0,46,96,1,"#56556A"); for(let i=0;i<96;i+=8) P(i,48,1,6,"#6A6980"); P(0,48,96,1,"#6A6980");
  } else if(id==="beach"){
    P(0,0,96,36,"#86CDF2"); P(0,24,96,12,"#A9DCF5"); P(70,6,10,10,"#FFD45C"); P(72,4,6,14,"#FFD45C"); P(68,8,14,6,"#FFD45C");
    P(10,8,10,2,"#FFFFFF"); P(13,6,6,2,"#FFFFFF"); P(40,12,12,2,"#FFFFFF");
    P(0,36,96,10,"#2E86C1"); for(let i=0;i<96;i+=12) P(i+(i%24?3:0),38+(i%3),5,1,"#BFE6F7");
    P(0,46,96,18,"#E9CF8E"); for(let i=0;i<30;i++) P((i*29)%96,48+(i*7)%15,1,1,"#D6B972");
  } else if(id==="stage"){
    P(0,0,96,46,"#3B0E16"); for(let i=0;i<96;i+=6){P(i,0,3,46,"#5A1420");P(i+3,0,1,46,"#741C2A")}
    P(0,0,96,5,"#741C2A"); for(let i=0;i<96;i+=8) P(i,5,8,2,"#5A1420");
    x.fillStyle="rgba(255,236,170,0.18)"; x.beginPath(); x.moveTo(42,0); x.lineTo(54,0); x.lineTo(70,60); x.lineTo(26,60); x.closePath(); x.fill();
    P(0,46,96,18,"#7A4A2A"); for(let i=0;i<96;i+=12) P(i,46,1,18,"#5F391F"); P(0,46,96,1,"#A3693E");
  } else {
    // quest grid room, after the character sheet
    P(0,0,96,46,"#1F2233"); for(let i=0;i<96;i+=8) P(i,0,1,46,"#2B2F45"); for(let j=0;j<46;j+=8) P(0,j,96,1,"#2B2F45");
    P(44,3,8,2,"#3B4060"); P(46,5,4,1,"#F5D06B");
    P(0,46,96,18,"#3A3F55"); for(let i=0;i<96;i+=16) P(i,46,1,18,"#33384C"); P(0,46,96,1,"#565C7A");
    P(4,52,9,9,"#3A3F49"); P(7,55,3,3,"#3A3F55"); P(84,54,8,3,"#9AA3AE"); P(82,52,3,7,"#3A3F49"); P(91,52,3,7,"#3A3F49");
  }
}
function groundShadow(x,cx){x.fillStyle="rgba(0,0,0,0.28)";x.fillRect(cx-12,60,24,2);x.fillRect(cx-10,62,20,1)}
