// ============================================================
// Progresso da criança: estrelas por jogo, peças e projetos das mascotes.
//
// Aqui só há FUNÇÕES PURAS: recebem o progresso e devolvem um progresso
// NOVO (nunca mudam o que receberam). Não sabem nada de React nem do
// telemóvel: quem guarda é o guardar.js. Assim são fáceis de testar.
//
// Forma dos dados (o que fica guardado):
// {
//   versao: 1,
//   perfilAtivo: 'principal',
//   perfis: {
//     principal: {
//       nivel: 'medio',              // 'facil' | 'medio' | 'dificil' | null
//       mascoteAtiva: 'sapo',        // null só antes da primeira escolha
//       estrelas: { matematica: { total: 137, resto: 7 }, ... },
//       mascotes: {
//         sapo: {
//           projetos: [               // o último é o projeto atual
//             { pecas: { matematica: 5, ... }, completoEm: '2026-11-10' },
//             { pecas: { matematica: 2, ... }, completoEm: null },
//           ],
//           reserva: { matematica: 1, ... },  // peças guardadas para o próximo projeto
//           vistas: {                 // o que a criança já viu no ecrã da construção
//             projeto: 1,             // o n.º do projeto (0 = o primeiro)
//             pecas: { matematica: 2, ... },  // as peças desse projeto que já viu
//           },
//         },
//         ...
//       },
//     },
//   },
// }
// ============================================================
import { ESTRELAS_POR_PECA, JOGOS, MASCOTES, NIVEIS, PECAS_POR_COR, PERFIL_PRINCIPAL } from './config'

/** A versão da forma dos dados. Sobe quando a forma mudar. */
export const VERSAO = 1

// ---------------- Ajudantes ----------------

/** Um número inteiro ≥ 0 (e ≤ maximo); qualquer outra coisa vira 0. */
function inteiro(n, maximo = Infinity) {
  return Number.isInteger(n) && n >= 0 ? Math.min(n, maximo) : 0
}

/** { matematica: 0, portugues: 0, ... } com todos os jogos (também os inativos). */
function zeroPorJogo() {
  return Object.fromEntries(JOGOS.map((j) => [j.id, 0]))
}

const existeJogo = (id) => JOGOS.some((j) => j.id === id)
const existeMascote = (id) => MASCOTES.some((m) => m.id === id)
const existeNivel = (id) => NIVEIS.some((n) => n.id === id)
const ehObjeto = (x) => typeof x === 'object' && x !== null && !Array.isArray(x)

/** A data de hoje no formato 'AAAA-MM-DD' (hora do telemóvel). */
export function dataDeHoje(agora = new Date()) {
  const dois = (n) => String(n).padStart(2, '0')
  return `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}`
}

/**
 * Muda só o perfil ativo: faz uma cópia funda do progresso, deixa
 * `mudar` alterar a cópia do perfil e devolve a cópia.
 */
function mudarPerfil(progresso, mudar) {
  const copia = structuredClone(progresso)
  mudar(copia.perfis[copia.perfilAtivo])
  return copia
}

// ---------------- Criar ----------------

function novoProjeto() {
  return { pecas: zeroPorJogo(), completoEm: null }
}

function novaMascote() {
  return { projetos: [novoProjeto()], reserva: zeroPorJogo(), vistas: { projeto: 0, pecas: zeroPorJogo() } }
}

function novoPerfil(nivel = null, mascoteAtiva = null) {
  return {
    nivel: existeNivel(nivel) ? nivel : null,
    mascoteAtiva: existeMascote(mascoteAtiva) ? mascoteAtiva : null,
    estrelas: Object.fromEntries(JOGOS.map((j) => [j.id, { total: 0, resto: 0 }])),
    mascotes: Object.fromEntries(MASCOTES.map((m) => [m.id, novaMascote()])),
  }
}

/** O progresso de quem nunca jogou (pode já vir com o nível escolhido). */
export function criarProgresso(nivel = null) {
  return {
    versao: VERSAO,
    perfilAtivo: PERFIL_PRINCIPAL,
    perfis: { [PERFIL_PRINCIPAL]: novoPerfil(nivel) },
  }
}

// ---------------- Ler ----------------

