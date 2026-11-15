import { motion } from 'motion/react'
import { ESTRELAS_POR_CERTA, ESTRELAS_POR_JOGO } from '../games/estrelas'
import Festa from './Festa'
import styles from './FimDeJogo.module.css'

/**
 * Ecrã de fim de jogo (jogo ganho!), por cima do jogo, com as contas das
 * estrelas e um botão para jogar outra vez. Igual em todas as mascotes.
 *
 * Props:
 * - placar: o placar do jogo que acabou (de useJogo)
 * - mascote: o emoji da mascote (ex.: '🐼')
 * - aoJogarOutraVez: função do botão "Jogar outra vez"
 * - aoMudarIdade: função do botão "Mudar idade" (volta à escolha das idades)
 */
function FimDeJogo({ placar, mascote, aoJogarOutraVez, aoMudarIdade }) {
  const deCertas = placar.certas * ESTRELAS_POR_CERTA
  const perfeito = placar.certas === placar.perguntas

  // As linhas aparecem uma a seguir à outra
  const linha = (i) => ({
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: 0.3 + i * 0.35 },
  })

  return (
    <div className={styles.fundo}>
      <Festa semente={`fim-${placar.estrelas}-${placar.certas}`} origem={{ x: 50, y: 40 }} />

      <motion.div
        className={styles.cartao}
        role="dialog"
        aria-labelledby="fim-titulo"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      >
        <h2 id="fim-titulo" className={styles.titulo}>
          <motion.span
            className={styles.mascote}
            aria-hidden="true"
            animate={{ y: [0, -10, 0, -6, 0], rotate: [0, -10, 10, 0, 0] }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {mascote}
          </motion.span>
          {perfeito ? 'Perfeito! Jogo ganho!' : 'Jogo ganho!'}
        </h2>

        <ul className={styles.contas}>
          <motion.li {...linha(0)}>
            <span>
              ✅ {placar.certas} {placar.certas === 1 ? 'certa' : 'certas'} à primeira × {ESTRELAS_POR_CERTA}
            </span>
            <strong>{deCertas} ⭐</strong>
          </motion.li>
          <motion.li {...linha(1)}>
            <span>🏆 Jogo ganho</span>
            <strong>+{ESTRELAS_POR_JOGO} ⭐</strong>
          </motion.li>
          <motion.li className={styles.soma} {...linha(2)}>
            <span>Neste jogo</span>
            <motion.strong
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.3, 1] }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              {placar.estrelas} ⭐
            </motion.strong>
          </motion.li>
        </ul>

        <div className={styles.botoes}>
          {/* Volta à escolha das idades */}
          <motion.button
            type="button"
            className={styles.mudarIdade}
            onClick={aoMudarIdade}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            whileTap={{ scale: 0.93 }}
          >
            Mudar idade
          </motion.button>

          <motion.button
            type="button"
            className={styles.outraVez}
            onClick={aoJogarOutraVez}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: [1, 1.05, 1] }}
            transition={{
              opacity: { delay: 1.3 },
              scale: { delay: 1.3, duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileTap={{ scale: 0.93 }}
          >
            Jogar outra vez
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default FimDeJogo
