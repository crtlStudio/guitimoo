// ============================================================
// Memória do jogo de Matemática, guardada no telemóvel com @capacitor/preferences
// (continua lá depois de fechar a app):
// para cada idade ('3-4', '5-6', '7-8'), o progresso: { nivel, certasSeguidas, historico }
//   em que `historico` são as chaves das últimas contas que saíram
//   (para não as repetir).
//
// As Preferences só guardam texto: por isso o progresso é transformado
// em texto com JSON.stringify e de volta em objeto com JSON.parse.
// ============================================================
import { Preferences } from '@capacitor/preferences'
import { HISTORICO, NIVEIS, sortearConta } from './contas'
import { ajustarNivel } from './dificuldade'

// (As chaves guardadas no telemóvel mantêm o nome antigo do jogo, de propósito:
//  assim o progresso que já existe não se perde.)
const chaveDoProgresso = (escalao) => `sapo:progresso:${escalao}`

/** O progresso de quem nunca jogou. */
export const PROGRESSO_INICIAL = { nivel: 0, certasSeguidas: 0, historico: [] }

/**
 * Lê o progresso de uma idade. Se não houver nada, ou se o que estiver
 * guardado estiver estragado, começa do início.
 */
export async function lerProgresso(escalao) {
  const { value } = await Preferences.get({ key: chaveDoProgresso(escalao) })
  if (!value) return { ...PROGRESSO_INICIAL, historico: [] }

  try {
    const p = JSON.parse(value)
    const inteiro = (n) => (Number.isInteger(n) && n >= 0 ? n : 0)
    return {
      nivel: Math.min(inteiro(p.nivel), NIVEIS[escalao].length - 1),
      certasSeguidas: inteiro(p.certasSeguidas),
      historico: Array.isArray(p.historico)
        ? p.historico.filter((c) => typeof c === 'string').slice(-HISTORICO)
        : [],
    }
  } catch {
    return { ...PROGRESSO_INICIAL, historico: [] }
  }
}

function guardar(escalao, progresso) {
  // Não é preciso esperar que acabe de gravar: guarda em segundo plano
  Preferences.set({ key: chaveDoProgresso(escalao), value: JSON.stringify(progresso) })
  return progresso
}

/**
 * Sorteia a próxima conta (do nível atual, sem repetir as últimas) e guarda
 * o histórico. Devolve { conta, progresso } com o progresso novo.
 */
export function proximaConta(escalao, progresso, aleatorio = Math.random) {
  const { conta, historico } = sortearConta(escalao, progresso.nivel, progresso.historico, aleatorio)
  return { conta, progresso: guardar(escalao, { ...progresso, historico }) }
}

/** Regista o fim de uma conta (certa à primeira ou não), ajusta o nível e guarda. */
export function registarConta(escalao, progresso, certaAPrimeira) {
  return guardar(escalao, ajustarNivel(escalao, progresso, certaAPrimeira))
}
