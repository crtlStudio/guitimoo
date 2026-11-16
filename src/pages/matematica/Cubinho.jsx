import { useDraggable } from '@dnd-kit/core'
import { motion } from 'motion/react'
import cuboAmarelo from '../../assets/matematica/cubo_amarelo.webp'
import cuboAzul from '../../assets/matematica/cubo_azul.webp'
import cuboLaranja from '../../assets/matematica/cubo_laranja.webp'
import cuboVerde from '../../assets/matematica/cubo_verde.webp'
import cuboVermelho from '../../assets/matematica/cubo_vermelho.webp'
import styles from './Cubinho.module.css'

/** A imagem de cada cor de cubinho (o jogo usa o verde, o laranja e o azul). */
const IMAGENS = {
  verde: cuboVerde,
  laranja: cuboLaranja,
  azul: cuboAzul,
  amarelo: cuboAmarelo,
  vermelho: cuboVermelho,
}

/** A imagem de um cubinho, sem se poder arrastar (ex.: nas instruções). */
export function DesenhoCubinho({ cor = 'verde', className }) {
  return <img className={className} src={IMAGENS[cor] ?? cuboVerde} alt="" draggable="false" />
}

/**
 * Um cubinho que se pode arrastar (com o dedo ou com o rato).
 *
 * Props:
 * - id: identificador único (o @dnd-kit precisa dele para saber qual se arrasta)
 * - cor: 'verde', 'laranja' ou 'azul'
 * - tamanho: largura em cqw
 * - x, y: onde fica o CENTRO da base (em cqw, relativo ao "pai")
 * - bloqueado: true = já não se pode arrastar
 * - lugar: 'chao' ou 'prato' (fica em data-lugar, para o dedo fantasma o encontrar)
 *
 * Enquanto é arrastado, este fica invisível: quem segue o dedo é a cópia
 * do <DragOverlay> (ver Mesa.jsx), que fica por cima de tudo.
 */
function Cubinho({ id, cor = 'verde', tamanho, x, y, bloqueado = false, lugar }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id, disabled: bloqueado })

  return (
    <motion.img
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      // Sem o som de "toque" ao agarrar: o cubinho tem os seus sons (ver Mesa.jsx)
      data-sem-toque
      data-lugar={lugar}
      aria-label={`Cubinho ${cor}`}
      className={styles.cubinho}
      src={IMAGENS[cor] ?? cuboVerde}
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

/** A cópia do cubinho que segue o dedo enquanto é arrastado (dentro do <DragOverlay>). */
export function CubinhoNoAr({ cor = 'verde' }) {
  return <DesenhoCubinho cor={cor} className={styles.noAr} />
}

export default Cubinho
