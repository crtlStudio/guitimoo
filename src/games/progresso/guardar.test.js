import { beforeEach, describe, expect, it, vi } from 'vitest'

// "Gaveta" falsa em memória no lugar do @capacitor/preferences
const gaveta = new Map()
let falharLeitura = false
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: async ({ key }) => {
      if (falharLeitura) throw new Error('telemóvel ocupado')
      return { value: gaveta.has(key) ? gaveta.get(key) : null }
    },
    set: async ({ key, value }) => {
      gaveta.set(key, value)
    },
  },
}))

const { guardarProgresso, lerProgresso, _recomecarParaTestes } = await import('./guardar')
const { adicionarEstrelas, criarProgresso, escolherMascote, perfilAtivo } = await import('./progresso')

beforeEach(() => {
  gaveta.clear()
  falharLeitura = false
  _recomecarParaTestes()
})

describe('guardar.js', () => {
  it('sem nada guardado, começa do zero', async () => {
    expect(await lerProgresso()).toEqual(criarProgresso())
  })

  it('guarda e volta a ler o mesmo', async () => {
    const p = adicionarEstrelas(escolherMascote(criarProgresso('facil'), 'sapo'), 'horas', 23).progresso
    await guardarProgresso(p)
    expect(await lerProgresso()).toEqual(p)
  })

  it('converte a faixa etária antiga no nível', async () => {
    gaveta.set('sapo:escalao', '7-8')
    gaveta.set('panda:escalao', '5-6')
    gaveta.set('coruja:escalao', '7-8')
    expect(perfilAtivo(await lerProgresso()).nivel).toBe('dificil')
  })

  it('texto estragado: não rebenta, começa do zero e guarda uma cópia', async () => {
    gaveta.set('progresso', '{isto não é json')
    gaveta.set('panda:escalao', '3-4')
    const p = await lerProgresso()
    expect(perfilAtivo(p).nivel).toBe('facil')
    expect(perfilAtivo(p).estrelas.matematica.total).toBe(0)
    expect(gaveta.get('progresso:estragado')).toBe('{isto não é json')
  })

  it('se a leitura falhar, não escreve por cima do que lá está', async () => {
    gaveta.set('progresso', 'o verdadeiro')
    falharLeitura = true
    const p = await lerProgresso()
    await guardarProgresso(p)
    expect(gaveta.get('progresso')).toBe('o verdadeiro')
  })
})
