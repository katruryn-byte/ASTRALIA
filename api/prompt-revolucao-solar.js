// ═══════════════════════════════════════════════════════════════════════════════
// 🌞 PROMPT — REVOLUÇÃO SOLAR — Astralia
// ═══════════════════════════════════════════════════════════════════════════════
// Produto Premium — Leitura premonitória do ano (do aniversário ao próximo)
// Modelo recomendado: claude-opus-4-7 (Opus — cruza 2 mapas: natal + RS)
// Comprimento alvo: 8.000-12.000 palavras
// Tom: Premonitório, inspirador, honesto, NUNCA catastrófico
// Palavra-chave: AUTO RESPONSABILIDADE e CONSCIÊNCIA
// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTANTE: o cálculo do retorno solar (efeméride) NÃO é feito aqui — a função
// RECEBE o mapa da RS já calculado pela API (freeastrologyapi/Astro.com) e processa
// horário, casa do Sol RS, casas ativadas, classificação e overlay natal×RS.
// Saída em JSON estruturado por seções (renderização de PDF é camada separada).
// ═══════════════════════════════════════════════════════════════════════════════

const SIGNOS_ORDEM = ["Áries","Touro","Gêmeos","Câncer","Leão","Virgem","Libra","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];

// -------------------------------------------------------------------------------
// FUNÇÕES DE PROCESSAMENTO (sobre dados já calculados — sem efemérides)
// -------------------------------------------------------------------------------

function interpretarHorarioRS(hora) {
  // hora: número 0-23 (hora do retorno solar)
  const h = parseInt(hora, 10);
  if (h >= 0 && h <= 5) return { faixa: "madrugada", leitura: "O ano começa em recolhimento interior. Primeiros meses de preparação, não de ação visível. Energia gestante que amadurece antes de emergir. Tendência: trabalho interno antes de resultados externos." };
  if (h >= 6 && h <= 11) return { faixa: "manhã", leitura: "O ano começa com clareza, visibilidade e frescor. Ação tem resultados rápidos. Projetos iniciados cedo têm impulso natural. Tendência: começos, início de novos ciclos." };
  if (h >= 12 && h <= 17) return { faixa: "tarde", leitura: "O ano começa em plenitude — você está no meio de algo. Continuidade, não ruptura. Projetos em andamento ganham força. Tendência: maturação e consolidação." };
  return { faixa: "noite", leitura: "O ano começa em encerramento. Algo se fecha para outro ciclo abrir. Relações, trabalhos ou fases chegam ao fim. Tendência: transição, encerramento honroso, abertura de novo ciclo." };
}

function classificarCasa(num) {
  if ([1,4,7,10].includes(num)) return "angular (ação e eventos externos, visíveis, concretos)";
  if ([2,5,8,11].includes(num)) return "sucedente (recursos e valores — financeiros, emocionais, sociais)";
  return "cadente (processos e aprendizados — comunicação, espiritualidade)";
}

function contarPlanetasPorCasa(planetasRS) {
  const conta = {};
  for (let i = 1; i <= 12; i++) conta[i] = [];
  Object.entries(planetasRS).forEach(([p, d]) => {
    if (d && typeof d === "object" && d.casa) conta[d.casa].push(p);
  });
  return conta;
}

function casasAtivadas(planetasRS) {
  const conta = contarPlanetasPorCasa(planetasRS);
  return Object.entries(conta)
    .filter(([casa, ps]) => ps.length > 0)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([casa, ps]) => `Casa ${casa} [${classificarCasa(+casa)}]: ${ps.join(", ")}`);
}

function gerarOverlay(natal, rs) {
  // Tabela natal × RS para os planetas presentes em ambos
  const linhas = [];
  const planetas = ["Sol","Lua","Mercúrio","Vênus","Marte","Júpiter","Saturno","Urano","Netuno","Plutão","Nodo Norte"];
  planetas.forEach(p => {
    const n = natal[p], r = rs[p];
    if (n || r) {
      const nStr = n ? `${n.signo} ${n.grau ?? ''}° (Casa ${n.casa ?? '?'})` : "—";
      const rStr = r ? `${r.signo} ${r.grau ?? ''}° (Casa ${r.casa ?? '?'})` : "—";
      linhas.push(`  ${p}: natal ${nStr} → RS ${rStr}`);
    }
  });
  return linhas.join("\n");
}

// -------------------------------------------------------------------------------
// CONSTANTE 1 — FUNDAMENTOS + CONFIABILIDADE + ESCOPO
// -------------------------------------------------------------------------------

const FUNDAMENTOS_RS = `
═══════════════════════════════════════════════════════════════════════════════
REVOLUÇÃO SOLAR — FUNDAMENTOS
═══════════════════════════════════════════════════════════════════════════════
A Revolução Solar é o mapa calculado no momento exato em que o Sol retorna à mesma
posição do nascimento — uma vez por ano, próximo ao aniversário. É um "reinício
cósmico pessoal". O Sol fica no mesmo grau/signo natal; tudo mais muda: planetas em
novas posições, Ascendente diferente (depende do LOCAL onde a pessoa estará), casas
completamente novas, aspectos inéditos. Parte de você como ponto fixo e revela como
o universo se reorganiza para este ciclo.

CONFIABILIDADE: um dos métodos preditivos mais precisos da astrologia ocidental —
combina mapa natal (quem você é) com trânsitos do momento (o que acontece). Não é
genérica como horóscopo de signo: é calculada para sua data, hora e local.

PODE REVELAR: tema central do ano; áreas mais ativas (amor, carreira, família,
saúde); períodos de maior intensidade; pontos de virada prováveis; riscos que pedem
atenção; oportunidades; qualidade energética de cada trimestre.
NÃO PODE REVELAR: datas exatas (salvo cruzado com trânsitos); nomes de pessoas;
diagnósticos médicos; o que o livre-arbítrio altera. É mapa de TENDÊNCIAS e
PROBABILIDADES, não de certezas.

O LOCAL importa: ASC e casas mudam conforme onde a pessoa estará no aniversário.
RS em Fortaleza ≠ RS em São Paulo ≠ RS em Lisboa. Documentar sempre o horário exato
do retorno solar — confere credibilidade e personalização.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 2 — INTERPRETAÇÃO DO HORÁRIO DO RETORNO SOLAR
// -------------------------------------------------------------------------------

const HORARIO_RS = `
## O HORÁRIO DA RS CONTA COMO O ANO COMEÇARÁ
Madrugada (00:00-05:59): recolhimento interior; preparação antes da ação; trabalho interno antes de resultados.
Manhã (06:00-11:59): clareza, visibilidade, frescor; ação com resultado rápido; ano de começos.
Tarde (12:00-17:59): plenitude; continuidade, não ruptura; maturação e consolidação; colheita.
Noite (18:00-23:59): encerramento; algo se fecha para outro abrir; transição e novo ciclo.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 3 — ASC DA RS POR SIGNO (a "máscara" / personagem do ano)
// -------------------------------------------------------------------------------

