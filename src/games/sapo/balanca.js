// ============================================================
// Lógica da balança do Sapo (sem ecrã: só contas, fácil de testar).
// ============================================================

/** Inclinação máxima da barra, em graus (nunca inclina mais do que isto). */
export const ANGULO_MAXIMO = 15

/** Quantos graus a barra inclina por cada sapinho de diferença. */
export const GRAUS_POR_SAPINHO = 4

/**
 * Ângulo da barra da balança, em graus.
 *
 * Inclina para o lado mais pesado: na rotação do ecrã (CSS), um ângulo
 * POSITIVO roda no sentido dos ponteiros do relógio, ou seja, o braço
 * DIREITO desce. Por isso:
 *   mais sapinhos à direita  → ângulo positivo (direita desce)
 *   mais sapinhos à esquerda → ângulo negativo (esquerda desce)
 *   iguais                   → 0 (horizontal)
 *
 * Exemplo: 2 à esquerda e 5 à direita → (5 − 2) × 4 = 12°.
 * Com muita diferença, fica no máximo (15° ou −15°).
 */
export function calcularAngulo(esquerda, direita) {
  const angulo = (direita - esquerda) * GRAUS_POR_SAPINHO
  const limitado = Math.max(-ANGULO_MAXIMO, Math.min(ANGULO_MAXIMO, angulo))
  return limitado === 0 ? 0 : limitado // evita "-0"
}

/** Quanto desce o braço mais pesado por cada sapinho de diferença (cqw). */
export const DESCIDA_POR_SAPINHO = 0.3

/** Quanto pode descer um braço, no máximo (cqw): chega lá com 20 sapinhos de diferença. */
export const DESCIDA_MAXIMA = 6

/**
 * Quanto desce cada braço (os braços NÃO inclinam: ficam sempre na
 * horizontal e mexem-se só na vertical).
 * Só desce o braço mais pesado, um bocadinho por cada sapinho de diferença;
 * o mais leve fica na posição de partida (0). Equilibrada: os dois em 0.
 *
 * Exemplo: 6 à esquerda e 2 à direita → esquerdo desce 4 × 0.3 = 1.2; direito 0.
 * Devolve { esquerda, direita } em cqw (nunca negativos).
 */
export function calcularDescidas(esquerda, direita) {
  const descida = (diferenca) => Math.min(DESCIDA_MAXIMA, Math.max(0, diferenca) * DESCIDA_POR_SAPINHO)
  return { esquerda: descida(esquerda - direita), direita: descida(direita - esquerda) }
}

/** A balança está equilibrada quando os dois pratos têm o mesmo número de sapinhos. */
export function estaEquilibrada(esquerda, direita) {
  return esquerda === direita
}
