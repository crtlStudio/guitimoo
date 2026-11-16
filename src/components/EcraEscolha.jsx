import '@fontsource/fredoka/600.css'
import BotaoSom from './BotaoSom'
import BotaoVoltar from './BotaoVoltar'
import Definicoes from './Definicoes'
import Moldura from './Moldura'
import styles from './EcraEscolha.module.css'

/**
 * Estrutura dos ecrãs de escolha (nível, mascote, jogo): a moldura com,
 * em cima, o botão voltar, o título e o som; em baixo à direita, as definições.
 *
 * Props:
 * - titulo: a pergunta do ecrã (ex.: 'Que jogo vamos jogar?')
 * - voltar: para onde vai o botão voltar (ex.: '/nivel')
 * - imagem: o fundo
 * - children: os botões, por cima da imagem
 */
function EcraEscolha({ titulo, voltar, imagem, children }) {
  const topo = (
    <>
      <BotaoVoltar para={voltar} />
      <h1 className={styles.titulo}>{titulo}</h1>
      <BotaoSom />
      <Definicoes />
    </>
  )

  return (
    <Moldura imagem={imagem} topo={topo}>
      {children}
    </Moldura>
  )
}

export default EcraEscolha
