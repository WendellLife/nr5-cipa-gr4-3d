import * as T from './three.module.js';
import {findRoute,walkableGrid,phaseOf} from './crew.mjs';
import {loadCharacterBase,createCharacter} from './characters.mjs';
import {createRenderPipeline,detectHardware,savedQuality,QUALITY,makeTextures} from './graphics.mjs';
import {MODULES,MODULE_IDS,objectivesOf,initialState,interact,answer,canMove,currentTarget,refSummary,KINDS,RISK_GROUPS,risksOf,visibleItems} from './rules.mjs';
import {staticObstacles,lots} from './layout.mjs';
import {buildScenery} from './scenery.mjs';
const $=id=>document.getElementById(id);
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(e){$('loading').textContent='Não foi possível iniciar o 3D. Ative a aceleração gráfica do navegador e recarregue.';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;$('game').appendChild(renderer.domElement);$('loading').textContent='Carregando personagens…';
let charBase;try{charBase=await loadCharacterBase({anim:'models/Xbot.glb',male:'models/worker-m.glb',female:'models/worker-f.glb'});}catch(e){$('loading').textContent='Não foi possível carregar os personagens (pasta models). Verifique se ela foi publicada.';throw e;}$('loading').remove();
const scene=new T.Scene();scene.background=new T.Color('#bcd5e6');scene.fog=new T.Fog('#bcd5e6',48,105);
const SINGLE=MODULE_IDS.length===1;
let moduleId=MODULE_IDS.includes(location.hash.slice(1))?location.hash.slice(1):MODULE_IDS[0];
let state=initialState(moduleId),paused=true,time=0,toastTimer,elapsed=0,finished=false,missionCollapsed=innerWidth<600;const keys=new Set();
let lot=lots[state.module];
// Câmera em terceira pessoa a 45°, logo atrás e acima do jogador.
const camera=new T.PerspectiveCamera(52,innerWidth/innerHeight,.1,240);const look=new T.Vector3(lot.start.x,0,lot.start.z);const camOffset=new T.Vector3(0,10.8,10.8);let camDist=1;
const hemi=new T.HemisphereLight(0xdcecff,0x6f6a5e,.95);scene.add(hemi);
const sun=new T.DirectionalLight(0xfff0d8,2.3);sun.position.set(-9,20,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:80});sun.shadow.radius=4;sun.shadow.bias=-.0003;sun.shadow.normalBias=.035;scene.add(sun);scene.add(sun.target);
const fill=new T.DirectionalLight(0xb7dcff,1.1);fill.position.set(10,7,-4);scene.add(fill);
const TX=makeTextures();const SC=buildScenery(scene,TX);
const obstacles=[...staticObstacles];
const grids={};const gridOf=m=>grids[m]??=walkableGrid(obstacles,lots[m].bounds);
const free=(x,z)=>canMove(x,z,obstacles,lot.bounds);
const objectives=()=>objectivesOf(state.module);
// Tudo o que fica entre a câmera e o jogador (ou o destino atual) fica translúcido.
const sceneryMeshes=[];scene.traverse(m=>{if(m.isMesh&&!(m.geometry.type==='PlaneGeometry')&&m.geometry.type!=='CircleGeometry'){const b=new T.Box3().setFromObject(m);if(b.max.y>.6&&b.max.y-b.min.y>.12&&b.max.y-b.min.y<12)sceneryMeshes.push(m);}});
for(const m of SC.see)if(!sceneryMeshes.includes(m))sceneryMeshes.push(m);
const faded=new Map(),ray=new T.Raycaster();let fadeTick=0;
function updateSeeThrough(dt,points){if(++fadeTick%3===0){const hits=new Set();for(const p of points){const to=new T.Vector3(p.x,p.y,p.z),dir=to.clone().sub(camera.position),len=dir.length();ray.set(camera.position,dir.normalize());ray.far=len-.4;for(const h of ray.intersectObjects(sceneryMeshes,false))if(h.object.visible)hits.add(h.object);}
 for(const m of hits)if(!faded.has(m)){m.material=m.material.clone();m.material.transparent=true;faded.set(m,{o:1,hit:true});}for(const [m,f] of faded)f.hit=hits.has(m);}
 for(const [m,f] of faded){f.o+=((f.hit?.22:1)-f.o)*Math.min(1,dt*8);m.material.opacity=f.o;m.material.depthWrite=f.o>.95;}}
