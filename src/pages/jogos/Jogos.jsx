import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { prepararEfeitos } from '../../audio/efeitos'
import BotaoConstrucao from '../../components/BotaoConstrucao'
import EcraEscolha from '../../components/EcraEscolha'
import IconeJogo from '../../components/IconeJogo'
import IconeNivel from '../../components/IconeNivel'
import { usePerfil } from '../../components/useProgresso'
import { JOGOS, NIVEIS } from '../../games/progresso/config'
import { mudarProgresso } from '../../games/progresso/estado'
import { escolherNivel } from '../../games/progresso/progresso'
import fundoJogos from '../../assets/fundo_niveis.jpg'
import styles from './Jogos.module.css'

/**
 * Escolher o jogo. Cada botão tem a cor do jogo (a cor das peças que dá).
 * Os jogos inativos (ainda em construção) aparecem cinzentos, com "Em breve".
 * A rota de cada jogo é o seu id: '/matematica', '/portugues', ...
 * Em cima, os 3 níveis em pequeno: tocar num muda a dificuldade aqui mesmo.
 */
function Jogos() {
  const navegar = useNavigate()
  const nivelAtual = usePerfil()?.nivel

  function escolher(id) {
    prepararEfeitos() // carrega os sons agora, que a criança já tocou no ecrã
    navegar(`/${id}`)
  }

  return (
    <EcraEscolha titulo="Que jogo vamos jogar?" voltar="/mascotes" imagem={fundoJogos}>
      {/* Os níveis, em pequeno: o escolhido fica dourado e os outros mais claros */}
      <div className={styles.niveis} role="group" aria-label="Nível">
        {NIVEIS.map(({ id, nome }) => {
          const escolhido = id === nivelAtual
          return (
            <motion.button
              key={id}
              type="button"
              className={`${styles.nivel} ${escolhido ? styles.nivelEscolhido : ''}`}
              onClick={() => mudarProgresso((p) => escolherNivel(p, id))}
              aria-pressed={escolhido}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: escolhido ? 1 : 0.7, y: 0, scale: escolhido ? [1, 1.12, 1] : 1 }}
              transition={{ duration: 0.35 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconeNivel nivel={id} className={styles.nivelIcone} />
              <span className={styles.nivelNome}>{nome}</span>
            </motion.button>
          )
        })}
      </div>

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