const ASC_RS_POR_SIGNO = {
  "Áries": "Ano pede coragem, iniciativa, ser direta. Energia de chegada ariana: urgente, nova, impaciente. Tendências: inicia mais que termina; confrontos por assertividade; energia física alta; decisões rápidas; liderança natural. Forte tendência a assumir novos papéis de liderança; algo adiado por insegurança é iniciado (se Marte na RS bem posicionado, realiza). Cuidado: precipitação, conflitos por excesso de assertividade.",
  "Touro": "Ano pede estabilidade, construção, paciência. Apresenta-se com calma, solidez, presença física. Tendências: finanças e questões materiais em foco; busca de segurança; resistência a mudanças rápidas; prazer/corpo/beleza/conforto importantes; projetos de longo prazo começam. Forte tendência a temas de dinheiro/imóveis/recursos centrais. Cuidado: resistência excessiva à mudança, materialismo.",
  "Gêmeos": "Ano pede versatilidade, comunicação, abertura ao novo. Mais curiosa, comunicativa, múltipla. Tendências: muitos projetos simultâneos (risco de dispersão); comunicação como ferramenta central; cursos/leituras; viagens curtas frequentes; relações com diálogos decisivos. Forte tendência a comunicação ganhar alcance (escrita/fala/ensino expandem). Cuidado: falta de foco, superficialidade.",
  "Câncer": "Ano pede cuidar, acolher e ser cuidada. Emocionalidade aumenta; vida familiar/doméstica domina. Tendências: casa/família/raízes prioritárias; emoções intensas; possível mudança de residência/reforma; maternidade (literal/simbólica); intuição aguçada. Forte tendência a um ciclo familiar se encerrar/transformar (nascimento, morte, casamento, separação). Cuidado: hipersensibilidade, emoção misturada à decisão.",
  "Leão": "Ano pede brilhar, criar, liderar. Visibilidade aumenta — você é vista, reconhecida, chamada ao destaque. Tendências: reconhecimento público/profissional; criatividade em alta; amor/romance se intensificam; necessidade de ser vista; ego pode inflar. Forte tendência a um dos anos mais visíveis — aceite as oportunidades de exposição. Cuidado: necessidade excessiva de aprovação, dividir holofotes.",
  "Virgem": "Ano pede trabalho, discernimento, ajuste de detalhes. Mais crítica, analítica, atenta ao que refinar. Tendências: saúde/bem-estar em foco; trabalho diário se intensifica; revisão de processos/contratos/rotinas; perfeccionismo (virtude e armadilha); serviço ao próximo central. Forte tendência a revisões importantes no trabalho/saúde. Cuidado: autocrítica excessiva, paralisia por perfeccionismo.",
  "Libra": "Ano pede equilíbrio, relacionamentos, mediação. Mais diplomática, estética, voltada ao outro. Tendências: amores/parcerias/casamentos em destaque; decisões pedem ponderação; justiça/ética centrais; beleza/arte/harmonia; possível contrato/aliança formal. Forte tendência a uma parceria importante ser definida (casamento, sociedade ou encerramento do que não serve). Cuidado: dificuldade de decidir sozinha, dependência.",
  "Escorpião": "Ano pede transformação, profundidade, enfrentar o oculto. Mais intensa, investigativa, poderosa. Tendências: transformações profundas e inevitáveis; verdades ocultas surgem; possíveis perdas/lutos/encerramentos; poder pessoal cresce com honestidade; sexualidade/finanças compartilhadas/heranças como temas. Forte tendência a um ano de 'antes e depois' — você não será a mesma. Cuidado: obsessão, possessividade, medo de perder controle.",
  "Sagitário": "Ano pede expansão, aprendizado, abertura ao desconhecido. Mais otimista, filosófica, aberta ao mundo. Tendências: viagens longas prováveis/desejadas; estudos superiores/especializações; crenças e valores revistos; aventura e espontaneidade; oportunidades internacionais. Forte tendência a algo levar além dos limites habituais (viagem, livro, professor, nova filosofia). Cuidado: excesso de otimismo, promessas irreais.",
  "Capricórnio": "Ano pede responsabilidade, estrutura, construção de legado. Mais séria, ambiciosa, comprometida com resultados. Tendências: carreira e objetivos de longo prazo dominam; responsabilidades aumentam; reconhecimento profissional provável; trabalha mais e conquista mais; estrutura para durar. Forte tendência a ser chamada a responsabilidades maiores — não recuse, sua maturidade é testada e comprovada. Cuidado: excesso de seriedade, negligenciar lazer/relações.",
  "Aquário": "Ano pede inovação, liberdade, contribuição coletiva. Mais original, independente, voltada ao grupo. Tendências: rompimento com estruturas que limitam; tecnologia/inovação entram com força; amizades/grupos importantes; projetos que beneficiam muitos; capacidade de surpreender. Forte tendência a uma decisão que parece 'louca' aos outros mas é o que a evolução pede. Cuidado: rebeldia sem causa, distanciamento emocional.",
  "Peixes": "Ano pede sensibilidade, espiritualidade, rendição consciente. Mais intuitiva, compassiva, permeável ao invisível. Tendências: vida espiritual/meditação/terapia se intensificam; fronteiras pessoais mais fluidas (cuidado); sonhos/intuições aumentam; arte/criatividade/imaginação florescem; possível serviço humanitário ou cuidado de alguém. Forte tendência a o invisível ser mais real que o visível — confie na intuição. Cuidado: fuga da realidade, falta de limites, ilusões em relações."
};

