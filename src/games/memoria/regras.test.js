import { describe, expect, it } from 'vitest'
import {
  NIVEIS,
  SOBE_COM,
  ajustarNivel,
  ordemEsperada,
  regrasDoNivel,
  sortearAoContrario,
  verificarToque,
} from './regras'

describe('níveis', () => {
  it('as sequências crescem 1 som de cada vez: 2–4 nos 5–6, 5–8 nos 7–8', () => {
    expect(NIVEIS['5-6'].map((n) => n.comprimento)).toEqual([2, 3, 4])
    expect(NIVEIS['7-8'].map((n) => n.comprimento)).toEqual([5, 6, 7, 8])
  })

  it('regrasDoNivel aguenta níveis fora dos limites', () => {
    expect(regrasDoNivel('5-6', -3).comprimento).toBe(2)
    expect(regrasDoNivel('5-6', 99).comprimento).toBe(4)
  })

  it('"ao contrário" só aparece mais à frente nos 7–8', () => {
    expect(sortearAoContrario('7-8', 0, () => 0)).toBe(false) // nível 0: nunca
    expect(sortearAoContrario('5-6', 2, () => 0)).toBe(false) // 5–6: nunca
    expect(sortearAoContrario('7-8', 1, () => 0.1)).toBe(true)
    expect(sortearAoContrario('7-8', 1, () => 0.9)).toBe(false)
  })
})

describe('verificar os toques', () => {
  const seq = ['cao', 'mar', 'buzina']

  it('pela ordem certa: certo, certo, completo', () => {
    const esperada = ordemEsperada(seq)
    expect(verificarToque(esperada, 0, 'cao')).toBe('certo')
    expect(verificarToque(esperada, 1, 'mar')).toBe('certo')
    expect(verificarToque(esperada, 2, 'buzina')).toBe('completo')
  })

  it('um toque fora de ordem é errado', () => {
    expect(verificarToque(ordemEsperada(seq), 0, 'mar')).toBe('errado')
    expect(verificarToque(ordemEsperada(seq), 1, 'cao')).toBe('errado')
  })

  it('ao contrário: começa pelo último som', () => {
    const esperada = ordemEsperada(seq, true)
    expect(esperada).toEqual(['buzina', 'mar', 'cao'])
    expect(verificarToque(esperada, 0, 'cao')).toBe('errado')
    expect(verificarToque(esperada, 0, 'buzina')).toBe('certo')
    expect(seq).toEqual(['cao', 'mar', 'buzina']) // a sequência original não muda
  })

  it('funciona com sons repetidos (7–8)', () => {
    const esperada = ordemEsperada(['cao', 'mar', 'cao'])
    expect(verificarToque(esperada, 2, 'cao')).toBe('completo')
  })
})

describe('ajustarNivel', () => {
  it(`sobe um nível com ${SOBE_COM} certas seguidas`, () => {
    let p = { nivel: 0, certasSeguidas: 0 }
    p = ajustarNivel('5-6', p, true)
    p = ajustarNivel('5-6', p, true)
    expect(p.nivel).toBe(0)
    p = ajustarNivel('5-6', p, true)
    expect(p).toEqual({ nivel: 1, certasSeguidas: 0 })
  })

  it('um erro desce um nível e recomeça a contagem', () => {
    expect(ajustarNivel('7-8', { nivel: 2, certasSeguidas: 2 }, false)).toEqual({ nivel: 1, certasSeguidas: 0 })
  })

  it('não passa dos limites', () => {
    expect(ajustarNivel('5-6', { nivel: 0, certasSeguidas: 0 }, false).nivel).toBe(0)
    let p = { nivel: 2, certasSeguidas: 0 }
    for (let i = 0; i < 10; i++) p = ajustarNivel('5-6', p, true)
    expect(p.nivel).toBe(2)
  })

  it('não altera o progresso que recebe', () => {
    const p = { nivel: 1, certasSeguidas: 1 }
    ajustarNivel('3-4', p, true)
    expect(p).toEqual({ nivel: 1, certasSeguidas: 1 })
  })
})
