const { createClient } = require('redis');

module.exports = async function handler(req, res) {
  // Responde 200 imediatamente para o MP não reenviar
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    console.log('Webhook recebido:', JSON.stringify(body));

    // Só processa pagamentos aprovados
    if (body.type !== 'payment' || !body.data?.id) {
      return res.status(200).json({ status: 'ignored' });
    }

    const paymentId = body.data.id;

    // Busca detalhes do pagamento na API do MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    });

    const payment = await mpRes.json();
    console.log('Payment status:', payment.status, 'id:', paymentId);

    // Só libera se pagamento aprovado
    if (payment.status !== 'approved') {
      return res.status(200).json({ status: 'payment_not_approved' });
    }

    // Gera token único para liberar a leitura
    const token = `tok_${paymentId}_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;

    // Detecta o tipo de leitura pelo valor pago
    const valor = payment.transaction_amount || 0;
    let tipo = 'mapa-astral';
    if (valor >= 190) tipo = 'personalizada';
    else if (valor >= 45) tipo = 'sinastria';
    else if (valor >= 35) tipo = 'revolucao-solar';

    // Dados para salvar
    const dadosPagamento = {
      token,
      paymentId: String(paymentId),
      status: 'approved',
      valor: String(valor),
      tipo,
      email: payment.payer?.email || '',
      nome: payment.payer?.first_name || '',
      criadoEm: new Date().toISOString()
    };

    // Salva no Redis com TTL de 24 horas
    const client = createClient({ url: process.env.STORAGE_URL });
    await client.connect();
    await client.setEx(`payment:${token}`, 86400, JSON.stringify(dadosPagamento));
    await client.quit();

    console.log('Token salvo:', token, 'tipo:', tipo);

    // Redireciona para a página de leitura com o token
    const redirectUrl = `https://app.astralia.online/?token=${token}&tipo=${tipo}`;
    
    return res.status(200).json({ 
      status: 'success', 
      token,
      redirect: redirectUrl
    });

  } catch (error) {
    console.error('Webhook erro:', error.message);
    return res.status(200).json({ status: 'error', message: error.message });
  }
}
