import { Link } from 'react-router-dom'
import { iniciarMusicaFundo } from '../../audio/musica'
import Moldura from '../../components/Moldura'
import imagemInicio from '../../assets/inicio.webp'
import styles from './Home.module.css'

function Home() {
  return (
    <Moldura imagem={imagemInicio}>
      <Link to="/mascotes" className={styles.botaoJogar} onClick={iniciarMusicaFundo}>
        Jogar
      </Link>
    </Moldura>
  )
}

export default Home
