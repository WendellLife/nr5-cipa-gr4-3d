import assert from 'node:assert/strict';
import * as r from './dist/rules.mjs';
import {phaseOf,findRoute,walkableGrid} from './dist/crew.mjs';
import {lots,staticObstacles} from './dist/layout.mjs';
const IDS={
 gr1:['treinamento','organizacao','posto','inspecao','acidente','assedio','inclusao','reuniao','plano','garantia'],
 gr2:['treinamento','dimensionamento','eleicao','transito','frio','ergonomia','serra','acidente','assedio','inclusao','faltas','plano'],
 gr3:['treinamento','pgr','ruido','iminente','quimicos','solda','mapa','acidente','investigacao','cat','doenca','assedio','reabilitado','contratada'],
 gr4:['treinamento','canteiro','frente','empreiteira','altura','escavacao','andaime','eletrica','poeira','mapa','acidente','investigacao','assedio','legislacao','integracao','encerramento']
};
const FACTS={gr1:{gr:1,horas:8,emp:120,ef:1,su:1},gr2:{gr:2,horas:12,emp:160,ef:3,su:2},gr3:{gr:3,horas:16,emp:90,ef:2,su:1},gr4:{gr:4,horas:20,emp:60,ef:3,su:2}};
const has=m=>r.MODULE_IDS.includes(m);
const correctOf=o=>o.choices.find(c=>c.correct);
const pos=(m,id)=>r.indexOf(m,id);
const obj=(m,id)=>r.objectivesOf(m)[pos(m,id)];

// 1. Módulos, ordem e quantidade das etapas
assert.ok(r.MODULE_IDS.length>=1&&r.MODULE_IDS.every(m=>IDS[m]),'Módulos conhecidos');
for(const m of r.MODULE_IDS){
 assert.deepEqual(r.objectivesOf(m).map(o=>o.id),IDS[m],`${m}: ordem das etapas`);
 assert.equal(new Set(IDS[m]).size,IDS[m].length,`${m}: ids únicos`);
 const M=r.MODULES[m];assert.ok(M.name&&M.course&&M.role&&M.intro&&M.summary&&M.place&&M.estab&&M.cipa,`${m}: textos do módulo`);
 assert.ok(lots[m],`${m}: lote do estabelecimento`);
}

// 2. Cada decisão: três opções, uma única correta, feedback didático em todas
for(const m of r.MODULE_IDS)for(const o of r.objectivesOf(m)){
 assert.ok(o.title&&o.description&&o.tip,`${m}/${o.id}: título, descrição e dica`);
 assert.equal(o.choices.length,3,`${m}/${o.id}: três opções`);
 assert.equal(o.choices.filter(c=>c.correct).length,1,`${m}/${o.id}: uma única correta`);
 assert.equal(new Set(o.choices.map(c=>c.id)).size,3,`${m}/${o.id}: ids das opções únicos`);
 for(const c of o.choices)assert.ok(c.label&&c.feedback&&c.feedback.length>25,`${m}/${o.id}/${c.id}: feedback didático`);
}

// 3. Referências: origem válida e itens da NR 5 conferidos no texto em vigor (Portaria MTP 422/2021, alterada pela 4.219/2022)
const NR5=['5.3.1','5.3.2','5.3.3','5.4.1','5.4.3','5.4.4','5.4.5','5.4.6','5.4.11','5.4.12','5.4.12.1','5.5.3','5.5.4','5.5.4.1',
 '5.6.1','5.6.3','5.6.3.2','5.6.4','5.6.6','5.6.7','5.6.8','5.7.1','5.7.1.1','5.7.2','5.7.4','5.7.4.1','5.7.4.2','5.7.4.3','5.7.4.4','5.7.4.5',
 '5.8.2','5.8.4','5.8.6','5.8.7','5.9.1','5.9.2'];
