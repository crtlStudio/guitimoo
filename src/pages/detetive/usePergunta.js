import { useEffect, useRef, useState } from 'react'
import { lembrarProfissoes, lerRecentes } from '../../games/detetive/memoria'
import { sortearProfissao } from '../../games/detetive/regras'

const ESPERA_DEPOIS_DE_ACERTAR = 1600 // milissegundos até à pergunta seguinte

/**
 * A parte igual dos níveis fácil e médio: sortear a profissão (sem repetir
 * as últimas, lembradas no telemóvel), criar a pergunta, saber o que a
 * criança tocou e passar à pergunta seguinte depois de acertar.
 *
 * - escalao: '3-4' ou '5-6' (cada um tem a sua memória)
 * - criar(certa): faz a pergunta a partir da profissão sorteada
 *   (perguntaFacil ou perguntaMedio do regras.js)
 * - aoAcertar(), aoErrar(): do motor do jogo (useJogo)
 *
 * Devolve:
 * - pergunta: a pergunta atual (null enquanto lê o telemóvel)
 * - resposta: a última pessoa tocada { id, certa, vez } (ou null)
 * - numero: conta as perguntas (para as animações recomeçarem)
 * - tocar(profissao): a criança tocou numa pessoa
 */
export function usePergunta(escalao, criar, aoAcertar, aoErrar) {
  const [pergunta, setPergunta] = useState(null)
  const [resposta, setResposta] = useState(null)
  const [numero, setNumero] = useState(0)

  const recentes = useRef([])
  const temporizador = useRef(null)
  const jaComecou = useRef(false)

  function novaPergunta() {
    const certa = sortearProfissao(recentes.current)
    recentes.current = lembrarProfissoes(escalao, recentes.current, [certa.id])
    setPergunta(criar(certa))
    setResposta(null)
    setNumero((n) => n + 1)
  }

  // Primeira pergunta ao abrir: lê as profissões recentes do telemóvel.
  // O jaComecou evita começar duas vezes (o React corre isto duas vezes em desenvolvimento).
  useEffect(() => {
    if (jaComecou.current) return
    jaComecou.current = true
    lerRecentes(escalao).then((lidas) => {
      recentes.current = lidas
      novaPergunta()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só uma vez, ao começar (o key muda a cada jogo)
  }, [])

  // Ao sair do jogo, cancela a passagem automática para a pergunta seguinte
  useEffect(() => () => clearTimeout(temporizador.current), [])

  function tocar(profissao) {
    if (!pergunta || resposta?.certa) return // já acertou: espera pela seguinte

    if (profissao.id === pergunta.certa.id) {
      const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
      setResposta({ id: profissao.id, certa: true })
      if (!acabou) temporizador.current = setTimeout(novaPergunta, ESPERA_DEPOIS_DE_ACERTAR)
    } else {
      aoErrar?.()
      // `vez` conta os erros, para o abanão repetir mesmo na mesma pessoa
      setResposta((anterior) => ({ id: profissao.id, certa: false, vez: (anterior?.vez ?? 0) + 1 }))
    }
  }

  return { pergunta, resposta, numero, tocar }
}
