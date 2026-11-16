import { afterEach, describe, expect, it } from 'vitest'
import { ESTRELAS_POR_PECA, JOGOS, PECAS_POR_COR } from './config'
import {
  VERSAO,
  adicionarEstrelas,
  corEstaCompleta,
  criarProgresso,
  dataDeHoje,
  escolherMascote,
  escalaoDoNivel,
  escolherNivel,
  guardarNaReserva,
  limparProgresso,
  nivelDoEscalao,
  nivelDosEscaloesAntigos,
  pecasEmFalta,
  perfilAtivo,
  projetoAtual,
  projetoEstaCompleto,
  projetosAcabados,
  repararProgresso,
  somarPremios,
} from './progresso'

const HOJE = '2026-11-16'
const ATIVOS = ['matematica', 'portugues', 'memoria', 'horas']

/** Progresso com a mascote já escolhida. */
const comMascote = (id = 'sapo') => escolherMascote(criarProgresso('medio'), id)

/** Dá `n` peças de um jogo (n × 10 estrelas). */
const darPecas = (progresso, jogoId, n) =>
  adicionarEstrelas(progresso, jogoId, n * ESTRELAS_POR_PECA, HOJE)

/** Põe a cor completa (5 peças) em todos os jogos ativos menos `menos`. */
function quaseCompleto(progresso, menos) {
  let p = progresso
  for (const id of ATIVOS) if (id !== menos) p = darPecas(p, id, PECAS_POR_COR).progresso
  return p
}

// Os testes do Detetive ligam-no; no fim volta a ficar desligado
afterEach(() => {
  JOGOS.find((j) => j.id === 'detetive').ativo = false
})

describe('criarProgresso', () => {
  it('começa vazio, com versão, perfil principal e sem mascote', () => {
    const p = criarProgresso()
    expect(p.versao).toBe(VERSAO)
    expect(p.perfilAtivo).toBe('principal')
    const perfil = perfilAtivo(p)
    expect(perfil.nivel).toBeNull()
    expect(perfil.mascoteAtiva).toBeNull()
    expect(perfil.estrelas.matematica).toEqual({ total: 0, resto: 0 })
    expect(perfil.mascotes.sapo.projetos).toHaveLength(1)
    expect(perfil.mascotes.sapo.reserva.portugues).toBe(0)
  })

  it('aceita o nível inicial (e ignora um inválido)', () => {
    expect(perfilAtivo(criarProgresso('dificil')).nivel).toBe('dificil')
    expect(perfilAtivo(criarProgresso('5-6')).nivel).toBeNull()
  })
})

describe('escolher nível e mascote', () => {
  it('escolhe o nível sem mudar o progresso original', () => {
    const antes = criarProgresso()
    const depois = escolherNivel(antes, 'facil')
    expect(perfilAtivo(depois).nivel).toBe('facil')
    expect(perfilAtivo(antes).nivel).toBeNull()
  })

  it('ids inválidos não mudam nada', () => {
    const p = comMascote('panda')
    expect(escolherNivel(p, 'super')).toBe(p)
    expect(escolherMascote(p, 'leao')).toBe(p)
    expect(escolherMascote(p, null)).toBe(p)
  })

  it('trocar de mascote guarda o progresso de cada uma', () => {
    let p = darPecas(comMascote('sapo'), 'matematica', 2).progresso
    p = escolherMascote(p, 'coruja')
    p = darPecas(p, 'portugues', 1).progresso
    p = escolherMascote(p, 'sapo')
    expect(projetoAtual(p).pecas.matematica).toBe(2)
    expect(projetoAtual(p).pecas.portugues).toBe(0)
    expect(projetoAtual(p, 'coruja').pecas.portugues).toBe(1)
  })
})

describe('níveis antigos', () => {
  it('converte cada faixa etária', () => {
    expect(nivelDoEscalao('3-4')).toBe('facil')
    expect(nivelDoEscalao('5-6')).toBe('medio')
    expect(nivelDoEscalao('7-8')).toBe('dificil')
    expect(nivelDoEscalao('9-10')).toBeNull()
  })

  it('e ao contrário: do nível para a faixa etária que os jogos usam', () => {
    expect(escalaoDoNivel('facil')).toBe('3-4')
    expect(escalaoDoNivel('medio')).toBe('5-6')
    expect(escalaoDoNivel('dificil')).toBe('7-8')
    expect(escalaoDoNivel(null)).toBeNull()
  })

  it('escolhe o que aparece mais vezes; no empate, o mais fácil', () => {
    expect(nivelDosEscaloesAntigos(['5-6', '7-8', '5-6', null])).toBe('medio')
    expect(nivelDosEscaloesAntigos(['7-8', '3-4'])).toBe('facil')
    expect(nivelDosEscaloesAntigos(['7-8', null, 'lixo'])).toBe('dificil')
    expect(nivelDosEscaloesAntigos([null, undefined])).toBeNull()
  })
})

