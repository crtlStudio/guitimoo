import { Link } from 'react-router-dom'
import styles from './BotaoVoltar.module.css'

/** Botão redondo de vidro com seta, no canto superior esquerdo. */
function BotaoVoltar({ para }) {
  return (
    <Link to={para} className={styles.voltar} aria-label="Voltar">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path className={styles.setaContorno} d="M15 5l-7 7 7 7" />
        <path className={styles.seta} d="M15 5l-7 7 7 7" />
      </svg>
    </Link>
  )
}

export default BotaoVoltar