/** O perfil que está a jogar. */
export function perfilAtivo(progresso) {
  return progresso.perfis[progresso.perfilAtivo]
}

/** Os jogos que contam para os projetos (os ativos). */
export function jogosAtivos() {
  return JOGOS.filter((j) => j.ativo)
}

/** O projeto que a mascote está a construir agora (o último da lista). */
export function projetoAtual(progresso, mascoteId = perfilAtivo(progresso).mascoteAtiva) {
  const mascote = perfilAtivo(progresso).mascotes[mascoteId]
  return mascote ? mascote.projetos.at(-1) : null
}

/**
 * Um projeto está completo se já foi acabado alguma vez (tem data), ou se
 * tem as peças todas de cada jogo ativo. Se não houver jogos ativos, nunca
 * está completo (não faz sentido acabar um projeto sem peças).
 */
export function projetoEstaCompleto(projeto) {
  if (!projeto) return false
  if (projeto.completoEm) return true
  const ativos = jogosAtivos()
  return ativos.length > 0 && ativos.every((j) => projeto.pecas[j.id] >= PECAS_POR_COR)
}

/** Se o projeto atual da mascote já tem as peças todas desta cor. */
export function corEstaCompleta(progresso, jogoId, mascoteId) {
  const projeto = projetoAtual(progresso, mascoteId)
  return projeto ? projeto.pecas[jogoId] >= PECAS_POR_COR : false
}

/**
 * Quantas peças faltam no projeto atual da mascote (só dos jogos ativos):
 *   { porCor: { matematica: 0, portugues: 2, ... }, total: 7 }
 */
export function pecasEmFalta(progresso, mascoteId) {
  const projeto = projetoAtual(progresso, mascoteId)
  const porCor = Object.fromEntries(
    jogosAtivos().map((j) => [j.id, projeto ? Math.max(0, PECAS_POR_COR - projeto.pecas[j.id]) : PECAS_POR_COR]),
  )
  const total = Object.values(porCor).reduce((soma, n) => soma + n, 0)
  return { porCor, total }
}

/**
 * O jogo cuja cor tem mais peças em falta (para a mascote apontar:
 * "joga este!"). Num empate, o primeiro da lista. Se não faltar nada, null.
 */
export function corQueMaisFalta(progresso, mascoteId) {
  const { porCor } = pecasEmFalta(progresso, mascoteId)
  let melhor = null
  for (const [id, faltam] of Object.entries(porCor)) {
    if (faltam > 0 && faltam > (porCor[melhor] ?? 0)) melhor = id
  }
  return melhor
}

/** Quantos projetos a mascote já acabou. */
export function projetosAcabados(progresso, mascoteId) {
  const mascote = perfilAtivo(progresso).mascotes[mascoteId]
  return mascote ? mascote.projetos.filter((p) => p.completoEm).length : 0
}

// ---------------- Peças novas (para a animação da construção) ----------------

/**
 * O que a mascote ganhou desde a última vez que a criança viu a construção:
 *   { projetosNovos: 1, porCor: { matematica: 2, portugues: 0, ... }, total: 2 }
 * - projetosNovos: projetos acabados que a criança ainda não viu (festa!)
 * - porCor: as peças novas do projeto atual (só dos jogos ativos). Se o
 *   projeto mudou, as peças que já lá estão são todas novas.
 */
export function pecasNovas(progresso, mascoteId = perfilAtivo(progresso).mascoteAtiva) {
  const mascote = perfilAtivo(progresso).mascotes[mascoteId]
  const vazio = Object.fromEntries(jogosAtivos().map((j) => [j.id, 0]))
  if (!mascote) return { projetosNovos: 0, porCor: vazio, total: 0 }

  const atual = mascote.projetos.length - 1
  const projetosNovos = Math.max(0, atual - mascote.vistas.projeto)
  const projeto = mascote.projetos[atual]
  const porCor = Object.fromEntries(
    jogosAtivos().map((j) => {
      const jaVistas = projetosNovos > 0 ? 0 : mascote.vistas.pecas[j.id]
      return [j.id, Math.max(0, projeto.pecas[j.id] - jaVistas)]
    }),
  )
  const total = Object.values(porCor).reduce((soma, n) => soma + n, 0)
  return { projetosNovos, porCor, total }
}

