import { describe, expect, it } from 'vitest'
import {
  ANGULO_MAXIMO,
  calcularAngulo,
  calcularDescidas,
  DESCIDA_MAXIMA,
  DESCIDA_POR_CUBINHO,
  PARTE_QUE_SOBE,
  estaEquilibrada,
  GRAUS_POR_CUBINHO,
} from './balanca'

describe('calcularAngulo', () => {
  it('com os pratos iguais, a barra fica horizontal (0°)', () => {
    expect(calcularAngulo(0, 0)).toBe(0)
    expect(calcularAngulo(4, 4)).toBe(0)
    expect(Object.is(calcularAngulo(3, 3), 0)).toBe(true) // e não "-0"
  })

  it('mais cubinhos à direita: ângulo positivo (a direita desce)', () => {
    expect(calcularAngulo(2, 3)).toBe(GRAUS_POR_CUBINHO)
    expect(calcularAngulo(2, 5)).toBe(3 * GRAUS_POR_CUBINHO)
  })

  it('mais cubinhos à esquerda: ângulo negativo (a esquerda desce)', () => {
    expect(calcularAngulo(3, 2)).toBe(-GRAUS_POR_CUBINHO)
  })

  it('nunca passa do ângulo máximo, para nenhum dos lados', () => {
    expect(calcularAngulo(0, 20)).toBe(ANGULO_MAXIMO)
    expect(calcularAngulo(20, 0)).toBe(-ANGULO_MAXIMO)
  })

  it('o mesmo excesso dá o mesmo ângulo, seja qual for o total', () => {
    expect(calcularAngulo(1, 3)).toBe(calcularAngulo(10, 12))
  })
})

describe('calcularDescidas', () => {
  it('equilibrada (ou vazia): nenhum braço desce', () => {
    expect(calcularDescidas(0, 0)).toEqual({ esquerda: 0, direita: 0 })
    expect(calcularDescidas(4, 4)).toEqual({ esquerda: 0, direita: 0 })
  })

  it('o mais pesado desce e o mais leve sobe (metade)', () => {
    const por = DESCIDA_POR_CUBINHO['7-8']
    expect(calcularDescidas(6, 0)).toEqual({ esquerda: 6 * por, direita: -6 * por * PARTE_QUE_SOBE })
    expect(calcularDescidas(1, 3)).toEqual({ esquerda: -2 * por * PARTE_QUE_SOBE, direita: 2 * por })
  })

  it('desce um bocadinho mais por cada cubinho de diferença', () => {
    expect(calcularDescidas(3, 0).esquerda).toBeGreaterThan(calcularDescidas(2, 0).esquerda)
  })

  it('nos mais pequenos (menos cubinhos) cada cubinho mexe mais o braço', () => {
    const facil = calcularDescidas(2, 0, DESCIDA_POR_CUBINHO['3-4']).esquerda
    const medio = calcularDescidas(2, 0, DESCIDA_POR_CUBINHO['5-6']).esquerda
    const dificil = calcularDescidas(2, 0, DESCIDA_POR_CUBINHO['7-8']).esquerda
    expect(facil).toBeGreaterThan(medio)
    expect(medio).toBeGreaterThan(dificil)
  })

  it('o máximo de cada idade chega ao fim do curso sem passar dele', () => {
    // 3–4 contam até 5, 5–6 até 10, 7–8 até 20
    for (const [escalao, maximo] of [['3-4', 5], ['5-6', 10], ['7-8', 20]]) {
      expect(calcularDescidas(maximo, 0, DESCIDA_POR_CUBINHO[escalao]).esquerda).toBeLessThanOrEqual(DESCIDA_MAXIMA)
    }
    expect(calcularDescidas(50, 0).esquerda).toBe(DESCIDA_MAXIMA)
  })
})

describe('estaEquilibrada', () => {
  it('só está equilibrada com o mesmo número dos dois lados', () => {
    expect(estaEquilibrada(5, 5)).toBe(true)
    expect(estaEquilibrada(0, 0)).toBe(true)
    expect(estaEquilibrada(4, 5)).toBe(false)
  })
})