// -------------------------------------------------------------------------------
// CONSTANTE 4 — SOL DA RS POR CASA (área de maior luz/foco do ano)
// -------------------------------------------------------------------------------

const SOL_RS_POR_CASA = {
  1: "Ano sobre VOCÊ — identidade, corpo, presença. Reinvenção pessoal: nova aparência, postura, autoestima. O mundo reage diferente porque você está diferente. Prática: mudança visual, projetos pessoais em prioridade, saúde do corpo. Cuidado: egocentrismo.",
  2: "Ano sobre RECURSOS — dinheiro, talentos, o que é seu. Construir segurança, valorizar o que tem. Mudança na renda (novo emprego, aumento, negócio, ou perda que força reconstrução). Prática: revisar finanças no início, investir em habilidades que geram renda, não gastar por impulso. Cuidado: acumulação por medo.",
  3: "Ano sobre COMUNICAÇÃO — palavra, estudos, mente. Fala/aprende/escreve/conecta mais. Projeto de comunicação (livro, curso, canal) ganha força; irmãos/vizinhança em cena. Prática: tirar ideias da cabeça e colocar no mundo. Cuidado: dispersão, superficialidade.",
  4: "Ano sobre RAÍZES — família, lar, fundação emocional. O privado, interno, ancestral chama. Mudança de casa, reforma, reaproximação familiar ou encerramento doméstico. Prática: investir no lar, terapia muito produtiva, examinar padrões familiares. Cuidado: excesso de recolhimento.",
  5: "Ano sobre EXPRESSÃO E PRAZER — criatividade, amor, filhos. Romance intenso; gravidez (se desejada); projeto criativo se concretiza; você se permite ser vista. Prática: prazer sem culpa, criar algo que expresse quem é. Cuidado: excessos, irresponsabilidade.",
  6: "Ano sobre TRABALHO E SAÚDE — rotina, serviço, aperfeiçoamento. O mundano é sagrado: cada tarefa bem-feita constrói algo maior. Mudança de emprego/função; rotina de saúde; aprende pela prática. Prática: rotina sustentável, saúde preventiva. Cuidado: excesso de trabalho, negligenciar saúde emocional.",
  7: "Ano sobre O OUTRO — parcerias, contratos, relacionamentos. Você se encontra pelo espelho do outro. Casamento, noivado, sociedade ou separação; contratos assinados/rescindidos. Prática: examinar quem chama de parceiro, compromissos formais têm peso. Cuidado: codependência, perda de identidade.",
  8: "Ano sobre TRANSFORMAÇÃO — morte simbólica, renascimento, poder. Algo deixa de ser; o que surge é mais autêntico. Luto, herança, crise que purifica; sexualidade/finanças compartilhadas emergem. Prática: não resistir; terapia profunda e trabalho de sombra produtivos. Cuidado: obsessão, medo de perder controle.",
  9: "Ano sobre EXPANSÃO — viagens, filosofia, espiritualidade, ensino. Quer mais mundo, conhecimento, sentido. Viagem significativa; curso superior; novas filosofias; publicação. Prática: diga sim à expansão (viagem, palestra, curso). Cuidado: excesso de otimismo, não completar o que começa.",
  10: "Ano sobre CARREIRA E LEGADO — posição pública, nome, autoridade. O mundo reconhece o que você construiu; agora apareça. Promoção, reconhecimento, novo cargo, fundação de empresa. Prática: aceitar reconhecimento, avançar para posição maior — um dos anos mais propícios para carreira. Cuidado: negligenciar vida pessoal, arrogância.",
  11: "Ano sobre COMUNIDADE E FUTURO — amizades, grupos, sonhos coletivos. Propósito no que constrói além de si. Novo grupo/comunidade; amizade importante; projeto coletivo decola. Prática: investir em redes/colaborações; o que você quer daqui a 5 anos começa hoje. Cuidado: diluição de identidade no grupo.",
  12: "Ano sobre INTERIORIDADE E ESPIRITUALIDADE — retiro, silêncio, cura. O invisível é o mais importante. Recolhimento (voluntário ou não); trabalho terapêutico profundo; finalização de ciclos kármicos. Prática: não forçar exposição; meditação/terapia/retiros muito produtivos. Cuidado: isolamento excessivo, saúde negligenciada."
};

// -------------------------------------------------------------------------------
// CONSTANTE 5 — LUA DA RS POR CASA (vida emocional do ano)
// -------------------------------------------------------------------------------

