/**
 * PROMPT COMPILADO: MAPA DE PREVISÕES (18 MESES)
 * 
 * Este arquivo:
 * 1. Recebe dados do cliente (mapa natal + trânsitos)
 * 2. Aplica Framework Adaptativo (análise tema + tensão + profundidade)
 * 3. Monta um PROMPT para Claude Haiku gerar a leitura
 * 4. Retorna { prompt, diagnostico, metadados }
 */

const SIGNIFICADOS_PLANETAS = {
  Sol: "identidade, vontade, propósito, ego",
  Lua: "emoções, instinto, padrões, memória, mãe",
  Mercúrio: "comunicação, pensamento, decisões, aprendizado",
  Vênus: "valores, afeto, relacionamentos, dinheiro, sensualidade",
  Marte: "ação, coragem, agressividade, sexualidade, conflito, vontade",
  Júpiter: "expansão, abundância, fé, otimismo, oportunidades, crescimento",
  Saturno: "limites, estrutura, maturação, responsabilidade, tempo",
  Urano: "ruptura, revolução, inovação, liberdade, imprevisto",
  Netuno: "dissolução, ilusão, espiritualidade, criatividade, confusão",
  Plutão: "morte, transformação, poder, sexualidade, controle, ressurreição",
  Lilith: "rejeição, autenticidade, o que não se submete, selvageria",
  "Nodo Norte": "destino, o que precisa desenvolver, futuro",
  "Nodo Sul": "padrão do passado, talento, o que precisa soltar"
};

const SIGNIFICADOS_CASAS = {
  1: "identidade, corpo, personalidade, primeira impressão",
  2: "recursos próprios, valores, posses, autossustentação",
  3: "comunicação, irmãos, aprendizado, viagens curtas, vizinhos",
  4: "família, lar, raízes, propriedade, base emocional, pai/mãe",
  5: "criatividade, romance, lazer, filhos, risco, prazer",
  6: "saúde, rotina, trabalho diário, hábitos, animais de estimação",
  7: "relacionamentos, casamento, parcerias, contrato, juiz",
  8: "recursos compartilhados, transformação, morte, herança, sexualidade, investigação",
  9: "filosofia, religião, ensino, viagens longas, expansão mental",
  10: "carreira, reputação, propósito público, autoridade, reconhecimento",
  11: "amigos, comunidade, projetos, causa, esperança, rede",
  12: "inconsciente, isolamento, espiritualidade, karmas, inimigos ocultos"
};

const CATEGORIAS_OBRIGATORIAS = [
  "dinheiro",
  "relacionamento",
  "saude",
  "trabalho",
  "familia"
];

const EMOJIS_CATEGORIAS = {
  dinheiro: "💰",
  relacionamento: "💑",
  saude: "🏥",
  trabalho: "💼",
  familia: "👨‍👩‍👧"
};

/**
 * FUNÇÃO PRINCIPAL: Analisar mapa e retornar prompt + diagnóstico
 * Entrada: { mapaNatal, transitos, periodoDias, cliente }
 * Saída: { diagnostico, prompt, metadados }
 */
function construirPrevisoes(dados) {
  const { mapaNatal, transitos, cliente } = dados;

  // PASSO 1: ANÁLISE DO MAPA
  const analise = analisarMapaTransitos(mapaNatal, transitos);

  // PASSO 2: CONSTRUIR PROMPT PARA CLAUDE
  const prompt = estruturarPromptParaClaude(analise, mapaNatal, transitos, cliente);

  // PASSO 3: RETORNAR COM DIAGNÓSTICO
  return {
    diagnostico: {
      cliente: cliente.nome,
      dataNascimento: `${cliente.dataNascimento}, ${cliente.horaNascimento}, ${cliente.localNascimento}`,
      temaDominante: analise.temaDominante,
      pontoTensao: analise.pontoTensao.descricao,
      pontoTensaoTema: analise.pontoTensao.tema,
      casaMaisAtiva: analise.casaMaisAtiva,
      profundidadeDefinida: analise.profundidadeDefinida,
      aspectosMaiores: analise.aspectosMaiores.length,
      aspectosSecundarios: analise.aspectosSecundarios.length
    },
    prompt: prompt,
    metadados: {
      framework: "Análise Adaptativa com Framework Integrado",
      modeloRecomendado: "claude-opus-4-7",
      palavrasEsperadas: "10.000-14.000",
      tipo: "premium_assincrono_48h",
      saida: "JSON estruturado por seções (renderização de PDF é camada separada)",
      versao: "2.0",
      dataGeracao: new Date().toISOString(),
      instrucaoProxy: "Enviar este prompt para Claude Opus via batch 48h com modelo claude-opus-4-7"
    }
  };
}

