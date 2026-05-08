const { createClient } = require('redis');
const {
  PLANETAS_PRINCIPAIS, PLANETAS_ESTENDIDOS,
  API_CONFIG_BASE, API_CONFIG_CASAS, API_CONFIG_ASPECTOS, API_CONFIG_MANDALA,
  buildPromptMapaAstral, buildPromptRevolucaoSolar, buildPromptSinastria,
  buildPromptProfissional, buildPromptKarmico, buildPromptPersonalizada,
  formatarPlanetasParaPrompt, formatarCasasParaPrompt, formatarAspectosParaPrompt,
  calcularCasaDoPlaneta
} = require('./astro-config');
const { getTimezone } = require('./timezone-config');

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

async function chamarAPI(endpoint, body) {
  const res = await fetch(`https://json.freeastrologyapi.com/western/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.FREEASTROLOGY_API_KEY },
    body: JSON.stringify(body)
  });
  return res.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, dados, sessionId } = req.body;
  if (!sessionId) return res.status(401).json({ error: 'Sessao nao encontrada', code: 'NO_SESSION' });

  const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;
  if (!redisUrl) return res.status(500).json({ error: 'REDIS_URL nao configurada' });

  try {
    const rc = createClient({ url: redisUrl });
    rc.on('error', e => console.error('Redis:', e));
    await rc.connect();
    const sessionData = await rc.get(`session:${sessionId}`);
    await rc.quit();

    if (!sessionData) return res.status(401).json({ error: 'Sessao invalida ou expirada', code: 'INVALID_SESSION' });

    let session = JSON.parse(sessionData);
    if (session.status !== 'approved') {
      const aprovado = await aguardarAprovacao(sessionId, redisUrl, 5, 2000);
      if (!aprovado) return res.status(401).json({ error: 'Pagamento nao confirmado ainda', code: 'NOT_APPROVED' });
    }

    let planetasReais = [], casasReais = null, aspectosReais = [], mandalaUrl = null;
    let planetasInfo = '', casasInfo = '', aspectosInfo = '';
    const tipo = dados?.tipo || 'mapa-astral';

    if (dados && dados.lat && dados.lon && dados.data) {
      const dt = new Date(dados.data + 'T' + (dados.hora || '12:00') + ':00');
      const bodyBase = {
        year: dt.getFullYear(), month: dt.getMonth() + 1, date: dt.getDate(),
        hours: dt.getHours(), minutes: dt.getMinutes(), seconds: 0,
        latitude: parseFloat(dados.lat), longitude: parseFloat(dados.lon),
        timezone: getTimezone(dados.data, dados.hora, dados.cidade)
      };

      const listaPlanetas = (tipo === 'personalizada' || tipo === 'mapa-karmico') ? PLANETAS_ESTENDIDOS : PLANETAS_PRINCIPAIS;

      try {
        const d = await chamarAPI('planets', { ...bodyBase, config: { ...API_CONFIG_BASE } });
        if (d?.output && Array.isArray(d.output)) { planetasReais = d.output; console.log('Planetas:', planetasReais.length); }
      } catch(e) { console.log('Planetas erro:', e.message); }

      try {
        const d = await chamarAPI('houses', { ...bodyBase, config: { ...API_CONFIG_CASAS } });
        if (d?.output?.Houses) { casasReais = d.output; console.log('Casas:', casasReais.Houses.length); }
      } catch(e) { console.log('Casas erro:', e.message); }

      if (casasReais?.Houses && planetasReais.length > 0) {
        planetasReais.forEach(item => { item.casaNum = calcularCasaDoPlaneta(item.fullDegree || 0, casasReais.Houses); });
      }

      try {
        const d = await chamarAPI('aspects', { ...bodyBase, config: { ...API_CONFIG_ASPECTOS } });
        if (d?.output && Array.isArray(d.output)) { aspectosReais = d.output; console.log('Aspectos:', aspectosReais.length); }
      } catch(e) { console.log('Aspectos erro:', e.message); }

      if (tipo === 'mapa-astral' || tipo === 'personalizada') {
        try {
          const d = await chamarAPI('natal-wheel-chart', { ...bodyBase, config: { ...API_CONFIG_MANDALA } });
          if (d?.output && typeof d.output === 'string') { mandalaUrl = d.output; console.log('Mandala obtida'); }
        } catch(e) { console.log('Mandala erro:', e.message); }
      }

      planetasInfo = formatarPlanetasParaPrompt(planetasReais, casasReais, listaPlanetas);
      casasInfo = formatarCasasParaPrompt(casasReais);
      aspectosInfo = formatarAspectosParaPrompt(aspectosReais);

      try {
        const baseRes = await fetch(`${process.env.KNOWLEDGE_BASE_URL}?limit=500`);
        const baseData = await baseRes.json();
        if (baseData && Array.isArray(baseData) && baseData.length > 0) {
          const planetaMap = {'Sun':'sol','Moon':'lua','Mercury':'mercurio','Venus':'venus','Mars':'marte','Jupiter':'jupiter','Saturn':'saturno','Uranus':'urano','Neptune':'netuno','Pluto':'plutao'};
          const signoMap = {'Aries':'aries','Taurus':'touro','Gemini':'gemeos','Cancer':'cancer','Leo':'leao','Virgo':'virgem','Libra':'libra','Scorpio':'escorpiao','Sagittarius':'sagitario','Capricorn':'capricornio','Aquarius':'aquario','Pisces':'peixes'};
          const casaColMap = {1:'casa 1',2:'casa 2',3:'casa 3',4:'casa 4',5:'casa 5',6:'casa 6',7:'casa 7',8:'casa 8',9:'casa 9',10:'casa 10',11:'casa 11',12:'casa 12'};
          let base = '\n\n=== BASE DE CONHECIMENTO ===\n\n';
          for (const pEn of ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']) {
            const pItem = planetasReais.find(p => p.planet?.en === pEn);
            if (!pItem) continue;
            const sEn = pItem.zodiac_sign?.name?.en || '';
            const linha = baseData.find(row => {
              const vals = Object.values(row);
              return (vals[0]||'').toString().toLowerCase().trim() === planetaMap[pEn] &&
                     (vals[1]||'').toString().toLowerCase().trim() === (signoMap[sEn] || sEn.toLowerCase());
            });
            const casaCol = casaColMap[pItem.casaNum || 1];
            if (linha && casaCol) {
              const interp = linha[casaCol] || '';
              if (interp && interp.length > 10) base += `--- ${pEn} em ${sEn} na Casa ${pItem.casaNum} ---\n${interp}\n\n`;
            }
          }
          base += '=== FIM ===\n';
          planetasInfo += base;
        }
      } catch(e) { console.log('Base erro:', e.message); }
    }

    let promptFinal = '';
    if (tipo === 'mapa-astral') promptFinal = buildPromptMapaAstral(dados, planetasInfo, casasInfo, aspectosInfo);
    else if (tipo === 'revolucao-solar') promptFinal = buildPromptRevolucaoSolar(dados, planetasInfo, casasInfo, dados.anoRS || new Date().getFullYear());
    else if (tipo === 'sinastria') promptFinal = buildPromptSinastria(dados, planetasInfo, '');
    else if (tipo === 'mapa-profissional') promptFinal = buildPromptProfissional(dados, planetasInfo, casasInfo);
    else if (tipo === 'mapa-karmico') promptFinal = buildPromptKarmico(dados, planetasInfo, casasInfo);
    else if (tipo === 'personalizada') promptFinal = buildPromptPersonalizada(dados, planetasInfo, casasInfo, aspectosInfo);
    else promptFinal = (prompt || '') + '\n' + planetasInfo + casasInfo + aspectosInfo;

    if (dados?.nome) {
      fetch(process.env.SHEETDB_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [{ Data: new Date().toLocaleString('pt-BR'), Nome: dados.nome||'', WhatsApp: dados.whatsapp||'', Email: dados.email||'', Cidade: dados.cidade||'', Nascimento: dados.data||'', Hora: dados.hora||'', Tipo: tipo, Valor: dados.preco||'' }]})
      }).catch(e => console.log('SheetDB:', e.message));
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 4000, messages: [{ role: 'user', content: promptFinal }] })
    });

    const data = await response.json();
    if (planetasReais.length > 0) data.planetas = planetasReais;
    if (casasReais) data.casas = casasReais;
    if (aspectosReais.length > 0) data.aspectos = aspectosReais;
    if (mandalaUrl) data.mandalaUrl = mandalaUrl;
    return res.status(200).json(data);

  } catch (error) {
    console.error('Erro geral:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
