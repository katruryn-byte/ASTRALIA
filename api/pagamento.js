const { MercadoPagoConfig, Payment } = require('mercadopago');
const { createClient } = require('redis');
const { registrarCompra } = require('./cliente');

const PRECOS_URL = 'https://raw.githubusercontent.com/katruryn-byte/astralia-precos/main/precos.json';
const PRODUTO_ID = 'lilith';
const PRECO_FALLBACK = 47.97;
const CODIGO_ADMIN = (process.env.CODIGO_ADMIN_TESTE || 'ASTRO-ADM-1REAL').toUpperCase();

async function obterPrecoAtual() {
  try {
    const r = await fetch(PRECOS_URL + '?t=' + Date.now());
    const data = await r.json();
    const p = data[PRODUTO_ID];
    if (p && p.ativo && typeof p.preco === 'number') {
      return p.preco;
    }
  } catch(e) {
    console.error('Erro ao buscar precos:', e.message);
  }
  return PRECO_FALLBACK;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { paymentData, dadosCliente, preco: precoCliente, descontoExtra } = req.body;

    if (!paymentData || !dadosCliente) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // SEGURANCA: sempre busca preco do servidor, ignora o do cliente
    let precoServidor = await obterPrecoAtual();

    // CUPOM ADMIN: forca R$ 1 para TESTE. Precos continuam cheios para clientes reais.
    if (dadosCliente.codigoCliente && dadosCliente.codigoCliente.toUpperCase() === CODIGO_ADMIN) {
      precoServidor = 1.00;
    } else if (descontoExtra && descontoExtra > 0 && dadosCliente.codigoCliente) {
      try {
        const { buscarCliente } = require('./cliente');
        const c = await buscarCliente(dadosCliente.codigoCliente);
        if (c) {
          precoServidor = Math.round(precoServidor * (1 - 0.10) * 100) / 100;
        }
      } catch(e) { console.log('Erro validar codigo:', e.message); }
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;
    const redisClient = createClient({ url: redisUrl });
    redisClient.on('error', err => console.error('Redis:', err));
    await redisClient.connect();
    await redisClient.setEx(`session:${sessionId}`, 7200, JSON.stringify({
      tipo: 'lilith',
      nome: dadosCliente.nome,
      email: dadosCliente.email,
      dados: dadosCliente,
      preco: precoServidor,
      status: 'pending',
      criadoEm: new Date().toISOString()
    }));
    await redisClient.quit();

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);

    const paymentBody = {
      transaction_amount: precoServidor,
      description: 'Mapa da Lilith - Astral IA',
      external_reference: sessionId,
      notification_url: 'https://lilith.astralia.online/api/webhook',
      payer: {
        email: dadosCliente.email || 'cliente@astralia.online',
        first_name: dadosCliente.nome?.split(' ')[0] || '',
        last_name: dadosCliente.nome?.split(' ').slice(1).join(' ') || ''
      },
      metadata: { session_id: sessionId, tipo: 'lilith' }
    };

    if (paymentData.payment_method_id === 'pix') {
      paymentBody.payment_method_id = 'pix';
    } else {
      paymentBody.token = paymentData.token;
      paymentBody.installments = paymentData.installments || 1;
      paymentBody.payment_method_id = paymentData.payment_method_id;
      paymentBody.issuer_id = paymentData.issuer_id;
      if (paymentData.payer?.identification) {
        paymentBody.payer.identification = paymentData.payer.identification;
      }
    }

    const result = await paymentClient.create({ body: paymentBody });

    if (result.status === 'approved') {
      const rc2 = createClient({ url: redisUrl });
      rc2.on('error', err => console.error('Redis:', err));
      await rc2.connect();
      const existing = await rc2.get(`session:${sessionId}`);
      const sessionObj = existing ? JSON.parse(existing) : {};

      // Registra cliente (idempotente)
      if (!sessionObj.codigoCliente) {
        try {
          const reg = await registrarCompra({ ...dadosCliente, preco: precoServidor }, PRODUTO_ID);
          sessionObj.codigoCliente = reg.codigo;
          sessionObj.novoCliente = reg.novoCliente;
        } catch (e) {
          console.error('Erro registro cliente:', e.message);
        }
      }

      sessionObj.status = 'approved';
      sessionObj.paymentId = String(result.id);
      sessionObj.paidAt = new Date().toISOString();
      await rc2.setEx(`session:${sessionId}`, 7200, JSON.stringify(sessionObj));
      await rc2.quit();
    }

    return res.status(200).json({
      sessionId,
      paymentId: result.id,
      status: result.status,
      status_detail: result.status_detail,
      qr_code: result.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: result.point_of_interaction?.transaction_data?.ticket_url
    });

  } catch (error) {
    console.error('Pagamento erro:', error.message, error.cause);
    return res.status(500).json({
      error: error.message,
      details: error.cause?.[0]?.description || null
    });
  }
}