/**
 * PASSO 1: ANÁLISE DO MAPA
 * Mapear aspectos, contar por Casa, identificar tema e tensão
 */
function analisarMapaTransitos(mapaNatal, transitos) {
  // Ordena aspectos por orbe
  const aspectosMaiores = transitos.filter(a => a.orbe < 1.0).sort((a, b) => a.orbe - b.orbe);
  const aspectosSecundarios = transitos.filter(a => a.orbe >= 1.0 && a.orbe <= 2.0);
  const aspectosAuxiliares = transitos.filter(a => a.orbe > 2.0 && ehPontoSensivel(a, mapaNatal));

  // Conta quantos aspectos tocam cada Casa
  const contagemCasas = {};
  transitos.forEach(aspecto => {
    const casaNatal1 = obterCasaPlaneta(aspecto.planeta1, mapaNatal);
    const casaNatal2 = obterCasaPlaneta(aspecto.planeta2, mapaNatal);

    contagemCasas[casaNatal1] = (contagemCasas[casaNatal1] || 0) + 1;
    if (casaNatal2 && casaNatal2 !== casaNatal1) {
      contagemCasas[casaNatal2] = (contagemCasas[casaNatal2] || 0) + 1;
    }
  });

  // Identifica Casa mais ativa
  const casaMaisAtiva = Object.keys(contagemCasas).reduce((a, b) =>
    contagemCasas[a] > contagemCasas[b] ? a : b, "1"
  );

  // Define tema conforme Casa
  const temaDominante = definirTema(parseInt(casaMaisAtiva), contagemCasas);

  // Identifica ponto de tensão (quadratura ou oposição em planeta importante)
  const pontoTensao = identificarTensao(aspectosMaiores, mapaNatal);

  // Define profundidade de cada categoria
  const profundidade = definirProfundidade(temaDominante, contagemCasas);

  return {
    aspectosMaiores,
    aspectosSecundarios,
    aspectosAuxiliares,
    contagemCasas,
    casaMaisAtiva: parseInt(casaMaisAtiva),
    temaDominante,
    pontoTensao,
    profundidadeDefinida: profundidade
  };
}

/**
 * AUXILIAR: Obter Casa de um planeta no mapa natal
 */
function obterCasaPlaneta(planeta, mapaNatal) {
  if (mapaNatal[planeta] && mapaNatal[planeta].casa) {
    return mapaNatal[planeta].casa;
  }
  return "desconhecida";
}

/**
 * AUXILIAR: Verificar se é ponto sensível
 */
function ehPontoSensivel(aspecto, mapaNatal) {
  const planetasImportantes = ["Lilith", "Nodo Norte", "Nodo Sul", "Chiron"];
  const graoCritico = 29;

  if (planetasImportantes.includes(aspecto.planeta1) || planetasImportantes.includes(aspecto.planeta2)) {
    return true;
  }

  const grau1 = mapaNatal[aspecto.planeta1]?.grau || 0;
  const grau2 = mapaNatal[aspecto.planeta2]?.grau || 0;

  return grau1 >= graoCritico || grau2 >= graoCritico;
}

/**
 * AUXILIAR: Definir tema conforme Casa dominante
 */
