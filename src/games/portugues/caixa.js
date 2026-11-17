// ============================================================
// Jogo da caixa das palavras (dentro do Português).
//
// Sai um cartão com uma imagem (e, conforme o nível, a palavra). Fora da
// caixa ficam cubos com as letras da palavra, baralhados; a criança leva
// cada cubo para o seu lugar dentro da caixa.
//
// Só funções puras (fáceis de testar). Nunca mudam o que recebem.
// ============================================================
import palavras from '../../data/palavras.json'
import { baralhar } from './baralho'

/** As palavras mais compridas que entram no Fácil. */
const MAXIMO_NO_FACIL = 4

/** Letras para os cubos a mais (sem K, W e Y, raras em português). */
const LETRAS = 'ABCDEFGHIJLMNOPQRSTUVXZ'

/**
 * O que muda em cada nível (as ajudas vão diminuindo):
 * - lista: as palavras que podem sair ({ palavra, mostrar?, emoji })
 * - mostraPalavra: o cartão mostra a palavra escrita (senão, só a imagem)
 * - guias: cada lugar da caixa tem a sua letra clarinha (é só encaixar a forma)
 * - aMais: quantos cubos a mais, com letras que não fazem parte da palavra
 */
export const NIVEIS_DA_CAIXA = {
  '3-4': {
    lista: palavras['3-4'].filter((p) => p.palavra.length <= MAXIMO_NO_FACIL),
    mostraPalavra: true,
    guias: true,
    aMais: 0,
  },
  '5-6': { lista: palavras['5-6'], mostraPalavra: true, guias: false, aMais: 0 },
  '7-8': { lista: palavras['7-8'], mostraPalavra: false, guias: false, aMais: 2 },
}

/**
 * As letras da palavra tal como se escreve (com acentos), uma por cubo:
 *   letrasDe({ palavra: 'LEAO', mostrar: 'LEÃO' })  →  ['L', 'E', 'Ã', 'O']
 */
export function letrasDe(item) {
  return [...(item.mostrar ?? item.palavra)]
}

/**
 * Prepara uma ronda: os lugares (as letras pela ordem certa) e os cubos
 * baralhados. Os cubos nunca ficam pela ordem certa (seria fácil demais).
 *
 *   criarRondaCaixa({ palavra: 'GATO', emoji: '🐱' }, '5-6')
 *   → { palavra: 'GATO', emoji: '🐱', letras: ['G','A','T','O'],
 *       cubos: [{ id: 0, letra: 'T' }, { id: 1, letra: 'G' }, ...] }
 */
export function criarRondaCaixa(item, escalao, aleatorio = Math.random) {
  const nivel = NIVEIS_DA_CAIXA[escalao] ?? NIVEIS_DA_CAIXA['3-4']
  const letras = letrasDe(item)

  // Cubos a mais: letras que não estão na palavra, diferentes entre si
  const fora = baralhar([...LETRAS].filter((l) => !letras.includes(l)), aleatorio)
  const todas = [...letras, ...fora.slice(0, nivel.aMais)]

  let ordem = baralhar(todas, aleatorio)
  // Se calhou pela ordem certa, roda um lugar (com 2+ letras diferentes, deixa de estar)
  if (ordem.slice(0, letras.length).join('') === letras.join('') && new Set(todas).size > 1) {
    ordem = [...ordem.slice(1), ordem[0]]
  }

  return {
    palavra: item.palavra,
    mostrar: item.mostrar ?? item.palavra,
    emoji: item.emoji,
    letras,
    cubos: ordem.map((letra, id) => ({ id, letra })),
  }
}

/**
 * Um cubo pode ficar no lugar `lugar`? Só se o lugar estiver vazio e for
 * dessa letra. Letras repetidas servem em qualquer dos seus lugares (em
 * BATA, os dois A entram em qualquer um dos lugares do A).
 * - postos: o que já está em cada lugar (null = vazio), ex.: ['B', null, null, 'A']
 */
export function encaixa(letras, postos, lugar, letra) {
  return lugar >= 0 && lugar < letras.length && postos[lugar] === null && letras[lugar] === letra
}

/** Os lugares todos vazios, para começar: [null, null, ...]. */
export function lugaresVazios(letras) {
  return letras.map(() => null)
}

/** A palavra está completa (todos os lugares com a sua letra)? */
export function palavraCompleta(letras, postos) {
  return letras.every((letra, i) => postos[i] === letra)
}

/** O primeiro lugar vazio (para o dedo fantasma apontar), ou -1. */
export function primeiroVazio(postos) {
  return postos.indexOf(null)
}
