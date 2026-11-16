import { useEffect, useRef, useState } from 'react'
import { tocarEfeito } from '../audio/efeitos'
import { novoPlacar, registarCerta, registarErro, somarEstrelas } from '../games/estrelas'
import { ganharEstrelas } from '../games/progresso/estado'
import { somarPremios } from '../games/progresso/progresso'

/**
 * A estrela (som + "+5" + total a subir) chega este tempo depois do "certo".
 * O "certo" dura 1 segundo: assim os dois sons ouvem-se bem separados.
 */
export const ATRASO_DA_ESTRELA = 1000
/** Depois de a estrela aparecer, quanto tempo até ao ecrã de fim (na última resposta). */
const ATRASO_DO_FIM = ATRASO_DA_ESTRELA + 1000
/** No fim do jogo, a estrela dos +15 soa este tempo depois da "festa". */
const ATRASO_DA_ESTRELA_DA_FESTA = 1200

/** Soma as estrelas ao total e às peças da mascote; devolve o que deram. */
function contarEstrelas(jogoId, quantas) {
  somarEstrelas(quantas)
  return ganharEstrelas(jogoId, quantas)
}

/**
 * "Motor" de um jogo com `perguntas` perguntas, igual em todos os jogos.
 * `jogoId` é o id do jogo em config.js ('matematica', 'portugues', ...): as
 * estrelas contam para as peças da cor desse jogo.
 * O jogo (Português, Horas, Memória...) só tem de avisar:
 *   aoAcertar() → a criança respondeu bem a uma pergunta
 *                 (devolve true se era a última: o jogo acabou, não há ronda seguinte)
 *   aoErrar()   → a criança errou (pode tentar outra vez)
 * E o motor trata do resto: sons (certo, erro, estrela, festa), estrelas
 * (5 por certa à primeira, 15 no fim), peças para a mascote e o fim do jogo.
 * As estrelas contam para as peças logo que aparecem (se a criança sair a
 * meio, não se perdem); a festa das peças é no ecrã de fim.
 *
 * Devolve:
 * - placar: { perguntas, feitas, certas, errouNesta, estrelas }
 * - ganho: a última vez que ganhou estrelas { quantas, vez } (para o "+5")
 * - fim: true quando o jogo acabou (a página mostra o ecrã de fim)
 * - numero: conta os jogos (muda ao recomeçar; serve de `key` ao jogo)
 * - premio: o que este jogo deu à mascote, ou null
 *   { jogoId, pecasGanhas, pecasExtra, projetosAcabados } (para o ecrã de fim)
 * - aoAcertar(), aoErrar(), recomecar(novasPerguntas?)
 */
export function useJogo(perguntas, jogoId) {
  const [placar, setPlacar] = useState(() => novoPlacar(perguntas))
  const [ganho, setGanho] = useState(null)
  const [fim, setFim] = useState(false)
  const [numero, setNumero] = useState(0)
  const [premio, setPremio] = useState(null)
  // O id do jogo numa "caixa" (ref): a limpeza ao sair da página usa-o
  const idDoJogo = useRef(jogoId)

  // Cópia do placar sempre atualizada: os jogos chamam aoAcertar/aoErrar
  // de dentro de temporizadores, onde o `placar` do estado pode estar velho.
  const atual = useRef(placar)
  const temporizadores = useRef([])
  // Estrelas já ganhas mas ainda à espera de aparecer (durante o atraso).
  // Se a criança sair antes, são guardadas na mesma: nunca se perdem.
  const porEntregar = useRef([])

  function mudarPlacar(novo) {
    atual.current = novo
    setPlacar(novo)
  }

  function depois(ms, funcao) {
    temporizadores.current.push(setTimeout(funcao, ms))
  }

  /** Daqui a `ms`: soma as estrelas, toca a "estrela" e mostra o "+N". */
  function entregarEstrelas(quantas, ms) {
    const entrega = { quantas }
    porEntregar.current.push(entrega)
    depois(ms, () => {
      porEntregar.current = porEntregar.current.filter((e) => e !== entrega)
      const resultado = contarEstrelas(idDoJogo.current, quantas)
      if (resultado) setPremio((antes) => somarPremios(antes, idDoJogo.current, resultado))
      tocarEfeito('estrela')
      setGanho((g) => ({ quantas, vez: (g?.vez ?? 0) + 1 }))
    })
  }

  /** Cancela o que estava agendado, mas guarda as estrelas que faltavam. */
  function cancelarTudo() {
    temporizadores.current.forEach(clearTimeout)
    temporizadores.current = []
    porEntregar.current.forEach((e) => contarEstrelas(idDoJogo.current, e.quantas))
    porEntregar.current = []
  }

  // Ao sair da página: cancela o que estava agendado (e guarda as estrelas)
  useEffect(() => cancelarTudo, [])

  function aoErrar() {
    tocarEfeito('erro')
    mudarPlacar(registarErro(atual.current))
  }

  function aoAcertar() {
    const antes = atual.current
    if (antes.feitas >= antes.perguntas) return true // o jogo já acabou

    const { placar: novo, ganhas, bonus, acabou } = registarCerta(antes)
    mudarPlacar(novo)
    tocarEfeito('certo')

    if (ganhas > 0) entregarEstrelas(ganhas, ATRASO_DA_ESTRELA)

    if (acabou) {
      // Jogo ganho! Depois da estrela da última resposta: festa, +15 e o ecrã de fim
      depois(ATRASO_DO_FIM, () => {
        tocarEfeito('festa')
        setFim(true)
      })
      entregarEstrelas(bonus, ATRASO_DO_FIM + ATRASO_DA_ESTRELA_DA_FESTA)
    }
    return acabou
  }

  /** Começa um jogo novo (ex.: "Jogar outra vez" ou outra idade). */
  function recomecar(novasPerguntas = atual.current.perguntas) {
    cancelarTudo()
    mudarPlacar(novoPlacar(novasPerguntas))
    setGanho(null)
    setPremio(null)
    setFim(false)
    setNumero((n) => n + 1)
  }

  return { placar, ganho, fim, numero, premio, aoAcertar, aoErrar, recomecar }
}
