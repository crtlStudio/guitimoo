// ============================================================
// Memória do jogo de Memória, guardada no telemóvel com @capacitor/preferences
// (continua lá depois de fechar a app):
// para cada idade ('3-4', '5-6', '7-8'), o progresso: { nivel, certasSeguidas, saco },
// em que `saco` são os ids dos sons que ainda não saíram.
//
// As Preferences só guardam texto: por isso o progresso é transformado
// em texto com JSON.stringify e de volta em objeto com JSON.parse.
// ============================================================
import { Preferences } from '@capacitor/preferences'
import { NIVEIS, ajustarNivel } from './regras'
import { TODOS_OS_IDS } from './sorteio'

// (As chaves guardadas no telemóvel mantêm o nome antigo do jogo, de propósito:
//  assim o progresso que já existe não se perde.)
const chaveDoProgresso = (escalao) => `coruja:progresso:${escalao}`

/** O progresso de quem nunca jogou. */
export const PROGRESSO_INICIAL = { nivel: 0, certasSeguidas: 0, saco: [] }

/**
 * Lê o progresso de uma idade. Se não houver nada, ou se o que estiver
 * guardado estiver estragado, começa do início. Os ids do saco que já não
 * existam em sons.json (som apagado) são deitados fora.
 */
export async function lerProgresso(escalao) {
  const { value } = await Preferences.get({ key: chaveDoProgresso(escalao) })
  if (!value) return { ...PROGRESSO_INICIAL }

  try {
    const p = JSON.parse(value)
    const inteiro = (n) => (Number.isInteger(n) && n >= 0 ? n : 0)
    return {
      nivel: Math.min(inteiro(p.nivel), NIVEIS[escalao].length - 1),
      certasSeguidas: inteiro(p.certasSeguidas),
      saco: Array.isArray(p.saco) ? p.saco.filter((id) => TODOS_OS_IDS.includes(id)) : [],
    }
  } catch {
    return { ...PROGRESSO_INICIAL }
  }
}

function guardar(escalao, progresso) {
  // Não é preciso esperar que acabe de gravar: guarda em segundo plano
  Preferences.set({ key: chaveDoProgresso(escalao), value: JSON.stringify(progresso) })
  return progresso
}

/** Guarda o saco depois de um sorteio. Devolve o progresso novo. */
export function guardarSaco(escalao, progresso, saco) {
  return guardar(escalao, { ...progresso, saco })
}

/**
 * Regista o fim de uma ronda (acertou ou falhou as 2 tentativas),
 * ajusta o nível e guarda. Devolve o progresso novo.
 */
export function registarRonda(escalao, progresso, acertou) {
  return guardar(escalao, { ...progresso, ...ajustarNivel(escalao, progresso, acertou) })
}
