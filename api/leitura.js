export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, dados } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt obrigatório' });

  try {
    // 1. Busca posições reais dos planetas na FreeAstrologyAPI
    let planetasReais = null;
    if (dados && dados.data && dados.hora && dados.lat && dados.lon) {
      const dt = new Date(dados.data + 'T' + (dados.hora || '12:00'));
      const astroRes = await fetch('https://json.freeastrologyapi.com/planets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.FREEASTROLOGY_API_KEY
        },
        body: JSON.stringify({
          year: dt.getFullYear(),
          month: dt.getMonth() + 1,
          date: dt.getDate(),
          hours: dt.getHours(),
          minutes: dt.getMinutes(),
          seconds: 0,
          latitude: dados.lat,
          longitude: dados.lon,
          timezone: dados.timezone || -3,
          settings: {
            observation_point: 'topocentric',
            ayanamsha: 'none'
          }
        })
      });
      const astroData = await astroRes.json();
      if (astroData && astroData.output) {
        planetasReais = astroData.output;
      }
    }

    // 2. Monta prompt com dados reais se disponíveis
    let promptFinal = prompt;
    if (planetasReais) {
      const planetas = planetasReais;
      const info = Object.entries(planetas)
        .map(([nome, dados]) => `${nome}: ${dados.name} em ${dados.sign}`)
        .join(', ');
      promptFinal = prompt + `\n\nPosições REAIS dos planetas calculadas astronomicamente: ${info}`;
    }

    // 3. Gera leitura com Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: promptFinal }]
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
