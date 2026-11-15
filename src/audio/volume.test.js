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

// O módulo guarda os volumes em memória: cada teste começa com um módulo novo
async function modulo() {
  vi.resetModules()
  return import('./volume')
}

beforeEach(() => {
  guardado.clear()
})

describe('volumes da música e dos efeitos', () => {
  it('começam os dois no volume normal (100%) quando nada foi guardado', async () => {
    const { carregarVolumes } = await modulo()
    expect(await carregarVolumes()).toEqual({ musica: 1, efeitos: 1 })
  })

  it('cada um muda sozinho e fica guardado no telemóvel com a sua chave', async () => {
    const { mudarVolume, volumeDe } = await modulo()
    mudarVolume('musica', 0.4)
    expect(volumeDe('musica')).toBe(0.4)
    expect(volumeDe('efeitos')).toBe(1)
    mudarVolume('efeitos', 0.7)
    await Promise.resolve()
    expect(guardado.get('definicoes:volume:musica')).toBe('0.4')
    expect(guardado.get('definicoes:volume:efeitos')).toBe('0.7')
  })

  it('ao abrir a app, lê os volumes guardados', async () => {
    guardado.set('definicoes:volume:musica', '0.3')
    guardado.set('definicoes:volume:efeitos', '0.6')
    const { carregarVolumes, volumeDe } = await modulo()
    await carregarVolumes()
    expect(volumeDe('musica')).toBe(0.3)
    expect(volumeDe('efeitos')).toBe(0.6)
  })

  it('avisa quem está inscrito, dizendo qual dos volumes mudou', async () => {
    const { mudarVolume, inscreverVolume } = await modulo()
    const avisos = []
    const sair = inscreverVolume((tipo) => avisos.push(tipo))
    mudarVolume('efeitos', 0.5)
    mudarVolume('musica', 0.5)
    sair()
    mudarVolume('musica', 0.2)
    expect(avisos).toEqual(['efeitos', 'musica'])
  })

  it('nunca fica abaixo do mínimo nem acima do máximo', async () => {
    const { mudarVolume, volumeDe, VOLUME_MINIMO } = await modulo()
    mudarVolume('efeitos', 0)
    expect(volumeDe('efeitos')).toBe(VOLUME_MINIMO)
    mudarVolume('efeitos', 5)
    expect(volumeDe('efeitos')).toBe(1)
  })

  it('um valor estragado no telemóvel volta ao volume normal', async () => {
    guardado.set('definicoes:volume:musica', 'abc')
    const { carregarVolumes } = await modulo()
    expect((await carregarVolumes()).musica).toBe(1)
  })
})