describe('adicionarEstrelas', () => {
  it('cada 10 estrelas dão 1 peça; o resto fica guardado', () => {
    const r1 = adicionarEstrelas(comMascote(), 'matematica', 25, HOJE)
    expect(r1.pecasGanhas).toBe(2)
    expect(perfilAtivo(r1.progresso).estrelas.matematica).toEqual({ total: 25, resto: 5 })

    const r2 = adicionarEstrelas(r1.progresso, 'matematica', 5, HOJE)
    expect(r2.pecasGanhas).toBe(1)
    expect(perfilAtivo(r2.progresso).estrelas.matematica).toEqual({ total: 30, resto: 0 })
    expect(projetoAtual(r2.progresso).pecas.matematica).toBe(3)
  })

  it('não muda o progresso que recebe', () => {
    const antes = comMascote()
    adicionarEstrelas(antes, 'matematica', 30, HOJE)
    expect(perfilAtivo(antes).estrelas.matematica.total).toBe(0)
    expect(projetoAtual(antes).pecas.matematica).toBe(0)
  })

  it('o resto é do jogo: continua a contar depois de trocar de mascote', () => {
    let p = adicionarEstrelas(comMascote('sapo'), 'memoria', 7, HOJE).progresso
    p = escolherMascote(p, 'panda')
    const r = adicionarEstrelas(p, 'memoria', 3, HOJE)
    expect(r.pecasGanhas).toBe(1)
    expect(projetoAtual(r.progresso, 'panda').pecas.memoria).toBe(1)
    expect(projetoAtual(r.progresso, 'sapo').pecas.memoria).toBe(0)
  })

  it('cor completa: as estrelas contam, as peças a mais vêm como extra', () => {
    const r = darPecas(comMascote(), 'horas', PECAS_POR_COR + 2)
    expect(r.pecasGanhas).toBe(PECAS_POR_COR)
    expect(r.pecasExtra).toBe(2)
    expect(r.corCompleta).toBe(true)
    expect(projetoAtual(r.progresso).pecas.horas).toBe(PECAS_POR_COR)
    expect(perfilAtivo(r.progresso).estrelas.horas.total).toBe((PECAS_POR_COR + 2) * ESTRELAS_POR_PECA)
    // as extra não vão sozinhas para a reserva: é a criança que decide
    expect(perfilAtivo(r.progresso).mascotes.sapo.reserva.horas).toBe(0)
    expect(corEstaCompleta(r.progresso, 'horas')).toBe(true)
  })

  it('sem mascote ativa: as estrelas contam, mas não há peças', () => {
    const r = adicionarEstrelas(criarProgresso(), 'portugues', 20, HOJE)
    expect(r.semPecas).toBe('sem-mascote')
    expect(r.pecasGanhas).toBe(0)
    expect(r.pecasExtra).toBe(0)
    expect(perfilAtivo(r.progresso).estrelas.portugues).toEqual({ total: 20, resto: 0 })
  })

  it('jogo inativo: as estrelas contam, mas não há peças', () => {
    const r = adicionarEstrelas(comMascote(), 'detetive', 30, HOJE)
    expect(r.semPecas).toBe('jogo-inativo')
    expect(r.pecasGanhas).toBe(0)
    expect(perfilAtivo(r.progresso).estrelas.detetive.total).toBe(30)
    expect(projetoAtual(r.progresso).pecas.detetive).toBe(0)
  })

  it('jogo desconhecido ou estrelas inválidas não mudam nada', () => {
    const p = comMascote()
    for (const [jogo, n] of [['xadrez', 10], ['matematica', 0], ['matematica', -5], ['matematica', 2.5], ['matematica', '10']]) {
      expect(adicionarEstrelas(p, jogo, n, HOJE).progresso).toBe(p)
    }
  })
})

