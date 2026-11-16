import matematica from '../assets/icones_jogo/matematica.webp'
import portugues from '../assets/icones_jogo/portugues.webp'
import memoria from '../assets/icones_jogo/memoria.webp'
import horas from '../assets/icones_jogo/horas.webp'
import detetive from '../assets/icones_jogo/detetive.webp'

// A imagem de cada jogo (pelo id do config.js). Quadradas, com fundo
// transparente. Para trocar uma, basta substituir o ficheiro .webp.
const IMAGENS = { matematica, portugues, memoria, horas, detetive }

/**
 * O ícone de um jogo: a imagem, ou o emoji do config.js se não houver imagem.
 * É só decoração (o nome do jogo está no botão à volta).
 *
 * Props:
 * - jogo: o jogo do config.js
 * - className: o tamanho em cada sítio
 */
function IconeJogo({ jogo, className = '' }) {
  const imagem = IMAGENS[jogo.id]
  if (!imagem) {
    return (
      <span className={className} aria-hidden="true">
        {jogo.icone}
      </span>
    )
  }
  return <img className={className} src={imagem} alt="" draggable="false" />
}

export default IconeJogo