function definirTema(casaNuma, contagem) {
  const temasPorCasa = {
    1: "Identidade, Corpo e Apresentação Pessoal",
    2: "Dinheiro, Valores e Recursos Próprios",
    3: "Comunicação, Pensamento e Aprendizado",
    4: "Família, Lar, Raízes e Base Emocional",
    5: "Criatividade, Romance, Prazer e Risco",
    6: "Saúde, Rotina, Trabalho Diário e Hábitos",
    7: "Relacionamentos, Parcerias e Casamento",
    8: "Transformação, Recursos Compartilhados e Sexualidade",
    9: "Filosofia, Ensino e Viagens Longas",
    10: "Carreira, Reputação e Propósito Público",
    11: "Amizades, Comunidade e Projetos Coletivos",
    12: "Espiritualidade, Inconsciente e Karmas"
  };

  return temasPorCasa[casaNuma] || "Múltiplos Temas Integrados";
}

/**
 * AUXILIAR: Identificar ponto de tensão (aspecto chave)
 */
function identificarTensao(aspectosMaiores, mapaNatal) {
  const planetasChave = ["Sol", "Lua", "Lilith", "Nodo Norte", "Plutão"];

  // Prioriza quadraturas e oposições em planetas chave
  let tensionado = aspectosMaiores.find(a => {
    const ehTensionante = a.aspecto === "90°" || a.aspecto === "180°";
    const planeta1Chave = planetasChave.includes(a.planeta1);
    const planeta2Chave = planetasChave.includes(a.planeta2);
    return ehTensionante && (planeta1Chave || planeta2Chave);
  });

  // Se não achar, usa o primeiro aspecto maior
  if (!tensionado) {
    tensionado = aspectosMaiores[0];
  }

  // Guarda: período sem nenhum aspecto maior (evita crash)
  if (!tensionado) {
    return {
      aspecto: null,
      descricao: "período sem tensão maior dominante",
      tema: "Estabilidade relativa"
    };
  }

  return {
    aspecto: tensionado,
    descricao: `${tensionado.planeta1} ${tensionado.aspecto} ${tensionado.planeta2}`,
    tema: `Transformação de ${SIGNIFICADOS_PLANETAS[tensionado.planeta1] || tensionado.planeta1}`
  };
}

/**
 * AUXILIAR: Definir profundidade por categoria conforme tema
 */
function definirProfundidade(temaDominante, contagem) {
  const profundidade = {
    dinheiro: "obrigatorio",
    relacionamento: "obrigatorio",
    saude: "breve",
    trabalho: "breve",
    familia: "breve"
  };

  // Sobrescreve conforme tema
  if (temaDominante.includes("Dinheiro") || temaDominante.includes("Recursos")) {
    profundidade.dinheiro = "profundo";
    profundidade.trabalho = "profundo";
    profundidade.relacionamento = "obrigatorio";
  } else if (temaDominante.includes("Relacionamento") || temaDominante.includes("Parcerias")) {
    profundidade.relacionamento = "profundo";
    profundidade.dinheiro = "obrigatorio";
  } else if (temaDominante.includes("Carreira") || temaDominante.includes("Reputação")) {
    profundidade.trabalho = "profundo";
    profundidade.dinheiro = "profundo";
  } else if (temaDominante.includes("Família") || temaDominante.includes("Raízes")) {
    profundidade.familia = "profundo";
    profundidade.dinheiro = "obrigatorio";
  } else if (temaDominante.includes("Saúde")) {
    profundidade.saude = "profundo";
    profundidade.trabalho = "obrigatorio";
  }

  return profundidade;
}

/**
 * PASSO 2: ESTRUTURAR PROMPT PARA CLAUDE HAIKU
 */
function estruturarPromptParaClaude(analise, mapaNatal, transitos, cliente) {
  const prompt = `
Você é um astróloga experiente gerando uma leitura de previsões personalizada.

${gerarSecaoAnalise(analise)}

${gerarSecaoMapaNatal(mapaNatal)}

${gerarSecaoTransitos(transitos)}

${gerarSecaoInstrucoesFormatacao(analise)}

${gerarSecaoComandos(cliente)}
`;

  return prompt.trim();
}

/**
 * SEÇÃO: Análise (tema + tensão + profundidade)
 */
