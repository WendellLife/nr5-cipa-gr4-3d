// Planta do estabelecimento. O lote é descrito em coordenadas
// locais (x de -13,5 a 13,5; z de -11,5 a 11,5) e convertido para o mundo somando o deslocamento "ox".
// Usado pelo cenário 3D (scenery.mjs, game.mjs) e pelos testes, para garantir que todo destino é alcançável.
export const LOT = {halfW:13.4,halfD:11.4};
const U = { // uniformes
 escritorio:{pants:'#2f3a4a',shoes:'#2b2622',helmet:null,vest:null,gloves:null},
 loja:{pants:'#2b3440',shoes:'#2b2622',helmet:null,vest:null,gloves:null},
 fabrica:{pants:'#3b4a5a',shoes:'#2b2622',helmet:'#f2f2ec',vest:null,gloves:'#6b5a3e'},
 obra:{pants:'#4a4f58',shoes:'#2b2622',helmet:'#e8aa21',vest:'#ed8b32',gloves:'#6b5a3e'}
};
function makeLot(ox,def){
 const structures={};for(const [k,[x,z,w,d]] of Object.entries(def.structures))structures[k]={x:x+ox,z,w,d};
 const spots={};for(const [k,[x,z]] of Object.entries(def.spots))spots[k]={x:x+ox,z};
 const roster={};for(const [n,p] of Object.entries(def.roster))roster[n]={...p,x:p.x+ox,states:(p.states||[]).map(s=>s.at?{...s,at:{x:s.at[0]+ox,z:s.at[1]}}:s)};
 return {ox,local:def,structures,spots,roster,start:{x:def.start[0]+ox,z:def.start[1]},
  bounds:{minX:ox-LOT.halfW,maxX:ox+LOT.halfW,minZ:-LOT.halfD,maxZ:LOT.halfD}};
}
export const lots = {};
// Grau de risco 4 — canteiro de obras de um edifício, 60 empregados próprios, obra de 14 meses.
lots.gr4 = makeLot(45,{
 start:[0,9.6],
 structures:{
  pil1:[-9,-9,.5,.5],pil2:[-3,-9,.5,.5],pil3:[-9,-4,.5,.5],pil4:[-3,-4,.5,.5],
  andaime:[2.4,-8.6,3,1.2],vala:[9.4,-5,1.4,7],betoneira:[4.6,-2.4,1.2,1.2],quadro:[-12,1,.5,.9],
  armacao:[-7.4,2.2,1.8,.8],corte:[-1.6,-.8,1.6,.8],pilha:[.4,3.2,2,1.4],guincho:[-.6,-6.4,1,1],
  container:[8,6.6,5,2.4],board:[2.4,6.4,2.4,.3]
 },
 spots:{board:[2.4,7.7],container:[5,8.6],portao:[11.4,9.8],laje:[-6,-2.6],vala:[7.4,-3],andaime:[2.4,-7.2],quadro:[-10.9,1],mapa:[4.4,5],carga:[.8,-5.2],entrega:[-10.6,8.6]},
 roster:{
  Valter:{role:'Mestre de obras • presidente da CIPA',look:{body:'male',surface:'#3b4a5a',skin:'#e0ac69',beard:true,...U.obra,helmet:'#f2f2ec'},x:6.2,z:9.2,angle:-Math.PI/2,pose:'phone',task:'Cobrando o cronograma'},
  Cida:{role:'Técnica de segurança',look:{body:'female',surface:'#e9e4d6',skin:'#8d5524',...U.obra,helmet:'#2f8a57',gloves:null,backLabel:{text:'SEGURANÇA',bg:'#1f5f4a'}},x:1,z:5.2,angle:0,pose:'inspect',task:'Conferindo as permissões de trabalho',
   states:[{cur:'acidente',label:'Chamou o 192 • isolando a área',tone:'alerta',pose:'phone',at:[2.2,-5],angle:-Math.PI/2}]},
  Zé:{role:'Pedreiro • periferia da laje',look:{body:'male',surface:'#b0413e',skin:'#8d5524',...U.obra},x:-6,z:-3.95,y:3.3,angle:0,pose:'repair',task:'Na borda da laje, sem guarda-corpo',
   states:[{after:'altura',label:'Guarda-corpo instalado • cinto ancorado',tone:'ok',pose:'repair'}]},
  Tonho:{role:'Servente',look:{body:'male',surface:'#6f9bd1',skin:'#c68642',...U.obra},x:7.6,z:-5,angle:Math.PI/2,pose:'repair',task:'Na vala de 2 m, sem escoramento',
   states:[{after:'escavacao',before:'acidente',label:'Vala escorada • escada de acesso',tone:'ok',pose:'repair'},{cur:'acidente',label:'Atingido por material • acidente grave',tone:'perigo',pose:'victim',at:[.8,-4.6],angle:0},{after:'acidente',label:'Hospitalizado • fora de perigo',tone:'ok',pose:'none',at:[.8,-4.6],angle:0,hidden:true}]},
  Lu:{role:'Armadora • empreiteira',look:{body:'female',surface:'#4a7c59',skin:'#c68642',...U.obra,helmet:'#2f7fb8'},x:-7.4,z:3.3,angle:Math.PI,pose:'repair',task:'Empreiteira de armação • 7 no canteiro',
   states:[{cur:'assedio',label:'Alvo de “piadas” no canteiro',tone:'alerta',pose:'none'},{after:'assedio',label:'Acolhida • conduta apurada',tone:'ok',pose:'repair'}]},
  Beto:{role:'Azulejista',look:{body:'male',surface:'#8a6d4a',skin:'#f1c27d',...U.obra},x:-1.6,z:.3,angle:Math.PI,pose:'repair',task:'Cortando cerâmica a seco',
   states:[{after:'poeira',label:'Corte úmido • respirador PFF2',tone:'ok',pose:'repair'}]}
 }
});
export const LOT_IDS = Object.keys(lots);
export const staticObstacles = LOT_IDS.flatMap(k => Object.values(lots[k].structures));
// Área total, para a grade de rotas.
export const W = {minX:Math.min(...LOT_IDS.map(k=>lots[k].bounds.minX)),maxX:Math.max(...LOT_IDS.map(k=>lots[k].bounds.maxX)),minZ:-LOT.halfD,maxZ:LOT.halfD};
