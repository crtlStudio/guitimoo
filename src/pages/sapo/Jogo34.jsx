import { useEffect, useRef, useState } from 'react'
import BalaoMascote from '../../components/BalaoMascote'
import Festa from '../../components/Festa'
import { lerProgresso, proximaConta, registarConta } from '../../games/sapo/memoria'
import Mesa from './Mesa'
import styles from './Jogo.module.css'

const ESCALAO = '3-4'
/** Sapinhos no chão: 9, de todas as cores (pode usar-se qualquer cor). */
const CORES = { verde: 3, laranja: 3, azul: 3 }
/** Tempo a festejar antes da conta seguinte (milissegundos). */
const ESPERA_DEPOIS_DE_ACERTAR = 2800

/**
 * Jogo dos 3–4 anos: no prato direito está um número (com as pintas por
 * baixo, para contar). A criança põe sapinhos no prato esquerdo e, quando
 * há tantos como o número, a balança fica direita: festa! (sem botões)
 * Se puser sapinhos a mais, o Sapo avisa com carinho e ela tira um.
 *
 * Props: aoAcertar() e aoErrar() — avisam a página (sons e estrelas).
 */
function Jogo34({ aoAcertar, aoErrar }) {
  // A ronda atual: { numero (conta as rondas), conta } — null enquanto carrega
  const [ronda, setRonda] = useState(null)
  const [resolvida, setResolvida] = useState(false) // a balança já ficou direita
  // Mensagem do Sapo: null, { tipo: 'erro' | 'fim', vez }
  const [mensagem, setMensagem] = useState(null)

  const progresso = useRef(null) // nível e histórico (guardados no telemóvel)
  const errou = useRef(false) // pôs sapinhos a mais nesta ronda?
  const temporizador = useRef(null)
  const jaComecou = useRef(false)

  /** Sorteia a conta seguinte (sem repetir as últimas) e começa uma ronda nova. */
  function novaRonda() {
    const sorteio = proximaConta(ESCALAO, progresso.current)
    progresso.current = sorteio.progresso
    errou.current = false
    setResolvida(false)
    setMensagem(null)
    setRonda((r) => ({ numero: (r?.numero ?? 0) + 1, conta: sorteio.conta }))
  }

  // Primeira ronda: lê o progresso do telemóvel (o jaComecou evita fazê-lo duas vezes)
  useEffect(() => {
    if (jaComecou.current) return
    jaComecou.current = true
    lerProgresso(ESCALAO).then((p) => {
      progresso.current = p
      novaRonda()
    })
  }, [])

  // Ao sair do jogo, cancela a passagem para a ronda seguinte
  useEffect(() => () => clearTimeout(temporizador.current), [])

  /** A Mesa avisa sempre que muda o número de sapinhos no prato esquerdo. */
  function aoMudar(quantos) {
    if (resolvida) return
    const alvo = ronda.conta.alvoEsquerda
    const vez = (m) => (m?.vez ?? 0) + 1

    if (quantos === alvo) {
      // A balança ficou direita: festa!
      setResolvida(true)
      setMensagem((m) => ({ tipo: 'fim', vez: vez(m) }))
      progresso.current = registarConta(ESCALAO, progresso.current, !errou.current)
      const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
      if (!acabou) temporizador.current = setTimeout(novaRonda, ESPERA_DEPOIS_DE_ACERTAR)
    } else if (quantos > alvo) {
      // Sapinhos a mais: a balança fica torta para a esquerda (sem castigo)
      errou.current = true
      aoErrar?.()
      setMensagem((m) => ({ tipo: 'erro', vez: vez(m) }))
    } else {
      setMensagem(null) // ainda faltam: continua
    }
  }

  if (!ronda) return null

  return (
    <>
      {/* O key muda a cada ronda: os sapinhos voltam todos ao chão, noutros lugares */}
      <Mesa
        key={ronda.numero}
        cores={CORES}
        numeroDireita={ronda.conta.numeroDireita}
        pintas
        bloqueada={resolvida}
        festejar={resolvida}
        aoMudar={aoMudar}
      />

      <BalaoMascote
        emoji="🐸"
        mensagem={mensagem}
        textos={{ erro: 'Ups! Sapinhos a mais. Tira um!', fim: 'Boa! A balança está direitinha!' }}
        className={styles.mensagem}
      />

      {resolvida && <Festa semente={`sapo-${ronda.numero}`} origem={{ x: 50, y: 45 }} />}
    </>
  )
}

export default Jogo34
