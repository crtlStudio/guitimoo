import casa from '../assets/icones_objetivo/casa.webp'
import bosque from '../assets/icones_objetivo/bosque.webp'
import estante from '../assets/icones_objetivo/estante.webp'
import autocaravana from '../assets/icones_objetivo/autocaravana.webp'

// O projeto de cada mascote (pelo id do config.js), com fundo transparente e
// cortado à volta do desenho (sem margens: assim a cor "sobe" certinha de
// baixo para cima). Os originais em PNG estão na mesma pasta; para trocar
// uma imagem, basta substituir o ficheiro .webp.
const IMAGENS = { sapo: casa, panda: bosque, coruja: estante, tartaruga: autocaravana }

/**
 * A imagem do projeto de uma mascote, ou o emoji do config.js
 * (`iconeProjeto`) se não houver imagem.
 *
 * Props:
 * - mascote: a mascote do config.js
 * - className: o tamanho em cada sítio
 * - decorativa: true quando o nome já está dito à volta (o leitor de ecrã
 *   não o repete); por omissão diz o nome do projeto
 */
function ImagemProjeto({ mascote, className = '', decorativa = false }) {
  const imagem = IMAGENS[mascote.id]
  const alt = decorativa ? '' : mascote.projeto
  if (!imagem) {
    return (
      <span className={className} role={decorativa ? undefined : 'img'} aria-label={alt || undefined} aria-hidden={decorativa || undefined}>
        {mascote.iconeProjeto}
      </span>
    )
  }
  return <img className={className} src={imagem} alt={alt} draggable="false" />
}

export default ImagemProjeto
