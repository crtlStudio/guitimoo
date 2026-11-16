// ============================================================
// As contas do jogo de Matemática: os níveis de cada idade, o sorteio das
// contas (sem repetir as últimas), as opções de números e as verificações.
// Sem ecrã: só contas, fácil de testar.
//
// Cada conta é um objeto com tudo o que o ecrã precisa de saber:
//   tipo:            'contar' (3–4), 'soma', 'subtracao' ou 'falta' (4 + ? = 9)
//   a, b:            os dois números da conta (em 'contar' só há o a)
//   texto:           o que aparece no cartão ('5 + 2 = ?'), ou null em 'contar'
//   esquerdaInicial: quantos cubinhos o prato esquerdo já tem ao começar
//   alvoEsquerda:    quantos cubinhos tem de ter o prato esquerdo no fim
//   numeroDireita:   o número que já está no prato direito ao começar (ou null)
//   resposta:        o número que a criança escolhe no fim (ou null em 'contar')
//   chave:           identificador da conta (para o histórico, ex.: 'soma:5:2')
// ============================================================

/**
 * Os níveis de cada idade, do mais fácil para o mais difícil.
 * - maximo: o maior número que aparece (no prato ou como resultado)
 * - minimo: o menor resultado (para as contas não serem fáceis demais)
 * - tipos: que contas podem sair (7–8)
 * - opcoes: quantos números aparecem para escolher no fim
 */
export const NIVEIS = {
  '3-4': [
    { tipos: ['contar'], minimo: 1, maximo: 3 },
    { tipos: ['contar'], minimo: 1, maximo: 5 },
  ],
  '5-6': [
    { tipos: ['soma'], minimo: 2, maximo: 5, opcoes: 3 },
    { tipos: ['soma'], minimo: 3, maximo: 7, opcoes: 3 },
    { tipos: ['soma'], minimo: 4, maximo: 10, opcoes: 3 },
  ],
  '7-8': [
    { tipos: ['soma'], minimo: 5, maximo: 12, opcoes: 4 },
    { tipos: ['soma', 'subtracao'], minimo: 3, maximo: 15, opcoes: 4 },
    { tipos: ['soma', 'subtracao', 'falta'], minimo: 3, maximo: 20, opcoes: 4 },
    { tipos: ['subtracao', 'falta'], minimo: 4, maximo: 20, opcoes: 4 },
  ],
}

/** Quantas contas recentes não podem voltar a sair (guardadas no telemóvel). */
export const HISTORICO = 8

/** As regras do nível (se o nível for inválido, usa o mais próximo). */
export function regrasDoNivel(escalao, nivel) {
  const niveis = NIVEIS[escalao]
  return niveis[Math.min(Math.max(nivel, 0), niveis.length - 1)]
}

/** Monta o objeto de uma conta a partir do tipo e dos números. */
export function criarConta(tipo, a, b = null) {
  switch (tipo) {
    case 'contar': // o número já está no prato direito; pôr a cubinhos no esquerdo
      return { tipo, a, b: null, texto: null, esquerdaInicial: 0, alvoEsquerda: a, numeroDireita: a, resposta: null, chave: `contar:${a}` }
    case 'soma': // pôr a + b cubinhos no esquerdo; depois escolher a + b
      return { tipo, a, b, texto: `${a} + ${b} = ?`, esquerdaInicial: 0, alvoEsquerda: a + b, numeroDireita: null, resposta: a + b, chave: `soma:${a}:${b}` }
    case 'subtracao': // o esquerdo já tem a; tirar b; depois escolher a − b
      return { tipo, a, b, texto: `${a} − ${b} = ?`, esquerdaInicial: a, alvoEsquerda: a - b, numeroDireita: null, resposta: a - b, chave: `subtracao:${a}:${b}` }
    case 'falta': // a + ? = b: o esquerdo já tem a, o direito mostra b; acrescentar até equilibrar
      return { tipo, a, b, texto: `${a} + ? = ${b}`, esquerdaInicial: a, alvoEsquerda: b, numeroDireita: b, resposta: b - a, chave: `falta:${a}:${b}` }
    default:
      throw new Error(`Tipo de conta desconhecido: ${tipo}`)
  }
}

/**
 * TODAS as contas possíveis num nível (são poucas: no máximo umas centenas).
 * Todos os números das contas são pelo menos 1 (nunca "+ 0" nem "− 0").
 */
