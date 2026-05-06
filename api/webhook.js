const { MercadoPagoConfig, Payment } = require('mercadopago');
const { createClient } = require('redis');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).json({ status: 'ok' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;
    console.log('Webhook recebido:', JSON.stringify(body));

    // MP envia também notificações de tipo 'merchant_order' — ignorar
    if (body.type !== 'payment' || !body.data?.id) {
      return res.status(200).json({ status: 'ignored' });
    }

    const paymentId = body.data.id;

    // Busca detalhes do pagamento no MP
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });

    console.log('Payment status:', payment.status, 'ref:', payment.external_reference);

    if (payment.status !== 'approved') {
      return res.status(200).json({ status: 'not_approved', payment_status: payment.status });
    }

    const sessionId = payment.external_reference;
    if (!sessionId) {
      console.log('Sem external_reference no pagamento', paymentId);
      return res.status(200).json({ status: 'no_session' });
    }

    // Atualiza sessão como aprovada no Redis
    const redisClient = createClient({ url: process.env.STORAGE_URL });
    await redisClient.connect();

    const sessionData = await redisClient.get(`session:${sessionId}`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      session.status = 'approved';
      session.paymentId = String(paymentId);
      session.paidAt = new Date().toISOString();
      // Mantém por mais 2h após aprovação
      await redisClient.setEx(`session:${sessionId}`, 7200, JSON.stringify(session));
      console.log('Sessão aprovada no Redis:', sessionId);
    } else {
      // Sessão não existe ainda — cria com status approved
      // (raro, mas pode acontecer se Redis reiniciou)
      await redisClient.setEx(`session:${sessionId}`, 7200, JSON.stringify({
        status: 'approved',
        paymentId: String(paymentId),
        paidAt: new Date().toISOString()
      }));
      console.log('Sessão criada diretamente como approved:', sessionId);
    }

    await redisClient.quit();
    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Webhook erro:', error.message);
    // Sempre retorna 200 para o MP não retentar indefinidamente
    return res.status(200).json({ status: 'error', message: error.message });
  }
}
