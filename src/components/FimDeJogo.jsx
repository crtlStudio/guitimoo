import { motion } from 'motion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ESTRELAS_POR_CERTA, ESTRELAS_POR_JOGO } from '../games/estrelas'
import BotaoConstrucao from './BotaoConstrucao'
import Festa from './Festa'
import PremioPecas from './PremioPecas'
import ProjetoAcabado from './ProjetoAcabado'
import { useMascoteAtiva } from './useProgresso'
import styles from './FimDeJogo.module.css'

/**
 * Ecrã de fim de jogo (jogo ganho!), por cima do jogo, com as contas das
 * estrelas e um botão para jogar outra vez. Igual em todos os jogos; quem
 * festeja é a mascote escolhida pela criança.
 *
 * Props:
 * - placar: o placar do jogo que acabou (de useJogo)
 * - premio: o que o jogo deu à mascote (de useJogo): peças e projetos acabados
 * - aoJogarOutraVez: função do botão "Jogar outra vez"
 * O botão "Outro jogo" volta à escolha dos jogos, e o 🏠 leva à construção
 * da mascote (com uma seta a apontar, se este jogo deu peças novas).
 */
function FimDeJogo({ placar, premio, aoJogarOutraVez }) {
  const navegar = useNavigate()
  const mascote = useMascoteAtiva()?.emoji ?? '⭐'
  // Quantos projetos acabados já foram festejados (a festa grande aparece uma vez por cada)
  const [projetosVistos, setProjetosVistos] = useState(0)
  const projetosAcabados = premio?.projetosAcabados ?? 0
  const temPergunta = (premio?.pecasExtra ?? 0) > 0
  const deCertas = placar.certas * ESTRELAS_POR_CERTA
  const perfeito = placar.certas === placar.perguntas

  // As linhas aparecem uma a seguir à outra
  const linha = (i) => ({
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: 0.3 + i * 0.35 },
  })

  return (
    <div className={styles.fundo}>
      <Festa semente={`fim-${placar.estrelas}-${placar.certas}`} origem={{ x: 50, y: 40 }} />

      <motion.div
        className={styles.cartao}
        role="dialog"
        aria-labelledby="fim-titulo"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      >
        <h2 id="fim-titulo" className={styles.titulo}>
          <motion.span
            className={styles.mascote}
            aria-hidden="true"
            animate={{ y: [0, -10, 0, -6, 0], rotate: [0, -10, 10, 0, 0] }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {mascote}
          </motion.span>
          {perfeito ? 'Perfeito! Jogo ganho!' : 'Jogo ganho!'}
        </h2>

        <ul className={styles.contas}>
          {/* Com a pergunta da reserva no cartão, só fica a soma (para tudo caber no ecrã) */}
          {!temPergunta && (
            <>
              <motion.li {...linha(0)}>
                <span>
                  ✅ {placar.certas} {placar.certas === 1 ? 'certa' : 'certas'} à primeira × {ESTRELAS_POR_CERTA}
                </span>
                <strong>{deCertas} ⭐</strong>
              </motion.li>
              <motion.li {...linha(1)}>
                <span>🏆 Jogo ganho</span>
                <strong>+{ESTRELAS_POR_JOGO} ⭐</strong>
              </motion.li>
            </>
          )}
          <motion.li className={styles.soma} {...linha(2)}>
            <span>Neste jogo</span>
            <motion.strong
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.3, 1] }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              {placar.estrelas} ⭐
            </motion.strong>
          </motion.li>
        </ul>

        {/* As peças que este jogo deu à mascote */}
        {premio && <PremioPecas premio={premio} jogoId={premio.jogoId} />}

        <div className={styles.botoes}>
          {/* Ver as peças novas a entrar na construção */}
          <BotaoConstrucao className={styles.construcao} seta="esquerda" />

          {/* Volta à escolha dos jogos */}
          <motion.button
            type="button"
            className={styles.outroJogo}
            onClick={() => navegar('/jogos')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            whileTap={{ scale: 0.93 }}
          >
            Outro jogo
          </motion.button>

          <motion.button
            type="button"
            className={styles.outraVez}
            onClick={aoJogarOutraVez}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: [1, 1.05, 1] }}
            transition={{
              opacity: { delay: 1.3 },
              scale: { delay: 1.3, duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileTap={{ scale: 0.93 }}
          >
            Jogar outra vez
          </motion.button>
        </div>
      </motion.div>

      {/* Projeto completo: a festa grande, por cima de tudo */}
      {projetosAcabados > projetosVistos && (
        <ProjetoAcabado vez={projetosAcabados} aoFechar={() => setProjetosVistos(projetosAcabados)} />
      )}
    </div>
  )
}

export default FimDeJogo
