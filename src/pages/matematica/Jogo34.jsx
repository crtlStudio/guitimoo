import { useEffect, useRef, useState } from 'react'
import BalaoMascote from '../../components/BalaoMascote'
import DedoFantasma from '../../components/DedoFantasma'
import Festa from '../../components/Festa'
import { DESCIDA_POR_CUBINHO } from '../../games/matematica/balanca'
import { lerProgresso, proximaConta, registarConta } from '../../games/matematica/memoria'
import Mesa from './Mesa'
import { chao, pratoEsquerdo, umCubinhoNoChao, umCubinhoNoPrato } from './ajuda'
import styles from './Jogo.module.css'

const ESCALAO = '3-4'
/** Cubinhos no chão: 9, de todas as cores (pode usar-se qualquer cor). */
const CORES = { verde: 3, laranja: 3, azul: 3 }
/** Tempo a festejar antes da conta seguinte (milissegundos). */
const ESPERA_DEPOIS_DE_ACERTAR = 2800

/**
 * Jogo dos 3–4 anos: no prato direito está um número (com as pintas por
 * baixo, para contar). A criança põe cubinhos no prato esquerdo e, quando
 * há tantos como o número, a balança fica direita: festa! (sem botões)
 * Se puser cubinhos a mais, a mascote avisa com carinho e ela tira um.
 *
 * Props: aoAcertar() e aoErrar() — avisam a página (sons e estrelas);
 * aoProxima() — depois de acertar, a página passa à pergunta seguinte.
 */
function Jogo34({ aoAcertar, aoErrar, aoProxima }) {
  // A ronda atual: { numero (conta as rondas), conta } — null enquanto carrega
  const [ronda, setRonda] = useState(null)
  const [resolvida, setResolvida] = useState(false) // a balança já ficou direita
  const [noPrato, setNoPrato] = useState(0) // cubinhos no prato esquerdo (para a ajuda)
  // Mensagem da mascote: null, { tipo: 'erro' | 'fim', vez }
  const [mensagem, setMensagem] = useState(null)

  const progresso = useRef(null) // nível e histórico (guardados no telemóvel)
  const errou = useRef(false) // pôs cubinhos a mais nesta ronda?
  const temporizador = useRef(null)
  const jaComecou = useRef(false)

  /** Sorteia a conta seguinte (sem repetir as últimas) e começa uma ronda nova. */
  function novaRonda() {
    const sorteio = proximaConta(ESCALAO, progresso.current)
    progresso.current = sorteio.progresso
    errou.current = false
    setResolvida(false)
    setNoPrato(0)
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

  /** A Mesa avisa sempre que muda o número de cubinhos no prato esquerdo. */
  function aoMudar(quantos) {
    setNoPrato(quantos)
    if (resolvida) return
    const alvo = ronda.conta.alvoEsquerda
    const vez = (m) => (m?.vez ?? 0) + 1

    if (quantos === alvo) {
      // A balança ficou direita: festa!
      setResolvida(true)
      setMensagem((m) => ({ tipo: 'fim', vez: vez(m) }))
      progresso.current = registarConta(ESCALAO, progresso.current, !errou.current)
      const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
      // A seguir: a página escolhe o próximo jogo (aoProxima); sem ela, outra conta aqui
      if (!acabou) temporizador.current = setTimeout(aoProxima ?? novaRonda, ESPERA_DEPOIS_DE_ACERTAR)
    } else if (quantos > alvo) {
      // Cubinhos a mais: a balança fica torta para a esquerda (sem castigo)
      errou.current = true
      aoErrar?.()
      setMensagem((m) => ({ tipo: 'erro', vez: vez(m) }))
    } else {
      setMensagem(null) // ainda faltam: continua
    }
  }

  if (!ronda) return null

  // A ajuda (ao fim de 3 s parada): mostra como se põe um cubinho no prato
  // (ou como se tira, se tiver cubinhos a mais). Não diz quantos.
  const aMais = noPrato > ronda.conta.alvoEsquerda
  const gesto = resolvida
    ? null
    : aMais
      ? { chave: `tirar-${ronda.numero}`, tipo: 'arrastar', de: umCubinhoNoPrato, para: chao }
      : { chave: `por-${ronda.numero}`, tipo: 'arrastar', de: umCubinhoNoChao, para: pratoEsquerdo }

  return (
    <>
      <DedoFantasma gesto={gesto} />
      {/* O key muda a cada ronda: os cubinhos voltam todos ao chão, noutros lugares */}
      <Mesa
        key={ronda.numero}
        cores={CORES}
        numeroDireita={ronda.conta.numeroDireita}
        pintas
        bloqueada={resolvida}
        festejar={resolvida}
        porCubinho={DESCIDA_POR_CUBINHO[ESCALAO]}
        aoMudar={aoMudar}
      />

      <BalaoMascote
        mensagem={mensagem}
        textos={{ erro: 'Ups! Cubinhos a mais. Tira um!', fim: 'Boa! A balança está direitinha!' }}
        className={styles.mensagem}
      />

      {resolvida && <Festa semente={`matematica-${ronda.numero}`} origem={{ x: 50, y: 45 }} />}
    </>
  )
}

export default Jogo34
