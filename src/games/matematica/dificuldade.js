// ============================================================
// Dificuldade do jogo de Matemática: sobe e desce dentro de cada idade.
//
// O "progresso" é um objeto simples: { nivel, certasSeguidas, historico }.
// Nenhuma função altera o objeto que recebe: devolvem sempre um novo.
// ============================================================
import { NIVEIS } from './contas'

/** Quantas contas certas seguidas (à primeira) para subir um nível. */
export const SOBE_COM = 3

/**
 * Atualiza o progresso depois de uma conta.
 * - certa à primeira: conta mais uma seguida; com SOBE_COM seguidas, sobe um nível
 * - com algum erro: desce um nível (e as seguidas voltam a 0)
 * Nunca passa do nível mais fácil nem do mais difícil. O histórico fica igual.
 */
export function ajustarNivel(escalao, progresso, certaAPrimeira) {
  const ultimo = NIVEIS[escalao].length - 1

  if (!certaAPrimeira) {
    return { ...progresso, nivel: Math.max(0, progresso.nivel - 1), certasSeguidas: 0 }
  }

  const certasSeguidas = progresso.certasSeguidas + 1
  if (certasSeguidas >= SOBE_COM && progresso.nivel < ultimo) {
    return { ...progresso, nivel: progresso.nivel + 1, certasSeguidas: 0 }
  }
  return { ...progresso, certasSeguidas }
}
