import { useDraggable } from '@dnd-kit/core'
import { motion } from 'motion/react'
import imagemAzul from '../../assets/sapo/sapinho_azul.png'
import imagemLaranja from '../../assets/sapo/sapinho_laranja.png'
import imagemVerde from '../../assets/sapo/sapinho.png'
import styles from './Sapinho.module.css'

/** A imagem de cada cor de sapinho. */
const IMAGENS = { verde: imagemVerde, laranja: imagemLaranja, azul: imagemAzul }

/**
 * Um sapinho que se pode arrastar (com o dedo ou com o rato).
 *
 * Props:
 * - id: identificador único (o @dnd-kit precisa dele para saber qual se arrasta)
 * - cor: 'verde', 'laranja' ou 'azul'
 * - tamanho: largura em cqw
 * - x, y: onde fica o CENTRO dos pés (em cqw, relativo ao "pai")
 * - bloqueado: true = já não se pode arrastar
 *
 * Enquanto é arrastado, este fica invisível: quem segue o dedo é a cópia
 * do <DragOverlay> (ver Sapo.jsx), que fica por cima de tudo.
 */
function Sapinho({ id, cor = 'verde', tamanho, x, y, bloqueado = false }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id, disabled: bloqueado })

  return (
    <motion.img
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      // Sem o som de "toque" ao agarrar: o sapinho tem os seus sons (ver Sapo.jsx)
      data-sem-toque
      aria-label={`Sapinho ${cor}`}
      className={styles.sapinho}
      src={IMAGENS[cor]}
      alt=""
      draggable="false"
      style={{
        left: `${x - tamanho / 2}cqw`,
        top: `${y - tamanho}cqw`,
        width: `${tamanho}cqw`,
        opacity: isDragging ? 0 : 1,
      }}
      // Ao aparecer num sítio novo, cai um bocadinho e assenta
      initial={{ y: '-2cqw', scale: 0.9 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
    />
  )
}

/** A cópia do sapinho que segue o dedo enquanto é arrastado (dentro do <DragOverlay>). */
export function SapinhoNoAr({ cor = 'verde' }) {
  return <img className={styles.noAr} src={IMAGENS[cor]} alt="" draggable="false" />
}

export default Sapinho
