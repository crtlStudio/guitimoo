import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { prepararEfeitos } from '../../audio/efeitos'
import EcraEscolha from '../../components/EcraEscolha'
import { JOGOS } from '../../games/progresso/config'
import fundoJogos from '../../assets/fundo_niveis.jpg'
import styles from './Jogos.module.css'

/**
 * Escolher o jogo. Cada botão tem a cor do jogo (a cor das peças que dá).
 * Os jogos inativos (ainda em construção) aparecem cinzentos, com "Em breve".
 * A rota de cada jogo é o seu id: '/matematica', '/portugues', ...
 */
function Jogos() {
  const navegar = useNavigate()

  function escolher(id) {
    prepararEfeitos() // carrega os sons agora, que a criança já tocou no ecrã
    navegar(`/${id}`)
  }

  return (
    <EcraEscolha titulo="Que jogo vamos jogar?" voltar="/mascotes" imagem={fundoJogos}>
      <nav className={styles.grelha} aria-label="Jogos">
        {JOGOS.map(({ id, nome, hex, icone, ativo }, i) => (
          <motion.button
            key={id}
            type="button"
            className={`${styles.botao} ${ativo ? '' : styles.inativo}`}
            style={{ '--cor': hex }}
            onClick={() => escolher(id)}
            disabled={!ativo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
            whileTap={ativo ? { scale: 0.93 } : undefined}
          >
            <span className={styles.icone} aria-hidden="true">
              {icone}
            </span>
            <span className={styles.nome}>{nome}</span>
            {!ativo && <span className={styles.breve}>Em breve</span>}
          </motion.button>
        ))}
      </nav>
    </EcraEscolha>
  )
}

export default Jogos