const ANEXO1=['3.1','3.1.2','3.1.3','3.2','3.2.1','3.2.2','3.3','3.5','3.5.1','3.6','3.6.1','3.7','3.7.1','3.7.2'];
const ALINEAS={'5.3.1':'abcdefghij','5.3.2':'abc','5.5.3':'abcdefghij','5.6.4':'ab','5.7.2':'abcdefgh','5.7.4':'abcd'};
for(const m of r.MODULE_IDS)for(const o of r.objectivesOf(m)){
 assert.ok(o.refs?.length>=1,`${m}/${o.id}: referência`);
 for(const ref of o.refs){assert.ok(ref.norm&&ref.item,`${o.id}: norma e item`);assert.ok(r.KINDS[ref.kind],`${o.id}: origem válida`);
  if(ref.norm==='NR 5'){const n=ref.item.match(/^5(\.\d+)+/);assert.ok(n&&NR5.includes(n[0]),`${m}/${o.id}: item da NR 5 conferido (${ref.item})`);assert.equal(ref.kind,'vigente');
   for(const a of ref.item.matchAll(/\b([a-j])\)/g))assert.ok(ALINEAS[n[0]]?.includes(a[1]),`${m}/${o.id}: alínea existente (${ref.item})`);}
  if(/Anexo I/.test(ref.norm)){const n=ref.item.match(/^3(\.\d+)+/);assert.ok(n&&ANEXO1.includes(n[0]),`${m}/${o.id}: item do Anexo I conferido (${ref.item})`);}
  if(/Quadro I/.test(ref.norm)||/^(Lei|CLT)/.test(ref.norm))assert.ok(ref.check,`${m}/${o.id}: quadro e artigo de lei pedem conferência`);
  if(/Mapa de riscos|Método|Acessibilidade|Boa prática/.test(ref.norm))assert.equal(ref.kind,'pratica','Cores do mapa e métodos são boa prática');}
 assert.ok(r.refSummary(o).every(x=>x.label&&x.status));
}
// Conteúdo mínimo do treinamento (5.7.2 a–h): cada módulo cobre riscos, acidentes, investigação, higiene, legislação, inclusão, organização e assédio.
for(const m of r.MODULE_IDS){
 const ids=IDS[m],some=(...xs)=>xs.some(x=>ids.includes(x));
 assert.ok(some('inspecao','transito','pgr','altura'),`${m}: a) ambiente e riscos`);assert.ok(ids.includes('acidente'),`${m}: b) acidentes`);
 assert.ok(some('investigacao')||/caus|fatos/i.test(correctOf(obj(m,'acidente')).label),`${m}: c) investigação`);
 assert.ok(some('posto','frio','ruido','poeira'),`${m}: d) higiene e prevenção`);assert.ok(some('garantia','faltas','cat','legislacao'),`${m}: e) legislação`);
 assert.ok(some('inclusao','reabilitado')||m==='gr4',`${m}: f) inclusão`);assert.ok(some('organizacao','dimensionamento','pgr','canteiro'),`${m}: g) organização da CIPA`);assert.ok(ids.includes('assedio'),`${m}: h) assédio`);
 assert.ok(obj(m,'assedio').refs.some(x=>x.item==='5.3.1 j)')&&obj(m,'assedio').refs.some(x=>/14\.457/.test(x.norm)));
 assert.ok(/sigilo/.test(correctOf(obj(m,'assedio')).label)||/canal/.test(correctOf(obj(m,'assedio')).label),`${m}: assédio com sigilo e canal`);
}

// 4. Treinamento por grau de risco (5.7.4) e dimensionamento (Quadro I) coerentes com os textos
assert.deepEqual([1,2,3,4].map(g=>r.TREINAMENTO[g].horas),[8,12,16,20]);assert.deepEqual([1,2,3,4].map(g=>r.TREINAMENTO[g].presencial),[0,4,8,8]);
assert.deepEqual([1,2,3,4].map(r.diasMinimos),[1,2,2,3]);
assert.deepEqual(r.dimensionar(1,80),{efetivos:0,suplentes:0},'GR 1: sem CIPA até 80');assert.deepEqual(r.dimensionar(1,81),{efetivos:1,suplentes:1});
assert.deepEqual(r.dimensionar(2,50),{efetivos:0,suplentes:0},'GR 2: sem CIPA até 50');assert.deepEqual(r.dimensionar(2,51),{efetivos:1,suplentes:1});
assert.deepEqual(r.dimensionar(3,19),{efetivos:0,suplentes:0});assert.deepEqual(r.dimensionar(3,20),{efetivos:1,suplentes:1});assert.deepEqual(r.dimensionar(3,50),{efetivos:1,suplentes:1});
assert.deepEqual(r.dimensionar(4,19),{efetivos:0,suplentes:0});assert.deepEqual(r.dimensionar(4,20),{efetivos:1,suplentes:1});assert.equal(r.dimensionar(4,20000),null);
for(const g of [1,2,3,4]){assert.equal(r.QUADRO_I[g].ef.length,r.FAIXAS.length);assert.equal(r.QUADRO_I[g].su.length,r.FAIXAS.length);
 for(let i=1;i<r.FAIXAS.length;i++){assert.ok(r.QUADRO_I[g].ef[i]>=r.QUADRO_I[g].ef[i-1],'Efetivos não diminuem');assert.ok(r.QUADRO_I[g].su[i]<=r.QUADRO_I[g].ef[i],'Suplentes não passam dos efetivos');}}
