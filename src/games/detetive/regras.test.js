import { describe, expect, it } from 'vitest'
import { PROFISSOES } from './profissoes'
import {
  OPCOES,
  PARES,
  PERGUNTAS,
  perguntaFacil,
  perguntaMedio,
  perguntasDoJogo,
  rondaDificil,
  sortearProfissao,
  trabalhaEm,
} from './regras'

/** Números "ao calhas" sempre iguais (para os testes darem sempre o mesmo). */
function geradorFixo(semente = 1) {
  let s = semente
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const ids = (lista) => lista.map((p) => p.id)
const semRepetidos = (lista) => new Set(lista).size === lista.length

describe('as profissões', () => {
  it('cada uma tem id, nome, emoji, 3 pistas e um local', () => {
    expect(PROFISSOES.length).toBeGreaterThanOrEqual(PARES + OPCOES['5-6'])
    for (const p of PROFISSOES) {
      expect(p.id).toMatch(/^[a-z]+$/)
      expect(p.nome).toMatch(/^(o|a) /)
      expect(p.emoji).toBeTruthy()
      expect(p.pistas).toHaveLength(3)
      expect(p.local.id && p.local.nome && p.local.emoji).toBeTruthy()
    }
  })

  it('não há ids, pistas nem locais repetidos (cada pista aponta só para uma profissão)', () => {
    expect(semRepetidos(ids(PROFISSOES))).toBe(true)
    const pistas = PROFISSOES.flatMap((p) => p.pistas)
    expect(semRepetidos(pistas)).toBe(true)
    expect(semRepetidos(PROFISSOES.map((p) => p.local.id))).toBe(true)
    // os emojis dos locais também não se confundem com as pistas
    const imagens = [...pistas, ...PROFISSOES.map((p) => p.local.emoji)]
    expect(semRepetidos(imagens)).toBe(true)
  })
})

describe('sortear', () => {
  it('não repete as recentes enquanto houver outras', () => {
    const recentes = ids(PROFISSOES).slice(0, -1) // todas menos a última
    for (let s = 1; s < 20; s++) {
      expect(sortearProfissao(recentes, geradorFixo(s)).id).toBe(PROFISSOES.at(-1).id)
    }
  })

  it('se já saíram todas, vale qualquer uma', () => {
    expect(sortearProfissao(ids(PROFISSOES), geradorFixo())).toBeDefined()
  })
})

describe('nível fácil', () => {
  it('1 pista da profissão certa e 3 opções diferentes, com a certa lá dentro', () => {
    for (let s = 1; s < 30; s++) {
      const certa = PROFISSOES[s % PROFISSOES.length]
      const p = perguntaFacil(certa, geradorFixo(s))
      expect(certa.pistas).toContain(p.pista)
      expect(p.opcoes).toHaveLength(OPCOES['3-4'])
      expect(semRepetidos(ids(p.opcoes))).toBe(true)
      expect(ids(p.opcoes)).toContain(certa.id)
    }
  })

  it('a certa nem sempre fica no mesmo sítio', () => {
    const certa = PROFISSOES[0]
    const lugares = new Set()
    for (let s = 1; s < 30; s++) lugares.add(ids(perguntaFacil(certa, geradorFixo(s)).opcoes).indexOf(certa.id))
    expect(lugares.size).toBe(OPCOES['3-4'])
  })
})

describe('nível médio', () => {
  it('as 3 pistas da certa (baralhadas) e 4 opções diferentes', () => {
    for (let s = 1; s < 30; s++) {
      const certa = PROFISSOES[s % PROFISSOES.length]
      const p = perguntaMedio(certa, geradorFixo(s))
      expect([...p.pistas].sort()).toEqual([...certa.pistas].sort())
      expect(p.opcoes).toHaveLength(OPCOES['5-6'])
      expect(semRepetidos(ids(p.opcoes))).toBe(true)
      expect(ids(p.opcoes)).toContain(certa.id)
    }
  })

  it('não muda a lista de pistas da profissão', () => {
    const certa = PROFISSOES[0]
    const antes = [...certa.pistas]
    perguntaMedio(certa, geradorFixo(7))
    expect(certa.pistas).toEqual(antes)
  })
})

describe('nível difícil', () => {
  it('3 profissões diferentes e os seus 3 locais, baralhados', () => {
    for (let s = 1; s < 30; s++) {
      const r = rondaDificil([], geradorFixo(s))
      expect(r.profissoes).toHaveLength(PARES)
      expect(semRepetidos(ids(r.profissoes))).toBe(true)
      expect(r.locais.map((l) => l.id).sort()).toEqual(r.profissoes.map((p) => p.local.id).sort())
    }
  })

  it('evita as recentes', () => {
    const recentes = ids(PROFISSOES).slice(PARES) // só as 3 primeiras são novas
    const r = rondaDificil(recentes, geradorFixo(3))
    expect(ids(r.profissoes).sort()).toEqual(ids(PROFISSOES.slice(0, PARES)).sort())
  })

  it('trabalhaEm: cada profissão só no seu local', () => {
    const [bombeira, medico] = PROFISSOES
    expect(trabalhaEm(bombeira, bombeira.local.id)).toBe(true)
    expect(trabalhaEm(bombeira, medico.local.id)).toBe(false)
  })
})

describe('perguntas de cada jogo', () => {
  it('5 no fácil e no médio; no difícil, rondas inteiras de pares', () => {
    expect(perguntasDoJogo('3-4')).toBe(PERGUNTAS)
    expect(perguntasDoJogo('5-6')).toBe(PERGUNTAS)
    expect(perguntasDoJogo('7-8') % PARES).toBe(0)
    expect(perguntasDoJogo('7-8')).toBeGreaterThanOrEqual(PERGUNTAS)
  })
})
