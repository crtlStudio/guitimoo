// ============================================================
// Memória do Detetive, guardada no telemóvel com @capacitor/preferences:
// para cada faixa etária ('3-4', '5-6', '7-8'), as últimas profissões que
// saíram, para não se repetirem logo no jogo seguinte.
// ============================================================
import { Preferences } from '@capacitor/preferences'
import { lembrarRecente } from '../horas/sorteio'

const chave = (escalao) => `detetive:recentes:${escalao}`

/** Quantas profissões recentes se lembram (há 14: ficam sempre algumas novas). */
export const MAXIMO_RECENTES = 8

/** Lê as profissões recentes (ids). Se não houver nada, ou estiver estragado: []. */
export async function lerRecentes(escalao) {
  const { value } = await Preferences.get({ key: chave(escalao) })
  try {
    const lista = JSON.parse(value ?? '[]')
    return Array.isArray(lista) ? lista.filter((id) => typeof id === 'string').slice(0, MAXIMO_RECENTES) : []
  } catch {
    return []
  }
}

/** Lembra as profissões que acabaram de sair e guarda. Devolve a lista nova. */
export function lembrarProfissoes(escalao, recentes, ids) {
  let nova = recentes
  for (const id of ids) nova = lembrarRecente(nova, id, MAXIMO_RECENTES)
  // Não é preciso esperar: guarda em segundo plano
  Preferences.set({ key: chave(escalao), value: JSON.stringify(nova) }).catch(() => {})
  return nova
}
