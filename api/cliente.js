// api/cliente.js
// Sistema de cliente unificado entre todos os produtos Astralia.
// Gera codigo unico, rastreia produtos adquiridos, aplica desconto recorrente.
// Adaptado da versao da Lilith com nomenclatura nova (hifen, lowercase).

const { createClient } = require('redis');

// 8 produtos + 1 combo. Nomenclatura padronizada com hifen.
const PRODUTOS = [
  'mapa-astral',                // isca R$17,97
  'mapa-astral-personalizado',  // premium R$197,97
  'revolucao-solar',
  'mapa-profissional',
  'sinastria',
  'mapa-karmico',
  'mapa-previsoes',
  'mapa-da-sorte',
  'combo-completo'              // tipo agregador
];

// Prefixos pro codigo do cliente: ASTRO-XXX-XXXXXX
const PREFIXOS = {
  'mapa-astral':                'AST',
  'mapa-astral-personalizado':  'PER',
  'revolucao-solar':            'REV',
  'mapa-profissional':          'PRO',
  'sinastria':                  'SIN',
  'mapa-karmico':               'KAR',
  'mapa-previsoes':             'PRE',
  'mapa-da-sorte':              'SOR',
  'combo-completo':             'COM'
};

// Nomes legiveis pra usar em emails, mensagens, WhatsApp, etc
const NOMES_PRODUTOS = {
  'mapa-astral':                'Mapa Astral Natal',
  'mapa-astral-personalizado':  'Mapa Astral Personalizado',
  'revolucao-solar':            'Revolução Solar',
  'mapa-profissional':          'Mapa Profissional',
  'sinastria':                  'Sinastria Amorosa',
  'mapa-karmico':               'Mapa Kármico',
  'mapa-previsoes':             'Mapa de Previsões',
  'mapa-da-sorte':              'Mapa da Sorte',
  'combo-completo':             'Guia Astral Completo'
};

// Simbolos astrologicos por produto. Frontend importa daqui pra cards,
// modais, emails, WhatsApp - tudo puxa do mesmo lugar.
// Combina simbolos astrologicos reais (☉ ☽ ♀ ♃ ♄ ☋ ⚸) com emoji
// quando o astrologico nao comunica claramente o que e o produto.
const SIMBOLOS_PRODUTOS = {
  'mapa-astral':                '☉',      // Sol - essencia astrologica basica
  'mapa-astral-personalizado':  '✦',      // Estrela - leitura premium completa
  'revolucao-solar':            '☀',      // Sol em revolucao - ciclo anual
  'mapa-profissional':          '♎',      // Libra/Casa 10 - carreira (MC)
  'sinastria':                  '♀',      // Venus - amor e relacoes
  'mapa-karmico':               '☋',      // Nodo Sul - heranca da alma
  'mapa-previsoes':             '♄',      // Saturno - tempo e ciclos
  'mapa-da-sorte':              '♃',      // Jupiter - sorte e expansao
  'combo-completo':             '✧'       // Estrela ornamental - jornada completa
};

// Mesma logica, versao emoji - util quando o cliente esta em WhatsApp
// ou em ambientes que renderizam emoji melhor que simbolo unicode
const EMOJIS_PRODUTOS = {
  'mapa-astral':                '⭐',
  'mapa-astral-personalizado':  '✨',
  'revolucao-solar':            '☀️',
  'mapa-profissional':          '💼',
  'sinastria':                  '💞',
  'mapa-karmico':               '⚖️',
  'mapa-previsoes':             '🔮',
  'mapa-da-sorte':              '🍀',
  'combo-completo':             '🌟'
};

// Gera codigo unico tipo ASTRO-KAR-X7F2Q9 (sem caracteres confusos O/0, I/1)
function gerarCodigo(produtoBase) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  const prefixo = PREFIXOS[produtoBase] || 'AST';
  return `ASTRO-${prefixo}-${random}`;
}

async function conectarRedis() {
  const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;
  const rc = createClient({ url: redisUrl });
  rc.on('error', e => console.error('Redis cliente:', e));
  await rc.connect();
  return rc;
}

