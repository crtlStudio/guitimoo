import { motion } from 'motion/react'
import styles from './Caminho.module.css'

/**
 * Caminho na relva: a tartaruga avança uma pedra por cada resposta certa
 * até chegar à bandeira (a meta).
 *
 * Props:
 * - passos: quantas pedras já andou (0 = no início)
 * - total: quantas pedras até à meta
 */
function Caminho({ passos, total }) {
  // Posição da tartaruga, em % do caminho (0% = início, 100% = meta)
  const posicao = (Math.min(passos, total) / total) * 100

  return (
    <div className={styles.caminho} aria-label={`Caminho: ${passos} de ${total}`} role="img">
      <div className={styles.trilho}>
        {/* Pedras do caminho; as já percorridas ficam douradas */}
        {Array.from({ length: total + 1 }, (_, i) => (
          <span
            key={i}
            className={`${styles.pedra} ${i <= passos ? styles.pisada : ''}`}
            style={{ left: `${(i / total) * 100}%` }}
          />
        ))}

        <span className={styles.meta} style={{ left: '100%' }} aria-hidden="true">
          🏁
        </span>

        {/* A tartaruga: desliza até à pedra nova e dá um saltinho */}
        <motion.span
          className={styles.tartaruga}
          initial={false}
          animate={{ left: `${posicao}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          aria-hidden="true"
        >
          <motion.span
            key={passos}
            className={styles.salto}
            initial={{ y: 0 }}
            animate={{ y: passos > 0 ? ['0cqw', '-1.6cqw', '0cqw'] : '0cqw' }}
            transition={{ duration: 0.45 }}
          >
            🐢
          </motion.span>
        </motion.span>
      </div>
    </div>
  )
}

export default Caminho
