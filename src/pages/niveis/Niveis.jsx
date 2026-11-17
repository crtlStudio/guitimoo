import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import EcraEscolha from '../../components/EcraEscolha'
import ImagemMascote from '../../components/ImagemMascote'
import { useMascoteAtiva, usePerfil } from '../../components/useProgresso'
import { NIVEIS } from '../../games/progresso/config'
import { mudarProgresso, progressoAtual } from '../../games/progresso/estado'
import { escolherNivel, objetivoJaVisto } from '../../games/progresso/progresso'
import IconeNivel from '../../components/IconeNivel'
import fundoNiveis from '../../assets/fundo_niveis.jpg'
import styles from './Niveis.module.css'

/**
 * Escolher o nível (Fácil, Médio, Difícil), depois de escolher a mascote:
 * a mascote escolhida à esquerda e os 3 níveis, uns por baixo dos outros, à
 * direita. O nível vale para todos os jogos; o da última vez tem uma estrela.
 * A seguir: a página do objetivo (1.ª vez com esta mascote) ou os jogos.
 */
function Niveis() {
  const navegar = useNavigate()
  const atual = usePerfil()?.nivel
  const mascote = useMascoteAtiva()

  function escolher(id) {
    mudarProgresso((progresso) => escolherNivel(progresso, id))
    navegar(objetivoJaVisto(progressoAtual()) ? '/jogos' : '/objetivo')
  }

  return (
    <EcraEscolha titulo="Escolhe o nível" voltar="/mascotes" imagem={fundoNiveis}>
      {/* A mascote escolhida, a chegar aos pulinhos */}
      {mascote && (
        <motion.div
          className={styles.mascote}
          initial={{ opacity: 0, x: '-6cqw' }}
          animate={{ opacity: 1, x: '0cqw', y: ['0cqw', '-2.5cqw', '0cqw', '-1.2cqw', '0cqw'] }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <ImagemMascote mascote={mascote} className={styles.mascoteImagem} />
        </motion.div>
      )}

      <div className={styles.botoes}>
        {NIVEIS.map(({ id, nome }, i) => (
          <motion.button
            key={id}
            type="button"
            className={`${styles.botao} ${id === atual ? styles.atual : ''}`}
            onClick={() => escolher(id)}
            aria-pressed={id === atual}
            // Cada botão aparece a deslizar, um a seguir ao outro
            initial={{ opacity: 0, x: '6cqw' }}
            animate={{ opacity: 1, x: '0cqw' }}
            transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
            whileTap={{ scale: 0.94 }}
          >
            {id === atual && (
              <span className={styles.estrela} aria-hidden="true">
                ⭐
              </span>
            )}
            <IconeNivel nivel={id} className={styles.icone} />
            <span className={styles.nome}>{nome}</span>
          </motion.button>
        ))}
      </div>
    </EcraEscolha>
  )
}

export default Niveis
