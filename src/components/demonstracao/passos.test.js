import { describe, expect, it } from 'vitest'
import { duracao, estadoNoPasso } from './passos'

const PASSOS = [
  { ms: 100, dedo: null, cor: 'azul' },
  { ms: 200, dedo: [10, 20] },
  { ms: 300, toca: 2, cor: 'verde' },
  { ms: 400, dedo: null },
]

describe('estadoNoPasso', () => {
  it('junta o que os passos anteriores mudaram', () => {
    expect(estadoNoPasso(PASSOS, 2)).toMatchObject({ dedo: [10, 20], cor: 'verde', toca: 2 })
  })

  it('o toque só conta no seu passo', () => {
    expect(estadoNoPasso(PASSOS, 3).toca).toBe(0)
  })

  it('lembra onde o dedo esteve por último, mesmo escondido', () => {
    expect(estadoNoPasso(PASSOS, 3)).toMatchObject({ dedo: null, ultimoDedo: [10, 20] })
    expect(estadoNoPasso(PASSOS, 0).ultimoDedo).toBeNull()
  })
})

describe('duracao', () => {
  it('soma os milissegundos de todos os passos', () => {
    expect(duracao(PASSOS)).toBe(1000)
  })
})
