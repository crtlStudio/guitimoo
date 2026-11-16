import { describe, expect, it } from 'vitest'
import {
  contasPossiveis,
  criarConta,
  HISTORICO,
  NIVEIS,
  opcoesDeResposta,
  partesDaConta,
  coresTrocadas,
  pratoCerto,
  respostaCerta,
  sortearConta,
} from './contas'

/** Uma "sorte" fixa (sempre os mesmos números), para os testes darem sempre o mesmo. */
function sorteFixa(semente = 1) {
  let s = semente
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Todos os níveis de todas as idades: [[escalao, nivel], ...] */
const TODOS = Object.entries(NIVEIS).flatMap(([e, niveis]) => niveis.map((_, n) => [e, n]))

describe('criarConta', () => {
  it('soma: pôr 5 + 2 no prato esquerdo e escolher 7', () => {
    expect(criarConta('soma', 5, 2)).toMatchObject({
      texto: '5 + 2 = ?',
      esquerdaInicial: 0,
      alvoEsquerda: 7,
      numeroDireita: null,
      resposta: 7,
    })
  })

  it('subtração: o prato já tem 9, tira 4 e escolhe 5', () => {
    expect(criarConta('subtracao', 9, 4)).toMatchObject({
      texto: '9 − 4 = ?',
      esquerdaInicial: 9,
      alvoEsquerda: 5,
      resposta: 5,
    })
  })

  it('número que falta: 4 + ? = 9 — o prato tem 4, o número 9 está à direita, escolhe 5', () => {
    expect(criarConta('falta', 4, 9)).toMatchObject({
      texto: '4 + ? = 9',
      esquerdaInicial: 4,
      alvoEsquerda: 9,
      numeroDireita: 9,
      resposta: 5,
    })
  })

  it('contar (3–4): o número já está à direita; sem cartão e sem escolher número', () => {
    expect(criarConta('contar', 3)).toMatchObject({
      texto: null,
      alvoEsquerda: 3,
      numeroDireita: 3,
      resposta: null,
    })
  })
})

describe('contasPossiveis: as regras de cada idade', () => {
  it('todos os níveis têm contas', () => {
    for (const [e, n] of TODOS) expect(contasPossiveis(e, n).length).toBeGreaterThan(0)
  })

  it('nenhum número passa do máximo do nível, e nenhum é menor do que 1', () => {
    for (const [e, n] of TODOS) {
      const { maximo } = NIVEIS[e][n]
      for (const c of contasPossiveis(e, n)) {
        const numeros = [c.a, c.b, c.alvoEsquerda, c.numeroDireita, c.resposta, c.esquerdaInicial || 1].filter(
          (x) => x !== null,
        )
        for (const x of numeros) {
          expect(x).toBeGreaterThanOrEqual(1)
          expect(x).toBeLessThanOrEqual(maximo)
        }
      }
    }
  })

  it('3–4: só contar, até 5', () => {
    const ultimo = NIVEIS['3-4'].length - 1
    const contas = contasPossiveis('3-4', ultimo)
    expect(new Set(contas.map((c) => c.tipo))).toEqual(new Set(['contar']))
    expect(Math.max(...contas.map((c) => c.a))).toBe(5)
  })

  it('5–6: só somas, até 10 no nível mais difícil', () => {
    const ultimo = NIVEIS['5-6'].length - 1
    const contas = contasPossiveis('5-6', ultimo)
    expect(new Set(contas.map((c) => c.tipo))).toEqual(new Set(['soma']))
    expect(Math.max(...contas.map((c) => c.resposta))).toBe(10)
  })

  it('7–8: somas, subtrações e "número que falta", até 20', () => {
    const tipos = new Set(NIVEIS['7-8'].flatMap((_, n) => contasPossiveis('7-8', n).map((c) => c.tipo)))
    expect(tipos).toEqual(new Set(['soma', 'subtracao', 'falta']))
  })

  it('o prato esquerdo pode ficar certo: o alvo bate com a conta', () => {
    for (const [e, n] of TODOS) {
      for (const c of contasPossiveis(e, n)) {
        if (c.tipo === 'soma') expect(c.alvoEsquerda).toBe(c.a + c.b)
        if (c.tipo === 'subtracao') expect(c.alvoEsquerda).toBe(c.a - c.b)
        if (c.tipo === 'falta') expect(c.resposta).toBe(c.b - c.a)
      }
    }
  })
})

describe('sortearConta: sem repetir as últimas', () => {
  it('nunca sai uma conta que está no histórico (quando há outras)', () => {
    const aleatorio = sorteFixa(3)
    let historico = []
    for (let i = 0; i < 40; i++) {
      const antes = historico
      const r = sortearConta('5-6', 2, historico, aleatorio)
      expect(antes).not.toContain(r.conta.chave)
      historico = r.historico
    }
  })

  it('o histórico guarda só as últimas', () => {
    let historico = []
    for (let i = 0; i < 20; i++) historico = sortearConta('7-8', 2, historico, sorteFixa(i + 1)).historico
    expect(historico.length).toBe(HISTORICO)
  })

  it('com poucas contas (3–4, nível 0: 1, 2 ou 3), nunca sai a mesma duas vezes seguidas', () => {
    const aleatorio = sorteFixa(9)
    let historico = []
    let anterior = null
    for (let i = 0; i < 30; i++) {
      const r = sortearConta('3-4', 0, historico, aleatorio)
      expect(r.conta.chave).not.toBe(anterior)
      anterior = r.conta.chave
      historico = r.historico
    }
  })
})

describe('opcoesDeResposta', () => {
  it('tem o número certo, sem repetidos, e a quantidade pedida', () => {
    for (let resposta = 1; resposta <= 20; resposta++) {
      const opcoes = opcoesDeResposta(resposta, 4, sorteFixa(resposta))
      expect(opcoes).toHaveLength(4)
      expect(opcoes).toContain(resposta)
      expect(new Set(opcoes).size).toBe(4)
      for (const n of opcoes) expect(n).toBeGreaterThanOrEqual(1)
    }
  })

  it('os errados ficam perto do certo (no máximo 4 de distância)', () => {
    const opcoes = opcoesDeResposta(7, 3, sorteFixa(5))
    for (const n of opcoes) expect(Math.abs(n - 7)).toBeLessThanOrEqual(4)
  })

  it('a certa nem sempre está no mesmo sítio', () => {
    const lugares = new Set()
    for (let i = 1; i <= 20; i++) lugares.add(opcoesDeResposta(7, 3, sorteFixa(i)).indexOf(7))
    expect(lugares.size).toBeGreaterThan(1)
  })
})

describe('as duas validações', () => {
  const conta = criarConta('soma', 5, 2)

  it('"Já está!": o prato esquerdo tem de ter 7 cubinhos', () => {
    expect(pratoCerto(conta, 7)).toBe(true)
    expect(pratoCerto(conta, 6)).toBe(false)
  })

  it('na soma (5 + 2), cada número com a sua cor: 5 azuis e 2 verdes', () => {
    expect(pratoCerto(conta, 7, { azul: 5, verde: 2 })).toBe(true)
    expect(pratoCerto(conta, 7, { azul: 4, verde: 3 })).toBe(false) // cores trocadas
    expect(pratoCerto(conta, 7, { azul: 5, laranja: 2 })).toBe(false) // outra cor
    expect(coresTrocadas(conta, 7, { azul: 4, verde: 3 })).toBe(true)
    expect(coresTrocadas(conta, 7, { azul: 5, verde: 2 })).toBe(false)
    expect(coresTrocadas(conta, 6, { azul: 4, verde: 2 })).toBe(false) // aqui o que falha é a quantidade
  })

  it('na subtração e no "número que falta", a cor não conta', () => {
    const tirar = criarConta('subtracao', 9, 4)
    expect(pratoCerto(tirar, tirar.alvoEsquerda, { azul: tirar.alvoEsquerda })).toBe(true)
    const falta = criarConta('falta', 4, 9)
    expect(pratoCerto(falta, falta.alvoEsquerda, { azul: 4, laranja: 5 })).toBe(true)
    expect(coresTrocadas(falta, falta.alvoEsquerda, { verde: 9 })).toBe(false)
  })

  it('escolher o número: só o 7 está certo', () => {
    expect(respostaCerta(conta, 7)).toBe(true)
    expect(respostaCerta(conta, 8)).toBe(false)
  })
})

describe('partesDaConta (o cartão com cores)', () => {
  const textos = (partes) => partes.map((p) => p.texto).join(' ')

  it('soma: 5 azul + 2 verde = ? (e depois a resposta)', () => {
    const partes = partesDaConta(criarConta('soma', 5, 2))
    expect(textos(partes)).toBe('5 + 2 = ?')
    expect(partes.map((p) => p.cor)).toEqual(['azul', null, 'verde', null, 'resposta'])
    expect(textos(partesDaConta(criarConta('soma', 5, 2), true))).toBe('5 + 2 = 7')
  })

  it('subtração e número que falta', () => {
    expect(textos(partesDaConta(criarConta('subtracao', 9, 4)))).toBe('9 − 4 = ?')
    expect(textos(partesDaConta(criarConta('falta', 4, 9), true))).toBe('4 + 5 = 9')
  })

  it('contar (3–4) não tem cartão', () => {
    expect(partesDaConta(criarConta('contar', 3))).toEqual([])
  })
})
