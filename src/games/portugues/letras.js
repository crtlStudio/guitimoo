// ============================================================
// Jogo dos 3–4 anos: encontrar a letra igual.
//
// Cada ronda tem uma letra certa (a primeira letra da palavra, ex.: 'G'
// de GATO) e uma fila de letras para escolher, com a certa no meio.
// ============================================================
import { baralhar } from './baralho'

// Letras que podem aparecer na fila (sem K, W e Y, raras em português)
const LETRAS = 'ABCDEFGHIJLMNOPQRSTUVXZ'

// Pares de letras parecidas: não aparecem juntas na mesma fila,
// para o jogo ser justo para quem ainda está a aprender
const PARECIDAS = ['EF', 'MN', 'OQ', 'PR', 'CG', 'IJ', 'UV', 'BD', 'OC']

function saoParecidas(a, b) {
  return PARECIDAS.some((par) => par.includes(a) && par.includes(b))
}

/**
 * Quantas letras tem a fila, conforme as rondas já acertadas:
 * começa com 4 e vai até 6, para ficar um pouco mais difícil aos poucos.
 *   0–2 acertos → 4 letras · 3–5 → 5 letras · 6 ou mais → 6 letras
 */
export function quantidadeDeLetras(acertos) {
  return 4 + Math.min(2, Math.floor(acertos / 3))
}

/**
 * Cria uma ronda a partir de uma palavra.
 *
 *   criarRondaLetra('GATO', 4)
 *   → { alvo: 'G', opcoes: ['S', 'G', 'B', 'T'] }
 *
 * As opções têm `quantidade` letras diferentes, incluindo o alvo,
 * sem letras parecidas com o alvo, por ordem aleatória.
 */
export function criarRondaLetra(palavra, quantidade, aleatorio = Math.random) {
  const alvo = palavra[0]

  const candidatas = baralhar(
    [...LETRAS].filter((letra) => letra !== alvo && !saoParecidas(letra, alvo)),
    aleatorio,
  )
  const erradas = candidatas.slice(0, quantidade - 1)

  return {
    alvo,
    opcoes: baralhar([alvo, ...erradas], aleatorio),
  }
}
