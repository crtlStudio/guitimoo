import { describe, expect, it } from 'vitest'
import { celulaNoPonto, celulasSelecionadas, mesmaCelula, verificarSelecao } from './selecao'

// Grelha 6x6 fixa, com GATO na linha 2 (de G {2,1} a O {2,4})
const LETRAS = ['MNSZCH', 'PVBPPI', 'RGATOS', 'CPONJX', 'MMGUOQ', 'TMCGNO'].map((l) => [...l])
const G = { linha: 2, coluna: 1 }
const O = { linha: 2, coluna: 4 }

function selecionar(inicio, atual) {
  const celulas = celulasSelecionadas(inicio, atual, 6)
  return verificarSelecao(LETRAS, celulas, ['GATO'])
}

describe('celulasSelecionadas', () => {
  it('sem mexer o dedo, seleciona só a célula inicial', () => {
    expect(celulasSelecionadas(G, G, 6)).toEqual([G])
  })

  it('endireita um arrasto torto para a direção reta mais próxima', () => {
    // Acabou uma linha abaixo do O: continua a ser horizontal
    expect(celulasSelecionadas(G, { linha: 3, coluna: 4 }, 6)).toEqual([
      { linha: 2, coluna: 1 },
      { linha: 2, coluna: 2 },
      { linha: 2, coluna: 3 },
      { linha: 2, coluna: 4 },
    ])
  })

  it('reconhece as diagonais', () => {
    expect(celulasSelecionadas({ linha: 0, coluna: 0 }, { linha: 2, coluna: 2 }, 6)).toEqual([
      { linha: 0, coluna: 0 },
      { linha: 1, coluna: 1 },
      { linha: 2, coluna: 2 },
    ])
  })

  it('pára na borda da grelha', () => {
    const celulas = celulasSelecionadas({ linha: 3, coluna: 3 }, { linha: 9, coluna: 9 }, 6)
    expect(celulas).toHaveLength(3) // {3,3} {4,4} {5,5}
  })
})

describe('verificarSelecao', () => {
  it('encontra a palavra arrastando do início para o fim', () => {
    expect(selecionar(G, O)).toBe('GATO')
  })

  it('encontra a palavra arrastando ao contrário', () => {
    expect(selecionar(O, G)).toBe('GATO')
  })

  it('não aceita seleções curtas ou compridas demais', () => {
    expect(selecionar(G, { linha: 2, coluna: 3 })).toBeNull() // GAT
    expect(selecionar(G, { linha: 2, coluna: 5 })).toBeNull() // GATOS
  })

  it('não aceita palavras que já foram encontradas', () => {
    const celulas = celulasSelecionadas(G, O, 6)
    expect(verificarSelecao(LETRAS, celulas, [])).toBeNull()
  })
})

describe('celulaNoPonto', () => {
  // Grelha 6x6 desenhada no ecrã a partir de (100, 50), com 300x300 píxeis (50 por célula)
  const caixa = { left: 100, top: 50, width: 300, height: 300 }

  it('converte a posição do dedo na célula certa', () => {
    expect(celulaNoPonto(110, 60, caixa, 6)).toEqual({ linha: 0, coluna: 0 })
    expect(celulaNoPonto(175, 160, caixa, 6)).toEqual({ linha: 2, coluna: 1 })
    expect(celulaNoPonto(399, 349, caixa, 6)).toEqual({ linha: 5, coluna: 5 })
  })

  it('fora da grelha, devolve a célula da borda mais próxima', () => {
    expect(celulaNoPonto(50, 10, caixa, 6)).toEqual({ linha: 0, coluna: 0 })
    expect(celulaNoPonto(500, 200, caixa, 6)).toEqual({ linha: 3, coluna: 5 })
  })
})

describe('mesmaCelula', () => {
  it('compara linha e coluna', () => {
    expect(mesmaCelula(G, { linha: 2, coluna: 1 })).toBe(true)
    expect(mesmaCelula(G, O)).toBe(false)
  })
})
