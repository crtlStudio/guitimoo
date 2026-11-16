import { motion } from 'motion/react'
import styles from './Lupa.module.css'

/**
 * Uma lupa de detetive (vidro redondo com cabo) com uma coisa lá dentro
 * (a pista). O vidro abana devagar, como se o detetive estivesse a procurar.
 *
 * Props:
 * - children: o que se vê pela lupa (ex.: o emoji da pista)
 * - className: o tamanho e a posição
 * - quieta: sem o abanar (ex.: na demonstração)
 */
function Lupa({ children, className = '', quieta = false }) {
  return (
    <motion.div
      className={`${styles.lupa} ${className}`}
      animate={quieta ? undefined : { rotate: [0, -4, 3, -2, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className={styles.cabo} aria-hidden="true" />
      <span className={styles.vidro}>{children}</span>
    </motion.div>
  )
}

export default Lupa
