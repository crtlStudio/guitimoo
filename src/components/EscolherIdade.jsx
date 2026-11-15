import { motion } from 'motion/react'
import styles from './EscolherIdade.module.css'

// As três idades. O emoji ajuda quem ainda não lê os números.
const IDADES = [
  { escalao: '3-4', texto: '3–4', emoji: '🐣' },
  { escalao: '5-6', texto: '5–6', emoji: '🐥' },
  { escalao: '7-8', texto: '7–8', emoji: '🦉' },
]

/**
 * Ecrã para a criança (ou o adulto) escolher a idade antes de jogar.
 *
 * Props (os "parâmetros" de um componente):
 * - ultimo: escalão escolhido da última vez ('3-4', '5-6', '7-8' ou null),
 *   que aparece com uma estrela
 * - aoEscolher: função chamada com o escalão quando se toca num botão
 * - posicao: (opcional) estilos para mudar onde o painel aparece,
 *   ex.: { left: '36%', width: '60%' }
 */
function EscolherIdade({ ultimo, aoEscolher, posicao }) {
  return (
    <div className={styles.painel} style={posicao}>
      <p className={styles.pergunta}>Quantos anos tens?</p>

      <div className={styles.botoes}>
        {IDADES.map(({ escalao, texto, emoji }, i) => (
          <motion.button
            key={escalao}
            type="button"
            className={`${styles.botao} ${escalao === ultimo ? styles.ultimo : ''}`}
            onClick={() => aoEscolher(escalao)}
            aria-label={`${texto} anos`}
            // Animação de entrada: cada botão aparece a crescer, um a seguir ao outro
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 18 }}
            // Ao carregar, encolhe um pouco
            whileTap={{ scale: 0.92 }}
          >
            {escalao === ultimo && (
              <span className={styles.estrela} aria-hidden="true">
                ⭐
              </span>
            )}
            <span className={styles.emoji} aria-hidden="true">
              {emoji}
            </span>
            <span className={styles.idade}>{texto}</span>
            <span className={styles.anos}>anos</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default EscolherIdade
