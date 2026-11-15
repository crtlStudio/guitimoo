// ============================================================
// Seleção da criança na grelha: de que células se trata e se
// formam uma das palavras escondidas.
//
// As células usam o mesmo formato da grelha: { linha, coluna }.
// ============================================================

/**
 * Células selecionadas entre a célula onde o dedo começou (`inicio`)
 * e a célula onde está agora (`atual`), sempre em linha reta.
 *
 * Se o arrasto não for perfeitamente reto, a linha é "endireitada" para a
 * direção mais próxima das 8 possíveis (→ ← ↓ ↑ e as 4 diagonais).
 * O comprimento é a maior das distâncias (em linhas ou em colunas), e a
 * seleção pára no limite da grelha.
 *
 * Ex.: inicio {2,1}, atual {2,4}  →  [{2,1}, {2,2}, {2,3}, {2,4}]
 */
export function celulasSelecionadas(inicio, atual, tamanho) {
  const difLinhas = atual.linha - inicio.linha
  const difColunas = atual.coluna - inicio.coluna

  // Ainda no mesmo sítio: só a célula inicial
  if (difLinhas === 0 && difColunas === 0) return [inicio]

  // Ângulo do arrasto, arredondado ao múltiplo de 45° mais próximo
  const angulo = Math.atan2(difLinhas, difColunas)
  const oitavo = Math.round(angulo / (Math.PI / 4)) // de -4 a 4
  const anguloReto = oitavo * (Math.PI / 4)

  // Passo por letra nessa direção: -1, 0 ou 1 em linhas e em colunas
  const passoLinha = Math.round(Math.sin(anguloReto))
  const passoColuna = Math.round(Math.cos(anguloReto))

  const comprimento = Math.max(Math.abs(difLinhas), Math.abs(difColunas))

  const celulas = []
  for (let i = 0; i <= comprimento; i++) {
    const linha = inicio.linha + passoLinha * i
    const coluna = inicio.coluna + passoColuna * i
    const dentro = linha >= 0 && linha < tamanho && coluna >= 0 && coluna < tamanho
    if (!dentro) break // chegou à borda da grelha
    celulas.push({ linha, coluna })
  }
  return celulas
}

/** Junta as letras das células num texto. Ex.: [{2,1},{2,2}] → 'GA' */
export function letrasDasCelulas(letras, celulas) {
  return celulas.map(({ linha, coluna }) => letras[linha][coluna]).join('')
}

/**
 * Verifica se a seleção forma uma das palavras ainda por encontrar.
 * Aceita a palavra lida nos dois sentidos (a criança pode arrastar
 * do fim para o início).
 *
 * Devolve a palavra encontrada (ex.: 'GATO') ou null se não formar nenhuma.
 */
export function verificarSelecao(letras, celulas, palavrasPorEncontrar) {
  const lido = letrasDasCelulas(letras, celulas)
  const lidoAoContrario = [...lido].reverse().join('')

  const encontrada = palavrasPorEncontrar.find(
    (palavra) => palavra === lido || palavra === lidoAoContrario,
  )
  return encontrada ?? null
}

/**
 * Em que célula está um ponto do ecrã (onde está o dedo ou o rato).
 *
 * - x, y: posição do ponto no ecrã, em píxeis
 * - caixa: posição e tamanho da grelha no ecrã ({ left, top, width, height },
 *   como devolve getBoundingClientRect)
 * - tamanho: número de linhas e colunas
 *
 * Devolve { linha, coluna }. Se o ponto estiver fora da grelha, devolve a
 * célula da borda mais próxima: assim, se o dedo escorregar um pouco para
 * fora, a seleção não se perde.
 */
export function celulaNoPonto(x, y, caixa, tamanho) {
  const limitar = (n) => Math.min(tamanho - 1, Math.max(0, n))
  return {
    linha: limitar(Math.floor(((y - caixa.top) / caixa.height) * tamanho)),
    coluna: limitar(Math.floor(((x - caixa.left) / caixa.width) * tamanho)),
  }
}

/** Diz se duas células são a mesma (útil para pintar a seleção no ecrã). */
export function mesmaCelula(a, b) {
  return a.linha === b.linha && a.coluna === b.coluna
}
