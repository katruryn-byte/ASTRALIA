// api/pagamento.js
// Endpoint de pagamento de PRODUTO INDIVIDUAL (nao combo).
// Modelo Payment direto = checkout transparente (PIX/cartao na propria pagina).
// Combo usa /api/pagamento-combo separado.

const { MercadoPagoConfig, Payment } = require('mercadopago');
const { createClient } = require('redis');
const { registrarCompra, buscarCliente, NOMES_PRODUTOS, PRODUTOS } = require('./cliente');

const PRECOS_URL = 'https://raw.githubusercontent.com/katruryn-byte/astralia-precos/main/precos.json';

// Fallbacks por produto, usados se o precos.json estiver indisponivel
const PRECOS_FALLBACK = {
  'mapa-astral':                17.97,
  'mapa-astral-personalizado':  197.97,
  'revolucao-solar':            47.97,
  'mapa-profissional':          47.97,
  'sinastria':                  47.97,
  'mapa-karmico':               47.97,
  'mapa-previsoes':             47.97,
  'mapa-da-sorte':              47.97
};

// Busca preco do produto no GitHub. Respeita _modo_teste (R$1 pra todos)
async function obterPrecoAtual(tipo) {
  try {
    const r = await fetch(PRECOS_URL + '?t=' + Date.now());
    const data = await r.json();

    // Se modo teste ativo: todos viram R$1 (ou preco_teste do produto)
    if (data._modo_teste === true) {
      console.log('Modo teste ativo - aplicando preco_teste');
      const p = data[tipo];
      if (p && typeof p.preco_teste === 'number') return p.preco_teste;
      return 1.00;
    }

    const p = data[tipo];
    if (p && p.ativo && typeof p.preco === 'number') return p.preco;
  } catch (e) {
    console.error('Erro ao buscar precos:', e.message);
  }
  return PRECOS_FALLBACK[tipo] || 47.97;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { paymentData, dadosCliente, tipo, descontoExtra } = req.body;

    if (!paymentData || !dadosCliente || !tipo) {
      return res.status(400).json({
        error: 'Dados incompletos: paymentData, dadosCliente e tipo sao obrigatorios'
      });
    }

    // Valida que tipo eh produto individual (combo usa endpoint separado)
    if (!PRODUTOS.includes(tipo) || tipo === 'combo-completo') {
      return res.status(400).json({
        error: 'Tipo de produto invalido para este endpoint: ' + tipo +
               '. Para combo use /api/pagamento-combo'
      });
    }

    // SEGURANCA: sempre busca preco do servidor, ignora o que veio do cliente
    let precoServidor = await obterPrecoAtual(tipo);

    // Se cliente tem codigo valido, aplica 10% extra (cumulativo com promo)
    if (descontoExtra && descontoExtra > 0 && dadosCliente.codigoCliente) {
      try {
        const c = await buscarCliente(dadosCliente.codigoCliente);
        if (c) {
          precoServidor = Math.round(precoServidor * 0.90 * 100) / 100;
          console.log('Desconto 10% aplicado: cliente recorrente', c.codigo);
        }
      } catch (e) {
        console.log('Erro validar codigo:', e.message);
      }
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;

    const redisClient = createClient({ url: redisUrl });
    redisClient.on('error', err => console.error('Redis:', err));
    await redisClient.connect();
    await redisClient.setEx(`session:${sessionId}`, 7200, JSON.stringify({
      tipo,
      nome: dadosCliente.nome,
      email: dadosCliente.email,
      dados: dadosCliente,
      preco: precoServidor,
      status: 'pending',
      criadoEm: new Date().toISOString()
    }));
    await redisClient.quit();

    const titulo = NOMES_PRODUTOS[tipo] || tipo;
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);

    const paymentBody = {
      transaction_amount: precoServidor,
      description: titulo + ' - Astral IA',
      external_reference: sessionId,
      notification_url: 'https://astralia.online/api/webhook',
      payer: {
        email: dadosCliente.email || 'cliente@astralia.online',
        first_name: (dadosCliente.nome || '').split(' ')[0] || '',
        last_name: (dadosCliente.nome || '').split(' ').slice(1).join(' ') || ''
      },
      metadata: { session_id: sessionId, tipo }
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

    // Se cartao aprovou na hora, ja registra cliente
    if (result.status === 'approved') {
      const rc2 = createClient({ url: redisUrl });
      rc2.on('error', err => console.error('Redis:', err));
      await rc2.connect();
      const existing = await rc2.get(`session:${sessionId}`);
      const sessionObj = existing ? JSON.parse(existing) : {};

      if (!sessionObj.codigoCliente) {
        try {
          const reg = await registrarCompra(
            { ...dadosCliente, preco: precoServidor },
            tipo
          );
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
};
