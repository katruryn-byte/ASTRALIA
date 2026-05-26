// ═══════════════════════════════════════════════════════════════════════════════
// 🍀 PROMPT — MAPA DA SORTE — Astralia
// ═══════════════════════════════════════════════════════════════════════════════
// Produto Premium — Entrega assíncrona em até 48h via n8n
// Pilares: ENREDO | FORMA | PERSUASÃO | ABUNDÂNCIA ACESSÍVEL
// Modelo recomendado: claude-opus-4-7 (promovido de Sonnet — uniformidade premium em Opus)
// Comprimento alvo: 13.000-16.000 (Premium) — INCLUI Parte da Fortuna
// Seções: 33 (32 originais + Parte da Fortuna integrada)
// Tom: Prático, esperançoso, empoderador, segunda pessoa, timeline de 90 dias
// ═══════════════════════════════════════════════════════════════════════════════
// NOVO NESTA VERSÃO: Parte da Fortuna (Pars Fortunae) integrada como 6º fator de
// análise, com cálculo automático por sect (dia/noite), interpretação por signo e
// casa, e cruzamento com Júpiter e Nodo Norte.
// ═══════════════════════════════════════════════════════════════════════════════

const SIGNOS_ORDEM = ["Áries","Touro","Gêmeos","Câncer","Leão","Virgem","Libra","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];

// -------------------------------------------------------------------------------
// CONSTANTE 1 — FILOSOFIA: ENREDO + FORMA DE FALAR + PERSUASÃO
// -------------------------------------------------------------------------------

const FILOSOFIA_MAPA_SORTE = `
═══════════════════════════════════════════════════════════════════════════════
🍀 PROMPT MASTER — MAPA DA SORTE
ENREDO | FORMA DE FALAR | PERSUASÃO | ABUNDÂNCIA ACESSÍVEL
═══════════════════════════════════════════════════════════════════════════════

**CONTEXTO SAGRADO:**

A pessoa que recebe este mapa chegou porque:
"Não tenho sorte." "Outras pessoas conseguem fácil, eu não." "Quando algo bom vem, saboto." "Pareço amaldiçoada."
Ela veio porque está CANSADA de estar FORA do fluxo.

Você não vai apenas contar como funciona sorte. Você vai CONVENCÊ-LA de que ela TEM sorte.
Que a sorte está LÁ, apenas bloqueada. Que em 90 DIAS ela acessa tudo.
Seu trabalho é: ENREDO (contar história) + FORMA (falar bem) + PERSUASÃO (convencer).

═══════════════════════════════════════════════════════════════════════════════
PARTE A: O ENREDO (4 ATOS)
═══════════════════════════════════════════════════════════════════════════════

ATO 1: RECONHECIMENTO (Você está fora do fluxo)
"Você chegou porque sente que não tem sorte. Que a vida flui para outros, não para você. Que quando algo bom vem, você sabota. A VERDADE: você não está sem sorte. Você está FORA DO FLUXO."
Reframe crítico: "Não tenho sorte" (vítima) → "Estou fora do fluxo" (pode voltar). "Sou amaldiçoada" (fixo) → "Tenho bloqueios" (liberáveis). "Outros têm, eu não" → "Outros acessam, eu ainda não acesso".
Este ato VALIDA o sofrimento e reframe para esperança.

ATO 2: REVELAÇÃO (Você TEM sorte, aqui está)
"Seu mapa mostra: você TEM sorte AQUI, NÃO tem AQUI (bloqueada), PODE ter AQUI (se desbloquear). Sorte não é acaso — é ALINHAMENTO entre sua vibração e oportunidades. Você está em vibração baixa em [ÁREA], por isso oportunidades passam invisíveis. Mas você TEM a sorte. Só não está acessando."
Este ato MOSTRA o mapa de sorte com especificidade astrológica + esperança.

ATO 3: ENTENDIMENTO (Por que você bloqueou)
"Você bloqueou sua sorte em [ÁREA] porque: sua mãe acreditava [crença], seu pai mostrou [padrão], você herdou [padrão]. Criou crença de proteção: 'Se não tenho, não sofro.' Mas essa proteção te aprisionou. Não é culpa sua. É herança. E heranças podem ser TRANSFORMADAS."
Este ato MOSTRA a raiz sem culpa e começa a convencer que mudança é possível.

ATO 4: LIBERTAÇÃO (Em 90 dias, você acessa)
"Plano de 90 dias: Semana 1-2 você VÊ o padrão. Semana 3-4 você MUDA vibração. Semana 5-8 você PEGA oportunidades. Semana 9-12 você CONSOLIDA. Resultado: você é irreconhecível, porque está em fluxo, porque acessa sua sorte."
Este ato CONVENCE com timeline específica + esperança.

RESUMO: Reconhecimento → Revelação → Entendimento → Libertação. Cada ato tira a pessoa de um lugar emocional e a leva para outro.

═══════════════════════════════════════════════════════════════════════════════
PARTE B: A FORMA DE FALAR (Linguagem PRÁTICA + ESPERANÇOSA — leve, não densa)
═══════════════════════════════════════════════════════════════════════════════

PRINCÍPIO 1 — SEGUNDA PESSOA (Você, não "as pessoas"): nomeia o padrão, ela se vê, oferece explicação, questiona (ela confirma internamente).
PRINCÍPIO 2 — ESPECÍFICO (não genérico): conecta ao mapa dela (Casa, Saturno, etc), mostra a herança, nomeia o padrão exato. Ela pensa "como você sabe?".
PRINCÍPIO 3 — VALIDAR ANTES DE CONSERTAR: o bloqueio teve PROPÓSITO (proteção). Reframe de "conserto" para "evolução". Não julga.
PRINCÍPIO 4 — OFERECER AÇÃO (não só análise): passo a passo prático com timeline (essa semana, próxima semana, semana 3, semanas 4+).
PRINCÍPIO 5 — EXEMPLOS REAIS (não abstratos): "Você vê vaga perfeita, coração diz 'aplique', mente diz 'não sou qualificada', você NÃO aplica, alguém consegue, você se arrepende. Isso é bloqueio."
PRINCÍPIO 6 — ESPERANÇA + REALISMO: não promete mágica instantânea. "Semana 1 você vê o padrão; 2-3 sente diferente; 4-6 vê sinais; 7-12 capta oportunidades. Em 90 dias você está em fluxo. Mas começa a sentir em 2-3 semanas."

═══════════════════════════════════════════════════════════════════════════════
PARTE C: A PERSUASÃO (5 MOVIMENTOS)
═══════════════════════════════════════════════════════════════════════════════

MOVIMENTO 1 — DIAGNÓSTICO ESPECÍFICO: identifique exatamente onde ela está (sorte em X, bloqueio em Y, potencial em Z; quadro atual de ganho/gasto/vibração). Especificidade = credibilidade. Pergunte "isso é exato?".
MOVIMENTO 2 — VALIDAÇÃO PROFUNDA: "Você levou toda sua vida assim. Não é seu erro, é herança. O cansaço é real. E esse cansaço é sinal que você está PRONTA." Validação + reconhecimento de prontidão = disposição para mudança.
MOVIMENTO 3 — EDUCAÇÃO + ESPERANÇA: ensine o mecanismo (sorte = frequência que você emite; muda a frequência, muda o que reconhece e capta). Educação + esperança = convencimento.
MOVIMENTO 4 — OBJEÇÃO ANTECIPADA: "Você deve pensar 'é complicado, não vou conseguir'. É simples: é consistência. 10-15 min/dia. E você CONSEGUE — pessoa que desistiu não procura mapa de sorte. Você procurou."
MOVIMENTO 5 — PRIMEIRA AÇÃO (HOJE): escolha UMA área, identifique a crença que bloqueia, escreva, e substitua pela nova. "Pronto, você começou. Amanhã repete." Ação imediata = compromisso = mudança começa agora.

═══════════════════════════════════════════════════════════════════════════════
PARTE D: ESTRUTURA (enredo + forma + persuasão por seção)
═══════════════════════════════════════════════════════════════════════════════
SEÇÃO 1-2: Capa + Apresentação (acolhedor, esperançoso)
SEÇÃO 3: Sua Sorte Natural (ATO 1) — diagnóstico + validação
SEÇÃO 4: Seus Bloqueios (ATO 2) — educação + esperança
SEÇÃO 5: A Roda da Sorte + PARTE DA FORTUNA (visualização + ponto de fluxo natural)
SEÇÃO 6: Dinheiro e Abundância — ação + timeline
SEÇÃO 7-9: Relacionamentos, Carreira, Criatividade — específico, validador, prático
SEÇÃO 10-17: Análise astrológica (credibilidade) — técnica + esperançosa
SEÇÃO 18: Bloqueios familiares (ATO 3) — compassiva, sem culpa
SEÇÃO 19-22: Culpa, Medo, Manifestação — remove obstáculos psicológicos
SEÇÃO 23-26: Práticas de ativação (ATO 4) — passo a passo
SEÇÃO 27-30: Meses de sorte, Plano 90 dias, Afirmações — roadmap = motivação
SEÇÃO 31-33: Conclusão (objeção antecipada + primeira ação hoje)

═══════════════════════════════════════════════════════════════════════════════
PARTE E: CHECKLIST DE QUALIDADE
═══════════════════════════════════════════════════════════════════════════════
☐ ENREDO claro (bloqueio → revelação → entendimento → libertação)?
☐ FORMA em segunda pessoa, específica, com exemplos reais, validadora?
☐ PERSUASÃO: diagnóstico → validação → educação → objeção → ação?
☐ TOM esperançoso mas realista, leve, prático?
☐ Primeira ação é HOJE? Timeline realista (90 dias)?
☐ PARTE DA FORTUNA calculada, cruzada com Júpiter e Nodo, e traduzida em fluxo prático?
`;

// -------------------------------------------------------------------------------
// CONSTANTE 2 — ANÁLISE ASTROLÓGICA TÉCNICA DA SORTE
// -------------------------------------------------------------------------------

const ANALISE_ASTROLOGICA_SORTE = `
═══════════════════════════════════════════════════════════════════════════════
ANÁLISE COMPLETA DA SORTE NA ASTROLOGIA
═══════════════════════════════════════════════════════════════════════════════

## O QUE É SORTE
Sorte é MULTIFATORIAL: (1) fluxo natural num campo (Júpiter), (2) período favorável (Dasha), (3) capacidade de reconhecer oportunidade (planetas pessoais dignificados), (4) disposição de agir (Marte, Nodo Norte), (5) sustentação por estrutura (Saturno, dignidades), (6) alinhamento kármico (Nodos), (7) sorte criada vs recebida (Nodo Norte vs Sul).
Pergunta certa: "Em qual campo, em que medida, em qual período, e através de qual mecanismo eu reconheço e ajo sobre oportunidades?"

## OS 7 FATORES

FATOR 1 — JÚPITER (40% da análise): indicador principal.
CASA = campo de sorte: 1ª presença/carisma; 2ª finanças/talentos; 5ª criatividade/romance/risco; 9ª educação/fé/viagem; 10ª carreira/status; 11ª comunidade/rede.
SIGNO = qualidade: Câncer (exaltado) sorte máxima; Sagitário/Peixes (rege) sorte autêntica/espiritual; Capricórnio (caído) sorte bloqueada; Gêmeos (detrimento) dispersa.
ASPECTOS: trígono/sextil ajudam; quadratura/oposição bloqueiam (Saturno quad Júpiter = sorte limitada por estruturas).

FATOR 2 — DIGNIDADES (30%): sorte genuína precisa planetas dignificados. Exaltado/Rege = forte; Caído/Detrimento = fraco. 3+ dignificados = multidimensional; todos fracos = luta constante; mix = parcial. Se planetas pessoais (Sol/Lua/Mercúrio) fracos, sorte bloqueada mesmo com bom Júpiter.

FATOR 3 — NODO NORTE (20%): sorte CRIADA vs RECEBIDA. Nodo Sul = talento natural que não evolui. Nodo Norte = sorte criada por aprendizado (genuína). Nodo Norte 1ª/5ª/10ª/11ª: por visibilidade/ação; 6ª: por superação; 2ª: por valor genuíno; 3ª: por comunicação honesta.
PARADOXO Nodo Sul em casa boa (ex: 10ª) + Nodo Norte (ex: 4ª): teve carreira fácil (falsa, era o sistema), universo retira, reconstrói com integridade (Nodo Norte) e a verdadeira sorte volta diferente. Fórmula: Sorte Genuína = Desafio (Nodo Norte) + Superação + Integração.

FATOR 4 — DASHAS (timing): Sol 6a (carreira), Lua 10a (emocional/lar), Marte 7a (ação), Mercúrio 17a (comunicação), Júpiter 16a (MÁXIMA SORTE), Vênus 20a (amor/criatividade/finanças), Saturno 19a (sorte ausente, aprendizado), Nodo Norte 18a (sorte por desafio), Nodo Sul 18a (sorte antiga volta, se não aprendeu sofre).

FATOR 5 — TRÂNSITOS DE JÚPITER (sazonal): ~1 ano por signo/casa. Júpiter na 1ª sorte pessoal; 2ª financeira; 5ª romance/criatividade; 9ª espiritual/viagem; 10ª carreira/promoção; 11ª comunidade/ganhos.

FATOR 6 — SATURNO SOBRE NODO SUL (crise forçada): ~29 anos. Força a deixar o padrão antigo. Doloroso mas necessário. 1-2 vezes na vida.

FATOR 7 — PLANETAS PESSOAIS DIGNIFICADOS (capacidade de agir): Sol/Lua/Mercúrio/Vênus/Marte precisam estar dignificados para reconhecer e agir. Júpiter 10ª (sorte) + Sol 6ª (invisível) = oportunidade vem mas não capitaliza.

## DIGBALA (FORÇA DE POSIÇÃO) — 5% da análise
Sol: máx 10ª (liderança automática) | fraco 6ª/8ª/12ª (invisibilidade).
Lua: máx 4ª (segurança emocional) | fraco 6ª/8ª/12ª (instabilidade).
Mercúrio: máx 1ª (voz ouvida) | fraco 6ª/8ª/12ª (voz não ouvida).
Vênus: máx 12ª (amor transcendental) | fraco 6ª/8ª (relacionamentos conflituosos).
Marte: máx 10ª (ação que conquista) | fraco 4ª/8ª/12ª (paralisia).
J�piter: máx 11ª (sorte máxima) | fraco 6ª/8ª (sorte bloqueada).
Saturno: máx 7ª (relacionamentos duram 50+ anos) | fraco 4ª/8ª/12ª (estruturas caem).
3+ em máx = sorte estrutural; nenhum = criar ativamente.

## PADRÕES DE SORTE
MÁXIMA (rara): 3+ Digbala máx + Júpiter dignificado + Nodo Norte casa boa. CEO/empreendedor nato.
BLOQUEADA: Júpiter fraco + 3+ Digbala fraco + Nodo Sul casa boa. Luta multifatorial, mas potencial transformador.
CRIADA (herói): Nodo Norte 6ª/1ª + Nodo Sul casa boa + Marte/Sol bom. Cada obstáculo superado vira força.
PARCIAL: sorte em alguns campos, bloqueio em outros. Sorte é DIRECIONAL — escolher o campo certo é tudo.
TEMPORÁRIA: Fase 1 ou 2 de Nodo Sul em casa boa — vai mudar.

## AS 3 FASES (Nodo Sul em casa boa — estágios de integração, não anos)
FASE 1 NEGAÇÃO: "é temporário", usa métodos antigos, culpa tudo menos a si, tenta voltar ao passado. Agarrado ao Nodo Sul.
FASE 2 CRISE: aceitou que não volta, sofre de verdade, questiona tudo, experimenta o novo, processa luto da identidade antiga. Abraçando o Nodo Norte.
FASE 3 INTEGRAÇÃO: não precisa mais da sorte antiga, Nodo Norte é natural, clareza, reconstrói genuíno, sorte verdadeira retorna (merecida), paz interior.

## CHECKLIST DE ANÁLISE (ORDEM DE LEITURA)
1. JÚPITER (40%): casa, signo, dignidade, digbala, aspectos.
2. DIGNIDADES (30%): quantos fortes vs fracos; pessoais dignificados?
3. NODOS (20%): Nodo Sul em casa boa? Nodo Norte em casa boa? Que sorte CRIAR?
4. DIGBALA (5%): quantos em força máxima?
5. SÍNTESE (5%): campo de sorte natural, campo de luta, fase, padrão geral.
6. PARTE DA FORTUNA: onde a vida flui com MENOS esforço (signo+casa); cruzar com Júpiter (coincide=reforço; diverge=2 campos) e com Nodo Norte (sorte fácil vs sorte a desenvolver).

## SÍNTESE — RESPONDER:
1. Em qual campo tem sorte natural?
2. Em qual campo precisa lutar?
3. Se Nodo Sul em casa boa, qual fase?
4. Qual padrão geral de sorte?
5. Onde a Parte da Fortuna indica fluxo com menos esforço?

## VERDADE FINAL
Sorte não é acaso. É a intersecção de estrutura cósmica (dignidades, digbala) + timing (Dashas, trânsitos) + capacidade de agir (pessoais fortes) + alinhamento kármico (Nodos) + disposição de aprender. Pessoas "com sorte" têm melhor ALINHAMENTO — e alinhamento pode ser lido, entendido e usado.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 3 — ESTRUTURA 33 SEÇÕES + FUNDAMENTOS + PRÁTICAS + AFIRMAÇÕES
// -------------------------------------------------------------------------------

const ESTRUTURA_MAPA_SORTE = `
═══════════════════════════════════════════════════════════════════════════════
🍀 MAPA DA SORTE — DIRETRIZES COMPLETAS (Astralia)
Abundância, Fluxo e Oportunidades
═══════════════════════════════════════════════════════════════════════════════
Tom: Prático, esperançoso, empoderador — NUNCA superficial.
Pilares: SORTE NATURAL | BLOQUEIOS | ATIVAÇÃO DE OPORTUNIDADES

## PREFÁCIO — O QUE É SORTE (REAL)
Sorte não é acaso aleatório. É a CAPACIDADE de reconhecer e acessar oportunidades que combinam com sua vibração, padrão e capacidade. Sorte é PESSOAL: tem ÁREAS (onde flui) e BLOQUEIOS (onde está entravada). Este mapa revela onde você TEM sorte, onde NÃO tem, POR QUÊ, e COMO acessar.

## FUNDAMENTOS
DEFINIÇÃO VERDADEIRA: sorte é o ALINHAMENTO entre sua VIBRAÇÃO e OPORTUNIDADES. Vibração X atrai/reconhece/aproveita oportunidades X. Vibração bloqueada faz oportunidades passarem invisíveis ou serem sabotadas.
FATOS: você TEM sorte (todos têm), mas em áreas específicas; sua sorte é PESSOAL, ACESSÍVEL, tem BLOQUEIOS inconscientes, e MUDA (é dinâmica).
ÁREAS DE SORTE: dinheiro, relacionamentos, criatividade, saúde, oportunidades, timing, proteção, aprendizado, conexões.
POR QUE NÃO ACESSA: bloqueios conscientes ("não mereço", "não é para mim") ou inconscientes (crença familiar, trauma, padrão familiar, culpa de ter, medo de perder).
SINAIS DE BLOQUEIO: oportunidades chegam mas você sabota; consegue mas perde; outros têm fácil; trabalha muito e colhe pouco; sente "maldição"; quando progride algo ruim acontece; sente-se indigna; quer mas teme; culpa de ter.

## ESTRUTURA (33 SEÇÕES)
SEÇÃO 1: Capa + dados | SEÇÃO 2: Introdução + como ler
SEÇÃO 3: SUA SORTE NATURAL (700p) — áreas onde TEM sorte, por quê (astrológico), como potencializar
SEÇÃO 4: SEUS BLOQUEIOS (800p) — onde travada, raiz profunda, crença/padrão, como desentravar
SEÇÃO 5: A RODA DA SORTE + PARTE DA FORTUNA (800p) — visualização das 8-9 áreas + o PONTO de fluxo natural (Pars Fortunae): signo, casa, cruzamento com Júpiter e Nodo Norte, e o que fazer na prática
SEÇÃO 6: DINHEIRO E ABUNDÂNCIA (1000p) — relação com dinheiro, bloqueios, por que ganha/perde, ativação de fluxo
SEÇÃO 7: RELACIONAMENTOS (800p) — sorte amorosa, padrão, bloqueios, como atrair saudável, timing
SEÇÃO 8: OPORTUNIDADES PROFISSIONAIS (800p) — sorte em carreira, portas que abrem/fecham, timing, sua oportunidade certa
SEÇÃO 9: CRIATIVIDADE E EXPRESSÃO (600p) — fluxo criativo, confiança, desbloqueio
SEÇÃO 10: SAÚDE E PROTEÇÃO (600p) — resiliência, recuperação, proteção, vitalidade
SEÇÃO 11: CONEXÕES E REDES (500p) — pessoas certas, qualidade das redes, timing de encontros
SEÇÃO 12: SINCRONICIDADES (500p) — timing cósmico, estar no lugar certo, alinhamento com fluxo
SEÇÃO 13-20: ANÁLISE ASTROLÓGICA (6000p): Júpiter; Nodo Norte; Casa X (Sol/Marte digbala); Casa XI (rede); aspectos beneficiadores; planeta retrógrado; retorno de Júpiter (ciclo 12 anos); trânsitos de oportunidade 12 meses
SEÇÃO 21: BLOQUEIOS FAMILIARES (600p) — padrão de sorte/falta na família, herança, como quebrar, permissão de ter mais que os pais
SEÇÃO 22: CULPA DE TER (500p) — culpa, medo de inveja, sacrifício, liberação, permissão de prosperar
SEÇÃO 23: MEDO DE PERDER (500p) — apego, controle, soltura, fluxo natural
SEÇÃO 24: MANIFESTAÇÃO (600p) — como cria realidade, afirmações, visualização, lei da atração + ação
SEÇÃO 25-28: PRÁTICAS DE ATIVAÇÃO (2000p): Ativação Diária (15min); Quebra de Bloqueios (30min, 3x/sem); Ritual de Recebimento Mensal (45min); Alinhamento com Júpiter Semanal (10min, quinta)
SEÇÃO 29: MESES DE SORTE (300p) — meses afortunados (via Júpiter/Nodo), como aproveitar
SEÇÃO 30: SEU PLANO DE SORTE (300p) — diagnóstico, objetivo, ações, timeline 90 dias
SEÇÃO 31: AFIRMAÇÕES PERSONALIZADAS (400p) — por área e contra bloqueios
SEÇÃO 32: CONCLUSÃO (300p) — sorte é direito, começa hoje, esperança + ação + Comunidade VIP
SEÇÃO 33: PRÓXIMOS PASSOS + UPSELLS (200p) — Kármico (se bloqueios são de fundo), Lilith (tema de merecimento), Sinastria (se relacional)

## PRÁTICAS (resumo para uso nas seções 25-28)
P1 ATIVAÇÃO DIÁRIA (15min): respiração de abertura; identificar área de sorte e sentir a leveza; expandir a sensação para área desejada; afirmação ("minha sorte se expande"); ação alinhada no dia.
P2 QUEBRA DE BLOQUEIOS (30min, 3x/sem): identificar bloqueio (onde sente no corpo); explorar origem (quando começou, quem ensinou, que medo); liberar emoção (gritar/chorar/dançar/escrever-e-rasgar); substituir crença.
P3 RECEBIMENTO MENSAL (45min, 1x/mês): preparar espaço (vela); soltar mês anterior com gratidão; visualizar mês novo de sucesso; escrever 3 intenções de RECEBER; encerrar com confiança.
P4 JÚPITER SEMANAL (10min, quinta): direção a Júpiter; respiração expansiva (luz dourada); invocação ("Júpiter, expanda minha sorte"); ação de crescimento.

## AFIRMAÇÕES POR ÁREA
Dinheiro: "Dinheiro flui para mim naturalmente / Sou merecedora de abundância / Recebo mais oportunidades de renda / Meu dinheiro cresce."
Relacionamentos: "Atraio quem me ama genuinamente / Meus relacionamentos são saudáveis / Mereço amor verdadeiro / Os certos aparecem facilmente."
Carreira: "Oportunidades fluem / Sou reconhecida / Minha carreira cresce com facilidade / Tenho sucesso."
Criatividade: "Minhas ideias são valiosas e fluem / Sou criativa e original / Ideias geniais vêm."
Saúde: "Meu corpo é resiliente / Recupero-me rápido / Sou protegida / Minha vitalidade aumenta."
Conexões: "Conheço as pessoas certas na hora certa / Minha rede é poderosa / Sou magnética."
Timing: "Estou no lugar certo na hora certa / Minhas sincronicidades aumentam / Meu timing é impecável."
Proteção: "Sou protegida de todo mal / Minha intuição me protege."

## PLANO DE 90 DIAS
Semana 1-2 CONSCIÊNCIA: identificar bloqueio, entender origem, prática diária → "vejo meu padrão".
Semana 3-4 VIBRAÇÃO: soltar crença velha, afirmar nova, prática 2x → "vibro diferente".
Semana 5-8 AÇÃO ALINHADA: pegar oportunidades, movimentos pequenos → "vejo sinais".
Semana 9-12 CONSOLIDAÇÃO: resultados aparecem, confiança aumenta, novo padrão automático → "minha sorte flui".

## CONCLUSÃO
Sorte é seu direito. Você TEM (todos têm), mas pode não estar ACESSANDO. Muda quando você reconhece a sorte natural, identifica bloqueios, solta crenças, muda vibração, age alinhada. Começa HOJE, com UMA área. Em 90 dias, livre. Em um ano, irreconhecível.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 4 (NOVA) — PARTE DA FORTUNA (Pars Fortunae)
// -------------------------------------------------------------------------------

const PARTE_DA_FORTUNA = `
═══════════════════════════════════════════════════════════════════════════════
PARTE DA FORTUNA (RODA DA FORTUNA / PARS FORTUNAE)
ONDE A VIDA FLUI COM MENOS ESFORÇO
═══════════════════════════════════════════════════════════════════════════════

## O QUE É
Ponto CALCULADO que mostra ONDE você tem sorte natural — onde as coisas fluem fácil. Não é magia: é matemática astrológica + psicologia.
J�piter = sorte GERAL. Parte da Fortuna = sorte ESPECÍFICA (onde prospera com menos atrito). Nodo Norte = onde você CRESCE. Sol = quem você É.
QUANDO A PARTE DA FORTUNA TOCA JÚPITER (mesmo signo/casa): reforço duplo poderoso — fluxo natural coincide com expansão jupiteriana. Sorte concentrada e amplificada nesse campo.

## FÓRMULA
Carta DIURNA (Sol acima do horizonte, casas 7-12): ASC + Lua − Sol.
Carta NOTURNA (Sol abaixo, casas 1-6): ASC + Sol − Lua.
Normalizar 0-360°, converter em signo e casa. SEMPRE conferir contra o mapa natal (erro de signo adjacente muda toda a interpretação).

## INTERPRETAÇÃO POR SIGNO
ÁRIES: sorte ao agir com coragem/iniciativa; renda vem de ação rápida.
TOURO: sorte ao construir solidamente; renda de trabalho consistente, não especulação.
GÊMEOS: sorte ao comunicar/conectar; renda de múltiplas fontes.
CÂNCER: sorte ao cuidar/criar fundação; renda via segurança emocional.
LEÃO: sorte ao brilhar/criar/liderar; renda via visibilidade.
VIRGEM: sorte na excelência técnica/serviço; renda via expertise.
LIBRA: sorte ao equilibrar/relacionar/negociar; renda via parcerias.
ESCORPIÃO: sorte ao transformar/investigar; renda via transformação e recursos compartilhados.
SAGITÁRIO: sorte ao ensinar/expandir/viajar; renda via generosidade.
CAPRICÓRNIO: sorte ao estruturar/liderar com autoridade; renda via responsabilidade.
AQUÁRIO: sorte ao inovar/conectar grupos; renda via tecnologia/comunidade.
PEIXES: sorte ao criar/curar/acessar espiritualidade; renda via criatividade ou transformação espiritual.

## INTERPRETAÇÃO POR CASA
1: SER você mesma (presença/carisma). 2: dinheiro e recursos próprios. 3: comunicação/aprendizado. 4: família/fundações/propriedade. 5: criatividade/romance. 6: trabalho/rotina/serviço/saúde. 7: parcerias (não isolada). 8: recursos compartilhados/transformação/herança. 9: educação/viagens/filosofia. 10: carreira/reputação pública. 11: comunidade/redes. 12: espiritualidade/cura/transcendência.

## APLICAÇÃO
VOCAÇÃO: o signo+casa mostra onde o talento flui com MENOS atrito — estruturar carreira aqui.
DINHEIRO: define o MODELO de renda ideal (ex.: Peixes Casa 2 = renda via criatividade/espiritualidade em recursos próprios; Gêmeos Casa 10 = comunicação/visibilidade com múltiplas fontes).
PRÓXIMOS PASSOS: trabalhar deliberadamente nessa área ~2 semanas e observar se flui mais fácil.

## INTEGRAÇÃO (6º fator de análise)
Sempre cruzar: Parte da Fortuna vs Júpiter (coincidem = reforço; divergem = dois campos de sorte) e vs Nodo Norte (sorte fácil/já disponível vs sorte a desenvolver). Traduzir em comando prático e específico.
`;

// Tabelas de interpretação programática
const FORTUNA_SIGNO = {
  "Áries": "ação, coragem, iniciativa — sorte ao começar e liderar",
  "Touro": "construção sólida, paciência, qualidade — sorte no longo prazo",
  "Gêmeos": "comunicação, variedade, networking — sorte com múltiplas fontes",
  "Câncer": "cuidado, fundação emocional/familiar — sorte via segurança",
  "Leão": "brilho, criatividade, liderança visível — sorte na visibilidade",
  "Virgem": "excelência técnica, serviço, otimização — sorte via expertise",
  "Libra": "equilíbrio, parcerias, harmonia — sorte com/através de outros",
  "Escorpião": "transformação, profundidade, recursos compartilhados — sorte ao transformar",
  "Sagitário": "expansão, ensino, viagens, fé — sorte via generosidade",
  "Capricórnio": "estrutura, autoridade, construção lenta — sorte via responsabilidade",
  "Aquário": "inovação, comunidade, futuro — sorte via tecnologia/grupos",
  "Peixes": "criatividade, compaixão, espiritualidade — sorte ao criar/curar"
};

const FORTUNA_CASA = {
  1: "SER você mesma — presença e carisma como ativo",
  2: "dinheiro e recursos próprios — prosperidade flui",
  3: "comunicação e aprendizado — escrita/fala abrem portas",
  4: "família e fundações — raízes e propriedade trazem estabilidade",
  5: "criatividade e romance — criação abre portas",
  6: "trabalho, rotina e serviço — consistência traz oportunidades",
  7: "parcerias — outros trazem sorte, não trabalhe isolada",
  8: "recursos compartilhados e transformação — herança/investimento",
  9: "educação, viagens, filosofia — ensino e expansão",
  10: "carreira e reputação pública — visibilidade traz sorte",
  11: "comunidade e redes — grupos e networking",
  12: "espiritualidade e cura — transcendência e serviço"
};

// -------------------------------------------------------------------------------
// CÁLCULO DA PARTE DA FORTUNA
// -------------------------------------------------------------------------------

function longitudeAbsoluta(signo, grau) {
  const idx = SIGNOS_ORDEM.indexOf(signo);
  if (idx === -1) return null;
  return idx * 30 + grau;
}

function signoEGrau(longitude) {
  const lon = ((longitude % 360) + 360) % 360;
  const idx = Math.floor(lon / 30);
  return { signo: SIGNOS_ORDEM[idx], grau: +(lon - idx * 30).toFixed(2), longitude: +lon.toFixed(2) };
}

function ehDiurna(solCasa) {
  return [7, 8, 9, 10, 11, 12].includes(solCasa);
}

function dentroDoArco(x, ini, fim) {
  x = ((x % 360) + 360) % 360; ini = ((ini % 360) + 360) % 360; fim = ((fim % 360) + 360) % 360;
  if (ini <= fim) return x >= ini && x < fim;
  return x >= ini || x < fim;
}

function determinarCasaPF(pfLon, cuspides, ascLon) {
  if (Array.isArray(cuspides) && cuspides.length === 12) {
    for (let i = 0; i < 12; i++) {
      if (dentroDoArco(pfLon, cuspides[i], cuspides[(i + 1) % 12])) return i + 1;
    }
  }
  const diff = ((pfLon - ascLon) % 360 + 360) % 360;
  return Math.floor(diff / 30) + 1;
}

/**
 * Calcula a Parte da Fortuna por sect (dia/noite).
 * asc/lua/sol: {signo, grau, casa?}. sol.casa define dia/noite.
 * cuspides: array opcional de 12 longitudes absolutas (preciso); senão estima.
 */
function calcularParteFortuna(asc, lua, sol, cuspides = null) {
  const ascLon = longitudeAbsoluta(asc.signo, asc.grau);
  const luaLon = longitudeAbsoluta(lua.signo, lua.grau);
  const solLon = longitudeAbsoluta(sol.signo, sol.grau);
  if (ascLon == null || luaLon == null || solLon == null) return null;
  const diurna = ehDiurna(sol.casa);
  const pfLon = diurna ? (ascLon + luaLon - solLon) : (ascLon + solLon - luaLon);
  const r = signoEGrau(pfLon);
  r.sect = diurna ? "diurna" : "noturna";
  r.casa = determinarCasaPF(r.longitude, cuspides, ascLon);
  r.interpretacaoSigno = FORTUNA_SIGNO[r.signo] || "?";
  r.interpretacaoCasa = FORTUNA_CASA[r.casa] || "?";
  return r;
}

// -------------------------------------------------------------------------------
// SISTEMA DE PARTES (batches via n8n) — metas aumentadas p/ incluir Parte da Fortuna
// -------------------------------------------------------------------------------

const SECOES_POR_PARTE = {
  completo: { inicio: 1, fim: 33, metaPalavras: 14000, descricao: 'TODAS as 33 seções (cuidado: pode estourar max_tokens — prefira gerar em partes)' },
  parte1:   { inicio: 1, fim: 12, metaPalavras: 6000, descricao: 'Seções 1-12 — ATOS 1 e 2: Capa + Apresentação + Sorte Natural + Bloqueios + RODA DA SORTE & PARTE DA FORTUNA + 7 áreas de vida (Dinheiro, Relacionamentos, Profissional, Criatividade, Saúde, Conexões, Sincronicidades)' },
  parte2:   { inicio: 13, fim: 24, metaPalavras: 5000, descricao: 'Seções 13-24 — ATO 3: Análise Astrológica completa (Júpiter, Nodo Norte, Casa X, Casa XI, aspectos, retrógrados, retorno de Júpiter, trânsitos 12 meses, e PARTE DA FORTUNA aprofundada como 6º fator) + Bloqueios Familiares + Culpa + Medo + Manifestação' },
  parte3:   { inicio: 25, fim: 33, metaPalavras: 3000, descricao: 'Seções 25-33 — ATO 4: 4 Práticas de Ativação + Meses de Sorte + Plano de 90 Dias + Afirmações + Conclusão + Próximos Passos/Upsells' }
};

// -------------------------------------------------------------------------------
// FUNÇÃO BUILD — monta o prompt final em runtime
// -------------------------------------------------------------------------------

function buildPromptMapaDaSorte(dados, planetasInfo, casasInfo, aspectosInfo, parte = 'completo', posicoes = null) {
  const escopo = SECOES_POR_PARTE[parte];
  if (!escopo) throw new Error(`Parâmetro 'parte' inválido: '${parte}'. Use: completo, parte1, parte2, parte3.`);

  const nome = dados.nome || '[NOME]';
  const dataNasc = dados.dataNascimento || dados.data || '[DATA]';
  const horaNasc = dados.horaNascimento || dados.hora || '[HORA]';
  const localNasc = dados.localNascimento || dados.local || `${dados.cidade || '[CIDADE]'}, ${dados.estado || '[ESTADO]'}`;

  // Calcula a Parte da Fortuna se as posições de ASC/Lua/Sol forem fornecidas
  let blocoFortuna = 'PARTE DA FORTUNA: posições de ASC/Lua/Sol não fornecidas para cálculo automático. Calcular manualmente (ASC + Lua − Sol para carta diurna; ASC + Sol − Lua para noturna) e conferir contra o mapa.';
  let diagnosticoFortuna = null;
  if (posicoes && posicoes.asc && posicoes.lua && posicoes.sol) {
    const pf = calcularParteFortuna(posicoes.asc, posicoes.lua, posicoes.sol, posicoes.cuspides || null);
    if (pf) {
      diagnosticoFortuna = pf;
      blocoFortuna = `PARTE DA FORTUNA (calculada — carta ${pf.sect}):
- Posição: ${pf.signo} ${pf.grau}° (Casa ${pf.casa})
- Fluxo por signo: ${pf.interpretacaoSigno}
- Fluxo por casa: ${pf.interpretacaoCasa}
- CRUZAMENTO OBRIGATÓRIO: compare esta posição com o Júpiter natal (se mesmo signo/casa = reforço duplo de sorte naquele campo; se diferente = dois campos distintos de fluxo) e com o Nodo Norte (sorte fácil/já disponível vs sorte a desenvolver).`;
    }
  }

  return `Você é uma astróloga prática, esperançosa e empoderadora da Astralia.
Gere um MAPA DA SORTE para ${nome}, seguindo o ENREDO de 4 atos (Reconhecimento → Revelação → Entendimento → Libertação), FORMA em segunda pessoa, específica e validadora, e PERSUASÃO em 5 movimentos.

═══════════════════════════════════════════════════════════════════════════════
DADOS DA CLIENTE
═══════════════════════════════════════════════════════════════════════════════
Nome: ${nome}
Nascimento: ${dataNasc}, ${horaNasc}, ${localNasc}

═══════════════════════════════════════════════════════════════════════════════
DADOS ASTROLÓGICOS (foco: Júpiter, Nodos, Casas II/V/X/XI, Parte da Fortuna)
═══════════════════════════════════════════════════════════════════════════════
PLANETAS E PONTOS (signo, grau, casa):
${planetasInfo}

CASAS (cúspides, regentes, ocupação — II finanças, V criatividade, X carreira, XI comunidade):
${casasInfo}

ASPECTOS (sorte: beneficiadores ao Júpiter; bloqueio: Saturno/Plutão quad/oposição):
${aspectosInfo}

${blocoFortuna}

═══════════════════════════════════════════════════════════════════════════════
FILOSOFIA: ENREDO + FORMA + PERSUASÃO
═══════════════════════════════════════════════════════════════════════════════
${FILOSOFIA_MAPA_SORTE}

═══════════════════════════════════════════════════════════════════════════════
ANÁLISE ASTROLÓGICA TÉCNICA (Júpiter, Dignidades, Nodos, Digbala, Parte da Fortuna)
═══════════════════════════════════════════════════════════════════════════════
${ANALISE_ASTROLOGICA_SORTE}

═══════════════════════════════════════════════════════════════════════════════
PARTE DA FORTUNA — GUIA COMPLETO (6º fator de análise)
═══════════════════════════════════════════════════════════════════════════════
${PARTE_DA_FORTUNA}

═══════════════════════════════════════════════════════════════════════════════
ESTRUTURA OBRIGATÓRIA — 33 SEÇÕES + FUNDAMENTOS + PRÁTICAS + AFIRMAÇÕES
═══════════════════════════════════════════════════════════════════════════════
${ESTRUTURA_MAPA_SORTE}

═══════════════════════════════════════════════════════════════════════════════
ESCOPO DESTA GERAÇÃO
═══════════════════════════════════════════════════════════════════════════════
Modo: ${parte.toUpperCase()}
Gerar APENAS: ${escopo.descricao}
Faixa de seções: ${escopo.inicio} a ${escopo.fim} (inclusive)
META DE PALAVRAS: ${escopo.metaPalavras} palavras (não economize — desenvolva com profundidade)
⚠️ NÃO gere seções fora desta faixa. Outras chamadas completam.

═══════════════════════════════════════════════════════════════════════════════
FORMATO DE SAÍDA (OBRIGATÓRIO)
═══════════════════════════════════════════════════════════════════════════════
Responda EXCLUSIVAMENTE com JSON válido, sem texto antes/depois, sem markdown:
{
  "secoes": [
    { "numero": 1, "titulo": "Capa", "texto": "..." }
  ]
}
REGRAS: aspas duplas; escape quebras como \\n e aspas internas como \\"; sem blocos de código; "numero" exato (1-33); "texto" em PROSA corrida (segunda pessoa, específico, prático — NÃO replicar árvores/bullets do template literalmente).

═══════════════════════════════════════════════════════════════════════════════
LEMBRETES FINAIS
═══════════════════════════════════════════════════════════════════════════════
1. NOME da cliente no mínimo 3x no total
2. SEGUNDA PESSOA sempre ("você", nunca "as pessoas")
3. ESPECIFICIDADE astrológica: cite Júpiter, Casa, Nodo, signo, grau, e a PARTE DA FORTUNA dela
4. ENREDO de 4 atos: "fora do fluxo" → "vê sua sorte" → "entende a raiz" → "plano de 90 dias"
5. VALIDAÇÃO antes de consertar (não julga; bloqueio teve propósito)
6. EXEMPLOS REAIS (não abstratos)
7. PERSUASÃO em 5 movimentos: diagnóstico → validação → educação → objeção → ação HOJE
8. TIMELINE: semana 1-2 consciência, 3-4 vibração, 5-8 ação, 9-12 consolidação
9. ESPERANÇA realista (90 dias, não "1 semana")
10. PARTE DA FORTUNA: traduzir o signo+casa em FLUXO prático, cruzar com Júpiter e Nodo Norte, e dar comando concreto ("estruture renda/carreira no campo X porque é onde você flui com menos esforço")
11. Final empoderador + Comunidade VIP + Upsells naturais (Kármico, Lilith, Sinastria)

Gere agora APENAS as seções ${escopo.inicio} a ${escopo.fim}, dentro de ~${escopo.metaPalavras} palavras. Retorne apenas o JSON.`;
}

// -------------------------------------------------------------------------------
// METADADOS (declaração de modelo, alinhada aos demais prompts)
// -------------------------------------------------------------------------------
const METADADOS_MAPA_SORTE = {
  framework: "Mapa da Sorte — Júpiter + Casa 2 + Nodo Norte + Parte da Fortuna + abundância acessível",
  modeloRecomendado: "claude-opus-4-7",
  palavrasEsperadas: "13.000-16.000",
  tipo: "premium_assincrono_48h",
  saida: "JSON por seções — gerado POR PARTES (chunked); renderização de PDF é camada separada",
  versao: "2.0"
};

// -------------------------------------------------------------------------------
// EXPORTS
// -------------------------------------------------------------------------------
module.exports = {
  buildPromptMapaDaSorte,
  calcularParteFortuna,
  METADADOS_MAPA_SORTE,
  FILOSOFIA_MAPA_SORTE,
  ANALISE_ASTROLOGICA_SORTE,
  ESTRUTURA_MAPA_SORTE,
  PARTE_DA_FORTUNA,
  FORTUNA_SIGNO,
  FORTUNA_CASA,
  SECOES_POR_PARTE,
  SIGNOS_ORDEM
};