function gerarSecaoAnalise(analise) {
  const casasOrdenadas = Object.entries(analise.contagemCasas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([casa, count]) => `  - Casa ${casa}: ${count} aspectos`)
    .join("\n");

  const profundidadeStr = Object.entries(analise.profundidadeDefinida)
    .map(([cat, nivel]) => `  - ${cat}: ${nivel}`)
    .join("\n");

  return `
## ANÁLISE DO MAPA

**TEMA DOMINANTE:** ${analise.temaDominante}

**PONTO DE TENSÃO:** ${analise.pontoTensao.descricao}
- Interpretação: ${analise.pontoTensao.tema}

**CASAS COM MAIS MOVIMENTO:**
${casasOrdenadas}

**PROFUNDIDADE DEFINIDA POR CATEGORIA:**
${profundidadeStr}

**CONTEXTO:** O cliente está transitando por mudanças em "${analise.temaDominante}".
A chave é entender como "${analise.pontoTensao.descricao}" exige transformação.
`;
}

/**
 * SEÇÃO: Mapa Natal (referência)
 */
function gerarSecaoMapaNatal(mapaNatal) {
  const planetas = Object.entries(mapaNatal)
    .map(([planeta, dados]) => {
      if (dados.grau !== undefined && dados.signo) {
        return `  - ${planeta}: ${dados.signo} ${dados.grau}° (Casa ${dados.casa || "?"})`;
      }
      return `  - ${planeta}: ${JSON.stringify(dados)}`;
    })
    .join("\n");

  return `
## MAPA NATAL (REFERÊNCIA)

${planetas}
`;
}

/**
 * SEÇÃO: Trânsitos (resumo)
 */
function gerarSecaoTransitos(transitos) {
  const transitosPorMes = agruparTransitosEmPeriodos(transitos);

  let texto = "## TRÂNSITOS AGRUPADOS POR PERÍODO\n\n";

  transitosPorMes.slice(0, 6).forEach(mes => {
    const maiores = mes.aspectos.filter(a => a.orbe < 1.0);
    const secundarios = mes.aspectos.filter(a => a.orbe >= 1.0 && a.orbe <= 2.0);

    texto += `### ${mes.titulo}\n`;
    if (maiores.length > 0) {
      texto += `**Maiores (< 1.0°):**\n`;
      maiores.forEach(a => {
        texto += `  - ${a.planeta1} ${a.aspecto} ${a.planeta2} (orbe ${a.orbe.toFixed(2)}°, ${a.data})\n`;
      });
    }
    if (secundarios.length > 0) {
      texto += `**Secundários (1-2°):**\n`;
      secundarios.forEach(a => {
        texto += `  - ${a.planeta1} ${a.aspecto} ${a.planeta2}\n`;
      });
    }
    texto += "\n";
  });

  return texto;
}

/**
 * SEÇÃO: Instruções de Formatação
 */
function gerarSecaoInstrucoesFormatacao(analise) {
  return `
## INSTRUÇÕES DE FORMATAÇÃO E CONTEÚDO

### ESTRUTURA OBRIGATÓRIA:

1. **Cabeçalho:** Nome, data/hora/local nascimento, tema dominante
2. **Visão Geral:** 1-2 parágrafos sobre o período (narrativa fluida)
3. **Período a Período (mês ou bloco):**
   ${EMOJIS_CATEGORIAS.dinheiro} DINHEIRO (${analise.profundidadeDefinida.dinheiro})
   ${EMOJIS_CATEGORIAS.relacionamento} RELACIONAMENTO (${analise.profundidadeDefinida.relacionamento})
   ${EMOJIS_CATEGORIAS.saude} SAÚDE (${analise.profundidadeDefinida.saude})
   ${EMOJIS_CATEGORIAS.trabalho} TRABALHO/EMPRESA (${analise.profundidadeDefinida.trabalho})
   ${EMOJIS_CATEGORIAS.familia} FAMÍLIA (${analise.profundidadeDefinida.familia})
   **COMANDO DO MÊS:** (1 frase impactante, sempre presente)

4. **Síntese Final:** Como os períodos se conectam, resultado esperado
5. **Alertas Práticos:** O que fazer/não fazer
6. **Mensagem Final:** Tom direto, sem bajulação

### PROFUNDIDADE ESPERADA:
- PROFUNDO = 3-5 parágrafos densos por categoria/período
- OBRIGATÓRIO = 1-2 parágrafos por categoria/período
- BREVE = 1 parágrafo por categoria/período

### REGRAS CRÍTICAS:
- Sempre cite as 5 categorias, mesmo em períodos calmos
- Dinheiro e Relacionamento NUNCA faltam (propriedade)
- Tom direto: sem clichês, sem bajulação, criativo
- Datas em intervalo: "de X a Y", não só pico
- Sempre aponte o ponto de tensão como raiz das mudanças
- Comando do Mês é SEMPRE presente, uma frase que sintetiza a ação
`;
}

