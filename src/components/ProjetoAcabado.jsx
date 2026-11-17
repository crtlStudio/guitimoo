import { motion } from 'motion/react'
import { useEffect } from 'react'
import { tocarEfeito } from '../audio/efeitos'
import { comMaiuscula } from '../games/progresso/textos'
import Festa from './Festa'
import ImagemProjeto from './ImagemProjeto'
import { useMascoteAtiva } from './useProgresso'
import styles from './ProjetoAcabado.module.css'

/**
 * A grande festa: o projeto da mascote ficou completo!
 * Aparece por cima do ecrã de fim de jogo; "Boa!" fecha-a.
 * (O projeto seguinte já começou, com as peças da reserva lá dentro.)
 *
 * Props:
 * - vez: muda a cada projeto acabado (para a festa repetir)
 * - aoFechar: função do botão "Boa!"
 */
function ProjetoAcabado({ vez, aoFechar }) {
  const mascote = useMascoteAtiva()

  useEffect(() => {
    tocarEfeito('festa')
  }, [vez])

  if (!mascote) return null

  return (
    <div className={styles.fundo}>
      <Festa semente={`projeto-${vez}`} origem={{ x: 50, y: 45 }} />
      <Festa semente={`projeto-b-${vez}`} origem={{ x: 30, y: 60 }} />
      <Festa semente={`projeto-c-${vez}`} origem={{ x: 70, y: 60 }} />

      <motion.div
        className={styles.cartao}
        role="dialog"
        aria-labelledby="projeto-titulo"
        initial={{ opacity: 0, scale: 0.4, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
      >
        <div className={styles.imagens} aria-hidden="true">
          <motion.span
            className={styles.mascote}
            animate={{ y: [0, -14, 0, -10, 0], rotate: [0, -8, 8, 0, 0] }}
            transition={{ duration: 1.2, delay: 0.4, repeat: Infinity, repeatDelay: 1.2 }}
          >
            {mascote.emoji}
          </motion.span>
          <motion.span
            className={styles.projeto}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <ImagemProjeto mascote={mascote} className={styles.projetoImagem} decorativa />
          </motion.span>
        </div>

        <h2 id="projeto-titulo" className={styles.titulo}>
          {comMaiuscula(mascote.chamada)} acabou {mascote.projeto}! 🎉
        </h2>
        <p className={styles.frase}>Obrigado pela ajuda! Vamos começar {mascote.proximoProjeto}?</p>

        <motion.button
          type="button"
          className={styles.boa}
          onClick={aoFechar}
          whileTap={{ scale: 0.92 }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          autoFocus
        >
          Boa!
        </motion.button>
      </motion.div>
    </div>
  )
}

export default ProjetoAcabado
