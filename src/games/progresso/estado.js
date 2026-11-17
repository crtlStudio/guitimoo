// ============================================================
// O progresso "vivo" da app: um só, partilhado por todos os ecrãs.
//
// Funciona como o total de estrelas (estrelas.js):
// - é lido do telemóvel UMA vez (carregarProgresso)
// - os ecrãs "inscrevem-se" para serem avisados quando muda
// - mudarProgresso aplica uma função pura do progresso.js
//   (ex.: escolherMascote) e guarda o resultado no telemóvel
// ============================================================
import { apagarTotal } from '../estrelas'
import { guardarProgresso, lerProgresso } from './guardar'
import { adicionarEstrelas, guardarNaReserva, limparProgresso, marcarComoVistas, marcarObjetivoVisto } from './progresso'

let progresso = null // null = ainda a ler do telemóvel
let leitura = null // a "promessa" da leitura (para só ler uma vez)
const ouvintes = new Set()

function avisarOuvintes() {
  ouvintes.forEach((avisar) => avisar())
}

/** Lê o progresso do telemóvel (só da primeira vez). */
export function carregarProgresso() {
  leitura ??= lerProgresso().then((lido) => {
    progresso = lido
    avisarOuvintes()
    return lido
  })
  return leitura
}

/** O progresso atual, ou null se ainda não acabou de ler. */
export function progressoAtual() {
  return progresso
}

/**
 * Muda o progresso com uma função pura e guarda (em segundo plano).
 *   mudarProgresso((p) => escolherNivel(p, 'facil'))
 * Antes de acabar de ler, não faz nada (os ecrãs só aparecem depois).
 */
export function mudarProgresso(mudar) {
  if (!progresso) return
  const novo = mudar(progresso)
  if (novo === progresso) return // nada mudou
  progresso = novo
  avisarOuvintes()
  guardarProgresso(novo)
}

/**
 * A criança ganhou estrelas num jogo: somam-se ao jogo e dão peças à mascote
 * (ver adicionarEstrelas). Guarda e devolve o resultado
 * ({ pecasGanhas, pecasExtra, projetosAcabados, corCompleta, semPecas }),
 * para o ecrã fazer a festa. Se o progresso ainda não foi lido do telemóvel
 * (não devia acontecer: os jogos só abrem depois), espera por ele e conta na
 * mesma: as estrelas nunca se perdem. Nesse caso devolve null.
 */
export function ganharEstrelas(jogoId, quantas) {
  if (!progresso) {
    carregarProgresso().then(() => ganharEstrelas(jogoId, quantas))
    return null
  }
  const resultado = adicionarEstrelas(progresso, jogoId, quantas)
  mudarProgresso(() => resultado.progresso)
  return resultado
}

/** A criança disse "sim, guarda": as peças extra vão para a reserva da mascote. */
export function guardarPecasNaReserva(jogoId, quantas) {
  mudarProgresso((p) => guardarNaReserva(p, jogoId, quantas))
}

/**
 * A criança viu a construção da mascote (por omissão, a ativa): as peças
 * que lá estão deixam de ser novas. Chama-se depois da animação acabar.
 */
export function marcarPecasVistas(mascoteId) {
  mudarProgresso((p) => marcarComoVistas(p, mascoteId))
}

/** A criança viu a página do objetivo da mascote (por omissão, a ativa): não volta a aparecer. */
export function marcarObjetivoComoVisto(mascoteId) {
  mudarProgresso((p) => marcarObjetivoVisto(p, mascoteId))
}

/**
 * Botão dos adultos: apaga as estrelas, peças e projetos do perfil ativo
 * e o total de estrelas do contador ⭐. O nível e a mascote ficam.
 * (A memória das perguntas de cada jogo e os volumes não mudam.)
 */
export function apagarProgresso() {
  mudarProgresso(limparProgresso)
  apagarTotal()
}

/** Para os componentes React serem avisados quando muda. Devolve a função para sair. */
export function inscrever(avisar) {
  ouvintes.add(avisar)
  carregarProgresso()
  return () => ouvintes.delete(avisar)
}

/** Só para os testes: volta ao estado inicial. */
export function _recomecarParaTestes() {
  progresso = null
  leitura = null
  ouvintes.clear()
}
