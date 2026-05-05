const { MercadoPagoConfig, Payment } = require('mercadopago');
const { createClient } = require('redis');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).json({ status: 'ok' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;
    console.log('Webhook recebido:', JSON.stringify(body));

    if (body.type !== 'payment' || !body.data?.id) {
      return res.status(200).json({ status: 'ignored' });
    }

    const paymentId = body.data.id;

    // Busca detalhes do pagamento
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });

    console.log('Payment status:', payment.status, 'ref:', payment.external_reference);

    if (payment.status !== 'approved') {
      return res.status(200).json({ status: 'not_approved' });
    }

    const sessionId = payment.external_reference;
    if (!sessionId) return res.status(200).json({ status: 'no_session' });

    // Marca sessão como paga no Redis
    const redisClient = createClient({ url: process.env.STORAGE_URL });
    await redisClient.connect();

    const sessionData = await redisClient.get(`session:${sessionId}`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      session.status = 'approved';
      session.paymentId = String(paymentId);
      session.paidAt = new Date().toISOString();
      await redisClient.setEx(`session:${sessionId}`, 7200, JSON.stringify(session));
    }

    await redisClient.quit();
    console.log('Sessão aprovada:', sessionId);
    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Webhook erro:', error.message);
    return res.status(200).json({ status: 'error', message: error.message });
  }
}