const LUA_RS_POR_CASA = {
  1: "Emoções expostas — o que sente, os outros veem. Sensibilidade e expressão emocional intensas. Prática: sentir sem se julgar; o corpo fala.",
  2: "Segurança emocional ligada à financeira. Risco de decisões financeiras emocionais. Prática: não decidir dinheiro sob tensão emocional.",
  3: "Emoções pela comunicação. Conversas importantes, escritas que curam, diálogos decisivos. Prática: escrever o que sente, falar com quem importa.",
  4: "Emocionalidade voltada à família e lar. Questões domésticas intensas, possível mudança, saudade, luto familiar. Prática: cuidar do espaço de descanso; família.",
  5: "Emoções no amor, criatividade, filhos. Romance intenso, desejo de criar, possível gravidez. Prática: permitir-se criar e amar — a emoção ao criar é vocação.",
  6: "Emoções ligadas a trabalho e saúde. Sofrimento por excesso de trabalho, saúde emocional. Prática: ouvir o que o corpo sente sobre o trabalho.",
  7: "Emoções no parceiro/relacionamentos. Foco emocional intenso no vínculo. Prática: conversar com honestidade; relações escondidas emergem.",
  8: "Emocionalidade profunda; purificação. Luto, crise transformadora, confronto com sombras. Prática: não controlar o que sente — o que emerge quer ser curado.",
  9: "Emoções na busca de sentido e expansão. Fé, viagem, estudo como cura. Prática: ir a um lugar novo — horizontes curam.",
  10: "Emoções ligadas à reputação/carreira. Orgulho, vergonha, medo de julgamento. Prática: o que você pensa de si importa mais que a opinião alheia.",
  11: "Emoções em grupos/amizades/causas. Amizades que emocionam, causa coletiva que move. Prática: cercar-se de quem te faz pertencer.",
  12: "Emoções profundas, não verbalizadas; vida interior intensa. Sonhos reveladores, intuição alta, possível desânimo se ignorado. Prática: escrever sonhos, meditar."
};

// -------------------------------------------------------------------------------
// CONSTANTE 6 — DEMAIS PLANETAS DA RS POR CASA (Mercúrio, Vênus, Marte, Júpiter, Saturno, Plutão)
// -------------------------------------------------------------------------------

