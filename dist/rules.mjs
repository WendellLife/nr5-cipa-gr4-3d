// Regras do jogo NR 5 • CIPA • Grau de risco 4 (canteiro de obras), no mesmo padrão dos demais jogos da série.
// Cada etapa traz as referências normativas em "refs". O campo "kind" diz de onde vem o conteúdo:
//  vigente → NR 5 em vigor (Portaria MTP 422/2021, alterada pela Portaria MTP 4.219/2022), outras NR e leis citadas.
//  pratica → boa prática técnica, que não é item de NR.
// "check:true" marca número de item, quadro ou artigo que deve ser conferido no texto consolidado antes de usar em treinamento.
// "risk" registra o risco no mapa de riscos do jogo (grupo e tamanho do círculo); "fx" liga e desliga objetos do cenário.
import {lots} from './layout.mjs';
export const KINDS = {
 vigente:'Em vigor',
 pratica:'Boa prática — não é item de NR'
};
// Grupos do mapa de riscos (cores convencionais; a NR 5 em vigor não fixa cores).
export const RISK_GROUPS = {
 fisico:{label:'Físico',color:'#2e9e4f'},quimico:{label:'Químico',color:'#d6362b'},biologico:{label:'Biológico',color:'#8a5a2b'},
 ergonomico:{label:'Ergonômico',color:'#f2c21c'},acidente:{label:'Acidente',color:'#2a6fd6'}
};
const nr5=item=>({norm:'NR 5',item,kind:'vigente'});
const quadro1=item=>({norm:'NR 5 • Quadro I',item,kind:'vigente',check:true});
const anexo1=item=>({norm:'NR 5 • Anexo I (construção)',item,kind:'vigente'});
const nr=(norm,item)=>({norm,item,kind:'vigente'});
const lei=(norm,item)=>({norm,item,kind:'vigente',check:true});
const pratica=(norm,item)=>({norm,item,kind:'pratica'});
const at=(p,r)=>({x:p.x,z:p.z,r});
const ASSEDIO=[nr5('5.3.1 j)'),nr5('5.7.2 h)'),lei('Lei 14.457/2022','art. 23 (canal de denúncia com anonimato)')];
// ---------------- Grau de risco 4: canteiro de obras (20 h) ----------------
const S4=lots.gr4.spots;
const gr4 = [
 {id:'treinamento',refs:[nr5('5.7.4 d)'),nr5('5.7.4.1'),nr5('5.7.4.2'),anexo1('3.5')],...at(S4.board,2),
  title:'Faça o treinamento da CIPA',description:'A construção é grau de risco 4. No quadro ao lado do container, confira como deve ser o curso da CIPA do canteiro.',
  tip:'No grau de risco 4, a carga horária mínima é de 20 horas (5.7.4 d), em no máximo 8 horas por dia (5.7.4.1), com pelo menos 8 horas presenciais (5.7.4.2). Os membros da CIPA do canteiro seguem esse treinamento (Anexo I, 3.5).',
  choices:[
   {id:'vinte',correct:true,label:'Curso de 20 horas em pelo menos três dias, com no mínimo 8 horas presenciais, antes da posse.',feedback:'Certo: 20 horas, no máximo 8 por dia e 8 presenciais.'},
   {id:'dds',label:'O diálogo de segurança de toda manhã, somado, já vale como treinamento.',feedback:'O diálogo diário é uma boa prática, mas não substitui o treinamento de 20 horas com o conteúdo do item 5.7.2.'},
   {id:'doisdias',label:'20 horas em dois dias de 10 horas, para liberar a equipe para a concretagem.',feedback:'A carga horária é distribuída em no máximo 8 horas por dia (5.7.4.1).'}
  ]},
 {id:'canteiro',who:'Valter',refs:[anexo1('3.1'),anexo1('3.3'),quadro1('grau de risco 4 • 51 a 80 empregados')],
  title:'CIPA por canteiro',description:'Valter acha que a CIPA da sede da construtora já cobre esta obra, que tem 60 empregados próprios e vai durar 14 meses.',
  tip:'Na construção, a CIPA é constituída por canteiro de obras quando o número de empregados se enquadra no Quadro I (Anexo I, 3.1). Só as obras de até 180 dias são dispensadas, e mesmo assim nomeiam um representante (3.3 e 3.3.1).',
  choices:[
   {id:'canteiro',correct:true,label:'Este canteiro tem CIPA própria: 60 empregados no grau de risco 4 se enquadram no Quadro I, e a obra passa de 180 dias. São 3 efetivos e 2 suplentes de cada lado.',feedback:'CIPA por canteiro, dimensionada pelo Quadro I, em obra de mais de 180 dias.'},
   {id:'sede',label:'A CIPA da sede cobre todas as obras da construtora.',feedback:'Na construção, a CIPA é por canteiro quando há enquadramento no Quadro I (Anexo I, 3.1).'},
   {id:'curta',label:'Obra não precisa de CIPA, porque é temporária.',feedback:'A dispensa vale só para obras de até 180 dias (Anexo I, 3.3). Esta dura 14 meses.'}
  ]},
 {id:'frente',fx:{show:['gr4.placaFrente']},refs:[anexo1('3.1.2'),anexo1('3.1.3'),anexo1('3.5.1')],...at(S4.portao,1.8),
  title:'A frente de trabalho na rua',description:'Do lado de fora do portão, oito empregados da construtora abrem a ligação de esgoto, a duas quadras do canteiro.',
  tip:'A organização é dispensada de constituir CIPA por frente de trabalho (Anexo I, 3.1.2), mas nomeia pelo menos um representante que atue na frente ou no canteiro (3.1.3). O nomeado faz treinamento de no mínimo 8 horas (3.5.1).',
  choices:[
   {id:'nomear',correct:true,label:'A frente não tem CIPA própria, mas a construtora nomeia um representante da NR 5 entre os empregados de lá, com treinamento de 8 horas, integrado à CIPA do canteiro.',feedback:'Representante nomeado para a frente de trabalho, treinado e integrado.'},
   {id:'outra',label:'Eleger uma segunda CIPA só para os oito da frente de trabalho.',feedback:'Não se constitui CIPA por frente de trabalho (Anexo I, 3.1.2). Nomeia-se um representante.'},
   {id:'nada',label:'Como estão fora do canteiro, a frente fica sem ninguém da NR 5.',feedback:'Havendo frente de trabalho, a organização nomeia pelo menos um representante (Anexo I, 3.1.3).'}
  ]},
 {id:'empreiteira',who:'Lu',refs:[anexo1('3.2'),anexo1('3.2.1'),anexo1('3.2.2'),anexo1('3.6.1')],
  title:'A empreiteira de armação',description:'Lu trabalha para a empreiteira de armação, que tem 7 empregados no canteiro e nenhum representante.',
  tip:'A prestadora de serviços com 5 ou mais empregados próprios no canteiro nomeia pelo menos um representante da NR 5, entre os que trabalham no local (Anexo I, 3.2 e 3.2.1). A responsável pela obra exige essa nomeação (3.2.2) e promove a integração (3.6.1).',
  choices:[
   {id:'exigir',correct:true,label:'Pedir que a construtora exija da empreiteira a nomeação de um representante entre os 7 que trabalham aqui e integrá-lo às reuniões da CIPA do canteiro.',feedback:'Empreiteira com representante nomeado e integrado à CIPA do canteiro.'},
   {id:'escritorio',label:'Aceitar que a empreiteira nomeie o dono, que fica no escritório dela.',feedback:'O representante é nomeado entre os empregados que exercem atividades no local (Anexo I, 3.2.1).'},
   {id:'poucos',label:'Com 7 pessoas, a empreiteira não precisa de nada.',feedback:'A partir de 5 empregados próprios no local, a prestadora nomeia um representante (Anexo I, 3.2).'}
  ]},
 {id:'altura',risk:{g:'acidente',size:3},fx:{show:['gr4.guardaCorpo']},refs:[nr5('5.3.1 h)'),nr('NR 35','trabalho acima de 2,0 m do nível inferior'),nr('NR 18','proteção coletiva contra queda de altura')],...at(S4.laje,1.9),
  title:'Risco grave e iminente na laje',description:'Olhe para cima: Zé assenta blocos na borda da laje, a mais de 3 m do chão, sem guarda-corpo e sem cinto.',
  tip:'Queda de altura é a principal causa de morte na construção. Diante de risco grave e iminente, a CIPA propõe a interrupção da atividade até a adoção das medidas (5.3.1 h). Primeiro a proteção coletiva: guarda-corpo com rodapé na periferia.',
  choices:[
   {id:'parar',correct:true,label:'Pedir que o Zé saia da borda agora, acionar o mestre e a segurança e propor a parada do serviço até instalarem o guarda-corpo, com cinto ancorado como complemento.',feedback:'Interrupção proposta na hora e proteção coletiva antes de retomar.'},
   {id:'cinto',label:'Jogar um cinto para o Zé e deixar que ele continue, sem ponto de ancoragem.',feedback:'Cinto sem ancoragem não segura ninguém, e a periferia continua aberta para os outros.'},
   {id:'ata',label:'Anotar para a próxima reunião: o Zé é experiente.',feedback:'Risco grave e iminente não espera a reunião (5.3.1 h).'}
  ]},
 {id:'escavacao',who:'Tonho',risk:{g:'acidente',size:3},fx:{show:['gr4.escoramento']},refs:[nr5('5.3.1 c)'),nr('NR 18','escavações: escoramento, acessos e material afastado da borda'),pratica('Mapa de riscos','risco de acidente em azul')],
  title:'A vala sem escoramento',description:'Tonho trabalha dentro de uma vala de 2 m de profundidade, sem escoramento, com a terra retirada empilhada na borda. Choveu ontem.',
  tip:'Soterramento mata em minutos. A vala precisa de escoramento ou talude estável, escada de saída e material afastado da borda, com projeto de profissional habilitado.',
  choices:[
   {id:'escorar',correct:true,label:'Pedir que o Tonho saia da vala e propor a parada até haver escoramento conforme projeto, escada de acesso e a terra afastada da borda.',feedback:'Ninguém na vala até o escoramento, o acesso e o afastamento do material estarem prontos.'},
   {id:'vigia',label:'Deixar um colega na borda, vigiando se a terra se mexe.',feedback:'Quando a parede se mexe, não dá tempo de sair. Vigia não substitui escoramento.'},
   {id:'seca',label:'Liberar, porque a terra já secou e está firme.',feedback:'Solo encharcado e carga na borda são as condições clássicas de desmoronamento.'}
  ]},
 {id:'andaime',risk:{g:'acidente',size:2},fx:{show:['gr4.rodape']},refs:[nr5('5.3.1 c)'),nr('NR 18','andaimes: piso completo, guarda-corpo, rodapé e montagem por capacitados')],...at(S4.andaime,1.7),
  title:'Inspecione o andaime',description:'O andaime da fachada tem piso com vãos, não tem rodapé e foi montado pelos próprios pedreiros, sem projeto.',
  tip:'Andaime seguro tem piso completo e travado, guarda-corpo e rodapé, acesso por escada, base nivelada e montagem por trabalhadores capacitados, conforme projeto.',
  choices:[
   {id:'interditar',correct:true,label:'Propor a interdição do andaime até que seja completado por montadores capacitados, conforme projeto, com piso inteiro, guarda-corpo, rodapé e escada de acesso.',feedback:'Andaime liberado só depois de completo e montado por quem é capacitado.'},
   {id:'tabua',label:'Completar os vãos com sobras de tábua e seguir o serviço.',feedback:'Remendo com sobra de madeira é causa comum de queda. O piso é completo e travado.'},
   {id:'aviso',label:'Pendurar uma placa de “cuidado” e deixar em uso.',feedback:'Placa não segura ninguém. O andaime incompleto sai de uso.'}
  ]},
 {id:'eletrica',risk:{g:'acidente',size:2},fx:{show:['gr4.quadroFechado']},refs:[nr5('5.3.1 c)'),nr('NR 10','instalações elétricas: intervenção só por autorizados'),nr('NR 18','instalações elétricas temporárias')],...at(S4.quadro,1.6),
  title:'O quadro elétrico provisório',description:'O quadro de distribuição está aberto, com fios emendados e um cabo passando por uma poça. Qualquer um liga ferramenta ali.',
  tip:'Instalação provisória também precisa de quadro fechado e identificado, proteção diferencial (DR), aterramento e cabos fora da água, e só eletricista autorizado mexe nela.',
  choices:[
   {id:'eletricista',correct:true,label:'Isolar a área e pedir ao eletricista autorizado: quadro fechado e sinalizado, DR, aterramento, cabos suspensos e emendas refeitas.',feedback:'Instalação provisória corrigida por profissional autorizado.'},
   {id:'fita',label:'Passar fita isolante nas emendas você mesmo, para adiantar.',feedback:'Intervenção elétrica é só para autorizado. O cipeiro identifica e encaminha.'},
   {id:'borracha',label:'Avisar o pessoal para usar bota de borracha perto do quadro.',feedback:'Bota não é medida de controle para quadro aberto e cabo na água.'}
  ]},
 {id:'poeira',who:'Beto',risk:{g:'quimico',size:2},fx:{show:['gr4.corteUmido']},refs:[nr5('5.7.2 d)'),nr5('5.3.1 b)'),pratica('Boa prática','corte a úmido e respirador PFF2 para poeira com sílica'),pratica('Mapa de riscos','poeira em vermelho • ruído em verde')],
  title:'Poeira e ruído no corte',description:'Beto corta cerâmica a seco. A nuvem de poeira cobre a bancada, e a serra grita o dia todo.',
  tip:'A poeira de cerâmica, concreto e pedra contém sílica, que causa silicose, doença sem cura. O corte a úmido reduz a poeira na fonte. O ruído da serra é risco físico.',
  choices:[
   {id:'umido',correct:true,label:'Propor corte a úmido ou com captação da poeira, bancada afastada dos outros postos, respirador PFF2 e protetor auricular, e exames no PCMSO.',feedback:'Poeira controlada na fonte, com EPI e acompanhamento médico como complemento.'},
   {id:'pano',label:'Amarrar um pano no rosto resolve a poeira.',feedback:'Pano não retém a poeira fina de sílica, que chega ao pulmão.'},
   {id:'vento',label:'Levar a bancada para onde o vento sopre a poeira na direção dos colegas.',feedback:'Isso só leva a poeira para outros pulmões. Controle na fonte: água ou captação.'}
  ]},
 {id:'mapa',fx:{show:['gr4.mapa']},refs:[nr5('5.3.1 b)'),anexo1('3.5.1 b)'),pratica('Mapa de riscos','atualizado a cada etapa da obra')],...at(S4.mapa,1.7),
  title:'Atualize o mapa a cada etapa',description:'A obra saiu da fundação e entrou na estrutura. No painel ao lado do material, decida o que fazer com o mapa de riscos.',
  tip:'A CIPA registra a percepção dos riscos dos trabalhadores (5.3.1 b). Na construção, os riscos mudam com a etapa da obra: fundação, estrutura, alvenaria, acabamento. O registro acompanha a mudança.',
  choices:[
   {id:'etapa',correct:true,label:'Refazer o mapa com as equipes a cada etapa: saem as escavações profundas e entram altura, içamento de cargas e formas. Afixar na entrada do canteiro.',feedback:'Mapa vivo, refeito com as equipes quando a obra muda de fase.'},
   {id:'unico',label:'Manter o mapa da fundação até o fim da obra, porque já foi aprovado.',feedback:'O mapa da fundação não mostra os riscos da estrutura. A obra muda, e o mapa muda junto.'},
   {id:'final',label:'Fazer o mapa só no fim, com a obra pronta.',feedback:'Mapa de riscos serve para prevenir durante a obra.'}
  ]},
 {id:'acidente',who:'Tonho',during:['gr4.isolamento'],refs:[nr5('5.6.4 a)'),nr5('5.3.1 f)'),lei('Lei 8.213/1991','art. 22 (CAT; morte: de imediato)')],
  title:'Acidente grave no içamento',description:'Um feixe de vergalhões escapou do guincho e atingiu o Tonho, que passava embaixo. Ele está consciente. Cida já chamou o socorro.',
  tip:'Com acidente grave ou fatal, a CIPA faz reunião extraordinária (5.6.4 a). Antes: socorro, área isolada, içamento parado e local preservado para a análise.',
  choices:[
   {id:'extraordinaria',correct:true,label:'Apoiar o socorro sem mover o Tonho, isolar a área, parar todo içamento, preservar o local e pedir ao presidente a reunião extraordinária e a CAT.',feedback:'Socorro, isolamento, parada do içamento e reunião extraordinária.'},
   {id:'carregar',label:'Carregar o Tonho no colo até a portaria, para adiantar.',feedback:'Mover vítima de trauma pode agravar a lesão. Aguarde o socorro, salvo perigo imediato.'},
   {id:'seguir',label:'Recolher os vergalhões e retomar o içamento, porque a concretagem é amanhã.',feedback:'Retomar apaga os fatos e repete o risco. O içamento para até a análise.'}
  ]},
 {id:'investigacao',fx:{show:['gr4.tela']},refs:[nr5('5.7.2 c)'),nr5('5.3.1 f)'),pratica('Método','árvore de causas')],...at(S4.carga,1.8),
  title:'Investigue o içamento',description:'Com a área isolada, levante com a Cida as causas da queda do feixe.',
  tip:'A análise encadeia os fatos até a organização do trabalho: amarração da carga, área sob o içamento sem isolamento, falta de plano de carga, operador e sinaleiro sem capacitação, pressa do cronograma.',
  choices:[
   {id:'causas',correct:true,label:'Encadear: feixe amarrado com arame, área sob a carga sem isolamento, falta de plano de içamento e de sinaleiro e prazo apertado. Medidas com prazo: cintas certificadas, isolamento, plano e capacitação.',feedback:'Causas técnicas e de organização, cada uma com a sua medida.'},
   {id:'tonho',label:'Concluir que o Tonho não devia passar ali e advertir.',feedback:'Se a área não estava isolada, passar ali era o caminho normal. A causa é a falta de isolamento.'},
   {id:'operador',label:'Trocar o operador do guincho e seguir.',feedback:'Trocar a pessoa sem mudar amarração, isolamento e plano mantém o risco.'}
  ]},
 {id:'assedio',who:'Lu',refs:ASSEDIO,
  title:'Enfrente o assédio no canteiro',description:'Lu é a única mulher da armação. Ela relata “piadas”, assobios e um colega que a segue até o vestiário.',
  tip:'Assédio sexual e outras formas de violência entram nas atividades da CIPA (5.3.1 j) e no treinamento, inclusive o do representante nomeado. O canal de denúncia vale para empregados próprios e de empreiteiras no canteiro.',
  choices:[
   {id:'acolher',correct:true,label:'Acolher com sigilo, orientar a denúncia pelo canal, pedir à construtora e à empreiteira apuração e proteção para a Lu, e pôr o tema nos diálogos de segurança e na SIPAT.',feedback:'Acolhimento, apuração pelas duas empresas e prevenção com todo o canteiro.'},
   {id:'obra',label:'Dizer que obra é ambiente de homem e que ela precisa se acostumar.',feedback:'Nenhum ambiente justifica assédio. Naturalizar é parte do problema.'},
   {id:'trocar',label:'Sugerir que a empreiteira troque a Lu por um homem, para evitar confusão.',feedback:'Isso pune a vítima. Quem responde é quem assedia.'}
  ]},
 {id:'legislacao',who:'Valter',refs:[nr5('5.4.12'),nr5('5.4.12.1'),nr5('5.7.2 e)')],
  title:'Garantia de emprego na obra',description:'Valter pergunta: o carpinteiro eleito para a CIPA tem contrato por prazo determinado, que vence com o fim da etapa de formas. Pode desligar?',
  tip:'O eleito tem garantia contra dispensa arbitrária ou sem justa causa do registro da candidatura até um ano depois do mandato (5.4.12). O término do contrato por prazo determinado não caracteriza dispensa arbitrária (5.4.12.1).',
  choices:[
   {id:'prazo',correct:true,label:'O término normal do contrato por prazo determinado não é dispensa arbitrária. Mas mandar embora antes do prazo, sem justa causa, fere a garantia do eleito.',feedback:'Distinção correta entre o fim do contrato a prazo (5.4.12.1) e a dispensa arbitrária (5.4.12).'},
   {id:'sempre',label:'Cipeiro pode ser demitido a qualquer momento, como qualquer empregado.',feedback:'O eleito tem garantia do registro da candidatura até um ano depois do mandato (5.4.12).'},
   {id:'nunca',label:'Cipeiro não pode ser desligado em hipótese nenhuma, nem com o fim do contrato.',feedback:'O término do contrato por prazo determinado não caracteriza dispensa arbitrária (5.4.12.1).'}
  ]},
 {id:'integracao',refs:[anexo1('3.6'),anexo1('3.6.1'),nr5('5.9.1'),nr5('5.6.1')],...at(S4.container,1.8),
  title:'Integre todo o canteiro',description:'No container, organize a reunião do mês: há a CIPA do canteiro, o representante da frente de trabalho e o da empreiteira.',
  tip:'A responsável pela obra coordena o trabalho da CIPA e dos representantes nomeados (Anexo I, 3.6) e promove a integração entre eles (3.6.1). A contratante garante que todos recebam as informações sobre os riscos e as medidas de prevenção (5.9.1).',
  choices:[
   {id:'juntos',correct:true,label:'Reunião mensal com a CIPA do canteiro e os representantes nomeados da frente e da empreiteira, com ata, e os riscos da etapa informados a todas as equipes.',feedback:'CIPA e representantes nomeados integrados, com a informação chegando a todos.'},
   {id:'separado',label:'Cada empresa cuida dos seus e não se mistura.',feedback:'No mesmo canteiro, os riscos são compartilhados. A responsável pela obra promove a integração.'},
   {id:'engenheiro',label:'Deixar tudo com o engenheiro da obra, sem reunião.',feedback:'A coordenação é da organização, mas a CIPA e os representantes participam com reuniões e atas.'}
  ]},
 {id:'encerramento',fx:{show:['gr4.placaFim']},refs:[anexo1('3.7'),anexo1('3.7.1'),anexo1('3.7.2'),nr5('5.9.2')],...at(S4.entrega,1.8),
  title:'Encerre a CIPA com a obra',description:'Meses depois, a obra está pronta. No portão de entrega, decida o que acontece com a CIPA do canteiro.',
  tip:'A CIPA do canteiro é encerrada quando as atividades da obra terminam (Anexo I, 3.7), isto é, quando todas as etapas dos projetos estão concluídas (3.7.1). A conclusão é formalizada pelo responsável técnico, com cópia ao sindicato (3.7.2). Os documentos ficam guardados por 5 anos (5.9.2).',
  choices:[
   {id:'formal',correct:true,label:'Com todas as etapas concluídas, o responsável técnico formaliza o fim da obra, com cópia ao sindicato, a CIPA do canteiro é encerrada e os documentos são guardados por 5 anos.',feedback:'Encerramento formalizado e documentação guardada pelo prazo da norma.'},
   {id:'antes',label:'Encerrar a CIPA quando sobrar só o acabamento, porque o risco já é pequeno.',feedback:'A obra só é considerada finalizada com todas as etapas concluídas (Anexo I, 3.7.1).'},
   {id:'lixo',label:'Com a obra entregue, jogar fora atas e documentos da eleição.',feedback:'A documentação da CIPA é guardada por no mínimo 5 anos (5.9.2).'}
  ]}
];
export const MODULES = {
 gr4:{id:'gr4',gr:4,name:'Grau de risco 4',short:'GR 4',course:'Treinamento de 20 h',horas:20,presencial:'mínimo de 8 h presenciais',estab:'Canteiro de obras • 60 empregados',cipa:'3 efetivos e 2 suplentes de cada lado',role:'Vice-presidente da CIPA do canteiro',place:'CANTEIRO DE OBRAS • EDIFÍCIO EM ESTRUTURA',
  intro:'CIPA do canteiro de um edifício, com 60 empregados e 14 meses de obra. Altura, escavação, andaime, eletricidade e poeira; frente de trabalho e empreiteira; e um acidente grave no içamento.',
  summary:'Você aplicou o Anexo I da construção, propôs a interrupção de serviços com risco grave e iminente, investigou um acidente grave, integrou frente de trabalho e empreiteira e encerrou a CIPA com a obra.',objectives:gr4}
};
export const MODULE_IDS = Object.keys(MODULES);
export const objectivesOf = m => MODULES[m].objectives;
export const indexOf = (m,id) => objectivesOf(m).findIndex(o => o.id === id);
export const refLabel = r => `${r.norm} • ${/^\d/.test(r.item)?'item ':''}${r.item}`;
// Linha de referência mostrada no painel. A origem (em vigor ou boa prática) sempre aparece.
export const refSummary = o => o.refs.map(r => ({label:refLabel(r),kind:r.kind,status:KINDS[r.kind],check:!!r.check}));

