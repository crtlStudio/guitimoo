// ============================================================
// As "coreografias" do dedo nas instruções da Matemática.
//
// Cada demonstração é uma lista de PASSOS (como funcionam: ver
// components/demonstracao/passos.js). Aqui o dedo leva 'azul', 'verde', ...
// (um cubinho) ou um número (um cartão).
//
// Os pontos estão em "cqw" da cena: 1cqw = 1% da largura da cena.
// Na balança a cena é o "mundo" do jogo a sério (100 × 56.25, ver medidas.js).
// ============================================================

// ---------- 1. Balança ----------

/** Centro dos pratos, um pouco acima (onde o dedo larga os cubinhos). */
const PRATO_ESQUERDO = [28, 27]
/** Os cubinhos no chão, à frente da balança (centro da base, em cqw). */
export const CHAO_34 = [
  { id: 'c1', cor: 'verde', x: 38, y: 52 },
  { id: 'c2', cor: 'verde', x: 47, y: 53 },
  { id: 'c3', cor: 'verde', x: 56, y: 52 },
  { id: 'c4', cor: 'verde', x: 65, y: 53 },
]
export const CHAO_CONTAS = [
  { id: 'a1', cor: 'azul', x: 34, y: 52 },
  { id: 'a2', cor: 'azul', x: 42, y: 53 },
  { id: 'a3', cor: 'azul', x: 50, y: 52 },
  { id: 'v1', cor: 'verde', x: 60, y: 53 },
  { id: 'v2', cor: 'verde', x: 68, y: 52 },
]

/** O dedo agarra um cubinho do chão e larga-o no prato esquerdo. */
function levarParaOPrato(chao, id, chaoDepois, pratoDepois) {
  const cubo = chao.find((c) => c.id === id)
  const ponto = [cubo.x, cubo.y - 2.5]
  return [
    { ms: 750, dedo: ponto },
    { ms: 400, toca: 1, leva: cubo.cor, chao: chaoDepois },
    { ms: 900, dedo: PRATO_ESQUERDO },
    { ms: 450, leva: null, prato: pratoDepois },
  ]
}

/** 3–4: o 3 está no prato direito; o dedo põe 3 cubinhos verdes no esquerdo. */
export const PASSOS_34 = [
  { ms: 700, dedo: null, chao: ['c1', 'c2', 'c3', 'c4'], prato: [], certo: false },
  ...levarParaOPrato(CHAO_34, 'c4', ['c1', 'c2', 'c3'], ['verde']),
  ...levarParaOPrato(CHAO_34, 'c3', ['c1', 'c2'], ['verde', 'verde']),
  ...levarParaOPrato(CHAO_34, 'c2', ['c1'], ['verde', 'verde', 'verde']),
  { ms: 2200, dedo: null, certo: true },
]

/**
 * Onde estão as coisas da linha de cima, nas contas (cqw do mundo).
 * Só se vê do x 16 ao 84 do mundo (ver .mundo no CSS).
 */
const Y_DA_CONTA = 19
export const CONTAS = {
  cartao: { de: 18, ate: 46, y: Y_DA_CONTA }, // o fundo do cartão da conta
  // Cada parte da conta, no seu sítio: 2 + 1 = ?
  partes: [
    { texto: '2', cor: 'azul', x: 22 },
    { texto: '+', x: 27 },
    { texto: '1', cor: 'verde', x: 32 },
    { texto: '=', x: 37 },
    { texto: '?', cor: 'resultado', x: 42 },
  ],
  azul: [22, Y_DA_CONTA], // o "2" da conta
  verde: [32, Y_DA_CONTA], // o "1"
  jaEsta: [52, Y_DA_CONTA], // o botão ✓
  opcoes: [
    { numero: 2, x: 61, y: Y_DA_CONTA },
    { numero: 3, x: 69, y: Y_DA_CONTA },
    { numero: 4, x: 77, y: Y_DA_CONTA },
  ],
}

/**
 * 5–6 e 7–8: a conta 2 + 1. O dedo toca 2 vezes no 2 (azul) e leva 2
 * cubinhos azuis; toca 2 vezes no 1 (verde) e leva 1 verde; carrega no ✓;
 * escolhe o 3, que vai para o prato direito e a balança fica direita.
 */