const PLANETAS_RS_POR_CASA = {
  "Mercúrio": {
    1: "Sua palavra é você — como se comunica define como é percebida. Nova forma de se expressar, eloquência aumentada.",
    2: "Comunicação gera renda — ano de monetizar voz/escrita/ensino. Proposta financeira via comunicação, negociação importante.",
    3: "Comunicação em plenitude — escrita, cursos, palestras. Muitos projetos, risco de sobrecarga de informação.",
    4: "Conversas importantes em família; documentos domésticos. Diálogos que curam ou confrontam a história familiar.",
    5: "Comunicação criativa — escrita criativa, ensino com prazer. Romance que começa pela palavra (carta, conversa).",
    6: "Comunicação no trabalho — contratos de serviço, instruções, rotinas. Diálogos decisivos com colegas.",
    7: "Comunicação com o parceiro — negociações, palavras que selam compromissos. Conversa decisiva sobre o relacionamento.",
    8: "Comunicação que investiga e transforma — pesquisa profunda, revelações, segredos expostos. Descoberta que muda a perspectiva.",
    9: "Comunicação expandida — publicação, ensino, filosofia, idiomas. Oportunidade de ensinar/publicar para público maior.",
    10: "Comunicação pública/profissional — apresentações, relatórios, entrevistas. Sua comunicação define o prestígio.",
    11: "Comunicação em grupo — redes, comunidades, projetos coletivos. Algo dito em público gera repercussão.",
    12: "Comunicação interna — diário, terapia, preces. O que não se diz pesa; achar forma segura de expressar."
  },
  "Vênus": {
    1: "Mais atraente e magnética — ano favorável a amor e aparência. Forte: novo relacionamento, renovação de vínculos, mudança visual positiva.",
    2: "Prosperidade financeira — ganhos, valorização. Forte: aumento de renda, presente, herança ou investimento bem-sucedido.",
    3: "Harmonia com irmãos/vizinhos/colegas. Comunicação amorosa, amor próximo.",
    4: "Harmonia familiar; lar como espaço de beleza. Forte: reconciliação familiar, bom momento para casais que coabitam.",
    5: "Um dos melhores posicionamentos — romance, criatividade, prazer puro. Forte: início de relacionamento, criação artística realizadora.",
    6: "Amor no trabalho (cuidado com complicações); harmonia nos serviços. Prazer no trabalho, colega que se torna mais.",
    7: "Casa das parcerias — casamento, compromisso, renovação. Forte: proposta, renovação de votos ou nova parceria significativa.",
    8: "Amor intenso, transformador; finanças compartilhadas melhoram. Forte: relacionamento que transforma, herança, investimento conjunto.",
    9: "Amor à distância, por viagem, por cultura diferente. Relacionamento com alguém fora do meio habitual.",
    10: "Beleza e charme com reconhecimento público; imagem profissional brilha. Forte: reconhecimento estético ou relações profissionais.",
    11: "Amizades que viram amor, ou amor em grupo. Círculo social se expande, amizade importante surge.",
    12: "Amor secreto ou que pede silêncio; beleza interior, espiritualidade amorosa. Cura emocional profunda, possível romance discreto."
  },
  "Marte": {
    1: "Energia física muito alta — age com impulso e liderança. Forte: projetos iniciados com força, conflitos por excesso de assertividade. Canalizar em exercício e projetos concretos.",
    2: "Ação em direção ao dinheiro — vai atrás de ganhos ativamente. Conquistas por ação, mas gastos impulsivos.",
    3: "Comunicação incisiva — fala com força. Conflitos com irmãos/vizinhos, debates intensos, projetos urgentes.",
    4: "Conflitos em casa/família; energia voltada ao lar. Forte: reforma, mudança ou conflito familiar a resolver.",
    5: "Paixão intensa, amor com urgência, criatividade acelerada. Romance apaixonado, possível gravidez não planejada.",
    6: "Ação no trabalho — trabalha muito, com energia. Forte: sobrecarga, risco de esgotamento, cuidado com saúde.",
    7: "Conflitos na parceria; decisões urgentes. Separação ou aprofundamento de compromisso após confronto.",
    8: "Transformação pela ação — age para transformar. Forte: ação que muda tudo; não adiar o movimento.",
    9: "Ação expandida — age para crescer, viajar, ensinar. Viagem urgente, projeto de expansão que decola.",
    10: "Ambição em alta — age para conquistar posição. Forte: promoção por esforço, mas conflitos com autoridade.",
    11: "Ação coletiva — lidera projetos de grupo. Liderança em comunidade, conflitos por posições diferentes.",
    12: "Energia reprimida ou voltada ao invisível. Esforço não reconhecido, ação espiritual, saúde pede atenção."
  },
  "Júpiter": {
    1: "Expansão pessoal — cresce em todos os sentidos. Forte: ano favorável a começos, viagens, projetos pessoais.",
    2: "Expansão financeira — dos melhores posicionamentos. Forte: aumento de renda, novos contratos, recursos chegando.",
    3: "Expansão da comunicação — alcance e estudos crescem. Publicação, curso transformador.",
    4: "Expansão da família e do lar. Família que cresce, casa maior, harmonia doméstica.",
    5: "Expansão do prazer e criatividade; possível gravidez (se desejada). Forte: romance feliz, projeto criativo que explode.",
    6: "Expansão do trabalho — mais projetos, clientes, tarefas. Crescimento por trabalho consistente.",
    7: "Expansão das parcerias. Forte: casamento, nova parceria, contratos favoráveis.",
    8: "Expansão via transformação — recursos compartilhados, herança, investimentos. Ganho via outros.",
    9: "Júpiter em domicílio — expansão máxima. Forte: viagem transformadora, publicação, espiritualidade florescendo, estudo que liberta.",
    10: "Expansão profissional — um dos melhores anos para carreira. Forte: promoção, reconhecimento, cargo novo, empresa fundada.",
    11: "Expansão social/coletiva — rede de contatos cresce. Comunidade que decola, amizades que abrem portas.",
    12: "Expansão espiritual/interior — bênçãos invisíveis. Proteção em momentos difíceis, retiro produtivo."
  },
  "Saturno": {
    1: "Responsabilidade aumentada sobre si; ano mais sério e contido. Trabalho interno, amadurecimento acelerado.",
    2: "Restrição financeira ou disciplina com dinheiro. Revisão obrigatória de finanças, possível período de menor renda.",
    3: "Comunicação cautelosa; estudos que exigem disciplina. Curso longo e difícil, contratos revisados com cuidado.",
    4: "Responsabilidades familiares pesadas; lar exige atenção. Cuidado de familiar idoso/doente.",
    5: "Criatividade que exige trabalho; amor que exige compromisso. Relacionamento que fica sério, filho que gera responsabilidade.",
    6: "Trabalho intenso e disciplinado; saúde exige sistema. Forte: sobrecarga, rotina de saúde obrigatória.",
    7: "Parcerias testadas — prova de maturidade. Casal que se consolida ou separa por falta de compromisso real.",
    8: "Transformações lentas e dolorosas; recursos escassos ou dívidas. Revisão de dívidas, luto, transformação profunda.",
    9: "Expansão que exige estrutura; estudos sérios e longos. Especialização longa, crença testada.",
    10: "Saturno em casa própria — carreira exige muito mas gera legado. Forte: ano difícil que constrói reputação duradoura.",
    11: "Grupos e amizades testados. Perda de amizade não-real, fortalecimento das genuínas.",
    12: "Retiro forçado ou voluntário; trabalho espiritual sério. Período de solidão necessária, terapia profunda."
  },
  "Plutão": {
    1: "Você muda irreversivelmente — identidade em morte e renascimento. Forte: mudança radical de aparência, postura, crenças sobre si.",
    2: "Recursos se transformam; dinheiro muda dramaticamente. Perda que liberta ou ganho que transforma responsabilidades.",
    3: "Comunicação que transforma — o que você diz muda realidades. Revelação pública, palavra que não se retira.",
    4: "Família em transformação profunda; ancestralidade confrontada. Forte: morte, nascimento ou ruptura familiar irreversível.",
    5: "Amor que transforma; criatividade muda de forma. Fim de relacionamento ou início de amor que muda tudo.",
    6: "Trabalho em transformação radical. Forte: mudança de profissão, colapso de rotina antiga, reconstrução de saúde.",
    7: "Parceria em transformação radical. Forte: separação ou transformação do relacionamento em algo completamente diferente.",
    8: "Plutão em casa própria — transformação máxima, renascimento profundo. Forte: ano de morte e renascimento em várias áreas.",
    9: "Crenças e visão de mundo se transformam irreversivelmente. Conversão espiritual, quebra de paradigma.",
    10: "Carreira em transformação radical. Forte: fim de carreira ou início de nova; posição de poder ou queda.",
    11: "Grupos e amizades se transformam radicalmente. Ruptura com grupo que não serve, entrada em grupo transformador.",
    12: "Transformação do inconsciente; sombras emergem para integração. Terapia profunda necessária, encontro com o reprimido."
  }
};

// -------------------------------------------------------------------------------
// CONSTANTE 7 — ASPECTOS + OVERLAY + CASAS ATIVADAS
// -------------------------------------------------------------------------------

