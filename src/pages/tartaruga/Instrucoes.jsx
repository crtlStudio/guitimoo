import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import Relogio from './Relogio'
import styles from './Instrucoes.module.css'

// O objetivo de cada jogo
const JOGOS = {
  '3-4': {
    titulo: 'Ajuda a tartaruga!',
    frase: 'É de dia ou de noite? E o que vem primeiro? Toca ou arrasta as imagens.',
  },
  '5-6': {
    titulo: 'Acerta o relógio!',
    frase: 'Roda o ponteiro pequeno até à hora certa e carrega em «Já está!».',
  },
  '7-8': {
    titulo: 'Acerta o relógio!',
    frase: 'Roda o ponteiro grande: o pequeno anda sozinho. Às vezes vais ler as horas.',
  },
}

/** Demonstração dos 3–4: dia/noite e uma rotina que se ordena sozinha. */
function DemoRotina({ passo }) {
  const ordem = ['⏰', '🥣', '🏫']
  const quantas = passo % 4 // 0, 1, 2, 3 imagens já no lugar
  return (
    <div className={styles.demoRotina} aria-hidden="true">
      <span className={styles.diaNoite}>☀️ 🌙</span>
      <span className={styles.lugares}>
        {ordem.map((emoji, i) => (
          <motion.span
            key={i}
            className={styles.lugar}
            animate={{ opacity: i < quantas ? 1 : 0.25, scale: i === quantas - 1 ? [1.3, 1] : 1 }}
          >
            {i < quantas ? emoji : i + 1}
          </motion.span>
        ))}
      </span>
    </div>
  )
}

/** Demonstração com um relógio pequeno cujos ponteiros andam sozinhos. */
function DemoRelogio({ escalao, passo }) {
  // 5–6: o ponteiro das horas salta de número em número
  // 7–8: o dos minutos anda de quarto em quarto e o das horas acompanha
  const minutos = escalao === '5-6' ? passo * 60 : passo * 15
  return (
    <div className={styles.demoRelogio} aria-hidden="true">
      <Relogio
        anguloHoras={escalao === '5-6' ? passo * 30 : minutos * 0.5}
        anguloMinutos={escalao === '5-6' ? 0 : minutos * 6}
        rotulo=""
      />
      <motion.span
        className={styles.dedo}
        animate={{ rotate: [0, 12, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        👆
      </motion.span>
    </div>
  )
}

/**
 * Ecrã com o objetivo do jogo, antes de começar.
 * Props: escalao ('3-4', '5-6', '7-8') e aoComecar (função do botão).
 */
function Instrucoes({ escalao, aoComecar }) {
  const jogo = JOGOS[escalao]
  // Contador que avança sozinho, para as demonstrações se mexerem
  const [passo, setPasso] = useState(0)

  useEffect(() => {
    const intervalo = setInterval(() => setPasso((p) => p + 1), 800)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <motion.div
      className={styles.cartao}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <h2 className={styles.titulo}>{jogo.titulo}</h2>
      <p className={styles.frase}>{jogo.frase}</p>

      {escalao === '3-4' ? <DemoRotina passo={passo} /> : <DemoRelogio escalao={escalao} passo={passo} />}

      <p className={styles.caminho}>Cada resposta certa leva a tartaruga mais perto da 🏁</p>

      <motion.button
        type="button"
        className={styles.comecar}
        onClick={aoComecar}
        whileTap={{ scale: 0.93 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        autoFocus
      >
        Vamos jogar!
      </motion.button>
    </motion.div>
  )
}

export default Instrucoes
