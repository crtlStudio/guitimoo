import { describe, expect, it } from 'vitest'
import { estadoNoPasso } from '../../components/demonstracao/passos'
import {
  CAIXA,
  LETRAS,
  PASSOS_LETRA,
  PASSOS_SOPA_DIFICIL,
  PASSOS_SOPA_MEDIO,
  SOPA_DIFICIL,
  SOPA_MEDIO,
  BALAO,
  centroDaCelula,
  cubosDaCaixa,
  passosDaCaixa,
} from './passosDasInstrucoes'

const fim = (passos) => estadoNoPasso(passos, passos.length - 1)
const TODAS = [PASSOS_LETRA, PASSOS_SOPA_MEDIO, PASSOS_SOPA_DIFICIL, passosDaCaixa('3-4'), passosDaCaixa('7-8')]

describe('todas as demonstrações', () => {
  it('cada passo tem uma duração e o dedo fica dentro da cena', () => {
    for (const passos of TODAS) {
      for (const p of passos) {
        expect(p.ms).toBeGreaterThan(0)
        if (p.dedo) {
          expect(p.dedo[0]).toBeGreaterThanOrEqual(0)
          expect(p.dedo[0]).toBeLessThanOrEqual(100)
          expect(p.dedo[1]).toBeGreaterThanOrEqual(0)
          expect(p.dedo[1]).toBeLessThanOrEqual(63)
        }
      }
    }
  })

  it('acabam certas e com o dedo escondido', () => {
    for (const passos of TODAS) expect(fim(passos)).toMatchObject({ certo: true, dedo: null })
  })
})

describe('o balão da letra', () => {
  it('o dedo toca na letra igual à do balão', () => {
    expect(LETRAS.letras[LETRAS.certa]).toBe(BALAO.letra)
    const toque = PASSOS_LETRA.find((p) => p.toca)
    const antes = estadoNoPasso(PASSOS_LETRA, PASSOS_LETRA.indexOf(toque) - 1)
    expect(antes.dedo[0]).toBe(LETRAS.x[LETRAS.certa])
  })
})

describe('a sopa de letras', () => {
  it('as palavras estão mesmo nas células indicadas', () => {
    for (const sopa of [SOPA_MEDIO, SOPA_DIFICIL]) {
      for (const { palavra, celulas } of sopa.palavras) {
        expect(celulas.map(([l, c]) => sopa.letras[l][c]).join('')).toBe(palavra)
      }
    }
  })

  it('no fim estão todas encontradas e nenhuma letra a meio', () => {
    expect(fim(PASSOS_SOPA_MEDIO)).toMatchObject({ encontradas: [0], marcadas: [] })
    expect(fim(PASSOS_SOPA_DIFICIL)).toMatchObject({ encontradas: [0, 1], marcadas: [] })
  })

  it('o centro das células fica dentro da grelha', () => {
    expect(centroDaCelula(SOPA_MEDIO, [0, 0])).toEqual([5 + 6.5, 6 + 6.5])
  })
})

describe('a caixa das palavras', () => {
  it('no Difícil há 2 cubos a mais', () => {
    expect(cubosDaCaixa('3-4')).toHaveLength(4)
    expect(cubosDaCaixa('5-6')).toHaveLength(4)
    expect(cubosDaCaixa('7-8')).toHaveLength(6)
  })

  it('os cubos ficam centrados e dentro da cena', () => {
    for (const escalao of ['3-4', '7-8']) {
      const xs = cubosDaCaixa(escalao).map((c) => c.x)
      expect(xs[0] + xs.at(-1)).toBe(100)
      expect(Math.min(...xs)).toBeGreaterThan(5)
    }
  })

  it('no fim cada letra do PATO está no seu lugar', () => {
    const { lugarDe, naMao } = fim(passosDaCaixa('5-6'))
    expect(naMao).toBeNull()
    expect(Object.keys(lugarDe).sort((a, b) => lugarDe[a] - lugarDe[b]).join('')).toBe(CAIXA.palavra)
  })

  it('o T vai com um toque (sem ser arrastado)', () => {
    const { arrastadas } = fim(passosDaCaixa('3-4'))
    expect(arrastadas).toEqual(['P', 'A', 'O'])
  })
})