const ASPECTOS_RS = `
## ASPECTOS QUE DEFINEM O TOM DO ANO
CONJUNÇÃO (0°, orbe ≤8°) — fusão: energias se misturam/intensificam (ex.: Sol conj Júpiter = crescimento/visibilidade).
TRÍGONO (120°, orbe ≤6°) — harmonia: fluem sem atrito; sorte e oportunidade sem esforço excessivo.
SEXTIL (60°, orbe ≤4°) — oportunidade: precisa de ação para concretizar.
QUADRATURA (90°, orbe ≤6°) — tensão: obstáculo que testa; crescimento quando enfrentado, paralisia se evitado.
OPOSIÇÃO (180°, orbe ≤6°) — polarização: dois polos que pedem integração/equilíbrio.

## ASPECTOS DE OVERLAY (RS × NATAL) — os mais importantes
Revelam como o ano dialoga com quem você É. Exemplos:
- Júpiter RS conj Sol natal: expansão toca a essência; oportunidades chegam sem buscar muito.
- Saturno RS quad MC natal: desafios de carreira que pedem paciência e geram estrutura sólida.
- Plutão RS conj Lua natal: transformação toca a emoção; luto/ruptura/transformação emocional profunda.
- Marte RS conj Nodo Norte natal: ano de movimento evolutivo acelerado; coragem para o que precisava ser feito.
- Vênus RS trígono ASC natal: relacionamentos chegam sem esforço.

## CASAS (classificação temática)
ANGULARES (1,4,7,10) → eventos externos, visíveis, concretos.
SUCEDENTES (2,5,8,11) → recursos (financeiros, emocionais, sociais).
CADENTES (3,6,9,12) → processos de aprendizado, comunicação, espiritualidade.
Casas com muitos planetas = FOCO/INTENSIDADE. Casas vazias = fluxo mais suave (não irrelevantes).
`;

// -------------------------------------------------------------------------------
// CONSTANTE 8 — ÁREAS DA VIDA (análise temática)
// -------------------------------------------------------------------------------

const AREAS_VIDA_RS = `
## ÁREAS DA VIDA — O QUE OBSERVAR E COMO ESCREVER

AMOR: Casa 7 RS, Vênus RS, Lua RS, Casa 5 RS, Vênus RS × Lua natal. Positivo: Júpiter em 5/7 (romance/casamento), Vênus bem aspectada em 1/5/7, Lua em 7, Sol em 5. Desafio: Saturno em 7 (teste/maturação), Marte em 7 (conflito), Plutão em 5/7 (transformação radical).

CARREIRA E PROSPERIDADE: Casa 10 RS, Casa 2 RS, Casa 6 RS, Júpiter/Saturno RS, MC RS × MC natal. Positivo: Júpiter em 2/10 (expansão), Sol em 10 (visibilidade), Vênus em 2 (prosperidade), trígonos ao MC. Desafio: Saturno em 2 (restrição), Plutão em 10 (transformação radical), Marte em 6 (burnout).

SAÚDE: Casa 6 RS (física), Casa 12 RS (emocional/espiritual), Casa 1 RS (vitalidade), Marte RS, Saturno aspectando. Atenção: Saturno/Plutão em 6 (cuidado sistemático), Marte em 6/12 (esgotamento), Nodo Sul em 6 (padrões antigos encerrando). Doenças não se anunciam, mas padrões de esgotamento são previsíveis.

FAMÍLIA E LAR: Casa 4 RS, Lua RS, Plutão/Saturno em 4. Lua/Sol em 4 (família central), Júpiter em 4 (harmonia/mudança positiva), Plutão em 4 (transformação profunda: luto/nascimento/ruptura), Saturno em 4 (responsabilidades pesadas).

ESPIRITUALIDADE: Casa 9 RS, Casa 12 RS, Nodo Norte RS, Netuno/Júpiter RS. Sol/Júpiter em 9 (expansão espiritual/filosófica), Netuno bem aspectado (intuição/arte como cura), Nodo Norte em casas angulares (evolução acelerada).

LINGUAGEM PREMONITÓRIA (modelo): "Existe forte tendência a que [área] seja [ativa/desafiada/expandida] este ano. Se você está em [situação A], [descrição]. Se está em [situação B], [descrição]. O que [seu coração/carreira/corpo] mais precisa agora é [conselho específico]."
`;

// -------------------------------------------------------------------------------
// CONSTANTE 9 — PREVISÃO POR TRIMESTRES / MÊS A MÊS
// -------------------------------------------------------------------------------

const PREVISAO_RS = `
## DIVISÃO DO ANO SOLAR (do aniversário ao próximo) EM 4 TRIMESTRES
TRIMESTRE 1 (meses 1-3): energia do ASC da RS mais intensa; temas iniciais se estabelecem. "O que começa agora?"
TRIMESTRE 2 (meses 4-6): tensões do MC emergem; carreira/relacionamentos em foco. "O que está sendo construído?"
TRIMESTRE 3 (meses 7-9): desafios/crises possíveis; Saturno e Plutão se manifestam. "O que precisa ser transformado?"
TRIMESTRE 4 (meses 10-12): encerramento; colheita e preparação para o novo ano solar. "O que está sendo concluído?"

## ESTRUTURA DE CADA MÊS (quando detalhar mês a mês)
Tema geral; área em destaque (casa mais ativada); planeta dominante; previsão; oportunidade (onde agir); cuidado (onde proteger-se); mensagem premonitória inspiradora.
Foque nos planetas lentos (Júpiter, Saturno, Urano, Netuno, Plutão) e quando mudam de casa ou aspectam planetas natais para definir os trimestres.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 10 — ESTRUTURA DO RELATÓRIO + TOM + FRASES MODELO + UPSELL
// -------------------------------------------------------------------------------

const ESTRUTURA_RS = `
## ESTRUTURA DO RELATÓRIO
1. DADOS TÉCNICOS DA RS (bloco no início: data e horário exatos do retorno solar, local, ASC RS, MC RS, planeta mais forte, tema central, duração)
2. APRESENTAÇÃO DO ANO (frase síntese premonitória, 3-5 parágrafos: o que este ciclo pede de você)
3. ASCENDENTE DA RS (o personagem do ano, tendências específicas)
4. SOL DA RS (área de maior luz e foco)
5. TEMAS DO ANO em ordem de importância (Amor; Carreira/Prosperidade; Saúde; Família/Lar; Crescimento Pessoal)
6. ANÁLISE PLANETÁRIA COMPLETA (cada planeta na posição de RS + aspectos críticos com o natal/overlay)
7. CUIDADOS E OPORTUNIDADES por área
8. PREVISÃO POR TRIMESTRES
9. MENSAGEM PREMONITÓRIA FINAL (1 parágrafo poderoso)
10. PRÓXIMOS PASSOS PRÁTICOS (5-7 ações concretas)
11. CHAMADAS PARA OUTROS MAPAS ASTRALIA (upsell individual)

