import iconeFacil from '../assets/niveis/baixo.jpg'
import iconeMedio from '../assets/niveis/medio.jpg'
import iconeDificil from '../assets/niveis/dificil.jpg'
import styles from './IconeNivel.module.css'

/** O ícone de cada nível (1, 2 ou 3 estrelas), pelo id do config.js. */
const ICONES = { facil: iconeFacil, medio: iconeMedio, dificil: iconeDificil }

/**
 * O ícone de um nível: o círculo azul com 1, 2 ou 3 estrelas.
 * É só decoração (o nome do nível está escrito ao lado).
 *
 * Props:
 * - nivel: 'facil', 'medio' ou 'dificil'
 * - className: o tamanho em cada sítio (a largura; a altura acompanha)
 */
function IconeNivel({ nivel, className = '' }) {
  return (
    <span className={`${styles.icone} ${className}`} aria-hidden="true">
      <img src={ICONES[nivel]} alt="" draggable="false" />
    </span>
  )
}

export default IconeNivel
