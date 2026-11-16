import styles from './Peca.module.css'

/**
 * Uma peça: um quadrado na cor do jogo com o emoji da peça da mascote
 * (🧱 lego, 🌱 semente, 📕 livro, 🔩 peça).
 * Provisório: quando houver imagens das peças, troca-se só aqui.
 *
 * Props:
 * - mascote: a mascote (de config.js), para o emoji da peça
 * - jogo: o jogo (de config.js), para a cor
 * - className: tamanho/posição (por omissão 6cqw)
 */
function Peca({ mascote, jogo, className = '' }) {
  return (
    <span className={`${styles.peca} ${className}`} style={{ '--cor': jogo.hex }} aria-hidden="true">
      {mascote.emojiPeca}
    </span>
  )
}

export default Peca