## TOM E LINGUAGEM
SEMPRE: premonitório ("existe forte tendência a...", "seu mapa indica..."); inspirador (crescimento mesmo no desafio); honesto (não esconde dificuldade, mas não catastrofiza); prático (cada previsão tem ação); personalizado (nome + detalhes do mapa DELA).
NUNCA: catastrófico, genérico, sem ação, absolutista, sem esperança.

## FRASES PREMONITÓRIAS MODELO
Em vez de "Saturno na Casa 7 vai dificultar seu relacionamento" → "A área de parcerias passará por um teste de maturidade. Existe forte tendência a conversas importantes, talvez difíceis. Casais que superam saem mais fortes; os sem base real redefinem caminhos. O que seu coração sabe que precisa ser dito?"
Em vez de "Júpiter na Casa 10 vai te dar promoção" → "Um dos períodos mais favoráveis para carreira. Forte tendência a reconhecimento, oportunidade ou expansão. Portas fechadas se abrem. Você está pronta para passar por elas?"

## UPSELL (individual — NÃO combo; só quando a análise revela o gancho)
- Mapa da Sorte: quando Júpiter/Vênus em Casa 2 ou 8, temas financeiros fortes, mudança de renda.
- Mapa de Previsões 18 Meses: quando há múltiplos temas ou períodos que pedem detalhamento mensal (cruza trânsitos com a RS).
- Mapa Kármico: quando há padrões que se repetem ano após ano, Saturno/Nodo Sul central, temas "bloqueados".
- Mapa Profissional: quando há mudança profissional prevista, Sol em 10 ou 6, transição de carreira.
- Mapa da Lilith: quando Lilith em posição angular/aspecto forte, temas de autenticidade/repressão.
- Sinastria: quando relacionamento em foco (Casa 7 ativada), casamento/separação/nova parceria prevista.
Oferecer no máximo 1-2 mais relevantes ao que o ano revelou. Como conselho genuíno, não propaganda.

## RESPONSABILIDADE
A RS é mapa de possibilidades, não fatalidades. O papel não é assustar, é PREPARAR; não prever desgraças, é REVELAR CAMINHOS; não tirar o poder, é DEVOLVÊ-LO. Nomear o que a pessoa sente mas não articula é o maior serviço. Verdade dita com afeto liberta.
`;

// -------------------------------------------------------------------------------
// FUNÇÃO BUILD
// -------------------------------------------------------------------------------
// dados: { nome, dataNascimento, horaNascimento, localNascimento, anoRS, localRS,
//          dataRS, horaRS (0-23), fusoRS }
// natal: { Sol:{signo,grau,casa}, Lua:..., ..., MC, ASC }
// rs:    { Sol:{signo,grau,casa}, Lua:..., ..., ASC:{signo,grau}, MC:{signo,grau} } (já calculado pela API)
// aspectos: [{ planeta1, aspecto, planeta2, orbe, tipo:'rs'|'overlay' }]

function buildPromptRevolucaoSolar(dados, natal, rs, aspectos = []) {
  const nome = dados.nome || '[NOME]';

  // Processamentos seguros (sobre dados já calculados)
  const horario = (dados.horaRS !== undefined && dados.horaRS !== null) ? interpretarHorarioRS(dados.horaRS) : null;
  const solRSCasa = rs.Sol && rs.Sol.casa ? rs.Sol.casa : null;
  const ativadas = casasAtivadas(rs);
  const overlay = gerarOverlay(natal, rs);

  // Bloco de dados técnicos
  const dadosTecnicos = `Data RS: ${dados.dataRS || '[calcular]'} | Horário exato do retorno solar: ${dados.horaRS != null ? dados.horaRS + 'h' : '[calcular]'} ${dados.fusoRS || ''} | Local calculado: ${dados.localRS || '[onde a cliente estará]'}
ASC da RS: ${rs.ASC ? (rs.ASC.signo + ' ' + (rs.ASC.grau||'') + '°') : '[?]'} | MC da RS: ${rs.MC ? (rs.MC.signo + ' ' + (rs.MC.grau||'') + '°') : '[?]'}
${horario ? `Horário (${horario.faixa}): ${horario.leitura}` : 'Horário do retorno solar não informado.'}
Sol da RS na Casa ${solRSCasa || '?'} → TEMA CENTRAL do ano: ${solRSCasa ? (SOL_RS_POR_CASA[solRSCasa] || '').split('.')[0] : '?'}`;

  const planetasRSInfo = Object.entries(rs)
    .filter(([k,v]) => v && typeof v === 'object' && SIGNOS_ORDEM.includes(v.signo) && !['ASC','MC','DESC','IC'].includes(k))
    .map(([p,d]) => `  - ${p}: ${d.signo} ${d.grau ?? '?'}°${d.retrogrado ? ' ℞' : ''} (Casa ${d.casa ?? '?'})`).join("\n");

  const prompt = `Você é um astrólogo com mais de 30 anos de experiência em Revolução Solar.
