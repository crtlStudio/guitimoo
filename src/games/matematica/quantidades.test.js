import { describe, expect, it } from 'vitest'
import { NIVEIS, POR_FILA, criarPergunta, filasDeCubos } from './quantidades'

/** Números "ao calhas" sempre iguais (para os testes darem sempre o mesmo). */
function geradorFixo(semente = 1) {
  let s = semente
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

describe('quantidades: a pergunta', () => {
  for (const [escalao, nivel] of Object.entries(NIVEIS)) {
    it(`${escalao}: números dentro do nível, e diferentes nas duas linhas`, () => {
      const aleatorio = geradorFixo(7)
      for (let i = 0; i < 200; i++) {
        const p = criarPergunta(escalao, aleatorio)
        for (const n of [p.cubos, p.numero]) {
          expect(n).toBeGreaterThanOrEqual(nivel.minimo)
          expect(n).toBeLessThanOrEqual(nivel.maximo)
        }
        expect(p.numero).not.toBe(p.cubos)
        expect(p.corDoNumero).not.toBe(p.cor)
      }
    })

    it(`${escalao}: os cartões têm o certo, sem repetidos e sem passar do máximo`, () => {
      const aleatorio = geradorFixo(11)
      for (let i = 0; i < 200; i++) {
        const p = criarPergunta(escalao, aleatorio)
        expect(p.opcoes).toHaveLength(nivel.opcoes)
        expect(p.opcoes).toContain(p.cubos)
        expect(new Set(p.opcoes).size).toBe(p.opcoes.length)
        for (const n of p.opcoes) {
          expect(n).toBeGreaterThanOrEqual(1)
          expect(n).toBeLessThanOrEqual(nivel.maximo)
        }
      }
    })
  }

  it('saem números diferentes (não é sempre o mesmo)', () => {
    const aleatorio = geradorFixo(3)
    const saidos = new Set(Array.from({ length: 40 }, () => criarPergunta('5-6', aleatorio).cubos))
    expect(saidos.size).toBeGreaterThan(3)
  })
})

describe('quantidades: as filas do desenho', () => {
  it('em grupos de 5', () => {
    expect(POR_FILA).toBe(5)
    expect(filasDeCubos(3)).toEqual([3])
    expect(filasDeCubos(5)).toEqual([5])
    expect(filasDeCubos(7)).toEqual([5, 2])
    expect(filasDeCubos(20)).toEqual([5, 5, 5, 5])
    expect(filasDeCubos(0)).toEqual([])
  })
})
