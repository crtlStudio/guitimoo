// ============================================================
// As "coreografias" do dedo nas instruções do Português.
//
// Cada demonstração é uma lista de PASSOS (como funcionam: ver
// components/demonstracao/passos.js). Aqui o dedo leva uma letra (um cubo).
//
// Os pontos estão em "cqw" da cena: 1cqw = 1% da largura da cena (100 × 63).
// ============================================================

// ---------- 1. Fácil: o balão da letra ----------

/** O balão com a letra (em cima) e a fila de letras para tocar (em baixo). */
export const BALAO = {
  x: 50,
  y: 19,
  letra: 'G',
  palavra: 'GATO',
  emoji: '🐱',
  xDaLetra: 36, // o "G" grande, à esquerda dentro do balão
}
export const LETRAS = {
  letras: ['B', 'G', 'M', 'A'],
  x: [26, 42, 58, 74],
  y: 49,
  certa: 1, // o G
}

/** O dedo aponta para a letra do balão e depois toca na igual, em baixo. */
export const PASSOS_LETRA = [
  { ms: 700, dedo: null, tocada: false, certo: false },
  { ms: 1500, dedo: [BALAO.xDaLetra, BALAO.y + 4] },
  { ms: 900, dedo: [LETRAS.x[LETRAS.certa], LETRAS.y + 3] },
  { ms: 500, toca: 1, tocada: true },
  { ms: 2200, dedo: null, certo: true },
]

// ---------- 2. Médio e Difícil: a sopa de letras ----------

/** A grelha fica à esquerda: canto de cima em (5, 6), com 52cqw de lado. */
const GRELHA = { x: 5, y: 6, lado: 52 }

/** O centro da célula [linha, coluna] (em cqw da cena). */
export function centroDaCelula(sopa, [linha, coluna]) {
  const celula = GRELHA.lado / sopa.letras.length
  return [GRELHA.x + (coluna + 0.5) * celula, GRELHA.y + (linha + 0.5) * celula]
}

/** Médio: uma palavra (GATO, na horizontal) numa grelha 4 × 4. */
export const SOPA_MEDIO = {
  grelha: GRELHA,
  letras: ['LEBU', 'GATO', 'RMIS', 'PUNE'],
  palavras: [
    {
      palavra: 'GATO',
      emoji: '🐱',
      celulas: [
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
      ],
    },
  ],
}

/** Difícil: duas palavras em direções diferentes (GATO →, SOL ↓) numa grelha 5 × 5. */
export const SOPA_DIFICIL = {
  grelha: GRELHA,
  letras: ['SBUER', 'OGATO', 'LMINP', 'FERUA', 'CANIV'],
  palavras: [
    {
      palavra: 'GATO',
      emoji: '🐱',
      celulas: [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
      ],
    },
    {
      palavra: 'SOL',
      emoji: '☀️',
      celulas: [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
    },
  ],
}

/**
 * O dedo pousa na primeira letra da palavra `n` e arrasta até à última:
 * cada letra fica amarela quando o dedo lá chega; no fim, a palavra fica
 * encontrada (com a sua cor).
 */
function arrastarPalavra(sopa, n, jaEncontradas) {
  const { celulas } = sopa.palavras[n]
  const ponto = (i) => centroDaCelula(sopa, celulas[i])
  return [
    { ms: 800, dedo: ponto(0) },
    { ms: 350, toca: 1, marcadas: celulas.slice(0, 1) },
    // Cada passo: vai para a letra seguinte e marca a que acabou de deixar
    ...celulas.slice(1).map((_, i) => ({ ms: 600, dedo: ponto(i + 1), marcadas: celulas.slice(0, i + 1) })),
    { ms: 400, marcadas: celulas },
    { ms: 500, marcadas: [], encontradas: [...jaEncontradas, n] },
  ]
}

/** Os passos de uma sopa: encontra as palavras todas, uma a seguir à outra. */
function passosDaSopa(sopa) {
  return [
    { ms: 700, dedo: null, marcadas: [], encontradas: [], certo: false },
    ...sopa.palavras.flatMap((_, n) => arrastarPalavra(sopa, n, sopa.palavras.slice(0, n).map((__, k) => k))),
    { ms: 2200, dedo: null, certo: true },
  ]
}

export const PASSOS_SOPA_MEDIO = passosDaSopa(SOPA_MEDIO)
export const PASSOS_SOPA_DIFICIL = passosDaSopa(SOPA_DIFICIL)

// ---------- 3. A caixa das palavras ----------

/**
 * A caixa com o cartão do PATO e os 4 lugares; por baixo, fora da caixa,
 * os cubos baralhados (no Difícil há 2 a mais: L e E).
 */
export const CAIXA = {
  palavra: 'PATO',
  emoji: '🦆',
  cartao: [50, 15], // o centro do cartão
  xDosLugares: [35, 45, 55, 65],
  yDosLugares: 33,
  yDosCubos: 53,
}

const CUBOS_4 = ['O', 'P', 'T', 'A']
const CUBOS_6 = ['O', 'L', 'P', 'T', 'E', 'A']

/** Os cubos lá fora, centrados, 14cqw uns dos outros: [{ letra, x }]. */
export function cubosDaCaixa(escalao) {
  const letras = escalao === '7-8' ? CUBOS_6 : CUBOS_4
  const primeiro = 50 - ((letras.length - 1) * 14) / 2
  return letras.map((letra, i) => ({ letra, x: primeiro + i * 14 }))
}

/**
 * O dedo leva P e A arrastando, depois só TOCA no T (que salta sozinho para
 * o primeiro lugar vazio) e por fim arrasta o O.
 * - lugarDe: { letra: lugar } das letras que já estão na caixa
 * - arrastadas: as letras que o dedo levou (aparecem no lugar sem voar)
 */
export function passosDaCaixa(escalao) {
  const cubos = cubosDaCaixa(escalao)
  const xDe = (letra) => cubos.find((c) => c.letra === letra).x
  const naCaixa = {}
  const arrastadas = []
  const passos = [{ ms: 700, dedo: null, lugarDe: {}, arrastadas: [], naMao: null, certo: false }]

  ;['P', 'A', 'T', 'O'].forEach((letra, lugar) => {
    passos.push({ ms: 800, dedo: [xDe(letra), CAIXA.yDosCubos + 2] })
    if (letra === 'T') {
      // Tocar: o cubo voa sozinho para o lugar
      naCaixa[letra] = lugar
      passos.push({ ms: 900, toca: 1, lugarDe: { ...naCaixa } })
      return
    }
    arrastadas.push(letra)
    passos.push({ ms: 400, toca: 1, leva: letra, naMao: letra, arrastadas: [...arrastadas] })
    passos.push({ ms: 900, dedo: [CAIXA.xDosLugares[lugar], CAIXA.yDosLugares + 1] })
    naCaixa[letra] = lugar
    passos.push({ ms: 450, leva: null, naMao: null, lugarDe: { ...naCaixa } })
  })

  passos.push({ ms: 2200, dedo: null, certo: true })
  return passos
}