// ---- Jogador: membro da CIPA (a roupa muda conforme o estabelecimento) ----
const player=new T.Group();scene.add(player);
let playerChar=null,playerMove={speed:0,turn:0},playerAction=null;
const PLAYER_LOOK={
 office:{body:'male',surface:'#2f8a57',pants:'#2f3a4a',skin:'#d9a97a',helmet:null,vest:null,gloves:null,armband:'#f2f2ec',glow:.06},
 site:{body:'male',surface:'#2f8a57',pants:'#2b3440',skin:'#d9a97a',helmet:'#f2f2ec',helmetStripe:'#2f8a57',vest:'#2f8a57',stripes:'#f2f2ec',gloves:'#d8d2c0',boots:'#3a2a1f',backLabel:{text:'CIPA',bg:'#173e31'},glow:.06}
};
function navigationDiamond(color){const g=new T.Group();const mesh=new T.Mesh(new T.OctahedronGeometry(.32,0),new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.65,flatShading:true,roughness:.28,toneMapped:false,depthTest:false}));mesh.scale.set(.82,1.65,.82);mesh.renderOrder=20;g.add(mesh);const outline=new T.LineSegments(new T.EdgesGeometry(mesh.geometry),new T.LineBasicMaterial({color:'#12322d',transparent:true,opacity:.7,depthTest:false}));outline.scale.copy(mesh.scale);outline.renderOrder=21;g.add(outline);return g;}
const playerDiamond=navigationDiamond('#66ff38');playerDiamond.scale.setScalar(.55);playerDiamond.position.y=2.3;player.add(playerDiamond);
function buildPlayer(){if(playerChar)player.remove(playerChar.group);playerChar=createCharacter(charBase,PLAYER_LOOK[MODULES[state.module].gr>=3?'site':'office']);player.add(playerChar.group);}
const marker=new T.Group();scene.add(marker);const diamond=navigationDiamond('#25ddff');marker.add(diamond);
const targetRing=new T.Group();scene.add(targetRing);
function navigationRing(inner,outer,color,order){const r=new T.Mesh(new T.RingGeometry(inner,outer,64),new T.MeshBasicMaterial({color,side:T.DoubleSide,transparent:true,opacity:1,toneMapped:false,depthTest:false,depthWrite:false}));r.rotation.x=-Math.PI/2;r.renderOrder=order;targetRing.add(r);return r;}
navigationRing(.7,1.12,'#073547',9).material.opacity=.15;navigationRing(.78,.99,'#20deff',10).material.opacity=.38;navigationRing(.76,.80,'#ffffff',11).material.opacity=.3;const targetPulse=navigationRing(1.05,1.1,'#32dfff',9);
for(let i=0;i<4;i++){const arrow=new T.Mesh(new T.ConeGeometry(.16,.35,3),new T.MeshBasicMaterial({color:'#c2faff',depthTest:false,toneMapped:false}));const a=i*Math.PI/2;arrow.position.set(Math.cos(a)*.61,.03,Math.sin(a)*.61);arrow.rotation.z=Math.PI/2;arrow.rotation.y=-a;arrow.renderOrder=12;targetRing.add(arrow);}
const tether=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0,-2.4,0),new T.Vector3(0,-.6,0)]),new T.LineDashedMaterial({color:'#54eeff',dashSize:.13,gapSize:.12,transparent:true,opacity:.8,depthTest:false}));tether.computeLineDistances();marker.add(tether);
// ---- Equipe do estabelecimento (recriada a cada módulo) ----
let workers=[];
const TONE={info:['#f5d777','#142c39e8'],alerta:['#ffb36b','#3a2a12e8'],perigo:['#ff8f7a','#4a1712ee'],ok:['#9ef0c0','#123a2ae8']};
function wheelchair(rig){const g=new T.Group();rig.add(g);const m=new T.MeshStandardMaterial({color:'#2b3033',roughness:.5,metalness:.4});const seat=new T.Mesh(new T.BoxGeometry(.5,.06,.46),m);seat.position.set(0,.5,-.02);g.add(seat);const back=new T.Mesh(new T.BoxGeometry(.5,.5,.05),m);back.position.set(0,.78,-.26);g.add(back);
 const wheels=[];for(const sx of [-1,1]){const w=new T.Mesh(new T.TorusGeometry(.3,.03,8,24),m);w.rotation.y=Math.PI/2;w.position.set(sx*.3,.33,-.08);g.add(w);wheels.push(w);const c=new T.Mesh(new T.CylinderGeometry(.07,.07,.04,10),m);c.rotation.z=Math.PI/2;c.position.set(sx*.22,.07,.3);g.add(c);}
 return {g,wheels};}
