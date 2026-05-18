// API: gera SVG da mandala (roda zodiacal) com posicoes reais dos planetas
// Endpoint: /api/mandala-chart
// Body: { sessionId, dados (opcional) }
// Retorna: { svg: "<svg>...</svg>" }

const { createClient } = require('redis');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { sessionId, dados: dadosBody } = req.body;
    let dados = dadosBody;

    // Se nao passou dados, busca da sessao
    if (!dados && sessionId) {
      const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;
      const rc = createClient({ url: redisUrl });
      rc.on('error', e => console.error('Redis:', e));
      await rc.connect();
      const sessionData = await rc.get(`session:${sessionId}`);
      await rc.quit();
      if (!sessionData) return res.status(401).json({ error: 'Sessao invalida' });
      const session = JSON.parse(sessionData);
      dados = session.dados;
    }

    if (!dados?.data || !dados?.lat || !dados?.lon) {
      return res.status(400).json({ error: 'Dados de nascimento incompletos' });
    }

    // Parseia data e hora
    const [ano, mes, dia] = dados.data.split('-').map(Number);
    const [h, m] = (dados.hora || '12:00').split(':').map(Number);

    // Configuracao da mandala (cores combinando com a marca Astral IA)
    const configMandala = {
      observation_point: "topocentric",
      ayanamsha: "tropical",
      house_system: "placidus",
      language: "pt",
      // Personalizacao visual com paleta do site
      chart_background_color: "#0a0418",
      sign_icon_color: "#f0d080",
      planet_icon_color: "#e07090",
      inner_circle_background: "#15082a",
      sign_background: "#1a0820",
      house_number_color: "#a890c0",
      aspect_color_easy: "#80e090",
      aspect_color_hard: "#ff8090",
      chart_size: 600
    };

    const requestBody = {
      year: ano,
      month: mes,
      date: dia,
      hours: h,
      minutes: m,
      seconds: 0,
      latitude: parseFloat(dados.lat),
      longitude: parseFloat(dados.lon),
      timezone: parseFloat(dados.timezone || -3),
      config: configMandala
    };

    const response = await fetch('https://json.freeastrologyapi.com/horoscope-chart-svg-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.FREEASTROLOGY_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error('Mandala API erro:', response.status, txt);
      return res.status(500).json({ error: 'Erro na API de mandala', detalhe: txt });
    }

    const data = await response.json();

    // A API pode retornar em campos diferentes: svg_code, output, chart_url, etc
    const svg = data.svg_code || data.output || data.svg || data.chart;
    if (!svg) {
      console.error('Mandala sem SVG:', JSON.stringify(data).substring(0, 500));
      return res.status(500).json({ error: 'SVG da mandala nao retornado', resposta: data });
    }

    return res.status(200).json({ svg: typeof svg === 'string' ? svg : JSON.stringify(svg) });

  } catch (error) {
    console.error('Erro mandala:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
