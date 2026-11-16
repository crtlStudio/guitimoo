import { motion } from 'motion/react'
import { somDoId } from '../../games/memoria/sorteio'
import styles from './CartaoSom.module.css'

/**
 * Cartão grande com a imagem (emoji) e o nome de um som.
 *
 * Props:
 * - id: o id do som (ex.: 'cao')
 * - aceso: true enquanto o som deste cartão está a tocar (brilha e cresce)
 * - bloqueado: true enquanto o jogo toca a sequência (não aceita toques)
 * - estado: null, 'certo' (fica verde com ✓) ou 'errado' (abana)
 * - aoTocar(id): chamado quando a criança toca no cartão
 */
function CartaoSom({ id, aceso = false, bloqueado = false, estado = null, aoTocar }) {
  const som = somDoId(id)

  // Cada "estado" do cartão corresponde a uma animação diferente
  let animacao = { scale: 1, rotate: 0 }
  if (aceso) animacao = { scale: 1.12, rotate: 0 }
  if (estado === 'certo') animacao = { scale: [1, 1.15, 1], rotate: 0 }
  if (estado === 'errado') animacao = { scale: 1, rotate: [0, -6, 6, -4, 4, 0] }

  const classes = [
    styles.cartao,
    aceso && styles.aceso,
    bloqueado && !aceso && styles.emEspera,
    estado === 'certo' && styles.certo,
    estado === 'errado' && styles.errado,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.button
      type="button"
      className={classes}
      // Enquanto está bloqueado o toque é ignorado (e o leitor de ecrã sabe disso)
      aria-disabled={bloqueado}
      // Sem o som de "toque": o cartão já toca o seu próprio som (ver audio/efeitos.js)
      data-sem-toque
      aria-label={som.nome}
      onClick={() => {
        if (!bloqueado) aoTocar?.(id)
      }}
      animate={animacao}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      whileTap={bloqueado ? undefined : { scale: 0.92 }}
    >
      <span className={styles.emoji} aria-hidden="true">
        {som.emoji}
      </span>
      <span className={styles.nome}>{som.nome}</span>

      {estado === 'certo' && (
        <motion.span
          className={styles.visto}
          aria-hidden="true"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          ✓
        </motion.span>
      )}
    </motion.button>
  )
}

export default CartaoSom
