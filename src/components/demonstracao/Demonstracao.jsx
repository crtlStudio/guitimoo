import { motion } from 'motion/react'
import { useState } from 'react'
import styles from './Demonstracao.module.css'

// ============================================================
// As peças das instruções com demonstrações (Matemática, Português, ...):
// o cartão com os painéis, a cena, o dedo e o ✓. Cada jogo só escreve as
// suas cenas e os seus passos (ver passos.js).
// ============================================================

/**
 * O dedo (igual ao dedo fantasma dos jogos): vai até `dedo` ([x, y] em cqw
 * da cena), carrega `toca` vezes e pode levar alguma coisa.
 * - tamanho: tamanho do dedo, em cqw da cena
 * - desenharLevado(leva): desenha o que o dedo leva (cada jogo tem o seu)
 */
export function Dedo({ estado, tamanho, desenharLevado }) {
  const { dedo, ultimoDedo, toca, leva, vez } = estado
  const ponto = dedo ?? ultimoDedo
  if (!ponto) return null
  // Carregar: o dedo encolhe e volta, `toca` vezes
  const carregar = toca > 0 ? { scale: [1, ...Array(toca).fill([0.78, 1]).flat()] } : { scale: 1 }

  return (
    <motion.div
      className={styles.dedo}
      style={{ fontSize: `${tamanho}cqw` }}
      initial={{ left: `${ponto[0]}cqw`, top: `${ponto[1] + 8}cqw`, opacity: 0 }}
      animate={{ left: `${ponto[0]}cqw`, top: `${ponto[1]}cqw`, opacity: dedo ? 1 : 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {leva != null && desenharLevado?.(leva)}
      <motion.span key={vez} className={styles.mao} animate={carregar} transition={{ duration: 0.35 * Math.max(toca, 1) }}>
        👆
      </motion.span>
    </motion.div>
  )
}

/** O ✓ verde que salta quando a demonstração fica certa (x, y = o centro, em cqw). */
export function Visto({ x, y }) {
  return (
    <motion.span
      className={styles.visto}
      style={{ left: `${x}cqw`, top: `${y}cqw` }}
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.4, 1] }}
      transition={{ duration: 0.5 }}
    >
      ✓
    </motion.span>
  )
}

/** Uma cena com as suas medidas: lá dentro, 1cqw = 1% da largura da cena (100 × 63). */
export function Cena({ children }) {
  return (
    <div className={styles.cena} aria-hidden="true">
      {children}
    </div>
  )
}

/**
 * Ecrã com o objetivo do jogo, antes de começar. Só desenhos (as crianças
 * mais pequenas não sabem ler): os jogos lado a lado e, um de cada vez,
 * o dedo mostra como se joga. O painel que está a mostrar fica maior.
 * Props:
 * - titulo: o nome do jogo
 * - demos: os componentes das demonstrações (recebem escalao, aCorrer e aoAcabar)
 * - escalao ('3-4', '5-6', '7-8') e aoComecar (função do botão)
 * - largura: largura do cartão, em cqw da página (menos painéis = mais estreito)
 */
export function InstrucoesEmPaineis({ titulo, demos, escalao, aoComecar, largura = 90 }) {
  const [ativo, setAtivo] = useState(0) // o painel onde o dedo está a mostrar
  const [volta, setVolta] = useState(0) // muda a cada demonstração: recomeça do zero
  const mostrar = (n) => {
    setAtivo(n)
    setVolta((v) => v + 1)
  }

  return (
    <motion.div
      className={styles.cartao}
      style={{ width: `${largura}cqw` }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <h2 className={styles.titulo}>{titulo}</h2>

      <div className={styles.paineis} style={{ gridTemplateColumns: `repeat(${demos.length}, 1fr)` }}>
        {demos.map((Demo, n) => {
          const aMostrar = n === ativo
          return (
            <motion.div
              key={n}
              className={`${styles.painel} ${aMostrar ? styles.painelAtivo : ''}`}
              animate={{ scale: aMostrar ? 1.06 : 0.94, opacity: aMostrar ? 1 : 0.55 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              // Tocar num painel mostra esse jogo
              onClick={() => mostrar(n)}
            >
              <Demo
                key={aMostrar ? `a-${volta}` : 'parado'}
                escalao={escalao}
                aCorrer={aMostrar}
                aoAcabar={() => mostrar((n + 1) % demos.length)}
              />
            </motion.div>
          )
        })}
      </div>

      <motion.button
        type="button"
        className={styles.comecar}
        onClick={aoComecar}
        aria-label="Vamos jogar!"
        whileTap={{ scale: 0.93 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className={styles.play} aria-hidden="true">
          ▶
        </span>
        Vamos jogar!
      </motion.button>
    </motion.div>
  )
}
