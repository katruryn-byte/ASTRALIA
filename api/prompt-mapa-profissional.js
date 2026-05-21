// ═══════════════════════════════════════════════════════════════════════════════
// 💼 PROMPT — MAPA PROFISSIONAL E VOCACIONAL — Astralia
// ═══════════════════════════════════════════════════════════════════════════════
// Produto Premium — Vocação, talentos, modelo de carreira, bloqueios, liderança
// Modelo recomendado: claude-opus-4-7 (Opus — 15 indicadores integrados + Quíron + bloqueios)
//   [caso limítrofe: forte candidato a A/B com Sonnet — é um mapa só, estruturado]
// Comprimento alvo: 10.000-14.000 palavras
// Tom: Prático, revelador, inspirador — NUNCA vago. Palavra-chave: FAZER O QUE VOCÊ VEIO FAZER
// ═══════════════════════════════════════════════════════════════════════════════
// Compila INTEGRALMENTE o "Guia — Mapa Profissional e Vocacional (Diretrizes Completas)".
// Substitui a versão anterior de 9 indicadores.
// Calcula elemento/modalidade dominante, regente do MC e Casa 10, e detecta
// modelo de trabalho, tipo de liderança e bloqueios de carreira.
// Saída em JSON estruturado por seções (renderização de PDF é camada separada).
// ═══════════════════════════════════════════════════════════════════════════════

