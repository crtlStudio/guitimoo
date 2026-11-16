import { describe, expect, it } from 'vitest'
import { DIRECOES, celulasDaPalavra, gerarGrelha } from './grelha'
import palavras from '../../data/palavras.json'

const TODAS_DIRECOES = ['horizontal', 'vertical', 'diagonalDesce', 'diagonalSobe']

// Lê as letras de uma palavra colocada, a partir das suas células
function lerColocada(letras, colocada) {
  return colocada.celulas.map(({ linha, coluna }) => letras[linha][coluna]).join('')
}

describe('celulasDaPalavra', () => {
  it('calcula as células na horizontal', () => {
    expect(celulasDaPalavra('SOL', { linha: 0, coluna: 1 }, DIRECOES.horizontal)).toEqual([
      { linha: 0, coluna: 1 },
      { linha: 0, coluna: 2 },
      { linha: 0, coluna: 3 },
    ])
  })

  it('calcula as células na diagonal a subir', () => {
    expect(celulasDaPalavra('MAR', { linha: 2, coluna: 0 }, DIRECOES.diagonalSobe)).toEqual([
      { linha: 2, coluna: 0 },
      { linha: 1, coluna: 1 },
      { linha: 0, coluna: 2 },
    ])
  })
})

describe('gerarGrelha', () => {
  it('cria uma grelha do tamanho pedido, só com letras de A a Z', () => {
    const { letras } = gerarGrelha({ tamanho: 6, palavras: ['GATO'] })
    expect(letras).toHaveLength(6)
    for (const linha of letras) {
      expect(linha).toHaveLength(6)
      for (const letra of linha) expect(letra).toMatch(/^[A-Z]$/)
    }
  })

  it('a palavra está mesmo nas células indicadas', () => {
    const { letras, colocadas } = gerarGrelha({ tamanho: 6, palavras: ['GATO'] })
    expect(colocadas).toHaveLength(1)
    expect(lerColocada(letras, colocadas[0])).toBe('GATO')
  })

  it('só usa as direções permitidas', () => {
    for (let i = 0; i < 100; i++) {
      const { colocadas } = gerarGrelha({ tamanho: 6, palavras: ['SOL'], direcoes: ['horizontal'] })
      expect(colocadas[0].direcao).toBe('horizontal')
    }
  })

  it('consegue sempre colocar as 3 palavras mais compridas numa grelha 8x8', () => {
    for (let i = 0; i < 500; i++) {
      const { letras, colocadas } = gerarGrelha({
        tamanho: 8,
        palavras: ['FOGUETE', 'ESTRELA', 'COMBOIO'],
        direcoes: TODAS_DIRECOES,
      })
      expect(colocadas).toHaveLength(3)
      for (const c of colocadas) expect(lerColocada(letras, c)).toBe(c.palavra)
    }
  })

  it('recusa uma palavra maior do que a grelha', () => {
    expect(() => gerarGrelha({ tamanho: 6, palavras: ['ELEFANTE'] })).toThrow()
  })
})

describe('lista de palavras (palavras.json)', () => {
  it('só tem letras de A a Z na grelha (sem acentos nem Ç)', () => {
    for (const lista of Object.values(palavras)) {
      for (const { palavra, emoji } of lista) {
        expect(palavra).toMatch(/^[A-Z]+$/)
        expect(emoji).toBeTruthy()
      }
    }
  })

  it('as palavras de cada escalão cabem na respetiva grelha', () => {
    for (const { palavra } of palavras['5-6']) expect(palavra.length).toBeLessThanOrEqual(6)
    for (const { palavra } of palavras['7-8']) expect(palavra.length).toBeLessThanOrEqual(8)
  })
})
