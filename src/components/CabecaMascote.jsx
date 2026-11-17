import { useMascoteAtiva } from './useProgresso'
import styles from './ImagemPalavra.module.css'

// As cabeças das mascotes (assets/mascotes/cabecas/<id>.png), pelo id do
// config.js. Fica um objeto { '../assets/mascotes/cabecas/sapo.png': 'endereço', ... }.
const FICHEIROS = import.meta.glob('../assets/mascotes/cabecas/*.png', { eager: true, import: 'default' })
const CABECAS = Object.fromEntries(
  Object.entries(FICHEIROS).map(([caminho, endereco]) => [caminho.split('/').pop().replace('.png', ''), endereco]),
)

/**
 * A cabeça da mascote ativa, pequenina (no balão, no fim do jogo, no
 * caminho das Horas). Ocupa o lugar de um emoji: o tamanho vem do
 * font-size de quem a põe. Sem imagem, mostra o emoji da mascote
 * (e, antes de escolher mascote, uma ⭐). É só decoração.
 */
function CabecaMascote() {
  const mascote = useMascoteAtiva()
  const imagem = mascote && CABECAS[mascote.id]
  if (!imagem) return mascote?.emoji ?? '⭐'
  return <img className={styles.imagem} src={imagem} alt="" draggable="false" />
}

export default CabecaMascote