/**
 * A criança viu a construção: tudo o que lá está deixa de ser novo
 * (para a animação não se repetir). Se já estava tudo visto, devolve o
 * mesmo progresso (assim não se grava nada sem precisar).
 */
export function marcarComoVistas(progresso, mascoteId = perfilAtivo(progresso).mascoteAtiva) {
  const novas = pecasNovas(progresso, mascoteId)
  if (!existeMascote(mascoteId) || (novas.projetosNovos === 0 && novas.total === 0)) return progresso
  return mudarPerfil(progresso, (perfil) => {
    const mascote = perfil.mascotes[mascoteId]
    mascote.vistas = { projeto: mascote.projetos.length - 1, pecas: { ...mascote.projetos.at(-1).pecas } }
  })
}

// ---------------- Escolhas ----------------

/** Escolhe o nível ('facil', 'medio', 'dificil'). Um id inválido não muda nada. */
export function escolherNivel(progresso, nivelId) {
  if (!existeNivel(nivelId)) return progresso
  return mudarPerfil(progresso, (perfil) => {
    perfil.nivel = nivelId
  })
}

/**
 * Escolhe (ou troca) a mascote ativa. Um id inválido não muda nada.
 * O progresso de cada mascote fica guardado: trocar não apaga nada.
 */
export function escolherMascote(progresso, mascoteId) {
  if (!existeMascote(mascoteId)) return progresso
  return mudarPerfil(progresso, (perfil) => {
    perfil.mascoteAtiva = mascoteId
  })
}

/** Converte uma faixa etária antiga ('3-4', '5-6', '7-8') no nível novo (ou null). */
export function nivelDoEscalao(escalao) {
  return NIVEIS.find((n) => n.escalaoAntigo === escalao)?.id ?? null
}

/**
 * O contrário: o nível novo na faixa etária que os jogos usam por dentro
 * ('medio' → '5-6'). Os jogos continuam a falar em '3-4', '5-6' e '7-8'
 * (nas regras e no que guardam), por isso convertemos à entrada. Ou null.
 */
export function escalaoDoNivel(nivel) {
  return NIVEIS.find((n) => n.id === nivel)?.escalaoAntigo ?? null
}

/**
 * Cada jogo antigo guardou a sua faixa etária. Escolhe o nível que aparece
 * mais vezes; num empate, o mais fácil. Sem nada válido devolve null.
 *   nivelDosEscaloesAntigos(['5-6', '7-8', '5-6', null])  →  'medio'
 */
export function nivelDosEscaloesAntigos(escaloes) {
  const contagem = new Map()
  for (const escalao of escaloes) {
    const nivel = nivelDoEscalao(escalao)
    if (nivel) contagem.set(nivel, (contagem.get(nivel) ?? 0) + 1)
  }
  let melhor = null
  for (const { id } of NIVEIS) {
    // NIVEIS vai do mais fácil ao mais difícil: só troca se tiver MAIS votos
    if ((contagem.get(id) ?? 0) > (contagem.get(melhor) ?? 0)) melhor = id
  }
  return melhor
}

// ---------------- Estrelas e peças ----------------

/**
 * Enquanto o projeto atual estiver completo: marca a data, começa um
 * projeto novo e passa para ele as peças da reserva (até ao máximo de
 * cada cor; o que sobrar fica na reserva). Devolve quantos acabou.
 * (Muda a `mascote` que recebe: só se usa dentro de mudarPerfil.)
 */
function fecharProjetosCompletos(mascote, hoje) {
  let acabados = 0
  while (projetoEstaCompleto(mascote.projetos.at(-1))) {
    mascote.projetos.at(-1).completoEm ??= hoje
    const novo = novoProjeto()
    for (const { id } of jogosAtivos()) {
      const passam = Math.min(mascote.reserva[id], PECAS_POR_COR)
      novo.pecas[id] = passam
      mascote.reserva[id] -= passam
    }
    mascote.projetos.push(novo)
    acabados += 1
  }
  return acabados
}