function buildWorkers(){
 for(const w of workers)scene.remove(w.rig);
 workers=Object.entries(lot.roster).map(([name,r],i)=>{
  const rig=new T.Group();rig.position.set(r.x,r.y||0,r.z);rig.rotation.y=r.angle??0;scene.add(rig);
  const char=createCharacter(charBase,{...r.look});rig.add(char.group);
  const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=112;const tex=new T.CanvasTexture(labelCanvas);tex.colorSpace=T.SRGBColorSpace;const label=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:false}));label.scale.set(2.6,.57,1);label.position.set(0,2.2,0);rig.add(label);
  return {name,role:r.role,r,rig,char,label,labelCanvas,tex,labelText:'',phase:null,route:[],stride:i,speed:2.5+i*.08,chair:r.prop==='wheelchair'?wheelchair(rig):null};});
}
const byName=n=>workers.find(w=>w.name===n);
function setLabel(w,sub,tone){const text=sub+tone;if(w.labelText===text)return;w.labelText=text;const [color,bg]=TONE[tone]||TONE.info;const c=w.labelCanvas.getContext('2d');c.clearRect(0,0,512,112);c.fillStyle=bg;c.fillRect(0,0,512,112);c.textAlign='center';c.fillStyle=color;c.font='bold 31px Arial';c.fillText(w.name+' · '+w.role,256,44,496);c.fillStyle='#ffffff';c.font='25px Arial';c.fillText(sub,256,84,496);w.tex.needsUpdate=true;}
function walkAlong(w,dt){let budget=w.speed*dt,moving=false;while(budget>0&&w.route.length){const p=w.route[0],dx=p.x-w.rig.position.x,dz=p.z-w.rig.position.z,d=Math.hypot(dx,dz);if(d<.01){w.route.shift();continue;}const step=Math.min(budget,d);w.rig.position.x+=dx/d*step;w.rig.position.z+=dz/d*step;budget-=step;const angle=Math.atan2(dx,dz);w.rig.rotation.y+=Math.atan2(Math.sin(angle-w.rig.rotation.y),Math.cos(angle-w.rig.rotation.y))*.25;moving=true;if(step===d)w.route.shift();}return moving;}
const facePlayer=(w,k=.08)=>{const a=Math.atan2(player.position.x-w.rig.position.x,player.position.z-w.rig.position.z);w.rig.rotation.y+=Math.atan2(Math.sin(a-w.rig.rotation.y),Math.cos(a-w.rig.rotation.y))*k;};
const turnTo=(w,a,k=.12)=>{w.rig.rotation.y+=Math.atan2(Math.sin(a-w.rig.rotation.y),Math.cos(a-w.rig.rotation.y))*k;};
const WORK_POSES=['inspect','repair','push','wipe','type','spray','carry'];
function updateWorkers(dt){
 for(const w of workers){
  const ph=phaseOf(state.module,w.name,state);const key=ph.key+ph.label;
  if(w.phase!==key){w.phase=key;w.route=Math.hypot(ph.at.x-w.rig.position.x,ph.at.z-w.rig.position.z)>.3?findRoute(w.rig.position,ph.at,obstacles,gridOf(state.module)):[];}
  setLabel(w,ph.label,ph.tone);w.rig.visible=!ph.hidden;
  w.stride+=dt;let pose='none',speed=0;const extra={};const before=w.rig.rotation.y;
  const moving=walkAlong(w,dt);
  if(moving){w.rig.position.y=0;if(w.chair){pose='seated';w.chair.wheels.forEach(x=>x.rotation.x+=dt*6);}else speed=w.speed;}
  else{w.rig.position.y=ph.y;pose=ph.pose;if(WORK_POSES.includes(pose))extra.work=pose==='wipe'||pose==='type'?2:1;
   if(ph.tone==='alerta'&&(pose==='none'||pose==='point'))facePlayer(w,.06);else turnTo(w,ph.angle,.08);
   if(ph.tone==='perigo')extra.bob=1;}
  extra.turn=(w.rig.rotation.y-before)/Math.max(dt,.001);
  w.char.setPose(pose);w.char.update(dt,speed,extra);}
}
// ---- Objetos do cenário e mapa de riscos ----
const itemDefaults=Object.fromEntries(Object.entries(SC.items).map(([k,v])=>[k,v.def]));
function applyItems(){const vis=visibleItems(state,itemDefaults);for(const [k,it] of Object.entries(SC.items))it.obj.visible=!!vis[k]&&k.startsWith(state.module+'.');}
const riskGroup=new T.Group();scene.add(riskGroup);
function anchorBase(o){if(o.who){const r=lot.roster[o.who];return {x:r.x,z:r.z};}return {x:o.x,z:o.z};}
function applyRisks(){
 for(const m of [...riskGroup.children]){riskGroup.remove(m);m.geometry.dispose();m.material.dispose();}
 const list=risksOf(state),counts={};
 for(const r of list){counts[r.g]=(counts[r.g]||0)+1;const o=objectives().find(x=>x.id===r.id),a=anchorBase(o),rad=[.5,.75,1][r.size-1];
  const c=new T.Mesh(new T.CircleGeometry(rad,40),new T.MeshBasicMaterial({color:RISK_GROUPS[r.g].color,transparent:true,opacity:.62,depthWrite:false,toneMapped:false}));c.rotation.x=-Math.PI/2;c.position.set(a.x+.9,.045,a.z+.5);c.renderOrder=5;riskGroup.add(c);
  const e=new T.Mesh(new T.RingGeometry(rad-.05,rad,48),new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.9,depthWrite:false,toneMapped:false}));e.rotation.x=-Math.PI/2;e.position.set(a.x+.9,.05,a.z+.5);e.renderOrder=6;riskGroup.add(e);}
 $('ep-risks').innerHTML=Object.entries(RISK_GROUPS).map(([k,g])=>`<span class="${counts[k]?'on':''}"><i style="background:${g.color}"></i>${g.label}<b>${counts[k]||0}</b></span>`).join('');
 $('ep-radii').textContent=list.length?`Mapa de riscos: ${list.length} ${list.length===1?'risco registrado':'riscos registrados'}`:'Mapa de riscos: nenhum risco registrado';
}
// ---- Alvos, painel e diálogos ----
function anchorOf(o){if(!o)return null;if(o.who)return byName(o.who).rig.position;return {x:o.x,z:o.z};}
const reachOf=o=>o.r??2;
const nearTarget=o=>{const a=anchorOf(o);return Math.hypot(player.position.x-a.x,player.position.z-a.z)<=reachOf(o);};
function unstick(){const p=player.position;if(free(p.x,p.z))return;for(let r=.2;r<6;r+=.2)for(let a=0;a<24;a++){const x=p.x+Math.cos(a/24*Math.PI*2)*r,z=p.z+Math.sin(a/24*Math.PI*2)*r;if(free(x,z)){p.x=x;p.z=z;return;}}}
const labelBounds={min:80,max:innerWidth-80};let camShiftX=0;
function updateLabelBounds(){const panel=document.querySelector('.mission').getBoundingClientRect();const ppu=innerHeight/(2*camOffset.length()*Math.tan(camera.fov*Math.PI/360));camShiftX=innerWidth<850||!panel.width?0:panel.left<innerWidth/2?-(panel.right+16)/2/ppu:(innerWidth-panel.left+16)/2/ppu;labelBounds.min=80;labelBounds.max=innerWidth-80;if(innerWidth>=700&&panel.width){if(panel.left<innerWidth/2)labelBounds.min=Math.min(innerWidth/2,panel.right+110);else labelBounds.max=Math.max(innerWidth/2,panel.left-110);}}
function updateMissionPanel(){const panel=document.querySelector('.mission');panel.classList.toggle('compact',missionCollapsed);$('mission-toggle').textContent=missionCollapsed?'+':'−';$('mission-toggle').setAttribute('aria-expanded',String(!missionCollapsed));$('mission-toggle').setAttribute('aria-label',missionCollapsed?'Expandir painel de missão':'Recolher painel de missão');requestAnimationFrame(updateLabelBounds);}
$('mission-toggle').onclick=()=>{missionCollapsed=!missionCollapsed;updateMissionPanel();};
function escapeHTML(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);}
const chips=o=>refSummary(o).map(r=>`<span class="chip ${r.kind}${r.check?' check':''}">${escapeHTML(r.label)}<small>${r.status}</small></span>`).join('');
function notify(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),5000);}
const moduleEyebrow=()=>{const M=MODULES[state.module];return `NR 5 • ${M.name.toUpperCase()} • ${M.course.toUpperCase()}`;};
function applyModuleChrome(){const M=MODULES[state.module];$('module-badge').textContent=SINGLE?'DEMO 3D':M.short;if(SINGLE){$('brand-sub').textContent=`CIPA • ${M.name} • ${M.horas} h`.toUpperCase();$('modules').hidden=true;$('restart').textContent='Reiniciar fase';}
 $('role').textContent='SIMULAÇÃO / '+M.role.toUpperCase();$('place').textContent=M.place;document.title=`NR 5 • CIPA • ${M.name}`;$('team-status').textContent=`Equipe: ${Object.keys(lot.roster).length} pessoas`;
 document.querySelector('.progress').innerHTML=objectives().map(()=>'<i></i>').join('');
 $('ep-gr').textContent=M.short;$('ep-horas').textContent=M.horas+' h';$('ep-name').textContent=M.estab;$('ep-state').textContent='CIPA: '+M.cipa;}
