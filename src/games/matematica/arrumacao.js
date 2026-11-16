// ============================================================
// Arrumação dos cubinhos em cima de um prato (sem ecrã: só contas).
//
// Os cubinhos ficam em filas: a primeira fila assenta no prato e cada
// fila nova fica um pouco mais acima (parece um monte arrumado).
// As posições vêm em "tamanhos de cubinho", relativas ao centro do prato:
//   x = 0 → no meio do prato;  x = 1 → um cubinho para a direita
//   y = 0 → assente no prato;  y = −1 → um cubinho mais acima
// O ecrã multiplica pelo tamanho do cubinho (em cqw).
// ============================================================

/**
 * Posição de cada um dos `quantos` cubinhos num prato, pela ordem em que chegaram.
 *
 * Opções:
 * - porFila: quantos cabem lado a lado
 * - sobreposicao: distância entre dois vizinhos (1 = encostados; menos = sobrepostos)
 * - alturaDaFila: quanto sobe cada fila nova
 *
 * Exemplo com porFila 3: 4 cubinhos → 3 em baixo (x −0.78, 0, 0.78) e 1 em cima ao meio.
 */
export function posicoesNoPrato(quantos, { porFila = 3, sobreposicao = 0.78, alturaDaFila = 0.62 } = {}) {
  const posicoes = []
  for (let i = 0; i < quantos; i++) {
    const fila = Math.floor(i / porFila)
    const naFila = i % porFila
    // Quantos cubinhos tem esta fila (a última pode ter menos), para a centrar
    const nestaFila = Math.min(porFila, quantos - fila * porFila)
    posicoes.push({
      x: (naFila - (nestaFila - 1) / 2) * sobreposicao,
      y: fila === 0 ? 0 : -fila * alturaDaFila, // (na 1.ª fila, 0 e não "-0")
    })
  }
  return posicoes
}

/** Até quantos cubinhos se usa a arrumação "grande" (filas de 3). */
export const ATE_GRANDES = 6

/**
 * Arrumação de um prato, conforme o número de cubinhos:
 * - poucos (até ATE_GRANDES): grandes, em filas de 3
 * - muitos: mais pequenos, em filas de 5 (cada fila é um grupo de 5) e com
 *   um espaço a mais entre cada grupo de 10 (2 filas), para se contarem bem
 *
 * - tamanhos: { grande, pequeno } em cqw
 * Devolve { tamanho, posicoes } (posições em "tamanhos de cubinho", como em posicoesNoPrato).
 */
export function arrumarPrato(quantos, { grande, pequeno }) {
  if (quantos <= ATE_GRANDES) {
    return { tamanho: grande, posicoes: posicoesNoPrato(quantos, { porFila: 3, sobreposicao: 0.78, alturaDaFila: 0.62 }) }
  }
  const posicoes = posicoesNoPrato(quantos, { porFila: 5, sobreposicao: 0.66, alturaDaFila: 0.58 }).map((p, i) => {
    const grupoDe10 = Math.floor(i / 10)
    return { x: p.x, y: p.y - grupoDe10 * 0.3 } // um espacinho por cima de cada grupo de 10
  })
  return { tamanho: pequeno, posicoes }
}
