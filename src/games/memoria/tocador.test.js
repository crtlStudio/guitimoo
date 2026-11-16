import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------
// Howler "a fingir": não faz barulho, mas imita o que interessa.
// Cada som "dura" 1 segundo e depois avisa 'end'; stop() avisa 'stop'.
// ---------------------------------------------------------------
const registo = [] // o que aconteceu, por ordem (ex.: 'toca cao', 'acaba cao')

vi.mock('howler', () => {
  let contador = 0
  class Howl {
    constructor({ src }) {
      this.nome = src[0].match(/([a-z]+)[^/]*\.mp3$/)[1]
      this.ouvintes = []
    }
    // A 'sapo' finge estar ainda a carregar na 1.ª vez (como no browser)
    state() {
      return this.nome === 'sapo' && !this.jaTocou ? 'loading' : 'loaded'
    }
    play() {
      this.jaTocou = true
      const numero = ++contador
      registo.push(`toca ${this.nome}`)
      this.aTocar = true
      // O 'chuva' finge ser um som comprido (5 s); os outros duram 1 s
      this.temporizador = setTimeout(() => {
        registo.push(`acaba ${this.nome}`)
        this.aTocar = false
        this.avisar('end')
      }, this.nome === 'chuva' ? 5000 : 1000)
      setTimeout(() => this.avisar('play'), 0) // o Howler avisa 'play' logo a seguir
      return numero
    }
    stop() {
      // Como o Howler: um stop() durante o carregamento fica em fila e
      // acontece logo a seguir, parando também o som novo
      if (this.state() === 'loading') {
        setTimeout(() => this.avisar('stop'), 10)
        return
      }
      clearTimeout(this.temporizador)
      if (this.aTocar) registo.push(`corta ${this.nome}`)
      this.aTocar = false
      this.avisar('stop')
    }
    playing() {
      return false
    }
    volume() {
      return 0.9
    }
    fade() {
      registo.push(`fade ${this.nome}`)
    }
    once(evento, funcao) {
      this.ouvintes.push({ evento, funcao })
    }
    off(evento, funcao) {
      this.ouvintes = this.ouvintes.filter((o) => !(o.evento === evento && o.funcao === funcao))
    }
    avisar(evento) {
      const chamar = this.ouvintes.filter((o) => o.evento === evento)
      this.ouvintes = this.ouvintes.filter((o) => o.evento !== evento)
      chamar.forEach((o) => o.funcao())
    }
  }
  return { Howl }
})

const { tocarSom, tocarSequencia, pararSons, PAUSA_ENTRE_SONS, MAXIMO_NUMA_SEQUENCIA } = await import('./tocador')

beforeEach(() => {
  pararSons() // cala o que um teste anterior tenha deixado a tocar
  registo.length = 0
  vi.useFakeTimers() // o tempo só anda quando o teste mandar
})
afterEach(() => vi.useRealTimers())

describe('tocarSom', () => {
  it('a promessa só fica cumprida quando o som acaba', async () => {
    let acabou = false
    tocarSom('cao').then(() => (acabou = true))

    await vi.advanceTimersByTimeAsync(900)
    expect(acabou).toBe(false) // ainda está a tocar

    await vi.advanceTimersByTimeAsync(200)
    expect(acabou).toBe(true)
  })

  it('na 1.ª vez (som ainda a carregar) também espera que o som acabe', async () => {
    let acabou = false
    tocarSom('sapo').then(() => (acabou = true))
    await vi.advanceTimersByTimeAsync(500)
    expect(acabou).toBe(false)
    await vi.advanceTimersByTimeAsync(600)
    expect(acabou).toBe(true)
  })

  it('dá erro com um som que não existe na lista', () => {
    expect(() => tocarSom('dinossauro')).toThrow('Som desconhecido')
  })
})

describe('tocarSequencia', () => {
  it('toca um som de cada vez, por ordem, com pausa entre eles', async () => {
    const acesos = []
    const { terminou } = tocarSequencia(['cao', 'gato', 'mar'], {
      aoTocar: (i, id) => acesos.push(`acende ${i} ${id}`),
      aoCalar: (i) => acesos.push(`apaga ${i}`),
    })

    await vi.advanceTimersByTimeAsync(3 * 1000 + 2 * PAUSA_ENTRE_SONS)
    expect(await terminou).toBe(true)

    // Nunca começa um som antes de o anterior acabar
    expect(registo).toEqual(['toca cao', 'acaba cao', 'toca gato', 'acaba gato', 'toca mar', 'acaba mar'])
    expect(acesos).toEqual(['acende 0 cao', 'apaga 0', 'acende 1 gato', 'apaga 1', 'acende 2 mar', 'apaga 2'])
  })

  it('espera a pausa antes do som seguinte', async () => {
    tocarSequencia(['cao', 'gato'])
    await vi.advanceTimersByTimeAsync(1000 + PAUSA_ENTRE_SONS - 50)
    expect(registo).toEqual(['toca cao', 'acaba cao']) // ainda na pausa
    await vi.advanceTimersByTimeAsync(100)
    expect(registo.at(-1)).toBe('toca gato')
  })

  it('numa sequência, um som comprido é cortado (com fade) ao fim do máximo', async () => {
    const { terminou } = tocarSequencia(['chuva', 'cao'])
    await vi.advanceTimersByTimeAsync(MAXIMO_NUMA_SEQUENCIA + 50)
    expect(registo).toEqual(['toca chuva', 'fade chuva', 'corta chuva'])
    await vi.advanceTimersByTimeAsync(PAUSA_ENTRE_SONS + 1100)
    expect(await terminou).toBe(true)
    expect(registo.slice(3)).toEqual(['toca cao', 'acaba cao'])
  })

  it('sozinho (sem máximo), o som comprido ouve-se inteiro', async () => {
    let acabou = false
    tocarSom('chuva').then(() => (acabou = true))
    await vi.advanceTimersByTimeAsync(4900)
    expect(acabou).toBe(false)
    await vi.advanceTimersByTimeAsync(200)
    expect(acabou).toBe(true)
  })

  it('parar() interrompe a meio: o som cala-se e os seguintes não tocam', async () => {
    const { terminou, parar } = tocarSequencia(['cao', 'gato', 'mar'])
    await vi.advanceTimersByTimeAsync(1000 + PAUSA_ENTRE_SONS + 300) // a meio do gato
    parar()
    await vi.advanceTimersByTimeAsync(10000)

    expect(await terminou).toBe(false)
    expect(registo).toEqual(['toca cao', 'acaba cao', 'toca gato', 'corta gato'])
  })
})
