// api/config.js
// Endpoint publico: retorna a chave publica do Mercado Pago pro frontend.
// O frontend usa essa chave pra tokenizar o cartao no browser via MP SDK,
// sem que numero, CVV e validade passem pelos servidores do astralia.
// A chave secreta (MP_ACCESS_TOKEN) NUNCA sai do backend.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    publicKey: process.env.MP_PUBLIC_KEY
  });
};
