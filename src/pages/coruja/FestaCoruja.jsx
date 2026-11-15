import { motion } from 'motion/react'
import styles from './FestaCoruja.module.css'

// Penas que caem enquanto a Coruja bate as asas: de onde saem (em cqw,
// a partir do centro da coruja), para onde vão e quanto rodam
const PENAS = [
  { x: -6, ate: -11, rodar: -160, atraso: 0.1 },
  { x: 5, ate: 10, rodar: 140, atraso: 0.25 },
  { x: -2, ate: -5, rodar: 200, atraso: 0.45 },
  { x: 3, ate: 6, rodar: -120, atraso: 0.6 },
]

// O bater das asas: sobe, desce, sobe, desce... (graus de rotação)
const BATER = [0, 95, 20, 95, 20, 95, 20, 0]

/** Uma asa desenhada em SVG, com as mesmas cores castanhas da Coruja. */
function Asa() {
  return (
    <svg viewBox="0 0 60 100" className={styles.desenho} aria-hidden="true">
      {/* Forma da asa: larga no ombro, a afinar até à ponta */}
      <path d="M50 4 C 20 10, 4 40, 8 96 C 22 80, 40 70, 58 30 Z" fill="#8b5a2b" />
      {/* Penas mais claras */}
      <path d="M48 14 C 26 22, 16 46, 16 78 C 28 64, 40 52, 52 30 Z" fill="#c8955a" />
      <path d="M14 60 L 30 52 M 12 74 L 26 66 M 18 44 L 34 40" stroke="#6b4220" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/**
 * A Coruja festeja: aparecem duas asas dos lados do corpo dela (que está
 * pintado na imagem de fundo) a bater, e caem penas 🪶.
 * Mostra-se uma vez cada vez que aparece (o `key` na página faz repetir).
 */
function FestaCoruja() {
  return (
    <div className={styles.festa} aria-hidden="true">
      {/* Asa esquerda: o ombro é o canto de cima à direita; roda para cima */}
      <motion.div
        className={`${styles.asa} ${styles.esquerda}`}
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: BATER, opacity: [0, 1, 1, 1, 1, 1, 1, 0] }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      >
        <Asa />
      </motion.div>

      {/* Asa direita: igual, mas ao espelho */}
      <motion.div
        className={`${styles.asa} ${styles.direita}`}
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: BATER.map((g) => -g), opacity: [0, 1, 1, 1, 1, 1, 1, 0] }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      >
        <Asa />
      </motion.div>

      {/* Penas a cair, a baloiçar */}
      {PENAS.map((p, i) => (
        <motion.span
          key={i}
          className={styles.pena}
          initial={{ x: `${p.x}cqw`, y: '0cqw', rotate: 0, opacity: 0 }}
          animate={{
            x: [`${p.x}cqw`, `${p.ate}cqw`, `${p.ate * 0.7}cqw`],
            y: ['0cqw', '7cqw', '14cqw'],
            rotate: [0, p.rodar / 2, p.rodar],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.6, delay: p.atraso, ease: 'easeOut' }}
        >
          🪶
        </motion.span>
      ))}
    </div>
  )
}

export default FestaCoruja
