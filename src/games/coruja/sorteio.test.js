import { describe, expect, it } from 'vitest'
import {
  TODOS_OS_IDS,
  parecidosCom,
  quantasImagens56,
  somDoId,
  sortearImagens,
  sortearImagensParecidas,
  sortearPergunta34,
  sortearSequencia,
} from './sorteio'

// Os sorteios são ao acaso: repetimos muitas vezes para apanhar casos raros
const VEZES = 300
const categoria = (id) => somDoId(id).categoria
const semRepetidos = (lista) => new Set(lista).size === lista.length

describe('parecidosCom', () => {
  it('dá os outros sons do mesmo grupo', () => {
    expect(parecidosCom('chuva').sort()).toEqual(['mar', 'rio'])
    expect(parecidosCom('cao')).toEqual(['gato'])
  })
})

describe('3–4: sortearPergunta34', () => {
  it('3 opções diferentes, com a certa lá dentro', () => {
    for (let i = 0; i < VEZES; i++) {
      const { certo, opcoes } = sortearPergunta34([], i % 2 === 0)
      expect(opcoes).toHaveLength(3)
      expect(semRepetidos(opcoes)).toBe(true)
      expect(opcoes).toContain(certo)
    }
  })

  it('fácil: as erradas são de outras categorias (e diferentes entre si)', () => {
    for (let i = 0; i < VEZES; i++) {
      const { certo, opcoes } = sortearPergunta34([])
      const erradas = opcoes.filter((id) => id !== certo)
      for (const id of erradas) expect(categoria(id)).not.toBe(categoria(certo))
      expect(categoria(erradas[0])).not.toBe(categoria(erradas[1]))
    }
  })

  it('difícil: as erradas são da mesma categoria', () => {
    for (let i = 0; i < VEZES; i++) {
      const { certo, opcoes } = sortearPergunta34([], true)
      for (const id of opcoes) expect(categoria(id)).toBe(categoria(certo))
    }
  })

  it('com o saco, todos os sons saem antes de algum se repetir', () => {
    let saco = []
    const saidos = []
    for (let i = 0; i < TODOS_OS_IDS.length; i++) {
      const r = sortearPergunta34(saco)
      saidos.push(r.certo)
      saco = r.saco
    }
    expect(saidos.sort()).toEqual([...TODOS_OS_IDS].sort())
  })
})

describe('5–6: imagens e sequência', () => {
  it('quantasImagens56: entre 4 e 6, sempre 2 a mais do que a sequência', () => {
    expect(quantasImagens56(2)).toBe(4)
    expect(quantasImagens56(3)).toBe(5)
    expect(quantasImagens56(4)).toBe(6)
  })

  it('sortearImagens: imagens todas diferentes e o saco vai rodando', () => {
    let saco = []
    const vistas = new Set()
    for (let i = 0; i < 6; i++) {
      const r = sortearImagens(saco, 4)
      expect(r.imagens).toHaveLength(4)
      expect(semRepetidos(r.imagens)).toBe(true)
      r.imagens.forEach((id) => vistas.add(id))
      saco = r.saco
    }
    // 6 rondas x 4 = 24 imagens: o saco garante que aparecem os 22 sons
    expect(vistas.size).toBe(TODOS_OS_IDS.length)
  })

  it('sequência sem repetições, só com sons das imagens', () => {
    for (let i = 0; i < VEZES; i++) {
      const { imagens } = sortearImagens([], 6)
      const seq = sortearSequencia(imagens, 4)
      expect(seq).toHaveLength(4)
      expect(semRepetidos(seq)).toBe(true)
      for (const id of seq) expect(imagens).toContain(id)
    }
  })
})

describe('7–8: sons parecidos e sequências longas', () => {
  it('6 imagens diferentes, quase sempre com vários sons do mesmo grupo', () => {
    let comParecidos = 0
    for (let i = 0; i < VEZES; i++) {
      const { imagens } = sortearImagensParecidas([], 6)
      expect(imagens).toHaveLength(6)
      expect(semRepetidos(imagens)).toBe(true)
      const grupos = imagens.map((id) => somDoId(id).parecidos)
      if (new Set(grupos).size <= 4) comParecidos++
    }
    // Pelo menos 2 pares de parecidos na grande maioria das vezes
    expect(comParecidos / VEZES).toBeGreaterThan(0.9)
  })

  it('sequência de 8 com 6 imagens: pode repetir, mas nunca dois seguidos', () => {
    for (let i = 0; i < VEZES; i++) {
      const { imagens } = sortearImagensParecidas([], 6)
      const seq = sortearSequencia(imagens, 8, true)
      expect(seq).toHaveLength(8)
      for (let j = 1; j < seq.length; j++) expect(seq[j]).not.toBe(seq[j - 1])
      for (const id of seq) expect(imagens).toContain(id)
    }
  })

  it('números previsíveis dão sempre o mesmo sorteio (útil para testar)', () => {
    const fixo = () => 0.3
    expect(sortearSequencia(['a', 'b', 'c'], 4, true, fixo)).toEqual(['a', 'b', 'a', 'b'])
  })
})
