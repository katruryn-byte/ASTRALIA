export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data } = req.body;
  
  if (!data?.id) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    // Busca detalhes do pagamento no Mercado Pago
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${data.id}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    );
    
    const payment = await response.json();
    
    if (payment.status === 'approved') {
      // Salva pagamento aprovado
      console.log('Pagamento aprovado:', payment.id, payment.external_reference);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