/**
 * A criança ganhou `quantas` estrelas no jogo `jogoId`.
 * As estrelas somam-se sempre ao jogo (nunca se perdem). Cada 10 estrelas
 * desse jogo dão 1 peça da cor do jogo para a mascote ativa.
 *
 * Devolve:
 * - progresso: o progresso novo
 * - pecasGanhas: peças que entraram no projeto da mascote
 * - pecasExtra: peças ganhas quando a cor já estava completa. NÃO são
 *   guardadas aqui: o ecrã pergunta à criança se as quer guardar para o
 *   próximo projeto e, se sim, chama guardarNaReserva().
 * - projetosAcabados: quantos projetos ficaram completos agora (para a festa)
 * - corCompleta: se, no fim, a cor deste jogo está completa no projeto atual
 * - semPecas: null, ou o motivo de não poder haver peças:
 *   'jogo-inativo' ou 'sem-mascote'
 */
export function adicionarEstrelas(progresso, jogoId, quantas, hoje = dataDeHoje()) {
  const nada = { progresso, pecasGanhas: 0, pecasExtra: 0, projetosAcabados: 0, corCompleta: false, semPecas: null }
  if (!existeJogo(jogoId) || !Number.isInteger(quantas) || quantas <= 0) return nada

  const jogo = JOGOS.find((j) => j.id === jogoId)
  let pecasGanhas = 0
  let pecasExtra = 0
  let projetosAcabados = 0
  let semPecas = null

  const novo = mudarPerfil(progresso, (perfil) => {
    const estrelas = perfil.estrelas[jogoId]
    estrelas.total += quantas
    const juntas = estrelas.resto + quantas
    const pecas = Math.floor(juntas / ESTRELAS_POR_PECA)
    estrelas.resto = juntas % ESTRELAS_POR_PECA

    const mascote = perfil.mascotes[perfil.mascoteAtiva]
    if (!jogo.ativo) semPecas = 'jogo-inativo'
    else if (!mascote) semPecas = 'sem-mascote'
    if (semPecas) return

    for (let i = 0; i < pecas; i++) {
      const projeto = mascote.projetos.at(-1)
      if (projeto.pecas[jogoId] < PECAS_POR_COR) {
        projeto.pecas[jogoId] += 1
        pecasGanhas += 1
        projetosAcabados += fecharProjetosCompletos(mascote, hoje)
      } else {
        pecasExtra += 1
      }
    }
  })

  return {
    progresso: novo,
    pecasGanhas,
    pecasExtra,
    projetosAcabados,
    corCompleta: corEstaCompleta(novo, jogoId),
    semPecas,
  }
}

/**
 * A criança disse "sim, guarda": põe `quantas` peças de `jogoId` na reserva
 * da mascote ativa. Entram sozinhas no próximo projeto dessa mascote.
 */
export function guardarNaReserva(progresso, jogoId, quantas) {
  const jogo = JOGOS.find((j) => j.id === jogoId)
  const mascoteId = perfilAtivo(progresso).mascoteAtiva
  if (!jogo?.ativo || !existeMascote(mascoteId) || !Number.isInteger(quantas) || quantas <= 0) {
    return progresso
  }
  return mudarPerfil(progresso, (perfil) => {
    perfil.mascotes[mascoteId].reserva[jogoId] += quantas
  })
}

/**
 * Junta o que se ganhou em várias entregas de estrelas no mesmo jogo
 * (cada resposta certa dá estrelas; no fim, o total do jogo).
 *   somarPremios(null, resultado)  →  { jogoId, pecasGanhas, pecasExtra, projetosAcabados }
 * `resultado` é o que adicionarEstrelas devolve.
 */
export function somarPremios(antes, jogoId, resultado) {
  return {
    jogoId,
    pecasGanhas: (antes?.pecasGanhas ?? 0) + resultado.pecasGanhas,
    pecasExtra: (antes?.pecasExtra ?? 0) + resultado.pecasExtra,
    projetosAcabados: (antes?.projetosAcabados ?? 0) + resultado.projetosAcabados,
  }
}

// ---------------- Limpar ----------------

/**
 * O que o perfil ativo já juntou, para o adulto ver antes de apagar:
 *   { pecas: 37, projetos: 1 }
 * - pecas: todas as peças, de todas as mascotes (nos projetos e na reserva)
 * - projetos: os projetos acabados, de todas as mascotes
 */
