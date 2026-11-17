// ============================================================
// O "motor" das demonstrações das instruções (Matemática, Português, ...).
//
// Cada demonstração é uma lista de PASSOS. Cada passo dura `ms` milissegundos
// e diz só o que MUDA nesse momento (o resto fica como estava):
// - dedo: [x, y] para onde vai a ponta do dedo (em cqw da cena), ou null = escondido
// - toca: quantas vezes o dedo carrega NESTE passo (não passa para o seguinte)
// - leva: o que o dedo leva agarrado (cada jogo decide como se desenha), ou null
// - outras chaves: o que se vê na cena (cada jogo escolhe as suas)
//
// Os pontos estão em "cqw" da cena: 1cqw = 1% da largura da cena.
// ============================================================

/** O estado no passo `i`: junta tudo o que os passos 0..i mudaram. */
export function estadoNoPasso(passos, i) {
  const estado = Object.assign({}, ...passos.slice(0, i + 1))
  estado.toca = passos[i]?.toca ?? 0 // o toque é só deste passo
  // Onde o dedo esteve por último (para desaparecer no sítio, sem saltar)
  estado.ultimoDedo = passos
    .slice(0, i + 1)
    .map((p) => p.dedo)
    .filter(Boolean)
    .at(-1) ?? null
  return estado
}

/** Duração total de uma demonstração (milissegundos). */
export function duracao(passos) {
  return passos.reduce((total, p) => total + p.ms, 0)
}
