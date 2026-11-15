import { describe, expect, it } from 'vitest'
import {
  ANGULO_MAXIMO,
  calcularAngulo,
  calcularDescidas,
  DESCIDA_MAXIMA,
  DESCIDA_POR_SAPINHO,
  estaEquilibrada,
  GRAUS_POR_SAPINHO,
} from './balanca'

describe('calcularAngulo', () => {
  it('com os pratos iguais, a barra fica horizontal (0°)', () => {
    expect(calcularAngulo(0, 0)).toBe(0)
    expect(calcularAngulo(4, 4)).toBe(0)
    expect(Object.is(calcularAngulo(3, 3), 0)).toBe(true) // e não "-0"
  })

  it('mais sapinhos à direita: ângulo positivo (a direita desce)', () => {
    expect(calcularAngulo(2, 3)).toBe(GRAUS_POR_SAPINHO)
    expect(calcularAngulo(2, 5)).toBe(3 * GRAUS_POR_SAPINHO)
  })

  it('mais sapinhos à esquerda: ângulo negativo (a esquerda desce)', () => {
    expect(calcularAngulo(3, 2)).toBe(-GRAUS_POR_SAPINHO)
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

  it('só desce o mais pesado; o mais leve fica na posição de partida (0)', () => {
    expect(calcularDescidas(6, 0)).toEqual({ esquerda: 6 * DESCIDA_POR_SAPINHO, direita: 0 })
    expect(calcularDescidas(1, 3)).toEqual({ esquerda: 0, direita: 2 * DESCIDA_POR_SAPINHO })
  })

  it('desce um bocadinho mais por cada sapinho de diferença', () => {
    expect(calcularDescidas(3, 0).esquerda).toBeGreaterThan(calcularDescidas(2, 0).esquerda)
  })

  it('nunca desce mais do que o máximo (não chega ao chão, mesmo com 20)', () => {
    expect(calcularDescidas(20, 0).esquerda).toBe(DESCIDA_MAXIMA)
  })
})

describe('estaEquilibrada', () => {
  it('só está equilibrada com o mesmo número dos dois lados', () => {
    expect(estaEquilibrada(5, 5)).toBe(true)
    expect(estaEquilibrada(0, 0)).toBe(true)
    expect(estaEquilibrada(4, 5)).toBe(false)
  })
})
