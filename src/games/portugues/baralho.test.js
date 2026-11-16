import { describe, expect, it } from 'vitest'
import { baralhar, tirarDoSaco, tirarVariasDoSaco } from './baralho'

const TODAS = ['GATO', 'SOL', 'PATO', 'LUA', 'MAR']

describe('baralhar', () => {
  it('mantém os mesmos elementos, só muda a ordem', () => {
    const resultado = baralhar(TODAS)
    expect(resultado).toHaveLength(TODAS.length)
    expect([...resultado].sort()).toEqual([...TODAS].sort())
  })

  it('não altera a lista original', () => {
    const original = [...TODAS]
    baralhar(TODAS)
    expect(TODAS).toEqual(original)
  })
})

describe('tirarDoSaco', () => {
  it('tira a primeira palavra e devolve o resto do saco', () => {
    const { palavra, saco } = tirarDoSaco(['SOL', 'LUA'], TODAS)
    expect(palavra).toBe('SOL')
    expect(saco).toEqual(['LUA'])
  })

  it('com o saco vazio, volta a encher com todas', () => {
    const { palavra, saco } = tirarDoSaco([], TODAS)
    expect(TODAS).toContain(palavra)
    expect(saco).toHaveLength(TODAS.length - 1)
  })

  it('nenhuma palavra repete antes de saírem todas', () => {
    let saco = []
    let ultima = null
    // 4 voltas completas
    for (let volta = 0; volta < 4; volta++) {
      const saidas = []
      for (let i = 0; i < TODAS.length; i++) {
        const r = tirarDoSaco(saco, TODAS, ultima)
        saidas.push(r.palavra)
        saco = r.saco
        ultima = r.palavra
      }
      expect([...saidas].sort()).toEqual([...TODAS].sort())
    }
  })

  it('nunca sai a mesma palavra duas vezes seguidas, mesmo ao mudar de volta', () => {
    let saco = []
    let ultima = null
    for (let i = 0; i < 500; i++) {
      const r = tirarDoSaco(saco, TODAS, ultima)
      expect(r.palavra).not.toBe(ultima)
      saco = r.saco
      ultima = r.palavra
    }
  })
})

describe('tirarVariasDoSaco', () => {
  it('tira a quantidade pedida, sem repetir dentro da mesma jogada', () => {
    // Saco quase vazio: obriga a encher a meio
    for (let i = 0; i < 200; i++) {
      const { palavras } = tirarVariasDoSaco(['SOL'], TODAS, 3)
      expect(palavras).toHaveLength(3)
      expect(new Set(palavras).size).toBe(3)
    }
  })
})
