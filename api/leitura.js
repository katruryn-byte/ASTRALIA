module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, dados } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt obrigatorio' });

  try {
    let infoAstro = '';
    let planetasReais = [];
    let casasReais = null;
    let aspectosReais = [];
    let baseConhecimento = '';

    if (dados && dados.lat && dados.lon && dados.data) {
      const dt = new Date(dados.data + 'T' + (dados.hora || '12:00') + ':00');
      const body = {
        year: dt.getFullYear(),
        month: dt.getMonth() + 1,
        date: dt.getDate(),
        hours: dt.getHours(),
        minutes: dt.getMinutes(),
        seconds: 0,
        latitude: parseFloat(dados.lat),
        longitude: parseFloat(dados.lon),
        timezone: dados.timezone || -3
      };

      // 1. Planetas
      try {
        const planetasRes = await fetch('https://json.freeastrologyapi.com/western/planets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.FREEASTROLOGY_API_KEY },
          body: JSON.stringify({ ...body, config: { observation_point: 'topocentric', ayanamsha: 'tropical', language: 'pt' } })
        });
        const planetasData = await planetasRes.json();
        if (planetasData && planetasData.output && Array.isArray(planetasData.output)) {
          planetasReais = planetasData.output;
          infoAstro += '\n\nPosicoes REAIS dos planetas:\n';
          planetasData.output.forEach(item => {
            const nome = item.planet?.en || '';
            const signo = item.zodiac_sign?.name?.en || '';
            const grau = item.normDegree ? ` ${item.normDegree.toFixed(2)}` : '';
            const retro = (item.isRetro === 'True' || item.isRetro === true) ? ' (Retrogrado)' : '';
            if (nome && signo) infoAstro += `${nome}: ${signo}${grau}${retro}\n`;
          });
        }
      } catch(e) { console.log('Planetas erro:', e.message); }

      // 2. Casas
      try {
        const casasRes = await fetch('https://json.freeastrologyapi.com/western/houses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.FREEASTROLOGY_API_KEY },
          body: JSON.stringify({ ...body, config: { observation_point: 'topocentric', ayanamsha: 'tropical', house_system: 'Placidus', language: 'pt' } })
        });
        const casasData = await casasRes.json();
        if (casasData && casasData.output && casasData.output.Houses) {
          casasReais = casasData.output;
          infoAstro += '\nCasas Astrologicas (Placidus):\n';
          casasData.output.Houses.forEach(casa => {
            const signo = casa.zodiac_sign?.name?.en || '';
            const grau = casa.normDegree ? ` ${casa.normDegree.toFixed(2)}` : '';
            if (signo) infoAstro += `Casa ${casa.House}: ${signo}${grau}\n`;
          });
        }
      } catch(e) { console.log('Casas erro:', e.message); }

      // 3. Aspectos
      try {
        const aspectosRes = await fetch('https://json.freeastrologyapi.com/western/aspects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.FREEASTROLOGY_API_KEY },
          body: JSON.stringify({
            ...body,
            config: {
              observation_point: 'topocentric',
              ayanamsha: 'tropical',
              language: 'pt',
              allowed_aspects: ['Conjunction','Opposition','Trine','Square','Sextile','Quincunx'],
              orb_values: { Conjunction:8, Opposition:8, Trine:8, Square:8, Sextile:6, Quincunx:5 }
            }
          })
        });
        const aspectosData = await aspectosRes.json();
        if (aspectosData && aspectosData.output && Array.isArray(aspectosData.output)) {
          aspectosReais = aspectosData.output;
          infoAstro += '\nAspectos Principais:\n';
          aspectosData.output.slice(0, 15).forEach(item => {
            const p1 = item.planet_1?.en || '';
            const p2 = item.planet_2?.en || '';
            const asp = item.aspect?.en || '';
            if (p1 && p2 && asp) infoAstro += `${p1} ${asp} ${p2}\n`;
          });
        }
      } catch(e) { console.log('Aspectos erro:', e.message); }

      // 4. Base de conhecimento
      try {
        const planetaMap = {
          'Sun':'sol','Moon':'lua','Mercury':'mercurio','Venus':'venus',
          'Mars':'marte','Jupiter':'jupiter','Saturn':'saturno',
          'Uranus':'urano','Neptune':'netuno','Pluto':'plutao'
        };
        const signoMap = {
          'Aries':'aries','Taurus':'touro','Gemini':'gemeos','Cancer':'cancer',
          'Leo':'leao','Virgo':'virgem','Libra':'libra','Scorpio':'escorpiao',
          'Sagittarius':'sagitario','Capricorn':'capricornio','Aquarius':'aquario','Pisces':'peixes'
        };
        const nomePT = {
          'Sun':'Sol','Moon':'Lua','Mercury':'Mercúrio','Venus':'Vênus',
          'Mars':'Marte','Jupiter':'Júpiter','Saturn':'Saturno',
          'Uranus':'Urano','Neptune':'Netuno','Pluto':'Plutão'
        };
        const casaColMap = {
          1:'casa 1 ',2:'casa 2 ',3:'casa 3',4:'casa 4',
          6:'casa 6',7:'casa 7',8:'casa 8',9:'casa 9',
          10:'casa 10',11:'casa 11',12:'casa 12'
        };
        const planetasPrincipais = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

        const baseRes = await fetch(`${process.env.KNOWLEDGE_BASE_URL}?limit=500`);
        const baseData = await baseRes.json();

        if (baseData && Array.isArray(baseData) && baseData.length > 0) {
          baseConhecimento = '\n\n=== BASE DE CONHECIMENTO — USE COMO FUNDAMENTO DA LEITURA ===\n\n';

          for (const planetaEn of planetasPrincipais) {
            const planetaItem = planetasReais.find(p => p.planet?.en === planetaEn);
            if (!planetaItem) continue;

            const planetaKey = planetaMap[planetaEn];
            const signoEn = planetaItem.zodiac_sign?.name?.en || '';
            const signoKey = signoMap[signoEn] || signoEn.toLowerCase();

            let casaNum = 1;
            if (casasReais && casasReais.Houses) {
              const grauPlaneta = planetaItem.fullDegree || 0;
              const houses = casasReais.Houses;
              for (let i = 0; i < houses.length; i++) {
                const proxIdx = (i + 1) % 12;
                const inicio = houses[i].degree;
                const fim = houses[proxIdx].degree;
                if (fim > inicio) {
                  if (grauPlaneta >= inicio && grauPlaneta < fim) { casaNum = houses[i].House; break; }
                } else {
                  if (grauPlaneta >= inicio || grauPlaneta < fim) { casaNum = houses[i].House; break; }
                }
              }
            }

            const casaCol = casaColMap[casaNum];
            const linha = baseData.find(row => {
              const vals = Object.values(row);
              const rP = (vals[0]||'').toString().toLowerCase().trim();
              const rS = (vals[1]||'').toString().toLowerCase().trim();
              return rP === planetaKey && rS === signoKey;
            });

            if (linha && casaCol) {
              const interp = linha[casaCol] || '';
              if (interp && interp.length > 10) {
                baseConhecimento += `--- ${nomePT[planetaEn]} em ${signoEn} na Casa ${casaNum} ---\n${interp}\n\n`;
              }
            }
          }
          baseConhecimento += '=== FIM DA BASE — EXPANDA COM LINGUAGEM ELOQUENTE E INSPIRADORA ===\n';
        }
      } catch(e) { console.log('Base conhecimento erro:', e.message); }
    }

    // 5. Salva no Google Sheets
    if (dados && dados.nome) {
      try {
        await fetch(process.env.SHEETDB_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [{
              Data: new Date().toLocaleString('pt-BR'),
              Nome: dados.nome || '',
              WhatsApp: dados.whatsapp || '',
              Email: dados.email || '',
              Cidade: dados.cidade || '',
              Nascimento: dados.data || '',
              Hora: dados.hora || '',
              Tipo: dados.tipo || '',
              Valor: dados.preco || ''
            }]
          })
        });
      } catch(e) { console.log('SheetDB erro:', e.message); }
    }

    // 6. Gera leitura com Claude
    const promptFinal = prompt + infoAstro + baseConhecimento;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{ role: 'user', content: promptFinal }]
      })
    });

    const data = await response.json();
    if (planetasReais.length > 0) data.planetas = planetasReais;
    if (casasReais) data.casas = casasReais;
    if (aspectosReais.length > 0) data.aspectos = aspectosReais;
    return res.status(200).json(data);

  } catch (error) {
    console.log('Erro geral:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
