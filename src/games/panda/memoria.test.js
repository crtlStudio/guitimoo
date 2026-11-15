import { beforeEach, describe, expect, it, vi } from 'vitest'

// Nos testes não há telemóvel: trocamos o Preferences por uma "gaveta"
// falsa em memória (um Map), com as mesmas funções get e set.
const gaveta = new Map()
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: async ({ key }) => ({ value: gaveta.has(key) ? gaveta.get(key) : null }),
    set: async ({ key, value }) => {
      gaveta.set(key, value)
    },
  },
}))

// Importa depois do vi.mock, para usar a gaveta falsa
const { guardarEscalao, lerEscalao, proximaPalavra, proximasPalavras } = await import('./memoria')

const TODAS = ['GATO', 'SOL', 'PATO', 'LUA', 'MAR']

beforeEach(() => gaveta.clear()) // cada teste começa com a gaveta vazia

describe('escalão', () => {
  it('sem nada guardado, devolve null', async () => {
    expect(await lerEscalao()).toBeNull()
  })

  it('guarda e lê o escalão escolhido', async () => {
    await guardarEscalao('5-6')
    expect(await lerEscalao()).toBe('5-6')
  })

  it('ignora um valor guardado inválido', async () => {
    gaveta.set('panda:escalao', '99-100')
    expect(await lerEscalao()).toBeNull()
  })
})

describe('proximaPalavra', () => {
  it('não repete palavras até saírem todas, mesmo lendo e guardando a cada vez', async () => {
    const saidas = []
    for (let i = 0; i < TODAS.length; i++) saidas.push(await proximaPalavra('5-6', TODAS))
    expect([...saidas].sort()).toEqual([...TODAS].sort())
  })

  it('continua de onde ficou (como se a app tivesse fechado e aberto)', async () => {
    const primeira = await proximaPalavra('5-6', TODAS)
    const guardado = JSON.parse(gaveta.get('panda:saco:5-6'))
    expect(guardado.ultima).toBe(primeira)
    expect(guardado.saco).toHaveLength(TODAS.length - 1)
    expect(guardado.saco).not.toContain(primeira)
  })

  it('cada escalão tem o seu próprio saco', async () => {
    await proximaPalavra('5-6', TODAS)
    expect(gaveta.has('panda:saco:5-6')).toBe(true)
    expect(gaveta.has('panda:saco:7-8')).toBe(false)
  })

  it('ignora palavras guardadas que já não existem na lista', async () => {
    gaveta.set('panda:saco:5-6', JSON.stringify({ saco: ['DINOSSAURO', 'SOL'], ultima: null }))
    expect(await proximaPalavra('5-6', TODAS)).toBe('SOL')
  })

  it('recupera de um saco guardado estragado', async () => {
    gaveta.set('panda:saco:5-6', 'isto não é JSON')
    expect(TODAS).toContain(await proximaPalavra('5-6', TODAS))
  })
})

describe('proximasPalavras', () => {
  it('tira 3 palavras diferentes e guarda o saco', async () => {
    const palavras = await proximasPalavras('7-8', TODAS, 3)
    expect(new Set(palavras).size).toBe(3)
    expect(JSON.parse(gaveta.get('panda:saco:7-8')).saco).toHaveLength(2)
  })
})
