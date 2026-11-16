import { beforeEach, describe, expect, it, vi } from 'vitest'

// "Gaveta" falsa em memória no lugar do @capacitor/preferences (como nos outros jogos)
const gaveta = new Map()
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: async ({ key }) => ({ value: gaveta.has(key) ? gaveta.get(key) : null }),
    set: async ({ key, value }) => {
      gaveta.set(key, value)
    },
  },
}))

const { lembrarProfissoes, lerRecentes, MAXIMO_RECENTES } = await import('./memoria')

beforeEach(() => gaveta.clear())

describe('memória do Detetive', () => {
  it('começa vazia', async () => {
    expect(await lerRecentes('3-4')).toEqual([])
  })

  it('lembra as profissões que saíram (a mais recente à frente) e guarda', async () => {
    let r = lembrarProfissoes('5-6', [], ['medico', 'pintor'])
    r = lembrarProfissoes('5-6', r, ['bombeiro', 'medico'])
    expect(r).toEqual(['medico', 'bombeiro', 'pintor'])
    await Promise.resolve()
    expect(await lerRecentes('5-6')).toEqual(r)
    expect(await lerRecentes('7-8')).toEqual([]) // cada faixa etária tem a sua
  })

  it('lembra no máximo MAXIMO_RECENTES', () => {
    const muitas = Array.from({ length: MAXIMO_RECENTES + 4 }, (_, i) => `p${i}`)
    expect(lembrarProfissoes('3-4', [], muitas)).toHaveLength(MAXIMO_RECENTES)
  })

  it('dados estragados começam do zero', async () => {
    gaveta.set('detetive:recentes:3-4', 'isto não é JSON')
    expect(await lerRecentes('3-4')).toEqual([])
    gaveta.set('detetive:recentes:3-4', JSON.stringify({ a: 1 }))
    expect(await lerRecentes('3-4')).toEqual([])
    gaveta.set('detetive:recentes:3-4', JSON.stringify(['medico', 7, null]))
    expect(await lerRecentes('3-4')).toEqual(['medico'])
  })
})
