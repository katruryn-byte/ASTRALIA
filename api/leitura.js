// api/leitura.js
// Recebe pagamento confirmado, calcula astrologia, gera leitura via Claude.
// Grava nas 22 colunas do SheetDB. Suporta os 8 produtos individuais.
// Combo nao passa por aqui - tem fluxo proprio (Sprint 3).

const { createClient } = require('redis');
const {
  API_CONFIG_BASE, API_CONFIG_CASAS, API_CONFIG_ASPECTOS,
  PLANETAS_PRINCIPAIS, PLANETAS_ESTENDIDOS,
  formatarPlanetasParaPrompt, formatarCasasParaPrompt, formatarAspectosParaPrompt,
  calcularCasaDoPlaneta
} = require('./astro-config');
const { getTimezone } = require('./timezone-config');

// Carrega prompts: tenta arquivo individual primeiro, cai pro astro-config se falhar
function carregarPrompt(caminhoIndividual, nomeFuncaoFallback) {
  try {
    const mod = require(caminhoIndividual);
    // Suporta export tipo `module.exports = funcao` OU `module.exports.buildPromptX = funcao`
    if (typeof mod === 'function') return mod;
    if (typeof mod[nomeFuncaoFallback] === 'function') return mod[nomeFuncaoFallback];
    if (typeof mod.default === 'function') return mod.default;
    throw new Error('Estrutura de export nao reconhecida');
  } catch (e) {
    console.log(`Prompt individual nao carregado (${caminhoIndividual}), usando fallback do astro-config: ${e.message}`);
    return require('./astro-config')[nomeFuncaoFallback];
  }
}

const PROMPTS_BUILDER = {
  'mapa-astral':                carregarPrompt('./prompt-mapa-astral', 'buildPromptMapaAstral'),
  'mapa-astral-personalizado':  carregarPrompt('./prompt-personalizada', 'buildPromptPersonalizada'),
  'revolucao-solar':            carregarPrompt('./prompt-revolucao-solar', 'buildPromptRevolucaoSolar'),
  'mapa-profissional':          carregarPrompt('./prompt-mapa-profissional', 'buildPromptProfissional'),
  'sinastria':                  carregarPrompt('./prompt-sinastria', 'buildPromptSinastria'),
  'mapa-karmico':               carregarPrompt('./prompt-mapa-karmico', 'buildPromptKarmico'),
  // Os 2 mapas novos ainda nao tem prompt - vai dar erro util se chamado
  'mapa-previsoes':             null,
  'mapa-da-sorte':              null
};

async function aguardarAprovacao(sessionId, redisUrl, maxTentativas = 5, intervalMs = 2000) {
  for (let i = 0; i < maxTentativas; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    const rc = createClient({ url: redisUrl });
    rc.on('error', e => console.error('Redis:', e));
    await rc.connect();
    const raw = await rc.get(`session:${sessionId}`);
    await rc.quit();
    if (raw) {
      const s = JSON.parse(raw);
      if (s.status === 'approved') return true;
    }
  }
  return false;
}

