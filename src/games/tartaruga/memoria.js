// ============================================================
// Memória do jogo da Tartaruga, guardada no telemóvel com @capacitor/preferences:
// o último escalão escolhido e, para cada escalão, o nível de dificuldade
// e as últimas horas/situações usadas (para não as repetir).
// ============================================================
import { Preferences } from '@capacitor/preferences'
import { NIVEIS, ajustarNivel, lembrarRecente } from './sorteio'

const CHAVE_ESCALAO = 'tartaruga:escalao'
const chaveDoProgresso = (escalao) => `tartaruga:progresso:${escalao}`
const ESCALOES = Object.keys(NIVEIS)

/** Quantas coisas recentes se lembram para não repetir. */
export const MAXIMO_RECENTES = 6

export async function lerEscalao() {
  const { value } = await Preferences.get({ key: CHAVE_ESCALAO })
  return ESCALOES.includes(value) ? value : null
}

export async function guardarEscalao(escalao) {
  await Preferences.set({ key: CHAVE_ESCALAO, value: escalao })
}

/**
 * Lê o progresso de um escalão:
 *   { nivel: 0, certas: 0, erradas: 0, recentes: ['3:30', ...] }
 * Se não houver nada (ou estiver estragado), começa do nível 0.
 */
export async function lerProgresso(escalao) {
  const inicial = { nivel: 0, certas: 0, erradas: 0, recentes: [] }
  const { value } = await Preferences.get({ key: chaveDoProgresso(escalao) })
  if (!value) return inicial

  try {
    const p = JSON.parse(value)
    const total = NIVEIS[escalao].length
    const numero = (n) => (Number.isInteger(n) && n >= 0 ? n : 0)
    return {
      nivel: Math.min(numero(p.nivel), total - 1),
      certas: numero(p.certas),
      erradas: numero(p.erradas),
      recentes: Array.isArray(p.recentes) ? p.recentes.filter((c) => typeof c === 'string') : [],
    }
  } catch {
    return inicial
  }
}

function guardar(escalao, progresso) {
  // Não é preciso esperar: guarda em segundo plano
  Preferences.set({ key: chaveDoProgresso(escalao), value: JSON.stringify(progresso) })
  return progresso
}

/** Regista uma resposta (certa ou errada), ajusta o nível e guarda. Devolve o progresso novo. */
export function registarResposta(escalao, progresso, acertou) {
  const novo = { ...progresso, ...ajustarNivel(progresso, acertou, NIVEIS[escalao].length) }
  return guardar(escalao, novo)
}

/** Lembra que uma hora/situação foi usada (para não a repetir já). Devolve o progresso novo. */
export function lembrarUsada(escalao, progresso, chave) {
  const novo = { ...progresso, recentes: lembrarRecente(progresso.recentes, chave, MAXIMO_RECENTES) }
  return guardar(escalao, novo)
}
