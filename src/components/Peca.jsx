import ImagemPalavra from './ImagemPalavra'
import styles from './Peca.module.css'

/**
 * Uma peça: um quadrado na cor do jogo com a imagem da peça da mascote
 * (`imagemPeca` do config.js), ou o emoji (`emojiPeca`) se ainda não houver.
 *
 * Props:
 * - mascote: a mascote (de config.js), para a imagem da peça
 * - jogo: o jogo (de config.js), para a cor
 * - className: tamanho/posição (por omissão 6cqw)
 */
function Peca({ mascote, jogo, className = '' }) {
  return (
    <span className={`${styles.peca} ${className}`} style={{ '--cor': jogo.hex }} aria-hidden="true">
      <ImagemPalavra palavra={mascote.imagemPeca} emoji={mascote.emojiPeca} />
    </span>
  )
}

export default Peca
