const { MercadoPagoConfig, Preference } = require('mercadopago');
const { createClient } = require('redis');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { tipo, nome, email, dados } = req.body;

    const PRECOS = {
      'mapa-astral':       { valor: 17.97, titulo: 'Mapa Astral Natal — Astral IA' },
      'revolucao-solar':   { valor: 37.97, titulo: 'Revolução Solar — Astral IA' },
      'mapa-profissional': { valor: 37.97, titulo: 'Mapa Profissional — Astral IA' },
      'sinastria':         { valor: 47.97, titulo: 'Sinastria — Astral IA' },
      'mapa-karmico':      { valor: 37.97, titulo: 'Mapa Kármico — Astral IA' },
      'personalizada':     { valor: 197.97, titulo: 'Leitura Personalizada Premium — Astral IA' }
    };

    const produto = PRECOS[tipo] || PRECOS['mapa-astral'];
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Usa REDIS_URL que já existe no Vercel
    const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL não configurada nas variáveis de ambiente');
    }

    const redisClient = createClient({ url: redisUrl });
    redisClient.on('error', (err) => console.error('Redis error:', err));
    await redisClient.connect();

    await redisClient.setEx(`session:${sessionId}`, 7200, JSON.stringify({
      tipo,
      nome,
      email,
      dados,
      status: 'pending',
      criadoEm: new Date().toISOString()
    }));

    await redisClient.quit();

    // Configura MP
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN
    });

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{
          title: produto.titulo,
          quantity: 1,
          unit_price: produto.valor,
          currency_id: 'BRL'
        }],
        payer: {
          name: nome || '',
          email: email || 'cliente@astralia.online'
        },
        back_urls: {
          success: `https://app.astralia.online/?session=${sessionId}&status=approved`,
          failure: `https://astralia.online/?status=failed`,
          pending: `https://astralia.online/?status=pending`
        },
        auto_return: 'approved',
        notification_url: `https://astralia.online/api/webhook`,
        external_reference: sessionId,
        statement_descriptor: 'ASTRAL IA',
        metadata: { session_id: sessionId, tipo }
      }
    });

    return res.status(200).json({
      id: result.id,
      init_point: result.init_point,
      sessionId
    });

  } catch (error) {
    console.error('Pagamento erro:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
