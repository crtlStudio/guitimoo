// ============================================================
// Regras do jogo de Memória: os níveis de cada idade, verificar os toques
// da criança e ajustar a dificuldade.
//
// O "progresso" é um objeto simples: { nivel: 0, certasSeguidas: 0 }
// (o passo 6 guarda-o no telemóvel). Nenhuma função altera o objeto que
// recebe: devolvem sempre um novo.
// ============================================================

/**
 * Os níveis de cada idade, do mais fácil para o mais difícil.
 * - 3–4: `dificil` = as opções erradas são da mesma categoria
 * - 5–6 e 7–8: `comprimento` = quantos sons tem a sequência
 *   `contrario` = probabilidade de a ronda ser "ao contrário" (0 = nunca)
 */
export const NIVEIS = {
  '3-4': [{ dificil: false }, { dificil: true }],
  '5-6': [{ comprimento: 2 }, { comprimento: 3 }, { comprimento: 4 }],
  '7-8': [
    { comprimento: 5, contrario: 0 },
    { comprimento: 6, contrario: 0.3 },
    { comprimento: 7, contrario: 0.3 },
    { comprimento: 8, contrario: 0.4 },
  ],
}

/** Quantas rondas certas seguidas para subir um nível. */
export const SOBE_COM = 3

/**
 * Quantas tentativas tem cada sequência. À 1.ª falha a mascote diz
 * "Quase! Vamos ouvir outra vez" e toca a MESMA sequência; só à 2.ª falha
 * conta como erro (a sequência encolhe) e vem uma nova.
 */
export const TENTATIVAS = 2

/** As regras do nível atual (se o nível for inválido, usa o mais próximo). */
export function regrasDoNivel(escalao, nivel) {
  const niveis = NIVEIS[escalao]
  const seguro = Math.min(Math.max(nivel, 0), niveis.length - 1)
  return niveis[seguro]
}

/** Decide se esta ronda é "ao contrário" (só nos níveis altos dos 7–8). */
export function sortearAoContrario(escalao, nivel, aleatorio = Math.random) {
  const { contrario = 0 } = regrasDoNivel(escalao, nivel)
  return aleatorio() < contrario
}

/**
 * A ordem pela qual a criança tem de tocar nas imagens.
 * Ao contrário: do último som para o primeiro.
 */
export function ordemEsperada(sequencia, aoContrario = false) {
  return aoContrario ? [...sequencia].reverse() : [...sequencia]
}

/**
 * Verifica um toque da criança.
 * - esperada: a ordem certa (de ordemEsperada)
 * - jaCertos: quantos toques certos já fez nesta tentativa
 * - id: a imagem em que tocou agora
 *
 * Devolve 'certo' (continua), 'completo' (acabou a sequência!) ou 'errado'.
 */
export function verificarToque(esperada, jaCertos, id) {
  if (esperada[jaCertos] !== id) return 'errado'
  return jaCertos + 1 === esperada.length ? 'completo' : 'certo'
}

/**
 * Atualiza o progresso depois de uma ronda.
 * - acertou: SOBE_COM certas seguidas → sobe um nível (a sequência cresce 1 som)
 * - falhou: desce um nível (a sequência encolhe 1 som)
 * Nunca passa do nível mais fácil nem do mais difícil.
 */
export function ajustarNivel(escalao, progresso, acertou) {
  const ultimo = NIVEIS[escalao].length - 1

  if (!acertou) {
    return { nivel: Math.max(0, progresso.nivel - 1), certasSeguidas: 0 }
  }

  const certasSeguidas = progresso.certasSeguidas + 1
  if (certasSeguidas >= SOBE_COM && progresso.nivel < ultimo) {
    return { nivel: progresso.nivel + 1, certasSeguidas: 0 }
  }
  return { nivel: progresso.nivel, certasSeguidas }
}
