import { describe, expect, it } from 'vitest'
import {
  aHora,
  anguloDasHoras,
  anguloDoPonto,
  anguloDosMinutos,
  diferencaAngular,
  encaixar,
  horaDigital,
  horaDosMinutos,
  mesmaHoraNoRelogio,
  textoDaHora,
} from './horas'

describe('textoDaHora (português de Portugal)', () => {
  const casos = [
    [{ h: 15, m: 0 }, 'três horas'],
    [{ h: 13, m: 0 }, 'uma hora'],
    [{ h: 1, m: 0 }, 'uma hora'],
    [{ h: 12, m: 0 }, 'meio-dia'],
    [{ h: 0, m: 0 }, 'meia-noite'],
    [{ h: 15, m: 30 }, 'três e meia'],
    [{ h: 12, m: 30 }, 'meio-dia e meia'],
    [{ h: 0, m: 30 }, 'meia-noite e meia'],
    [{ h: 9, m: 15 }, 'nove e um quarto'],
    [{ h: 16, m: 45 }, 'um quarto para as cinco'],
    [{ h: 12, m: 45 }, 'um quarto para a uma'],
    [{ h: 11, m: 45 }, 'um quarto para o meio-dia'],
    [{ h: 23, m: 45 }, 'um quarto para a meia-noite'],
    [{ h: 8, m: 5 }, 'oito e cinco'],
    [{ h: 8, m: 25 }, 'oito e vinte e cinco'],
    [{ h: 8, m: 35 }, 'vinte e cinco para as nove'],
    [{ h: 8, m: 40 }, 'vinte para as nove'],
    [{ h: 8, m: 50 }, 'dez para as nove'],
    [{ h: 8, m: 55 }, 'cinco para as nove'],
    [{ h: 14, m: 0 }, 'duas horas'],
  ]
  for (const [hora, texto] of casos) {
    it(`${hora.h}:${String(hora.m).padStart(2, '0')} → ${texto}`, () => {
      expect(textoDaHora(hora)).toBe(texto)
    })
  }

  it('recusa minutos que não são de 5 em 5', () => {
    expect(() => textoDaHora({ h: 3, m: 7 })).toThrow()
  })
})

describe('aHora (com a palavra certa antes)', () => {
  it('usa às, à, ao e a conforme a hora', () => {
    expect(aHora({ h: 15, m: 30 })).toBe('às três e meia')
    expect(aHora({ h: 13, m: 0 })).toBe('à uma hora')
    expect(aHora({ h: 13, m: 15 })).toBe('à uma e um quarto')
    expect(aHora({ h: 12, m: 0 })).toBe('ao meio-dia')
    expect(aHora({ h: 0, m: 0 })).toBe('à meia-noite')
    expect(aHora({ h: 16, m: 45 })).toBe('a um quarto para as cinco')
  })
})

describe('horaDigital', () => {
  it('mostra a hora num relógio de 12 horas', () => {
    expect(horaDigital({ h: 16, m: 5 })).toBe('4:05')
    expect(horaDigital({ h: 12, m: 30 })).toBe('12:30')
    expect(horaDigital({ h: 0, m: 0 })).toBe('12:00')
  })
})

describe('mesmaHoraNoRelogio', () => {
  it('3:00 e 15:00 são iguais no relógio de ponteiros', () => {
    expect(mesmaHoraNoRelogio({ h: 3, m: 0 }, { h: 15, m: 0 })).toBe(true)
    expect(mesmaHoraNoRelogio({ h: 3, m: 0 }, { h: 3, m: 30 })).toBe(false)
  })
})

describe('ângulos', () => {
  it('ponteiros nas posições conhecidas', () => {
    expect(anguloDosMinutos(15)).toBe(90)
    expect(anguloDosMinutos(30)).toBe(180)
    expect(anguloDasHoras(3, 0)).toBe(90)
    expect(anguloDasHoras(15, 30)).toBe(105) // entre o 3 e o 4
    expect(anguloDasHoras(12, 0)).toBe(0)
  })

  it('ângulo do dedo visto do centro (0° em cima, a crescer para a direita)', () => {
    expect(anguloDoPonto(100, 0, 100, 100)).toBe(0) // em cima → 12
    expect(anguloDoPonto(200, 100, 100, 100)).toBe(90) // à direita → 3
    expect(anguloDoPonto(100, 200, 100, 100)).toBe(180) // em baixo → 6
    expect(anguloDoPonto(0, 100, 100, 100)).toBe(270) // à esquerda → 9
  })

  it('diferença angular pelo caminho mais curto', () => {
    expect(diferencaAngular(350, 10)).toBe(20)
    expect(diferencaAngular(10, 350)).toBe(-20)
    expect(diferencaAngular(720, 30)).toBe(30) // ângulos acumulados também funcionam
  })

  it('total de minutos rodados → hora no relógio', () => {
    expect(horaDosMinutos(0)).toEqual({ h: 0, m: 0 })
    expect(horaDosMinutos(90)).toEqual({ h: 1, m: 30 })
    expect(horaDosMinutos(-15)).toEqual({ h: 11, m: 45 })
    expect(horaDosMinutos(780)).toEqual({ h: 1, m: 0 })
  })

  it('encaixa no múltiplo mais próximo', () => {
    expect(encaixar(37, 15)).toBe(30)
    expect(encaixar(38, 15)).toBe(45)
    expect(encaixar(-7, 5)).toBe(-5)
  })
})
