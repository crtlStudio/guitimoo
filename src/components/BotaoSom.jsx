import { alternarMudo, useMudo } from '../audio/musica'
import styles from './BotaoSom.module.css'

// Altifalante; com som mostra as ondas, sem som mostra um X
const ALTIFALANTE = 'M4 9.5h3.5L12 5.5v13l-4.5-4H4z'
const ONDAS = 'M15.5 9a4 4 0 0 1 0 6 M18 6.5a7.5 7.5 0 0 1 0 11'
const CRUZ = 'M16 9.5l5 5 M21 9.5l-5 5'

function BotaoSom({ className = '' }) {
  const mudo = useMudo()
  const extra = mudo ? CRUZ : ONDAS

  return (
    <button
      type="button"
      className={`${styles.botao} ${className}`}
      onClick={alternarMudo}
      aria-label={mudo ? 'Ligar música' : 'Desligar música'}
      aria-pressed={mudo}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path className={styles.contorno} d={ALTIFALANTE} />
        <path className={styles.contorno} d={extra} />
        <path className={styles.preenchido} d={ALTIFALANTE} />
        <path className={styles.traco} d={extra} />
      </svg>
    </button>
  )
}

export default BotaoSom