describe('projetos', () => {
  it('peças em falta: 5 de cada cor ativa no início', () => {
    const { porCor, total } = pecasEmFalta(comMascote())
    expect(Object.keys(porCor)).toEqual(ATIVOS)
    expect(total).toBe(ATIVOS.length * PECAS_POR_COR)
  })

  it('peças em falta descem com cada peça', () => {
    const p = darPecas(comMascote(), 'portugues', 3).progresso
    const { porCor, total } = pecasEmFalta(p)
    expect(porCor.portugues).toBe(2)
    expect(total).toBe(ATIVOS.length * PECAS_POR_COR - 3)
  })

  it('a última peça acaba o projeto, marca a data e começa um novo', () => {
    const p = quaseCompleto(comMascote(), 'memoria')
    const antes = darPecas(p, 'memoria', PECAS_POR_COR - 1)
    expect(antes.projetosAcabados).toBe(0)

    const r = darPecas(antes.progresso, 'memoria', 1)
    expect(r.projetosAcabados).toBe(1)
    const projetos = perfilAtivo(r.progresso).mascotes.sapo.projetos
    expect(projetos).toHaveLength(2)
    expect(projetos[0].completoEm).toBe(HOJE)
    expect(projetoEstaCompleto(projetos[0])).toBe(true)
    expect(projetos[1].completoEm).toBeNull()
    expect(projetosAcabados(r.progresso, 'sapo')).toBe(1)
    expect(pecasEmFalta(r.progresso).total).toBe(ATIVOS.length * PECAS_POR_COR)
  })

  it('a reserva entra sozinha no projeto novo (no máximo 5 por cor)', () => {
    let p = darPecas(comMascote(), 'matematica', PECAS_POR_COR).progresso
    p = guardarNaReserva(p, 'matematica', 7)
    p = guardarNaReserva(p, 'horas', 2) // horas ainda não está completa, mas pode guardar
    p = quaseCompleto(p, 'matematica')

    const novo = projetoAtual(p)
    expect(projetosAcabados(p, 'sapo')).toBe(1)
    expect(novo.pecas.matematica).toBe(PECAS_POR_COR)
    expect(novo.pecas.horas).toBe(2)
    expect(perfilAtivo(p).mascotes.sapo.reserva.matematica).toBe(2)
    expect(perfilAtivo(p).mascotes.sapo.reserva.horas).toBe(0)
  })

  it('se a reserva chegar para um projeto inteiro, acaba-o também', () => {
    let p = comMascote()
    for (const id of ATIVOS) p = guardarNaReserva(p, id, PECAS_POR_COR)
    p = quaseCompleto(p, 'horas')
    const r = darPecas(p, 'horas', PECAS_POR_COR)
    expect(r.projetosAcabados).toBe(2)
    expect(perfilAtivo(r.progresso).mascotes.sapo.projetos).toHaveLength(3)
    expect(pecasEmFalta(r.progresso).total).toBe(ATIVOS.length * PECAS_POR_COR)
  })

  it('a reserva é de cada mascote', () => {
    let p = guardarNaReserva(comMascote('sapo'), 'portugues', 3)
    p = escolherMascote(p, 'coruja')
    expect(perfilAtivo(p).mascotes.coruja.reserva.portugues).toBe(0)
    expect(perfilAtivo(p).mascotes.sapo.reserva.portugues).toBe(3)
  })

  it('guardarNaReserva ignora jogo inativo, sem mascote e quantidades inválidas', () => {
    const p = comMascote()
    expect(guardarNaReserva(p, 'detetive', 1)).toBe(p)
    expect(guardarNaReserva(p, 'matematica', 0)).toBe(p)
    const semMascote = criarProgresso()
    expect(guardarNaReserva(semMascote, 'matematica', 1)).toBe(semMascote)
  })

  it('quando o Detetive fica ativo, um projeto acabado continua acabado', () => {
    const p = darPecas(quaseCompleto(comMascote(), 'horas'), 'horas', PECAS_POR_COR).progresso
    JOGOS.find((j) => j.id === 'detetive').ativo = true

    const [acabado, atual] = perfilAtivo(p).mascotes.sapo.projetos
    expect(projetoEstaCompleto(acabado)).toBe(true)
    // o projeto atual passa a precisar também de 5 peças laranja
    expect(projetoEstaCompleto(atual)).toBe(false)
    expect(pecasEmFalta(p).porCor.detetive).toBe(PECAS_POR_COR)
    expect(pecasEmFalta(p).total).toBe(5 * PECAS_POR_COR)
  })

  it('com o Detetive ativo, as suas estrelas já dão peças', () => {
    JOGOS.find((j) => j.id === 'detetive').ativo = true
    const r = darPecas(comMascote(), 'detetive', 2)
    expect(r.semPecas).toBeNull()
    expect(projetoAtual(r.progresso).pecas.detetive).toBe(2)
  })

  it('sem nenhum jogo ativo, um projeto nunca está completo', () => {
    const ligados = JOGOS.filter((j) => j.ativo)
    ligados.forEach((j) => (j.ativo = false))
    try {
      expect(projetoEstaCompleto(projetoAtual(comMascote()))).toBe(false)
    } finally {
      ligados.forEach((j) => (j.ativo = true))
    }
  })
})

