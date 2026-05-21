// ═══════════════════════════════════════════════════════════════════════════════
// 💼 PROMPT — MAPA PROFISSIONAL E VOCACIONAL — Astralia
// ═══════════════════════════════════════════════════════════════════════════════
// Produto Premium — Entrega assíncrona em até 48h via n8n
// Modelo recomendado: claude-sonnet-4-6 (Sonnet — voz clara, leitura de um mapa)
// Comprimento alvo: 8.000-12.000 palavras
// Tom: VOZ CLARA E SIMPLES (uma criança de 10 anos entenderia) — honesto, não só positivo
// Foco: vocação, talentos, potencial profissional, modelo de renda, desafios
// ═══════════════════════════════════════════════════════════════════════════════
// Compila INTEGRALMENTE o "Guia Técnico — Mapa Profissional e Vocacional".
// Saída em JSON estruturado por seções (camada de PDF é separada — não vai no prompt).
// ═══════════════════════════════════════════════════════════════════════════════

const SIGNOS_ORDEM = ["Áries","Touro","Gêmeos","Câncer","Leão","Virgem","Libra","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];

// Regência tradicional (base p/ achar regente do MC e da Casa 10). Moderno onde aplicável.
const REGENTE_SIGNO = {
  "Áries": "Marte", "Touro": "Vênus", "Gêmeos": "Mercúrio", "Câncer": "Lua",
  "Leão": "Sol", "Virgem": "Mercúrio", "Libra": "Vênus", "Escorpião": "Marte",
  "Sagitário": "Júpiter", "Capricórnio": "Saturno", "Aquário": "Saturno", "Peixes": "Júpiter"
};
const REGENTE_MODERNO = { "Escorpião": "Plutão", "Aquário": "Urano", "Peixes": "Netuno" };

const ELEMENTO_SIGNO = {
  "Áries": "Fogo", "Leão": "Fogo", "Sagitário": "Fogo",
  "Touro": "Terra", "Virgem": "Terra", "Capricórnio": "Terra",
  "Gêmeos": "Ar", "Libra": "Ar", "Aquário": "Ar",
  "Câncer": "Água", "Escorpião": "Água", "Peixes": "Água"
};
const MODALIDADE_SIGNO = {
  "Áries": "Cardinal", "Câncer": "Cardinal", "Libra": "Cardinal", "Capricórnio": "Cardinal",
  "Touro": "Fixo", "Leão": "Fixo", "Escorpião": "Fixo", "Aquário": "Fixo",
  "Gêmeos": "Mutável", "Virgem": "Mutável", "Sagitário": "Mutável", "Peixes": "Mutável"
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
// CONSTANTE 1 — METODOLOGIA: OS 9 INDICADORES VOCACIONAIS + PROCESSO
// -------------------------------------------------------------------------------

const METODOLOGIA_VOCACIONAL = `
═══════════════════════════════════════════════════════════════════════════════
MAPA PROFISSIONAL E VOCACIONAL — METODOLOGIA
═══════════════════════════════════════════════════════════════════════════════
Análise personalizada do mapa natal focada em vocação, talentos, potencial e
prosperidade. Analisa TODOS os indicadores que afetam carreira — não genérica.
Voz CLARA e SIMPLES; perspectivas honestas (não só positivas); ações práticas.

## OS 9 INDICADORES VOCACIONAIS (analisar exatamente estes)
1. MC (Meio do Céu) — carreira pública, reputação → TIPO de carreira
2. Casa 10 — qual planeta governa a carreira → COMBUSTÍVEL profissional
3. Sol — essência profissional, quando você está "vivo" no trabalho → IDENTIDADE
4. Mercúrio — como comunica e pensa → FERRAMENTA
5. Marte — energia, ação, ritmo → RITMO DE TRABALHO
6. Casa 6 — trabalho diário, ambiente, rotina → AMBIENTE IDEAL
7. Plutão — poder transformador, impacto → IMPACTO
8. Nodo Norte — evolução profissional → DIREÇÃO FUTURA
9. Casa 2 + Vênus — como prospera financeiramente, o que ama fazer → MODELO DE RENDA
(10º apoio: PARTE DA FORTUNA — onde o fluxo de renda acontece com menos esforço.)

## PROCESSO (4 passos por indicador)
PASSO 1 Extração: signo (ESTILO), casa (ÁREA), aspectos (FACILIDADE/DESAFIO), retrógrado (LIÇÃO INTERNA).
PASSO 2 Interpretação técnica: Signo + Casa + Aspectos = significado ESPECÍFICO (não genérico).
PASSO 3 Procura por PADRÕES: tema que aparece em múltiplos indicadores = MUITO importante (ex.: comunicação em 4 indicadores → comunicação é CENTRAL).
PASSO 4 Síntese: integra os 9 numa visão coerente e personalizada.

## PADRÃO DOMINANTE
Conte elemento (Fogo/Terra/Ar/Água) e modalidade (Cardinal/Fixo/Mutável) dos planetas-chave (Sol, Mercúrio, Marte, Vênus, regente do MC). Dominante revela o estilo profissional de fundo. Fogo=ação/liderança; Terra=construção/concretude; Ar=ideias/comunicação; Água=cuidado/intuição/transformação. Cardinal=inicia; Fixo=sustenta; Mutável=adapta.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 2 — VÊNUS VOCACIONAL POR SIGNO (integral)
// -------------------------------------------------------------------------------

const VENUS_VOCACIONAL = `
## VÊNUS POR SIGNO — O QUE VOCÊ AMA E PELO QUE PODE SER PAGA
ÁRIES: prospera ao agir com coragem, iniciar, começar o novo. Renda de ação rápida, empreendedorismo. Áreas de iniciativa e movimento.
TOURO: prospera ao construir solidamente, investir com paciência, valorizar qualidade. Renda de construção lenta mas sólida. Segura, não fica rica rápido.
GÊMEOS: prospera ao comunicar, conectar, oferecer variedade. Renda de múltiplas fontes. Comunicação, networking, múltiplos projetos.
CÂNCER: prospera ao cuidar genuinamente, acolher, criar segurança. Renda de cuidado (saúde, educação, família). Pessoas, não abstrações.
LEÃO: prospera ao brilhar, criar, liderar com autoridade. Renda de visibilidade, criatividade, destaque. Criatividade, educação, liderança visível.
VIRGEM: prospera ao oferecer excelência, especializar, otimizar. Renda de expertise. Consultoria, serviços especializados.
LIBRA: prospera ao equilibrar, relacionar, trabalhar em parceria. Renda de relacionamentos profissionais. Não trabalhar isolada.
ESCORPIÃO: prospera ao transformar realidades, revelar verdades. Renda de transformação profunda (terapia, mentoria). Áreas que transformam pessoas.
SAGITÁRIO: prospera ao ensinar, expandir, compartilhar conhecimento. Renda de educação e generosidade. Quanto mais compartilha, mais retorna.
CAPRICÓRNIO: prospera ao liderar estruturado, construir com responsabilidade. Renda de autoridade e construção de longo prazo.
AQUÁRIO: prospera ao inovar, conectar grupos, oferecer o novo. Renda de inovação e tecnologia. Comunidades, tecnologia, ideias do futuro.
PEIXES: prospera ao criar artisticamente, oferecer compaixão, acessar espiritualidade. Renda de criatividade transpessoal. Trabalho sagrado, não comercial puro.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 3 — APLICAÇÃO PRÁTICA (perguntas que o produto responde)
// -------------------------------------------------------------------------------

const APLICACAO_PRATICA = `
## APLICAÇÃO PRÁTICA — RESPONDER COM FRANQUEZA

### QUAL É SUA VOCAÇÃO IDEAL?
Integrar os 9 indicadores numa área ESPECÍFICA (não "administração" genérica, mas o tipo exato). Justificar: usa talentos naturais (Mercúrio, Marte), alinha com motivação (Sol, Vênus), oferece impacto evolutivo (Nodo Norte), gera prosperidade natural (Casa 2, Vênus).

### DEVO FAZER CONCURSO PÚBLICO?
Checar: Lilith em Casa 6? Ascendente exige liberdade? MC indica carreira criativa? Saturno apoia estrutura rígida? → Resposta FRANCA (sim/não com o porquê). Se o mapa pede liberdade/criatividade, dizer honestamente que concurso pode sufocar — mesmo que seja o "seguro".

### DEVO EMPREENDER?
Checar: Marte forte? Plutão em Casa 10? Ascendente de liderança? Nodo Norte apoia independência? → Resposta clara. Empreender exige Marte com energia e tolerância a risco; se o mapa mostra paralisia de Marte ou necessidade de estrutura, dizer.

### COMO GANHO DINHEIRO? (modelo natural de renda)
Baseado em Casa 2 + Vênus + Júpiter + Parte da Fortuna: Tipo (rápido/lento/cíclico), Fonte (primária + secundária), faixa realista, modelo ideal de estruturação. Cruzar com a Parte da Fortuna (onde a renda flui com menos esforço).

### DESAFIOS PROFISSIONAIS
Identificar os principais desafios (quadraturas/oposições a Mercúrio/Marte/MC/Saturno, planetas em detrimento/queda, retrógrados). Para cada: Manifestação (como aparece), Origem (qual aspecto causa), Trabalho (como contornar). Honesto, sem catastrofizar — desafio é oportunidade de crescimento.

## PRÓXIMOS PASSOS (90 dias)
Semana 1: validar a vocação com o mapa. Semana 2: identificar o maior bloqueio. Semana 3: teste pequeno (2 semanas). Semana 4: timeline de 12 meses. Mês 2: se fluxo confirmado, buscar mentoria. Mês 3: estruturar modelo de renda. Revisar a cada 90 dias.

## MENSAGEM FINAL
Astrologia não determina — você determina. O mapa revela talentos reais, vocação autêntica, potencial provado, desafios de crescimento e timing. Escolhas conscientes resultam em melhor vida. Tom: clareza, coragem, celebração de quem a pessoa é.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 4 — ESTRUTURA + UPSELL (combo desativado → cross-sell individual)
// -------------------------------------------------------------------------------

const ESTRUTURA_PROFISSIONAL = `
## ESTRUTURA DO ENTREGÁVEL (seções)
1. Capa + dados da cliente
2. Introdução (o que este mapa revela, como ler)
3-11. OS 9 INDICADORES (um a um): MC; Casa 10; Sol; Mercúrio; Marte; Casa 6; Plutão; Nodo Norte; Casa 2+Vênus — cada um com signo/casa/aspectos e o que significa na prática
12. PARTE DA FORTUNA (apoio): onde a renda flui com menos esforço
13. SÍNTESE DOS INDICADORES (o padrão que emerge dos 9 juntos — esta é a vocação)
14. SUA VOCAÇÃO IDEAL (área específica + por que funciona)
15. DEVO FAZER CONCURSO PÚBLICO? (resposta franca)
16. DEVO EMPREENDER? (resposta franca)
17. COMO GANHO DINHEIRO? (modelo de renda)
18. DESAFIOS PROFISSIONAIS (3 principais, com manifestação/origem/trabalho)
19. PRÓXIMOS PASSOS (plano de 90 dias)
20. MENSAGEM FINAL + Comunidade VIP
21. PRÓXIMOS PASSOS ASTRALIA (upsell individual — ver abaixo)

## UPSELL (individual — NÃO combo)
Oferecer um a um, conforme o que a leitura revelou:
- Mapa da Sorte e Prosperidade: aprofunda Casa 2 + Vênus, mostra COMO ganhar dinheiro. (Oferta primária se o tema renda/prosperidade dominou.)
- Mapa de Previsões 18 Meses: mostra QUANDO agir (timing). (Oferta se a pessoa está em fase de decisão/mudança.)
- Mapa Kármico: explica a ORIGEM dos desafios, acelera a resolução de bloqueios. (Oferta se os desafios profissionais têm raiz profunda.)
Oferecer no máximo 1-2 mais relevantes — não os três de uma vez (vira ruído).
`;

// -------------------------------------------------------------------------------
// CÁLCULO — PARTE DA FORTUNA (10º indicador de apoio)
// -------------------------------------------------------------------------------

function longitudeAbsoluta(signo, grau) {
  const idx = SIGNOS_ORDEM.indexOf(signo);
  return idx === -1 ? null : idx * 30 + grau;
}
function signoEGrau(longitude) {
  const lon = ((longitude % 360) + 360) % 360;
  const idx = Math.floor(lon / 30);
  return { signo: SIGNOS_ORDEM[idx], grau: +(lon - idx * 30).toFixed(2), longitude: +lon.toFixed(2) };
}
function ehDiurna(solCasa){ return [7,8,9,10,11,12].includes(solCasa); }
function dentroDoArco(x,ini,fim){ x=((x%360)+360)%360;ini=((ini%360)+360)%360;fim=((fim%360)+360)%360; return ini<=fim?(x>=ini&&x<fim):(x>=ini||x<fim); }
function determinarCasaPF(pfLon,cuspides,ascLon){
  if(Array.isArray(cuspides)&&cuspides.length===12){for(let i=0;i<12;i++){if(dentroDoArco(pfLon,cuspides[i],cuspides[(i+1)%12]))return i+1;}}
  return Math.floor((((pfLon-ascLon)%360+360)%360)/30)+1;
}
function calcularParteFortuna(asc,lua,sol,cuspides=null){
  const a=longitudeAbsoluta(asc.signo,asc.grau),l=longitudeAbsoluta(lua.signo,lua.grau),s=longitudeAbsoluta(sol.signo,sol.grau);
  if(a==null||l==null||s==null)return null;
  const diurna=ehDiurna(sol.casa);
  const r=signoEGrau(diurna?(a+l-s):(a+s-l));
  r.sect=diurna?"diurna":"noturna";
  r.casa=determinarCasaPF(r.longitude,cuspides,a);
  return r;
}

// -------------------------------------------------------------------------------
// ANÁLISE DOS 9 INDICADORES
// -------------------------------------------------------------------------------

function avaliarDignidade(planeta, signo){
  const d=DIGNIDADES[planeta]; if(!d)return"neutro";
  if(d.exalta.includes(signo))return"exaltado"; if(d.rege.includes(signo))return"rege";
  if(d.cai.includes(signo))return"caído"; if(d.detrimento.includes(signo))return"detrimento"; return"neutro";
}

function analisarVocacao(mapaNatal, aspectos = [], posicoes = null) {
  const get = (p) => mapaNatal[p] || null;
  const mc = mapaNatal.MC || null;          // {signo, grau}
  const casa10cuspide = mapaNatal.cuspideCasa10 || (mc ? mc.signo : null);
  const casa6cuspide = mapaNatal.cuspideCasa6 || null;
  const casa2cuspide = mapaNatal.cuspideCasa2 || null;

  // Regente do MC / Casa 10 (combustível profissional)
  const regenteMC = mc ? REGENTE_SIGNO[mc.signo] : null;
  const regenteModernoMC = mc ? (REGENTE_MODERNO[mc.signo] || null) : null;
  const regentePos = regenteMC ? get(regenteMC) : null;

  // Planetas ocupando casas-chave
  const ocupantes = (casa) => Object.entries(mapaNatal)
    .filter(([k,v]) => v && typeof v === 'object' && v.casa === casa && SIGNOS_ORDEM.includes(v.signo))
    .map(([k]) => k);

  // Padrão dominante (elemento + modalidade dos planetas-chave)
  const chave = ["Sol","Mercúrio","Marte","Vênus"].map(get).filter(Boolean);
  if (regentePos) chave.push(regentePos);
  const contaEl = {Fogo:0,Terra:0,Ar:0,Água:0}, contaMod = {Cardinal:0,Fixo:0,Mutável:0};
  chave.forEach(p => { if(ELEMENTO_SIGNO[p.signo]) contaEl[ELEMENTO_SIGNO[p.signo]]++; if(MODALIDADE_SIGNO[p.signo]) contaMod[MODALIDADE_SIGNO[p.signo]]++; });
  const elementoDominante = Object.entries(contaEl).sort((a,b)=>b[1]-a[1])[0][0];
  const modalidadeDominante = Object.entries(contaMod).sort((a,b)=>b[1]-a[1])[0][0];

  // Parte da Fortuna (apoio)
  let pf = null;
  if (posicoes && posicoes.asc && posicoes.lua && posicoes.sol) {
    pf = calcularParteFortuna(posicoes.asc, posicoes.lua, posicoes.sol, posicoes.cuspides || null);
  }

  return {
    indicador1_MC: mc ? `MC em ${mc.signo} ${mc.grau || ''}°` : "MC não fornecido",
    indicador2_Casa10: `Regente do MC/Casa 10: ${regenteMC || '?'}${regenteModernoMC ? ` (moderno: ${regenteModernoMC})` : ''}${regentePos ? ` em ${regentePos.signo} Casa ${regentePos.casa}` : ''} | Ocupantes da Casa 10: ${ocupantes(10).join(", ") || "vazia"}`,
    indicador3_Sol: get("Sol") ? `Sol em ${get("Sol").signo} Casa ${get("Sol").casa} (${avaliarDignidade("Sol",get("Sol").signo)})` : "?",
    indicador4_Mercurio: get("Mercúrio") ? `Mercúrio em ${get("Mercúrio").signo} Casa ${get("Mercúrio").casa} (${avaliarDignidade("Mercúrio",get("Mercúrio").signo)})` : "?",
    indicador5_Marte: get("Marte") ? `Marte em ${get("Marte").signo} Casa ${get("Marte").casa} (${avaliarDignidade("Marte",get("Marte").signo)})` : "?",
    indicador6_Casa6: `Cúspide Casa 6: ${casa6cuspide || '?'} | Ocupantes: ${ocupantes(6).join(", ") || "vazia"}`,
    indicador7_Plutao: get("Plutão") ? `Plutão em ${get("Plutão").signo} Casa ${get("Plutão").casa}` : "?",
    indicador8_NodoNorte: get("Nodo Norte") ? `Nodo Norte em ${get("Nodo Norte").signo} Casa ${get("Nodo Norte").casa}` : "?",
    indicador9_Casa2_Venus: `Cúspide Casa 2: ${casa2cuspide || '?'} | Vênus em ${get("Vênus") ? get("Vênus").signo + " Casa " + get("Vênus").casa + " (" + avaliarDignidade("Vênus",get("Vênus").signo) + ")" : "?"} | Ocupantes Casa 2: ${ocupantes(2).join(", ") || "vazia"}`,
    indicador10_ParteFortuna: pf ? `Parte da Fortuna em ${pf.signo} ${pf.grau}° Casa ${pf.casa} (carta ${pf.sect})` : "Parte da Fortuna: calcular manualmente (ASC+Lua−Sol diurna; ASC+Sol−Lua noturna)",
    padraoDominante: `Elemento dominante: ${elementoDominante} | Modalidade dominante: ${modalidadeDominante}`
  };
}

// -------------------------------------------------------------------------------
// FUNÇÃO BUILD
// -------------------------------------------------------------------------------

function buildPromptMapaProfissional(dados, mapaNatal, aspectos = [], posicoes = null) {
  const nome = dados.nome || '[NOME]';
  const dataNasc = dados.dataNascimento || dados.data || '[DATA]';
  const horaNasc = dados.horaNascimento || dados.hora || '[HORA]';
  const localNasc = dados.localNascimento || dados.local || `${dados.cidade || '[CIDADE]'}, ${dados.estado || '[ESTADO]'}`;

  const analise = analisarVocacao(mapaNatal, aspectos, posicoes);

  const planetasInfo = Object.entries(mapaNatal)
    .filter(([k,v]) => v && typeof v === 'object' && SIGNOS_ORDEM.includes(v.signo))
    .map(([p,d]) => `  - ${p}: ${d.signo} ${d.grau ?? '?'}°${d.retrogrado ? ' ℞' : ''} (Casa ${d.casa ?? '?'})`).join("\n");

  const prompt = `Você é uma astróloga vocacional da Astralia. Gere um MAPA PROFISSIONAL E VOCACIONAL para ${nome}.
VOZ CLARA E SIMPLES (uma criança de 10 anos entenderia). Honesta — não só positiva. Ações práticas.
Comprimento: 8.000-12.000 palavras.

# DADOS DA CLIENTE
Nome: ${nome}
Nascimento: ${dataNasc}, ${horaNasc}, ${localNasc}

# MAPA NATAL
${planetasInfo}
  - MC: ${mapaNatal.MC ? mapaNatal.MC.signo + ' ' + (mapaNatal.MC.grau||'') + '°' : '?'} | ASC: ${mapaNatal.ASC || '?'}

# ASPECTOS
${aspectos.length ? aspectos.map(a=>`  - ${a.planeta1} ${a.aspecto} ${a.planeta2} (orbe ${a.orbe ?? '?'}°)`).join("\n") : "(não fornecidos)"}

# DIAGNÓSTICO VOCACIONAL (já calculado — use como base)
- ${analise.indicador1_MC}
- ${analise.indicador2_Casa10}
- ${analise.indicador3_Sol}
- ${analise.indicador4_Mercurio}
- ${analise.indicador5_Marte}
- ${analise.indicador6_Casa6}
- ${analise.indicador7_Plutao}
- ${analise.indicador8_NodoNorte}
- ${analise.indicador9_Casa2_Venus}
- ${analise.indicador10_ParteFortuna}
- ${analise.padraoDominante}

${METODOLOGIA_VOCACIONAL}

${VENUS_VOCACIONAL}

${APLICACAO_PRATICA}

${ESTRUTURA_PROFISSIONAL}

# FORMATO DE SAÍDA (OBRIGATÓRIO)
Responda EXCLUSIVAMENTE com JSON válido, sem texto antes/depois, sem markdown:
{ "secoes": [ { "numero": 1, "titulo": "Capa", "texto": "..." } ] }
REGRAS: aspas duplas; escape quebras como \\n e aspas internas como \\"; sem blocos de código; "numero" exato (1-21); "texto" em PROSA corrida (segunda pessoa, clara, específica — NÃO replicar bullets do template).

# LEMBRETES
1. NOME da cliente no mínimo 3x
2. SEGUNDA PESSOA, voz simples (criança de 10 anos entende)
3. ESPECIFICIDADE: cite signo, casa, grau, regente do MC, e a Parte da Fortuna dela
4. Procure o PADRÃO (tema que repete nos 9 indicadores) — é a vocação central
5. Responda com FRANQUEZA: concurso (sim/não), empreender (sim/não), modelo de renda, desafios
6. Honesto, não só positivo — se o mapa pede liberdade, diga que concurso pode sufocar
7. Upsell INDIVIDUAL ao final (1-2 mais relevantes: Sorte, Previsões ou Kármico) — sem combo

Gere agora o mapa completo (seções 1-21). Retorne apenas o JSON.`;

  return {
    diagnostico: { cliente: nome, ...analise },
    prompt,
    metadados: {
      framework: "Mapa Profissional — 9 indicadores vocacionais + Parte da Fortuna + padrão dominante",
      modeloRecomendado: "claude-sonnet-4-6",
      palavrasEsperadas: "8.000-12.000",
      tipo: "premium_assincrono_48h",
      saida: "JSON estruturado por seções (renderização de PDF é camada separada)",
      versao: "2.0"
    }
  };
}

module.exports = {
  buildPromptMapaProfissional,
  analisarVocacao,
  calcularParteFortuna,
  METODOLOGIA_VOCACIONAL,
  VENUS_VOCACIONAL,
  APLICACAO_PRATICA,
  ESTRUTURA_PROFISSIONAL,
  REGENTE_SIGNO,
  ELEMENTO_SIGNO,
  MODALIDADE_SIGNO
};
