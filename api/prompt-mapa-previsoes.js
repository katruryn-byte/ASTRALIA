// ═══════════════════════════════════════════════════════════════════════════════
// MAPA DE PREVISÕES 18 MESES — Astralia.online
// Compilado INTEGRAL das Diretrizes Completas. Padrão premium.
// Modelo recomendado: claude-opus-4-7
// O prompt RECEBE os trânsitos do período como input (a coleta é do motor adaptado —
// Previsões é uma das exceções que precisam de dados além do mapa natal único).
// ═══════════════════════════════════════════════════════════════════════════════

const SIGNOS_ORDEM = ["Áries","Touro","Gêmeos","Câncer","Leão","Virgem","Libra","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];

// ── CONSTANTE 1 — FUNDAMENTOS ──────────────────────────────────────────────────
const FUNDAMENTOS_PREVISOES = `
O QUE SÃO TRÂNSITOS
Trânsitos são os movimentos dos planetas no céu agora, em relação à posição dos planetas
no momento do nascimento. Quando um planeta em trânsito "toca" um planeta natal (aspecto),
ele ativa a energia daquele ponto do mapa — como se o tempo pressionasse botões específicos
do mapa natal. Cada botão ativa um tema, uma qualidade, uma possibilidade.

QUAIS TRÂNSITOS IMPORTAM (nem todos são iguais)
- Planetas rápidos (Sol, Lua, Mercúrio, Vênus, Marte): passam rápido, efeito de dias.
- Planetas lentos (Júpiter, Saturno, Urano, Netuno, Plutão): ficam meses/anos, efeito profundo.
Para previsão de 18 meses, o foco são:
  JÚPITER (1 ano/signo): cria oportunidades, abre portas, expande.
  SATURNO (2,5 anos/signo): cria responsabilidades, desafios que ensinam.
  URANO (7 anos/signo): cria rupturas e inovações.
  NETUNO (14 anos/signo): cria dissolução e espiritualidade.
  PLUTÃO (15-30 anos/signo): cria transformações profundas.
  MARTE (1,5-2 meses/signo): ativa ação e possíveis conflitos.
Trânsitos sobre casas angulares (1,4,7,10) são mais VISÍVEIS externamente.
Trânsitos sobre planetas pessoais (Sol, Lua, Vênus, Marte) são mais SENTIDOS.

O QUE ESTE MAPA REVELA
Os temas centrais dos 18 meses; os meses de maior oportunidade por área; os períodos que
pedem cuidado/estrutura; os eventos mais prováveis (linguagem de tendência, não certeza);
as janelas ideais para decisões; o que cada fase está pedindo.`;

// ── CONSTANTE 2 — COMO LER + MODO DO ASPECTO ───────────────────────────────────
const COMO_LER_TRANSITOS = `
Para cada trânsito relevante, três perguntas:
1) QUAL planeta está em trânsito? → define a QUALIDADE da energia (Júpiter=expansão, Saturno=responsabilidade, Urano=ruptura, Netuno=dissolução, Plutão=transformação, Marte=ação).
2) SOBRE QUAL ponto natal? → define a ÁREA ativada (Sol=identidade, Lua=emoção/família, MC=carreira, Casa 7=relacionamento, etc.).
3) QUAL aspecto? → define o MODO de manifestação:
   - Conjunção (0°): fusão intensa — máxima ativação.
   - Trígono (120°): fluxo fácil — oportunidade.
   - Sextil (60°): oportunidade que precisa de ação.
   - Quadratura (90°): tensão — desafio que cresce.
   - Oposição (180°): polarização — equilíbrio necessário.

Para trânsitos NÃO tabelados abaixo, interpretar pela combinação dos três eixos acima
(qualidade do planeta em trânsito × ponto/área natal × modo do aspecto). Nunca omitir um
trânsito significativo só por não estar na tabela.`;

// ── CONSTANTE 3 — CRITÉRIOS DE PRIORIZAÇÃO (quais trânsitos destacar) ───────────
const CRITERIOS_PRIORIZACAO = `
CRITÉRIO 1: planeta lento + planeta pessoal natal → Júpiter/Saturno sobre Sol, Lua, Vênus, Marte = muito significativo.
CRITÉRIO 2: planeta lento + ângulo natal → qualquer lento sobre ASC, MC, DESC ou IC = muito visível externamente.
CRITÉRIO 3: planeta lento + ingresso em casa → Júpiter/Saturno entrando em nova casa = novo tema começa.
CRITÉRIO 4: múltiplos trânsitos no mesmo período → 2+ planetas tocando a mesma área no mesmo mês = período de intensidade.
CRITÉRIO 5: Retorno de Saturno / Saturno oposição (~29 e ~44 anos): marco de maturidade e reavaliação.
CRITÉRIO 6: Retorno de Júpiter (~12 anos): renovação de ciclo, oportunidades concentradas.
NÃO liste todos os trânsitos — apenas os significativos para ESTA pessoa.`;

// ── CONSTANTE 4 — LINGUAGEM PREMONITÓRIA (regra de tom) ─────────────────────────
const LINGUAGEM_PREMONITORIA = `
Premonitório, NUNCA catastrófico. Tendências, não certezas. Cada previsão com ação prática.
Use "existe tendência a...", "seu mapa indica...", "este período favorece..." — nunca afirmações absolutas.

NUNCA: "Em março você vai perder o emprego."
SEMPRE: "Março traz Saturno sobre seu MC. Existe forte tendência a que a carreira passe por
reavaliação ou desafio que pede estruturação — pode se manifestar como mudança de função,
revisão de contrato ou necessidade de assumir mais responsabilidade."

NUNCA: "Em julho você vai se apaixonar."
SEMPRE: "Julho traz Vênus e Júpiter ativando sua Casa 7 e Vênus natal. Existe tendência
favorável a encontros, reconexões ou aprofundamento de um relacionamento existente."`;

// ── CONSTANTE 5 — TEMPLATE DA NARRATIVA MENSAL ─────────────────────────────────
const ESTRUTURA_MENSAL = `
Para CADA mês, usar a estrutura:
MÊS [X] — [Nome]
TEMA DO MÊS: [frase-síntese]
ÁREA EM DESTAQUE: [qual área da vida]
TRÂNSITO PRINCIPAL: [qual e o que ativa]
TENDÊNCIA: [o que pode acontecer]
OPORTUNIDADE: [onde agir]
CUIDADO: [onde se proteger]
MENSAGEM: [frase premonitória inspiradora]`;

// ── CONSTANTE 6 — JÚPITER EM TRÂNSITO (integral) ───────────────────────────────
const JUPITER_TRANSITO = `
JÚPITER EM TRÂNSITO — expansão, sorte, oportunidade (dá oportunidade, não resultado sem ação).
SOBRE SOL: reconhecimento, expansão pessoal, visibilidade; oportunidades com menos esforço; projetos pessoais ganham impulso. Duração 1-3 meses.
SOBRE LUA: expansão emocional; família pode crescer (nascimento, reencontro); bem-estar e gratidão; bom para decisões emocionais importantes.
SOBRE MERCÚRIO: expansão da comunicação; oportunidades de escrita/ensino/publicação; mente em alta; contratos e negociações favoráveis.
SOBRE VÊNUS: um dos melhores períodos para amor e prosperidade; relacionamentos florescem; tendência a ganhos financeiros, novos vínculos ou renovação.
SOBRE MARTE: ação ampliada, ambição em alta, projetos parados avançam; cuidado com excesso de confiança e risco desnecessário; resultados rápidos no que iniciar agora.
SOBRE MC: expansão de carreira; promoções, reconhecimento, oportunidades profissionais; um dos melhores trânsitos profissionais; tendência a ser vista/chamada/convidada para posições maiores.
SOBRE ASC: expansão pessoal; apresentação mais magnética; oportunidades chegam à porta; bem-estar físico; novos começos em várias áreas.
SOBRE SATURNO: expansão encontrando estrutura; ampliar o que se construiu; projetos de longo prazo ganham visibilidade; reconhecimento pelo trabalho consistente.
ENTRANDO EM NOVA CASA (energiza os temas da casa por ~12 meses):
  C1: expansão pessoal, novo ciclo de identidade · C2: expansão financeira, renda cresce ·
  C3: comunicação prospera · C4: família/lar (mudança de casa, família cresce) ·
  C5: criatividade e romance · C6: trabalho (mais projetos/clientes) ·
  C7: parcerias (casamento, novas parcerias) · C8: recursos externos (herança, investimento) ·
  C9: filosofia (viagem, estudo, publicação) · C10: carreira (promoção, reconhecimento) ·
  C11: social (amizades, grupos, causas) · C12: espiritual (proteção invisível ativa).`;

// ── CONSTANTE 7 — SATURNO EM TRÂNSITO (integral) ───────────────────────────────
const SATURNO_TRANSITO = `
SATURNO EM TRÂNSITO — não bloqueia: exige maturidade e estrutura. O sólido permanece, o resto cai.
SOBRE SOL: avaliação e responsabilidade pessoal; chamada a uma versão mais madura; possível cansaço/peso; o que não era real na identidade se desfaz. Duração 1-2 anos.
SOBRE LUA: responsabilidade emocional; relações passam por prova de realidade; possível distância/frieza que protege mas isola; curar padrões antigos via desafio; cuidado com desânimo — buscar apoio.
SOBRE VÊNUS: amor em prova de maturidade; o que tem base sólida fica mais forte; o que não tinha base tende a encerrar; definir compromissos com seriedade.
SOBRE MARTE: ação encontra estrutura e limite; trabalhar mais para o mesmo resultado, mas o que constrói é mais sólido; disciplina de ação, resultados duradouros se persistir.
SOBRE MC: carreira em avaliação e possível reestruturação; responsabilidades aumentam; o construído com integridade permanece.
ENTRANDO EM NOVA CASA:
  C1: mais responsabilidade sobre a identidade · C2: disciplina financeira, construção sólida ·
  C4: responsabilidades familiares aumentam · C7: parcerias testadas, maturidade relacional ·
  C10: carreira exige mais, legado é construído agora.`;

// ── CONSTANTE 8 — URANO / NETUNO / PLUTÃO / MARTE (integral) ────────────────────
const LENTOS_E_MARTE_TRANSITO = `
URANO EM TRÂNSITO — ruptura, inovação, libertação (transita 7 anos/signo; aspectos duram meses):
  SOBRE SOL: mudança radical de identidade; imprevisível e libertador; o que precisava mudar muda, às vezes brutalmente.
  SOBRE MC: mudança radical de carreira; caminho profissional inesperado; ruptura com estrutura que já não servia.
  SOBRE VÊNUS: amor que rompe padrão; relacionamento inesperado ou ruptura inesperada; liberdade que não cabia na estrutura anterior.

NETUNO EM TRÂNSITO — dissolução, espiritualidade (lento e sutil):
  SOBRE SOL: identidade em dissolução; quem se achava ser fica nebuloso; espiritualidade profunda; confusão que antecede clareza (processo de anos).
  SOBRE VÊNUS: amor idealizado, vínculo espiritual ou ilusão amorosa; compaixão; cuidado com relações que não são o que parecem.

PLUTÃO EM TRÂNSITO — transformação irreversível:
  SOBRE SOL: transformação radical de identidade; morte e renascimento do ego; pode levar anos; ao fim, fundamentalmente diferente.
  SOBRE LUA: transformação emocional profunda; luto, crise, purificação; o reprimido emerge; crise que liberta.
  SOBRE MC: transformação radical de carreira; poder que surge ou cai; há um "antes" e "depois"; liderança transformadora ou ruptura.

MARTE EM TRÂNSITO — ação, energia, possível conflito (1,5-2 meses/signo):
  SOBRE SOL: energia explosiva, ação acelerada, projetos avançam; cuidado com conflitos/acidentes.
  SOBRE MC: ambição em alta, ação profissional intensa; conquista ou conflito no trabalho.`;

// ── CONSTANTE 9 — RETRÓGRADOS (integral) ───────────────────────────────────────
const RETROGRADOS = `
Retrógrado = energia voltada para dentro: revisão, reavaliação.
MERCÚRIO Rx (3x/ano, ~3 sem): comunicação mais lenta, mal-entendidos; atenção a contratos, eletrônicos, viagens. BOM para revisar/reler/reconectar/reformular. EVITAR assinar contratos importantes, comprar eletrônicos, lançar projetos.
VÊNUS Rx (~40 dias, a cada 18 meses): amor e valores em revisão; exs reaparecem; relações são avaliadas. BOM para revisar o que valoriza no amor. EVITAR iniciar relacionamentos e cirurgias estéticas.
MARTE Rx (~10 sem, a cada 2 anos): ação mais lenta/bloqueada, energia para dentro. BOM para revisar projetos e reestruturar estratégias. EVITAR grandes iniciativas e cirurgias eletivas.
JÚPITER Rx (~4 meses/ano): crescimento para dentro; oportunidades externas diminuem, crescimento interno aumenta. BOM para revisão de filosofia de vida e aprendizado interno.
SATURNO Rx (~5 meses/ano): revisão de estruturas e responsabilidades; karma de longo prazo à superfície. BOM para revisar o que se está construindo.`;

// ── CONSTANTE 10 — PREVISÃO POR ÁREA + INTENSIDADE (integral) ───────────────────
const PREVISAO_POR_AREA = `
MAPEAMENTO DE CADA ÁREA (quais pontos analisar):
AMOR/RELACIONAMENTOS: trânsitos sobre Vênus natal, Casa 7, Casa 5.
CARREIRA: trânsitos sobre MC, Casa 10, Sol natal.
SAÚDE: trânsitos sobre Casa 6, Casa 1, ASC natal.
FAMÍLIA: trânsitos sobre Casa 4, Lua natal.
FINANÇAS: trânsitos sobre Casa 2, Casa 8, Júpiter natal, Vênus natal.
ESPIRITUALIDADE: trânsitos sobre Casa 9, Casa 12, Netuno natal.

INTENSIDADE:
3+ trânsitos significativos no mesmo período → mês de máxima intensidade, múltiplas áreas
ativadas, pede atenção e consciência ampliada.
Poucos trânsitos significativos → período de processamento/integração, menos eventos
externos, mais trabalho interno, bom para planejamento e recuperação.`;

// ── CONSTANTE 11 — ESTRUTURA DO RELATÓRIO (12 seções) ──────────────────────────
const ESTRUTURA_RELATORIO = `
1. CARTA INICIAL (300p) — o que é esta análise.
2. PANORAMA GERAL DOS 18 MESES (500p) — tema central do período.
3. OS TRÂNSITOS MAIS IMPORTANTES (600p) — os 4-6 mais significativos (use os critérios de priorização).
4. PREVISÃO POR ÁREA DE VIDA (800p) — amor, carreira, saúde, família, finanças.
5. MÊS A MÊS (6.000-8.000p) — os 18 meses, cada um com a estrutura mensal completa.
6. PERÍODOS DE MÁXIMA OPORTUNIDADE (400p).
7. PERÍODOS QUE PEDEM CUIDADO (400p).
8. RETRÓGRADOS DO PERÍODO (400p).
9. TIMING PARA DECISÕES IMPORTANTES (400p) — janelas ideais.
10. PRÁTICAS PARA CADA FASE (400p).
11. MENSAGEM FINAL (200p).
12. CHAMADAS PARA OUTROS PRODUTOS (upsell).
TOTAL: 10.000-14.000 palavras.`;

// ── CONSTANTE 12 — UPSELL INDIVIDUAL (integral) ────────────────────────────────
const UPSELL = `
Encerrar com 2-3 chamadas naturais (combo desativado — sempre indicar produtos INDIVIDUAIS):
REVOLUÇÃO SOLAR: "O Mapa de Previsões analisa seus trânsitos nos próximos 18 meses. A Revolução Solar complementa com a análise do seu ano solar específico — o tema central do ano, o que o ASC da RS revela sobre como você vai se apresentar ao mundo e as áreas mais ativas neste ciclo anual."
MAPA KÁRMICO: "Os trânsitos revelam o QUANDO. O Mapa Kármico revela o POR QUÊ. Se certos temas aparecem repetidamente nas previsões, há provavelmente um padrão mais profundo — o Kármico revela esses ciclos e o caminho de libertação."
MAPA DA SORTE: "Seu Mapa de Previsões mostra quando os melhores períodos financeiros chegam. Para saber como maximizar essas janelas — seu modelo de renda ideal e como estruturar prosperidade — o Mapa da Sorte e Prosperidade oferece o mapa completo."`;

// ═══════════════════════════════════════════════════════════════════════════════
// ENGENHARIA — priorização, intensidade, agrupamento
// (acrescentado: NÃO inventa astrologia; só organiza os trânsitos recebidos)
// ═══════════════════════════════════════════════════════════════════════════════

const PESSOAIS = ["Sol","Lua","Mercúrio","Vênus","Marte"];
const ANGULOS = ["ASC","MC","DESC","IC","Ascendente","Meio do Céu"];
const LENTOS = ["Júpiter","Saturno","Urano","Netuno","Plutão"];

function classificarAspecto(aspecto) {
  const m = {
    "conjunção": "fusão intensa — máxima ativação",
    "trígono": "fluxo fácil — oportunidade",
    "sextil": "oportunidade que precisa de ação",
    "quadratura": "tensão — desafio que cresce",
    "oposição": "polarização — equilíbrio necessário"
  };
  return m[aspecto] || aspecto;
}

// Pontua cada trânsito pelos 6 critérios e devolve só os significativos, ordenados
function priorizarTransitos(transitos, idade) {
  transitos = transitos || [];
  const pont = transitos.map(function(t) {
    const tr = t.transitando || t.planeta1;
    const alvo = t.alvoNatal || t.planeta2;
    const asp = (t.aspecto || "").toLowerCase();
    let score = 0; const motivos = [];
    if (LENTOS.indexOf(tr) > -1 && PESSOAIS.indexOf(alvo) > -1) { score += 3; motivos.push("C1: lento sobre pessoal"); }
    if (LENTOS.indexOf(tr) > -1 && ANGULOS.indexOf(alvo) > -1) { score += 3; motivos.push("C2: lento sobre ângulo"); }
    if ((tr === "Júpiter" || tr === "Saturno") && t.ingressoCasa) { score += 3; motivos.push("C3: ingresso em casa"); }
    if (asp === "conjunção") score += 2;
    if (asp === "oposição" || asp === "quadratura") score += 1;
    if (typeof t.orbe === "number" && t.orbe <= 1) score += 1;
    if (idade && (Math.abs(idade-29)<=1 || Math.abs(idade-44)<=1) && tr==="Saturno") { score += 2; motivos.push("C5: retorno/oposição de Saturno"); }
    if (idade && (idade%12===0) && tr==="Júpiter") { score += 1; motivos.push("C6: retorno de Júpiter"); }
    return Object.assign({}, t, { transitando: tr, alvoNatal: alvo, score: score, motivos: motivos });
  });
  return pont.filter(function(t){ return t.score >= 3; }).sort(function(a,b){ return b.score - a.score; });
}

// Detecta meses com 3+ trânsitos significativos (período de intensidade — Critério 4)
function detectarIntensidade(transitosPriorizados) {
  transitosPriorizados = transitosPriorizados || [];
  const porMes = {};
  transitosPriorizados.forEach(function(t){ const m = t.mes || t.periodo || "s/data"; (porMes[m] = porMes[m] || []).push(t); });
  return Object.keys(porMes).map(function(mes){
    const qtd = porMes[mes].length;
    return { mes: mes, qtd: qtd, intensidade: qtd >= 3 ? "máxima" : qtd === 2 ? "moderada" : "leve" };
  }).sort(function(a,b){ return b.qtd - a.qtd; });
}

function agruparPorMes(transitos) {
  transitos = transitos || [];
  const porMes = {};
  transitos.forEach(function(t){ const m = t.mes || t.periodo || "s/data"; (porMes[m] = porMes[m] || []).push(t); });
  return porMes;
}

function calcularIdade(dataNasc, dataInicio) {
  try {
    const n = new Date(dataNasc), i = new Date(dataInicio || Date.now());
    let id = i.getFullYear() - n.getFullYear();
    if (i.getMonth() < n.getMonth() || (i.getMonth()===n.getMonth() && i.getDate()<n.getDate())) id--;
    return id;
  } catch (e) { return null; }
}

function formatarMapaNatal(mapaNatal) {
  mapaNatal = mapaNatal || {};
  const ordem = ["Sol","Lua","ASC","MC","Mercúrio","Vênus","Marte","Júpiter","Saturno","Urano","Netuno","Plutão","Nodo Norte"];
  return ordem.map(function(p){
    const v = mapaNatal[p];
    if (!v) return null;
    if (typeof v === "string") return p + ": " + v;
    return p + ": " + v.signo + (v.casa?(" Casa "+v.casa):"") + (v.grau!=null?(" "+v.grau+"°"):"") + (v.retrogrado?" ℞":"");
  }).filter(Boolean).join("\n");
}

function formatarTransitos(porMes) {
  return Object.keys(porMes).map(function(mes){
    return mes + ":\n" + porMes[mes].map(function(t){
      return "  • " + (t.transitando||t.planeta1) + " " + t.aspecto + " " + (t.alvoNatal||t.planeta2) +
        (t.orbe!=null?(" (orbe "+t.orbe+"°)"):"") +
        (t.retrogrado?" [Rx]":"") + (t.ingressoCasa?(" [ingresso Casa "+t.ingressoCasa+"]"):"");
    }).join("\n");
  }).join("\n\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD — monta diagnóstico + prompt + metadados
// dados: { nome, data, hora, cidade, dataInicio, dataFim, contexto? }
// mapaNatal: objeto { Sol:{signo,casa,grau}, ... } (saída do adaptador)
// transitos: [ { mes, transitando, aspecto, alvoNatal, orbe, retrogrado?, ingressoCasa? } ]
// ═══════════════════════════════════════════════════════════════════════════════
function buildPromptMapaPrevisoes(dados, mapaNatal, transitos, opcoes) {
  dados = dados || {}; mapaNatal = mapaNatal || {}; transitos = transitos || []; opcoes = opcoes || {};
  const idade = calcularIdade(dados.data, dados.dataInicio);
  const priorizados = priorizarTransitos(transitos, idade);
  const intensidade = detectarIntensidade(priorizados);
  const porMes = agruparPorMes(transitos);
  const picos = intensidade.filter(function(i){ return i.qtd >= 3; }).map(function(i){ return i.mes; });

  const diagnostico = {
    periodo: (dados.dataInicio || "?") + " a " + (dados.dataFim || "?"),
    idadeNoInicio: idade,
    totalTransitos: transitos.length,
    transitosSignificativos: priorizados.length,
    topTransitos: priorizados.slice(0, 6).map(function(t){ return t.transitando + " " + t.aspecto + " " + t.alvoNatal + " (" + (t.motivos.join("; ")||"relevante") + ")"; }),
    periodosDeIntensidade: picos.length ? picos : ["nenhum mês com 3+ trânsitos — período de integração"]
  };

  const blocoContexto = dados.contexto
    ? "CONTEXTO DO CLIENTE (integrar nas previsões):\n" + dados.contexto
    : "CONTEXTO DO CLIENTE: não fornecido — manter previsões abrangentes pelas áreas de vida.";

  const prompt = "Você é um astrólogo especializado em trânsitos e previsão astrológica, com profundo\n" +
"conhecimento de como os ciclos planetários se manifestam na vida cotidiana. Sua análise é\n" +
"premonitória mas NUNCA catastrófica: revela tendências, não certezas, e cada previsão traz\n" +
"recomendação prática de ação.\n\n" +
FUNDAMENTOS_PREVISOES + "\n\n" +
COMO_LER_TRANSITOS + "\n\nCRITÉRIOS DE PRIORIZAÇÃO\n" +
CRITERIOS_PRIORIZACAO + "\n\nLINGUAGEM\n" +
LINGUAGEM_PREMONITORIA + "\n\nTABELAS DE INTERPRETAÇÃO (use integralmente; para combinações não tabeladas, interprete pelo método dos três eixos)\n" +
JUPITER_TRANSITO + "\n" + SATURNO_TRANSITO + "\n" + LENTOS_E_MARTE_TRANSITO + "\n\nRETRÓGRADOS\n" +
RETROGRADOS + "\n\nPREVISÃO POR ÁREA E INTENSIDADE\n" +
PREVISAO_POR_AREA + "\n\nESTRUTURA DA NARRATIVA MENSAL\n" +
ESTRUTURA_MENSAL + "\n\n" +
"═══════════════════════════════════\n" +
"DADOS DO MAPA NATAL — " + (dados.nome || "cliente") + "\n" +
"Nascimento: " + (dados.data || "?") + " " + (dados.hora || "") + " — " + (dados.cidade || "?") + "\n" +
formatarMapaNatal(mapaNatal) + "\n\n" +
"PERÍODO ANALISADO: " + (dados.dataInicio || "?") + " a " + (dados.dataFim || "?") + (idade!=null?(" (idade no início: " + idade + ")"):"") + "\n\n" +
"TRÂNSITOS DO PERÍODO (mês a mês):\n" +
(formatarTransitos(porMes) || "(trânsitos não fornecidos — solicitar ao motor)") + "\n\n" +
"TRÂNSITOS JÁ PRIORIZADOS PELO SISTEMA (destaque estes na seção 3):\n" +
(diagnostico.topTransitos.map(function(t){ return "• " + t; }).join("\n") || "• (calcular a partir da lista acima)") + "\n\n" +
"PERÍODOS DE MÁXIMA INTENSIDADE (3+ trânsitos): " + diagnostico.periodosDeIntensidade.join(", ") + "\n\n" +
blocoContexto + "\n\n" +
"═══════════════════════════════════\n" +
"ESTRUTURA OBRIGATÓRIA DO RELATÓRIO\n" +
ESTRUTURA_RELATORIO + "\n\nUPSELL\n" +
UPSELL + "\n\n" +
"═══════════════════════════════════\n" +
"REGRAS FINAIS\n" +
"- \"existe tendência a...\", \"seu mapa indica...\" — nunca afirmações absolutas.\n" +
"- Cada mês tem ação concreta recomendada.\n" +
"- NÃO liste todos os trânsitos — apenas os significativos (use a priorização acima).\n" +
"- Cubra os 18 meses individualmente na seção 5.\n" +
"- Integre o contexto do cliente quando fornecido.\n" +
"- Tom: astrólogo experiente que orienta com sabedoria.\n" +
"- Mínimo 10.000 palavras.\n\n" +
"FORMATO DE SAÍDA — responda SOMENTE com JSON válido, sem texto fora dele:\n" +
'{\n  "secoes": [\n' +
'    { "id": 1, "titulo": "Carta Inicial", "conteudo": "..." },\n' +
'    { "id": 2, "titulo": "Panorama Geral dos 18 Meses", "conteudo": "..." },\n' +
'    { "id": 3, "titulo": "Os Trânsitos Mais Importantes", "conteudo": "..." },\n' +
'    { "id": 4, "titulo": "Previsão por Área de Vida", "conteudo": "..." },\n' +
'    { "id": 5, "titulo": "Mês a Mês", "conteudo": "..." },\n' +
'    { "id": 6, "titulo": "Períodos de Máxima Oportunidade", "conteudo": "..." },\n' +
'    { "id": 7, "titulo": "Períodos que Pedem Cuidado", "conteudo": "..." },\n' +
'    { "id": 8, "titulo": "Retrógrados do Período", "conteudo": "..." },\n' +
'    { "id": 9, "titulo": "Timing para Decisões", "conteudo": "..." },\n' +
'    { "id": 10, "titulo": "Práticas para Cada Fase", "conteudo": "..." },\n' +
'    { "id": 11, "titulo": "Mensagem Final", "conteudo": "..." },\n' +
'    { "id": 12, "titulo": "Próximos Passos na Astralia", "conteudo": "..." }\n' +
"  ]\n}";

  return { diagnostico: diagnostico, prompt: prompt, metadados: Object.assign({}, METADADOS_MAPA_PREVISOES, { periodo: diagnostico.periodo }) };
}

const METADADOS_MAPA_PREVISOES = {
  produto: "Mapa de Previsões 18 Meses",
  framework: "Trânsitos dos lentos (Júpiter→Plutão) + Marte + retrógrados sobre o mapa natal, priorizados por 6 critérios, narrados mês a mês",
  modeloRecomendado: "claude-opus-4-7",
  palavrasEsperadas: "10.000-14.000",
  formatoSaida: "JSON { secoes:[12] }",
  recebeTransitos: true,
  versao: "3.0"
};

module.exports = {
  buildPromptMapaPrevisoes: buildPromptMapaPrevisoes,
  priorizarTransitos: priorizarTransitos,
  detectarIntensidade: detectarIntensidade,
  agruparPorMes: agruparPorMes,
  classificarAspecto: classificarAspecto,
  calcularIdade: calcularIdade,
  METADADOS_MAPA_PREVISOES: METADADOS_MAPA_PREVISOES
};