const NUM=['zero','um','dois','três','quatro'];
for(const m of r.MODULE_IDS){
 const F=FACTS[m],M=r.MODULES[m],t=obj(m,'treinamento');
 assert.equal(M.gr,F.gr);assert.equal(M.horas,F.horas);assert.equal(r.TREINAMENTO[F.gr].horas,F.horas);
 assert.ok(correctOf(t).label.includes(`${F.horas} horas`),`${m}: resposta cita ${F.horas} horas`);assert.ok(t.tip.includes(`${F.horas} horas`));
 assert.ok(t.refs.some(x=>x.item===`5.7.4 ${'abcd'[F.gr-1]})`),`${m}: alínea da carga horária`);
 assert.ok(M.estab.includes(String(F.emp)),`${m}: número de empregados`);
 assert.deepEqual(r.dimensionar(F.gr,F.emp),{efetivos:F.ef,suplentes:F.su},`${m}: Quadro I`);
 assert.ok(M.cipa.startsWith(`${F.ef} efetivo`)&&M.cipa.includes(`${F.su} suplente`),`${m}: texto do tamanho da CIPA`);
 if(F.gr>1)assert.ok(correctOf(t).label.includes(`${r.TREINAMENTO[F.gr].presencial} horas presenciais`));
 if(r.diasMinimos(F.gr)>1)assert.ok(correctOf(t).label.includes(`${NUM[r.diasMinimos(F.gr)]} dias`),`${m}: dias mínimos`);
}
if(has('gr2')){assert.ok(correctOf(obj('gr2','dimensionamento')).label.startsWith('3 efetivos e 2 suplentes'));assert.ok(/um terço/.test(correctOf(obj('gr2','eleicao')).label));assert.ok(/mais de quatro/.test(obj('gr2','faltas').tip));}
if(has('gr4')){assert.ok(/3 efetivos e 2 suplentes/.test(correctOf(obj('gr4','canteiro')).label));assert.ok(/180 dias/.test(correctOf(obj('gr4','canteiro')).label));assert.ok(/8 horas/.test(correctOf(obj('gr4','frente')).label));}
if(has('gr3')){assert.ok(pos('gr3','iminente')<pos('gr3','acidente')&&pos('gr3','acidente')<pos('gr3','investigacao')&&pos('gr3','investigacao')<pos('gr3','reabilitado'));assert.ok(obj('gr3','acidente').refs.some(x=>x.item==='5.6.4 a)'));}

// 5. Fluxo completo com erros, em cada módulo
for(const m of r.MODULE_IDS){
 let s=r.initialState(m);
 for(const o of r.objectivesOf(m)){
  assert.equal(r.interact(s,o.id).step,s.step,'Decisão exige escolha');
  for(const c of o.choices.filter(c=>!c.correct)){const n=r.answer(s,c.id);assert.equal(n.step,s.step,'Erro não avança');assert.equal(n.errors,s.errors+1);assert.equal(n.feedback,c.feedback);s={...s,errors:n.errors};}
  const n=r.answer(s,correctOf(o).id);assert.equal(n.step,s.step+1);s=n;
 }
 assert.equal(s.finished,true,`${m}: termina`);assert.equal(s.errors,r.objectivesOf(m).length*2,`${m}: dois erros por decisão`);
 // Mapa de riscos: cresce só com as etapas concluídas, grupos e tamanhos válidos.
 assert.equal(r.risksOf(r.initialState(m)).length,0);const risks=r.risksOf(s);assert.ok(risks.length>=3,`${m}: riscos registrados`);
 for(const k of risks){assert.ok(r.RISK_GROUPS[k.g],`${m}: grupo de risco válido`);assert.ok([1,2,3].includes(k.size));}
 assert.ok(new Set(risks.map(k=>k.g)).size>=2,`${m}: mais de um grupo de risco`);
}

// 6. Objetos do cenário: nomes do módulo, "during" só na etapa atual
for(const m of r.MODULE_IDS){
 const at=id=>({...r.initialState(m),step:pos(m,id),completed:IDS[m].slice(0,pos(m,id))});
 const after=id=>({...r.initialState(m),step:pos(m,id)+1,completed:IDS[m].slice(0,pos(m,id)+1)});
 for(const o of r.objectivesOf(m)){for(const k of [...(o.fx?.show||[]),...(o.fx?.hide||[]),...(o.during||[])])assert.ok(k.startsWith(m+'.'),`${m}/${o.id}: objeto do próprio módulo (${k})`);
  for(const k of o.fx?.show||[]){assert.ok(!r.visibleItems(at(o.id))[k],`${k}: oculto antes`);assert.ok(r.visibleItems(after(o.id))[k],`${k}: visível depois`);}
  for(const k of o.fx?.hide||[]){assert.ok(r.visibleItems(at(o.id),{[k]:true})[k]);assert.ok(!r.visibleItems(after(o.id),{[k]:true})[k]);}
  for(const k of o.during||[]){assert.ok(r.visibleItems(at(o.id))[k],`${k}: visível durante`);assert.ok(!r.visibleItems(after(o.id))[k],`${k}: some depois`);assert.ok(!r.visibleItems(r.initialState(m))[k]);}}
}

