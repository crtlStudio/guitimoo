// ============================================================
// Jogo da Lógica (dentro da Matemática): uma fila de cubinhos com um
// padrão de cores e um "?" — qual é o cubinho que falta?
//   🟦 🟥 🟦 🟥 🟦 ❓   → 🟥
//
// Só funções puras (sem ecrã), fáceis de testar. `aleatorio` dá números
// entre 0 e 1 (por omissão Math.random); nos testes passa-se uma fixa.
// ============================================================
import { baralhar } from '../portugues/baralho'

/** As cores dos cubinhos (há uma imagem para cada uma). */
export const CORES = ['vermelho', 'azul', 'verde', 'amarelo', 'laranja']

/**
 * Os padrões de cada faixa etária, com letras: cada letra é uma cor
 * diferente ('ab' = azul, vermelho, azul, vermelho...).
 * - quantos: quantos cubinhos tem a fila (com o "?")
 * - noMeio: se o "?" pode aparecer a meio da fila (senão, é sempre o último)
 * - opcoes: quantos cubinhos há para escolher
 */
export const NIVEIS = {
  '3-4': { padroes: ['ab'], quantos: 6, noMeio: false, opcoes: 3 },
  '5-6': { padroes: ['ab', 'aab', 'abb', 'abc'], quantos: 7, noMeio: false, opcoes: 3 },
  '7-8': { padroes: ['aab', 'abb', 'abc', 'aabb', 'abac', 'abcd'], quantos: 8, noMeio: true, opcoes: 4 },
}

/**
 * Cria uma pergunta de lógica:
 *   { fila: ['azul', 'vermelho', 'azul', null, ...], buraco: 3, resposta: 'vermelho',
 *     opcoes: ['verde', 'vermelho', 'azul'], padrao: 'ab' }
 * - fila: as cores pela ordem; no lugar do "?" está null
 * - buraco: a posição do "?"
 * - opcoes: a resposta e outras cores, baralhadas (sem repetidas)
 */
export function criarPergunta(escalao, aleatorio = Math.random) {
  const nivel = NIVEIS[escalao] ?? NIVEIS['3-4']
  const padrao = nivel.padroes[Math.floor(aleatorio() * nivel.padroes.length)]
  const letras = [...new Set(padrao)]
  // Cada letra do padrão fica com uma cor diferente, ao calhas
  const cores = baralhar(CORES, aleatorio)
  const corDe = Object.fromEntries(letras.map((letra, i) => [letra, cores[i]]))

  const completa = Array.from({ length: nivel.quantos }, (_, i) => corDe[padrao[i % padrao.length]])

  // O "?": o último, ou (7–8) qualquer um depois de o padrão aparecer uma vez inteiro
  const primeiroPossivel = nivel.noMeio ? padrao.length : nivel.quantos - 1
  const buraco = primeiroPossivel + Math.floor(aleatorio() * (nivel.quantos - primeiroPossivel))
  const resposta = completa[buraco]
  const fila = completa.map((cor, i) => (i === buraco ? null : cor))

  // As opções: a resposta, as outras cores do padrão e (se faltarem) cores novas
  const doPadrao = baralhar(
    letras.map((l) => corDe[l]).filter((c) => c !== resposta),
    aleatorio,
  )
  const novas = baralhar(
    CORES.filter((c) => !Object.values(corDe).includes(c)),
    aleatorio,
  )
  const outras = [...doPadrao, ...novas].slice(0, nivel.opcoes - 1)
  const opcoes = baralhar([resposta, ...outras], aleatorio)

  return { fila, buraco, resposta, opcoes, padrao }
}

/** Se a cor escolhida é a que falta. */
export function respostaCertaLogica(pergunta, cor) {
  return cor === pergunta.resposta
}
