import '@fontsource/fredoka/600.css'
import BotaoSom from './BotaoSom'
import BotaoVoltar from './BotaoVoltar'
import Moldura from './Moldura'
import styles from './PaginaMascote.module.css'

/**
 * Estrutura comum das páginas de cada mascote: moldura fina (igual à da home),
 * botão voltar para as mascotes, botão de som e título.
 * `imagem` é opcional; `children` fica por cima da área dentro da moldura.
 * Com `semTitulo`, o título fica escondido (para os jogos terem mais espaço),
 * mas continua a ser lido pelos leitores de ecrã.
 */
function PaginaMascote({ titulo, imagem, semTitulo = false, children }) {
  return (
    <Moldura imagem={imagem}>
      <div className={styles.cantos}>
        <BotaoVoltar para="/mascotes" />
        <BotaoSom />
      </div>
      <h1 className={`${styles.titulo} ${semTitulo ? styles.escondido : ''}`}>{titulo}</h1>
      {children}
    </Moldura>
  )
}

export default PaginaMascote
