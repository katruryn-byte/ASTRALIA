module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, dados } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt obrigatório' });

  try {
    let infoAstro = '';
    let planetasReais = [];

    if (dados && dados.lat && dados.lon && dados.data) {
      const dt = new Date(dados.data + 'T' + (dados.hora || '12:00') + ':00');
      const body = {
        year: dt.getFullYear(),
        month: dt.getMonth() + 1,
        date: dt.getDate(),
        hours: dt.getHours(),
        minutes: dt.getMinutes(),
        seconds: 0,
        latitude: parseFloat(dados.lat),
        longitude: parseFloat(dados.lon),
        timezone: dados.timezone || -3
      };

      // 1. Planetas
      try {
        const planetasRes = await fetch('https://json.freeastrologyapi.com/western/planets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.FREEASTROLOGY_API_KEY },
          body: JSON.stringify({ ...body, config: { observation_point: 'topocentric', ayanamsha: 'tropical', language: 'pt' } })
        });
        const planetasData = await planetasRes.json();
        if (planetasData && planetasData.output && Array.isArray(planetasData.output)) {
          planetasReais = planetasData.output;
          infoAstro += '\n\nPosições REAIS dos planetas:\n';
          planetasData.output.forEach(item => {
            const nome = item.planet?.en || '';
            const signo = item.zodiac_sign?.name?.en || '';
            const grau = item.normDegree ? ` ${item.normDegree.toFixed(1)}°` : '';
            const retro = (item.isRetro === 'True' || item.isRetro === true) ? ' (Retrógrado)' : '';
            if (nome && signo) infoAstro += `${nome}: ${signo}${grau}${retro}\n`;
          });
        }
      } catch(e) { console.log('Planetas erro:', e.message); }

      // 2. Casas
      try {
        const casasRes = await fetch('https://json.freeastrologyapi.com/western/houses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.FREEASTROLOGY_API_KEY },
          body: JSON.stringify({ ...body, config: { observation_point: 'topocentric', ayanamsha: 'tropical', house_system: 'Placidus', language: 'pt' } })
        });
        const casasData = await casasRes.json();
        if (casasData && casasData.output && casasData.output.Houses) {
          infoAstro += '\nCasas Astrológicas (Placidus):\n';
          casasData.output.Houses.forEach(casa => {
            const signo = casa.zodiac_sign?.name?.en || '';
            const grau = casa.normDegree ? ` ${casa.normDegree.toFixed(1)}°` : '';
            if (signo) infoAstro += `Casa ${casa.House}: ${signo}${grau}\n`;
          });
        }
      } catch(e) { console.log('Casas erro:', e.message); }

      // 3. Aspectos
      try {
        const aspectosRes = await fetch('https://json.freeastrologyapi.com/western/aspects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.FREEASTROLOGY_API_KEY },
          body: JSON.stringify({
            ...body,
            config: {
              observation_point: 'topocentric',
              ayanamsha: 'tropical',
              language: 'pt',
              allowed_aspects: ['Conjunction', 'Opposition', 'Trine', 'Square', 'Sextile'],
              orb_values: { Conjunction: 8, Opposition: 8, Trine: 8, Square: 8, Sextile: 6 }
            }
          })
        });
        const aspectosData = await aspectosRes.json();
        if (aspectosData && aspectosData.output && Array.isArray(aspectosData.output)) {
          infoAstro += '\nAspectos Principais:\n';
          aspectosData.output.slice(0, 10).forEach(item => {
            const p1 = item.planet_1?.en || '';
            const p2 = item.planet_2?.en || '';
            const asp = item.aspect?.en || '';
            if (p1 && p2 && asp) infoAstro += `${p1} ${asp} ${p2}\n`;
          });
        }
      } catch(e) { console.log('Aspectos erro:', e.message); }
    }

    // 4. Salva cliente no Google Sheets
    if (dados && dados.nome) {
      try {
        await fetch(process.env.SHEETDB_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [{
              Data: new Date().toLocaleString('pt-BR'),
              Nome: dados.nome || '',
              WhatsApp: dados.whatsapp || '',
              Email: dados.email || '',
              Cidade: dados.cidade || '',
              Nascimento: dados.data || '',
              Hora: dados.hora || '',
              Tipo: dados.tipo || '',
              Valor: dados.preco || ''
            }]
          })
        });
      } catch(e) { console.log('SheetDB erro:', e.message); }
    }

    // 5. Gera leitura com Claude
    const promptFinal = prompt + infoAstro;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: promptFinal }]
      })
    });

    const data = await response.json();
    if (planetasReais.length > 0) data.planetas = planetasReais;
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
