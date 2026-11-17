import { describe, expect, it } from 'vitest'
import { JOGOS, MASCOTES } from './config'
import {
  comMaiuscula,
  doDa,
  estasPecas,
  nomeDaCor,
  nomeDasPecas,
  oProximo,
  pecasDaCor,
  porExtenso,
  tituloAjuda,
  todasAsPecas,
} from './textos'

const mascote = (id) => MASCOTES.find((m) => m.id === id)
const jogo = (id) => JOGOS.find((j) => j.id === id)

describe('textos das peças', () => {
  it('a cor concorda com o género e o número', () => {
    expect(nomeDaCor('vermelho', 'm', 1)).toBe('vermelho')
    expect(nomeDaCor('vermelho', 'f', 1)).toBe('vermelha')
    expect(nomeDaCor('amarelo', 'f', 3)).toBe('amarelas')
    expect(nomeDaCor('azul', 'm', 2)).toBe('azuis')
    expect(nomeDaCor('laranja', 'f', 2)).toBe('laranja')
    expect(nomeDaCor('roxo', 'm', 1)).toBe('roxo') // cor desconhecida: fica como está
  })

  it('escreve as peças de cada mascote', () => {
    expect(nomeDasPecas(mascote('sapo'), jogo('matematica'), 1)).toBe('1 lego vermelho')
    expect(nomeDasPecas(mascote('panda'), jogo('matematica'), 2)).toBe('2 sementes vermelhas')
    expect(nomeDasPecas(mascote('coruja'), jogo('portugues'), 1)).toBe('1 livro azul')
    expect(nomeDasPecas(mascote('tartaruga'), jogo('horas'), 1)).toBe('1 peça amarela')
    expect(pecasDaCor(mascote('tartaruga'), jogo('memoria'))).toBe('peças verdes')
  })

  it('frases da reserva e da próxima peça, no masculino e no feminino', () => {
    expect(todasAsPecas(mascote('sapo'), jogo('horas'))).toBe('todos os legos amarelos')
    expect(todasAsPecas(mascote('panda'), jogo('horas'))).toBe('todas as sementes amarelas')
    expect(estasPecas(mascote('coruja'), 1)).toBe('este livro')
    expect(estasPecas(mascote('tartaruga'), 1)).toBe('esta peça')
    expect(estasPecas(mascote('sapo'), 2)).toBe('estes 2 legos')
    expect(estasPecas(mascote('panda'), 3)).toBe('estas 3 sementes')
    expect(oProximo(mascote('sapo'))).toBe('o próximo lego')
    expect(oProximo(mascote('panda'))).toBe('a próxima semente')
  })

  it('todas as mascotes têm os textos precisos', () => {
    for (const m of MASCOTES) {
      for (const campo of ['chamada', 'peca', 'pecas', 'generoPeca', 'projeto', 'proximoProjeto']) {
        expect(m[campo], `${m.id}.${campo}`).toBeTruthy()
      }
    }
  })

  it('do / da e maiúscula', () => {
    expect(doDa('o Sapo')).toBe('do Sapo')
    expect(doDa('a Coruja')).toBe('da Coruja')
    expect(doDa('Ana')).toBe('de Ana')
    expect(comMaiuscula('o Panda')).toBe('O Panda')
    expect(comMaiuscula('')).toBe('')
  })
})

describe('porExtenso', () => {
  it('escreve os números de 20 a 99', () => {
    expect(porExtenso(20)).toBe('vinte')
    expect(porExtenso(21)).toBe('vinte e um')
    expect(porExtenso(73)).toBe('setenta e três')
    expect(porExtenso(56)).toBe('cinquenta e seis')
    expect(porExtenso(99)).toBe('noventa e nove')
  })

  it('recusa números fora do intervalo', () => {
    for (const n of [19, 100, 2.5, '50']) expect(() => porExtenso(n)).toThrow(RangeError)
  })
})

describe('tituloAjuda', () => {
  it('"Ajuda" + o artigo + o nome com maiúsculas, para cada mascote', () => {
    expect(tituloAjuda(mascote('sapo'))).toBe('Ajuda o Sapo Construtor')
    expect(tituloAjuda(mascote('panda'))).toBe('Ajuda o Panda Jardineiro')
    expect(tituloAjuda(mascote('coruja'))).toBe('Ajuda a Coruja Sábia')
    expect(tituloAjuda(mascote('tartaruga'))).toBe('Ajuda a Tartaruga Viajante')
  })
})