function updateHUD(){
 updateMissionPanel();const o=currentTarget(state),list=objectives();$('count').textContent=`${state.completed.length}/${list.length}`;$('number').textContent=String(Math.min(state.step+1,list.length)).padStart(2,'0');
 document.querySelectorAll('.progress i').forEach((e,i)=>{e.className=state.completed.includes(list[i].id)?'done':i===state.step?'active':'';});
 if(o){$('objective').textContent=o.title;$('description').textContent=o.description;$('tip').textContent=o.tip;$('refs').innerHTML=chips(o);$('target-label').textContent=o.title.toUpperCase();}
 const show=!!o&&!finished;marker.visible=show;targetRing.visible=show;$('target-label').hidden=!show;
 applyItems();applyRisks();
}
let dialogMode='';
function openDialog(title,content,opts={}){const d=document.querySelector('.dialog');d.classList.remove('choice-dialog','menu-dialog');if(opts.cls)d.classList.add(opts.cls);dialogMode=opts.cls||'';paused=true;keys.clear();$('dialog-title').textContent=title;$('eyebrow').textContent=opts.eyebrow||moduleEyebrow();$('dialog-content').innerHTML=content;$('resume').hidden=!!opts.noResume;$('restart').hidden=!!opts.noRestart;$('overlay').hidden=false;d.scrollTop=0;}
function closeDialog(){paused=false;$('overlay').hidden=true;dialogMode='';}
function best(m){try{return JSON.parse(localStorage.getItem('nr5-resultados')||'{}')[m]||null;}catch{return null;}}
function saveBest(m,r){try{const all=JSON.parse(localStorage.getItem('nr5-resultados')||'{}');const prev=all[m];if(!prev||r.errors<prev.errors||(r.errors===prev.errors&&r.time<prev.time))all[m]=r;localStorage.setItem('nr5-resultados',JSON.stringify(all));}catch{}}
function moduleMenu(first=false){
 const cards=MODULE_IDS.map(id=>{const M=MODULES[id],b=best(id);return `<button class="module-card" data-module="${id}"><span class="mc-top"><span>${M.course.toUpperCase()}</span><span>${M.objectives.length} etapas</span></span><h3>${M.name}</h3><span class="mc-gr">${escapeHTML(M.estab.toUpperCase())}</span><p>${M.intro}</p>${b?`<span class="mc-done">✓ Concluído • ${b.errors} decisões corrigidas</span>`:''}<span class="mc-go">${id===state.module&&!first&&state.step>0&&!finished?'Continuar':'Começar'} →</span></button>`;}).join('');
 openDialog(first?'Escolha o grau de risco':'Módulos da NR 5',`${first?'':'<button class="catalog-close" id="catalog-close">Voltar ao jogo ×</button>'}<p>Quatro treinamentos de CIPA em um só jogo, um por grau de risco do estabelecimento. A carga horária mínima muda com o grau (item 5.7.4), e os riscos de cada lugar também.</p><div class="module-grid">${cards}</div>`,{cls:'menu-dialog',noResume:true,noRestart:true,eyebrow:'NR 5 • CIPA • GRAUS DE RISCO 1 A 4'});
 if(!first)$('catalog-close').onclick=closeDialog;
 document.querySelectorAll('[data-module]').forEach(b=>b.onclick=()=>{const id=b.dataset.module;if(id===state.module&&state.step>0&&!finished&&!first){closeDialog();return;}startModule(id);});
}
function startModule(id){
 state=initialState(id);lot=lots[id];if(!SINGLE)history.replaceState(null,'','#'+id);finished=false;elapsed=0;camDist=1;playerAction=null;clearTimeout(toastTimer);$('toast').classList.remove('show');
 player.position.set(lot.start.x,0,lot.start.z);player.rotation.y=Math.PI;look.set(lot.start.x,0,lot.start.z);missionCollapsed=innerWidth<600;
 buildPlayer();buildWorkers();applyModuleChrome();updateHUD();closeDialog();
 const M=MODULES[id];notify(`${M.name}: ${M.estab}. ${M.course}.`);
}
function applyState(next){state=next;updateHUD();if(state.feedback)notify(state.feedback);
 if(state.finished){finished=true;const M=MODULES[state.module],i=MODULE_IDS.indexOf(state.module),nextId=MODULE_IDS[(i+1)%MODULE_IDS.length];saveBest(state.module,{errors:state.errors,time:Math.round(elapsed)});
  openDialog(SINGLE?'Fase concluída.':`${M.name} concluído.`,`<div class="success-number">${state.completed.length} / ${objectives().length}</div><p>${M.summary}</p><p>Tempo: <strong>${Math.floor(elapsed/60)}min ${Math.floor(elapsed%60)}s</strong>. Decisões corrigidas: <strong>${state.errors}</strong>. Riscos registrados no mapa: <strong>${risksOf(state).length}</strong>.</p><p>Lembre: neste grau de risco, o treinamento da CIPA tem no mínimo <strong>${M.horas} horas</strong> (${M.presencial}). Itens marcados como <em>Boa prática</em> não são item de NR. A simulação não substitui o treinamento com carga horária e avaliação, nem a atuação da CIPA e do SESMT da empresa.</p>${SINGLE?'':`<div class="next-row"><button id="next-module">Próximo: ${MODULES[nextId].name} <span>→</span></button></div><button id="pick-module" class="secondary">Escolher módulo</button>`}`,{noResume:true});
  if(!SINGLE){$('next-module').onclick=()=>startModule(nextId);$('pick-module').onclick=()=>moduleMenu();}}}
