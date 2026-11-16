import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import BalaoMascote from '../../components/BalaoMascote'
import DedoFantasma from '../../components/DedoFantasma'
import Festa from '../../components/Festa'
import { DESCIDA_POR_CUBINHO } from '../../games/matematica/balanca'
import { coresTrocadas, opcoesDeResposta, partesDaConta, pratoCerto, regrasDoNivel, respostaCerta } from '../../games/matematica/contas'
import { lerProgresso, proximaConta, registarConta } from '../../games/matematica/memoria'
import Mesa from './Mesa'
import {
  botaoJaEsta,
  chao,
  parteDaConta,
  pratoEsquerdo,
  umCubinhoNoChao,
  umCubinhoNoPrato,
} from './ajuda'
import styles from './Jogo.module.css'

/** Tempo a festejar antes da conta seguinte (milissegundos). */
const ESPERA_DEPOIS_DE_ACERTAR = 3000
/** Quanto tempo um número errado fica no prato antes de sair (milissegundos). */
const ESPERA_NUMERO_ERRADO = 1400

/**
 * Os cubinhos no chão e no prato para cada conta:
 * - soma (5 + 2): no chão, os azuis do 5 e os verdes do 2 (e mais uns quantos)
 * - subtração (9 − 4): o prato já tem 9 azuis; a criança tira 4
 * - falta (4 + ? = 9): o prato já tem 4 azuis; no chão, laranjas para acrescentar
 * A criança pode usar cubinhos de qualquer cor: só conta o total no prato.
 */
function cubinhosDaConta(conta) {
  if (conta.tipo === 'soma') return { cores: { azul: conta.a + 1, verde: conta.b + 1, laranja: 2 }, inicial: null }
  const inicial = { quantos: conta.a, cor: 'azul' }
  if (conta.tipo === 'subtracao') return { cores: { verde: 2, laranja: 2 }, inicial }
  return { cores: { laranja: conta.resposta + 2, verde: 2 }, inicial } // falta
}

/** Textos da mascote (o tipo da mensagem decide a reação: erro, boa, fim). */
const TEXTOS = {
  montarErrado: 'Quase! Conta outra vez os cubinhos',
  coresErradas: 'Quase! Usa as cores dos números',
  balancaTorta: 'Quase! A balança ainda está torta',
  contaOsNovos: 'Quase! Conta os cubinhos que juntaste',
  escolhe: 'Boa! Agora escolhe o número',
  certo: 'Boa! A balança está direitinha!',
}

/**
 * Jogo dos 5–6 e dos 7–8 anos: a conta aparece num cartão.
 *   1. a criança mostra a conta com cubinhos no prato esquerdo (na soma,
 *      cada número com a sua cor: 2 + 3 = 2 azuis e 3 verdes)
 *   2. carrega no ✓ (1.ª validação: o prato tem o número certo?)
 *   3. escolhe o número (2.ª validação). Na soma e na subtração, o número
 *      escolhido vai para o prato direito: com o certo, a balança fica direita!
 *      No "número que falta", o prato direito já tem o total desde o início.
 * Sem castigo: se errar, a mascote anima e tenta-se outra vez.
 *
 * Props: escalao ('5-6' ou '7-8'), aoAcertar() e aoErrar() — avisam a página;
 * aoProxima() — depois de acertar, a página passa à pergunta seguinte.
 */
