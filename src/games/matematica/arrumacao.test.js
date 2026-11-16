import { describe, expect, it } from 'vitest'
import { arrumarPrato, posicoesNoPrato } from './arrumacao'

const opcoes = { porFila: 3, sobreposicao: 1, alturaDaFila: 1 }

describe('posicoesNoPrato', () => {
  it('prato vazio: nenhuma posição', () => {
    expect(posicoesNoPrato(0, opcoes)).toEqual([])
  })

  it('um cubinho fica ao meio, assente no prato', () => {
    expect(posicoesNoPrato(1, opcoes)).toEqual([{ x: 0, y: 0 }])
  })

  it('uma fila incompleta fica centrada', () => {
    expect(posicoesNoPrato(2, opcoes)).toEqual([
      { x: -0.5, y: 0 },
      { x: 0.5, y: 0 },
    ])
  })

  it('quando a fila enche, o seguinte vai para uma fila mais acima (ao meio)', () => {
    const p = posicoesNoPrato(4, opcoes)
    expect(p.slice(0, 3).map((s) => s.y)).toEqual([0, 0, 0])
    expect(p.slice(0, 3).map((s) => s.x)).toEqual([-1, 0, 1])
    expect(p[3]).toEqual({ x: 0, y: -1 })
  })

  it('cada fila sobe a mesma altura', () => {
    const p = posicoesNoPrato(9, opcoes)
    expect([p[0].y, p[3].y, p[6].y]).toEqual([0, -1, -2])
  })

  it('os primeiros não mudam de sítio quando chegam mais (exceto para centrar a sua fila)', () => {
    const com3 = posicoesNoPrato(3, opcoes)
    const com5 = posicoesNoPrato(5, opcoes)
    expect(com5.slice(0, 3)).toEqual(com3)
  })
})

describe('arrumarPrato', () => {
  const tamanhos = { grande: 4, pequeno: 3 }

  it('até 6 cubinhos: grandes, em filas de 3', () => {
    const { tamanho, posicoes } = arrumarPrato(6, tamanhos)
    expect(tamanho).toBe(4)
    expect(new Set(posicoes.map((p) => p.y)).size).toBe(2) // 2 filas
  })

  it('com mais: pequenos, em filas de 5 (grupos de 5)', () => {
    const { tamanho, posicoes } = arrumarPrato(10, tamanhos)
    expect(tamanho).toBe(3)
    expect(posicoes.slice(0, 5).every((p) => p.y === posicoes[0].y)).toBe(true)
    expect(posicoes[5].y).toBeLessThan(posicoes[4].y)
  })

  it('cada grupo de 10 fica um bocadinho afastado do anterior', () => {
    const { posicoes } = arrumarPrato(20, tamanhos)
    const entreFilas = posicoes[5].y - posicoes[0].y // dentro do mesmo grupo de 10
    const entreGrupos = posicoes[10].y - posicoes[5].y // do 1.º para o 2.º grupo de 10
    expect(Math.abs(entreGrupos)).toBeGreaterThan(Math.abs(entreFilas))
  })
})