export const PASSOS_CONTAS = [
  { ms: 700, dedo: null, chao: CHAO_CONTAS.map((c) => c.id), prato: [], fase: 'montar', direita: null, certo: false },
  { ms: 750, dedo: CONTAS.azul },
  { ms: 900, toca: 2 },
  ...levarParaOPrato(CHAO_CONTAS, 'a1', ['a2', 'a3', 'v1', 'v2'], ['azul']),
  ...levarParaOPrato(CHAO_CONTAS, 'a2', ['a3', 'v1', 'v2'], ['azul', 'azul']),
  { ms: 900, dedo: CONTAS.verde },
  { ms: 900, toca: 2 },
  ...levarParaOPrato(CHAO_CONTAS, 'v1', ['a3', 'v2'], ['azul', 'azul', 'verde']),
  { ms: 900, dedo: CONTAS.jaEsta },
  { ms: 600, toca: 1, fase: 'escolher' },
  { ms: 900, dedo: [CONTAS.opcoes[1].x, CONTAS.opcoes[1].y] },
  { ms: 600, toca: 1, direita: 3, fase: 'certo' },
  { ms: 2200, dedo: null, certo: true },
]

// ---------- 2. Lógica ----------

/** A fila (azul, verde, azul, verde, ?) e os cubinhos para escolher (cqw da cena). */
export const LOGICA = {
  fila: ['azul', 'verde', 'azul', 'verde', null],
  xDaFila: [14, 30, 46, 62, 80],
  yDaFila: 20,
  opcoes: [
    { cor: 'verde', x: 30 },
    { cor: 'azul', x: 52 },
    { cor: 'laranja', x: 74 },
  ],
  yDasOpcoes: 49,
}

/** O dedo passa pela fila, agarra o azul e larga-o no "?". */
export const PASSOS_LOGICA = [
  { ms: 600, dedo: null, apanhado: false, cheio: false, certo: false },
  { ms: 800, dedo: [LOGICA.xDaFila[0], LOGICA.yDaFila + 6] },
  { ms: 1300, dedo: [LOGICA.xDaFila[3], LOGICA.yDaFila + 6] },
  { ms: 800, dedo: [LOGICA.opcoes[1].x, LOGICA.yDasOpcoes + 2] },
  { ms: 400, toca: 1, leva: 'azul', apanhado: true },
  { ms: 1000, dedo: [LOGICA.xDaFila[4], LOGICA.yDaFila + 2] },
  { ms: 450, leva: null, cheio: true },
  { ms: 2200, dedo: null, certo: true },
]

// ---------- 3. Quantidades ----------

/** As duas linhas do quadro e o que há em baixo (cqw da cena). */
export const QUANTIDADES = {
  y: [14, 34], // o centro de cada linha
  caixaDoNumero: 70, // o centro da caixa da direita
  cartoes: [
    { numero: 2, x: 40 },
    { numero: 3, x: 56 },
    { numero: 4, x: 72 },
  ],
  monte: 56, // onde está o monte de cubinhos azuis
  yDeBaixo: 52,
}

/**
 * 1.ª linha: o dedo leva o cartão "3" para o lado dos 3 cubinhos.
 * 2.ª linha: leva 2 cubinhos do monte para a caixa do "2".
 */
export const PASSOS_QUANTIDADES = [
  { ms: 600, dedo: null, linha1: false, cartaoLevado: false, naCaixa: 0, certo: false },
  { ms: 800, dedo: [QUANTIDADES.cartoes[1].x, QUANTIDADES.yDeBaixo] },
  { ms: 400, toca: 1, leva: 3, cartaoLevado: true },
  { ms: 1000, dedo: [QUANTIDADES.caixaDoNumero, QUANTIDADES.y[0]] },
  { ms: 700, leva: null, linha1: true },
  { ms: 800, dedo: [QUANTIDADES.monte, QUANTIDADES.yDeBaixo] },
  { ms: 400, toca: 1, leva: 'azul' },
  { ms: 900, dedo: [QUANTIDADES.caixaDoNumero, QUANTIDADES.y[1]] },
  { ms: 400, leva: null, naCaixa: 1 },
  { ms: 750, dedo: [QUANTIDADES.monte, QUANTIDADES.yDeBaixo] },
  { ms: 400, toca: 1, leva: 'azul' },
  { ms: 900, dedo: [QUANTIDADES.caixaDoNumero, QUANTIDADES.y[1]] },
  { ms: 400, leva: null, naCaixa: 2 },
  { ms: 2200, dedo: null, certo: true },
]
