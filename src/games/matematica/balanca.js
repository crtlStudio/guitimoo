// ============================================================
// Lógica da balança (sem ecrã: só contas, fácil de testar).
// ============================================================

/** Inclinação máxima da barra, em graus (nunca inclina mais do que isto). */
export const ANGULO_MAXIMO = 15

/** Quantos graus a barra inclina por cada cubinho de diferença. */
export const GRAUS_POR_CUBINHO = 4

/**
 * Ângulo da barra da balança, em graus.
 *
 * Inclina para o lado mais pesado: na rotação do ecrã (CSS), um ângulo
 * POSITIVO roda no sentido dos ponteiros do relógio, ou seja, o braço
 * DIREITO desce. Por isso:
 *   mais cubinhos à direita  → ângulo positivo (direita desce)
 *   mais cubinhos à esquerda → ângulo negativo (esquerda desce)
 *   iguais                   → 0 (horizontal)
 *
 * Exemplo: 2 à esquerda e 5 à direita → (5 − 2) × 4 = 12°.
 * Com muita diferença, fica no máximo (15° ou −15°).
 */
export function calcularAngulo(esquerda, direita) {
  const angulo = (direita - esquerda) * GRAUS_POR_CUBINHO
  const limitado = Math.max(-ANGULO_MAXIMO, Math.min(ANGULO_MAXIMO, angulo))
  return limitado === 0 ? 0 : limitado // evita "-0"
}

/**
 * Quanto desce o braço mais pesado por cada cubinho de diferença (cqw),
 * em cada faixa etária. Com menos cubinhos (3–4 contam até 5), cada um
 * mexe mais o braço, para se ver bem que a balança se mexe mesmo.
 */
export const DESCIDA_POR_CUBINHO = { '3-4': 1.2, '5-6': 0.6, '7-8': 0.3 }

/** Quanto pode descer um braço, no máximo (cqw). */
export const DESCIDA_MAXIMA = 6

/** O braço mais leve sobe só esta parte da descida (para o tubo não aparecer por cima da balança). */
export const PARTE_QUE_SOBE = 0.5

/**
 * Quanto desce cada braço (os braços NÃO inclinam: ficam sempre na
 * horizontal e mexem-se só na vertical), como numa balança a sério:
 * o mais pesado DESCE e o mais leve SOBE (metade). Equilibrada: os dois em 0.
 *
 * Exemplo (5–6, 0.6 por cubinho): 6 à esquerda e 2 à direita →
 *   esquerdo desce 4 × 0.6 = 2.4; direito sobe 1.2 (fica −1.2).
 * Devolve { esquerda, direita } em cqw: positivo = desce, negativo = sobe.
 */
export function calcularDescidas(esquerda, direita, porCubinho = DESCIDA_POR_CUBINHO['7-8']) {
  const descida = Math.min(DESCIDA_MAXIMA, Math.abs(esquerda - direita) * porCubinho)
  const subida = -descida * PARTE_QUE_SOBE
  if (esquerda === direita) return { esquerda: 0, direita: 0 }
  return esquerda > direita ? { esquerda: descida, direita: subida } : { esquerda: subida, direita: descida }
}

/** A balança está equilibrada quando os dois pratos têm o mesmo número de cubinhos. */
export function estaEquilibrada(esquerda, direita) {
  return esquerda === direita
}