// 7. Planta e equipe: tudo dentro do lote, livre e alcançável
for(const m of r.MODULE_IDS){
 const lot=lots[m],grid=walkableGrid(staticObstacles,lot.bounds),free=p=>r.canMove(p.x,p.z,staticObstacles,lot.bounds);
 const reach=(from,target,radius)=>{const route=findRoute(from,target,staticObstacles,grid);if(!route.length)return false;const end=route.at(-1);return Math.hypot(end.x-target.x,end.z-target.z)<=radius;};
 assert.ok(free(lot.start),`${m}: início livre`);
 for(const [k,p] of Object.entries(lot.spots))assert.ok(free(p),`${m}: ponto ${k} livre`);
 const ids=IDS[m];
 for(const [n,p] of Object.entries(lot.roster)){assert.ok(p.role&&p.task&&p.look,`${m}/${n}: função, tarefa e aparência`);assert.ok(free(p),`${m}/${n}: posição livre`);
  for(const st of p.states||[]){for(const k of ['cur','after','before'])if(st[k])assert.ok(ids.includes(st[k]),`${m}/${n}: etapa conhecida (${st[k]})`);if(st.at){assert.ok(free(st.at),`${m}/${n}: destino livre (${st.label})`);assert.ok(reach(p,st.at,.5),`${m}/${n}: rota (${st.label})`);}}}
 for(const o of r.objectivesOf(m)){const a=o.who?lot.roster[o.who]:o;assert.ok(a&&a.x!==undefined,`${m}/${o.id}: âncora`);assert.ok(reach(lot.start,a,o.r??2),`${m}/${o.id}: destino acessível`);
  // Quem é alvo de uma etapa pode ter mudado de lugar: o destino continua alcançável.
  if(o.who){const s={...r.initialState(m),step:pos(m,o.id),completed:ids.slice(0,pos(m,o.id))};const ph=phaseOf(m,o.who,s);assert.ok(!ph.hidden,`${m}/${o.id}: pessoa visível`);assert.ok(reach(lot.start,ph.at,2),`${m}/${o.id}: pessoa alcançável`);}}
 assert.equal(r.canMove(lot.bounds.maxX+1,0,staticObstacles,lot.bounds),false,`${m}: limite do lote`);
}
// Fases da equipe
if(has('gr1')){const s={...r.initialState('gr1'),step:pos('gr1','acidente'),completed:IDS.gr1.slice(0,pos('gr1','acidente'))};assert.equal(phaseOf('gr1','Lia',s).tone,'perigo');assert.equal(phaseOf('gr1','Lia',r.initialState('gr1')).tone,'info');}
if(has('gr3')){const upTo=id=>({...r.initialState('gr3'),step:pos('gr3',id)+1,completed:IDS.gr3.slice(0,pos('gr3',id)+1)});
 assert.equal(phaseOf('gr3','Dênis',upTo('iminente')).tone,'ok');assert.equal(phaseOf('gr3','Dênis',{...upTo('mapa')}).tone,'perigo','Acidente na etapa atual');assert.equal(phaseOf('gr3','Dênis',upTo('reabilitado')).label,'Reabilitado • função compatível');}
if(has('gr4')){const s={...r.initialState('gr4'),step:pos('gr4','acidente')+1,completed:IDS.gr4.slice(0,pos('gr4','acidente')+1)};assert.ok(phaseOf('gr4','Tonho',s).hidden,'Tonho hospitalizado sai de cena');assert.equal(phaseOf('gr4','Zé',r.initialState('gr4')).y,3.3,'Zé trabalha na laje');}
console.log(`PASS: ${r.MODULE_IDS.map(m=>r.MODULES[m].name+' ('+r.objectivesOf(m).length+' etapas)').join(', ')} — uma resposta certa por decisão, itens da NR 5 em vigor, carga horária e Quadro I, conteúdo mínimo do 5.7.2, mapa de riscos, objetos do cenário, equipe e acessibilidade`);
