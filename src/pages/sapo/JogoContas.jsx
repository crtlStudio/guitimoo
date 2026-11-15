import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import BalaoMascote from '../../components/BalaoMascote'
import Festa from '../../components/Festa'
import { opcoesDeResposta, partesDaConta, pratoCerto, regrasDoNivel, respostaCerta } from '../../games/sapo/contas'
import { lerProgresso, proximaConta, registarConta } from '../../games/sapo/memoria'
import Mesa from './Mesa'
import styles from './Jogo.module.css'

/** Tempo a festejar antes da conta seguinte (milissegundos). */
const ESPERA_DEPOIS_DE_ACERTAR = 3000
/** Quanto tempo um número errado fica no prato antes de sair (milissegundos). */
const ESPERA_NUMERO_ERRADO = 1400

/**
 * Os sapinhos no chão e no prato para cada conta:
 * - soma (5 + 2): no chão, os azuis do 5 e os verdes do 2 (e mais uns quantos)
 * - subtração (9 − 4): o prato já tem 9 azuis; a criança tira 4
 * - falta (4 + ? = 9): o prato já tem 4 azuis; no chão, laranjas para acrescentar
 * A criança pode usar sapinhos de qualquer cor: só conta o total no prato.
 */
function sapinhosDaConta(conta) {
  if (conta.tipo === 'soma') return { cores: { azul: conta.a + 1, verde: conta.b + 1, laranja: 2 }, inicial: null }
  const inicial = { quantos: conta.a, cor: 'azul' }
  if (conta.tipo === 'subtracao') return { cores: { verde: 2, laranja: 2 }, inicial }
  return { cores: { laranja: conta.resposta + 2, verde: 2 }, inicial } // falta
}

/** Textos do Sapo (o tipo da mensagem decide a reação: erro, boa, fim). */
const TEXTOS = {
  montarErrado: 'Quase! Conta outra vez os sapinhos',
  balancaTorta: 'Quase! A balança ainda está torta',
  contaOsNovos: 'Quase! Conta os sapinhos que juntaste',
  escolhe: 'Boa! Agora escolhe o número',
  certo: 'Boa! A balança está direitinha!',
}

/**
 * Jogo dos 5–6 e dos 7–8 anos: a conta aparece num cartão.
 *   1. a criança mostra a conta com sapinhos no prato esquerdo
 *   2. carrega em «Já está!» (1.ª validação: o prato tem o número certo?)
 *   3. escolhe o número (2.ª validação). Na soma e na subtração, o número
 *      escolhido vai para o prato direito: com o certo, a balança fica direita!
 *      No "número que falta", o prato direito já tem o total desde o início.
 * Sem castigo: se errar, o Sapo anima e tenta-se outra vez.
 *
 * Props: escalao ('5-6' ou '7-8'), aoAcertar() e aoErrar() — avisam a página.
 */
