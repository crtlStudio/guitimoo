// ============================================================
// Frases sobre peças e projetos, com o português certo:
// "1 lego vermelho", "2 sementes vermelhas", "da Coruja", "do Sapo"...
// Só funções puras (fáceis de testar).
// ============================================================

/** As 4 formas de cada cor: [masculino, feminino, masc. plural, fem. plural]. */
const FORMAS_DA_COR = {
  vermelho: ['vermelho', 'vermelha', 'vermelhos', 'vermelhas'],
  azul: ['azul', 'azul', 'azuis', 'azuis'],
  verde: ['verde', 'verde', 'verdes', 'verdes'],
  amarelo: ['amarelo', 'amarela', 'amarelos', 'amarelas'],
  laranja: ['laranja', 'laranja', 'laranja', 'laranja'],
}

/**
 * A cor certa para o género e o número da peça.
 *   nomeDaCor('vermelho', 'f', 2)  →  'vermelhas'
 */
export function nomeDaCor(cor, genero, quantas = 1) {
  const formas = FORMAS_DA_COR[cor]
  if (!formas) return cor
  return formas[(genero === 'f' ? 1 : 0) + (quantas === 1 ? 0 : 2)]
}

/**
 * Quantas peças de que cor, para a mascote e o jogo dados.
 *   nomeDasPecas(SAPO, MATEMATICA, 1)   →  '1 lego vermelho'
 *   nomeDasPecas(PANDA, MATEMATICA, 2)  →  '2 sementes vermelhas'
 */
export function nomeDasPecas(mascote, jogo, quantas) {
  const nome = quantas === 1 ? mascote.peca : mascote.pecas
  return `${quantas} ${nome} ${nomeDaCor(jogo.cor, mascote.generoPeca, quantas)}`
}

/** Só as peças, sem número: 'legos vermelhos', 'sementes vermelhas'. */
export function pecasDaCor(mascote, jogo) {
  return `${mascote.pecas} ${nomeDaCor(jogo.cor, mascote.generoPeca, 2)}`
}

/** Todas as peças da cor: 'todos os legos vermelhos', 'todas as sementes vermelhas'. */
export function todasAsPecas(mascote, jogo) {
  return `${mascote.generoPeca === 'f' ? 'todas as' : 'todos os'} ${pecasDaCor(mascote, jogo)}`
}

/** 'este lego', 'esta semente', 'estes 2 legos', 'estas 3 sementes'. */
export function estasPecas(mascote, quantas) {
  const f = mascote.generoPeca === 'f'
  if (quantas === 1) return `${f ? 'esta' : 'este'} ${mascote.peca}`
  return `${f ? 'estas' : 'estes'} ${quantas} ${mascote.pecas}`
}

/** 'o próximo lego', 'a próxima semente'. */
export function oProximo(mascote) {
  return `${mascote.generoPeca === 'f' ? 'a próxima' : 'o próximo'} ${mascote.peca}`
}

/** A primeira letra em maiúscula: 'o Sapo' → 'O Sapo'. */
export function comMaiuscula(texto) {
  return texto ? texto[0].toUpperCase() + texto.slice(1) : texto
}

/**
 * "de" + artigo, como se diz em português:
 *   doDa('o Sapo') → 'do Sapo'     doDa('a Coruja') → 'da Coruja'
 */
export function doDa(chamada) {
  if (chamada.startsWith('o ')) return `do ${chamada.slice(2)}`
  if (chamada.startsWith('a ')) return `da ${chamada.slice(2)}`
  return `de ${chamada}`
}