// Cria/atualiza cliente apos compra aprovada
async function registrarCompra(dadosCliente, produto) {
  const rc = await conectarRedis();
  try {
    let codigo;

    // 1) Se cliente ja tem codigo (vinha como recorrente), usa
    if (dadosCliente.codigoCliente) {
      codigo = dadosCliente.codigoCliente.toUpperCase();
      const existente = await rc.get(`cliente:${codigo}`);
      if (existente) {
        const c = JSON.parse(existente);
        if (!c.produtos.includes(produto)) c.produtos.push(produto);
        c.ultimaCompra = new Date().toISOString();
        c.totalGasto = (c.totalGasto || 0) + (dadosCliente.preco || 0);
        c.totalCompras = (c.totalCompras || 0) + 1;
        await rc.setEx(`cliente:${codigo}`, 60 * 60 * 24 * 365 * 2, JSON.stringify(c));
        await rc.quit();
        return { codigo, novoCliente: false, cliente: c };
      }
    }

    // 2) Tenta achar cliente existente por email
    if (dadosCliente.email) {
      const codigoAchado = await rc.get(`cliente:email:${dadosCliente.email.toLowerCase()}`);
      if (codigoAchado) {
        codigo = codigoAchado;
        const existente = await rc.get(`cliente:${codigo}`);
        if (existente) {
          const c = JSON.parse(existente);
          if (!c.produtos.includes(produto)) c.produtos.push(produto);
          c.ultimaCompra = new Date().toISOString();
          c.totalGasto = (c.totalGasto || 0) + (dadosCliente.preco || 0);
          c.totalCompras = (c.totalCompras || 0) + 1;
          await rc.setEx(`cliente:${codigo}`, 60 * 60 * 24 * 365 * 2, JSON.stringify(c));
          await rc.quit();
          return { codigo, novoCliente: false, cliente: c };
        }
      }
    }

    // 3) Cliente novo: gera codigo unico
    codigo = gerarCodigo(produto);
    let tentativas = 0;
    while (await rc.get(`cliente:${codigo}`) && tentativas < 5) {
      codigo = gerarCodigo(produto);
      tentativas++;
    }

    const cliente = {
      codigo,
      nome: dadosCliente.nome,
      email: dadosCliente.email,
      whatsapp: dadosCliente.whatsapp,
      genero: dadosCliente.genero,
      dataNascimento: dadosCliente.data,
      horaNascimento: dadosCliente.hora,
      cidadeNascimento: dadosCliente.cidade,
      lat: dadosCliente.lat,
      lon: dadosCliente.lon,
      produtos: [produto],
      primeiraCompra: new Date().toISOString(),
      ultimaCompra: new Date().toISOString(),
      totalGasto: dadosCliente.preco || 0,
      totalCompras: 1
    };

    await rc.setEx(`cliente:${codigo}`, 60 * 60 * 24 * 365 * 2, JSON.stringify(cliente));
    if (dadosCliente.email) {
      await rc.setEx(`cliente:email:${dadosCliente.email.toLowerCase()}`, 60 * 60 * 24 * 365 * 2, codigo);
    }
    await rc.quit();
    return { codigo, novoCliente: true, cliente };

  } catch (e) {
    await rc.quit();
    console.error('Erro registrar compra:', e.message);
    throw e;
  }
}

// Busca cliente por codigo
async function buscarCliente(codigo) {
  if (!codigo) return null;
  const rc = await conectarRedis();
  try {
    const data = await rc.get(`cliente:${codigo.toUpperCase()}`);
    await rc.quit();
    return data ? JSON.parse(data) : null;
  } catch (e) {
    await rc.quit();
    return null;
  }
}

