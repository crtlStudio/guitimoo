import { describe, expect, it } from 'vitest'
import { criarLinhaDoTempo } from './linhaDoTempo'

const A = { x: 10, y: 20 }
const B = { x: 100, y: 200 }
const C = { x: 50, y: 50 }

describe('linha do tempo do dedo fantasma', () => {
  it('sem passos: nada', () => {
    expect(criarLinhaDoTempo([])).toBeNull()
    expect(criarLinhaDoTempo(null)).toBeNull()
  })

  it('as listas têm todas o mesmo tamanho; os tempos vão de 0 a 1, sempre a crescer', () => {
    const l = criarLinhaDoTempo([
      { tipo: 'tocar', em: A, vezes: 2 },
      { tipo: 'arrastar', de: B, para: C, imagem: 'cubo.webp' },
      { tipo: 'percorrer', de: A, para: B },
    ])
    const n = l.tempos.length
    for (const lista of [l.x, l.y, l.escala, l.opacidade, l.objetos[0].x, l.objetos[0].opacidade]) expect(lista).toHaveLength(n)
    expect(l.tempos[0]).toBe(0)
    expect(l.tempos.at(-1)).toBe(1)
    for (let i = 1; i < n; i++) expect(l.tempos[i]).toBeGreaterThanOrEqual(l.tempos[i - 1])
    expect(l.duracao).toBeGreaterThan(0)
  })

  it('aparece e desaparece (começa e acaba transparente)', () => {
    const l = criarLinhaDoTempo([{ tipo: 'tocar', em: A }])
    expect(l.opacidade[0]).toBe(0)
    expect(l.opacidade.at(-1)).toBe(0)
    expect(Math.max(...l.opacidade)).toBeGreaterThan(0.5)
  })

  it('tocar 2 vezes: o dedo baixa 2 vezes no mesmo sítio', () => {
    const l = criarLinhaDoTempo([{ tipo: 'tocar', em: A, vezes: 2 }])
    const carregados = l.escala.filter((e, i) => e < 1 && l.x[i] === A.x && l.y[i] === A.y)
    expect(carregados).toHaveLength(2)
  })

  it('arrastar: o objeto só se vê enquanto o dedo o leva, de "de" até "para"', () => {
    const l = criarLinhaDoTempo([{ tipo: 'arrastar', de: B, para: C, imagem: 'cubo.webp' }])
    const [objeto] = l.objetos
    expect(objeto.imagem).toBe('cubo.webp')
    const visiveis = objeto.opacidade.map((o, i) => (o > 0 ? i : null)).filter((i) => i !== null)
    expect(l.x[visiveis[0]]).toBe(B.x)
    expect(l.x[visiveis.at(-1)]).toBe(C.x)
    expect(objeto.opacidade[0]).toBe(0)
    expect(objeto.opacidade.at(-1)).toBe(0)
  })

  it('a soma na balança: 2 toques, arrasto, 2 toques, arrasto', () => {
    const l = criarLinhaDoTempo([
      { tipo: 'tocar', em: A, vezes: 2 },
      { tipo: 'arrastar', de: B, para: C, imagem: 'azul.webp' },
      { tipo: 'tocar', em: B, vezes: 2 },
      { tipo: 'arrastar', de: A, para: C, imagem: 'verde.webp' },
    ])
    expect(l.objetos.map((o) => o.imagem)).toEqual(['azul.webp', 'verde.webp'])
    // os dois objetos nunca se veem ao mesmo tempo
    for (let i = 0; i < l.tempos.length; i++) expect(l.objetos[0].opacidade[i] > 0 && l.objetos[1].opacidade[i] > 0).toBe(false)
  })
})
