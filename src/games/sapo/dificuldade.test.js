import { describe, expect, it } from 'vitest'
import { NIVEIS } from './contas'
import { ajustarNivel, SOBE_COM } from './dificuldade'

const inicio = { nivel: 0, certasSeguidas: 0, historico: ['soma:1:1'] }

describe('ajustarNivel', () => {
  it(`sobe um nível depois de ${SOBE_COM} certas seguidas à primeira`, () => {
    let p = inicio
    for (let i = 0; i < SOBE_COM; i++) p = ajustarNivel('5-6', p, true)
    expect(p.nivel).toBe(1)
    expect(p.certasSeguidas).toBe(0)
  })

  it('com algum erro, desce um nível e as seguidas voltam a 0', () => {
    const p = ajustarNivel('5-6', { nivel: 2, certasSeguidas: 2, historico: [] }, false)
    expect(p).toMatchObject({ nivel: 1, certasSeguidas: 0 })
  })

  it('nunca desce abaixo do nível mais fácil nem sobe acima do mais difícil', () => {
    expect(ajustarNivel('7-8', inicio, false).nivel).toBe(0)
    const ultimo = NIVEIS['7-8'].length - 1
    let p = { nivel: ultimo, certasSeguidas: 0, historico: [] }
    for (let i = 0; i < 10; i++) p = ajustarNivel('7-8', p, true)
    expect(p.nivel).toBe(ultimo)
  })

  it('mantém o histórico e não altera o progresso que recebeu', () => {
    const copia = structuredClone(inicio)
    const p = ajustarNivel('5-6', inicio, true)
    expect(p.historico).toEqual(inicio.historico)
    expect(inicio).toEqual(copia)
  })
})
