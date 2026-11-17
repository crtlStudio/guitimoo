import ImagemPalavra from '../../components/ImagemPalavra'
import { IMAGEM_DA_PISTA } from '../../games/detetive/profissoes'

/**
 * O desenho de uma pista: a imagem de icones_gerais ou, se ainda não houver,
 * o emoji. As pistas são guardadas como emoji (ex.: '🧯'); o nome da imagem
 * vem de IMAGEM_DA_PISTA. O tamanho vem do className (ou do sítio onde está).
 */
function Pista({ emoji, className }) {
  return <ImagemPalavra palavra={IMAGEM_DA_PISTA[emoji]} emoji={emoji} className={className} />
}

export default Pista