// ---------------- Treinamento por grau de risco (item 5.7.4) ----------------
export const TREINAMENTO = {1:{horas:8,presencial:0},2:{horas:12,presencial:4},3:{horas:16,presencial:8},4:{horas:20,presencial:8}};
export const diasMinimos = gr => Math.ceil(TREINAMENTO[gr].horas/8);
// ---------------- Quadro I: dimensionamento da CIPA ----------------
// Faixas de empregados no estabelecimento e número de efetivos e suplentes de cada representação. 0 = sem CIPA (representante nomeado).
export const FAIXAS = [19,29,50,80,100,120,140,300,500,1000,2500,5000,10000];
export const QUADRO_I = {
 1:{ef:[0,0,0,0,1,1,1,1,2,4,5,6,8],su:[0,0,0,0,1,1,1,1,2,3,4,5,6]},
 2:{ef:[0,0,0,1,1,2,2,3,4,5,6,8,10],su:[0,0,0,1,1,1,1,2,3,4,5,6,8]},
 3:{ef:[0,1,1,2,2,2,3,4,5,6,8,10,12],su:[0,1,1,1,1,1,2,2,4,4,6,8,8]},
 4:{ef:[0,1,2,3,3,4,4,4,5,6,9,11,13],su:[0,1,1,2,2,2,2,3,4,5,7,8,10]}
};
export function dimensionar(gr,empregados){
 const i=FAIXAS.findIndex(max=>empregados<=max);if(i<0)return null; // acima de 10.000: ver a regra de acréscimo do Quadro I
 return {efetivos:QUADRO_I[gr].ef[i],suplentes:QUADRO_I[gr].su[i]};
}