Sua leitura é premonitória, inspiradora, honesta e NUNCA catastrófica. Cliente: ${nome}.
Palavra-chave do trabalho: AUTO RESPONSABILIDADE e CONSCIÊNCIA.
Comprimento mínimo: 8.000 palavras (alvo 8.000-12.000).

# DADOS DO MAPA NATAL
Nascimento: ${dados.dataNascimento || '[DATA]'}, ${dados.horaNascimento || '[HORA]'}, ${dados.localNascimento || '[LOCAL]'}
${Object.entries(natal).filter(([k,v]) => v && typeof v === 'object' && SIGNOS_ORDEM.includes(v.signo)).map(([p,d]) => `  - ${p}: ${d.signo} ${d.grau ?? '?'}° (Casa ${d.casa ?? '?'})`).join("\n")}
  - MC natal: ${natal.MC ? (natal.MC.signo + ' ' + (natal.MC.grau||'')) : '?'} | ASC natal: ${natal.ASC || '?'}

# DADOS DA REVOLUÇÃO SOLAR ${dados.anoRS || ''} (já calculada pela API)
${dadosTecnicos}

PLANETAS NA RS:
${planetasRSInfo}

OVERLAY (natal → RS) — onde cada energia natal está sendo ativada:
${overlay}

CASAS ATIVADAS (mais planetas = mais foco):
${ativadas.map(c => '  - ' + c).join("\n")}

ASPECTOS (RS e overlay):
${aspectos.length ? aspectos.map(a => `  - ${a.planeta1} ${a.aspecto} ${a.planeta2} (orbe ${a.orbe ?? '?'}°${a.tipo ? ', ' + a.tipo : ''})`).join("\n") : "(fornecer aspectos para leitura completa)"}

${FUNDAMENTOS_RS}
${HORARIO_RS}

## ASC DA RS POR SIGNO (use o do ASC da RS desta cliente)
${Object.entries(ASC_RS_POR_SIGNO).map(([s,t]) => `${s}: ${t}`).join("\n\n")}

## SOL DA RS POR CASA (use a casa do Sol RS desta cliente — é o tema central)
${Object.entries(SOL_RS_POR_CASA).map(([c,t]) => `Casa ${c}: ${t}`).join("\n")}

## LUA DA RS POR CASA
${Object.entries(LUA_RS_POR_CASA).map(([c,t]) => `Casa ${c}: ${t}`).join("\n")}

## DEMAIS PLANETAS DA RS POR CASA
${Object.entries(PLANETAS_RS_POR_CASA).map(([planeta, casas]) => `${planeta}:\n` + Object.entries(casas).map(([c,t]) => `  Casa ${c}: ${t}`).join("\n")).join("\n\n")}

${ASPECTOS_RS}
${AREAS_VIDA_RS}
${PREVISAO_RS}
${ESTRUTURA_RS}

# FORMATO DE SAÍDA (OBRIGATÓRIO)
Responda EXCLUSIVAMENTE com JSON válido, sem texto antes/depois, sem markdown:
{ "secoes": [ { "numero": 1, "titulo": "Dados Técnicos da RS", "texto": "..." } ] }
REGRAS: aspas duplas; escape quebras como \\n e aspas internas como \\"; sem blocos de código; "numero" exato (1-11 conforme a estrutura); "texto" em PROSA premonitória corrida (não replicar bullets do template).

# LEMBRETES
1. NOME da cliente várias vezes
2. "existe forte tendência a..." / "seu mapa indica..." — premonitório, nunca absolutista
3. USE OS DADOS REAIS: ASC da RS, casa do Sol RS, planetas por casa, overlay e aspectos desta cliente
4. Cada previsão tem RECOMENDAÇÃO DE AÇÃO
5. Tom premonitório + inspirador + honesto; NUNCA catastrófico, NUNCA genérico
6. Cubra todas as áreas (amor, carreira, saúde, família, espiritualidade)
7. Documente o HORÁRIO exato do retorno solar no bloco técnico
8. Pelo menos 1 chamada para outro mapa Astralia (individual, conforme o gancho real) — sem combo
9. Próximos passos práticos ao final
10. Mínimo de 8.000 palavras

Gere agora o relatório completo. Retorne apenas o JSON.`;

  return {
    diagnostico: {
      cliente: nome,
      anoRS: dados.anoRS || null,
      horarioRS: horario ? `${horario.faixa}` : null,
      ascRS: rs.ASC ? `${rs.ASC.signo} ${rs.ASC.grau || ''}°` : null,
      mcRS: rs.MC ? `${rs.MC.signo} ${rs.MC.grau || ''}°` : null,
      solRSCasa: solRSCasa,
      temaCentral: solRSCasa ? (SOL_RS_POR_CASA[solRSCasa] || '').split('.')[0] : null,
      casasAtivadas: ativadas
    },
    prompt,
    metadados: {
      framework: "Revolução Solar — overlay natal×RS + horário + casas ativadas + análise temática",
      modeloRecomendado: "claude-opus-4-7",
      palavrasEsperadas: "8.000-12.000",
      tipo: "premium_assincrono_48h",
      observacao: "Cálculo do retorno solar feito ANTES, pela API (efeméride). Função só processa e monta o prompt.",
      saida: "JSON estruturado por seções (renderização de PDF é camada separada)",
      versao: "1.0"
    }
  };
}

module.exports = {
  buildPromptRevolucaoSolar,
  interpretarHorarioRS,
  classificarCasa,
  contarPlanetasPorCasa,
  casasAtivadas,
  gerarOverlay,
  FUNDAMENTOS_RS, HORARIO_RS, ASC_RS_POR_SIGNO, SOL_RS_POR_CASA, LUA_RS_POR_CASA,
  PLANETAS_RS_POR_CASA, ASPECTOS_RS, AREAS_VIDA_RS, PREVISAO_RS, ESTRUTURA_RS
};
