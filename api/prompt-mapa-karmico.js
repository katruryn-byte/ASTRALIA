// ═══════════════════════════════════════════════════════════════════════════════
// ☋ PROMPT — MAPA KÁRMICO — Astralia
// ═══════════════════════════════════════════════════════════════════════════════
// Produto Premium — Padrões, ciclos, libertação da alma
// Modelo recomendado: claude-opus-4-7 (Opus — profundidade filosófica e síntese)
// Comprimento alvo: 10.000-15.000 palavras
// Tom: Profundo, transformador, esperançoso — NUNCA culpabilizante
// Palavra-chave: LIBERTAÇÃO ATRAVÉS DO AUTOCONHECIMENTO
// ═══════════════════════════════════════════════════════════════════════════════
// Compila INTEGRALMENTE o "Guia Técnico — Mapa Kármico".
// Calcula Nodo Sul (oposto ao Norte), ocupantes/regentes das Casas IV/VIII/XII,
// detecta sinais da Serpente Kármica e dos 7 padrões transgeracionais.
// Saída em JSON estruturado por seções (renderização de PDF é camada separada).
// ═══════════════════════════════════════════════════════════════════════════════

const SIGNOS_ORDEM = ["Áries","Touro","Gêmeos","Câncer","Leão","Virgem","Libra","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];

const SIGNO_OPOSTO = {
  "Áries":"Libra","Libra":"Áries","Touro":"Escorpião","Escorpião":"Touro",
  "Gêmeos":"Sagitário","Sagitário":"Gêmeos","Câncer":"Capricórnio","Capricórnio":"Câncer",
  "Leão":"Aquário","Aquário":"Leão","Virgem":"Peixes","Peixes":"Virgem"
};

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

// -------------------------------------------------------------------------------
// FUNÇÕES DE CÁLCULO
// -------------------------------------------------------------------------------

function casaOposta(casa) { return ((casa + 5) % 12) + 1; } // 1↔7, 4↔10, etc.

function calcularNodoSul(nodoNorte) {
  // Nodo Sul é sempre oposto ao Norte (signo oposto, casa oposta)
  if (!nodoNorte || !nodoNorte.signo) return null;
  return {
    signo: SIGNO_OPOSTO[nodoNorte.signo] || null,
    casa: nodoNorte.casa ? casaOposta(nodoNorte.casa) : null,
    grau: nodoNorte.grau != null ? nodoNorte.grau : null
  };
}

function ocupantesCasa(mapaNatal, casa) {
  return Object.entries(mapaNatal)
    .filter(([k,v]) => v && typeof v === 'object' && v.casa === casa && SIGNOS_ORDEM.includes(v.signo))
    .map(([k]) => k);
}

function regenteCasa(cuspideSigno) {
  if (!cuspideSigno) return null;
  const trad = REGENTE_SIGNO[cuspideSigno];
  const mod = REGENTE_MODERNO[cuspideSigno];
  return { tradicional: trad, moderno: mod || null };
}

// Verifica se existe aspecto entre dois planetas (em qualquer ordem) de um conjunto de tipos
function temAspecto(aspectos, p1, p2, tipos) {
  return aspectos.some(a => {
    const par = (a.planeta1 === p1 && a.planeta2 === p2) || (a.planeta1 === p2 && a.planeta2 === p1);
    return par && (!tipos || tipos.includes((a.aspecto||'').toLowerCase()));
  });
}
const DIFICEIS = ["quadratura","oposição","oposicao","conjunção","conjuncao"];

// Detecta sinais da Serpente Kármica (o ciclo central que aprisiona)
function detectarSerpente(mapaNatal, aspectos, nodoSul) {
  const sinais = [];
  const pessoais = ["Sol","Lua","Mercúrio","Vênus","Marte"];
  pessoais.forEach(p => { if (temAspecto(aspectos,"Plutão",p,DIFICEIS)) sinais.push(`Plutão em aspecto tenso com ${p} (poder/controle como ciclo)`); });
  ["Sol","Lua","Vênus"].forEach(p => { if (temAspecto(aspectos,"Saturno",p,DIFICEIS)) sinais.push(`Saturno em tensão com ${p} (medo/restrição como ciclo)`); });
  if (ocupantesCasa(mapaNatal,8).length) sinais.push(`Planetas na Casa 8 (${ocupantesCasa(mapaNatal,8).join(", ")}) — transformação recorrente`);
  if (ocupantesCasa(mapaNatal,12).length) sinais.push(`Planetas na Casa 12 (${ocupantesCasa(mapaNatal,12).join(", ")}) — padrão inconsciente ativo`);
  if (nodoSul && nodoSul.casa) sinais.push(`Nodo Sul em ${nodoSul.signo} Casa ${nodoSul.casa} — zona de conforto que pode bloquear evolução`);
  const quiron = mapaNatal["Quíron"];
  if (quiron) sinais.push(`Quíron em ${quiron.signo} Casa ${quiron.casa} — ferida que, não integrada, alimenta o ciclo`);
  return sinais;
}

// Detecta quais dos 7 padrões transgeracionais têm sinal no mapa
function detectarPadroesTransgeracionais(mapaNatal, aspectos, nodoSul) {
  const presentes = [];
  const emCasa = (p,c) => mapaNatal[p] && mapaNatal[p].casa === c;
  // 1 Escassez
  if (emCasa("Saturno",2) || temAspecto(aspectos,"Saturno","Vênus",DIFICEIS))
    presentes.push({ nome:"ESCASSEZ", lema:'"Nunca é suficiente."', quebrar:"Cultivar consciência de abundância presente, mesmo pequena." });
  // 2 Amor condicional
  if (temAspecto(aspectos,"Lua","Saturno",DIFICEIS))
    presentes.push({ nome:"AMOR CONDICIONAL", lema:'"Só sou amada quando mereço."', quebrar:"Experiências de amor incondicional (terapia, comunidade, espiritualidade)." });
  // 3 Silêncio e segredo
  if (emCasa("Mercúrio",12) || emCasa("Plutão",3))
    presentes.push({ nome:"SILÊNCIO E SEGREDO", lema:'"Certas verdades não são ditas."', quebrar:"Fala terapêutica, escrita, verbalizar o não-dito." });
  // 4 Rigidez e controle
  if (temAspecto(aspectos,"Saturno","Lua",DIFICEIS) || emCasa("Plutão",1))
    presentes.push({ nome:"RIGIDEZ E CONTROLE", lema:'"O mundo é perigoso; controle é sobrevivência."', quebrar:"Exposição gradual à incerteza tolerável, meditação, rendição consciente." });
  // 5 Vitimização
  if (emCasa("Netuno",1) || temAspecto(aspectos,"Saturno","Sol",DIFICEIS))
    presentes.push({ nome:"VITIMIZAÇÃO", lema:'"As coisas acontecem para mim, não tenho poder."', quebrar:"Ações pequenas onde o resultado depende só de você." });
  // 6 Hiperresponsabilidade
  if (temAspecto(aspectos,"Lua","Saturno",DIFICEIS) || emCasa("Vênus",12) || (nodoSul && nodoSul.signo==="Câncer"))
    presentes.push({ nome:"HIPERRESPONSABILIDADE", lema:'"Sou responsável pelos sentimentos de todos."', quebrar:"Deixar os outros assumirem as próprias consequências." });
  // 7 Abandono e traição
  if (emCasa("Saturno",7) || emCasa("Plutão",7) || temAspecto(aspectos,"Lilith","Lua",DIFICEIS))
    presentes.push({ nome:"ABANDONO E TRAIÇÃO", lema:'"Quem amo me abandona ou me trai."', quebrar:"Terapia de apego, revisão do histórico, construção de segurança interna." });
  return presentes;
}

// Análise kármica completa (tabela de overlay + temas)
function analisarKarma(mapaNatal, aspectos = []) {
  const nn = mapaNatal["Nodo Norte"] || null;
  const ns = mapaNatal["Nodo Sul"] || calcularNodoSul(nn);
  const tabela = {
    nodoNorte: nn ? `${nn.signo} Casa ${nn.casa ?? '?'} ${nn.grau ?? ''}°` : "?",
    nodoSul: ns ? `${ns.signo} Casa ${ns.casa ?? '?'} ${ns.grau ?? ''}°` : "?",
    plutao: mapaNatal["Plutão"] ? `${mapaNatal["Plutão"].signo} Casa ${mapaNatal["Plutão"].casa ?? '?'}` : "?",
    saturno: mapaNatal["Saturno"] ? `${mapaNatal["Saturno"].signo} Casa ${mapaNatal["Saturno"].casa ?? '?'}` : "?",
    quiron: mapaNatal["Quíron"] ? `${mapaNatal["Quíron"].signo} Casa ${mapaNatal["Quíron"].casa ?? '?'}` : "(não fornecido)",
    lilith: mapaNatal["Lilith"] ? `${mapaNatal["Lilith"].signo} Casa ${mapaNatal["Lilith"].casa ?? '?'}` : "(não fornecido)",
    lua: mapaNatal["Lua"] ? `${mapaNatal["Lua"].signo} Casa ${mapaNatal["Lua"].casa ?? '?'}` : "?",
    casaIV: { cuspide: mapaNatal.cuspideCasa4 || null, ocupantes: ocupantesCasa(mapaNatal,4), regente: regenteCasa(mapaNatal.cuspideCasa4) },
    casaVIII: { cuspide: mapaNatal.cuspideCasa8 || null, ocupantes: ocupantesCasa(mapaNatal,8), regente: regenteCasa(mapaNatal.cuspideCasa8) },
    casaXII: { cuspide: mapaNatal.cuspideCasa12 || null, ocupantes: ocupantesCasa(mapaNatal,12), regente: regenteCasa(mapaNatal.cuspideCasa12) }
  };
  return {
    tabelaOverlay: tabela,
    nodoSulCalculado: ns,
    serpente: detectarSerpente(mapaNatal, aspectos, ns),
    padroesTransgeracionais: detectarPadroesTransgeracionais(mapaNatal, aspectos, ns)
  };
}

// -------------------------------------------------------------------------------
// CONSTANTE 1 — FUNDAMENTOS FILOSÓFICOS (Karma, Samsara, Serpente) + TOM
// -------------------------------------------------------------------------------

const FUNDAMENTOS_KARMICOS = `
═══════════════════════════════════════════════════════════════════════════════
MAPA KÁRMICO — FUNDAMENTOS
═══════════════════════════════════════════════════════════════════════════════
Não é punição por erros, dívida cósmica ou destino imutável. É sobre PADRÕES:
herdados da família, criados nesta vida, que se repetem porque ainda não receberam
consciência — e que PODEM ser quebrados. O mapa revela tendências, não certezas.
Astrologia evolutiva, não fatalista. O mapa revela, não condena; ilumina, não aprisiona.

## PILAR 1 — KARMA
A qualidade energética que você embute nas ações volta na mesma frequência (amor→amor,
medo→confirmação do medo, escassez→escassez). Você não começa do zero: carrega padrões
gravados antes de nascer. Não é punição — é herança inconsciente, que pode ser aceita,
modificada ou recusada.
3 tipos: INDIVIDUAL (o que você criou — 100% sob seu poder, muda hoje); FAMILIAR/
TRANSGERACIONAL (o que a linhagem criou — herdado, repetido sem saber, quebrável com
consciência); COLETIVO (cultura/país/época). Este mapa trabalha Individual e Familiar.

## PILAR 2 — SAMSARA
O ciclo de sofrimento que se repete (relacionamento tóxico atrás de outro igual; ganhar
e perder dinheiro; emprego odiado atrás de outro; coragem→recuo→coragem→recuo). O ciclo
não quebra porque a CAUSA — um padrão inconsciente — não foi endereçada.
Estrutura: GATILHO → PADRÃO AUTOMÁTICO → RESULTADO DOLOROSO → PROMESSA DE MUDANÇA → GATILHO.
Saída não é força de vontade — é CONSCIÊNCIA: ver o ciclo com clareza suficiente para
escolher diferente no momento do gatilho.

## PILAR 3 — SERPENTE KÁRMICA
O padrão que se enrosca na vida (como serpente no galho: não destrói, mas prende e impede
o crescimento livre). Identificada por: Plutão em aspecto difícil com pessoais; Nodo Sul
bloqueando; Saturno em tensão com Sol/Lua/Vênus; padrões de Casa 8 e 12; Quíron não
integrado. Trabalhada com consciência, transforma-se: o veneno vira antídoto, a serpente
que morde vira a que cura.

## TOM CORRETO (produto mais íntimo do catálogo — tocando feridas profundas)
NUNCA "você vai sempre sofrer por este padrão" → SEMPRE "você carrega este padrão e tem
o que precisa para quebrá-lo".
NUNCA "sua família te marcou para sempre" → SEMPRE "sua família te transmitiu algo, e você
escolhe o que fazer com ele".
NUNCA "vai repetir até morrer" → SEMPRE "este ciclo pede consciência, e é o que você
desenvolve agora".
`;

// -------------------------------------------------------------------------------
// CONSTANTE 2 — NODO SUL POR SIGNO (de onde você vem — talento que virou prisão)
// -------------------------------------------------------------------------------

const NODO_SUL_SIGNO = {
  "Áries": "TALENTOS: coragem instintiva, iniciativa rápida, agir sozinha, autoliderança. ZONA DE CONFORTO: resolve tudo sozinha, age antes de pensar, lidera pela força não pela diplomacia. PADRÃO INCONSCIENTE: acha que ninguém faz tão bem, não pede ajuda por orgulho, age tão rápido que destrói o que construiu, boa em começar e ruim em manter, relações sofrem porque não cede. INTEGRAÇÃO (Libra): co-criar, considerar o outro, unir forças — coragem compartilhada é mais poderosa.",
  "Touro": "TALENTOS: paciência extraordinária, persistência, construção lenta e sólida, criar estabilidade, manter. ZONA DE CONFORTO: rotina, segurança material, prazer sensorial, o conhecido e duradouro. PADRÃO INCONSCIENTE: resistência à mudança que vira prisão; apego a pessoas/situações/coisas que já terminaram porque mudança parece ameaça; presa em emprego/relação por ser familiar. INTEGRAÇÃO (Escorpião): transformação purifica, não destrói; aprender a soltar; o que não muda apodrece.",
  "Gêmeos": "TALENTOS: mente ágil, comunicação fácil, versatilidade, conectar ideias. ZONA DE CONFORTO: múltiplos projetos, muita informação, conexões superficiais; sabe muito de muito, pouco de pouco. PADRÃO INCONSCIENTE: foge da profundidade, racionaliza em vez de sentir, mil opiniões e poucas convicções, explica sentimentos em vez de vivê-los. INTEGRAÇÃO (Sagitário): verdade mais profunda, comprometer-se com uma filosofia, sabedoria ≠ informação.",
  "Câncer": "TALENTOS: empatia profunda, cuidado genuíno, nutrir, intuição emocional. ZONA DE CONFORTO: casa, família, memórias, passado. PADRÃO INCONSCIENTE: cuida de todos menos de si; usa o papel de cuidadora para evitar a própria vida; apego ao passado que impede o presente; hipersensível à rejeição. INTEGRAÇÃO (Capricórnio): construir algo de autoria própria, ter ambição, cuidar de si enquanto cuida dos outros.",
  "Leão": "TALENTOS: carisma natural, criatividade espontânea, presença magnética, liderar pelo exemplo. ZONA DE CONFORTO: destaque, reconhecimento, performance, ser o centro. PADRÃO INCONSCIENTE: precisa demais de aprovação; valor depende do que os outros pensam; pode sabotar quem está ao redor para não ser eclipsada; performa em vez de ser. INTEGRAÇÃO (Aquário): servir ao coletivo, grupo acima do ego — brilho verdadeiro ilumina os outros.",
  "Virgem": "TALENTOS: análise precisa, organização, discriminação, habilidade técnica refinada; vê detalhes que outros perdem. ZONA DE CONFORTO: controle, perfeição, refinamento contínuo. PADRÃO INCONSCIENTE: perfeccionismo que paralisa, autocrítica que corrói; ajuda todos porque se sente indigna de ser ajudada; trabalha demais como pagamento de dívida invisível. INTEGRAÇÃO (Peixes): confiar no fluxo, ser imperfeita, receber sem merecer, ter valor além da utilidade.",
  "Libra": "TALENTOS: diplomacia refinada, sensibilidade estética, mediação, charme. ZONA DE CONFORTO: relacionamentos, harmonia, acordo, o belo e agradável; gravita para o que mantém a paz. PADRÃO INCONSCIENTE: perde-se no outro, identidade relacional e não pessoal; evita conflito necessário; concorda discordando porque o amor parece condicional ao acordo. INTEGRAÇÃO (Áries): descobrir quem é sem ninguém para agradar; sua vontade tem valor; seu 'não' é tão sagrado quanto o 'sim'.",
  "Escorpião": "TALENTOS: percepção profunda, investigar, resistência em crises, poder de transformação; sobrevive ao que outros não sobrevivem. ZONA DE CONFORTO: intensidade, profundidade, crises, poder, controle; o ordinário entedia. PADRÃO INCONSCIENTE: cria intensidade desnecessária, desconfia do fácil, sabota relações antes de ser abandonada, acumula rancor e dívidas emocionais. INTEGRAÇÃO (Touro): estabilidade não é tédio, confiança é possível, não precisa ser testada para provar força.",
  "Sagitário": "TALENTOS: otimismo natural, visão filosófica, ensinar, fé genuína; enxerga além do horizonte. ZONA DE CONFORTO: grandes ideias, filosofias, verdades absolutas, o grande quadro. PADRÃO INCONSCIENTE: generaliza e perde o específico; tantas certezas que não aprende; foge do cotidiano nas grandes ideias; promete mais do que entrega. INTEGRAÇÃO (Gêmeos): interessar-se pelos detalhes, ouvir com curiosidade, ser aluno e não só mestre.",
  "Capricórnio": "TALENTOS: disciplina natural, responsabilidade, capacidade estrutural, resistência de longo prazo; sabe construir e persistir. ZONA DE CONFORTO: trabalho, estrutura, controle, resultados mensuráveis; entregar, cumprir, ser confiável. PADRÃO INCONSCIENTE: usa o trabalho para evitar sentir; define valor pelo que produz; severa consigo (e com outros) sem espaço para humanidade; gerencia em vez de se relacionar. INTEGRAÇÃO (Câncer): sentir sem gerenciar, receber cuidado, ser vulnerável, ter família que não é só obrigação.",
  "Aquário": "TALENTOS: pensamento original, visão de futuro, inovar, amor à liberdade; à frente do tempo. ZONA DE CONFORTO: grupos, ideias, causas coletivas, liberdade intelectual; conecta-se pelo intelecto. PADRÃO INCONSCIENTE: distancia-se emocionalmente, racionaliza o que sente, parte de coletivos mas intimamente só, princípios sem conexão. INTEGRAÇÃO (Leão): expressar-se como indivíduo, brilhar como EU, ser íntima, amar uma pessoa concreta — não só a humanidade abstrata.",
  "Peixes": "TALENTOS: compaixão profunda, intuição espiritual, dissolução do ego, fé; sente a unidade de tudo, transcende, perdoa. ZONA DE CONFORTO: espiritualidade, invisível, silêncio, fusão; sabe deixar ir e ser fluida. PADRÃO INCONSCIENTE: usa espiritualidade para escapar da vida concreta; tão fluida que não tem forma própria; perde-se nos outros e chama de amor; confunde dissolução com iluminação. INTEGRAÇÃO (Virgem): discernir, ter limites, ser prática, encarnar, servir com ação concreta."
};

// -------------------------------------------------------------------------------
// CONSTANTE 3 — NODO SUL POR CASA
// -------------------------------------------------------------------------------

const NODO_SUL_CASA = {
  1: "Habilidade natural de ser você mesma, se apresentar, liderar pela presença. Padrão: autocentramento, identidade rígida, dificuldade de se ver pelo olhar do outro. Caminho: a parceria (Casa 7) não ameaça quem você é — completa.",
  2: "Habilidade de acumular, valorizar o tangível, criar segurança material. Padrão: acumulação por medo de escassez, valor medido por posses. Caminho: transformar recursos (Casa 8), partilhar, deixar o velho morrer.",
  3: "Mente ágil, comunicação fácil, curiosidade insaciável. Padrão: superficialidade, racionalização de sentimentos, excesso de informação. Caminho: buscar verdade maior (Casa 9), comprometer-se com uma filosofia.",
  4: "Capacidade de criar lar, cuidar da família, manter raízes. Padrão: apego ao passado, família como identidade, medo de se posicionar publicamente. Caminho: ambição pública própria (Casa 10), construir algo de autoria.",
  5: "Criatividade espontânea, alegria de existir, carisma. Padrão: necessidade de palco, criatividade que não serve ao coletivo, ego criativo inflado. Caminho: servir ao grupo (Casa 11), talentos a serviço de causas maiores.",
  6: "Capacidade de servir, trabalhar, analisar e refinar. Padrão: servilidade, trabalho compulsivo, saúde negligenciada, identidade de 'ajudante'. Caminho: receber cuidado (Casa 12), fazer por compaixão, não por obrigação.",
  7: "Habilidade de se relacionar, ceder, harmonizar, criar parcerias. Padrão: perda de identidade no outro, incapacidade de estar só, codependência. Caminho: ser independente (Casa 1), identidade que não depende de parceiro.",
  8: "Capacidade de transformação, lidar com crises, investigar o profundo. Padrão: manipulação, obsessão com poder, dificuldade de confiar, criação de dramas. Caminho: simplicidade e confiança (Casa 2), construir sem crises.",
  9: "Visão filosófica, otimismo, ensinar e inspirar. Padrão: dogmatismo, fuga do cotidiano nas grandes ideias, promessas sem ação. Caminho: comunicar no detalhe (Casa 3), ser curioso em vez de certo.",
  10: "Liderança pública, disciplina, ambição estruturada. Padrão: trabalho para evitar a vida emocional, autoritarismo, rigidez. Caminho: cuidar (Casa 4), família como prioridade, sentir sem gerenciar.",
  11: "Trabalhar em grupo, servir a causas coletivas, inovar. Padrão: diluição em grupos, identidade coletiva sem individual, distância emocional. Caminho: brilhar como indivíduo (Casa 5), expressão criativa própria.",
  12: "Espiritualidade desenvolvida, compaixão universal, transcender. Padrão: fuga da realidade, dissolução de limites, espiritualidade como escapismo. Caminho: discernimento prático (Casa 6), encarnar, servir concretamente."
};

// -------------------------------------------------------------------------------
// CONSTANTE 4 — NODO NORTE POR SIGNO (a bússola da alma — aprendizado desta vida)
// -------------------------------------------------------------------------------

const NODO_NORTE_SIGNO = {
  "Áries": "APRENDER: CORAGEM PESSOAL AUTÊNTICA. Sua vontade tem valor; existir sem depender de aprovação; egoísmo saudável (cuidar de si) é sobrevivência; a coragem de ser você é seu maior presente. DIFÍCIL porque (NS Libra): pensar em si parece egoísta, conflito parece perigo, independência parece solidão. SE IGNORA: vive em relações onde desaparece, concorda discordando, fica quando deveria ir, vazio que nenhuma relação preenche. SE HONRA: descobre voz, vontade, caminho — e que quem ama de verdade não foge quando você é você. PRÁTICAS: 1 decisão/semana sem consultar ninguém; dizer não a um pedido; começar projeto só seu; dizer 'eu quero' sem justificar.",
  "Touro": "APRENDER: ESTABILIDADE E VALOR PRÓPRIO SUSTENTÁVEL. Estabilidade não é prisão; construção lenta tem valor que a rápida não tem; você vale por existir, não só por transformar. DIFÍCIL (NS Escorpião): estabilidade parece tédio, confiança parece ingenuidade, simplicidade parece superficialidade. SE IGNORA: crises sem fim que consomem sem construir; relações que se destroem e refazem sem evoluir; poder sem paz. SE HONRA: constrói o que dura, lar, segurança real; aprende a confiar. PRÁTICAS: rotina simples por 30 dias; investir no longo prazo; prazer simples sem drama; ficar no presente sem criar crises.",
  "Gêmeos": "APRENDER: CURIOSIDADE, DIÁLOGO E ABERTURA AO DETALHE. Não precisa saber a verdade final; perguntar vale mais que responder; cada conversa revela algo. DIFÍCIL (NS Sagitário): questionar parece fraqueza, ouvir parece perda de tempo, detalhe parece distração. SE IGNORA: ensina mas não aprende, fala mas não escuta, relações unilaterais. SE HONRA: ideias novas chegam, conexões reais se formam. PRÁTICAS: fazer perguntas em vez de respostas por uma semana; escrever algo breve diário; aprender assunto novo sem julgar; conversar com pessoas diferentes.",
  "Câncer": "APRENDER: VULNERABILIDADE, CUIDADO E EMPATIA GENUÍNA. Sentir não é fraqueza; precisar de alguém não é dependência; criar raízes não impede crescer. DIFÍCIL (NS Capricórnio): sentimento parece improdutivo, vulnerabilidade parece risco, família parece obrigação. SE IGNORA: constrói muito sem amor, chega ao topo e pergunta 'para quê?', solidão no sucesso. SE HONRA: forte E vulnerável; sucesso com amor. PRÁTICAS: ligar para quem ama só para dizer; chorar sem analisar; ritual de cuidado com o lar; pedir ajuda no que faria sozinha.",
  "Leão": "APRENDER: EXPRESSÃO INDIVIDUAL E ALEGRIA AUTÊNTICA. Você tem algo único; brilhar não é arrogância; sua expressão serve ao coletivo, não o ameaça. DIFÍCIL (NS Aquário): destaque parece vaidade, brilho parece egoísmo, some como indivíduo. SE IGNORA: serve ao grupo mas não é vista, contribui sem reconhecimento, ressentimento. SE HONRA: ao brilhar com autenticidade, inspira os outros a brilhar. PRÁTICAS: assinar trabalho que faria anônimo; compartilhar criação pessoal; planejar algo só por prazer; dizer 'eu fiz isso' sem minimizar.",
  "Virgem": "APRENDER: DISCERNIMENTO, SERVIÇO CONCRETO E ENCARNAÇÃO. O espiritual se manifesta no concreto; cuidar de um humano específico é sagrado; ser útil no cotidiano é iluminação. DIFÍCIL (NS Peixes): detalhes parecem limites, rotina parece prisão, limites parecem falta de amor. SE IGNORA: flutua entre inspirações sem aterrissar, visão sem prática, ama a humanidade mas não uma pessoa concreta. SE HONRA: grandeza nos detalhes, servir com precisão transforma. PRÁTICAS: rotina simples por 21 dias; algo pequeno por alguém concreto diário; organizar um espaço físico; aprender habilidade prática.",
  "Libra": "APRENDER: PARCERIA, EQUILÍBRIO E COLABORAÇÃO. Dois supera um; ceder não é fraqueza, é inteligência; harmonia é sabedoria, não superficialidade. DIFÍCIL (NS Áries): parceria parece limite, ceder parece perder, negociar parece lentidão. SE IGNORA: chega longe mas sozinha, conquista sem com quem compartilhar, relações que não sobrevivem à necessidade de controle. SE HONRA: a parceria certa multiplica quem você é; o outro soma. PRÁTICAS: negociar o que decidiria sozinha; pedir opinião e considerar de verdade; fortalecer uma parceria; conceder sem ressentimento.",
  "Escorpião": "APRENDER: TRANSFORMAÇÃO, PROFUNDIDADE E PODER VERDADEIRO. Profundidade liberta, não assusta; verdade difícil vale mais que conforto superficial; transformação radical é possível e necessária. DIFÍCIL (NS Touro): profundidade parece perigo, transformação parece destruição, perder controle parece catástrofe. SE IGNORA: estabilidade que entorpece, segurança que aprisiona, evita mudanças até virarem crises. SE HONRA: descobre recursos que não sabia ter, poder real independente das circunstâncias. PRÁTICAS: terapia profunda; enfrentar verdade evitada; transformação de raiz (não maquiagem); liberar ressentimento antigo.",
  "Sagitário": "APRENDER: EXPANSÃO, FÉ E VISÃO ALÉM DO HORIZONTE. Existem verdades maiores que os fatos; fé é coragem de avançar sem todas as informações; a vida tem sentido além do que a mente mapeia. DIFÍCIL (NS Gêmeos): filosofia parece vaga, fé parece irracional, expansão parece imprecisão. SE IGNORA: sabe muito de tudo e nada de nada, informação sem sabedoria, conexões sem profundidade. SE HONRA: encontra o fio que conecta tudo, o desconhecido deixa de ser ameaça. PRÁTICAS: viajar para o muito diferente; estudar uma filosofia/espiritualidade sem julgar; viver por uma verdade 3 meses; ter opinião forte sobre algo importante.",
  "Capricórnio": "APRENDER: ESTRUTURA, AUTORIDADE PRÓPRIA E LEGADO. Pode ser carinhosa E estruturada; responsabilidade é a forma de deixar marca; construir o duradouro exige sacrifício que vale. DIFÍCIL (NS Câncer): estrutura parece fria, disciplina parece punição, ambição parece abandono da família. SE IGNORA: cuida de todos mas não constrói nada de si, amor sem direção. SE HONRA: cuidar e construir ao mesmo tempo; o legado é a forma mais amorosa de cuidar. PRÁTICAS: objetivo profissional de 5 anos; rotina de trabalho disciplinada 60 dias; dizer não a um compromisso emocional para honrar o trabalho; assumir liderança evitada.",
  "Aquário": "APRENDER: CONTRIBUIÇÃO COLETIVA E PENSAMENTO ORIGINAL. Seu propósito é maior que você; originalidade é serviço, não excentricidade; pertencer a algo maior não apaga quem você é. DIFÍCIL (NS Leão): grupo parece diluição, coletivo parece ameaça, comunidade parece limite. SE IGNORA: brilha mas não alimenta, é visto mas não conectado, sua luz ilumina só você. SE HONRA: originalidade a serviço do coletivo multiplica o impacto. PRÁTICAS: juntar-se a grupo com propósito; contribuir com o que beneficia muitos; pensamento inovador que desafia o status quo; rede de pessoas diferentes.",
  "Peixes": "APRENDER: COMPAIXÃO, FÉ E RENDIÇÃO CONSCIENTE. Não dá para controlar tudo; render-se é o ato mais corajoso; existe algo maior que sua análise, e confiar nele é evolução. DIFÍCIL (NS Virgem): fé parece imprecisão, compaixão parece ineficiência, transcendência parece escapismo. SE IGNORA: analisa até o fim e não se move, refina sem entregar, ajuda por obrigação. SE HONRA: ao parar de controlar, a vida flui de formas que a análise nunca encontraria. PRÁTICAS: meditar 10 min/dia por 30 dias; algo por alguém sem esperar resultado; permitir-se não saber; perdão ativo."
};

// -------------------------------------------------------------------------------
// CONSTANTE 5 — NODO NORTE POR CASA (o convite evolutivo)
// -------------------------------------------------------------------------------

const NODO_NORTE_CASA = {
  1: "Descobrir quem você é independentemente do outro; liderar pela presença, ocupar espaço. Convite: 'Descubra sua identidade. Ela existe. Ela importa.'",
  2: "Construir segurança real (financeira, emocional, corporal); pode ter, merece ter, construção lenta é sagrada. Convite: 'Invista em você. Seus recursos expressam seu valor.'",
  3: "Comunicação autêntica e curiosidade genuína; escutar, perguntar, interessar-se pelo detalhe. Convite: 'Sua voz cotidiana tem valor. Diga o que pensa. Pergunte o que não sabe.'",
  4: "Criar raízes, cuidar do lar, honrar a ancestralidade; pode ser pública E ter vida privada rica. Convite: 'Invista no que é seu, íntimo, sem plateia.'",
  5: "Criatividade, expressão pessoal, alegria; criar por prazer é tão sagrado quanto por propósito. Convite: 'Brinque. Crie. Ame. A vida não é só produção.'",
  6: "Serviço cotidiano, rotina sagrada, cuidado do corpo; o espiritual se manifesta na ação concreta. Convite: 'Encarne. Sirva na prática. Seu corpo é seu templo.'",
  7: "Parceria e o espelho do outro; dois pode ser mais que um. Convite: 'Abra-se à parceria real. Deixe o outro te ver.'",
  8: "Transformação profunda, enfrentar o oculto; o que você teme em si é onde está seu poder. Convite: 'Vá fundo. O escuro em você não é perdição — é ouro.'",
  9: "Expansão filosófica, espiritual e geográfica; há mundos além do que você conhece. Convite: 'Saia do familiar. Seu horizonte é maior do que pensa.'",
  10: "Carreira pública, autoridade, legado; você tem algo a oferecer ao mundo. Convite: 'Apareça. Sua presença pública tem propósito.'",
  11: "Comunidade, amizades significativas, projetos coletivos; seu propósito é maior que você. Convite: 'Junte-se. Colabore. Seu sonho se completa no coletivo.'",
  12: "Espiritualidade, rendição, serviço desinteressado; o invisível é tão real quanto o visível. Convite: 'Silencie. Ore. Sirva sem precisar de resultado.'"
};

// -------------------------------------------------------------------------------
// CONSTANTE 6 — PLUTÃO POR CASA (morte e renascimento)
// -------------------------------------------------------------------------------

const PLUTAO_KARMICO_CASA = {
  1: "Morre: identidade falsa, máscara social. Nasce: você autêntica, sem performance. Ciclo: reinvenção drástica em algum momento — inevitável.",
  2: "Morre: relação doentia com dinheiro (escassez ou excesso compulsivo). Nasce: relação de poder com recursos. Ciclo: perdas e ganhos drásticos ensinando o valor real.",
  3: "Morre: forma de pensar/comunicar que limita. Nasce: mente transformadora, palavra que cura. Ciclo: algo dito (ou não dito) gerou consequências profundas.",
  4: "Morre: dinâmica familiar tóxica, padrão ancestral. Nasce: família escolhida, raízes conscientes. Ciclo: família como campo de transformação profunda.",
  5: "Morre: criatividade reprimida, expressão bloqueada. Nasce: criatividade que transforma, amor que liberta. Ciclo: relação ou projeto criativo que transforma a identidade.",
  6: "Morre: trabalho que adoece, rotina que prende. Nasce: serviço que transforma, saúde como prioridade. Ciclo: crise de saúde/trabalho que força reconstrução total.",
  7: "Morre: parceiro que não serve, padrão tóxico. Nasce: parceria de poder real, amor que liberta. Ciclo: relações intensas e transformadoras.",
  8: "Plutão em casa própria: transformação máxima, poder absoluto. Morre: tudo que impede o renascimento. Ciclo: morte e renascimento simbólico (ou literal) em algum ponto.",
  9: "Morre: crença rígida, dogma que aprisiona. Nasce: filosofia pessoal, fé baseada em experiência. Ciclo: crise de fé que abre espiritualidade mais profunda.",
  10: "Morre: carreira que não é sua, persona falsa. Nasce: autoridade autêntica, poder profissional genuíno. Ciclo: colapso ou transformação radical de carreira.",
  11: "Morre: grupo que não serve, amizades baseadas em medo. Nasce: comunidade de transformação, causa que move. Ciclo: traição/ruptura de grupo que liberta.",
  12: "Morre: padrão inconsciente central. Nasce: acesso ao poder espiritual mais profundo. Ciclo: encontro com o que estava oculto (e é o mais poderoso)."
};

// -------------------------------------------------------------------------------
// CONSTANTE 7 — SATURNO POR SIGNO (a lição kármica)
// -------------------------------------------------------------------------------

const SATURNO_KARMICO_SIGNO = {
  "Áries": "Lição: agir com responsabilidade, não por impulso. Padrão: impulso sem estrutura que gera consequências.",
  "Touro": "Lição: construir segurança sem acumular por medo. Padrão: relação de escassez ou excesso com recursos.",
  "Gêmeos": "Lição: comunicar com profundidade e comprometimento. Padrão: comunicação superficial que nunca vai fundo.",
  "Câncer": "Lição: receber cuidado sem vergonha, cuidar sem se perder. Padrão: família como fonte de medo, não de amparo.",
  "Leão": "Lição: autoconfiança real, não performance. Padrão: busca de aprovação que nunca satisfaz.",
  "Virgem": "Lição: servir com alegria, não com obrigação. Padrão: perfeccionismo que paralisa, autocrítica que corrói.",
  "Libra": "Saturno em exaltação — lição de equilíbrio e justiça. Lição: parcerias reais, com reciprocidade. Padrão: relações desequilibradas por medo de conflito.",
  "Escorpião": "Lição: transformar sem destruir, ter poder sem precisar de controle. Padrão: uso de poder para manter segurança emocional.",
  "Sagitário": "Lição: comprometer-se com uma verdade, cumprir promessas. Padrão: expansão sem fundação, promessa sem entrega.",
  "Capricórnio": "Saturno em domicílio — lição máxima de responsabilidade. Lição: construir legado com integridade. Padrão: ambição que perde o humano no caminho.",
  "Aquário": "Saturno em domicílio — responsabilidade coletiva. Lição: liderar o grupo com sabedoria, não só inovar. Padrão: genialidade sem comprometimento.",
  "Peixes": "Lição: fé com discernimento, servir com limites. Padrão: vitimização ou dissolução de limites como recorrência."
};

// -------------------------------------------------------------------------------
// CONSTANTE 8 — QUÍRON POR SIGNO (ferida e maestria)
// -------------------------------------------------------------------------------

const QUIRON_SIGNO = {
  "Áries": "Ferida: 'Não sou capaz de existir plenamente. Preciso pedir permissão para ser.' Dom: ensina coragem autêntica e existência plena.",
  "Touro": "Ferida: 'Nunca tenho o suficiente. Não mereço conforto e prazer.' Dom: ensina valor intrínseco e segurança real.",
  "Gêmeos": "Ferida: 'Não sou inteligente. Minha voz não tem valor.' Dom: ensina comunicação como cura.",
  "Câncer": "Ferida: 'Não fui cuidada como precisava. Não sou segura.' Dom: torna-se o cuidador que não teve.",
  "Leão": "Ferida: 'Não sou especial. Não tenho direito de brilhar.' Dom: ensina expressão autêntica e valor pessoal.",
  "Virgem": "Ferida: 'Nunca sou boa o suficiente. Tenho que me justificar para existir.' Dom: ensina serviço com alegria e direito à imperfeição.",
  "Libra": "Ferida: 'Não sou amável como sou. Preciso me adaptar para ser aceita.' Dom: ensina harmonia autêntica e amor incondicional.",
  "Escorpião": "Ferida: 'Não é seguro ser profunda. Intimidade traz dor.' Dom: guia outros pela transformação porque sobreviveu à sua.",
  "Sagitário": "Ferida: 'Não sei para onde ir. Não confio na vida. Não tenho fé.' Dom: torna-se guia espiritual de quem perdeu a direção.",
  "Capricórnio": "Ferida: 'Não tenho autoridade real. Ninguém me leva a sério.' Dom: ensina autoridade legítima conquistada.",
  "Aquário": "Ferida: 'Sou diferente demais para pertencer. Sou estranha.' Dom: ensina originalidade como força, não isolamento.",
  "Peixes": "Ferida: 'Sou sensível demais para este mundo. Não sei onde começo e o outro termina.' Dom: ensina compaixão com limites e espiritualidade encarnada."
};

// -------------------------------------------------------------------------------
// CONSTANTE 9 — LILITH POR SIGNO (poder reprimido)
// -------------------------------------------------------------------------------

const LILITH_KARMICO_SIGNO = {
  "Áries": "Reprimido: raiva, iniciativa, direito de liderar. Emerge: explosões, agressividade ou passividade total. Integrar: raiva como informação e ação, não explosão nem supressão.",
  "Touro": "Reprimido: prazer, corpo, direito ao conforto. Integrar: desfrutar sem culpa nem excesso.",
  "Gêmeos": "Reprimido: curiosidade, multiplicidade, direito de mudar de ideia. Integrar: comunicação que não precisa ser consistente para ser válida.",
  "Câncer": "Reprimido: necessidade de cuidado, vulnerabilidade. Integrar: receber sem vergonha, pedir sem se diminuir.",
  "Leão": "Reprimido: brilho, grandeza, necessidade de ser vista. Integrar: visibilidade como contribuição, não vaidade.",
  "Virgem": "Reprimido: análise crítica, discernimento, o 'não'. Integrar: crítica construtiva sem autocrítica destrutiva.",
  "Libra": "Reprimido: necessidades nas relações, o 'não' no amor. Integrar: amor que inclui os próprios limites.",
  "Escorpião": "Reprimido: poder, sexualidade, intensidade. Integrar: intensidade direcionada, não suprimida.",
  "Sagitário": "Reprimido: fé própria, convicções, expansão. Integrar: ter filosofia própria sem precisar de aprovação.",
  "Capricórnio": "Reprimido: ambição, poder institucional, autoridade. Integrar: ambição sem culpa, liderança sem desculpa.",
  "Aquário": "Reprimido: originalidade radical, rebeldia, futuro. Integrar: ser diferente como ato político e evolutivo.",
  "Peixes": "Reprimido: misticidade, intuição, acesso ao invisível. Integrar: espiritualidade como poder, não como fuga."
};

// -------------------------------------------------------------------------------
// CONSTANTE 10 — CASAS KÁRMICAS (IV, VIII, XII)
// -------------------------------------------------------------------------------

const CASAS_KARMICAS = `
## CASA IV — PADRÕES FAMILIARES E ANCESTRAIS (raiz; onde a família vive dentro de você)
Analisar signo da cúspide, planetas dentro, regente e sua posição. Padrão por signo na Casa 4:
Áries: família de conflito/independência forçada → aprender a pertencer.
Touro: família material/apego à tradição → aprender a transformar.
Gêmeos: comunicação superficial → aprender profundidade emocional.
Câncer: família emocional intensa → aprender limites saudáveis.
Leão: performance e orgulho → aprender autenticidade privada.
Virgem: crítica e exigência → aprender autocompaixão.
Libra: fachada harmoniosa → aprender conflito saudável.
Escorpião: segredos e poder → aprender transparência.
Sagitário: ausência e expansão → aprender presença.
Capricórnio: obrigação e rigidez → aprender amor sem condições.
Aquário: não-convencional ou distante → aprender pertencimento.
Peixes: confusão e sacrifício → aprender limites e clareza.

## CASA VIII — MORTE, RENASCIMENTO, TRANSFORMAÇÃO (ir ao fundo para emergir diferente)
Planetas na Casa 8 indicam onde houve (e haverá) morte e renascimento simbólicos.
Sol: identidade em transformações radicais. Lua: vida emocional intensa/transformadora.
Marte: ação transformadora, corte radical. Júpiter: transformação traz expansão/herança.
Saturno: transformação lenta e difícil, mas de legado. Plutão (domicílio): transformação máxima e inevitável.

## CASA XII — KARMA OCULTO E AUTO-SABOTAGEM (abaixo da consciência; "inimigos ocultos" = partes não reconhecidas de si)
Planetas na Casa 12 agem ATRAVÉS de você sem que perceba.
Sol: subestima o próprio brilho (luz escondida). Lua: emoções não sentidas conscientemente que influenciam tudo.
Mercúrio: pensamentos não articulados que determinam escolhas. Vênus: desejos reprimidos que emergem inesperados.
Marte: raiva não expressa que corrói por dentro. Júpiter: proteção que age sem você perceber.
Saturno: medo profundo que estrutura a vida sem ser visto. Plutão: poder de transformação latente, ainda não despertado.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 11 — PADRÕES TRANSGERACIONAIS + RELACIONAMENTOS + MISSÃO
// -------------------------------------------------------------------------------

const PADROES_E_MISSAO = `
## PADRÕES TRANSGERACIONAIS (transmitidos por modelagem inconsciente, não genética)
Sinais no mapa: Lua em Casa 4 ou aspecto com Saturno (padrão materno); Saturno em Casa 4/10 (padrão paterno);
Plutão em Casa 4 (transformação de padrão familiar profundo); Nodo Sul em Casa 4 (família como zona de conforto);
Casa 4 muito habitada (família como tema central do karma).
OS 7 PADRÕES MAIS COMUNS:
1 ESCASSEZ ("nunca é suficiente") — Saturno C2 ou aspecto difícil com Vênus → consciência de abundância presente.
2 AMOR CONDICIONAL ("só sou amada quando mereço") — Lua difícil com Saturno → amor incondicional (terapia, comunidade).
3 SILÊNCIO E SEGREDO ("certas verdades não se dizem") — Mercúrio C12 ou Plutão C3 → verbalizar o não-dito.
4 RIGIDEZ E CONTROLE ("controle é sobrevivência") — Saturno com Lua ou Plutão C1 → rendição consciente, meditação.
5 VITIMIZAÇÃO ("não tenho poder") — Netuno C1 ou Saturno com Sol → ações onde o resultado depende só de você.
6 HIPERRESPONSABILIDADE ("sou responsável por todos") — Lua com Saturno, Vênus C12, NS Câncer → deixar os outros assumirem.
7 ABANDONO E TRAIÇÃO ("quem amo me abandona") — Saturno/Plutão C7, Lilith com Lua → segurança interna, terapia de apego.

## RELACIONAMENTOS KÁRMICOS (relação que veio ensinar algo)
Sinais de relação kármica: atração intensa imediata; padrões que se repetem; gatilhos profundos; difícil de sair mesmo doendo; transformação inevitável após o fim.
No mapa: sobreposição de Nodos; Saturno de um com Sol/Lua do outro; Plutão de um com Vênus do outro; Casa 8 habitada; Nodo Sul em Casa 7.
4 TIPOS: ESPELHO (oposições — o que critica no outro é o que falta integrar); PROFESSOR (Saturno de um sobre pessoais do outro — a dor é o aprendizado pedido); ALMA GÊMEA EVOLUTIVA (Nodos complementares — apoia o Nodo Norte); PADRÃO REPETIDO (o padrão já está no mapa natal — o problema é interno, não o outro).

## MISSÃO DE ALMA (qualidade de presença que serve ao mundo — não profissão)
Síntese de: Nodo Norte (direção) + Sol (essência) + Saturno (lição que vira dom) + Quíron (ferida que vira maestria) + MC (manifestação).
FÓRMULA: "Você veio para [Nodo Norte] usando o dom de [Quíron integrado] a fim de [MC]."
`;

// -------------------------------------------------------------------------------
// CONSTANTE 12 — ESTRUTURA DO RELATÓRIO + UPSELL (individual)
// -------------------------------------------------------------------------------

const ESTRUTURA_KARMICO = `
## ESTRUTURA DO RELATÓRIO (seções)
1. Carta ao cliente (acolhe antes de revelar; "você não está aqui por acaso") ~300 palavras
2. O que é karma para ESTE cliente (não genérico) ~400
3. NODO SUL — de onde você vem (talentos, zona de conforto, padrão inconsciente, maestria que virou prisão) mín. 700
4. NODO NORTE — para onde você evolui (aprendizado, por que é difícil, se ignora, se honra, práticas) mín. 800
5. Integração — o caminho entre os dois Nodos (4 fases + onde está agora + próximos passos) ~400
6. A SERPENTE KÁRMICA — o ciclo central (identificação, como se manifesta, ponto de virada) ~600
7. Seu SAMSARA específico (o ciclo que repete, o gatilho, o ponto de interrupção) ~500
8. PLUTÃO — morte e renascimento (o que se transforma, por que a resistência dói, o que nasce) ~600
9. SATURNO — a lição (o que cobra, por que parece injusto, a estrutura que nasce) ~500
10. QUÍRON — ferida sagrada (a ferida, como se manifesta, o dom que contém, caminho de maestria) ~500
11. LILITH — poder reprimido (o que foi silenciado, como emerge, como integrar) ~400
12. PADRÕES TRANSGERACIONAIS (o herdado, padrão materno e paterno, como quebrar cada um) ~700
13. PADRÕES EM RELACIONAMENTOS (seu padrão no amor, por que atrai o que atrai, como evoluir) ~500
14. CASAS KÁRMICAS — IV, VIII, XII ~500
15. MISSÃO DE ALMA (por que está aqui, contribuição única, como honrar no cotidiano) ~400
16. PRÁTICAS DE LIBERTAÇÃO (5-7 ESPECÍFICAS para este mapa) ~500
17. AFIRMAÇÕES PERSONALIZADAS (10, baseadas nestes nodos, este Plutão, este Quíron) ~200
18. PRÓXIMOS 3 MESES (o que fazer, em que ordem, como verificar avanço) ~300
19. MENSAGEM FINAL (não veio para sofrer, veio para se libertar; padrões não são identidade; mapa não é sentença) ~300
20. PRÓXIMOS PASSOS ASTRALIA (upsell individual)

## TOM E REGRAS ABSOLUTAS
Nome do cliente em todo o documento. Cada padrão TEM saída clara. Nunca culpabiliza, sempre empodera. Cada seção nos dados reais (não genérico). Linguagem profunda mas acessível, filosófica mas prática. Tom: conversa sincera com alguém que acredita em você. Nunca catastrófico. Mínimo 10.000 palavras.

## UPSELL (individual — NÃO combo; surge como conselho genuíno, no gancho real)
- Mapa Profissional: quando há conflito entre vocação e padrão kármico.
- Revolução Solar: quando há ciclo de transformação em curso (dimensão anual/timing).
- Previsões 18 Meses: quando há transição/crise (janelas de mudança).
- Mapa da Lilith: quando Lilith forte ou temas de poder/autenticidade dominam.
- Sinastria: quando padrões de relacionamento são centrais.
- Mapa Astral Personalizado: quando o cliente é novo e o Kármico abriu mais perguntas que respostas.
Oferecer 1-2 mais relevantes ao que o mapa revelou.
`;

// -------------------------------------------------------------------------------
// FUNÇÃO BUILD
// -------------------------------------------------------------------------------
// dados: { nome, dataNascimento, horaNascimento, localNascimento, contexto? }
// mapaNatal: { "Nodo Norte":{signo,casa,grau}, "Plutão":..., "Saturno":..., "Quíron":...,
//   "Lilith":..., Lua, Sol, Vênus, Marte, Mercúrio, Netuno, MC, ASC,
//   cuspideCasa4, cuspideCasa8, cuspideCasa12 }  (Nodo Sul é calculado se ausente)
// aspectos: [{ planeta1, aspecto, planeta2, orbe }]

function buildPromptMapaKarmico(dados, mapaNatal, aspectos = []) {
  const nome = dados.nome || '[NOME]';
  const analise = analisarKarma(mapaNatal, aspectos);
  const ns = analise.nodoSulCalculado;
  const nn = mapaNatal["Nodo Norte"] || null;
  const t = analise.tabelaOverlay;

  const blocoDados = `Nodo Norte: ${t.nodoNorte} | Nodo Sul: ${t.nodoSul}
Plutão: ${t.plutao} | Saturno: ${t.saturno} | Quíron: ${t.quiron} | Lilith: ${t.lilith} | Lua: ${t.lua}
Casa IV: cúspide ${t.casaIV.cuspide||'?'}, ocupantes [${t.casaIV.ocupantes.join(', ')||'vazia'}], regente ${t.casaIV.regente?t.casaIV.regente.tradicional:'?'}
Casa VIII: cúspide ${t.casaVIII.cuspide||'?'}, ocupantes [${t.casaVIII.ocupantes.join(', ')||'vazia'}]
Casa XII: cúspide ${t.casaXII.cuspide||'?'}, ocupantes [${t.casaXII.ocupantes.join(', ')||'vazia'}]`;

  const blocoSerpente = analise.serpente.length ? analise.serpente.map(s=>`  - ${s}`).join("\n") : "  - (forneça aspectos para detecção automática)";
  const blocoPadroes = analise.padroesTransgeracionais.length
    ? analise.padroesTransgeracionais.map(p=>`  - ${p.nome}: ${p.lema} Quebrar: ${p.quebrar}`).join("\n")
    : "  - (nenhum sinal automático detectado nos aspectos fornecidos — investigar manualmente)";

  const todosPlanetas = Object.entries(mapaNatal)
    .filter(([k,v]) => v && typeof v === 'object' && SIGNOS_ORDEM.includes(v.signo))
    .map(([p,d]) => `  - ${p}: ${d.signo} ${d.grau ?? '?'}°${d.retrogrado ? ' ℞' : ''} (Casa ${d.casa ?? '?'})`).join("\n");

  const prompt = `Você é um astrólogo com 30 anos de experiência em astrologia evolutiva e kármica, com formação em psicologia transpessoal e base em filosofias orientais (karma, samsara, dharma). Combina rigor técnico com compaixão genuína. Cliente: ${nome}.
OBJETIVO: revelar padrões com precisão técnica; oferecer caminhos de libertação genuínos; NUNCA culpabilizar, sempre empoderar; linguagem profunda mas acessível; honesto sobre desafios sem ser catastrófico.
Comprimento: 10.000-15.000 palavras.

# DADOS DA CLIENTE
Nome: ${nome} | Nascimento: ${dados.dataNascimento||'[DATA]'}, ${dados.horaNascimento||'[HORA]'}, ${dados.localNascimento||'[LOCAL]'}
${dados.contexto ? `Contexto trazido pela cliente: ${dados.contexto}` : 'Contexto da cliente: (não fornecido)'}

# MAPA NATAL
${todosPlanetas}
  - MC: ${mapaNatal.MC ? (mapaNatal.MC.signo+' '+(mapaNatal.MC.grau||'')) : '?'} | ASC: ${mapaNatal.ASC || '?'}

# TABELA DE OVERLAY KÁRMICA (já calculada — use como base)
${blocoDados}

# SINAIS DA SERPENTE KÁRMICA (detectados automaticamente)
${blocoSerpente}

# PADRÕES TRANSGERACIONAIS COM SINAL NO MAPA (detectados automaticamente)
${blocoPadroes}

# ASPECTOS KÁRMICOS (orbe ≤5°)
${aspectos.length ? aspectos.map(a=>`  - ${a.planeta1} ${a.aspecto} ${a.planeta2} (orbe ${a.orbe ?? '?'}°)`).join("\n") : "(não fornecidos — leitura por signo/casa)"}

${FUNDAMENTOS_KARMICOS}

## NODO SUL POR SIGNO (use o desta cliente: ${ns?ns.signo:'?'})
${Object.entries(NODO_SUL_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n\n")}

## NODO SUL POR CASA (use a desta cliente: Casa ${ns?ns.casa:'?'})
${Object.entries(NODO_SUL_CASA).map(([c,txt])=>`Casa ${c}: ${txt}`).join("\n")}

## NODO NORTE POR SIGNO (use o desta cliente: ${nn?nn.signo:'?'})
${Object.entries(NODO_NORTE_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n\n")}

## NODO NORTE POR CASA (use a desta cliente: Casa ${nn?nn.casa:'?'})
${Object.entries(NODO_NORTE_CASA).map(([c,txt])=>`Casa ${c}: ${txt}`).join("\n")}

## PLUTÃO POR CASA
${Object.entries(PLUTAO_KARMICO_CASA).map(([c,txt])=>`Casa ${c}: ${txt}`).join("\n")}

## SATURNO POR SIGNO
${Object.entries(SATURNO_KARMICO_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n")}

## QUÍRON POR SIGNO
${Object.entries(QUIRON_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n")}

## LILITH POR SIGNO
${Object.entries(LILITH_KARMICO_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n")}

${CASAS_KARMICAS}
${PADROES_E_MISSAO}
${ESTRUTURA_KARMICO}

# FORMATO DE SAÍDA (OBRIGATÓRIO)
Responda EXCLUSIVAMENTE com JSON válido, sem texto antes/depois, sem markdown:
{ "secoes": [ { "numero": 1, "titulo": "Carta ao Cliente", "texto": "..." } ] }
REGRAS: aspas duplas; escape quebras como \\n e aspas internas como \\"; sem blocos de código; "numero" exato (1-20); "texto" em PROSA profunda corrida (segunda pessoa), respeitando os mínimos de palavras por seção.

# LEMBRETES
1. Use o nome ${nome} em todo o documento
2. Nodo Sul e Norte com tratamento profundo (mín. 700 e 800 palavras)
3. Identifique a Serpente Kármica e nomeie pelo menos 3 samsaras (ciclos) específicos
4. Cada padrão TEM saída prática — nunca culpabilize, sempre empodere
5. Padrões transgeracionais: nomeie o materno e o paterno
6. Práticas e afirmações ESPECÍFICAS para este mapa (não genéricas)
7. Tom: profundo, esperançoso, jamais catastrófico
8. Pelo menos 1-2 chamadas para outro mapa Astralia (individual, no gancho real) — sem combo
9. Mínimo 10.000 palavras

Gere agora o Mapa Kármico completo (seções 1-20). Retorne apenas o JSON.`;

  return {
    diagnostico: {
      cliente: nome,
      nodoNorte: t.nodoNorte,
      nodoSul: t.nodoSul,
      serpente: analise.serpente,
      padroesTransgeracionais: analise.padroesTransgeracionais.map(p=>p.nome),
      casaIV: t.casaIV, casaVIII: t.casaVIII, casaXII: t.casaXII
    },
    prompt,
    metadados: {
      framework: "Mapa Kármico — Nodos + Plutão + Saturno + Quíron + Lilith + Casas IV/VIII/XII + Serpente + 7 padrões transgeracionais",
      modeloRecomendado: "claude-opus-4-7",
      palavrasEsperadas: "10.000-15.000",
      tipo: "premium_assincrono_48h",
      saida: "JSON estruturado por seções (renderização de PDF é camada separada)",
      versao: "1.0"
    }
  };
}

module.exports = {
  buildPromptMapaKarmico,
  analisarKarma, calcularNodoSul, casaOposta, ocupantesCasa, regenteCasa,
  detectarSerpente, detectarPadroesTransgeracionais,
  FUNDAMENTOS_KARMICOS, NODO_SUL_SIGNO, NODO_SUL_CASA, NODO_NORTE_SIGNO, NODO_NORTE_CASA,
  PLUTAO_KARMICO_CASA, SATURNO_KARMICO_SIGNO, QUIRON_SIGNO, LILITH_KARMICO_SIGNO,
  CASAS_KARMICAS, PADROES_E_MISSAO, ESTRUTURA_KARMICO, SIGNO_OPOSTO
};