// ---------------- Estado do jogo ----------------
export const initialState = (module=MODULE_IDS[0]) => ({module,step:0,feedback:'',errors:0,completed:[],finished:false});
export const done = (s,id) => s.completed.includes(id);
export const currentTarget = s => objectivesOf(s.module)[s.step];
function advance(s,next,id){
 const list=objectivesOf(s.module);next.completed=[...s.completed,id];next.step=s.step+1;next.finished=next.step===list.length;
 return next;
}
export function answer(s,choiceId){
 const o=currentTarget(s);const c=o?.choices?.find(x=>x.id===choiceId);if(!c)return s;
 if(!c.correct)return {...s,errors:s.errors+1,feedback:c.feedback};
 return advance(s,{...s,feedback:c.feedback},o.id);
}
export function interact(s,id){
 const o=currentTarget(s);if(!o||o.id!==id)return s;
 if(o.choices)return {...s,feedback:'Escolha uma das opções.'};
 return advance(s,{...s,feedback:''},id);
}
// Riscos já registrados no mapa (etapas concluídas que têm "risk").
export const risksOf = s => objectivesOf(s.module).filter(o => o.risk && done(s,o.id)).map(o => ({id:o.id,...o.risk}));
// Objetos do cenário visíveis: começa pelos padrões, aplica o "fx" das etapas concluídas e o "during" da etapa atual.
export function visibleItems(s,defaults={}){
 const v={...defaults};
 for(const o of objectivesOf(s.module)){if(!done(s,o.id)||!o.fx)continue;for(const k of o.fx.show||[])v[k]=true;for(const k of o.fx.hide||[])v[k]=false;}
 for(const o of objectivesOf(s.module))for(const k of o.during||[])v[k]=currentTarget(s)?.id===o.id;
 return v;
}
// Áreas caminháveis: o lote do módulo; estruturas entram como obstáculos {x,z,w,d}.
export function canMove(x,z,obstacles,bounds){
 if(bounds&&!(x>bounds.minX&&x<bounds.maxX&&z>bounds.minZ&&z<bounds.maxZ))return false;
 return !obstacles.some(o=>Math.abs(x-o.x)<o.w/2+.32&&Math.abs(z-o.z)<o.d/2+.32);
}
