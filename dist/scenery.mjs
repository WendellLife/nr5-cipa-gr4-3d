// Cenário estático do estabelecimento, construído conforme layout.mjs.
// Devolve "items": objetos que o jogo liga e desliga conforme as etapas (proteções, sinalização, mapa de riscos afixado…).
import * as T from './three.module.js';
import {lots,LOT} from './layout.mjs';
import {glowSprite} from './graphics.mjs';
export function buildScenery(scene,TX){
 const mats={};
 const mat=(c,metal=0,rough=.7)=>mats[c+'-'+metal+'-'+rough]??=new T.MeshStandardMaterial({color:c,metalness:metal,roughness:rough});
 const shadowed=(m,cast=true)=>{m.castShadow=cast;m.receiveShadow=true;return m;};
 const out={trees:[],groundMats:[],items:{},see:[]};
 function canvasPlane(w,h,draw,res=768){const cv=document.createElement('canvas');cv.width=res;cv.height=Math.max(8,Math.round(res*h/w));const g=cv.getContext('2d');draw(g,cv.width,cv.height);const tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=4;return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tx,roughness:.8}));}
 // Ferramentas de construção presas a um grupo (o lote), em coordenadas locais.
 function tools(P){
  const box=(w,h,d,c,x,y,z,parent=P,metal=0)=>{const m=shadowed(new T.Mesh(new T.BoxGeometry(w,h,d),typeof c==='object'?c:mat(c,metal)));m.position.set(x,y,z);parent.add(m);return m;};
  const cyl=(r,rb,h,c,x,y,z,parent=P,n=16)=>{const m=shadowed(new T.Mesh(new T.CylinderGeometry(r,rb,h,n),typeof c==='object'?c:mat(c,.2)));m.position.set(x,y,z);parent.add(m);return m;};
  const sphere=(r,c,x,y,z,parent=P)=>{const m=shadowed(new T.Mesh(new T.SphereGeometry(r,16,12),typeof c==='object'?c:mat(c)),true);m.position.set(x,y,z);parent.add(m);return m;};
  const rod=(a,b,r,c,parent=P)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b);const m=cyl(r,r,av.distanceTo(bv),c,0,0,0,parent,8);m.position.copy(av.clone().add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return m;};
  const sign=(text,w,h,x,y,z,bg='#173e31',fg='#ffffff',parent=P,ry=0)=>{
   const m=canvasPlane(w,h,(g,W,H)=>{g.fillStyle=bg;g.fillRect(0,0,W,H);g.strokeStyle=fg;g.lineWidth=6;g.strokeRect(12,12,W-24,H-24);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';const lines=text.split('\n');g.font=`bold ${Math.min(110,H/(lines.length+1))}px Arial`;lines.forEach((s,i)=>g.fillText(s,W/2,H*(i+1)/(lines.length+1),W-54));});
   m.position.set(x,y,z);m.rotation.y=ry;parent.add(m);return m;};
  const flat=(w,d,c,x,z,y=.012,parent=P,opacity=1)=>{const m=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshStandardMaterial({color:c,roughness:.9,transparent:opacity<1,opacity}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);return m;};
  const disc=(r,c,x,z,y=.014,parent=P,opacity=1)=>{const m=new T.Mesh(new T.CircleGeometry(r,28),new T.MeshStandardMaterial({color:c,roughness:.15,metalness:.2,transparent:opacity<1,opacity}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);parent.add(m);return m;};
  const cone=(x,z,parent=P)=>{const c=new T.Group();c.position.set(x,0,z);parent.add(c);cyl(.05,.2,.6,'#f07a28',0,.3,0,c);cyl(.11,.13,.08,'#f4f1e6',0,.38,0,c);box(.42,.04,.42,'#23282c',0,.02,0,c);return c;};
  // Fita de isolamento entre pontos, com cones nas pontas.
  const cordon=(pts,parent=P)=>{const g=new T.Group();parent.add(g);pts.forEach(([x,z])=>cone(x,z,g));for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];rod([a[0],.55,a[1]],[b[0],.55,b[1]],.014,'#f5c518',g);}return g;};
  const group=()=>{const g=new T.Group();P.add(g);return g;};
  const item=(name,obj,def=false)=>{out.items[name]={obj,def};obj.visible=def;return obj;};
  // Cartaz do mapa de riscos (círculos coloridos sobre a planta).
  const riskPoster=(title,w,h,x,y,z,parent=P)=>{const m=canvasPlane(w,h,(g,W,H)=>{g.fillStyle='#f6f6f2';g.fillRect(0,0,W,H);g.fillStyle='#173e31';g.fillRect(0,0,W,H*.16);g.fillStyle='#fff';g.font=`bold ${H*.09}px Arial`;g.textAlign='center';g.fillText(title,W/2,H*.115,W-30);
    g.strokeStyle='#9aa4a8';g.lineWidth=4;g.strokeRect(W*.08,H*.24,W*.84,H*.56);g.beginPath();g.moveTo(W*.45,H*.24);g.lineTo(W*.45,H*.8);g.moveTo(W*.45,H*.5);g.lineTo(W*.92,H*.5);g.stroke();
    [['#2e9e4f',.22,.4,.1],['#d6362b',.62,.36,.075],['#f2c21c',.3,.66,.06],['#2a6fd6',.72,.66,.1],['#8a5a2b',.56,.6,.035]].forEach(([c,cx,cy,r])=>{g.fillStyle=c;g.beginPath();g.arc(W*cx,H*cy,H*r,0,7);g.fill();});
    g.font=`${H*.05}px Arial`;g.fillStyle='#23282c';g.textAlign='left';['Físico','Químico','Biológico','Ergonômico','Acidente'].forEach((t,i)=>{g.fillStyle=['#2e9e4f','#d6362b','#8a5a2b','#f2c21c','#2a6fd6'][i];g.fillRect(W*(.06+i*.185),H*.87,H*.05,H*.05);g.fillStyle='#23282c';g.fillText(t,W*(.06+i*.185)+H*.065,H*.915,W*.13);});},640);
   m.position.set(x,y,z);parent.add(m);return m;};
  const easel=(x,z,parent=P)=>{rod([x-.5,0,z-.25],[x-.35,1.9,z-.02],.03,'#6b747a',parent);rod([x+.5,0,z-.25],[x+.35,1.9,z-.02],.03,'#6b747a',parent);};
  const table=(s,c='#d8cfb7',h=.78)=>{box(s.w,.06,s.d,c,s.x,h,s.z);for(const dx of [-s.w/2+.12,s.w/2-.12])box(.07,h,s.d-.2,'#5e666b',s.x+dx,h/2,s.z);};
  const board=(s,title,lines)=>{rod([s.x-1.1,0,s.z],[s.x-1.1,2.5,s.z],.05,'#6b747a');rod([s.x+1.1,0,s.z],[s.x+1.1,2.5,s.z],.05,'#6b747a');box(2.4,1.3,.08,'#3a4349',s.x,1.85,s.z+.08);
   const m=canvasPlane(2.3,1.2,(g,W,H)=>{g.fillStyle='#10303f';g.fillRect(0,0,W,H);g.fillStyle='#f5c948';g.fillRect(0,0,W,H*.2);g.fillStyle='#10303f';g.font=`bold ${H*.12}px Arial`;g.textAlign='left';g.fillText(title,W*.03,H*.145,W*.94);g.fillStyle='#e8f1f5';g.font=`${H*.095}px Arial`;lines.forEach((t,i)=>g.fillText(t,W*.03,H*(.34+i*.15),W*.94));},1024);
   m.material.emissive=new T.Color('#ffffff');m.material.emissiveMap=m.material.map;m.material.emissiveIntensity=.3;m.position.set(s.x,1.85,s.z+.14);P.add(m);};
  return {box,cyl,sphere,rod,sign,flat,disc,cone,cordon,group,item,riskPoster,easel,table,board};
 }
 // ---- Terreno comum: gramado, via ao norte e calçada ----
 const grassMat=new T.MeshStandardMaterial({map:TX.grass,roughness:1});
 const grass=new T.Mesh(new T.PlaneGeometry(320,240),grassMat);grass.rotation.x=-Math.PI/2;grass.position.y=-.32;grass.receiveShadow=true;scene.add(grass);
 const asphaltMat=new T.MeshStandardMaterial({map:TX.asphalt,normalMap:TX.asphaltN,normalScale:new T.Vector2(.6,.6),color:'#8d9498',roughness:.95});
 const road=new T.Mesh(new T.BoxGeometry(240,.3,6),asphaltMat);road.position.set(0,-.17,-16.4);road.receiveShadow=true;scene.add(road);
 {const S=tools(scene);for(let x=-110;x<112;x+=3)S.box(1.4,.02,.14,'#e9e2c8',x,-.015,-16.4);S.box(240,.12,2,'#b7b4aa',0,-.06,-12.6);}
 out.groundMats.push(grassMat,asphaltMat);
 function tree(x,z,s=1){const g=new T.Group();g.position.set(x,0,z);scene.add(g);const S=tools(g);S.cyl(.2*s,.28*s,3*s,'#5b4632',0,1.5*s,0,g,10);
  const foliage=new T.Group();foliage.position.y=3*s;g.add(foliage);for(const [dx,dy,dz,r,c] of [[0,.8,0,1.5,'#4f7a3f'],[.9,.1,.3,1.1,'#5a8845'],[-.9,.2,-.2,1.15,'#476f39'],[.1,1.6,.2,.95,'#5f9148']])S.sphere(r*s,c,dx*s,dy*s,dz*s,foliage);
  out.trees.push({g,foliage,seed:Math.random()*6});}
 function lotBase(id,floor,title){
  const L=lots[id],g=new T.Group();g.position.x=L.ox;scene.add(g);const S=tools(g);
  const slab=new T.Mesh(new T.BoxGeometry(LOT.halfW*2+.6,.3,LOT.halfD*2+.6),floor);slab.position.set(0,-.15,0);slab.receiveShadow=true;g.add(slab);
  S.sign(title,4.2,1,-10.6,.9,11.2,'#10303f','#f5c948');S.rod([-12.4,0,11.15],[-12.4,1.3,11.15],.05,'#6b747a');S.rod([-8.8,0,11.15],[-8.8,1.3,11.15],.05,'#6b747a');
  for(const z of [-7,7]){tree(L.ox-15,z*1.02,1);}
  return {L,g,S,st:L.local.structures,sp:L.local.spots,R:k=>{const [x,z,w,d]=L.local.structures[k];return {x,z,w,d};}};
 }
 // ================= GR 4: canteiro de obras =================
 {const {S,R,sp}=lotBase('gr4',new T.MeshStandardMaterial({map:TX.dirt,normalMap:TX.dirtN,normalScale:new T.Vector2(.6,.6),color:'#c9bfa9',roughness:.95}),'NR 5 • GRAU DE RISCO 4\nCANTEIRO DE OBRAS');
  // Tapume nos fundos e nas laterais.
  S.box(27,2,.1,'#c9a16b',0,1,-11.3);for(const x of [-13.3,13.3])S.box(.1,2,17,'#c9a16b',x,1,-2.8);
  // Edifício em estrutura: pilares, laje e arranques.
  const conc=mat('#a7a39a',0,.95);for(const k of ['pil1','pil2','pil3','pil4']){const p=R(k);S.box(p.w,6.2,p.d,conc,p.x,3.1,p.z);for(const [dx,dz] of [[-.15,-.15],[.15,.15]])S.rod([p.x+dx,6.2,p.z+dz],[p.x+dx,6.9,p.z+dz],.02,'#7a4a2a');}
  out.see.push(S.box(7.2,.26,6.2,conc,-6,3.17,-6.5));
  {const g=S.group();for(let x=-9.4;x<=-2.6;x+=1.7)S.box(.07,1.2,.07,'#f5c518',x,3.9,-3.5,g);for(const y of [3.95,4.45])S.box(6.9,.07,.07,'#f5c518',-6,y,-3.5,g);S.box(6.9,.2,.04,'#f5c518',-6,3.4,-3.48,g);S.item('gr4.guardaCorpo',g);}
  S.sign('BORDA DE LAJE',1.6,.3,-6,2.6,-3.36,'#d6362b');
  // Andaime: incompleto no início; completo depois da inspeção.
  {const a=R('andaime');for(const dx of [-1.4,0,1.4])for(const dz of [-.5,.5])S.rod([a.x+dx,0,a.z+dz],[a.x+dx,4.2,a.z+dz],.03,'#8e979c');for(const y of [2,4])for(const dz of [-.5,.5])S.rod([a.x-1.4,y,a.z+dz],[a.x+1.4,y,a.z+dz],.025,'#8e979c');
   S.box(1.1,.05,.9,'#b48a5a',a.x-.8,2.03,a.z);S.box(.5,.05,.9,'#b48a5a',a.x+1.1,2.03,a.z);
   const g=S.group();S.box(2.8,.06,1,'#c9a16b',a.x,2.05,a.z,g);S.box(2.8,.18,.04,'#f5c518',a.x,2.17,a.z+.5,g);for(const y of [2.7,3.2])S.box(2.8,.05,.05,'#f5c518',a.x,y,a.z+.5,g);S.rod([a.x+1.7,0,a.z+.9],[a.x+1.5,2.1,a.z+.5],.03,'#f5c518',g);S.item('gr4.rodape',g);}
  // Vala: sem escoramento no início.
  {const v=R('vala');S.flat(v.w,v.d,'#2c2118',v.x,v.z,.02);for(const z of [-7.6,-5,-2.4]){const m=new T.Mesh(new T.ConeGeometry(.75,.6,12),mat('#b48a5a'));m.position.set(v.x+1.5,.3,z);m.castShadow=true;S.group().add(m);}
   S.sign('VALA 2 m',1,.3,v.x-.3,.9,v.z+3.7,'#f0b429','#22262a');
   const g=S.group();for(const sx of [-1,1])S.box(.06,.5,v.d,'#b48a5a',v.x+sx*.66,.25,v.z,g);for(let z=v.z-3;z<=v.z+3;z+=1.5)S.box(1.3,.08,.08,'#8a6d4a',v.x,.42,z,g);S.rod([v.x-.9,0,v.z+2.6],[v.x-.5,1.2,v.z+2.6],.03,'#f5c518',g);S.rod([v.x-.9,0,v.z+3],[v.x-.5,1.2,v.z+3],.03,'#f5c518',g);S.item('gr4.escoramento',g);}
  {const b=R('betoneira');S.box(.9,.5,.9,'#3a3f44',b.x,.3,b.z);const d=S.cyl(.5,.35,.9,'#e8742a',b.x,1,b.z);d.rotation.x=.6;}
  // Quadro elétrico provisório: aberto, com cabo na poça.
  {const q=R('quadro');S.box(q.w,1.2,q.d,'#9aa4a8',q.x,1.1,q.z,undefined,.5);S.rod([q.x,0,q.z],[q.x,.5,q.z],.05,'#6b747a');for(let i=0;i<3;i++)S.box(.03,.5,.05,['#d6362b','#f2c21c','#23282c'][i],q.x+.27,1.1,q.z-.2+i*.2);
   S.disc(.8,'#5f8fb0',q.x+1.1,q.z+.2,.016,undefined,.75);S.rod([q.x+.25,.6,q.z],[q.x+1.6,.03,q.z+.5],.02,'#1b1b1b');
   const g=S.group();S.box(.06,1.15,.85,'#5e666b',q.x+.3,1.1,q.z,g,.5);S.sign('QUADRO FECHADO\nSÓ AUTORIZADOS',.8,.4,q.x+.34,1.1,q.z,'#f5c518','#111',g,Math.PI/2);S.rod([q.x+.25,2,q.z],[q.x+2.2,2.2,q.z+.5],.02,'#1b1b1b',g);S.item('gr4.quadroFechado',g);}
  // Armação, corte de cerâmica, pilha de blocos.
  {const a=R('armacao');S.table(a,'#8a6d4a',.8);for(let i=0;i<5;i++)S.rod([a.x-.9,.86,a.z-.25+i*.12],[a.x+.9,.86,a.z-.25+i*.12],.012,'#7a4a2a');
   const c=R('corte');S.table(c,'#9aa4a8',.8);const d=S.cyl(.22,.22,.03,'#c9d1d4',c.x+.3,1,c.z,undefined,20);d.rotation.x=Math.PI/2;S.box(.3,.2,.25,'#d6362b',c.x+.3,.95,c.z-.2);
   const g=S.group();S.cyl(.22,.22,.5,'#2a6fd6',c.x-1.2,.25,c.z,g);S.rod([c.x-1.2,.5,c.z],[c.x+.25,1,c.z],.015,'#2a6fd6',g);S.sign('CORTE ÚMIDO',.8,.2,c.x,.45,c.z+.42,'#2a6fd6','#fff',g);S.item('gr4.corteUmido',g);
   const p=R('pilha');for(let i=0;i<3;i++)S.box(p.w-.1-i*.3,.4,p.d-.1,'#b96a4a',p.x,.2+i*.4,p.z);}
  // Guincho com a carga suspensa; depois da investigação, área de içamento isolada.
  {const q=R('guincho');S.box(.8,.4,.8,'#e8aa21',q.x,.2,q.z);S.rod([q.x,0,q.z],[q.x,7,q.z],.07,'#e8aa21');S.rod([q.x,7,q.z],[q.x+1.6,7,q.z+1.4],.05,'#e8aa21');S.rod([q.x+1.4,7,q.z+1.2],[q.x+1.4,4.6,q.z+1.2],.012,'#23282c');for(let i=0;i<4;i++)S.rod([q.x+.7,4.5,q.z+1.1+i*.06],[q.x+2.1,4.5,q.z+1.1+i*.06],.02,'#7a4a2a');
   const [x,z]=sp.carga;S.item('gr4.isolamento',S.cordon([[x-1.3,z+1.9],[x+1.5,z+1.9],[x+1.5,z-.6],[x-1.3,z-.6]]));
   const g=S.group();for(const [ax,az,bx,bz] of [[x-1.5,z+2.1,x+1.7,z+2.1],[x+1.7,z+2.1,x+1.7,z-1],[x-1.5,z+2.1,x-1.5,z-1]]){const len=Math.hypot(bx-ax,bz-az);const m=new T.Mesh(new T.PlaneGeometry(len,1),new T.MeshStandardMaterial({color:'#f07a28',transparent:true,opacity:.55,side:T.DoubleSide}));m.position.set((ax+bx)/2,.55,(az+bz)/2);m.rotation.y=Math.atan2(-(bz-az),bx-ax);g.add(m);}
   S.sign('ÁREA DE IÇAMENTO\nISOLADA',1.4,.5,x+.1,1.4,z+2.14,'#f07a28','#111',g);S.item('gr4.tela',g);}
  // Container da obra, quadro de treinamento e mapa de riscos.
  {const c=R('container');S.box(c.w,2.5,c.d,'#3a6f9f',c.x,1.25,c.z,undefined,.3);S.box(.9,1.9,.06,'#2a4a5c',c.x-1.6,.95,c.z+c.d/2+.02);S.box(1.2,.7,.06,'#9fd0e6',c.x+.8,1.5,c.z+c.d/2+.02,undefined,.5);S.sign('ESCRITÓRIO DA OBRA • CIPA',3.4,.4,c.x,2.25,c.z+c.d/2+.04,'#10303f','#f5c948');}
  S.board(R('board'),'CIPA DO CANTEIRO',['Grau de risco 4 → 20 horas','Máximo de 8 h por dia (5.7.4.1)','Mínimo de 8 h presenciais','Construção: Anexo I da NR 5']);
  {const [x,z]=sp.mapa;S.easel(x,z-1.1);S.box(1.5,1.1,.05,'#8a6d4a',x,1.5,z-1.2);S.sign('ETAPA: ESTRUTURA',1.4,.2,x,2.2,z-1.16,'#173e31');S.item('gr4.mapa',S.riskPoster('MAPA DE RISCOS • ESTRUTURA',1.3,.9,x,1.5,z-1.16));}
  // Portão, frente de trabalho e entrega da obra.
  {const [x,z]=sp.portao;S.box(.2,2.2,.2,'#5e666b',x-2.2,1.1,z+1.2);S.box(.2,2.2,.2,'#5e666b',x+1.6,1.1,z+1.2);const g=S.group();S.rod([x+.9,0,z-1.25],[x+.9,1.5,z-1.25],.04,'#6b747a',g);S.sign('FRENTE DE TRABALHO\nESGOTO • 200 m →',1.6,.6,x+.2,1.5,z-1.2,'#f07a28','#111',g);S.item('gr4.placaFrente',g);
   const [ex,ez]=sp.entrega;const f=S.group();S.rod([ex-1,0,ez-1.25],[ex-1,2.2,ez-1.25],.05,'#6b747a',f);S.rod([ex+1,0,ez-1.25],[ex+1,2.2,ez-1.25],.05,'#6b747a',f);S.sign('OBRA CONCLUÍDA\nCIPA ENCERRADA',2.2,.8,ex,1.8,ez-1.2,'#2f8a57','#fff',f);S.item('gr4.placaFim',f);}
 }
 out.mats=mats;
 return out;
}