/**
 * SEÇÃO: Comandos finais
 */
function gerarSecaoComandos(cliente) {
  return `
## COMANDO FINAL

Você está criando uma leitura para ${cliente.nome}.
Seja honesto: se o período é tenso, diga que é tenso. 
Se é calmo, diga que é calmo.
Nunca ficticiamente amenize ou exagere.

Tom esperado: direto, criativo, com vocabulário denso, sem bajulação.
Inspiração: astrologia prática + psicologia transpessoal + ação concreta.

## UPSELL (individual — sem combo; ao final, no gancho real)
Conforme as previsões revelarem, ofereça 1-2 mapas Astralia (nunca empacotados):
- Revolução Solar: se um ano específico concentra os eventos mais fortes.
- Mapa Kármico: se os mesmos temas se repetem período após período (padrão de fundo).
- Mapa da Sorte / Profissional: se o tema dominante for prosperidade ou carreira.
Como conselho genuíno, não propaganda.

## FORMATO DE SAÍDA (OBRIGATÓRIO)
Responda EXCLUSIVAMENTE com JSON válido, sem texto antes/depois, sem markdown:
{ "secoes": [ { "numero": 1, "titulo": "...", "texto": "..." } ] }
ORDEM DAS SEÇÕES:
1 = Visão Geral do período (tema dominante + ponto de tensão);
2..N = um por PERÍODO (título "De [mês] a [mês]"; texto em prosa cobrindo as 5 categorias — Dinheiro, Relacionamento, Saúde, Trabalho, Família — na profundidade definida, encerrando com o COMANDO DO MÊS);
N+1 = Síntese Final (como os períodos se conectam);
N+2 = Alertas Práticos (fazer / não fazer);
N+3 = Mensagem Final;
N+4 = Próximos Passos Astralia (upsell individual).
REGRAS: aspas duplas; escape quebras como \\n e aspas internas como \\"; sem blocos de código; "numero" sequencial; "texto" em PROSA corrida (não bullets). Dinheiro e Relacionamento nunca faltam.

Gere a leitura de previsões agora. Retorne apenas o JSON.
`;
}

/**
 * AUXILIAR: Agrupar trânsitos em períodos (mês a mês)
 */
function agruparTransitosEmPeriodos(transitos) {
  const periodos = [];
  const mesesNomes = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const mesesMap = {};

  transitos.forEach(t => {
    let mes, ano;

    if (typeof t.data === "string") {
      const dataParts = t.data.split("/");
      if (dataParts.length === 3) {
        mes = parseInt(dataParts[1]) - 1;
        ano = parseInt(dataParts[2]);
      } else {
        const d = new Date(t.data);
        mes = d.getMonth();
        ano = d.getFullYear();
      }
    } else {
      return;
    }

    const chave = `${ano}-${mes}`;

    if (!mesesMap[chave]) {
      mesesMap[chave] = {
        mes,
        ano,
        titulo: `${mesesNomes[mes]} ${ano}`,
        aspectos: [],
        dataInicio: null,
        dataFim: null
      };
    }

    mesesMap[chave].aspectos.push(t);

    if (!mesesMap[chave].dataInicio) {
      mesesMap[chave].dataInicio = t.data;
    }
    mesesMap[chave].dataFim = t.data;
  });

  Object.values(mesesMap).forEach(periodo => {
    periodos.push(periodo);
  });

  return periodos.sort((a, b) => {
    if (a.ano !== b.ano) return a.ano - b.ano;
    return a.mes - b.mes;
  });
}

// EXPORTAR
module.exports = {
  construirPrevisoes,
  CATEGORIAS_OBRIGATORIAS,
  EMOJIS_CATEGORIAS,
  SIGNIFICADOS_PLANETAS,
  SIGNIFICADOS_CASAS
};
