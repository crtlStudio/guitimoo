import { beforeEach, describe, expect, it, vi } from 'vitest'

// "Gaveta" falsa em memória no lugar do @capacitor/preferences
const gaveta = new Map()
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: async ({ key }) => ({ value: gaveta.has(key) ? gaveta.get(key) : null }),
    set: async ({ key, value }) => {
      gaveta.set(key, value)
    },
  },
}))

const { guardarEscalao, guardarSaco, lerEscalao, lerProgresso, registarRonda, PROGRESSO_INICIAL } =
  await import('./memoria')

beforeEach(() => gaveta.clear())

describe('idade', () => {
  it('guarda e lê; ignora valores inválidos', async () => {
    expect(await lerEscalao()).toBeNull()
    await guardarEscalao('5-6')
    expect(await lerEscalao()).toBe('5-6')
    gaveta.set('coruja:escalao', 'qualquer')
    expect(await lerEscalao()).toBeNull()
  })
})

describe('progresso', () => {
  it('quem nunca jogou começa do início', async () => {
    expect(await lerProgresso('7-8')).toEqual(PROGRESSO_INICIAL)
  })

  it('guarda o nível e continua depois de fechar a app', async () => {
    let p = await lerProgresso('5-6')
    for (let i = 0; i < 3; i++) p = registarRonda('5-6', p, true)
    expect(p.nivel).toBe(1)
    await Promise.resolve() // deixa a gravação acabar
    expect((await lerProgresso('5-6')).nivel).toBe(1)
  })

  it('cada idade tem o seu progresso', async () => {
    let p = await lerProgresso('5-6')
    for (let i = 0; i < 3; i++) p = registarRonda('5-6', p, true)
    await Promise.resolve()
    expect((await lerProgresso('7-8')).nivel).toBe(0)
  })

  it('guarda o saco', async () => {
    const p = await lerProgresso('3-4')
    guardarSaco('3-4', p, ['cao', 'mar'])
    await Promise.resolve()
    expect((await lerProgresso('3-4')).saco).toEqual(['cao', 'mar'])
  })

  it('deita fora sons que já não existem e dados estragados', async () => {
    gaveta.set('coruja:progresso:3-4', JSON.stringify({ nivel: 1, certasSeguidas: 2, saco: ['cao', 'dinossauro'] }))
    expect(await lerProgresso('3-4')).toEqual({ nivel: 1, certasSeguidas: 2, saco: ['cao'] })

    gaveta.set('coruja:progresso:3-4', JSON.stringify({ nivel: 99, certasSeguidas: -1, saco: 'x' }))
    expect(await lerProgresso('3-4')).toEqual({ nivel: 1, certasSeguidas: 0, saco: [] })

    gaveta.set('coruja:progresso:3-4', '{isto não é JSON')
    expect(await lerProgresso('3-4')).toEqual(PROGRESSO_INICIAL)
  })
})