describe('somarPremios', () => {
  it('junta as peças de várias entregas do mesmo jogo', () => {
    const r1 = { pecasGanhas: 1, pecasExtra: 0, projetosAcabados: 0 }
    const r2 = { pecasGanhas: 0, pecasExtra: 2, projetosAcabados: 1 }
    const total = somarPremios(somarPremios(null, 'horas', r1), 'horas', r2)
    expect(total).toEqual({ jogoId: 'horas', pecasGanhas: 1, pecasExtra: 2, projetosAcabados: 1 })
  })
})

describe('limparProgresso', () => {
  it('apaga estrelas, peças e projetos, mas mantém nível e mascote', () => {
    let p = darPecas(quaseCompleto(comMascote('panda'), 'horas'), 'horas', PECAS_POR_COR).progresso
    p = guardarNaReserva(p, 'memoria', 2)
    const limpo = limparProgresso(p)
    const perfil = perfilAtivo(limpo)
    expect(perfil.nivel).toBe('medio')
    expect(perfil.mascoteAtiva).toBe('panda')
    expect(perfil.estrelas.horas).toEqual({ total: 0, resto: 0 })
    expect(perfil.mascotes.panda.projetos).toHaveLength(1)
    expect(perfil.mascotes.panda.reserva.memoria).toBe(0)
    // o original fica igual
    expect(perfilAtivo(p).estrelas.horas.total).toBeGreaterThan(0)
  })

  it('não toca nos outros perfis', () => {
    const p = darPecas(comMascote(), 'matematica', 1).progresso
    p.perfis.ana = structuredClone(p.perfis.principal)
    const limpo = limparProgresso(p)
    expect(limpo.perfis.ana.estrelas.matematica.total).toBe(ESTRELAS_POR_PECA)
  })
})

describe('repararProgresso', () => {
  it('um progresso válido fica igual', () => {
    const p = darPecas(comMascote(), 'portugues', 3).progresso
    expect(repararProgresso(JSON.parse(JSON.stringify(p)))).toEqual(p)
  })

  it('lixo começa do zero', () => {
    for (const lixo of [null, 42, 'ola', [], {}, { perfis: [] }, { perfis: {} }]) {
      expect(repararProgresso(lixo)).toEqual(criarProgresso())
    }
  })

  it('aproveita o que der e corrige o resto', () => {
    const r = repararProgresso({
      versao: 'velha',
      perfilAtivo: 'ninguem',
      perfis: {
        principal: {
          nivel: '5-6',
          mascoteAtiva: 'coruja',
          estrelas: { matematica: { total: 42, resto: 12 }, portugues: { total: -3, resto: 'x' }, xadrez: { total: 9 } },
          mascotes: {
            coruja: { projetos: [{ pecas: { memoria: 9, horas: 2.5 }, completoEm: 7 }], reserva: { horas: 3 } },
            leao: { projetos: [] },
          },
        },
      },
    })
    expect(r.versao).toBe(VERSAO)
    expect(r.perfilAtivo).toBe('principal')
    const perfil = perfilAtivo(r)
    expect(perfil.nivel).toBeNull()
    expect(perfil.mascoteAtiva).toBe('coruja')
    expect(perfil.estrelas.matematica).toEqual({ total: 42, resto: 2 })
    expect(perfil.estrelas.portugues).toEqual({ total: 0, resto: 0 })
    expect(perfil.estrelas.xadrez).toBeUndefined()
    expect(perfil.estrelas.detetive).toEqual({ total: 0, resto: 0 })
    const coruja = perfil.mascotes.coruja
    expect(coruja.projetos[0].pecas.memoria).toBe(PECAS_POR_COR)
    expect(coruja.projetos[0].pecas.horas).toBe(0)
    expect(coruja.projetos[0].completoEm).toBeNull()
    expect(coruja.reserva.horas).toBe(3)
    expect(perfil.mascotes.leao).toBeUndefined()
    expect(perfil.mascotes.sapo.projetos).toHaveLength(1)
  })

  it('mantém vários perfis', () => {
    const p = comMascote()
    p.perfis.ana = structuredClone(p.perfis.principal)
    p.perfilAtivo = 'ana'
    const r = repararProgresso(p)
    expect(Object.keys(r.perfis)).toEqual(['principal', 'ana'])
    expect(r.perfilAtivo).toBe('ana')
  })
})

describe('dataDeHoje', () => {
  it('usa o formato AAAA-MM-DD', () => {
    expect(dataDeHoje(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
