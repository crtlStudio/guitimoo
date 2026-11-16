import { describe, expect, it } from 'vitest'
import { CORES, NIVEIS, criarPergunta, respostaCertaLogica } from './logica'
import { MAXIMO_SEGUIDAS, TIPOS, sortearTipo } from './rodizio'

/** Números "ao calhas" sempre iguais (para os testes darem sempre o mesmo). */
function geradorFixo(semente = 1) {
  let s = semente
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Repõe a fila completa (com a resposta no "?"). */
const completa = (p) => p.fila.map((c) => c ?? p.resposta)

describe('lógica: a fila segue o padrão', () => {
  for (const escalao of Object.keys(NIVEIS)) {
    it(`${escalao}: cada cubinho é igual ao que está um padrão atrás`, () => {
      for (let s = 1; s < 60; s++) {
        const p = criarPergunta(escalao, geradorFixo(s))
        const fila = completa(p)
        expect(fila).toHaveLength(NIVEIS[escalao].quantos)
        for (let i = p.padrao.length; i < fila.length; i++) expect(fila[i]).toBe(fila[i - p.padrao.length])
        // letras diferentes do padrão têm cores diferentes
        const cores = new Set(fila.slice(0, p.padrao.length))
        expect(cores.size).toBe(new Set(p.padrao).size)
        for (const c of fila) expect(CORES).toContain(c)
      }
    })
  }
})

describe('lógica: o "?"', () => {
  it('3–4 e 5–6: o "?" é sempre o último', () => {
    for (const escalao of ['3-4', '5-6']) {
      for (let s = 1; s < 40; s++) {
        const p = criarPergunta(escalao, geradorFixo(s))
        expect(p.buraco).toBe(NIVEIS[escalao].quantos - 1)
        expect(p.fila.filter((c) => c === null)).toHaveLength(1)
      }
    }
  })

  it('7–8: o "?" pode estar a meio, mas só depois de o padrão aparecer inteiro', () => {
    const lugares = new Set()
    for (let s = 1; s < 120; s++) {
      const p = criarPergunta('7-8', geradorFixo(s))
      expect(p.buraco).toBeGreaterThanOrEqual(p.padrao.length)
      lugares.add(p.buraco)
    }
    expect(lugares.size).toBeGreaterThan(1)
  })

  it('3–4 usa só o padrão mais simples (AB)', () => {
    for (let s = 1; s < 20; s++) expect(criarPergunta('3-4', geradorFixo(s)).padrao).toBe('ab')
  })
})

describe('lógica: as opções', () => {
  it('têm a resposta, sem cores repetidas, e o número certo de opções', () => {
    for (const escalao of Object.keys(NIVEIS)) {
      for (let s = 1; s < 60; s++) {
        const p = criarPergunta(escalao, geradorFixo(s))
        expect(p.opcoes).toHaveLength(NIVEIS[escalao].opcoes)
        expect(new Set(p.opcoes).size).toBe(p.opcoes.length)
        expect(p.opcoes).toContain(p.resposta)
      }
    }
  })

  it('a resposta nem sempre está no mesmo sítio', () => {
    const lugares = new Set()
    for (let s = 1; s < 40; s++) {
      const p = criarPergunta('5-6', geradorFixo(s))
      lugares.add(p.opcoes.indexOf(p.resposta))
    }
    expect(lugares.size).toBeGreaterThan(1)
  })

  it('respostaCertaLogica', () => {
    const p = criarPergunta('3-4', geradorFixo(5))
    expect(respostaCertaLogica(p, p.resposta)).toBe(true)
    expect(respostaCertaLogica(p, p.opcoes.find((c) => c !== p.resposta))).toBe(false)
  })
})

describe('rodízio dos jogos', () => {
  it('sai sempre um dos tipos', () => {
    for (let s = 1; s < 30; s++) expect(TIPOS).toContain(sortearTipo([], geradorFixo(s)))
  })

  it('nunca o mesmo mais de MAXIMO_SEGUIDAS vezes seguidas', () => {
    const iguais = Array(MAXIMO_SEGUIDAS).fill('logica')
    for (let s = 1; s < 30; s++) expect(sortearTipo(iguais, geradorFixo(s))).not.toBe('logica')
  })

  it('ao calhas: saem todos os tipos', () => {
    const saidos = new Set()
    const aleatorio = geradorFixo(3) // o mesmo gerador, várias tiragens seguidas
    for (let i = 0; i < 30; i++) saidos.add(sortearTipo([], aleatorio))
    expect(saidos.size).toBe(TIPOS.length)
  })
})
