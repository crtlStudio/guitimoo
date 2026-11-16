import { describe, expect, it } from 'vitest'
import atividades from '../../data/atividades.json'
import rotinas from '../../data/rotinas.json'
import { aHora, horaDigital, textoDaHora } from './horas'
import {
  NIVEIS,
  ajustarNivel,
  atividadePara,
  baralharPassos,
  chaveDaHora,
  horasDoNivel,
  lembrarRecente,
  opcoesDeHora,
  sortearHora,
  sortearMomento,
  sortearRotina,
} from './sorteio'

describe('horasDoNivel', () => {
  it('cada nível só tem os minutos certos', () => {
    expect(horasDoNivel('horasFaceis').every((h) => h.m === 0)).toBe(true)
    expect(horasDoNivel('horasFaceis').map((h) => h.h % 12).sort()).toEqual([0, 3, 6, 9])
    expect(horasDoNivel('horasTodas').every((h) => h.m === 0)).toBe(true)
    expect(new Set(horasDoNivel('meiasHoras').map((h) => h.m))).toEqual(new Set([0, 30]))
    expect(horasDoNivel('quartos').every((h) => h.m % 15 === 0)).toBe(true)
    expect(horasDoNivel('cincoMinutos').every((h) => h.m % 5 === 0)).toBe(true)
  })

  it('as horas certas cobrem as 12 posições do relógio', () => {
    expect(new Set(horasDoNivel('horasTodas').map((h) => h.h % 12)).size).toBe(12)
  })

  it('todas as horas de todos os níveis têm texto em português', () => {
    for (const nivel of [...NIVEIS['5-6'], ...NIVEIS['7-8']]) {
      for (const hora of horasDoNivel(nivel)) expect(textoDaHora(hora)).toBeTruthy()
    }
  })
})

describe('sortearHora', () => {
  it('não repete as horas recentes enquanto houver outras', () => {
    const recentes = ['9:0', '0:0', '3:0'] // só sobra 18:00 (6:00) nas fáceis
    for (let i = 0; i < 50; i++) {
      expect(chaveDaHora(sortearHora('horasFaceis', recentes))).toBe('6:0')
    }
  })

  it('se já saíram todas, continua a sortear', () => {
    expect(sortearHora('horasFaceis', ['9:0', '0:0', '3:0', '6:0'])).toBeTruthy()
  })
})

describe('lembrarRecente', () => {
  it('põe à frente, sem repetidos, com tamanho máximo', () => {
    expect(lembrarRecente(['a', 'b', 'c'], 'b', 3)).toEqual(['b', 'a', 'c'])
    expect(lembrarRecente(['a', 'b', 'c'], 'd', 3)).toEqual(['d', 'a', 'b'])
  })
})

describe('atividadePara', () => {
  it('escolhe uma atividade que faz sentido à hora', () => {
    for (let i = 0; i < 50; i++) {
      const a = atividadePara({ h: 13, m: 0 }, atividades)
      expect(13 >= a.de && 13 < a.ate).toBe(true)
    }
  })

  it('há sempre atividade para todas as horas do jogo', () => {
    for (let h = 7; h <= 21; h++) {
      expect(atividades.some((a) => h >= a.de && h < a.ate)).toBe(true)
    }
  })

  it('as frases ficam bem escritas', () => {
    const almoco = atividades.find((a) => a.texto === 'vai almoçar')
    expect(`O Panda ${almoco.texto} ${aHora({ h: 13, m: 0 })}!`).toBe(
      'O Panda vai almoçar à uma hora!',
    )
  })
})

describe('opcoesDeHora', () => {
  it('3 opções diferentes, uma delas a certa', () => {
    for (const nivel of NIVEIS['7-8']) {
      for (const certa of horasDoNivel(nivel)) {
        const opcoes = opcoesDeHora(certa, nivel)
        expect(opcoes).toHaveLength(3)
        expect(new Set(opcoes.map(horaDigital)).size).toBe(3)
        expect(opcoes.filter((o) => chaveDaHora(o) === chaveDaHora(certa))).toHaveLength(1)
      }
    }
  })
})

describe('3–4 anos', () => {
  it('sorteia momentos e rotinas sem repetir os recentes', () => {
    const recentes = rotinas.momentos.slice(1).map((m) => m.id)
    expect(sortearMomento(rotinas.momentos, recentes).id).toBe(rotinas.momentos[0].id)
    const recentesR = rotinas.rotinas.slice(0, -1).map((r) => r.id)
    expect(sortearRotina(rotinas.rotinas, recentesR).id).toBe(rotinas.rotinas.at(-1).id)
  })

  it('os passos de uma rotina nunca ficam já pela ordem certa', () => {
    for (let i = 0; i < 100; i++) {
      const passos = baralharPassos(rotinas.rotinas[0].passos)
      expect(passos.map((p) => p.ordem)).not.toEqual([0, 1, 2])
    }
  })

  it('rotinas.json: todas com 3 passos e há momentos de dia e de noite', () => {
    for (const r of rotinas.rotinas) expect(r.passos).toHaveLength(3)
    expect(rotinas.momentos.some((m) => m.momento === 'dia')).toBe(true)
    expect(rotinas.momentos.some((m) => m.momento === 'noite')).toBe(true)
  })
})

describe('ajustarNivel', () => {
  it('sobe ao fim de 3 certas seguidas', () => {
    let p = { nivel: 0, certas: 0, erradas: 0 }
    p = ajustarNivel(p, true, 4)
    p = ajustarNivel(p, true, 4)
    expect(p.nivel).toBe(0)
    p = ajustarNivel(p, true, 4)
    expect(p).toEqual({ nivel: 1, certas: 0, erradas: 0 })
  })

  it('desce ao fim de 2 erros seguidos', () => {
    let p = { nivel: 2, certas: 1, erradas: 0 }
    p = ajustarNivel(p, false, 4)
    expect(p.nivel).toBe(2)
    p = ajustarNivel(p, false, 4)
    expect(p).toEqual({ nivel: 1, certas: 0, erradas: 0 })
  })

  it('um erro no meio recomeça a contagem das certas', () => {
    let p = { nivel: 0, certas: 2, erradas: 0 }
    p = ajustarNivel(p, false, 4)
    p = ajustarNivel(p, true, 4)
    expect(p).toEqual({ nivel: 0, certas: 1, erradas: 0 })
  })

  it('não passa do primeiro nem do último nível', () => {
    expect(ajustarNivel({ nivel: 0, certas: 0, erradas: 1 }, false, 4).nivel).toBe(0)
    expect(ajustarNivel({ nivel: 3, certas: 2, erradas: 0 }, true, 4).nivel).toBe(3)
  })
})
