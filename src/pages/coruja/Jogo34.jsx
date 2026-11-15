import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import BalaoMascote from '../../components/BalaoMascote'
import { guardarSaco, lerProgresso, registarRonda } from '../../games/coruja/memoria'
import { TENTATIVAS, regrasDoNivel } from '../../games/coruja/regras'
import { sortearPergunta34 } from '../../games/coruja/sorteio'
import { pararSons, prepararSons, tocarSom } from '../../games/coruja/tocador'
import CartaoSom from './CartaoSom'
import styles from './Jogo34.module.css'

const ESCALAO = '3-4'
const ESPERA_ANTES_DO_SOM = 700 // ms: dá tempo de ver as imagens antes de ouvir
const ESPERA_DEPOIS_DE_ACERTAR = 2000 // ms a festejar antes da pergunta seguinte
const TEMPO_A_ABANAR = 700 // ms que o cartão errado fica a abanar

/**
 * 3–4 anos: a Coruja toca um som e a criança escolhe a imagem certa entre 3.
 * Ao errar, a Coruja anima e volta a tocar o som (a pergunta fica a mesma
 * até acertar). Botão grande para ouvir outra vez.
 *
 * Props: aoAcertar() e aoErrar() — avisam a página (sons, estrelas e a festa da Coruja)
 */
function Jogo34({ aoAcertar, aoErrar }) {
  const progresso = useRef(null) // { nivel, certasSeguidas, saco }
  const [pergunta, setPergunta] = useState(null) // { certo, opcoes }
  const [aTocar, setATocar] = useState(false) // true enquanto o som toca
  const [errado, setErrado] = useState(null) // id do cartão que está a abanar
  const [resolvida, setResolvida] = useState(false)
  const [mensagem, setMensagem] = useState(null)
  const erros = useRef(0) // erros nesta pergunta
  const temporizadores = useRef([])

  /** Agenda uma função para daqui a `ms` (e lembra-se dela para a cancelar ao sair). */
  function depois(ms, funcao) {
    temporizadores.current.push(setTimeout(funcao, ms))
  }

  async function ouvir(id) {
    setATocar(true)
    await tocarSom(id)
    setATocar(false)
  }

  function novaPergunta() {
    const p = progresso.current
    const { dificil } = regrasDoNivel(ESCALAO, p.nivel)
    const sorteio = sortearPergunta34(p.saco, dificil)
    progresso.current = guardarSaco(ESCALAO, p, sorteio.saco)

    prepararSons(sorteio.opcoes)
    setPergunta({ certo: sorteio.certo, opcoes: sorteio.opcoes })
    setResolvida(false)
    setErrado(null)
    setMensagem(null)
    erros.current = 0

    // Bloqueia já os cartões e toca o som depois de um instante
    setATocar(true)
    depois(ESPERA_ANTES_DO_SOM, () => ouvir(sorteio.certo))
  }

  // Ao começar: lê o progresso guardado e faz a primeira pergunta.
  // Ao sair (desmontar): cancela temporizadores e cala os sons.
  useEffect(() => {
    let ativo = true
    const pendentes = temporizadores.current // a mesma lista até ao fim
    lerProgresso(ESCALAO).then((p) => {
      if (!ativo) return
      progresso.current = p
      novaPergunta()
    })
    return () => {
      ativo = false
      pendentes.forEach(clearTimeout)
      pararSons()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só uma vez, ao começar
  }, [])

  function escolher(id) {
    if (aTocar || resolvida) return

    if (id === pergunta.certo) {
      setResolvida(true)
      progresso.current = registarRonda(ESCALAO, progresso.current, true)
      setMensagem((m) => ({ tipo: 'fim', vez: (m?.vez ?? 0) + 1 }))
      const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
      if (!acabou) depois(ESPERA_DEPOIS_DE_ACERTAR, novaPergunta)
      return
    }

    // Errou: sem castigo. O cartão abana, a Coruja anima e o som toca outra vez.
    aoErrar?.()
    erros.current += 1
    if (erros.current === TENTATIVAS) {
      // Só à 2.ª falha conta para a dificuldade (e só uma vez por pergunta)
      progresso.current = registarRonda(ESCALAO, progresso.current, false)
    }
    setErrado(id)
    setMensagem((m) => ({ tipo: 'erro', vez: (m?.vez ?? 0) + 1 }))
    setATocar(true)
    depois(TEMPO_A_ABANAR, () => {
      setErrado(null)
      ouvir(pergunta.certo)
    })
  }

  if (!pergunta) return null

  return (
    <>
      <div className={styles.zona}>
        <motion.button
          type="button"
          className={styles.ouvir}
          onClick={() => ouvir(pergunta.certo)}
          disabled={aTocar || resolvida}
          aria-label="Ouvir outra vez"
          // Enquanto o som toca, o botão "pulsa" ao ritmo do som
          animate={aTocar ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={aTocar ? { duration: 0.6, repeat: Infinity } : {}}
          whileTap={{ scale: 0.92 }}
        >
          <span className={styles.altifalante} aria-hidden="true">
            {aTocar ? '🔊' : '🔈'}
          </span>
          {aTocar ? 'A ouvir…' : 'Ouvir outra vez'}
        </motion.button>

        <p className={styles.pergunta}>Que som é este?</p>

        <div className={styles.opcoes}>
          {pergunta.opcoes.map((id) => (
            <div key={id} className={styles.lugar}>
              <CartaoSom
                id={id}
                // Depois de acertar, o cartão certo fica bem visível (não apagado)
                bloqueado={aTocar || (resolvida && id !== pergunta.certo)}
                estado={resolvida && id === pergunta.certo ? 'certo' : errado === id ? 'errado' : null}
                aoTocar={escolher}
              />
            </div>
          ))}
        </div>
      </div>

      <BalaoMascote
        emoji="🦉"
        mensagem={mensagem}
        textos={{ erro: 'Quase! Vamos ouvir outra vez', fim: 'Boa! Ouviste bem!' }}
        className={styles.mensagem}
      />
    </>
  )
}

export default Jogo34
