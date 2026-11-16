import { beforeEach, describe, expect, it, vi } from 'vitest'

// "Gaveta" falsa em memória no lugar do @capacitor/preferences (como no Português)
const gaveta = new Map()
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: async ({ key }) => ({ value: gaveta.has(key) ? gaveta.get(key) : null }),
    set: async ({ key, value }) => {
      gaveta.set(key, value)
    },
  },
}))

const { lembrarUsada, lerProgresso, registarResposta, MAXIMO_RECENTES } = await import('./memoria')

beforeEach(() => gaveta.clear())

describe('progresso', () => {
  it('começa no nível 0', async () => {
    expect(await lerProgresso('5-6')).toEqual({ nivel: 0, certas: 0, erradas: 0, recentes: [] })
  })

  it('regista respostas, sobe de nível e guarda (continua depois de fechar a app)', async () => {
    let p = await lerProgresso('7-8')
    for (let i = 0; i < 3; i++) p = registarResposta('7-8', p, true)
    expect(p.nivel).toBe(1)
    await Promise.resolve()
    expect((await lerProgresso('7-8')).nivel).toBe(1)
  })

  it('lembra as últimas usadas, até um máximo', async () => {
    let p = await lerProgresso('5-6')
    for (let i = 0; i < MAXIMO_RECENTES + 3; i++) p = lembrarUsada('5-6', p, `${i}:0`)
    expect(p.recentes).toHaveLength(MAXIMO_RECENTES)
    expect(p.recentes[0]).toBe(`${MAXIMO_RECENTES + 2}:0`)
    expect((await lerProgresso('5-6')).recentes).toEqual(p.recentes)
  })

  it('recupera de dados estragados ou fora dos limites', async () => {
    gaveta.set('tartaruga:progresso:5-6', 'isto não é JSON')
    expect((await lerProgresso('5-6')).nivel).toBe(0)
    gaveta.set('tartaruga:progresso:5-6', JSON.stringify({ nivel: 99, recentes: 'x' }))
    expect(await lerProgresso('5-6')).toEqual({ nivel: 1, certas: 0, erradas: 0, recentes: [] })
  })
})