export function resumoDoProgresso(progresso) {
  let pecas = 0
  let projetos = 0
  const soma = (contas) => Object.values(contas).reduce((s, n) => s + n, 0)
  for (const mascote of Object.values(perfilAtivo(progresso).mascotes)) {
    for (const projeto of mascote.projetos) {
      pecas += soma(projeto.pecas)
      if (projeto.completoEm) projetos += 1
    }
    pecas += soma(mascote.reserva)
  }
  return { pecas, projetos }
}

/**
 * Apaga as estrelas, peças e projetos do perfil ativo (para o botão dos
 * adultos). Mantém o nível e a mascote escolhida. Os outros perfis
 * (quando existirem) não são tocados.
 */
export function limparProgresso(progresso) {
  const copia = structuredClone(progresso)
  const antigo = copia.perfis[copia.perfilAtivo]
  copia.perfis[copia.perfilAtivo] = novoPerfil(antigo.nivel, antigo.mascoteAtiva)
  return copia
}

// ---------------- Reparar o que vem do telemóvel ----------------

function repararPecas(pecas, maximo) {
  const certas = zeroPorJogo()
  if (ehObjeto(pecas)) for (const id of Object.keys(certas)) certas[id] = inteiro(pecas[id], maximo)
  return certas
}

function repararMascote(m) {
  if (!ehObjeto(m)) return novaMascote()
  const projetos = Array.isArray(m.projetos)
    ? m.projetos.filter(ehObjeto).map((p) => ({
        pecas: repararPecas(p.pecas, PECAS_POR_COR),
        completoEm: typeof p.completoEm === 'string' ? p.completoEm : null,
      }))
    : []
  if (projetos.length === 0) projetos.push(novoProjeto())
  return { projetos, reserva: repararPecas(m.reserva), vistas: repararVistas(m.vistas, projetos) }
}

/**
 * Sem `vistas` (progresso guardado antes de existirem): conta como se a
 * criança estivesse no projeto atual sem ter visto nenhuma peça. Assim, na
 * primeira visita, as peças caem todas, mas não se repete a festa dos
 * projetos já acabados (essa já se fez no fim do jogo).
 */
function repararVistas(v, projetos) {
  const atual = projetos.length - 1
  if (!ehObjeto(v)) return { projeto: atual, pecas: zeroPorJogo() }
  return { projeto: inteiro(v.projeto, atual), pecas: repararPecas(v.pecas, PECAS_POR_COR) }
}

function repararPerfil(p) {
  const perfil = novoPerfil()
  if (!ehObjeto(p)) return perfil
  if (existeNivel(p.nivel)) perfil.nivel = p.nivel
  if (existeMascote(p.mascoteAtiva)) perfil.mascoteAtiva = p.mascoteAtiva
  for (const { id } of JOGOS) {
    const e = ehObjeto(p.estrelas) ? p.estrelas[id] : null
    if (ehObjeto(e)) perfil.estrelas[id] = { total: inteiro(e.total), resto: inteiro(e.resto) % ESTRELAS_POR_PECA }
  }
  for (const { id } of MASCOTES) {
    if (ehObjeto(p.mascotes)) perfil.mascotes[id] = repararMascote(p.mascotes[id])
  }
  return perfil
}

/**
 * Recebe o que estava guardado (pode vir estragado, incompleto ou de uma
 * versão antiga) e devolve SEMPRE um progresso válido, aproveitando tudo o
 * que der: números estranhos viram 0, jogos/mascotes que já não existem são
 * ignorados, jogos/mascotes novos começam a zero. Nunca rebenta.
 */
export function repararProgresso(dados) {
  if (!ehObjeto(dados) || !ehObjeto(dados.perfis)) return criarProgresso()

  // (Quando houver versão 2, a conversão da versão 1 entra aqui.)
  const perfis = {}
  for (const [nome, perfil] of Object.entries(dados.perfis)) perfis[nome] = repararPerfil(perfil)
  if (Object.keys(perfis).length === 0) perfis[PERFIL_PRINCIPAL] = novoPerfil()

  const ativo = Object.hasOwn(perfis, dados.perfilAtivo) ? dados.perfilAtivo : Object.keys(perfis)[0]
  return { versao: VERSAO, perfilAtivo: ativo, perfis }
}
