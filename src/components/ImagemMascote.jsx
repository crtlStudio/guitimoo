import sapo from '../assets/mascotes/sapo.webp'
import panda from '../assets/mascotes/panda.webp'
import coruja from '../assets/mascotes/coruja.webp'
import tartaruga from '../assets/mascotes/tartaruga.webp'

// A caricatura de cada mascote (pelo id do config.js), com fundo
// transparente. Para trocar uma, basta substituir o ficheiro .webp.
const IMAGENS = { sapo, panda, coruja, tartaruga }

/**
 * A imagem de uma mascote, ou o emoji do config.js se não houver imagem.
 *
 * Props:
 * - mascote: a mascote do config.js
 * - className: o tamanho em cada sítio
 * - decorativa: true quando o nome já está escrito ao lado (o leitor de
 *   ecrã não o repete); por omissão diz o nome da mascote
 */
function ImagemMascote({ mascote, className = '', decorativa = false }) {
  const imagem = IMAGENS[mascote.id]
  const alt = decorativa ? '' : mascote.nome
  if (!imagem) {
    return (
      <span className={className} role={decorativa ? undefined : 'img'} aria-label={alt || undefined} aria-hidden={decorativa || undefined}>
        {mascote.emoji}
      </span>
    )
  }
  return <img className={className} src={imagem} alt={alt} draggable="false" />
}

export default ImagemMascote
