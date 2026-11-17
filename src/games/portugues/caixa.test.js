import { describe, expect, it } from 'vitest'
import {
  NIVEIS_DA_CAIXA,
  criarRondaCaixa,
  encaixa,
  letrasDe,
  lugaresVazios,
  palavraCompleta,
  primeiroVazio,
} from './caixa'

/** Números "ao acaso" sempre iguais, para os testes darem sempre o mesmo. */
function aleatorioFixo(sequencia = [0.1, 0.7, 0.3, 0.9, 0.5]) {
  let i = 0
  return () => sequencia[i++ % sequencia.length]
}

describe('níveis da caixa', () => {
  it('no Fácil só entram palavras curtas', () => {
    expect(NIVEIS_DA_CAIXA['3-4'].lista.length).toBeGreaterThan(5)
    for (const { palavra } of NIVEIS_DA_CAIXA['3-4'].lista) expect(palavra.length).toBeLessThanOrEqual(4)
  })

  it('as ajudas diminuem do Fácil para o Difícil', () => {
    expect(NIVEIS_DA_CAIXA['3-4']).toMatchObject({ mostraPalavra: true, guias: true, aMais: 0 })
    expect(NIVEIS_DA_CAIXA['5-6']).toMatchObject({ mostraPalavra: true, guias: false, aMais: 0 })
    expect(NIVEIS_DA_CAIXA['7-8']).toMatchObject({ mostraPalavra: false, guias: false, aMais: 2 })
  })

  it('todas as palavras têm imagem (emoji)', () => {
    for (const nivel of Object.values(NIVEIS_DA_CAIXA)) {
      for (const item of nivel.lista) expect(item.emoji).toBeTruthy()
    }
  })
})

describe('letrasDe', () => {
  it('usa a palavra como se escreve, com acentos', () => {
    expect(letrasDe({ palavra: 'GATO' })).toEqual(['G', 'A', 'T', 'O'])
    expect(letrasDe({ palavra: 'LEAO', mostrar: 'LEÃO' })).toEqual(['L', 'E', 'Ã', 'O'])
  })
})

describe('criarRondaCaixa', () => {
  it('um cubo por letra, baralhados e nunca pela ordem certa', () => {
    for (const palavra of ['GATO', 'SOL', 'BOLA', 'UVA', 'OVO']) {
      for (let s = 0; s < 20; s++) {
        const ronda = criarRondaCaixa({ palavra, emoji: '?' }, '5-6', aleatorioFixo([s / 20, 0.37, 0.81, 0.12]))
        const cubos = ronda.cubos.map((c) => c.letra)
        expect([...cubos].sort()).toEqual([...palavra].sort())
        expect(cubos.join('')).not.toBe(palavra)
      }
    }
  })

  it('os ids dos cubos são todos diferentes', () => {
    const { cubos } = criarRondaCaixa({ palavra: 'BATATA', emoji: '?' }, '5-6')
    expect(new Set(cubos.map((c) => c.id)).size).toBe(cubos.length)
  })

  it('no Difícil há 2 cubos a mais, com letras que não estão na palavra', () => {
    const ronda = criarRondaCaixa({ palavra: 'LEAO', mostrar: 'LEÃO', emoji: '🦁' }, '7-8', aleatorioFixo())
    expect(ronda.letras).toEqual(['L', 'E', 'Ã', 'O'])
    expect(ronda.cubos).toHaveLength(6)
    const aMais = ronda.cubos.map((c) => c.letra).filter((l) => !ronda.letras.includes(l))
    expect(aMais).toHaveLength(2)
    expect(new Set(aMais).size).toBe(2)
  })

  it('guarda a palavra, como se escreve e a imagem', () => {
    const ronda = criarRondaCaixa({ palavra: 'LEAO', mostrar: 'LEÃO', emoji: '🦁' }, '7-8')
    expect(ronda).toMatchObject({ palavra: 'LEAO', mostrar: 'LEÃO', emoji: '🦁' })
  })
})

describe('encaixar os cubos', () => {
  const letras = ['B', 'A', 'T', 'A']

  it('só encaixa a letra certa num lugar vazio', () => {
    const postos = lugaresVazios(letras)
    expect(encaixa(letras, postos, 0, 'B')).toBe(true)
    expect(encaixa(letras, postos, 0, 'A')).toBe(false)
    expect(encaixa(letras, ['B', null, null, null], 0, 'B')).toBe(false) // já ocupado
  })

  it('letras repetidas servem em qualquer dos seus lugares', () => {
    const postos = lugaresVazios(letras)
    expect(encaixa(letras, postos, 1, 'A')).toBe(true)
    expect(encaixa(letras, postos, 3, 'A')).toBe(true)
  })

  it('lugares fora da palavra não encaixam', () => {
    expect(encaixa(letras, lugaresVazios(letras), -1, 'B')).toBe(false)
    expect(encaixa(letras, lugaresVazios(letras), 4, 'A')).toBe(false)
  })

  it('a palavra fica completa quando todos os lugares têm a sua letra', () => {
    expect(palavraCompleta(letras, ['B', 'A', 'T', null])).toBe(false)
    expect(palavraCompleta(letras, ['B', 'A', 'T', 'A'])).toBe(true)
  })

  it('o primeiro lugar vazio', () => {
    expect(primeiroVazio([null, null])).toBe(0)
    expect(primeiroVazio(['B', null, 'T', null])).toBe(1)
    expect(primeiroVazio(['B', 'A'])).toBe(-1)
  })
})
