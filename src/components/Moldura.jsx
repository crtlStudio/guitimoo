import styles from './Moldura.module.css'

/**
 * Moldura verde com bordas douradas à volta do ecrã. A imagem (16:9) aparece
 * inteira dentro da moldura, o maior possível.
 *
 * - `topo`: elementos que ficam sobre a faixa de cima (título, voltar, som).
 *   Se existir, a faixa de cima fica mais larga para os receber.
 * - `children`: elementos por cima da imagem, posicionados em % da imagem
 *   (podem usar unidades cqw = 1% da largura da imagem).
 */
function Moldura({ imagem, topo, children }) {
  return (
    <div className={`${styles.moldura} ${topo ? styles.comTopo : ''}`}>
      {topo}
      <div
        className={styles.janela}
        style={imagem ? { backgroundImage: `url(${imagem})` } : undefined}
      >
        {children}
      </div>
    </div>
  )
}

export default Moldura
