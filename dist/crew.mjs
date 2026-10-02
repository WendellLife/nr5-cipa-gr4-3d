import {canMove,done,currentTarget} from './rules.mjs';
import {W,lots} from './layout.mjs';
// Fase de cada pessoa da equipe conforme o andamento do jogo. A equipe e os estados vêm de layout.mjs:
// cada pessoa tem posição, pose e tarefa de base e uma lista de estados; vale o último estado cuja condição é atendida.
// Condições: cur (é a etapa atual), after (etapa já concluída), before (etapa ainda não concluída).
// tone: info (rotina), alerta (situação a resolver), perigo (vítima), ok (situação resolvida).
export function phaseOf(module,name,s){
 const r=lots[module].roster[name];
 let ph={key:'base',label:r.task,tone:'info',pose:r.pose||'none',at:{x:r.x,z:r.z},angle:r.angle??0,y:r.y||0,hidden:false};
 if(s.finished)return {...ph,key:'fim',label:'Mandato cumprido',tone:'ok'};
 const cur=currentTarget(s)?.id;
 (r.states||[]).forEach((st,i)=>{
  if(st.cur&&st.cur!==cur)return;if(st.after&&!done(s,st.after))return;if(st.before&&done(s,st.before))return;
  ph={...ph,key:'s'+i,label:st.label??ph.label,tone:st.tone??'info',pose:st.pose??ph.pose,at:st.at??{x:r.x,z:r.z},angle:st.angle??r.angle??0,hidden:!!st.hidden};
 });
 return ph;
}
// Busca em grade (BFS com diagonais) entre dois pontos, respeitando os obstáculos e os limites do lote.
const SIZE=.4,COLS=Math.ceil((W.maxX-W.minX)/SIZE),ROWS=Math.ceil((W.maxZ-W.minZ)/SIZE);
const pointOf=i=>({x:W.minX+(i%COLS)*SIZE,z:W.minZ+Math.floor(i/COLS)*SIZE});
export function walkableGrid(obstacles,bounds){const a=new Uint8Array(COLS*ROWS);for(let i=0;i<a.length;i++){const p=pointOf(i);a[i]=canMove(p.x,p.z,obstacles,bounds)?1:0;}return a;}
export function findRoute(start,goal,obstacles,grid){
 const key=(x,z)=>z*COLS+x;
 const nearest=p=>{let best=-1,dist=Infinity;for(let i=0;i<grid.length;i++){if(!grid[i])continue;const q=pointOf(i),d=(p.x-q.x)**2+(p.z-q.z)**2;if(d<dist){dist=d;best=i;}}return best;};
 const from=nearest(start),to=nearest(goal);if(from<0||to<0)return [];
 const previous=new Int32Array(grid.length).fill(-1),queue=[from];previous[from]=from;
 for(let head=0;head<queue.length&&previous[to]<0;head++){const id=queue[head],x=id%COLS,z=Math.floor(id/COLS);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,nz=z+dz;if(nx<0||nx>=COLS||nz<0||nz>=ROWS)continue;const next=key(nx,nz);if(!grid[next]||previous[next]>=0)continue;if(dx&&dz&&(!grid[key(x+dx,z)]||!grid[key(x,z+dz)]))continue;previous[next]=id;queue.push(next);}}
 if(previous[to]<0)return [];const route=[];for(let id=to;id!==from;id=previous[id])route.push(pointOf(id));route.push(pointOf(from));return route.reverse();
}
