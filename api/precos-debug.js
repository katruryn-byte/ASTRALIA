// /api/precos-debug.js  — endpoint TEMPORARIO de diagnostico.
// Acesse: https://astralia.online/api/precos-debug
// Mostra exatamente o que o SEU servidor (Vercel) consegue ler do precos.json.
// Pode apagar depois que o teste fechar.

module.exports = async function handler(req, res) {
  const PRECOS_URL = 'https://raw.githubusercontent.com/katruryn-byte/astralia-precos/main/precos.json';
  const url = PRECOS_URL + '?t=' + Date.now();
  const out = { url, agora: new Date().toISOString() };
  try {
    const r = await fetch(url);
    out.httpStatus = r.status;
    out.fetchOk = r.ok;
    const texto = await r.text();
    out.tamanhoBytes = texto.length;
    try {
      const json = JSON.parse(texto);
      out.precosLidos = {};
      for (const k in json) {
        if (k.startsWith('_')) continue;
        out.precosLidos[k] = (json[k] && typeof json[k] === 'object') ? json[k].preco : json[k];
      }
    } catch (e) {
      out.erroAoInterpretarJSON = e.message;
      out.amostraDoQueVeio = texto.slice(0, 300);
    }
  } catch (e) {
    out.erroDeRede = e.message;
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(JSON.stringify(out, null, 2));
}