function openChoice(){const o=currentTarget(state);if(!o?.choices)return;const order=[...o.choices].sort((a,b)=>((a.id.charCodeAt(0)*7+state.step*3+state.errors)%5)-((b.id.charCodeAt(0)*7+state.step*3+state.errors)%5));
 openDialog(o.title,`<button class="catalog-close" id="catalog-close">Voltar ao jogo ×</button><div class="refs">${chips(o)}</div><p>${o.description}</p><div class="choice-list">${order.map(c=>`<button class="choice" data-choice="${c.id}">${escapeHTML(c.label)}</button>`).join('')}</div><p class="feedback" id="choice-feedback" aria-live="polite"></p>`,{cls:'choice-dialog',noResume:true,noRestart:true});
 $('catalog-close').onclick=closeDialog;
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{const next=answer(state,b.dataset.choice);if(next.step===state.step){state=next;b.classList.add('wrong');b.disabled=true;$('choice-feedback').textContent=next.feedback;return;}closeDialog();applyState(next);});}
$('rules-info').onclick=()=>{openDialog('Fontes e origem do conteúdo',`<button class="catalog-close" id="catalog-close">Voltar ao jogo ×</button><p>Cada etapa mostra de onde vem o que está sendo cobrado:</p><ul class="rules-list"><li><b><span class="chip vigente" style="display:inline-block">${KINDS.vigente}</span></b>NR 5 — Comissão Interna de Prevenção de Acidentes e de Assédio (CIPA), com a redação da Portaria MTP 422/2021, alterada pela Portaria MTP 4.219/2022, incluído o Quadro I e o Anexo I (construção). Também outras NR (1, 7, 10, 11, 12, 15, 17, 18, 23, 26, 35) e leis (CLT, Lei 8.213/1991, Lei 14.457/2022) quando citadas.</li><li><b><span class="chip pratica" style="display:inline-block">${KINDS.pratica}</span></b>Procedimentos técnicos úteis, como as cores do mapa de riscos (verde: físico; vermelho: químico; marrom: biológico; amarelo: ergonômico; azul: acidente), a árvore de causas e medidas de acessibilidade. A NR 5 em vigor não fixa essas cores nem um método único.</li></ul><p>Etiquetas com “conferir subitem” indicam número de item, quadro ou artigo de lei que deve ser conferido no texto oficial antes do uso em sala de aula.</p>`,{cls:'choice-dialog',noResume:true,noRestart:true});$('catalog-close').onclick=closeDialog;};
function act(){if(paused||finished)return;const o=currentTarget(state);if(!o)return;
 if(!nearTarget(o)){notify('Aproxime-se do círculo azul para interagir.');return;}
 if(o.choices){openChoice();return;}
 const next=interact(state,o.id);
 if(next.step>state.step){playerAction={pose:'inspect',until:time+1.3};keys.clear();}
 applyState(next);}
