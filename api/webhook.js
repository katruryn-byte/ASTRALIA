// api/webhook.js
// Notification webhook do Mercado Pago.
// Chamado quando pagamento muda de estado (PIX aprovado, cartao confirmado, etc).
// Atualiza Redis com status=approved e registra cliente.
// NAO grava no Sheets - quem grava eh o leitura.js quando o cliente acessa a leitura.

const { MercadoPagoConfig, Payment } = require('mercadopago');
const { createClient } = require('redis');
const { registrarCompra } = require('./cliente');

async function processarAprovacao(sessionId, paymentId, redisUrl) {
  const redisClient = createClient({ url: redisUrl });
  redisClient.on('error', err => console.error('Redis:', err));
  await redisClient.connect();
  const existing = await redisClient.get(`session:${sessionId}`);
  const sessionObj = existing ? JSON.parse(existing) : {};

  // Pega o tipo de produto do que foi salvo na sessao no pagamento.js
  // (no astralia o tipo eh dinamico, nao fixo como na Lilith)
  const tipoProduto = sessionObj.tipo || 'mapa-astral';

  // Idempotencia: so registra cliente uma vez por sessao
  if (sessionObj.status !== 'approved' && sessionObj.dados) {
    try {
      const resultado = await registrarCompra(sessionObj.dados, tipoProduto);
      sessionObj.codigoCliente = resultado.codigo;
      sessionObj.novoCliente = resultado.novoCliente;
    } catch (e) {
      console.error('Erro ao registrar cliente:', e.message);
    }
  }

  sessionObj.status = 'approved';
  sessionObj.paymentId = String(paymentId);
  sessionObj.paidAt = new Date().toISOString();
  await redisClient.setEx(`session:${sessionId}`, 7200, JSON.stringify(sessionObj));
  await redisClient.quit();
}

module.exports = async function handler(req, res) {
  // MP faz GET no webhook pra validar - responde 200 OK
  if (req.method === 'GET') return res.status(200).json({ status: 'ok' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;
    const query = req.query;
    const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;
    let paymentId = null;

    // MP pode notificar de 3 formas - cobre todas
    if (body?.type === 'payment' && body?.data?.id) {
      paymentId = body.data.id;
    } else if (query?.topic === 'payment' && query?.id) {
      paymentId = query.id;
    } else if (body?.type === 'merchant_order' || query?.topic === 'merchant_order') {
      // Notificacao de merchant_order - precisa buscar o pagamento dentro dela
      const orderId = body?.data?.id || query?.id;
      if (!orderId) return res.status(200).json({ status: 'no_order_id' });

      const mpResponse = await fetch(`https://api.mercadopago.com/merchant_orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const orderData = await mpResponse.json();
      const pagamentosAprovados = (orderData.payments || []).filter(p => p.status === 'approved');
      if (pagamentosAprovados.length === 0) {
        return res.status(200).json({ status: 'pending_payment' });
      }
      paymentId = pagamentosAprovados[0].id;

      if (orderData.external_reference) {
        await processarAprovacao(orderData.external_reference, paymentId, redisUrl);
        return res.status(200).json({ status: 'success' });
      }
      return res.status(200).json({ status: 'no_external_reference' });
    } else {
      return res.status(200).json({ status: 'ignored' });
    }

    if (!paymentId) return res.status(200).json({ status: 'no_payment_id' });

    // Busca dados do pagamento no MP
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });

    if (payment.status !== 'approved') {
      return res.status(200).json({ status: 'not_approved', mp_status: payment.status });
    }

    const sessionId = payment.external_reference;
    if (!sessionId) return res.status(200).json({ status: 'no_session' });

    // Se for sessao de combo, ignora - tem webhook proprio (/api/webhook-combo)
    if (sessionId.startsWith('combo-')) {
      return res.status(200).json({ status: 'is_combo_session' });
    }

    await processarAprovacao(sessionId, paymentId, redisUrl);
    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Webhook erro:', error.message);
    // Retorna 200 mesmo em erro pra MP nao re-tentar infinitamente
    return res.status(200).json({ status: 'error', message: error.message });
  }
};
