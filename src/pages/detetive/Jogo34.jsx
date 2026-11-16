import { AnimatePresence, motion } from 'motion/react'
import { perguntaFacil } from '../../games/detetive/regras'
import EscolherPessoa from './EscolherPessoa'
import Lupa from './Lupa'
import { usePergunta } from './usePergunta'
import styles from './Jogo34.module.css'

/**
 * Nível fácil (3–4): "De quem é isto?"
 * Na lupa aparece um objeto (a pista); em baixo, 3 pessoas. A criança
 * toca em quem usa aquele objeto. Sem nada para ler.
 * Props: aoAcertar() e aoErrar() — avisam a página (sons e estrelas)
 */
function Jogo34({ aoAcertar, aoErrar }) {
  const { pergunta, resposta, numero, tocar } = usePergunta('3-4', perguntaFacil, aoAcertar, aoErrar)

  if (!pergunta) return null // ainda a ler do telemóvel

  return (
    <>
      {/* A lupa com a pista, ao centro em cima */}
      <AnimatePresence mode="wait">
        <motion.div
          key={numero}
          className={styles.sitioDaLupa}
          initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.4 }}
          transition={{ type: 'spring', stiffness: 240, damping: 16 }}
        >
          <Lupa className={styles.lupa}>
            <span role="img" aria-label="A pista">
              {pergunta.pista}
            </span>
          </Lupa>
        </motion.div>
      </AnimatePresence>

      <EscolherPessoa
        opcoes={pergunta.opcoes}
        resposta={resposta}
        pista={pergunta.pista}
        numero={numero}
        aoTocar={tocar}
      />
    </>
  )
}

export default Jogo34