// Sugere proximo produto seguindo estrategia de upsell/downsell.
// REGRA CRITICA: mapa-astral-personalizado contem mapa-astral simples.
// - Quem comprou personalizado NUNCA recebe upsell de simples
// - Quem comprou simples PODE receber personalizado como upgrade
// - Combos NUNCA misturam os dois
function sugerirProximoProduto(produtosAdquiridos = [], produtoAtual = null) {
  const ja = new Set([...produtosAdquiridos, produtoAtual].filter(p => p));

  // Se tem Personalizado, considera o simples como ja adquirido
  if (ja.has('mapa-astral-personalizado')) {
    ja.add('mapa-astral');
  }

  // Se comprou combo, considera todos os mapas do combo como adquiridos
  if (ja.has('combo-completo')) {
    ja.add('mapa-astral-personalizado');
    ja.add('mapa-astral');
    ja.add('mapa-karmico');
    ja.add('mapa-previsoes');
    ja.add('mapa-profissional');
    ja.add('mapa-da-sorte');
    ja.add('revolucao-solar');
    // sinastria NAO esta no combo padrao (decisao recomendada)
  }

  // UPSELL: mapas principais com maior valor agregado
  const upsellPrincipais = ['mapa-astral-personalizado', 'mapa-karmico', 'mapa-previsoes'];
  const upsellDisponiveis = upsellPrincipais.filter(p => !ja.has(p));

  // DOWNSELL: mapas complementares
  const downsellOpcoes = ['mapa-da-sorte', 'sinastria', 'mapa-profissional', 'revolucao-solar'];
  const downsellDisponiveis = downsellOpcoes.filter(p => !ja.has(p));

  // COMBO: so vale oferecer se ainda tem Personalizado E Karmico disponiveis
  // (porque sao os dois mapas mais caros que justificam o combo)
  const podeCombo = upsellDisponiveis.includes('mapa-astral-personalizado') &&
                    upsellDisponiveis.includes('mapa-karmico');
  const combo = podeCombo ? 'combo-completo' : null;

  // Todos disponiveis pra mostrar como opcoes
  const todosDisponiveis = [
    'mapa-astral-personalizado', 'mapa-karmico', 'mapa-previsoes',
    'sinastria', 'mapa-da-sorte', 'mapa-profissional', 'revolucao-solar'
  ].filter(p => !ja.has(p));

  // Se nao tem Personalizado E nao tem o simples, oferece o simples como entrada
  if (!ja.has('mapa-astral-personalizado') && !ja.has('mapa-astral')) {
    todosDisponiveis.push('mapa-astral');
  }

  return {
    combo,
    upsell: upsellDisponiveis,
    downsell: downsellDisponiveis.slice(0, 1),
    todosDisponiveis,
    jaComprou: Array.from(ja)
  };
}

// Endpoint handler: GET /api/cliente?codigo=XXX -> busca cliente
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const codigo = req.query.codigo;
      if (!codigo) return res.status(400).json({ error: 'Codigo obrigatorio' });
      const cliente = await buscarCliente(codigo);
      if (!cliente) return res.status(404).json({ error: 'Cliente nao encontrado' });

      const sugestoes = sugerirProximoProduto(cliente.produtos, req.query.produto);

      return res.status(200).json({
        codigo: cliente.codigo,
        nome: cliente.nome,
        email: cliente.email,
        whatsapp: cliente.whatsapp,
        dataNascimento: cliente.dataNascimento,
        horaNascimento: cliente.horaNascimento,
        cidadeNascimento: cliente.cidadeNascimento,
        lat: cliente.lat,
        lon: cliente.lon,
        genero: cliente.genero,
        produtos: cliente.produtos,
        totalCompras: cliente.totalCompras,
        sugestoes
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('Erro /api/cliente:', e.message);
    return res.status(500).json({ error: e.message });
  }
};

// Exporta funcoes utilitarias pra outros endpoints usarem
module.exports.gerarCodigo = gerarCodigo;
module.exports.registrarCompra = registrarCompra;
module.exports.buscarCliente = buscarCliente;
module.exports.sugerirProximoProduto = sugerirProximoProduto;
module.exports.PRODUTOS = PRODUTOS;
module.exports.PREFIXOS = PREFIXOS;
module.exports.NOMES_PRODUTOS = NOMES_PRODUTOS;
module.exports.SIMBOLOS_PRODUTOS = SIMBOLOS_PRODUTOS;
module.exports.EMOJIS_PRODUTOS = EMOJIS_PRODUTOS;
