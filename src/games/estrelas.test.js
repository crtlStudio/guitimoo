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
  ESTRELAS_POR_CERTA,
  ESTRELAS_POR_JOGO,
  inscrever,
  lerTotal,
  maximoDoJogo,
  novoPlacar,
  registarCerta,
  registarErro,
  somarEstrelas,
  totalAtual,
  _recomecarParaTestes,
} = await import('./estrelas')

/** Joga um jogo: 'c' = certa à primeira, 'e' = erra (e depois acerta a mesma). */
function jogar(perguntas, jogadas) {
  let placar = novoPlacar(perguntas)
  const ganhos = []
  for (const j of jogadas) {
    if (j === 'e') placar = registarErro(placar)
    else {
      const r = registarCerta(placar)
      placar = r.placar
      ganhos.push(r)
    }
  }
  return { placar, ganhos }
}

describe('placar de um jogo', () => {
  it('5 por certa e 15 por jogo ganho', () => {
    expect(ESTRELAS_POR_CERTA).toBe(5)
    expect(ESTRELAS_POR_JOGO).toBe(15)
  })

  it('o exemplo: 3 perguntas todas certas = 30 estrelas', () => {
    const { placar, ganhos } = jogar(3, ['c', 'c', 'c'])
    expect(placar.estrelas).toBe(30)
    expect(placar.certas).toBe(3)
    expect(ganhos.map((g) => g.ganhas)).toEqual([5, 5, 5])
    expect(ganhos.map((g) => g.bonus)).toEqual([0, 0, 15])
    expect(ganhos.at(-1).acabou).toBe(true)
    expect(maximoDoJogo(3)).toBe(30)
  })

  it('errar antes de acertar: essa pergunta não dá estrelas, mas o jogo continua', () => {
    // 1.ª certa (5), 2.ª com um erro (0), 3.ª certa (5) + jogo ganho (15) = 25
    const { placar, ganhos } = jogar(3, ['c', 'e', 'c', 'c'])
    expect(ganhos.map((g) => g.ganhas)).toEqual([5, 0, 5])
    expect(placar.estrelas).toBe(25)
    expect(placar.certas).toBe(2)
  })

  it('vários erros na mesma pergunta contam como um só', () => {
    const { placar } = jogar(2, ['e', 'e', 'e', 'c', 'c'])
    expect(placar.estrelas).toBe(0 + 5 + 15)
  })

  it('quem erra em todas ganha na mesma os 15 de acabar o jogo', () => {
    const { placar } = jogar(3, ['e', 'c', 'e', 'c', 'e', 'c'])
    expect(placar.estrelas).toBe(15)
  })

  it('depois de acabar, mais respostas não contam', () => {
    let { placar } = jogar(1, ['c'])
    const r = registarCerta(placar)
    expect(r.ganhas + r.bonus).toBe(0)
    placar = registarErro(r.placar)
    expect(placar.estrelas).toBe(20)
  })

  it('não altera o placar que recebe', () => {
    const p = novoPlacar(3)
    registarCerta(p)
    registarErro(p)
    expect(p).toEqual(novoPlacar(3))
  })
})

describe('total guardado no telemóvel', () => {
  beforeEach(() => {
    gaveta.clear()
    _recomecarParaTestes()
  })

  it('começa em 0 e vai somando', async () => {
    expect(await lerTotal()).toBe(0)
    somarEstrelas(5)
    somarEstrelas(15)
    expect(totalAtual()).toBe(20)
    await Promise.resolve()
    expect(gaveta.get('estrelas:total')).toBe('20')
  })

  it('continua depois de fechar a app', async () => {
    gaveta.set('estrelas:total', '120')
    expect(await lerTotal()).toBe(120)
    somarEstrelas(30)
    await Promise.resolve()
    expect(gaveta.get('estrelas:total')).toBe('150')
  })

  it('estrelas ganhas antes de acabar de ler não se perdem', async () => {
    gaveta.set('estrelas:total', '100')
    somarEstrelas(5) // ainda não leu o que estava guardado
    await vi.waitFor(() => expect(gaveta.get('estrelas:total')).toBe('105'))
    expect(totalAtual()).toBe(105)
  })

  it('ignora valores estragados', async () => {
    gaveta.set('estrelas:total', 'abc')
    expect(await lerTotal()).toBe(0)
  })

  it('avisa quem está inscrito quando o total muda', async () => {
    await lerTotal()
    const avisos = vi.fn()
    const sair = inscrever(avisos)
    somarEstrelas(5)
    expect(avisos).toHaveBeenCalledTimes(1)
    sair()
    somarEstrelas(5)
    expect(avisos).toHaveBeenCalledTimes(1)
  })
})