function JogoContas({ escalao, aoAcertar, aoErrar, aoProxima }) {
  // A ronda atual: { numero, conta, opcoes } — null enquanto carrega
  const [ronda, setRonda] = useState(null)
  // 'montar' (pôr cubinhos), 'escolher' (escolher o número) ou 'certo' (festa)
  const [fase, setFase] = useState('montar')
  const [naEsquerda, setNaEsquerda] = useState(0) // cubinhos no prato esquerdo
  const [porCor, setPorCor] = useState({}) // quantos de cada cor no prato esquerdo
  const [numeroDireita, setNumeroDireita] = useState(null) // o número no prato direito
  const [erradas, setErradas] = useState([]) // números já escolhidos e errados
  const [aEspera, setAEspera] = useState(false) // um número errado está no prato
  // Mensagem da mascote: null ou { tipo: 'erro' | 'boa' | 'fim', texto, vez }
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
    setPorCor(conta.esquerdaInicial > 0 ? { azul: conta.esquerdaInicial } : {})
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

  /** 1.ª validação: o prato esquerdo tem os cubinhos certos? */
  function jaEsta() {
    if (pratoCerto(conta, naEsquerda, porCor)) {
      setFase('escolher')
      falar('boa', TEXTOS.escolhe)
    } else {
      errou.current = true
      aoErrar?.()
      if (coresTrocadas(conta, naEsquerda, porCor)) falar('erro', TEXTOS.coresErradas)
      else falar('erro', conta.tipo === 'falta' ? TEXTOS.balancaTorta : TEXTOS.montarErrado)
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
      // A seguir: a página escolhe o próximo jogo (aoProxima); sem ela, outra conta aqui
      if (!acabou) depois(ESPERA_DEPOIS_DE_ACERTAR, aoProxima ?? novaRonda)
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

  const { cores, inicial } = cubinhosDaConta(conta)

  // A ajuda (ao fim de 3 s parada) mostra COMO se faz, nunca a resposta:
  // - ainda não mexeu: o gesto da conta (pôr um cubinho no prato; na
  //   subtração, tirar um)
  // - já mexeu: carregar no ✓
  // - a escolher o número: o dedo passa pela fila (sem apontar nenhum)
  const mexeu = naEsquerda !== conta.esquerdaInicial
  // Na soma, a ajuda das cores continua até o prato ter cubinhos das duas cores
  const temAsDuasCores = (porCor.azul ?? 0) > 0 && (porCor.verde ?? 0) > 0
  let gesto = null
  if (fase === 'montar' && conta.tipo === 'soma' && !temAsDuasCores) {
    // Toca 2 vezes no 1.º número (azul) e leva um cubinho azul para o prato;
    // depois o mesmo com o 2.º número (verde). Não diz quantos: mostra as cores.
    gesto = {
      chave: `cores-${ronda.numero}`,
      passos: [
        { tipo: 'tocar', em: () => parteDaConta('azul'), vezes: 2 },
        { tipo: 'arrastar', de: () => umCubinhoNoChao('azul'), para: pratoEsquerdo },
        { tipo: 'tocar', em: () => parteDaConta('verde'), vezes: 2 },
        { tipo: 'arrastar', de: () => umCubinhoNoChao('verde'), para: pratoEsquerdo },
      ],
    }
  } else if (fase === 'montar' && mexeu) {
    gesto = { chave: `ja-esta-${ronda.numero}`, tipo: 'tocar', em: botaoJaEsta }
  } else if (fase === 'montar' && conta.tipo === 'subtracao') {
    gesto = { chave: `tirar-${ronda.numero}`, tipo: 'arrastar', de: umCubinhoNoPrato, para: chao }
  } else if (fase === 'montar') {
    gesto = { chave: `por-${ronda.numero}`, tipo: 'arrastar', de: umCubinhoNoChao, para: pratoEsquerdo }
  } else if (fase === 'escolher') {
    // Toca 2 vezes num número: "carrega num destes". O número tocado é
    // sempre um ERRADO: mostra como se faz, não a resposta.
    const exemplo = ronda.opcoes.find((n) => !respostaCerta(conta, n) && !erradas.includes(n))
    gesto = {
      chave: `escolher-${ronda.numero}`,
      tipo: 'tocar',
      vezes: 2,
      em: () => document.querySelector(`[aria-label="Número ${exemplo}"]`),
    }
  }

  return (
    <>
      <DedoFantasma gesto={gesto} />
      {/* O key muda a cada ronda: os cubinhos voltam todos ao chão, noutros lugares */}
      <Mesa
        key={ronda.numero}
        cores={cores}
        inicial={inicial}
        numeroDireita={numeroDireita}
        bloqueada={fase !== 'montar'}
        festejar={fase === 'certo'}
        porCubinho={DESCIDA_POR_CUBINHO[escalao]}
        aoMudar={(quantos, cores) => {
          setNaEsquerda(quantos)
          setPorCor(cores)
          setMensagem(null) // mexeu nos cubinhos: a mascote cala-se
        }}
      />

      {/* Em cima à esquerda, numa linha: o cartão da conta e, a seguir, o ✓
          (assim o botão não fica por cima dos cubinhos do chão) */}
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
              data-parte={parte.cor ?? undefined}
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
            aria-label="Já está!"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.92 }}
          >
            <span aria-hidden="true">✓</span>
          </motion.button>
        )}
      </div>

      <BalaoMascote
        mensagem={mensagem}
        textos={mensagem ? { [mensagem.tipo]: mensagem.texto } : {}}
        className={styles.mensagemContas}
      />

      {/* 2.ª validação: os números para escolher */}
      <AnimatePresence>
        {fase !== 'montar' && (
          <motion.div
            className={styles.opcoes}
            data-opcoes
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

      {fase === 'certo' && <Festa semente={`matematica-${escalao}-${ronda.numero}`} origem={{ x: 50, y: 45 }} />}
    </>
  )
}

export default JogoContas