function JogoContas({ escalao, aoAcertar, aoErrar }) {
  // A ronda atual: { numero, conta, opcoes } — null enquanto carrega
  const [ronda, setRonda] = useState(null)
  // 'montar' (pôr sapinhos), 'escolher' (escolher o número) ou 'certo' (festa)
  const [fase, setFase] = useState('montar')
  const [naEsquerda, setNaEsquerda] = useState(0) // sapinhos no prato esquerdo
  const [numeroDireita, setNumeroDireita] = useState(null) // o número no prato direito
  const [erradas, setErradas] = useState([]) // números já escolhidos e errados
  const [aEspera, setAEspera] = useState(false) // um número errado está no prato
  // Mensagem do Sapo: null ou { tipo: 'erro' | 'boa' | 'fim', texto, vez }
  const [mensagem, setMensagem] = useState(null)

  const progresso = useRef(null) // nível e histórico (guardados no telemóvel)
  const errou = useRef(false) // houve algum erro nesta conta?
  const temporizadores = useRef([])
  const jaComecou = useRef(false)

  function depois(ms, funcao) {
    temporizadores.current.push(setTimeout(funcao, ms))
  }

  function falar(tipo, texto) {
    setMensagem((m) => ({ tipo, texto, vez: (m?.vez ?? 0) + 1 }))
  }

  /** Sorteia a conta seguinte (sem repetir as últimas) e começa uma ronda nova. */
  function novaRonda() {
    const sorteio = proximaConta(escalao, progresso.current)
    progresso.current = sorteio.progresso
    const { conta } = sorteio
    const { opcoes: quantas } = regrasDoNivel(escalao, progresso.current.nivel)
    errou.current = false
    setFase('montar')
    setNaEsquerda(conta.esquerdaInicial)
    setNumeroDireita(conta.numeroDireita)
    setErradas([])
    setAEspera(false)
    setMensagem(null)
    setRonda((r) => ({ numero: (r?.numero ?? 0) + 1, conta, opcoes: opcoesDeResposta(conta.resposta, quantas) }))
  }

  // Primeira ronda: lê o progresso do telemóvel (o jaComecou evita fazê-lo duas vezes)
  useEffect(() => {
    if (jaComecou.current) return
    jaComecou.current = true
    lerProgresso(escalao).then((p) => {
      progresso.current = p
      novaRonda()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só uma vez, ao começar (o key muda com a idade)
  }, [])

  // Ao sair do jogo, cancela o que estava agendado
  useEffect(() => {
    const pendentes = temporizadores.current
    return () => pendentes.forEach(clearTimeout)
  }, [])

  if (!ronda) return null
  const { conta } = ronda

  /** 1.ª validação: o prato esquerdo tem os sapinhos certos? */
  function jaEsta() {
    if (pratoCerto(conta, naEsquerda)) {
      setFase('escolher')
      falar('boa', TEXTOS.escolhe)
    } else {
      errou.current = true
      aoErrar?.()
      falar('erro', conta.tipo === 'falta' ? TEXTOS.balancaTorta : TEXTOS.montarErrado)
    }
  }

  /** 2.ª validação: o número escolhido é o resultado? */
  function escolher(numero) {
    if (fase !== 'escolher' || aEspera || erradas.includes(numero)) return
    // Na soma e na subtração, o número vai para o prato direito (pesa o que vale)
    if (conta.tipo !== 'falta') setNumeroDireita(numero)

    if (respostaCerta(conta, numero)) {
      setFase('certo')
      falar('fim', TEXTOS.certo)
      progresso.current = registarConta(escalao, progresso.current, !errou.current)
      const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
      if (!acabou) depois(ESPERA_DEPOIS_DE_ACERTAR, novaRonda)
      return
    }

    // Errado: a balança fica torta um bocadinho e o número sai do prato
    errou.current = true
    aoErrar?.()
    setErradas((e) => [...e, numero])
    falar('erro', conta.tipo === 'falta' ? TEXTOS.contaOsNovos : TEXTOS.balancaTorta)
    if (conta.tipo !== 'falta') {
      setAEspera(true)
      depois(ESPERA_NUMERO_ERRADO, () => {
        setNumeroDireita(null)
        setAEspera(false)
      })
    }
  }

  const { cores, inicial } = sapinhosDaConta(conta)

  return (
    <>
      {/* O key muda a cada ronda: os sapinhos voltam todos ao chão, noutros lugares */}
      <Mesa
        key={ronda.numero}
        cores={cores}
        inicial={inicial}
        numeroDireita={numeroDireita}
        bloqueada={fase !== 'montar'}
        festejar={fase === 'certo'}
        aoMudar={(quantos) => {
          setNaEsquerda(quantos)
          setMensagem(null) // mexeu nos sapinhos: o Sapo cala-se
        }}
      />

      {/* Em cima à esquerda, numa linha: o cartão da conta e, a seguir, o «Já está!»
          (assim o botão não fica por cima dos sapinhos do chão) */}
      <div className={styles.linhaDaConta}>
        {/* O cartão com a conta: cada número com a sua cor (o "?" passa a resposta no fim) */}
        <motion.div
          key={`cartao-${ronda.numero}`}
          className={styles.cartao}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          aria-label={`Conta: ${conta.texto}`}
        >
          {partesDaConta(conta, fase === 'certo').map((parte, i) => (
            <motion.span
              key={`${i}-${parte.texto}`}
              className={parte.cor ? styles[parte.cor] : styles.sinal}
              initial={parte.cor === 'resposta' && fase === 'certo' ? { scale: 0.3 } : false}
              animate={{ scale: 1 }}
            >
              {parte.texto}
            </motion.span>
          ))}
        </motion.div>

        {/* 1.ª validação */}
        {fase === 'montar' && (
          <motion.button
            type="button"
            className={styles.jaEsta}
            onClick={jaEsta}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.92 }}
          >
            Já está!
          </motion.button>
        )}
      </div>

      <BalaoMascote
        emoji="🐸"
        mensagem={mensagem}
        textos={mensagem ? { [mensagem.tipo]: mensagem.texto } : {}}
        className={styles.mensagemContas}
      />

      {/* 2.ª validação: os números para escolher */}
      <AnimatePresence>
        {fase !== 'montar' && (
          <motion.div
            className={styles.opcoes}
            role="group"
            aria-label="Escolhe o número"
            initial={{ opacity: 0, y: '4cqw' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {ronda.opcoes.map((numero) => {
              const errada = erradas.includes(numero)
              const certa = fase === 'certo' && respostaCerta(conta, numero)
              return (
                <motion.button
                  key={numero}
                  type="button"
                  className={`${styles.opcao} ${errada ? styles.opcaoErrada : ''} ${certa ? styles.opcaoCerta : ''}`}
                  onClick={() => escolher(numero)}
                  disabled={errada || fase === 'certo'}
                  aria-label={`Número ${numero}`}
                  animate={errada ? { rotate: [0, -8, 8, -5, 0] } : certa ? { scale: [1, 1.2, 1] } : {}}
                  whileTap={errada ? undefined : { scale: 0.9 }}
                >
                  {numero}
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {fase === 'certo' && <Festa semente={`sapo-${escalao}-${ronda.numero}`} origem={{ x: 50, y: 45 }} />}
    </>
  )
}

export default JogoContas
