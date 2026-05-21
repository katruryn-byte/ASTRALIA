// ═══════════════════════════════════════════════════════════════════════════════
// 🌑 PROMPT — MAPA DA LILITH (PREMIUM) — Astralia
// ═══════════════════════════════════════════════════════════════════════════════
// Produto Premium — Poder reprimido, autenticidade radical e libertação
// Modelo recomendado: claude-opus-4-7 (Opus — profundidade psicológica + síntese)
// Comprimento alvo: 9.000-13.000 palavras
// Tom: Empoderador, radical, compassivo — NUNCA moralista
// Palavra-chave: SEU PODER NÃO PRECISA DE PERMISSÃO
// ═══════════════════════════════════════════════════════════════════════════════
// Compila INTEGRALMENTE o "Guia — Mapa da Lilith (Diretrizes Completas)".
// Usa Lilith Negra (Lilith Média) como indicador principal.
// Detecta aspectos de Lilith com planetas pessoais e se relacionamentos são o campo.
// Saída em JSON estruturado por seções (renderização de PDF é camada separada).
// ═══════════════════════════════════════════════════════════════════════════════

const SIGNOS_ORDEM = ["Áries","Touro","Gêmeos","Câncer","Leão","Virgem","Libra","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];
const REGENTE_SIGNO = {
  "Áries":"Marte","Touro":"Vênus","Gêmeos":"Mercúrio","Câncer":"Lua","Leão":"Sol",
  "Virgem":"Mercúrio","Libra":"Vênus","Escorpião":"Marte","Sagitário":"Júpiter",
  "Capricórnio":"Saturno","Aquário":"Saturno","Peixes":"Júpiter"
};

// -------------------------------------------------------------------------------
// FUNÇÕES DE CÁLCULO E DETECÇÃO
// -------------------------------------------------------------------------------

function ocupantesCasa(mapaNatal, casa){
  return Object.entries(mapaNatal)
    .filter(([k,v]) => v && typeof v==='object' && v.casa===casa && SIGNOS_ORDEM.includes(v.signo))
    .map(([k])=>k);
}

// Encontra todos os aspectos de Lilith com outros pontos (a partir da lista recebida)
function detectarAspectosLilith(aspectos){
  return aspectos
    .filter(a => a.planeta1==="Lilith" || a.planeta2==="Lilith")
    .map(a => {
      const outro = a.planeta1==="Lilith" ? a.planeta2 : a.planeta1;
      return { com: outro, aspecto: (a.aspecto||'').toLowerCase(), orbe: a.orbe ?? null };
    });
}

function analisarLilith(mapaNatal, aspectos=[]){
  const lilith = mapaNatal["Lilith"] || mapaNatal["Lilith Negra"] || null;
  const aspectosLilith = detectarAspectosLilith(aspectos);

  // Relacionamentos são o campo principal? (Lilith em Casa 7 ou aspecto com Vênus)
  const relacionamentosCampo = (lilith && lilith.casa===7) ||
    aspectosLilith.some(a => a.com==="Vênus");

  // Repressão tem raiz kármica/transgeracional? (Lilith com Saturno ou Nodos)
  const raizKarmica = aspectosLilith.some(a => ["Saturno","Nodo Sul","Nodo Norte"].includes(a.com));

  // Carreira é o campo? (Lilith em Casa 10)
  const carreiraCampo = lilith && lilith.casa===10;

  // Origem familiar da repressão (Casa IV)
  const casaIV = { cuspide: mapaNatal.cuspideCasa4||null, ocupantes: ocupantesCasa(mapaNatal,4) };

  return {
    lilith: lilith ? `${lilith.signo} Casa ${lilith.casa ?? '?'} ${lilith.grau ?? ''}°` : "(Lilith não fornecida)",
    lilithSigno: lilith ? lilith.signo : null,
    lilithCasa: lilith ? lilith.casa : null,
    aspectosLilith,
    relacionamentosCampo,
    carreiraCampo,
    raizKarmica,
    casaIV
  };
}

// -------------------------------------------------------------------------------
// CONSTANTE 1 — FUNDAMENTOS DE LILITH
// -------------------------------------------------------------------------------

const FUNDAMENTOS_LILITH = `
═══════════════════════════════════════════════════════════════════════════════
MAPA DA LILITH — FUNDAMENTOS
═══════════════════════════════════════════════════════════════════════════════
Na tradição hebraica pré-bíblica, Lilith foi a primeira mulher de Adão — criada da
mesma terra (igual a ele, não da costela). Quando Adão quis dominá-la, ela se recusou,
pronunciou o nome sagrado de Deus e foi expulsa do paraíso. Ela escolheu o exílio à
submissão. Símbolo de tudo que Lilith representa: o que se recusou a se curvar, o que
foi silenciado por não obedecer, o que foi chamado de "perigoso" por ser autêntico.

AS TRÊS LILITHS: Lilith Negra (Média — ponto matemático, a mais usada → exílio/reprimido/
poder banido); Lilith Verdadeira (apogeu lunar real, mais variável); Asteroide Lilith 1181
(corpo físico — o poder encarnado). ESTE MAPA usa a LILITH NEGRA como indicador principal.

O QUE LILITH REVELA: não é o que você não tem — é o que você TEM e foi ensinada a esconder.
Mostra onde o poder foi silenciado (casa = área), como (signo = estilo da repressão), como
emerge não-integrada (sombra), como emerge integrada (dom), e o tipo de autenticidade que a
alma pede. Alta expressão: poder selvagem, autêntico, criativo. Baixa: poder distorcido,
autodestrutivo ou suprimido.

LILITH E O FEMININO: mitologicamente feminina, mas o princípio não é de gênero. Todos têm
Lilith. Em mulheres, costuma corresponder a padrões patriarcais de repressão; em homens, a
partes da masculinidade proibidas pela cultura; em todos, ao lugar onde a autenticidade foi
considerada perigosa.

TOM: empoderador, radical, compassivo — NUNCA moralista. Lilith não é "problema" a consertar:
é poder não integrado a reconhecer. Cada sombra tem um dom equivalente.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 2 — LILITH POR SIGNO (o que foi reprimido, sombra, dom, práticas)
// -------------------------------------------------------------------------------

const LILITH_POR_SIGNO = {
  "Áries": "REPRIMIDO: coragem, raiva, iniciativa, o direito de existir em primeiro lugar. Ensinaram que sua vontade é agressiva, iniciativa é arrogância, ser a primeira é egoísmo. HOJE: dificuldade de iniciar sozinha; raiva reprimida que explode desproporcional; ceder sempre ao outro; sabotar os próprios projetos antes do julgamento externo. SOMBRA (não-integrada): explosões 'fora do personagem', autodestruição impulsiva, rebeliões que não levam a lugar nenhum. INTEGRADA: age com coragem sem pedir desculpas, lidera sem permissão; raiva é informação, não explosão. PRÁTICAS: uma decisão por dia totalmente sozinha; expressar raiva de forma segura e direcionada; começar um projeto e não pedir aprovação antes de terminar.",
  "Touro": "REPRIMIDO: prazer, corpo, sexualidade, direito ao conforto. Ensinaram que querer conforto é fraqueza, prazer é pecado, o corpo é vergonha ou serviço a outros. HOJE: receber prazer com culpa; relação complicada com corpo/alimentação; dinheiro como vergonha ou nunca suficiente; autoprivação habitual. SOMBRA: excessos sensoriais compulsivos (comida, compras, bebida); teimosia como controle; possessividade disfarçada de amor. INTEGRADA: desfruta sem culpa; o corpo é sagrado; conforto e prazer são direitos, não recompensas. PRÁTICAS: rituais de cuidado corporal consciente; permissão deliberada ao prazer simples; revisar a relação com dinheiro como expressão de valor.",
  "Gêmeos": "REPRIMIDO: voz, mente, direito de pensar diferente e dizer. Ensinaram que sua inteligência é ameaçadora, sua fala é demais, questionar é desrespeito, curiosidade é inconveniente. HOJE: opiniões só com disclaimers; comunicação em extremos (excessiva ou ausente); inteligência escondida para não ameaçar; ansiedade ao falar em público. SOMBRA: fofoca/manipulação verbal; contradições para testar limites; mentiras pequenas como autoproteção. INTEGRADA: fala o que pensa com clareza e sem desculpas; inteligência não precisa ser diminuída para o conforto alheio. PRÁTICAS: escrever sem censura; expressar opinião onde normalmente ficaria quieta; assumir autoria das próprias ideias.",
  "Câncer": "REPRIMIDO: necessidades emocionais, direito de receber cuidado, vulnerabilidade. Ensinaram a cuidar de todos mas nunca pedir; que mostrar necessidade é fraqueza, chorar é manipulação. HOJE: cuidado compulsivo para nunca precisar; incapacidade de pedir ajuda; apego que sufoca; choro reprimido que aparece em momentos inesperados. SOMBRA: manipulação emocional indireta; dependência disfarçada de cuidado; oscilações de humor inexplicáveis. INTEGRADA: pede o que precisa sem vergonha; vulnerabilidade é coragem. PRÁTICAS: pedir ajuda concreta esta semana; chorar sem se desculpar; dizer 'eu preciso de...' a alguém de confiança.",
  "Leão": "REPRIMIDO: brilho, grandeza, direito de ser vista e reconhecida. Ensinaram que destacar-se é arrogância, querer reconhecimento é vaidade, brilhar tira o brilho dos outros. HOJE: minimizar conquistas; dificuldade de aceitar elogios; sabotar o sucesso por medo da visibilidade; ressentir quem brilha sem culpa. SOMBRA: drama para chamar atenção indiretamente; inveja travestida de crítica; arrogância compensatória. INTEGRADA: brilha sem pedir desculpas; reconhecimento é oxigênio para a alma. PRÁTICAS: assumir crédito sem minimizar; aparecer publicamente onde normalmente evitaria; receber elogio com 'obrigada' sem disclaimers.",
  "Virgem": "REPRIMIDO: discernimento, o 'não', direito a padrões e limites. Ensinaram a servir sem reclamar, nunca dizer que algo não está bom, nunca impor critérios. HOJE: servilidade compulsiva; crítica interna intensa (o que não diz aos outros, diz a si); dificuldade de dizer não sem culpa; corpo como campo de batalha da autocrítica. SOMBRA: crítica destrutiva quando estoura; hipocondria; sabotagem passiva. INTEGRADA: tem padrões e os honra; discernimento é dom; o 'não' protege a integridade. PRÁTICAS: dizer 'não' a um pedido; expressar uma crítica construtiva guardada; tratar o corpo como sagrado.",
  "Libra": "REPRIMIDO: necessidades em relacionamentos, direito de discordar, o 'não' no amor. Ensinaram que amor é ceder, harmonia é concordar, ter necessidades é egoísmo. HOJE: perda de identidade nas relações; concordância sem convicção; incapacidade de discordar do parceiro; harmonia performática que esconde ressentimento. SOMBRA: passivo-agressividade; saída repentina sem explicação; relações paralelas para ter o que não pede na principal. INTEGRADA: ama e tem limites; relaciona-se e permanece si mesma; o 'não' no amor purifica. PRÁTICAS: expressar uma discordância genuína; identificar o que VOCÊ quer; negociar em vez de ceder automaticamente.",
  "Escorpião": "REPRIMIDO: sexualidade, intensidade, poder de transformação, percepção aguda. Ensinaram que sua profundidade assusta, sua sexualidade é vergonhosa, ver o oculto é perigoso. HOJE: sexualidade reprimida que emerge indireta; intensidade que escapa do controle; percepção minimizada para não parecer 'exagerada'; poder real escondido atrás de aparente fraqueza. SOMBRA: obsessão; manipulação como poder indireto; destrutividade quando explode. INTEGRADA: é intensa sem se desculpar; o poder de transformação é dom; a sexualidade é sagrada. PRÁTICAS: dizer o que vê sem suavizar; explorar a sexualidade com consciência; permitir-se transformar algo em vez de só observar.",
  "Sagitário": "REPRIMIDO: fé própria, convicções, direito a uma filosofia diferente. Ensinaram que questionar as crenças familiares é traição, opiniões divergentes é desrespeito, sua expansão é ameaça. HOJE: crenças alheias adotadas sem questionar; dificuldade de defender convicções; expansão bloqueada por lealdade ao grupo; sarcasmo no lugar de seriedade filosófica. SOMBRA: fanatismo como reação ao controle; fuga pela filosofia sem comprometimento; julgar quem 'não questiona'. INTEGRADA: tem filosofia própria e a defende; sua fé não precisa da aprovação da família. PRÁTICAS: defender uma crença numa conversa difícil; explorar algo fora da zona cultural; escrever o que realmente acredita sem filtro.",
  "Capricórnio": "REPRIMIDO: ambição, poder institucional, direito de ser levada a sério. Ensinaram que pessoas como você não chegam lá, ambição feminina é agressividade, querer poder é arrogância. HOJE: ambição escondida ou negada; dificuldade de assumir liderança; sabotagem no momento de maior visibilidade; perfeccionismo como armadura. SOMBRA: usar outros como instrumentos; rigidez como controle compensatório; autoridade que humilha. INTEGRADA: é ambiciosa sem se desculpar; o poder não precisa se disfarçar de serviço. PRÁTICAS: assumir uma liderança evitada; falar abertamente dos objetivos profissionais; aceitar reconhecimento sem diminuir.",
  "Aquário": "REPRIMIDO: originalidade radical, rebeldia, direito de ser completamente diferente. Ensinaram que ser diferente é estar errada, questionar regras é ingratidão, sua visão de futuro é utopia. HOJE: originalidade escondida para pertencer; ideias revolucionárias guardadas por medo; conformidade performática; rebeldia sem causa. SOMBRA: rebeldia destrutiva sem direção; afastamento de todos para nunca ser controlada; cinismo como defesa. INTEGRADA: é genuinamente original — isso é contribuição, não desvio; sua visão de futuro não precisa de validação do presente. PRÁTICAS: compartilhar uma ideia radical publicamente; expressar-se de forma original sem filtro social; criar algo novo sem aprovação prévia.",
  "Peixes": "REPRIMIDO: intuição, misticidade, acesso ao invisível, sensibilidade espiritual. Ensinaram que intuição não é real, espiritualidade é fraqueza, sentir demais é doença. HOJE: intuição ignorada sistematicamente; espiritualidade vivida em segredo ou com vergonha; sensibilidade medicada/anestesiada; criatividade espiritual bloqueada. SOMBRA: escapismo espiritual; manipulação via 'insights'/'mensagens'; dependência de substâncias como acesso ao invisível sem o trabalho real. INTEGRADA: a intuição é real e confiável; a sensibilidade é dom; a espiritualidade é sua e não precisa de validação. PRÁTICAS: confiar numa intuição e agir; criar algo espiritual sem pedir permissão; meditar/orar do jeito que faz sentido para você."
};

// -------------------------------------------------------------------------------
// CONSTANTE 3 — LILITH POR CASA (onde o poder foi silenciado)
// -------------------------------------------------------------------------------

const LILITH_POR_CASA = {
  1: "O poder de SER VOCÊ foi silenciado — presença, identidade, direito de ocupar espaço. Integração: você existe; sua presença não precisa de justificativa.",
  2: "O poder de TER e VALORIZAR a si mesma foi silenciado — valor pessoal, recursos, autoestima material. Integração: você merece; seus recursos expressam seu valor real.",
  3: "O poder da sua VOZ foi silenciado — inteligência, comunicação, direito de ser ouvida. Integração: sua voz tem valor; suas palavras mudam coisas.",
  4: "O poder da sua ORIGEM foi silenciado — família, passado, padrões ancestrais. Integração: você pode honrar a origem E quebrar o que não serve.",
  5: "O poder de CRIAR e SE EXPRESSAR foi silenciado — criatividade, prazer, amor, expressão individual. Integração: você cria porque existe; seu prazer não precisa de mérito.",
  6: "O poder de DIZER NÃO ao serviço compulsivo foi silenciado — corpo, saúde, limites no trabalho. Integração: você serve por escolha, não por obrigação; seu corpo é sagrado.",
  7: "O poder de ter NECESSIDADES nos relacionamentos foi silenciado — parcerias igualitárias, o 'não' no amor. Integração: você se relaciona e permanece inteira; amor não exige dissolução.",
  8: "O poder de TRANSFORMAR e de ter INTIMIDADE PROFUNDA foi silenciado — sexualidade, recursos compartilhados, morte e renascimento. Integração: sua profundidade não é perigosa, é transformação necessária.",
  9: "O poder de ter CONVICÇÕES PRÓPRIAS foi silenciado — filosofia, crenças, expandir além do grupo. Integração: sua fé é sua; sua expansão não precisa de aprovação.",
  10: "O poder de AUTORIDADE PÚBLICA foi silenciado — ambição, lugar no mundo, reconhecimento profissional. Integração: sua autoridade é legítima; seu nome pode ser grande.",
  11: "O poder de PERTENCER SENDO DIFERENTE foi silenciado — originalidade dentro do grupo, lugar em comunidades. Integração: você pertence E é diferente; não são excludentes.",
  12: "O poder de ESPIRITUALIDADE E INTUIÇÃO foi silenciado — acesso ao invisível, inconsciente, misticidade. Integração: o que está no escuro em você não é inimigo, é seu maior poder latente."
};

// -------------------------------------------------------------------------------
// CONSTANTE 4 — ASPECTOS DE LILITH COM PLANETAS PESSOAIS
// -------------------------------------------------------------------------------

const ASPECTOS_LILITH = `
## ASPECTOS DE LILITH

CONJUNÇÃO SOL: identidade e poder reprimido fundidos. Você é intensamente marcada por Lilith — alguém muito reprimida OU que naturalmente encarna autenticidade radical. Desafio: separar poder real de rebeldia compensatória. Dom: liderança autêntica que inspira outros a serem quem são.
CONJUNÇÃO LUA: padrão emocional e poder reprimido entrelaçados. A FAMÍLIA foi o campo principal de silenciamento. Padrão: emoções que "não podem ser sentidas" + poder que "não pode ser exercido". Dom: cura emocional profunda que ajuda outros.
CONJUNÇÃO VÊNUS: amor e poder reprimido colidem. Os RELACIONAMENTOS são o campo onde Lilith mais se manifesta. Padrão: sedução intensa + repressão intensa nas relações. Dom: amor que liberta em vez de prender.
CONJUNÇÃO MARTE: ação e poder reprimido se fundem. Você age com intensidade quando Lilith é ativada — às vezes de forma explosiva. Padrão: raiva reprimida + explosões que você mesma não entende. Dom: ação corajosa e transformadora.
CONJUNÇÃO SATURNO: a AUTORIDADE foi o agente principal de repressão. Frequentemente indica pai, figura de autoridade ou sistema que silenciou. Padrão: medo de poder por associação com punição. Dom: estrutura que liberta em vez de aprisionar.
CONJUNÇÃO PLUTÃO: poder reprimido e poder transformador se fundem. Um dos aspectos mais intensos — potencial de transformação radical OU de destrutividade quando não integrado. Dom: capacidade de transformar realidades profundamente.

QUADRATURA SOL: tensão entre quem você é publicamente e seu poder autêntico. Você performa uma versão diminuída de si para ser aceita. Trabalho: descobrir quem você é quando não precisa agradar.
QUADRATURA LUA: tensão entre necessidades emocionais e poder autêntico. Você suprime poder para manter segurança emocional. Trabalho: descobrir que pode ser poderosa E se sentir segura.
TRÍGONO SOL: fluxo entre identidade e poder autêntico. Acesso mais fácil à integração; o poder se expressa de forma mais natural e menos traumatizada.
SEXTIL SOL: oportunidade de integração entre identidade e poder. Flui quando você AGE — o sextil não se ativa sozinho.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 5 — LILITH NOS RELACIONAMENTOS (4 padrões + integração)
// -------------------------------------------------------------------------------

const LILITH_RELACIONAMENTOS = `
## LILITH NOS RELACIONAMENTOS — 4 PADRÕES
1 REPRESSÃO TOTAL: você desaparece no relacionamento; suas necessidades não existem; concorda, cede, serve — e ama quem a diminui, porque é familiar.
2 EXPLOSÃO: reprime por muito tempo e então explode; ciclos de submissão + explosão; ama intensamente e depois corta completamente.
3 LILITH COMO PARCEIRO: atrai pessoas que encarnam Lilith (intensas, poderosas, "perigosas") — busca no outro o que foi reprimido em você.
4 LILITH COMO ESTRATÉGIA: usa sedução, mistério ou intensidade como poder no amor — poder indireto, porque o direto foi bloqueado.

INTEGRAÇÃO: você se relaciona com poder genuíno — intensamente você mesma E amorosa; tem limites E acolhimento; escolhe quem fica, não precisa de quem fica.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 6 — JORNADA DE INTEGRAÇÃO (5 fases) + OBSTÁCULOS (4)
// -------------------------------------------------------------------------------

const FASES_INTEGRACAO = `
## AS 5 FASES DA INTEGRAÇÃO DE LILITH
1 INCONSCIÊNCIA: você não sabe que Lilith existe em você; sofre os padrões sem entender de onde vêm.
2 RECONHECIMENTO: começa a ver o padrão ("eu sempre faço isso, eu sempre aceito isso"); pode vir com raiva, dor ou alívio.
3 EXÍLIO CONSCIENTE: sabe, mas ainda não sabe como mudar; é quando terapia, mapa e práticas são mais importantes.
4 INTEGRAÇÃO ATIVA: começa a fazer escolhas diferentes; o desconforto diminui; o poder autêntico emerge.
5 INCORPORAÇÃO: Lilith não é mais "o que foi reprimido" — é simplesmente quem você é; você nem pensa mais nela, porque é sua expressão natural.

## OBSTÁCULOS NA INTEGRAÇÃO
1 MEDO DE SER REJEITADA ("se eu for quem sou, serei abandonada"): a rejeição de quem exige sua diminuição é libertação.
2 IDENTIFICAÇÃO COM A REPRESSÃO ("mas eu não sou assim, sou mais calma/submissa"): esse "jeito de ser" foi aprendido, não é inato.
3 CONFUSÃO ENTRE PODER E VIOLÊNCIA ("se eu for poderosa, vou machucar"): poder autêntico ≠ poder destrutivo.
4 SABOTAGEM NO MOMENTO DE BRILHAR: chega perto da expressão plena e recua; reconhecer o padrão e interrompê-lo conscientemente.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 7 — ESTRUTURA DO RELATÓRIO (15 seções) + UPSELL
// -------------------------------------------------------------------------------

const ESTRUTURA_LILITH = `
## ESTRUTURA DO RELATÓRIO (15 seções)
1. Carta ao cliente — honra a coragem de olhar para este material (~300)
2. Quem Lilith é (para ESTE cliente, baseado nos indicadores — não genérico) (~400)
3. O que foi reprimido em você (signo + casa + aspectos) (~700)
4. Como a repressão aconteceu (origem: família, cultura, relações; o mecanismo) (~500)
5. Como Lilith aparece hoje — a sombra (sem julgamento, com compreensão) (~500)
6. Lilith nos relacionamentos (~500)
7. Lilith no trabalho e carreira (~400)
8. Lilith e seu corpo (como a repressão se manifesta fisicamente) (~350)
9. A integração — Lilith como dom (a versão de você que emerge quando honrada) (~600)
10. Aspectos de Lilith — análise detalhada (como conversa com outros planetas) (~500)
11. As 5 fases da sua integração (onde você está agora e o que vem) (~400)
12. Práticas de integração (7-10 específicas para este signo/casa) (~500)
13. Afirmações de poder (10 personalizadas ao Lilith deste cliente) (~200)
14. Mensagem final (honra, não conserta) (~300)
15. Próximos passos Astralia (upsell individual)

## TOM E REGRAS
Use o nome do cliente. Tom empoderador, não vitimizante. NUNCA moralista — Lilith não é "problema" a consertar, é poder não integrado a reconhecer. Cada padrão de sombra tem um equivalente de dom. Práticas específicas para o signo/casa deste cliente. Linguagem forte, clara, corajosa. Sem vitimização, sem julgamento — clareza corajosa e compaixão real.

## UPSELL (individual — NÃO combo; oferecer 1-2 no gancho que o mapa revelar)
- Mapa Kármico: quando Lilith conecta com Saturno ou Nodo Sul (repressão com raiz kármica/transgeracional).
- Mapa Astral Personalizado: cliente novo ou Lilith conectando muitos planetas pessoais (quadro completo de quem é).
- Sinastria: Lilith em Casa 7 ou forte aspecto com Vênus (relacionamentos são o campo; dinâmica com pessoa específica).
- Revolução Solar: cliente em processo ativo de mudança (o que ESTE ano oferece à jornada de integração).
`;

// -------------------------------------------------------------------------------
// FUNÇÃO BUILD
// -------------------------------------------------------------------------------
// dados: { nome, dataNascimento, horaNascimento, localNascimento, contexto? }
// mapaNatal: { Sol, Lua, Saturno, Plutão, Vênus, Marte, "Nodo Norte",
//   Lilith:{signo,casa,grau}, cuspideCasa4, ... }
// aspectos: [{ planeta1, aspecto, planeta2, orbe }] — incluir os de Lilith

function buildPromptMapaLilith(dados, mapaNatal, aspectos = []) {
  const nome = dados.nome || '[NOME]';
  const a = analisarLilith(mapaNatal, aspectos);

  const suporte = ["Sol","Lua","Saturno","Plutão","Vênus","Marte","Nodo Norte"]
    .map(p => mapaNatal[p] ? `  - ${p}: ${mapaNatal[p].signo} Casa ${mapaNatal[p].casa ?? '?'}` : null)
    .filter(Boolean).join("\n");

  const aspLilithTxt = a.aspectosLilith.length
    ? a.aspectosLilith.map(x=>`  - Lilith ${x.aspecto} ${x.com} (orbe ${x.orbe ?? '?'}°)`).join("\n")
    : "  (nenhum aspecto de Lilith fornecido)";

  // Gatilhos de upsell calculados (apoio à seção 15)
  const upsellGatilhos = [];
  if (a.raizKarmica) upsellGatilhos.push("Kármico (Lilith toca Saturno/Nodos → raiz kármica)");
  if (a.relacionamentosCampo) upsellGatilhos.push("Sinastria (Lilith em Casa 7 ou aspecto com Vênus → relações são o campo)");
  if (dados.contexto && /mudan|transi|separ|divórci|divorci|recome/i.test(dados.contexto)) upsellGatilhos.push("Revolução Solar (cliente em mudança ativa)");

  const prompt = `Você é um astrólogo especialista em Lilith Negra, com formação em psicologia do poder, mitologia e astrologia evolutiva. Combina rigor técnico com compreensão profunda de como sistemas de repressão funcionam.
MISSÃO: revelar onde o poder de ${nome} foi silenciado, como isso afeta a vida hoje e o caminho de integração — SEM moralismo, SEM vitimização, SEM julgamento. Clareza corajosa e compaixão real.
Comprimento: 9.000-13.000 palavras.

# DADOS DA CLIENTE
Nome: ${nome} | Nascimento: ${dados.dataNascimento||'[DATA]'}, ${dados.horaNascimento||'[HORA]'}, ${dados.localNascimento||'[LOCAL]'}
${dados.contexto ? `Contexto / padrão que se repete: ${dados.contexto}` : 'Contexto: (não fornecido — o que motivou a compra, qual padrão "automático e prejudicial" se repete)'}

# INDICADOR PRINCIPAL
Lilith Negra: ${a.lilith}

# INDICADORES DE SUPORTE
${suporte || "(não fornecidos)"}
Casa IV (origem familiar da repressão): cúspide ${a.casaIV.cuspide||'?'}, ocupantes ${a.casaIV.ocupantes.join(", ")||"vazia"}

# ASPECTOS DE LILITH (já filtrados)
${aspLilithTxt}

# DIAGNÓSTICO (já calculado — use como base)
- Signo de Lilith (estilo da repressão): ${a.lilithSigno||'?'}
- Casa de Lilith (área silenciada): ${a.lilithCasa||'?'}
- Relacionamentos são o campo principal? ${a.relacionamentosCampo ? "SIM" : "não predominante"}
- Carreira é o campo principal? ${a.carreiraCampo ? "SIM (Lilith em Casa 10)" : "não predominante"}
- Repressão tem raiz kármica/transgeracional? ${a.raizKarmica ? "SIM (Lilith toca Saturno/Nodos)" : "sem sinal automático"}
- Gatilhos de upsell sugeridos: ${upsellGatilhos.length?upsellGatilhos.join("; "):"avaliar pelo conteúdo"}

${FUNDAMENTOS_LILITH}

## LILITH POR SIGNO (use o desta cliente: ${a.lilithSigno||'?'})
${Object.entries(LILITH_POR_SIGNO).map(([s,t])=>`${s}: ${t}`).join("\n\n")}

## LILITH POR CASA (use a desta cliente: Casa ${a.lilithCasa||'?'})
${Object.entries(LILITH_POR_CASA).map(([c,t])=>`Casa ${c}: ${t}`).join("\n")}

${ASPECTOS_LILITH}
${LILITH_RELACIONAMENTOS}
${FASES_INTEGRACAO}
${ESTRUTURA_LILITH}

# FORMATO DE SAÍDA (OBRIGATÓRIO)
Responda EXCLUSIVAMENTE com JSON válido, sem texto antes/depois, sem markdown:
{ "secoes": [ { "numero": 1, "titulo": "Carta ao Cliente", "texto": "..." } ] }
REGRAS: aspas duplas; escape quebras como \\n e aspas internas como \\"; sem blocos de código; "numero" exato (1-15); "texto" em PROSA corrida (segunda pessoa), exceto seções 12 (práticas, 7-10 itens) e 13 (10 afirmações), que podem usar lista dentro do texto com \\n.

# LEMBRETES
1. Use o nome ${nome} ao longo do documento
2. Cite o signo (${a.lilithSigno||'?'}), a casa (${a.lilithCasa||'?'}) e os aspectos reais de Lilith desta cliente
3. Cada sombra deve vir acompanhada do dom equivalente — nunca deixe a pessoa na sombra
4. Tom empoderador e radical, jamais moralista ou vitimizante
5. Práticas (seção 12) específicas ao signo/casa desta Lilith; afirmações (13) personalizadas
6. Seção 4 (origem) deve conectar com a Casa IV e com Saturno, se aspectado
7. Upsell individual ao final (1-2 conforme gatilhos) — sem combo
8. Mínimo 9.000 palavras

Gere agora o Mapa da Lilith completo (seções 1-15). Retorne apenas o JSON.`;

  return {
    diagnostico: { cliente: nome, ...a, upsellGatilhos },
    prompt,
    metadados: {
      framework: "Mapa da Lilith — Lilith Negra por signo+casa + aspectos + relacionamentos + 5 fases de integração",
      modeloRecomendado: "claude-opus-4-7",
      palavrasEsperadas: "9.000-13.000",
      tipo: "premium_assincrono_48h",
      saida: "JSON estruturado por seções (renderização de PDF é camada separada)",
      versao: "1.0"
    }
  };
}

module.exports = {
  buildPromptMapaLilith,
  analisarLilith, detectarAspectosLilith, ocupantesCasa,
  FUNDAMENTOS_LILITH, LILITH_POR_SIGNO, LILITH_POR_CASA,
  ASPECTOS_LILITH, LILITH_RELACIONAMENTOS, FASES_INTEGRACAO, ESTRUTURA_LILITH
};
