// ============================================================
// Espalhar os sapinhos pela relva, ao acaso, sem ficarem uns em cima
// dos outros (sem ecrã: só contas).
// ============================================================

/**
 * Escolhe `quantos` lugares ao acaso dentro das `zonas` (retângulos de relva).
 * Cada zona: { x1, x2, y1, y2 } — onde pode ficar o CENTRO DOS PÉS de um sapinho.
 * Dois sapinhos ficam sempre a pelo menos `distancia` um do outro.
 *
 * Funciona por tentativas: sorteia um ponto; se ficar perto demais de outro,
 * tenta outra vez. Se não conseguir (pouco espaço), aceita a melhor tentativa,
 * para nunca ficar "preso".
 *
 * `aleatorio` é a função de sorte (por defeito Math.random); os testes
 * passam uma "sorte" fixa para o resultado ser sempre o mesmo.
 */
export function espalharNoMonte(quantos, zonas, { distancia = 6, aleatorio = Math.random, tentativas = 60 } = {}) {
  // Zonas maiores recebem mais sapinhos (sorteia a zona pela sua área)
  const areas = zonas.map((z) => (z.x2 - z.x1) * (z.y2 - z.y1))
  const total = areas.reduce((a, b) => a + b, 0)

  function pontoAoAcaso() {
    let sorte = aleatorio() * total
    let zona = zonas[zonas.length - 1]
    for (let i = 0; i < zonas.length; i++) {
      if (sorte < areas[i]) {
        zona = zonas[i]
        break
      }
      sorte -= areas[i]
    }
    return {
      x: zona.x1 + aleatorio() * (zona.x2 - zona.x1),
      y: zona.y1 + aleatorio() * (zona.y2 - zona.y1),
    }
  }

  const lugares = []
  const maisPerto = (p) => Math.min(Infinity, ...lugares.map((l) => Math.hypot(l.x - p.x, l.y - p.y)))

  for (let n = 0; n < quantos; n++) {
    let melhor = null
    for (let t = 0; t < tentativas; t++) {
      const p = pontoAoAcaso()
      const folga = maisPerto(p)
      if (!melhor || folga > melhor.folga) melhor = { ...p, folga }
      if (folga >= distancia) break // longe de todos: serve
    }
    lugares.push({ x: melhor.x, y: melhor.y })
  }
  return lugares
}

/**
 * Baralha uma lista (sem mudar a original): cada ordem é igualmente provável.
 * (Algoritmo de Fisher–Yates.)
 */
export function baralhar(lista, aleatorio = Math.random) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}