function help(){const M=MODULES[state.module];openDialog(SINGLE?`NR 5 • CIPA • ${M.name}`:'Como jogar',`<p>${SINGLE?M.intro+' Siga o círculo azul.':'Escolha o grau de risco do estabelecimento e siga o círculo azul.'} Cada etapa traz uma decisão com três opções, só uma correta, e mostra a origem do conteúdo.</p><ul><li><strong>WASD / setas</strong>: mover. <strong>Shift</strong>: correr.</li><li><strong>E / AÇÃO</strong>: interagir no marcador.</li><li><strong>Losango verde</strong>: você. <strong>Losango azul e alvo luminoso</strong>: destino. As setas no chão mostram o caminho.</li><li><strong>Painel da CIPA</strong> (canto superior direito): grau de risco, carga horária do treinamento, tamanho da comissão e o <strong>mapa de riscos</strong>, que cresce a cada risco que você registra.</li><li><strong>Círculos coloridos no piso</strong>: riscos já registrados, na cor do grupo. Quanto maior o círculo, maior a gravidade.</li>${SINGLE?'':'<li><strong>Módulos</strong>: troca de grau de risco a qualquer momento.</li>'}<li><strong>Fontes</strong>: de onde vem cada conteúdo (em vigor ou boa prática).</li></ul>`,{noRestart:false});}
$('action').addEventListener('click',act);$('help').onclick=help;$('modules').onclick=()=>moduleMenu();
$('pause').onclick=()=>{if(paused&&!finished&&!$('overlay').hidden&&dialogMode!=='menu-dialog')closeDialog();else if(!finished&&$('overlay').hidden)openDialog('Missão pausada','<p>Continue quando estiver pronto.</p>');};
$('resume').onclick=closeDialog;$('restart').onclick=()=>startModule(state.module);
addEventListener('keydown',e=>{if(e.target instanceof HTMLButtonElement&&['Enter',' '].includes(e.key))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift','e',' '].includes(k))e.preventDefault();if(k==='e'&&!e.repeat)act();if(k==='escape'&&!finished){if(!$('overlay').hidden&&dialogMode==='choice-dialog')closeDialog();else if(dialogMode!=='menu-dialog'||state.step>0)$('pause').click();}if(!paused)keys.add(k);});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{keys.clear();if(!paused&&!finished)openDialog('Missão pausada','<p>Continue quando estiver pronto.</p>');});document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden&&!paused&&!finished)openDialog('Missão pausada','<p>Continue quando estiver pronto.</p>');});
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key.toLowerCase());};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(b.dataset.key.toLowerCase());});
const hw=detectHardware(renderer);const gfx=createRenderPipeline(renderer,scene,camera,sun);let qualityMode=savedQuality();
gfx.setLevel(qualityMode==='auto'?hw.level:qualityMode,false);
if(hw.mobile)renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
function syncQualityButton(){$('quality').textContent='Gráficos: '+(qualityMode==='auto'?'Auto · ':'')+QUALITY[gfx.level].label;}syncQualityButton();
$('quality').onclick=()=>{const order=['auto','baixa','media','alta'];qualityMode=order[(order.indexOf(qualityMode)+1)%4];try{localStorage.setItem('nr5-qualidade',qualityMode);}catch{}if(qualityMode==='auto'){gfx.setLevel(hw.level,false);fpsStable=0;}else gfx.setLevel(qualityMode);if(hw.mobile)renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));syncQualityButton();notify(qualityMode==='auto'?'Gráficos automáticos: o jogo ajusta a qualidade conforme o desempenho.':'Qualidade gráfica: '+QUALITY[gfx.level].label+'.');};
let fpsTime=0,fpsFrames=0,fpsStable=0,fpsStart=performance.now();
function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<650?60:52;camera.updateProjectionMatrix();gfx?.resize();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));}addEventListener('resize',()=>{resize();updateLabelBounds();});resize();
// Setas no chão: mostram o caminho até o destino, contornando obstáculos, e somem ao chegar perto.
const guideMat=new T.MeshBasicMaterial({color:'#7dfcff',transparent:true,opacity:.9,depthTest:false,depthWrite:false,toneMapped:false,side:T.DoubleSide});
const guideGeo=(()=>{const s=new T.Shape();s.moveTo(0,.5);s.lineTo(.42,-.08);s.lineTo(.22,-.08);s.lineTo(0,.2);s.lineTo(-.22,-.08);s.lineTo(-.42,-.08);s.closePath();return new T.ShapeGeometry(s);})();
const GUIDE_STEP=1.8,guideArrows=[];for(let i=0;i<48;i++){const m=new T.Mesh(guideGeo,guideMat);m.rotation.x=-Math.PI/2;m.renderOrder=8;m.visible=false;scene.add(m);guideArrows.push(m);}
let guidePath=[],guideLen=[],guideTimer=0;const yAxis=new T.Vector3(0,1,0);
function refreshGuide(a){const r=findRoute(player.position,a,obstacles,gridOf(state.module));guidePath=r;guideLen=[0];for(let i=1;i<r.length;i++)guideLen.push(guideLen[i-1]+Math.hypot(r[i].x-r[i-1].x,r[i].z-r[i-1].z));}
function updateGuide(dt,a,reach){
 guideTimer-=dt;if(a&&guideTimer<=0){guideTimer=.35;refreshGuide(a);}
 const total=guideLen.at(-1)||0,stop=Math.max(0,total-reach*.75);let k=0;
 if(a&&guidePath.length>2&&!finished){const flow=(time*1.6)%GUIDE_STEP;let j=1;
  for(let s=flow+2.2;s<stop&&k<guideArrows.length;s+=GUIDE_STEP){while(j<guidePath.length-1&&guideLen[j]<s)j++;const p0=guidePath[j-1],p1=guidePath[j],seg=Math.max(1e-6,guideLen[j]-guideLen[j-1]),t=Math.min(1,Math.max(0,(s-guideLen[j-1])/seg));
   const x=p0.x+(p1.x-p0.x)*t,z=p0.z+(p1.z-p0.z)*t;let dx=p1.x-p0.x,dz=p1.z-p0.z;if(Math.hypot(dx,dz)<1e-4){const q=guidePath[Math.min(j+1,guidePath.length-1)];dx=q.x-p0.x;dz=q.z-p0.z;}
   const m=guideArrows[k++];m.visible=true;m.position.set(x,.09,z);m.rotation.set(-Math.PI/2,0,0);m.rotateOnWorldAxis(yAxis,Math.atan2(-dx,-dz));m.scale.setScalar(.85+.15*Math.sin(time*5-s));}}
 for(;k<guideArrows.length;k++)guideArrows[k].visible=false;
}
let last=performance.now(),settleNext=false;const v=new T.Vector3();
// Usado só pela verificação automática: leva câmera e equipe direto ao estado final da transição.
function settle(desired){look.copy(desired);for(const w of workers)if(w.route.length){const p=w.route.at(-1);w.rig.position.set(p.x,0,p.z);w.route=[];}}
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;
 if(!paused){time+=dt;elapsed+=dt;let sx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),sy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
  const n=(playerAction&&time<playerAction.until)?0:Math.hypot(sx,sy);
  if(n){sx/=n;sy/=n;const speed=keys.has('shift')?8.5:5.2;const dx=sx*speed*dt,dz=sy*speed*dt;if(free(player.position.x+dx,player.position.z))player.position.x+=dx;if(free(player.position.x,player.position.z+dz))player.position.z+=dz;const a=Math.atan2(dx,dz);const d=Math.atan2(Math.sin(a-player.rotation.y),Math.cos(a-player.rotation.y))*.22;player.rotation.y+=d;playerMove={speed,turn:d/Math.max(dt,.001)};}else playerMove={speed:0,turn:0};}
 else time+=dt*.25;
 unstick();const mobile=innerWidth<850;const tgt=currentTarget(state),tgtA=tgt&&!finished?anchorOf(tgt):null;
 const desired=new T.Vector3(player.position.x+(mobile?0:camShiftX*.6),0,player.position.z);
 if(tgtA){const dist=Math.hypot(tgtA.x-player.position.x,tgtA.z-player.position.z);const k=Math.min(.32,.12+Math.max(0,dist-5)*.028);desired.x+=(tgtA.x-desired.x)*k;desired.z+=(tgtA.z-desired.z)*k;}
 camDist+=((window.__nr5?.zoom||1)-camDist)*Math.min(1,dt*2);look.lerp(desired,Math.min(1,dt*7));if(settleNext){settleNext=false;settle(desired);}
 camera.position.copy(look).addScaledVector(camOffset,camDist);camera.lookAt(look.x,look.y+.6,look.z);
 sun.position.set(look.x-12,19,look.z+8);sun.target.position.set(look.x,0,look.z);
 const seeThrough=[{x:player.position.x,y:1.4,z:player.position.z},{x:player.position.x,y:.45,z:player.position.z}];if(tgtA)seeThrough.push({x:tgtA.x,y:.9,z:tgtA.z});updateSeeThrough(dt,seeThrough);
 SC.trees.forEach(t=>{t.foliage.rotation.z=Math.sin(time*1.4+t.seed)*.02;t.foliage.rotation.x=Math.sin(time*1.1+t.seed*2)*.012;});
 updateWorkers(paused?0:dt);
 updateGuide(dt,tgtA,tgt?reachOf(tgt):1.6);
 const o=currentTarget(state);if(o&&!finished){const an=anchorOf(o);const personal=!!o.who;targetRing.position.set(an.x,.06,an.z);targetRing.scale.setScalar(personal?.85:Math.min(1.6,Math.max(1,reachOf(o)/1.6)));marker.position.set(an.x,(personal?2.95+(an.y||0):2.7)+Math.sin(time*3)*.14,an.z);diamond.rotation.y=time*.7;const pulse=(time*.65)%1;targetPulse.scale.setScalar(1+pulse*.42);targetPulse.material.opacity=.28*(1-pulse);playerDiamond.position.y=2.3+Math.sin(time*2.7)*.06;playerDiamond.rotation.y=time*.6;v.copy(marker.position);v.y+=.7;v.project(camera);let ly=Math.max(innerWidth<600?330:110,Math.min(innerHeight-135,(-v.y*.5+.5)*innerHeight));const lx=Math.max(labelBounds.min,Math.min(labelBounds.max,(v.x*.5+.5)*innerWidth));const wr=$('ep').getBoundingClientRect(),lw=$('target-label').offsetWidth/2;if(lx+lw>wr.left-6&&lx-lw<wr.right+6&&ly>wr.top-10&&ly<wr.bottom+46)ly=wr.bottom+46;$('target-label').style.left=`${lx}px`;$('target-label').style.top=`${ly}px`;const near=nearTarget(o);$('action').classList.toggle('near',near);$('action-hint').textContent=near?'PRESSIONE PARA INTERAGIR':'SIGA O MARCADOR';}
 if(!paused&&playerChar){const la=tgtA&&playerMove.speed<.1?tgtA:null;const pose=(playerAction&&time<playerAction.until)?playerAction.pose:'none';playerChar.setPose(pose);playerChar.update(dt,playerMove.speed,{turn:playerMove.turn,lookAt:la});}
 fpsTime+=dt;fpsFrames++;if(fpsTime>4&&performance.now()-fpsStart>8000){const fps=fpsFrames/fpsTime;fpsTime=0;fpsFrames=0;
  if(qualityMode==='auto'&&!document.hidden){const order=['baixa','media','alta'],i=order.indexOf(gfx.level);
   if(fps<28&&i>0){gfx.setLevel(order[i-1],false);fpsStable=0;if(hw.mobile)renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));syncQualityButton();notify('Gráficos ajustados para '+QUALITY[gfx.level].label+' para manter o jogo fluido.');}
   else if(fps>56&&i<2&&!hw.mobile&&++fpsStable>=4){gfx.setLevel(order[i+1],false);fpsStable=0;syncQualityButton();}
   else if(fps<=56)fpsStable=0;}}
 gfx.setHeat(0);gfx.render(time);}
