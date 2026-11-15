import { describe, expect, it } from 'vitest'
import { criarRondaLetra, quantidadeDeLetras } from './letras'

describe('quantidadeDeLetras', () => {
  it('começa com 4 letras e vai até 6', () => {
    expect(quantidadeDeLetras(0)).toBe(4)
    expect(quantidadeDeLetras(2)).toBe(4)
    expect(quantidadeDeLetras(3)).toBe(5)
    expect(quantidadeDeLetras(6)).toBe(6)
    expect(quantidadeDeLetras(50)).toBe(6)
  })
})

describe('criarRondaLetra', () => {
  it('a letra certa é a primeira letra da palavra', () => {
    expect(criarRondaLetra('GATO', 4).alvo).toBe('G')
  })

  it('tem a quantidade pedida de letras, todas diferentes, incluindo a certa', () => {
    for (let quantidade = 4; quantidade <= 6; quantidade++) {
      for (let i = 0; i < 100; i++) {
        const { alvo, opcoes } = criarRondaLetra('MACACO', quantidade)
        expect(opcoes).toHaveLength(quantidade)
        expect(new Set(opcoes).size).toBe(quantidade)
        expect(opcoes).toContain(alvo)
      }
    }
  })

  it('não põe letras parecidas com a certa', () => {
    for (let i = 0; i < 200; i++) {
      expect(criarRondaLetra('ELEFANTE', 6).opcoes).not.toContain('F')
      expect(criarRondaLetra('OVO', 6).opcoes).not.toContain('Q')
      expect(criarRondaLetra('MACACO', 6).opcoes).not.toContain('N')
    }
  })

  it('a letra certa não aparece sempre no mesmo sítio', () => {
    const posicoes = new Set()
    for (let i = 0; i < 100; i++) {
      const { alvo, opcoes } = criarRondaLetra('GATO', 4)
      posicoes.add(opcoes.indexOf(alvo))
    }
    expect(posicoes.size).toBe(4)
  })
})
