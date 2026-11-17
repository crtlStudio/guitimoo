import { AnimatePresence, motion } from 'motion/react'
import CabecaMascote from './CabecaMascote'
import styles from './BalaoMascote.module.css'

const TEXTOS = {
  erro: 'Quase! Tenta outra vez',
  boa: 'Boa! Continua!',
  fim: 'Muito bem!',
}

// Como a mascote reage a cada tipo de mensagem
const REACOES = {
  erro: { rotate: [0, -18, 16, -12, 8, 0] }, // abana a cabeça, com carinho
  boa: { y: [0, -6, 0] }, // um pulinho
  fim: { y: [0, -10, 0, -7, 0], rotate: [0, -10, 10, 0, 0] }, // pulos de alegria
}

/**
 * Balão de fala da mascote escolhida pela criança (🐸, 🐼, ...), que a
 * acompanha em todos os jogos.
 *
 * Props:
 * - mensagem: null (nada) ou { tipo: 'erro' | 'boa' | 'fim', vez }
 *   (`vez` muda a cada mensagem, para a animação repetir)
 * - textos: para trocar algum texto (ex.: { fim: 'Boa!' })
 * - className: a posição do balão em cada jogo
 */
function BalaoMascote({ mensagem, textos = {}, className = '' }) {
  return (
    <AnimatePresence>
      {mensagem && (
        <motion.p
          key={`${mensagem.tipo}-${mensagem.vez ?? ''}`}
          className={`${styles.balao} ${mensagem.tipo === 'erro' ? '' : styles.feliz} ${className}`}
          role="status"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 380, damping: 20 }}
        >
          <motion.span
            className={styles.mascote}
            aria-hidden="true"
            animate={REACOES[mensagem.tipo]}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <CabecaMascote />
          </motion.span>
          {textos[mensagem.tipo] ?? TEXTOS[mensagem.tipo]}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

export default BalaoMascote
