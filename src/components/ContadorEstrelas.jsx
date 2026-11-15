import { AnimatePresence, motion } from 'motion/react'
import { useSyncExternalStore } from 'react'
import { inscrever, totalAtual } from '../games/estrelas'
import styles from './ContadorEstrelas.module.css'

/**
 * Contador de estrelas, em cima ao centro: o total de todos os jogos
 * (guardado no telemóvel) e as bolinhas das perguntas deste jogo.
 *
 * Props:
 * - placar: o placar do jogo atual (de useJogo), para as bolinhas
 * - ganho: { quantas, vez } — quando muda, aparece um "+5" a subir
 * - naColuna: true = em vez de ficar em cima ao centro, ocupa a largura do
 *   sítio onde está (ex.: por baixo das palavras do Panda, para não tapar a grelha)
 */
function ContadorEstrelas({ placar, ganho, naColuna = false }) {
  // useSyncExternalStore: o componente "inscreve-se" no total de estrelas
  // e volta a desenhar-se sozinho sempre que o total muda
  const total = useSyncExternalStore(inscrever, totalAtual)

  return (
    <div className={`${styles.contador} ${naColuna ? styles.naColuna : ''}`} aria-live="polite">
      <motion.span
        key={total} // muda a cada estrela ganha: a estrela dá um pulo
        className={styles.estrela}
        aria-hidden="true"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.5, 1], rotate: [0, -20, 0] }}
        transition={{ duration: 0.5 }}
      >
        ⭐
      </motion.span>
      <span className={styles.total} aria-label={`${total} estrelas`}>
        {total}
      </span>

      {/* As perguntas deste jogo: cheia = já respondida */}
      {placar && (
        <span className={styles.perguntas} aria-label={`Pergunta ${Math.min(placar.feitas + 1, placar.perguntas)} de ${placar.perguntas}`}>
          {Array.from({ length: placar.perguntas }, (_, i) => (
            <span
              key={i}
              className={`${styles.pergunta} ${i < placar.feitas ? styles.feita : ''} ${i === placar.feitas && placar.errouNesta ? styles.atualErrada : ''}`}
            />
          ))}
        </span>
      )}

      {/* "+5 ⭐" grande: salta para o ecrã, fica um bocadinho e voa para o contador */}
      <AnimatePresence>
        {ganho && (
          <motion.span
            key={ganho.vez}
            className={styles.mais}
            aria-hidden="true"
            initial={{ opacity: 0, y: 30, scale: 0.2, rotate: -15 }}
            animate={{
              opacity: [0, 1, 1, 1, 0],
              y: [30, 0, 0, 0, -40],
              scale: [0.2, 1.4, 1, 1, 0.4],
              rotate: [-15, 8, 0, 0, 0],
            }}
            transition={{ duration: 2, times: [0, 0.18, 0.3, 0.75, 1], ease: 'easeOut' }}
          >
            +{ganho.quantas}
            <motion.span
              className={styles.maisEstrela}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              ⭐
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ContadorEstrelas
