import { beforeEach, describe, expect, it, vi } from 'vitest'

// Preferences falsas: guardam o que lhes pedimos, para podermos ver
const guardado = new Map()
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(async ({ key }) => ({ value: guardado.has(key) ? guardado.get(key) : null })),
    set: vi.fn(async ({ key, value }) => {
      guardado.set(key, value)
    }),
  },
}))

const { guardarEscalao, lerEscalao, lerProgresso, proximaConta, registarConta, PROGRESSO_INICIAL } = await import(
  './memoria'
)

beforeEach(() => guardado.clear())

describe('memória do Sapo', () => {
  it('guarda e lê a última idade escolhida', async () => {
    expect(await lerEscalao()).toBe(null)
    await guardarEscalao('7-8')
    expect(await lerEscalao()).toBe('7-8')
  })

  it('quem nunca jogou começa no nível 0, sem histórico', async () => {
    expect(await lerProgresso('5-6')).toEqual(PROGRESSO_INICIAL)
  })

  it('proximaConta guarda a conta no histórico do telemóvel', async () => {
    const { conta, progresso } = proximaConta('5-6', await lerProgresso('5-6'))
    expect(progresso.historico).toEqual([conta.chave])
    expect((await lerProgresso('5-6')).historico).toEqual([conta.chave])
  })

  it('registarConta ajusta o nível e guarda', async () => {
    let p = await lerProgresso('5-6')
    for (let i = 0; i < 3; i++) p = registarConta('5-6', p, true)
    expect((await lerProgresso('5-6')).nivel).toBe(1)
  })

  it('cada idade tem o seu progresso', async () => {
    registarConta('7-8', { nivel: 2, certasSeguidas: 0, historico: [] }, true)
    expect((await lerProgresso('5-6')).nivel).toBe(0)
    expect((await lerProgresso('7-8')).nivel).toBe(2)
  })

  it('o que estiver estragado no telemóvel volta ao início', async () => {
    guardado.set('sapo:progresso:5-6', 'isto não é JSON')
    expect(await lerProgresso('5-6')).toEqual(PROGRESSO_INICIAL)
    guardado.set('sapo:progresso:5-6', JSON.stringify({ nivel: 99, certasSeguidas: -3, historico: 'x' }))
    expect(await lerProgresso('5-6')).toEqual({ nivel: 2, certasSeguidas: 0, historico: [] })
  })
})
