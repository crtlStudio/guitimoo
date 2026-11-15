import { describe, expect, it } from 'vitest'
import { baralhar, espalharNoMonte } from './monte'

/** Uma "sorte" fixa (sempre os mesmos números), para os testes darem sempre o mesmo. */
function sorteFixa(semente = 1) {
  let s = semente
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const ZONAS = [
  { x1: 5, x2: 35, y1: 46, y2: 54 },
  { x1: 65, x2: 95, y1: 46, y2: 54 },
]

describe('espalharNoMonte', () => {
  it('dá um lugar por sapinho, sempre dentro das zonas', () => {
    const lugares = espalharNoMonte(10, ZONAS, { aleatorio: sorteFixa() })
    expect(lugares).toHaveLength(10)
    for (const { x, y } of lugares) {
      const dentro = ZONAS.some((z) => x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2)
      expect(dentro).toBe(true)
    }
  })

  it('com espaço suficiente, ficam todos afastados uns dos outros', () => {
    const lugares = espalharNoMonte(10, ZONAS, { distancia: 6, aleatorio: sorteFixa(7) })
    for (let i = 0; i < lugares.length; i++) {
      for (let j = i + 1; j < lugares.length; j++) {
        const d = Math.hypot(lugares[i].x - lugares[j].x, lugares[i].y - lugares[j].y)
        expect(d).toBeGreaterThanOrEqual(6)
      }
    }
  })

  it('com pouco espaço, não fica preso: dá na mesma um lugar a cada um', () => {
    const pequena = [{ x1: 0, x2: 2, y1: 0, y2: 2 }]
    expect(espalharNoMonte(20, pequena, { distancia: 6, aleatorio: sorteFixa() })).toHaveLength(20)
  })

  it('com outra sorte, os lugares são diferentes (é mesmo ao acaso)', () => {
    const a = espalharNoMonte(5, ZONAS, { aleatorio: sorteFixa(1) })
    const b = espalharNoMonte(5, ZONAS, { aleatorio: sorteFixa(2) })
    expect(a).not.toEqual(b)
  })
})

describe('baralhar', () => {
  it('tem os mesmos elementos e não muda a lista original', () => {
    const original = [1, 2, 3, 4, 5]
    const baralhada = baralhar(original, sorteFixa())
    expect([...baralhada].sort()).toEqual(original)
    expect(original).toEqual([1, 2, 3, 4, 5])
  })
})
