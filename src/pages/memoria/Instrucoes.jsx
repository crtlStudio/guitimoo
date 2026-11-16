import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import styles from './Instrucoes.module.css'

// O objetivo de cada jogo, em frases curtas (um adulto pode ler em voz alta)
const JOGOS = {
  '3-4': {
    titulo: 'Que som é este?',
    frase: 'Ouve o som. Toca na imagem certa! Podes ouvir outra vez no 🔊.',
  },
  '5-6': {
    titulo: 'Repete os sons que ouviste!',
    frase: 'As imagens acendem enquanto os sons tocam. Depois toca nelas pela mesma ordem.',
  },
  '7-8': {
    titulo: 'Repete os sons que ouviste!',
    frase: 'Sequências compridas e sons parecidos. Às vezes é ao contrário ⬅️: do último para o primeiro!',
  },
}

const IMAGENS_DEMO = ['🐶', '🌊', '🔔', '🐸']

/** Demonstração dos 3–4: o 🔊 toca e depois a imagem certa fica verde. */
function DemoEscolher({ passo }) {
  const momento = passo % 4 // 0-1: a ouvir; 2: acertou; 3: pausa
  return (
    <div className={styles.demo} aria-hidden="true">
      <motion.span
        className={styles.altifalante}
        animate={{ scale: momento < 2 ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.6 }}
      >
        {momento < 2 ? '🔊' : '🔈'}
      </motion.span>
      <span className={styles.seta}>→</span>
      {IMAGENS_DEMO.slice(0, 3).map((emoji, i) => (
        <motion.span
          key={emoji}
          className={`${styles.mini} ${momento === 2 && i === 0 ? styles.miniCerto : ''}`}
          animate={{ scale: momento === 2 && i === 0 ? [1, 1.2, 1] : 1 }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  )
}

/**
 * Demonstração dos 5–6 e 7–8: as imagens acendem pela ordem (👂 a ouvir) e
 * depois o dedo toca nelas pela mesma ordem (👆 a tua vez). Nos 7–8, uma vez
 * sim, outra não, a vez da criança é ao contrário.
 */
function DemoSequencia({ escalao, passo }) {
  const sequencia = [1, 3, 0] // índices das imagens: 🌊 → 🐸 → 🐶
  const voltas = Math.floor(passo / 7)
  const momento = passo % 7 // 0-2: ouvir; 3-5: repetir; 6: pausa
  const aoContrario = escalao === '7-8' && voltas % 2 === 1
  const aRepetir = aoContrario ? [...sequencia].reverse() : sequencia

  let acesa = null
  let tocada = null
  if (momento < 3) acesa = sequencia[momento]
  else if (momento < 6) tocada = aRepetir[momento - 3]

  let legenda = '👂 Ouve'
  if (momento >= 3) legenda = aoContrario ? '⬅️ Ao contrário' : '👆 Agora tu'

  return (
    <div className={styles.demo} aria-hidden="true">
      <span className={`${styles.legenda} ${aoContrario && momento >= 3 ? styles.legendaContrario : ''}`}>
        {legenda}
      </span>
      {IMAGENS_DEMO.map((emoji, i) => (
        <motion.span
          key={emoji}
          className={`${styles.mini} ${acesa === i ? styles.miniAcesa : ''} ${tocada === i ? styles.miniCerto : ''}`}
          animate={{ scale: acesa === i || tocada === i ? 1.18 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          {emoji}
          {tocada === i && <span className={styles.dedo}>👆</span>}
        </motion.span>
      ))}
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
    const intervalo = setInterval(() => setPasso((p) => p + 1), 750)
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

      {escalao === '3-4' ? <DemoEscolher passo={passo} /> : <DemoSequencia escalao={escalao} passo={passo} />}

      <p className={styles.nota}>Sem pressa! Se errares, ouves outra vez 🔊</p>

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