player.position.set(lot.start.x,0,lot.start.z);buildPlayer();buildWorkers();applyModuleChrome();updateHUD();
requestAnimationFrame(frame);
if(SINGLE){startModule(moduleId);help();}else if(location.hash.slice(1)&&MODULE_IDS.includes(location.hash.slice(1)))startModule(moduleId);else moduleMenu(true);
// Gancho de teste (leitura do estado e avanço da etapa) usado pela verificação automática no navegador.
window.__nr5={get state(){return state;},get player(){return player.position;},zoom:0,settle(){settleNext=true;},stepId:()=>currentTarget(state)?.id??null,start:startModule,get render(){return {...renderer.info.render,tex:renderer.info.memory.textures,geo:renderer.info.memory.geometries};},canMove:free,teleport:(x,z)=>player.position.set(x,0,z),anchor:()=>{const o=currentTarget(state);const a=o&&anchorOf(o);return a&&{x:a.x,z:a.z,r:reachOf(o)};},workers:()=>workers.map(w=>({name:w.name,phase:w.phase,x:+w.rig.position.x.toFixed(2),y:+w.rig.position.y.toFixed(2),z:+w.rig.position.z.toFixed(2)})),items:()=>Object.fromEntries(Object.entries(SC.items).filter(([k])=>k.startsWith(state.module+'.')).map(([k,it])=>[k,it.obj.visible])),risks:()=>risksOf(state),
 advance(){const o=currentTarget(state);if(!o||finished)return false;if(o.choices){const c=o.choices.find(x=>x.correct);applyState(answer(state,c.id));return true;}applyState(interact(state,o.id));return true;},act,closeDialog};
