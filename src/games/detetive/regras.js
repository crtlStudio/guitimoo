// ============================================================
// Regras do jogo "Detetive das Profissões".
//
// Como nos outros jogos, aqui ficam só funções puras (sem React), com
// testes ao lado. A página do jogo está em src/pages/detetive/.
// Para ligar o jogo: `ativo: true` no src/games/progresso/config.js.
//
// Os 3 níveis (o jogo usa as faixas etárias por dentro, como os outros):
// - '3-4' (fácil):   1 pista grande → tocar na profissão certa (3 opções)
// - '5-6' (médio):   3 pistas, destapadas uma a uma com a lupa → 4 opções
// - '7-8' (difícil): arrastar cada profissão para onde trabalha (3 pares)
//
// `aleatorio` é uma função que dá números entre 0 e 1 (por omissão,
// Math.random). Nos testes passa-se uma fixa, para o resultado ser sempre igual.
// ============================================================
import { escolherSemRepetir } from '../horas/sorteio'
import { baralhar } from '../portugues/baralho'
import { PROFISSOES } from './profissoes'

/** Quantas perguntas tem um jogo (no difícil, cada par ligado conta como uma). */
export const PERGUNTAS = 5

/** Quantas profissões aparecem para escolher, em cada nível. */
export const OPCOES = { '3-4': 3, '5-6': 4 }

/** Quantos pares (profissão ↔ local) há em cada ronda do nível difícil. */
export const PARES = 3

/** Quantas perguntas de cada jogo: no difícil, o total de pares de todas as rondas. */
export function perguntasDoJogo(escalao) {
  return escalao === '7-8' ? PARES * Math.ceil(PERGUNTAS / PARES) : PERGUNTAS
}

/** Sorteia a profissão da pergunta, sem repetir as últimas (`recentes` = ids). */
export function sortearProfissao(recentes = [], aleatorio = Math.random, lista = PROFISSOES) {
  return escolherSemRepetir(lista, (p) => p.id, recentes, aleatorio)
}

/** A profissão certa e mais `quantas - 1` outras, baralhadas. */
function opcoesCom(certa, quantas, aleatorio, lista) {
  const outras = baralhar(
    lista.filter((p) => p.id !== certa.id),
    aleatorio,
  ).slice(0, quantas - 1)
  return baralhar([certa, ...outras], aleatorio)
}

/**
 * Pergunta do nível fácil: 1 pista (um objeto) e 3 profissões.
 *   { certa, pista: '🧯', opcoes: [profissão, profissão, profissão] }
 */
export function perguntaFacil(certa, aleatorio = Math.random, lista = PROFISSOES) {
  const pista = certa.pistas[Math.floor(aleatorio() * certa.pistas.length)]
  return { certa, pista, opcoes: opcoesCom(certa, OPCOES['3-4'], aleatorio, lista) }
}

/**
 * Pergunta do nível médio: as 3 pistas (por ordem ao calhas: a criança
 * destapa-as uma a uma) e 4 profissões.
 *   { certa, pistas: ['🔥', '🪜', '🧯'], opcoes: [4 profissões] }
 */
export function perguntaMedio(certa, aleatorio = Math.random, lista = PROFISSOES) {
  return { certa, pistas: baralhar(certa.pistas, aleatorio), opcoes: opcoesCom(certa, OPCOES['5-6'], aleatorio, lista) }
}

/**
 * Ronda do nível difícil: PARES profissões diferentes (evitando as
 * recentes) e os seus locais, baralhados à parte.
 *   { profissoes: [3 profissões], locais: [3 locais] }
 */
export function rondaDificil(recentes = [], aleatorio = Math.random, lista = PROFISSOES) {
  const profissoes = []
  for (let i = 0; i < PARES; i++) {
    const usadas = profissoes.map((p) => p.id)
    const resto = lista.filter((p) => !usadas.includes(p.id))
    profissoes.push(escolherSemRepetir(resto, (p) => p.id, recentes, aleatorio))
  }
  return { profissoes, locais: baralhar(profissoes.map((p) => p.local), aleatorio) }
}

/** Se a profissão trabalha naquele local (nível difícil). */
export function trabalhaEm(profissao, localId) {
  return profissao.local.id === localId
}
