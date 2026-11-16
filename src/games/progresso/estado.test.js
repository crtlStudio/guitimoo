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

const {
  apagarProgresso,
  carregarProgresso,
  ganharEstrelas,
  guardarPecasNaReserva,
  inscrever,
  mudarProgresso,
  progressoAtual,
  _recomecarParaTestes,
} = await import('./estado')
const { ESTRELAS_POR_PECA: E } = await import('./config')
const { escolherMascote, escolherNivel, perfilAtivo, projetoAtual, resumoDoProgresso } = await import('./progresso')
const estrelas = await import('../estrelas')

beforeEach(() => {
  gaveta.clear()
  _recomecarParaTestes()
  estrelas._recomecarParaTestes()
})

describe('estado do progresso', () => {
  it('começa a null e fica com o progresso depois de ler', async () => {
    expect(progressoAtual()).toBeNull()
    await carregarProgresso()
    expect(perfilAtivo(progressoAtual()).nivel).toBeNull()
  })

  it('lê o telemóvel só uma vez', async () => {
    const primeira = carregarProgresso()
    expect(carregarProgresso()).toBe(primeira)
    await primeira
  })

  it('antes de ler, mudarProgresso não faz nada', () => {
    mudarProgresso((p) => escolherNivel(p, 'facil'))
    expect(progressoAtual()).toBeNull()
  })

  it('ganharEstrelas dá peças à mascote ativa e devolve o resultado', async () => {
    await carregarProgresso()
    mudarProgresso((p) => escolherMascote(p, 'sapo'))
    const r = ganharEstrelas('matematica', 2 * E + 5)
    expect(r.pecasGanhas).toBe(2)
    expect(projetoAtual(progressoAtual()).pecas.matematica).toBe(2)
    expect(perfilAtivo(progressoAtual()).estrelas.matematica).toEqual({ total: 2 * E + 5, resto: 5 })
  })

  it('ganharEstrelas antes de ler o telemóvel: espera e conta na mesma', async () => {
    expect(ganharEstrelas('horas', 10)).toBeNull()
    await carregarProgresso()
    await Promise.resolve()
    expect(perfilAtivo(progressoAtual()).estrelas.horas.total).toBe(10)
  })

  it('guardarPecasNaReserva guarda na reserva da mascote ativa', async () => {
    await carregarProgresso()
    mudarProgresso((p) => escolherMascote(p, 'panda'))
    guardarPecasNaReserva('portugues', 2)
    expect(perfilAtivo(progressoAtual()).mascotes.panda.reserva.portugues).toBe(2)
  })

  it('muda, avisa os inscritos e guarda no telemóvel', async () => {
    const avisar = vi.fn()
    const sair = inscrever(avisar)
    await carregarProgresso()
    avisar.mockClear()

    mudarProgresso((p) => escolherMascote(p, 'coruja'))
    expect(perfilAtivo(progressoAtual()).mascoteAtiva).toBe('coruja')
    expect(avisar).toHaveBeenCalledTimes(1)
    await Promise.resolve()
    expect(JSON.parse(gaveta.get('progresso')).perfis.principal.mascoteAtiva).toBe('coruja')

    // uma mudança que não muda nada não avisa nem guarda
    mudarProgresso((p) => escolherMascote(p, 'leao'))
    expect(avisar).toHaveBeenCalledTimes(1)

    sair()
    mudarProgresso((p) => escolherMascote(p, 'panda'))
    expect(avisar).toHaveBeenCalledTimes(1)
  })

  it('apagarProgresso apaga peças, projetos e o total de estrelas; mantém nível e mascote', async () => {
    await carregarProgresso()
    mudarProgresso((p) => escolherMascote(escolherNivel(p, 'dificil'), 'tartaruga'))
    ganharEstrelas('memoria', 30)
    estrelas.somarEstrelas(30)
    await estrelas.lerTotal()

    apagarProgresso()
    const perfil = perfilAtivo(progressoAtual())
    expect(perfil.nivel).toBe('dificil')
    expect(perfil.mascoteAtiva).toBe('tartaruga')
    expect(perfil.estrelas.memoria.total).toBe(0)
    expect(resumoDoProgresso(progressoAtual())).toEqual({ pecas: 0, projetos: 0 })
    expect(estrelas.totalAtual()).toBe(0)
    await Promise.resolve()
    expect(gaveta.get('estrelas:total')).toBe('0')
    expect(JSON.parse(gaveta.get('progresso')).perfis.principal.estrelas.memoria.total).toBe(0)
  })
})
