const { MercadoPagoConfig, Payment } = require('mercadopago');
const { createClient } = require('redis');
const { registrarCompra, buscarCliente } = require('./cliente');

// ================================================================
// Backend multi-produto do portal Astralia.online
// Aceita qualquer um dos 9 produtos. Fallback compativel: se nao
// vier 'produto', assume 'mapaastralpersonalizado' (cliente legado).
// ================================================================

const PRECOS_URL = 'https://raw.githubusercontent.com/katruryn-byte/astralia-precos/main/precos.json';
const PRODUTO_PADRAO = 'mapaastralpersonalizado';

const CATALOGO = {
  mapaastral:              { nome: 'Mapa Astral',                   isca: true  },
  mapaastralpersonalizado: { nome: 'Mapa Astral Personalizado',     isca: false },
  mapadasorte:             { nome: 'Mapa da Sorte',                 isca: false },
  mapaprofissional:        { nome: 'Mapa Profissional',             isca: false },
  mapakarmico:             { nome: 'Mapa Karmico',                  isca: false },
  lilith:                  { nome: 'Mapa da Lilith',                isca: false },
  sinastria:               { nome: 'Sinastria do Casal',            isca: false },
  revolucaosolar:          { nome: 'Revolucao Solar',               isca: false },
  mapaprevisoes:           { nome: 'Mapa de Previsoes - 18 Meses',  isca: false }
};

// IMPORTANTE: nunca "chuta" preco. Se nao conseguir confirmar na fonte
// oficial (precos.json no GitHub), devolve {ok:false} e o pagamento e'
// RECUSADO. Melhor falhar visivel do que cobrar valor errado.
async function obterPrecoAtual(produto) {
  if (!CATALOGO[produto]) return { ok: false, motivo: 'produto_invalido' };
  try {
    const r = await fetch(PRECOS_URL + '?t=' + Date.now());
    if (!r.ok) return { ok: false, motivo: `github_http_${r.status}` };
    const data = await r.json();
    const p = data[produto];
    if (!p) return { ok: false, motivo: 'produto_ausente_no_json' };
    if (p.ativo !== true) return { ok: false, motivo: 'produto_inativo' };
    if (typeof p.preco !== 'number') return { ok: false, motivo: 'preco_nao_numerico' };
    return { ok: true, preco: p.preco };
  } catch (e) {
    return { ok: false, motivo: 'fetch_falhou:' + e.message };
  }
}

function montarNotificationUrl(req) {
  const envUrl = process.env.WEBHOOK_URL;
  if (envUrl && /^https:\/\//.test(envUrl)) return envUrl;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (host && !/localhost|127\.0\.0\.1/.test(host)) return `https://${host}/api/webhook`;
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { paymentData, dadosCliente, descontoExtra: descTopo, produto: produtoTopo } = req.body;
    if (!paymentData || !dadosCliente) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const produto = produtoTopo || dadosCliente.produto || PRODUTO_PADRAO;
    if (!CATALOGO[produto]) {
      return res.status(400).json({ error: 'Produto invalido', code: 'INVALID_PRODUCT', produto });
    }
    const meta = CATALOGO[produto];

    // SEGURANCA: preco sempre da fonte oficial. Se nao confirmar, RECUSA.
    const precoInfo = await obterPrecoAtual(produto);
    if (!precoInfo.ok) {
      console.error('Preco nao confirmado:', produto, precoInfo.motivo);
      return res.status(400).json({
        error: 'Nao foi possivel confirmar o preco no momento. Nenhuma cobranca foi feita. Tente novamente em instantes.',
        code: 'PRICE_UNCONFIRMED',
        motivo: precoInfo.motivo,
        produto
      });
    }
    let precoServidor = precoInfo.preco;

    // Desconto -10% se o codigo de cliente existir de verdade
    const descontoExtra = descTopo ?? dadosCliente.descontoExtra;
    const codigoCliente = dadosCliente.codigoCliente;
    if (descontoExtra && descontoExtra > 0 && codigoCliente) {
      try {
        const c = await buscarCliente(codigoCliente);
        if (c) precoServidor = Math.round(precoServidor * 0.90 * 100) / 100;
      } catch (e) { console.log('Erro validar codigo:', e.message); }
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;

    const rc = createClient({ url: redisUrl });
    rc.on('error', err => console.error('Redis:', err));
    await rc.connect();
    await rc.setEx(`session:${sessionId}`, 7200, JSON.stringify({
      produto, tipo: produto, isca: meta.isca,
      nome: dadosCliente.nome, email: dadosCliente.email,
      dados: dadosCliente, preco: precoServidor,
      status: 'pending', criadoEm: new Date().toISOString()
    }));
    await rc.quit();

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);

    const paymentBody = {
      transaction_amount: precoServidor,
      description: `${meta.nome} - Astralia`,
      external_reference: sessionId,
      payer: {
        email: dadosCliente.email || 'cliente@astralia.online',
        first_name: dadosCliente.nome?.split(' ')[0] || '',
        last_name: dadosCliente.nome?.split(' ').slice(1).join(' ') || ''
      },
      metadata: { session_id: sessionId, produto, tipo: produto }
    };

    const notificationUrl = montarNotificationUrl(req);
    if (notificationUrl) paymentBody.notification_url = notificationUrl;

    if (paymentData.payment_method_id === 'pix') {
      paymentBody.payment_method_id = 'pix';
      const cpf = (dadosCliente.cpf || '').replace(/\D/g, '');
      if (cpf.length === 11) {
        paymentBody.payer.identification = { type: 'CPF', number: cpf };
      } else {
        return res.status(400).json({ error: 'CPF obrigatorio para PIX', code: 'CPF_REQUIRED' });
      }
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
      await marcarPago(sessionId, result.id, redisUrl, dadosCliente, precoServidor, produto);
    }

    return res.status(200).json({
      sessionId, produto,
      paymentId: result.id,
      status: result.status,
      status_detail: result.status_detail,
      valorCobrado: precoServidor,
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

async function marcarPago(sessionId, paymentId, redisUrl, dadosCliente, preco, produtoParam) {
  const rc = createClient({ url: redisUrl });
  rc.on('error', err => console.error('Redis:', err));
  await rc.connect();
  const existing = await rc.get(`session:${sessionId}`);
  const sessionObj = existing ? JSON.parse(existing) : {};
  const produto = produtoParam || sessionObj.produto || PRODUTO_PADRAO;
  const meta = CATALOGO[produto];

  if (!sessionObj.codigoCliente) {
    try {
      const reg = await registrarCompra({ ...dadosCliente, preco }, produto);
      sessionObj.codigoCliente = reg.codigo;
      sessionObj.novoCliente = reg.novoCliente;
    } catch (e) { console.error('Erro registro cliente:', e.message); }
  }

  sessionObj.produto = produto;
  sessionObj.isca = !!(meta && meta.isca);
  sessionObj.status = 'pago_aguardando_geracao';
  sessionObj.paymentId = String(paymentId);
  sessionObj.paidAt = new Date().toISOString();
  await rc.setEx(`session:${sessionId}`, 60 * 60 * 24 * 30, JSON.stringify(sessionObj));

  if (meta && !meta.isca) {
    await rc.lPush(`fila:${produto}`, JSON.stringify({
      sessionId, produto,
      codigoCliente: sessionObj.codigoCliente,
      dados: sessionObj.dados, preco, paidAt: sessionObj.paidAt
    }));
  }
  await rc.quit();
}

module.exports.marcarPago = marcarPago;
module.exports.CATALOGO = CATALOGO;
