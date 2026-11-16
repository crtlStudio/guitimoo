import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { prepararEfeitos } from '../../audio/efeitos'
import BotaoConstrucao from '../../components/BotaoConstrucao'
import EcraEscolha from '../../components/EcraEscolha'
import IconeJogo from '../../components/IconeJogo'
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
        {JOGOS.map((jogo, i) => (
          <motion.button
            key={jogo.id}
            type="button"
            className={`${styles.botao} ${jogo.ativo ? '' : styles.inativo}`}
            style={{ '--cor': jogo.hex }}
            onClick={() => escolher(jogo.id)}
            disabled={!jogo.ativo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
            whileTap={jogo.ativo ? { scale: 0.93 } : undefined}
          >
            <IconeJogo jogo={jogo} className={styles.icone} />
            <span className={styles.nome}>{jogo.nome}</span>
            {!jogo.ativo && <span className={styles.breve}>Em breve</span>}
          </motion.button>
        ))}
      </nav>
      {/* A construção da mascote (🏠 com o anel das peças) */}
      <BotaoConstrucao className={styles.construcao} seta="direita" />
    </EcraEscolha>
  )
}

export default Jogos
