import PaginaJogo from '../../components/PaginaJogo'
import fundo from '../../assets/detetive/detetive_fundo.jpg'
import styles from './Detetive.module.css'

/**
 * Página do jogo "Detetive das Profissões" (ainda por fazer).
 * Enquanto o jogo estiver `ativo: false` no config.js, o botão no ecrã dos
 * jogos está desligado e ninguém chega aqui; esta página é só um lugar
 * guardado. A lógica do jogo vai para src/games/detetive/.
 */
function Detetive() {
  return (
    <PaginaJogo titulo="Detetive das Profissões" imagem={fundo}>
      <div className={styles.emBreve}>
        <span aria-hidden="true">🔍</span>
        <p>Em breve!</p>
      </div>
    </PaginaJogo>
  )
}

export default Detetive