const SIGNOS_ORDEM = ["Áries","Touro","Gêmeos","Câncer","Leão","Virgem","Libra","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];

const REGENTE_SIGNO = {
  "Áries":"Marte","Touro":"Vênus","Gêmeos":"Mercúrio","Câncer":"Lua","Leão":"Sol",
  "Virgem":"Mercúrio","Libra":"Vênus","Escorpião":"Marte","Sagitário":"Júpiter",
  "Capricórnio":"Saturno","Aquário":"Saturno","Peixes":"Júpiter"
};
const REGENTE_MODERNO = { "Escorpião":"Plutão","Aquário":"Urano","Peixes":"Netuno" };
const ELEMENTO_SIGNO = {
  "Áries":"Fogo","Leão":"Fogo","Sagitário":"Fogo","Touro":"Terra","Virgem":"Terra",
  "Capricórnio":"Terra","Gêmeos":"Ar","Libra":"Ar","Aquário":"Ar",
  "Câncer":"Água","Escorpião":"Água","Peixes":"Água"
};
const MODALIDADE_SIGNO = {
  "Áries":"Cardinal","Câncer":"Cardinal","Libra":"Cardinal","Capricórnio":"Cardinal",
  "Touro":"Fixo","Leão":"Fixo","Escorpião":"Fixo","Aquário":"Fixo",
  "Gêmeos":"Mutável","Virgem":"Mutável","Sagitário":"Mutável","Peixes":"Mutável"
};
const DIGNIDADES = {
  Sol:{rege:["Leão"],exalta:["Áries"],cai:["Libra"],detrimento:["Aquário"]},
  Lua:{rege:["Câncer"],exalta:["Touro"],cai:["Escorpião"],detrimento:["Capricórnio"]},
  Mercúrio:{rege:["Gêmeos","Virgem"],exalta:["Virgem"],cai:["Peixes"],detrimento:["Sagitário","Peixes"]},
  Vênus:{rege:["Touro","Libra"],exalta:["Peixes"],cai:["Virgem"],detrimento:["Áries","Escorpião"]},
  Marte:{rege:["Áries","Escorpião"],exalta:["Capricórnio"],cai:["Câncer"],detrimento:["Libra","Touro"]},
  Júpiter:{rege:["Sagitário","Peixes"],exalta:["Câncer"],cai:["Capricórnio"],detrimento:["Gêmeos","Virgem"]},
  Saturno:{rege:["Capricórnio","Aquário"],exalta:["Libra"],cai:["Áries"],detrimento:["Câncer","Leão"]}
};

// -------------------------------------------------------------------------------
// FUNÇÕES DE CÁLCULO E DETECÇÃO
// -------------------------------------------------------------------------------

function avaliarDignidade(planeta, signo){
  const d = DIGNIDADES[planeta]; if(!d) return "neutro";
  if(d.exalta.includes(signo)) return "exaltado"; if(d.rege.includes(signo)) return "rege";
  if(d.cai.includes(signo)) return "caído"; if(d.detrimento.includes(signo)) return "detrimento"; return "neutro";
}
function ocupantesCasa(mapaNatal, casa){
  return Object.entries(mapaNatal)
    .filter(([k,v]) => v && typeof v==='object' && v.casa===casa && SIGNOS_ORDEM.includes(v.signo))
    .map(([k])=>k);
}
function temAspecto(aspectos, p1, p2, tipos){
  return aspectos.some(a => {
    const par = (a.planeta1===p1&&a.planeta2===p2)||(a.planeta1===p2&&a.planeta2===p1);
    return par && (!tipos || tipos.includes((a.aspecto||'').toLowerCase()));
  });
}
const TENSOS = ["quadratura","oposição","oposicao"];

function elementoModalidadeDominante(mapaNatal, regenteMCPos){
  const chave = ["Sol","Mercúrio","Vênus","Marte","Lua"].map(p=>mapaNatal[p]).filter(Boolean);
  if(regenteMCPos) chave.push(regenteMCPos);
  const el={Fogo:0,Terra:0,Ar:0,Água:0}, mod={Cardinal:0,Fixo:0,Mutável:0};
  chave.forEach(p=>{ if(ELEMENTO_SIGNO[p.signo])el[ELEMENTO_SIGNO[p.signo]]++; if(MODALIDADE_SIGNO[p.signo])mod[MODALIDADE_SIGNO[p.signo]]++; });
  return {
    elemento: Object.entries(el).sort((a,b)=>b[1]-a[1])[0][0],
    modalidade: Object.entries(mod).sort((a,b)=>b[1]-a[1])[0][0],
    contagemElemento: el
  };
}

// Modelo de trabalho (autônomo/equipe/bastidores/liderança) — conta indicadores do documento
function detectarModeloTrabalho(mapaNatal){
  const sol=mapaNatal.Sol, mc=mapaNatal.MC;
  const angulares=[1,4,7,10], cadentes=[3,6,9,12], superiores=[7,8,9,10,11,12];
  const planetas=Object.values(mapaNatal).filter(v=>v&&typeof v==='object'&&SIGNOS_ORDEM.includes(v.signo));
  const nSup=planetas.filter(p=>superiores.includes(p.casa)).length;
  const nAng=planetas.filter(p=>angulares.includes(p.casa)).length;
  const nCad=planetas.filter(p=>cadentes.includes(p.casa)).length;
  const nAr=planetas.filter(p=>ELEMENTO_SIGNO[p.signo]==="Ar").length;
  const score={autonomia:0,equipe:0,bastidores:0,lideranca_publica:0};
  if(sol&&[1,10].includes(sol.casa))score.autonomia+=2;
  if(nSup>=5)score.autonomia++;
  if(mc&&["Áries","Leão","Capricórnio"].includes(mc.signo))score.autonomia++;
  if(sol&&[7,11].includes(sol.casa))score.equipe+=2;
  if(nAr>=3)score.equipe++;
  if(mc&&["Libra","Aquário"].includes(mc.signo))score.equipe++;
  if(sol&&[6,12].includes(sol.casa))score.bastidores+=2;
  if(nCad>=4)score.bastidores++;
  if(sol&&sol.casa===10)score.lideranca_publica+=2;
  if(mc&&mc.signo==="Leão")score.lideranca_publica++;
  if(nAng>=4)score.lideranca_publica++;
  const ordenado=Object.entries(score).sort((a,b)=>b[1]-a[1]);
  const rotulos={autonomia:"Autônomo/Empreendedor",equipe:"Colaboração/Equipe",bastidores:"Bastidores/Especialização",lideranca_publica:"Liderança Pública"};
  return ordenado.filter(([k,v])=>v>0).map(([k,v])=>`${rotulos[k]} (${v} indicadores)`);
}

// Tipo de liderança — sinais do documento
function detectarLideranca(mapaNatal, aspectos){
  const mc=mapaNatal.MC, tipos=[];
  const mcSigno=mc?mc.signo:null;
  const ocC10=ocupantesCasa(mapaNatal,10);
  if(mcSigno==="Leão"||ocC10.includes("Sol")) tipos.push("Inspiração (lidera pelo exemplo, entusiasmo, brilho)");
  if(mcSigno==="Capricórnio"||ocC10.includes("Saturno")) tipos.push("Expertise (lidera pelo conhecimento e autoridade construída)");
  if(mcSigno==="Libra"||ocC10.includes("Vênus")) tipos.push("Relacionamento (lidera pela conexão e harmonia)");
  if(mcSigno==="Escorpião"||ocC10.includes("Plutão")||temAspecto(aspectos,"Plutão","MC")) tipos.push("Transformação (lidera em crises)");
  if(mcSigno==="Aquário"||mcSigno==="Sagitário"||ocC10.includes("Urano")) tipos.push("Visão (lidera pelo futuro que enxerga antes)");
  return tipos.length?tipos:["(perfil de liderança a definir pelos aspectos com o MC)"];
}

// Bloqueios de carreira — detecta sinais dos 6 padrões
function detectarBloqueios(mapaNatal, aspectos, nodoSulCasa){
  const b=[], mc=mapaNatal.MC, emCasa=(p,c)=>mapaNatal[p]&&mapaNatal[p].casa===c;
  const ocC10=ocupantesCasa(mapaNatal,10), ocC12=ocupantesCasa(mapaNatal,12);
  if(ocC10.includes("Saturno")||ocC10.includes("Plutão")||nodoSulCasa===10)
    b.push({nome:"SABOTAGEM NO SUCESSO", quebra:"terapia para medo de sucesso + estrutura de suporte consciente"});
  if(nodoSulCasa===10||temAspecto(aspectos,"Saturno","MC",TENSOS)||ocC10.includes("Lua"))
    b.push({nome:"ESCOLHA QUE AGRADA OS OUTROS", quebra:"identificar o que escolheria se ninguém estivesse assistindo"});
  if(ocC12.length||temAspecto(aspectos,"Saturno","Sol",TENSOS))
    b.push({nome:"MEDO DE VISIBILIDADE", quebra:"exposição gradual — provar que ser vista não destrói"});
  if(ocC10.includes("Saturno")||temAspecto(aspectos,"Saturno","Sol",TENSOS)||(mc&&["Virgem","Escorpião"].includes(mc.signo)))
    b.push({nome:"SUBESTIMAÇÃO DE TALENTOS", quebra:"lista de evidências reais de competência + mentor externo"});
  if(mc&&["Gêmeos","Sagitário"].includes(mc.signo))
    b.push({nome:"DISPERSÃO VOCACIONAL", quebra:"escolher o que mais serve ao Nodo Norte — uma coisa primeiro"});
  return b;
}

function analisarVocacaoPro(mapaNatal, aspectos=[], nodoSulCasa=null){
  const mc=mapaNatal.MC||null;
  const regenteMC = mc ? REGENTE_SIGNO[mc.signo] : null;
  const regenteMCMod = mc ? (REGENTE_MODERNO[mc.signo]||null) : null;
  const regenteMCPos = regenteMC ? mapaNatal[regenteMC] : null;
  const dom = elementoModalidadeDominante(mapaNatal, regenteMCPos);
  return {
    mc: mc ? `${mc.signo} ${mc.grau||''}°` : "?",
    regenteMC: `${regenteMC||'?'}${regenteMCMod?` (moderno ${regenteMCMod})`:''}${regenteMCPos?` em ${regenteMCPos.signo} Casa ${regenteMCPos.casa}`:''}`,
    ocupantesC10: ocupantesCasa(mapaNatal,10),
    ocupantesC6: ocupantesCasa(mapaNatal,6),
    cuspideC6: mapaNatal.cuspideCasa6||null,
    sol: mapaNatal.Sol ? `${mapaNatal.Sol.signo} Casa ${mapaNatal.Sol.casa} (${avaliarDignidade("Sol",mapaNatal.Sol.signo)})` : "?",
    quiron: mapaNatal["Quíron"] ? `${mapaNatal["Quíron"].signo} Casa ${mapaNatal["Quíron"].casa}` : "(não fornecido)",
    nodoNorte: mapaNatal["Nodo Norte"] ? `${mapaNatal["Nodo Norte"].signo} Casa ${mapaNatal["Nodo Norte"].casa}` : "?",
    elementoDominante: dom.elemento,
    modalidadeDominante: dom.modalidade,
    modeloTrabalho: detectarModeloTrabalho(mapaNatal),
    lideranca: detectarLideranca(mapaNatal, aspectos),
    bloqueios: detectarBloqueios(mapaNatal, aspectos, nodoSulCasa)
  };
}

// -------------------------------------------------------------------------------
// CONSTANTE 1 — FUNDAMENTOS
// -------------------------------------------------------------------------------

const FUNDAMENTOS_PRO = `
═══════════════════════════════════════════════════════════════════════════════
MAPA PROFISSIONAL E VOCACIONAL — FUNDAMENTOS
═══════════════════════════════════════════════════════════════════════════════
VOCAÇÃO: o que você veio fazer (o sentido profundo). TALENTOS: habilidades naturais.
CARREIRA: o caminho concreto que você constrói. TRABALHO: as atividades cotidianas.
A maioria tem trabalho sem vocação; algumas têm vocação sem carreira estruturada; as
mais realizadas alinham os quatro. Este mapa revela como alinhar os quatro para a pessoa.

REVELA: vocação fundamental; talentos mais monetizáveis; estilo de trabalho ideal
(solo/equipe/liderança/bastidores); ambientes onde floresce e onde murcha; bloqueios de
carreira e sua origem; potencial de liderança; modelo de trabalho (autônomo/empregado/
empreendedor); o que a carreira precisa para ser realizada E próspera.

NÃO FAZ: não diz "você deve ser médica" nem "largue o emprego amanhã". Diz "sua estrutura
aponta para vocação em [X] em ambiente de [Y] — há múltiplas carreiras que atendem isso".
A concretização é sempre escolha e ação da pessoa.

ESPECIFICIDADE É RESPEITO. "Carreiras ideais" devem ser CONCRETAS (não "comunicação", mas
"coach de liderança, podcast educativo, professora de [área]"). O medíocre diz "você tem
vocação para cuidar e criar"; o bom diz "você tem estes talentos, aqui está um caminho concreto".
`;

// -------------------------------------------------------------------------------
// CONSTANTE 2 — MC POR SIGNO (identidade pública e vocação)
// -------------------------------------------------------------------------------

const MC_POR_SIGNO = {
  "Áries": "Identidade: pioneira, corajosa, assertiva, iniciadora. Vocação: liderança, empreendedorismo, esportes, ação direta. Visto como: ativo, corajoso, às vezes impaciente. Legado: abrir caminhos que outros seguirão. Ambiente ideal: autonomia total, projetos novos, sem burocracia.",
  "Touro": "Identidade: confiável, estável, qualidade, construção. Vocação: finanças, artes, construção, culinária, música, luxo. Visto como: consistente, de qualidade, digno de confiança. Legado: construir algo que dura. Ambiente: estabilidade, qualidade valorizada, crescimento gradual.",
  "Gêmeos": "Identidade: comunicadora, versátil, inteligente, conectora. Vocação: comunicação, jornalismo, ensino, tecnologia, escrita, vendas. Visto como: inteligente, comunicativo, às vezes inconstante. Legado: conectar pessoas e ideias. Ambiente: variedade, comunicação, múltiplos projetos.",
  "Câncer": "Identidade: cuidadora, intuitiva, protetora, familiar. Vocação: saúde, educação, nutrição, cuidado, imóveis, história. Visto como: acolhedor, confiável emocionalmente, materno. Legado: criar lugares e culturas de pertencimento. Ambiente: cuidado com significado, ambiente familiar, missão.",
  "Leão": "Identidade: liderança, criatividade, brilho, generosidade. Vocação: artes, entretenimento, educação inspiradora, liderança. Visto como: carismático, confiante, expressivo. Legado: inspirar gerações pelo exemplo e pela arte. Ambiente: visibilidade, criatividade, reconhecimento.",
  "Virgem": "Identidade: especialista, analítica, prestativa, meticulosa. Vocação: saúde, tecnologia, análise, serviço especializado, pesquisa. Visto como: competente, preciso, confiável nos detalhes. Legado: excelência que melhora vidas concretamente. Ambiente: especialização, qualidade, impacto mensurável.",
  "Libra": "Identidade: diplomática, estética, justa, equilibrada. Vocação: direito, arte, design, mediação, relações humanas, moda. Visto como: harmonioso, elegante, justo. Legado: criar beleza e equilíbrio onde havia conflito. Ambiente: parceria, estética, negociação, harmonia.",
  "Escorpião": "Identidade: poderosa, transformadora, investigativa, profunda. Vocação: psicologia, pesquisa, medicina, finanças, transformação social. Visto como: intenso, misterioso, poderoso. Legado: transformar o que outros achavam impossível. Ambiente: profundidade, autonomia, poder real.",
  "Sagitário": "Identidade: filosófica, expansiva, otimista, inspiradora. Vocação: educação, filosofia, espiritualidade, publicação, turismo, direito. Visto como: inspirador, otimista, referência de sabedoria. Legado: expandir a consciência coletiva. Ambiente: expansão, liberdade, visão de longo prazo.",
  "Capricórnio": "Identidade: autoridade, estrutura, responsabilidade, legado. Vocação: gestão, governo, empreendedorismo de longo prazo, construção. Visto como: sério, confiável, autoritativo, experiente. Legado: construir instituições que duram. Ambiente: responsabilidade real, construção de longo prazo.",
  "Aquário": "Identidade: inovadora, original, humanitária, visionária. Vocação: tecnologia, ciência, movimentos sociais, inovação. Visto como: diferente, inovador, à frente do tempo. Legado: transformar sistemas que afetam muitas vidas. Ambiente: inovação, autonomia, impacto coletivo.",
  "Peixes": "Identidade: compassiva, artística, intuitiva, espiritual. Vocação: artes, espiritualidade, cura, serviço, ciências do invisível. Visto como: sensível, artístico, compassivo. Legado: arte ou serviço que toca o sagrado. Ambiente: criatividade, espiritualidade, serviço com propósito."
};

// -------------------------------------------------------------------------------
// CONSTANTE 3 — SOL NA CARREIRA POR CASA (propósito central)
// -------------------------------------------------------------------------------

const SOL_CARREIRA_CASA = {
  1: "Você É sua carreira — presença que realiza.",
  2: "Propósito ligado a recursos e valores tangíveis.",
  3: "Propósito em comunicação, ensino, conexão de ideias.",
  4: "Propósito em família, lar, raízes, ancestralidade.",
  5: "Propósito em criatividade, expressão pessoal, amor.",
  6: "Propósito no serviço cotidiano, saúde, excelência.",
  7: "Propósito nas parcerias e no equilíbrio entre opostos.",
  8: "Propósito na transformação, nas crises que revelam.",
  9: "Propósito filosófico — expandir e transmitir sabedoria.",
  10: "Excepcional — você nasceu para ter carreira pública.",
  11: "Propósito no coletivo, em servir grupos e causas maiores.",
  12: "Propósito espiritual — você trabalha nos bastidores do invisível."
};

// -------------------------------------------------------------------------------
// CONSTANTE 4 — QUÍRON VOCACIONAL (ferida → dom) por signo e por casa
// -------------------------------------------------------------------------------

const QUIRON_VOCACIONAL_SIGNO = {
  "Áries":"ferida de iniciativa reprimida → vocação de empoderar ação.",
  "Touro":"ferida de recursos negados → vocação de criar abundância.",
  "Gêmeos":"ferida de voz silenciada → vocação de comunicar o que importa.",
  "Câncer":"ferida de cuidado negado → vocação de nutrir e curar.",
  "Leão":"ferida de brilho reprimido → vocação de inspirar criatividade.",
  "Virgem":"ferida de perfeição impossível → vocação de servir com excelência.",
  "Libra":"ferida de injustiça vivida → vocação de criar equilíbrio.",
  "Escorpião":"ferida de poder violado → vocação de transformar poder.",
  "Sagitário":"ferida de fé negada → vocação de transmitir sabedoria.",
  "Capricórnio":"ferida de autoridade abusiva → vocação de liderar com integridade.",
  "Aquário":"ferida de exclusão → vocação de criar comunidade e inovar.",
  "Peixes":"ferida de perda de sentido → vocação de curar espiritualmente."
};
const QUIRON_VOCACIONAL_CASA = {
  1:"ferida de identidade → dom de ajudar outros a se encontrarem.",
  2:"ferida de valor próprio → dom de ajudar outros a perceber seu valor.",
  3:"ferida de comunicação → dom de comunicar com precisão e cuidado.",
  4:"ferida familiar → dom de criar pertencimento.",
  5:"ferida criativa → dom de inspirar criatividade nos outros.",
  6:"ferida de trabalho/saúde → dom em saúde e bem-estar.",
  7:"ferida relacional → dom em relacionamentos e parceria.",
  8:"ferida de transformação → dom em crise e regeneração.",
  9:"ferida de filosofia → dom em expandir crenças.",
  10:"ferida de carreira → dom em orientação vocacional e liderança.",
  11:"ferida de grupo → dom em comunidade e movimentos sociais.",
  12:"ferida espiritual → dom em cura profunda e espiritualidade."
};

// -------------------------------------------------------------------------------
// CONSTANTE 5 — TALENTOS POR ELEMENTO DOMINANTE
// -------------------------------------------------------------------------------

const TALENTOS_ELEMENTO = {
  "Fogo":"Talentos: liderança, inspiração, visão, energia, entusiasmo. Monetiza por: visibilidade, liderança, empreendedorismo. Risco: projetos sem conclusão, conflitos desnecessários. Ambientes: onde pode liderar, inspirar, agir com autonomia.",
  "Terra":"Talentos: construção, qualidade, persistência, análise, praticidade. Monetiza por: especialização técnica, construção de longo prazo, qualidade premium. Risco: resistência à inovação, excesso de cautela. Ambientes: onde qualidade é valorizada e resultados tangíveis recompensados.",
  "Ar":"Talentos: comunicação, conexão, análise, inovação, mediação. Monetiza por: comunicação, ensino, conexão entre pessoas/ideias. Risco: dispersão, dificuldade de execução. Ambientes: onde ideias circulam e comunicação é valorizada.",
  "Água":"Talentos: intuição, empatia, profundidade, cuidado, criatividade. Monetiza por: cuidado, criatividade, profundidade, intuição. Risco: hipersensibilidade ao ambiente, fronteiras difíceis. Ambientes: onde profundidade e empatia são valorizadas."
};

// -------------------------------------------------------------------------------
// CONSTANTE 6 — MODELO DE TRABALHO + ESTILO COTIDIANO (Casa 6 por signo)
// -------------------------------------------------------------------------------

const MODELO_TRABALHO = `
## MODELO DE TRABALHO IDEAL (indicadores)
AUTONOMIA/EMPREENDEDORISMO: Sol em Casa 1/10 ou aspecto com ASC; Marte forte/liderança; muitos planetas na metade superior; Urano/Saturno fortes em Casa 10; MC em Áries/Leão/Capricórnio.
COLABORAÇÃO/EQUIPE: Sol em Casa 7/11; muitos planetas de ar; Vênus forte em Casa 10 ou aspecto com MC; Libra/Aquário em Casa 10.
BASTIDORES/ESPECIALIZAÇÃO: Sol em Casa 6/12; Mercúrio/Virgem fortes; muitos planetas cadentes (3,6,9,12).
LIDERANÇA PÚBLICA: Sol em Casa 10; Leão em Casa 10; Júpiter/Sol em aspecto com MC; muitos planetas angulares (1,4,7,10).
`;

const CASA6_ESTILO = {
  "Áries":"trabalha rápido, precisa de desafio constante.",
  "Touro":"trabalha com constância, precisa de conforto e estabilidade.",
  "Gêmeos":"trabalha melhor em múltiplos projetos simultâneos.",
  "Câncer":"trabalha melhor em ambiente familiar/acolhedor.",
  "Leão":"trabalha melhor com reconhecimento e criatividade.",
  "Virgem":"trabalha com excelência analítica e atenção a detalhes.",
  "Libra":"trabalha melhor em parceria e ambiente harmonioso.",
  "Escorpião":"trabalha com intensidade e profundidade.",
  "Sagitário":"precisa de liberdade e propósito filosófico.",
  "Capricórnio":"trabalha com disciplina e orientação a resultados.",
  "Aquário":"trabalha melhor com inovação e sem hierarquia rígida.",
  "Peixes":"trabalha melhor em ambiente criativo ou espiritual."
};

// -------------------------------------------------------------------------------
// CONSTANTE 7 — BLOQUEIOS DE CARREIRA (6 padrões)
// -------------------------------------------------------------------------------

const BLOQUEIOS_CARREIRA = `
## OS 6 BLOQUEIOS DE CARREIRA (identificar com evidência no mapa)
1 SABOTAGEM NO SUCESSO ("quando começo a ter sucesso, algo interrompe") — Saturno C10 tenso, Plutão C10, Nodo Sul em carreira. Origem: medo de ser vista, inveja temida, "traição" do grupo de origem. Quebra: terapia para medo de sucesso + estrutura de suporte.
2 ESCOLHA QUE AGRADA OS OUTROS ("escolhi por pressão familiar") — Nodo Sul C10, Saturno C4 em aspecto com MC, Lua C10. Origem: lealdade familiar que reprimiu a vocação. Quebra: identificar o que escolheria se ninguém assistisse.
3 MEDO DE VISIBILIDADE ("tenho capacidade mas me escondo") — planetas C12 ativando MC, Netuno C10, Saturno×Sol tenso. Origem: rejeição/humilhação pública. Quebra: exposição gradual.
4 SUBESTIMAÇÃO DE TALENTOS ("nunca sei o suficiente para cobrar mais") — Saturno C10 ou tenso com Sol, Virgem/Escorpião no MC. Origem: padrão de inadequação. Quebra: lista de evidências reais + mentor externo.
5 DISPERSÃO VOCACIONAL ("tantos talentos que não sei por qual ir") — MC Gêmeos/Sagitário, Júpiter com múltiplos planetas, Urano forte. Origem: medo de comprometimento. Quebra: escolher o que mais serve ao Nodo Norte — uma coisa primeiro.
6 AMBIENTE ERRADO ("tenho talento mas trabalho onde não me valorizam") — signo em Casa 6 vs. ambiente atual. Origem: não reconhecer o ambiente de que precisa. Quebra: identificar qual ambiente ativa o MC vs. onde está.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 8 — TIPOS DE LIDERANÇA
// -------------------------------------------------------------------------------

const TIPOS_LIDERANCA = `
## POTENCIAL DE LIDERANÇA (5 tipos)
INSPIRAÇÃO — Leão em C10/MC, Sol forte, Júpiter C1/C10: lidera pelo exemplo, entusiasmo, brilho.
EXPERTISE — Capricórnio C10, Saturno forte, Virgem em liderança: lidera pelo conhecimento e autoridade construída.
RELACIONAMENTO — Libra C10, Vênus forte público: lidera pela conexão, harmonia, união de pessoas.
TRANSFORMAÇÃO — Escorpião C10, Plutão em aspecto com MC: lidera em crises; quando tudo cai, sabe o que fazer.
VISÃO — Aquário C10, Urano forte, Sagitário MC: lidera pelo futuro que enxerga antes dos outros.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 9 — NODO NORTE VOCACIONAL
// -------------------------------------------------------------------------------

const NODO_NORTE_VOCACIONAL = {
  "Áries":"evolução em liderança autônoma, iniciativa.",
  "Touro":"evolução em construção material, valor.",
  "Gêmeos":"evolução em comunicação e aprendizado.",
  "Câncer":"evolução em cuidado e raízes.",
  "Leão":"evolução em criatividade e expressão pessoal.",
  "Virgem":"evolução em serviço e excelência.",
  "Libra":"evolução em parcerias e equilíbrio.",
  "Escorpião":"evolução em transformação e profundidade.",
  "Sagitário":"evolução em filosofia, ensino, expansão.",
  "Capricórnio":"evolução em autoridade e legado.",
  "Aquário":"evolução em inovação e comunidade.",
  "Peixes":"evolução em espiritualidade e compaixão."
};

// -------------------------------------------------------------------------------
// CONSTANTE 10 — ESTRUTURA DO RELATÓRIO + UPSELL
// -------------------------------------------------------------------------------

const ESTRUTURA_PRO = `
## ESTRUTURA DO RELATÓRIO (21 seções)
1. Carta inicial — trabalho como expressão de quem você é (~300)
2. Perfil vocacional geral (MC + Sol integrados) (~500)
3. Identidade pública — o MC (análise profunda por signo) (~700)
4. Propósito central — o Sol na carreira (~500)
5. Sua ferida que virou vocação — Quíron (~500)
6. Talentos naturais (elemento dominante + planetas) (~600)
7. Habilidades comunicacionais e mentais — Mercúrio (~400)
8. Valores no trabalho — Vênus (~300)
9. Estilo de ação — Marte (~300)
10. Sorte profissional — Júpiter (~400)
11. Lição de carreira — Saturno (~400)
12. Modelo de trabalho ideal (autônomo/equipe/liderança) (~500)
13. Estilo cotidiano — Casa 6 (~300)
14. Bloqueios de carreira (com origem e quebra) (~600)
15. Potencial de liderança (~400)
16. Direção evolutiva — Nodo Norte (~400)
17. Carreiras e ambientes que ativam seu potencial (3-5 CONCRETAS) (~400)
18. Carreiras e ambientes que drenam (~300)
19. Próximos passos práticos (~400)
20. Mensagem final (~200)
21. Próximos passos Astralia (upsell individual)

## TOM E REGRAS
Carreiras ideais sempre CONCRETAS (cargo/área específica, não "comunicação"). Bloqueios com evidência no mapa. "Seu mapa indica" + o que fazer com isso. Integrar o contexto profissional do cliente. Tom: conselheiro vocacional que conhece a alma da pessoa. Nunca vago.

## UPSELL (individual — NÃO combo; no gancho real)
- Mapa da Sorte: revela COMO a prosperidade flui (modelo de renda, períodos, bloqueios financeiros).
- Mapa Astral Personalizado: retrato completo de quem a pessoa é (personalidade, emoção, amor).
- Mapa Kármico: quando há "teto invisível" / bloqueios com raiz profunda.
- Revolução Solar: o que ESTE ano favorece profissionalmente (timing de mudanças/lançamentos).
Oferecer 1-2 mais relevantes ao que a leitura revelou.
`;

// -------------------------------------------------------------------------------
// FUNÇÃO BUILD
// -------------------------------------------------------------------------------
// dados: { nome, dataNascimento, horaNascimento, localNascimento, contexto? }
// mapaNatal: { Sol, Lua, Mercúrio, Vênus, Marte, Júpiter, Saturno, Urano, Netuno,
//   Plutão, "Quíron", "Nodo Norte", MC:{signo,grau}, ASC, cuspideCasa6, cuspideCasa10 }
// aspectos: [{ planeta1, aspecto, planeta2, orbe }]
// nodoSulCasa: opcional (casa do Nodo Sul, para detecção de bloqueios)

function buildPromptMapaProfissional(dados, mapaNatal, aspectos = [], nodoSulCasa = null) {
  const nome = dados.nome || '[NOME]';
  const a = analisarVocacaoPro(mapaNatal, aspectos, nodoSulCasa);

  const planetasInfo = Object.entries(mapaNatal)
    .filter(([k,v]) => v && typeof v==='object' && SIGNOS_ORDEM.includes(v.signo))
    .map(([p,d]) => `  - ${p}: ${d.signo} ${d.grau ?? '?'}°${d.retrogrado?' ℞':''} (Casa ${d.casa ?? '?'})`).join("\n");

  const prompt = `Você é um astrólogo especializado em vocação e psicologia do trabalho. Revela talentos, vocação, bloqueios e o caminho para a realização profissional de ${nome}.
OBJETIVO: revelar a vocação com clareza e ESPECIFICIDADE; talentos em linguagem concreta; modelo de carreira REAL (não vago); honesto sobre bloqueios sem desmotivar; empoderar para ação.
Comprimento: 10.000-14.000 palavras.

# DADOS DA CLIENTE
Nome: ${nome} | Nascimento: ${dados.dataNascimento||'[DATA]'}, ${dados.horaNascimento||'[HORA]'}, ${dados.localNascimento||'[LOCAL]'}
${dados.contexto ? `Situação profissional: ${dados.contexto}` : 'Situação profissional: (não fornecida — solicitar idealmente)'}

# MAPA NATAL
${planetasInfo}
  - MC: ${mapaNatal.MC ? (mapaNatal.MC.signo+' '+(mapaNatal.MC.grau||'')+'°') : '?'} | ASC: ${mapaNatal.ASC || '?'}

# DIAGNÓSTICO VOCACIONAL (já calculado — use como base)
- MC: ${a.mc} | Regente do MC/Casa 10: ${a.regenteMC}
- Ocupantes da Casa 10: ${a.ocupantesC10.join(", ")||"vazia"}
- Sol na carreira: ${a.sol}
- Quíron (ferida→vocação): ${a.quiron}
- Nodo Norte (direção): ${a.nodoNorte}
- Casa 6: cúspide ${a.cuspideC6||'?'}, ocupantes ${a.ocupantesC6.join(", ")||"vazia"}
- Elemento dominante: ${a.elementoDominante} | Modalidade dominante: ${a.modalidadeDominante}
- Modelo de trabalho provável: ${a.modeloTrabalho.join(" > ")||"a definir"}
- Liderança: ${a.lideranca.join(" | ")}
- Bloqueios com sinal no mapa: ${a.bloqueios.length?a.bloqueios.map(b=>b.nome).join(", "):"(nenhum sinal automático — investigar)"}

# ASPECTOS VOCACIONAIS (orbe ≤5°)
${aspectos.length ? aspectos.map(x=>`  - ${x.planeta1} ${x.aspecto} ${x.planeta2} (orbe ${x.orbe ?? '?'}°)`).join("\n") : "(não fornecidos)"}

${FUNDAMENTOS_PRO}

## MC POR SIGNO (use o desta cliente: ${a.mc})
${Object.entries(MC_POR_SIGNO).map(([s,t])=>`${s}: ${t}`).join("\n\n")}

## SOL NA CARREIRA POR CASA
${Object.entries(SOL_CARREIRA_CASA).map(([c,t])=>`Casa ${c}: ${t}`).join("\n")}

## QUÍRON VOCACIONAL — POR SIGNO
${Object.entries(QUIRON_VOCACIONAL_SIGNO).map(([s,t])=>`${s}: ${t}`).join("\n")}
## QUÍRON VOCACIONAL — POR CASA
${Object.entries(QUIRON_VOCACIONAL_CASA).map(([c,t])=>`Casa ${c}: ${t}`).join("\n")}

## TALENTOS POR ELEMENTO DOMINANTE (o desta cliente: ${a.elementoDominante})
${Object.entries(TALENTOS_ELEMENTO).map(([e,t])=>`${e}: ${t}`).join("\n")}

${MODELO_TRABALHO}

## ESTILO COTIDIANO — CASA 6 POR SIGNO
${Object.entries(CASA6_ESTILO).map(([s,t])=>`${s}: ${t}`).join("\n")}

${BLOQUEIOS_CARREIRA}
${TIPOS_LIDERANCA}

## NODO NORTE — DIREÇÃO VOCACIONAL
${Object.entries(NODO_NORTE_VOCACIONAL).map(([s,t])=>`${s}: ${t}`).join("\n")}

${ESTRUTURA_PRO}

# FORMATO DE SAÍDA (OBRIGATÓRIO)
Responda EXCLUSIVAMENTE com JSON válido, sem texto antes/depois, sem markdown:
{ "secoes": [ { "numero": 1, "titulo": "Carta Inicial", "texto": "..." } ] }
REGRAS: aspas duplas; escape quebras como \\n e aspas internas como \\"; sem blocos de código; "numero" exato (1-21); "texto" em PROSA corrida (segunda pessoa, não replicar bullets do template).

# LEMBRETES
1. NOME (${nome}) ao longo do documento
2. ESPECIFICIDADE: cite signo, casa, grau, regente do MC, elemento dominante e Quíron desta cliente
3. Carreiras ideais CONCRETAS (3-5 cargos/áreas específicas) — não "comunicação", mas "coach de liderança, professora de [área], podcast educativo"
4. Quíron: ferida E o dom vocacional que ela contém
5. Bloqueios: cada um com origem e caminho de quebra
6. Modelo de trabalho e tipo de liderança baseados nos indicadores reais
7. Integre o contexto profissional da cliente, se houver
8. Tom prático, revelador, nunca vago; honesto sobre bloqueios sem desmotivar
9. Upsell individual ao final (1-2: Sorte, Astral, Kármico ou Revolução) — sem combo
10. Mínimo 10.000 palavras

Gere agora o Mapa Profissional completo (seções 1-21). Retorne apenas o JSON.`;

  return {
    diagnostico: { cliente: nome, ...a },
    prompt,
    metadados: {
      framework: "Mapa Profissional — MC + Sol + Quíron + 15 indicadores + elemento dominante + modelo de trabalho + bloqueios + liderança",
      modeloRecomendado: "claude-opus-4-7",
      modeloAlternativoAB: "claude-sonnet-4-6",
      palavrasEsperadas: "10.000-14.000",
      tipo: "premium_assincrono_48h",
      saida: "JSON estruturado por seções (renderização de PDF é camada separada)",
      versao: "3.0"
    }
  };
}

module.exports = {
  buildPromptMapaProfissional,
  analisarVocacaoPro, detectarModeloTrabalho, detectarLideranca, detectarBloqueios,
  elementoModalidadeDominante,
  FUNDAMENTOS_PRO, MC_POR_SIGNO, SOL_CARREIRA_CASA,
  QUIRON_VOCACIONAL_SIGNO, QUIRON_VOCACIONAL_CASA, TALENTOS_ELEMENTO,
  MODELO_TRABALHO, CASA6_ESTILO, BLOQUEIOS_CARREIRA, TIPOS_LIDERANCA,
  NODO_NORTE_VOCACIONAL, ESTRUTURA_PRO, REGENTE_SIGNO, ELEMENTO_SIGNO, MODALIDADE_SIGNO
};
