const { MercadoPagoConfig, Payment } = require('mercadopago');
const { createClient } = require('redis');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).json({ status: 'ok' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;
    const query = req.query;
    console.log('Webhook body:', JSON.stringify(body));
    console.log('Webhook query:', JSON.stringify(query));

    const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;
    let paymentId = null;

    // Formato 1: body.type === 'payment'
    if (body?.type === 'payment' && body?.data?.id) {
      paymentId = body.data.id;
    }
    // Formato 2: query topic=payment
    else if (query?.topic === 'payment' && query?.id) {
      paymentId = query.id;
    }
    // Formato 3: merchant_order
    else if (body?.type === 'merchant_order' || query?.topic === 'merchant_order') {
      const orderId = body?.data?.id || query?.id;
      if (!orderId) return res.status(200).json({ status: 'no_order_id' });

      console.log('merchant_order:', orderId);
      const mpResponse = await fetch(`https://api.mercadopago.com/merchant_orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const orderData = await mpResponse.json();
      console.log('Order:', JSON.stringify(orderData));

      const pagamentosAprovados = (orderData.payments || []).filter(p => p.status === 'approved');
      if (pagamentosAprovados.length === 0) {
        return res.status(200).json({ status: 'pending_payment' });
      }
      paymentId = pagamentosAprovados[0].id;

      if (orderData.external_reference) {
        const sessionId = orderData.external_reference;
        const redisClient = createClient({ url: redisUrl });
        redisClient.on('error', err => console.error('Redis:', err));
        await redisClient.connect();
        const existing = await redisClient.get(`session:${sessionId}`);
        const sessionObj = existing ? JSON.parse(existing) : {};
        sessionObj.status = 'approved';
        sessionObj.paymentId = String(paymentId);
        sessionObj.paidAt = new Date().toISOString();
        await redisClient.setEx(`session:${sessionId}`, 7200, JSON.stringify(sessionObj));
        await redisClient.quit();
        console.log('Sessão aprovada via merchant_order:', sessionId);
        return res.status(200).json({ status: 'success' });
      }
      return res.status(200).json({ status: 'no_external_reference' });
    }
    else {
      console.log('Ignorado:', body?.type, query?.topic);
      return res.status(200).json({ status: 'ignored' });
    }

    if (!paymentId) return res.status(200).json({ status: 'no_payment_id' });

    // Busca pagamento no MP
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });
    console.log('Payment status:', payment.status, 'ref:', payment.external_reference);

    if (payment.status !== 'approved') {
      return res.status(200).json({ status: 'not_approved', payment_status: payment.status });
    }

    const sessionId = payment.external_reference;
    if (!sessionId) return res.status(200).json({ status: 'no_session' });

    const redisClient = createClient({ url: redisUrl });
    redisClient.on('error', err => console.error('Redis:', err));
    await redisClient.connect();
    const existing = await redisClient.get(`session:${sessionId}`);
    const sessionObj = existing ? JSON.parse(existing) : {};
    sessionObj.status = 'approved';
    sessionObj.paymentId = String(paymentId);
    sessionObj.paidAt = new Date().toISOString();
    await redisClient.setEx(`session:${sessionId}`, 7200, JSON.stringify(sessionObj));
    await redisClient.quit();
    console.log('Sessão aprovada:', sessionId);
    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Webhook erro:', error.message);
    return res.status(200).json({ status: 'error', message: error.message });
  }
}