export function contasPossiveis(escalao, nivel) {
  const { tipos, minimo, maximo } = regrasDoNivel(escalao, nivel)
  const contas = []
  for (const tipo of tipos) {
    if (tipo === 'contar') {
      for (let n = minimo; n <= maximo; n++) contas.push(criarConta('contar', n))
    }
    if (tipo === 'soma') {
      for (let a = 1; a < maximo; a++)
        for (let b = 1; a + b <= maximo; b++) if (a + b >= minimo) contas.push(criarConta('soma', a, b))
    }
    if (tipo === 'subtracao') {
      // a − b, com o a entre o mínimo e o máximo e o resultado pelo menos 1
      for (let a = Math.max(minimo, 2); a <= maximo; a++)
        for (let b = 1; a - b >= 1; b++) contas.push(criarConta('subtracao', a, b))
    }
    if (tipo === 'falta') {
      // a + ? = b, com o "?" pelo menos 1
      for (let b = minimo; b <= maximo; b++) for (let a = 1; a < b; a++) contas.push(criarConta('falta', a, b))
    }
  }
  return contas
}

/**
 * Sorteia uma conta do nível que NÃO esteja no histórico (as últimas que saíram).
 * Se todas estiverem no histórico (níveis com poucas contas), aceita qualquer
 * uma, exceto a última de todas (nunca sai a mesma duas vezes seguidas).
 *
 * Devolve { conta, historico }: o histórico novo, já com esta conta.
 */
export function sortearConta(escalao, nivel, historico = [], aleatorio = Math.random) {
  const todas = contasPossiveis(escalao, nivel)
  let livres = todas.filter((c) => !historico.includes(c.chave))
  if (livres.length === 0) livres = todas.filter((c) => c.chave !== historico[historico.length - 1])
  if (livres.length === 0) livres = todas

  const conta = livres[Math.floor(aleatorio() * livres.length)]
  return { conta, historico: [...historico, conta.chave].slice(-HISTORICO) }
}

/**
 * Os números para escolher no fim: a resposta certa e números perto dela
 * (os erros mais "naturais": um a mais, um a menos...), baralhados.
 * Nunca há números repetidos nem menores do que 1.
 */
export function opcoesDeResposta(resposta, quantas, aleatorio = Math.random) {
  const vizinhos = [1, -1, 2, -2, 3, -3, 4, -4].map((d) => resposta + d).filter((n) => n >= 1)
  // Os mais perto têm mais hipóteses: tira-os por ordem, com um pouco de sorte à mistura
  const errados = vizinhos
    .map((n, i) => ({ n, peso: i + aleatorio() * 3 }))
    .sort((x, y) => x.peso - y.peso)
    .slice(0, quantas - 1)
    .map((x) => x.n)

  const opcoes = [resposta, ...errados]
  // Baralha (Fisher–Yates), para a certa não estar sempre no mesmo sítio
  for (let i = opcoes.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[opcoes[i], opcoes[j]] = [opcoes[j], opcoes[i]]
  }
  return opcoes
}

/**
 * As partes do cartão da conta, pela ordem, cada número com a sua cor:
 * o 1.º número a azul, o 2.º a verde e o "?" (ou a resposta, depois de
 * acertar) a dourado. Os sinais (+, −, =) não têm cor.
 *   5 + 2 = ?   →  5 azul, +, 2 verde, =, ? resposta
 *   4 + ? = 9   →  4 azul, +, ? resposta, =, 9 verde
 * Devolve [{ texto, cor }] (cor: 'azul', 'verde', 'resposta' ou null).
 */
export function partesDaConta(conta, mostrarResposta = false) {
  if (conta.tipo === 'contar') return []
  const resposta = { texto: mostrarResposta ? String(conta.resposta) : '?', cor: 'resposta' }
  const n = (valor, cor) => ({ texto: String(valor), cor })
  const sinal = (texto) => ({ texto, cor: null })
  if (conta.tipo === 'falta') return [n(conta.a, 'azul'), sinal('+'), resposta, sinal('='), n(conta.b, 'verde')]
  const operacao = conta.tipo === 'soma' ? '+' : '−'
  return [n(conta.a, 'azul'), sinal(operacao), n(conta.b, 'verde'), sinal('='), resposta]
}

/** 1.ª validação ("Já está!"): o prato esquerdo tem o número certo de cubinhos? */
export function pratoCerto(conta, naEsquerda) {
  return naEsquerda === conta.alvoEsquerda
}

/** 2.ª validação: o número escolhido é o resultado da conta? */
export function respostaCerta(conta, numero) {
  return numero === conta.resposta
}
