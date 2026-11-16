import { motion } from 'motion/react'
import styles from './Instrucoes.module.css'

// O objetivo de cada jogo: título, frase curta e a demonstração animada.
// - letras: as letras da demonstração
// - certas: posições das letras que o dedo toca/arrasta
// - gesto: 'toque' (tocar numa letra) ou 'arrasto' (arrastar o dedo)
// - setas: direções em que as palavras podem estar (só 7–8)
const JOGOS = {
  '3-4': {
    titulo: 'Encontra a letra!',
    frase: 'Olha para a letra do balão. Toca na letra igual!',
    letras: ['B', 'G', 'M'],
    certas: [1],
    gesto: 'toque',
  },
  '5-6': {
    titulo: 'Encontra a palavra!',
    frase: 'Procura a palavra na sopa de letras e arrasta o dedo por cima dela.',
    emoji: '🐱',
    letras: ['X', 'G', 'A', 'T', 'O', 'M'],
    certas: [1, 2, 3, 4],
    gesto: 'arrasto',
  },
  '7-8': {
    titulo: 'Encontra 3 palavras!',
    // As direções aparecem nas setas, ao lado da demonstração
    frase: 'Estão escondidas em várias direções. Arrasta o dedo por cima de cada uma.',
    letras: ['X', 'G', 'A', 'T', 'O', 'M'],
    certas: [1, 2, 3, 4],
    gesto: 'arrasto',
    setas: ['→', '↓', '↘', '↗'],
  },
}

// Medidas da demonstração, em cqw (1% da largura da imagem)
const CAIXA = 5.4
const ESPACO = 0.8
const DURACAO = 2.6 // segundos de cada repetição

/** Posição (em cqw) do centro da caixa i, onde o dedo deve estar. */
const centroDaCaixa = (i) => i * (CAIXA + ESPACO) + CAIXA / 2

/**
 * Demonstração animada: um dedo toca ou arrasta por cima das letras certas,
 * que ficam verdes, e repete sem parar.
 */
function Demonstracao({ letras, certas, gesto }) {
  const primeira = certas[0]
  const ultima = certas.at(-1)

  // Momentos da animação, de 0 (início) a 1 (fim de cada repetição)
  const pousa = 0.25 // o dedo chega à primeira letra
  const chega = gesto === 'arrasto' ? 0.65 : pousa // o dedo chega à última letra
  const apaga = 0.92 // as letras voltam ao normal

  // Quando cada letra certa fica verde (no arrasto, uma a seguir à outra)
  const momentoDaLetra = (i) => {
    if (gesto === 'toque') return pousa + 0.05
    const ordem = certas.indexOf(i)
    return pousa + ((chega - pousa) * ordem) / Math.max(1, certas.length - 1) + 0.02
  }

  const repetir = { duration: DURACAO, repeat: Infinity, ease: 'easeInOut' }

  return (
    <div className={styles.demo} aria-hidden="true">
      <div className={styles.fila}>
        {letras.map((letra, i) => {
          const certa = certas.includes(i)
          const t = certa ? momentoDaLetra(i) : 0
          return (
            <motion.span
              key={i}
              className={styles.letra}
              animate={
                certa
                  ? {
                      backgroundColor: ['#fff3cf', '#fff3cf', '#7ed957', '#7ed957', '#fff3cf'],
                      color: ['#5a3912', '#5a3912', '#ffffff', '#ffffff', '#5a3912'],
                    }
                  : undefined
              }
              transition={certa ? { ...repetir, ease: 'linear', times: [0, t, t + 0.03, apaga, 1] } : undefined}
            >
              {letra}
            </motion.span>
          )
        })}
      </div>

      {/* O dedo: entra, pousa na primeira letra, arrasta até à última e sai */}
      <motion.span
        className={styles.dedo}
        animate={{
          x: [
            `${centroDaCaixa(primeira) - 3}cqw`,
            `${centroDaCaixa(primeira)}cqw`,
            `${centroDaCaixa(ultima)}cqw`,
            `${centroDaCaixa(ultima)}cqw`,
            `${centroDaCaixa(primeira) - 3}cqw`,
          ],
          y: ['3cqw', '0cqw', '0cqw', '0cqw', '3cqw'],
          scale: [1, 0.85, 0.85, 1, 1],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{ ...repetir, times: [0, pousa, chega, apaga, 1] }}
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

  return (
    <motion.div
      className={styles.cartao}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <h2 className={styles.titulo}>{jogo.titulo}</h2>
      <p className={styles.frase}>{jogo.frase}</p>

      <div className={styles.exemplo}>
        {jogo.emoji && (
          <span className={styles.emoji} aria-hidden="true">
            {jogo.emoji}
          </span>
        )}
        <Demonstracao letras={jogo.letras} certas={jogo.certas} gesto={jogo.gesto} />
        {jogo.setas && (
          <p className={styles.setas} aria-label="Podem estar para o lado, para baixo ou na diagonal">
            {jogo.setas.map((seta) => (
              <span key={seta} className={styles.seta} aria-hidden="true">
                {seta}
              </span>
            ))}
          </p>
        )}
      </div>

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
