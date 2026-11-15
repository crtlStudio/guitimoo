import { Link } from 'react-router-dom'
import '@fontsource/fredoka/600.css'
import BotaoSom from '../../components/BotaoSom'
import BotaoVoltar from '../../components/BotaoVoltar'
import Definicoes from '../../components/Definicoes'
import Moldura from '../../components/Moldura'
import imagemMascotes from '../../assets/mascotes.webp'
import styles from './Mascotes.module.css'

// Pela ordem em que aparecem na imagem. Cada nome tem sempre 2 linhas.
const MASCOTES = [
  { linhas: ['Contas e', 'Saltos'], rota: '/sapo', classe: styles.sapo },
  { linhas: ['Letras e', 'Trapalhadas'], rota: '/panda', classe: styles.panda },
  { linhas: ['Memória', 'e Sons'], rota: '/coruja', classe: styles.coruja },
  { linhas: ['Pontual', 'sem Stress'], rota: '/tartaruga', classe: styles.tartaruga },
]

function Mascotes() {
  // Sobre a moldura: voltar, título e som (em cima) e definições (em baixo à direita)
  const topo = (
    <>
      <BotaoVoltar para="/" />
      <h1 className={styles.titulo}>O que vamos jogar agora?</h1>
      <BotaoSom />
      <Definicoes />
    </>
  )

  return (
    <Moldura imagem={imagemMascotes} topo={topo}>
      <nav aria-label="Jogos">
        {MASCOTES.map(({ linhas, rota, classe }) => (
          <Link key={rota} to={rota} className={`${styles.botao} ${classe}`}>
            {linhas.map((linha) => (
              <span key={linha} className={styles.linha}>
                {linha}
              </span>
            ))}
          </Link>
        ))}
      </nav>
    </Moldura>
  )
}

export default Mascotes