async function chamarFreeAstro(endpoint, body) {
  const res = await fetch(`https://json.freeastrologyapi.com/western/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.FREEASTROLOGY_API_KEY
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

// Extracao robusta de JSON da resposta do Claude (mesma logica da Lilith)
function extrairJSON(texto) {
  if (!texto) return null;
  let limpo = texto.replace(/```json/gi, '').replace(/```/g, '').trim();
  const primeiro = limpo.indexOf('{');
  if (primeiro === -1) return null;

  const ultimo = limpo.lastIndexOf('}');
  if (ultimo > primeiro) {
    try { return JSON.parse(limpo.substring(primeiro, ultimo + 1)); } catch(e) {}
  }

  // Tenta recuperar JSON truncado
  let str = limpo.substring(primeiro);
  let abertos = 0, dentroString = false, escape = false;
  let ultimoFechamentoValido = -1;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"') { dentroString = !dentroString; continue; }
    if (dentroString) continue;
    if (c === '{' || c === '[') abertos++;
    if (c === '}' || c === ']') {
      abertos--;
      if (abertos === 0) ultimoFechamentoValido = i;
    }
  }
  if (ultimoFechamentoValido > -1) {
    try { return JSON.parse(str.substring(0, ultimoFechamentoValido + 1)); } catch(e) {}
  }
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { dados, sessionId } = req.body;
  if (!sessionId) return res.status(401).json({ error: 'Sessao nao encontrada', code: 'NO_SESSION' });

  const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;

  try {
    // 1) Valida sessao e pagamento aprovado
    const rc = createClient({ url: redisUrl });
    rc.on('error', e => console.error('Redis:', e));
    await rc.connect();
    const sessionData = await rc.get(`session:${sessionId}`);
    await rc.quit();

    if (!sessionData) return res.status(401).json({ error: 'Sessao invalida', code: 'INVALID_SESSION' });

    let session = JSON.parse(sessionData);
    if (session.status !== 'approved') {
      const aprovado = await aguardarAprovacao(sessionId, redisUrl, 5, 2000);
      if (!aprovado) return res.status(401).json({ error: 'Pagamento nao confirmado', code: 'NOT_APPROVED' });
    }

    const tipo = dados?.tipo || session.tipo || 'mapa-astral';

    // 2) Valida que o prompt existe
    const buildPrompt = PROMPTS_BUILDER[tipo];
    if (!buildPrompt) {
      return res.status(501).json({
        error: `Prompt do produto "${tipo}" ainda nao configurado. Crie o arquivo api/prompt-${tipo}.js com a funcao adequada.`,
        code: 'PROMPT_NOT_CONFIGURED'
      });
    }

    // 3) Calcula astrologia via FreeAstrology (paralelo pra ganhar tempo)
    let planetasReais = [], casasReais = null, aspectosReais = [];

    if (dados && dados.lat && dados.lon && dados.data) {
      const timezone = getTimezone(dados.data, dados.hora, dados.cidade);
      const dt = new Date(dados.data + 'T' + (dados.hora || '12:00') + ':00');
      const bodyBase = {
        year: dt.getFullYear(), month: dt.getMonth() + 1, date: dt.getDate(),
        hours: dt.getHours(), minutes: dt.getMinutes(), seconds: 0,
        latitude: parseFloat(dados.lat), longitude: parseFloat(dados.lon),
        timezone
      };

      // Chamadas paralelas - economiza ~10s comparado ao sequencial
      const [planetasResp, casasResp, aspectosResp] = await Promise.allSettled([
        chamarFreeAstro('planets', { ...bodyBase, config: { ...API_CONFIG_BASE } }),
        chamarFreeAstro('houses', { ...bodyBase, config: { ...API_CONFIG_CASAS } }),
        chamarFreeAstro('aspects', { ...bodyBase, config: { ...API_CONFIG_ASPECTOS } })
      ]);

      if (planetasResp.status === 'fulfilled' && planetasResp.value?.output) {
        planetasReais = planetasResp.value.output;
      }
      if (casasResp.status === 'fulfilled' && casasResp.value?.output?.Houses) {
        casasReais = casasResp.value.output;
      }
      if (aspectosResp.status === 'fulfilled' && aspectosResp.value?.output) {
        aspectosReais = aspectosResp.value.output;
      }

      // Calcula casa de cada planeta
      if (casasReais?.Houses && planetasReais.length > 0) {
        planetasReais.forEach(item => {
          item.casaNum = calcularCasaDoPlaneta(item.fullDegree || 0, casasReais.Houses);
        });
      }
    }

    // 4) Monta info formatada pro prompt
    const listaPlanetas = (tipo === 'mapa-astral-personalizado' || tipo === 'mapa-karmico')
      ? PLANETAS_ESTENDIDOS
      : PLANETAS_PRINCIPAIS;

    const planetasInfo = formatarPlanetasParaPrompt(planetasReais, casasReais, listaPlanetas);
    const casasInfo = formatarCasasParaPrompt(casasReais);
    const aspectosInfo = formatarAspectosParaPrompt(aspectosReais);

    // 5) Gera prompt final do produto
    let promptFinal;
    if (tipo === 'revolucao-solar') {
      const ano = dados.anoRS || new Date().getFullYear();
      promptFinal = buildPrompt(dados, planetasInfo, casasInfo, ano);
    } else if (tipo === 'sinastria') {
      promptFinal = buildPrompt(dados, planetasInfo, ''); // 2 pessoas - astrologia do parceiro vai no formatador
    } else if (tipo === 'mapa-astral-personalizado') {
      promptFinal = buildPrompt(dados, planetasInfo, casasInfo, aspectosInfo);
    } else if (tipo === 'mapa-karmico' || tipo === 'mapa-profissional') {
      promptFinal = buildPrompt(dados, planetasInfo, casasInfo);
    } else {
      // mapa-astral
      promptFinal = buildPrompt(dados, planetasInfo, casasInfo, aspectosInfo);
    }

    // 6) Grava no SheetDB ANTES de chamar Claude (fire-and-forget).
    // Se Claude der erro, ainda assim a venda ficou registrada.
    if (dados?.nome) {
      const timezoneCalc = getTimezone(dados.data, dados.hora, dados.cidade);
      fetch(process.env.SHEETDB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [{
          'Data': new Date().toLocaleString('pt-BR'),
          'Nome': dados.nome || '',
          'WhatsApp': dados.whatsapp || '',
          'Email': dados.email || '',
          'Cidade': dados.cidade || '',
          'Nascimento': dados.data || '',
          'Hora': dados.hora || '',
          'Tipo': tipo,
          'Valor': String(session.preco || dados.preco || ''),
          'Codigo Cliente': session.codigoCliente || dados.codigoCliente || '',
          'Genero': dados.genero || '',
          'Cliente Recorrente': session.novoCliente === false ? 'Sim' : 'Não',
          'Lat': String(dados.lat || ''),
          'Lon': String(dados.lon || ''),
          'Timezone': String(timezoneCalc),
          'CPF': dados.cpf || '',
          'Status Pagamento': 'approved',
          'Payment ID MP': session.paymentId || '',
          'Sessao ID': sessionId,
          // Colunas do Sprint 4 ficam vazias - n8n preenche depois
          'PDF Drive URL': '',
          'Email Enviado Em': '',
          'Status Entrega': 'pendente'
        }] })
      }).catch(e => console.log('SheetDB erro:', e.message));
    }

    // 7) Chama Claude com o prompt final
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: tipo === 'mapa-astral-personalizado' ? 16000 : 8000,
        messages: [{ role: 'user', content: promptFinal }]
      })
    });

    const data = await response.json();

    // 8) Extrai JSON robusto da resposta
    if (data?.content && Array.isArray(data.content)) {
      const textoCompleto = data.content.map(b => b.text || '').join('');
      const jsonExtraido = extrairJSON(textoCompleto);
      if (jsonExtraido && jsonExtraido.secoes) {
        data.secoes = jsonExtraido.secoes;
      }
    }

    // 9) Anexa dados astrologicos pro frontend desenhar mandala e tabelas
    if (planetasReais.length > 0) data.planetas = planetasReais;
    if (casasReais) data.casas = casasReais;
    if (aspectosReais.length > 0) data.aspectos = aspectosReais;

    return res.status(200).json(data);

  } catch (error) {
    console.error('Erro leitura:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
