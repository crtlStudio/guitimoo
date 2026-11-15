// ============================================================
// Estrelas: a pontuação de todos os jogos.
//
// Regras:
// - cada resposta certa À PRIMEIRA TENTATIVA dá 5 estrelas
//   (se errar antes de acertar, a pergunta continua, mas sem estrelas)
// - acabar um jogo (responder a todas as perguntas) dá mais 15 estrelas
// Exemplo: um jogo de 3 perguntas, todas certas à primeira: 3 × 5 + 15 = 30.
//
// Há duas partes:
// 1. O "placar" de UM jogo: funções puras (recebem um placar e devolvem
//    um novo), fáceis de testar.
// 2. O TOTAL de estrelas da criança, somado de todos os jogos e guardado
//    no telemóvel com @capacitor/preferences.
// ============================================================
import { Preferences } from '@capacitor/preferences'

export const ESTRELAS_POR_CERTA = 5
export const ESTRELAS_POR_JOGO = 15

// ---------------- 1. O placar de um jogo ----------------

/**
 * Placar no início de um jogo com `perguntas` perguntas:
 * { perguntas, feitas, certas, errouNesta, estrelas }
 * - feitas: perguntas já respondidas (certas no fim)
 * - certas: quantas foram certas à primeira
 * - errouNesta: se já errou na pergunta atual (aí já não ganha as 5)
 * - estrelas: estrelas ganhas neste jogo
 */
export function novoPlacar(perguntas) {
  return { perguntas, feitas: 0, certas: 0, errouNesta: false, estrelas: 0 }
}

/** A criança errou: a pergunta atual já não dá estrelas. */
export function registarErro(placar) {
  if (placar.feitas >= placar.perguntas) return placar // o jogo já acabou
  return { ...placar, errouNesta: true }
}

/**
 * A criança acertou (a pergunta atual fica respondida).
 * Devolve { placar, ganhas, bonus, acabou }:
 * - ganhas: estrelas desta resposta (5, ou 0 se tinha errado antes)
 * - bonus: 15 se esta foi a última pergunta (jogo ganho), senão 0
 * - acabou: true se o jogo acabou
 */
export function registarCerta(placar) {
  if (placar.feitas >= placar.perguntas) {
    return { placar, ganhas: 0, bonus: 0, acabou: true }
  }
  const ganhas = placar.errouNesta ? 0 : ESTRELAS_POR_CERTA
  const feitas = placar.feitas + 1
  const acabou = feitas === placar.perguntas
  const bonus = acabou ? ESTRELAS_POR_JOGO : 0
  return {
    placar: {
      ...placar,
      feitas,
      certas: placar.certas + (ganhas > 0 ? 1 : 0),
      errouNesta: false,
      estrelas: placar.estrelas + ganhas + bonus,
    },
    ganhas,
    bonus,
    acabou,
  }
}

/** O máximo de estrelas num jogo com `perguntas` perguntas. */
export function maximoDoJogo(perguntas) {
  return perguntas * ESTRELAS_POR_CERTA + ESTRELAS_POR_JOGO
}

// ---------------- 2. O total guardado no telemóvel ----------------

const CHAVE_TOTAL = 'estrelas:total'

let total = 0 // o total atual (lido do telemóvel ao arrancar)
let lido = false
const ouvintes = new Set() // componentes que mostram o total (para se atualizarem)

function avisarOuvintes() {
  ouvintes.forEach((avisar) => avisar())
}

/** Lê o total guardado (só vai ao telemóvel da primeira vez). */
export async function lerTotal() {
  if (!lido) {
    const { value } = await Preferences.get({ key: CHAVE_TOTAL })
    const numero = Number.parseInt(value ?? '0', 10)
    // Se entretanto já se somaram estrelas, junta-as ao que estava guardado
    total += Number.isInteger(numero) && numero > 0 ? numero : 0
    lido = true
    avisarOuvintes()
  }
  return total
}

/** Soma estrelas ao total e guarda (em segundo plano). Devolve o total novo. */
export function somarEstrelas(quantas) {
  if (quantas <= 0) return total
  total += quantas
  avisarOuvintes()
  if (lido) Preferences.set({ key: CHAVE_TOTAL, value: String(total) })
  else lerTotal().then(() => Preferences.set({ key: CHAVE_TOTAL, value: String(total) }))
  return total
}

/** O total atual (sem ir ao telemóvel). */
export function totalAtual() {
  return total
}

/**
 * Para os componentes React se "inscreverem" e serem avisados quando o
 * total muda (usado com useSyncExternalStore). Devolve a função para sair.
 */
export function inscrever(avisar) {
  ouvintes.add(avisar)
  if (!lido) lerTotal()
  return () => ouvintes.delete(avisar)
}

/** Só para os testes: volta ao estado inicial. */
export function _recomecarParaTestes() {
  total = 0
  lido = false
  ouvintes.clear()
}
