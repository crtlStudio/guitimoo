import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import EcraEscolha from '../../components/EcraEscolha'
import { usePerfil } from '../../components/useProgresso'
import { NIVEIS } from '../../games/progresso/config'
import { mudarProgresso } from '../../games/progresso/estado'
import { escolherNivel } from '../../games/progresso/progresso'
import fundoNiveis from '../../assets/fundo_niveis.jpg'
import iconeFacil from '../../assets/niveis/baixo.jpg'
import iconeMedio from '../../assets/niveis/medio.jpg'
import iconeDificil from '../../assets/niveis/dificil.jpg'
import styles from './Niveis.module.css'

/** O ícone de cada nível (1, 2 ou 3 estrelas). */
const ICONES = { facil: iconeFacil, medio: iconeMedio, dificil: iconeDificil }

/**
 * Escolher o nível (Fácil, Médio, Difícil): escolhe-se uma vez e vale para
 * todos os jogos. O nível escolhido da última vez tem uma estrela.
 */
function Niveis() {
  const navegar = useNavigate()
  const atual = usePerfil()?.nivel

  function escolher(id) {
    mudarProgresso((progresso) => escolherNivel(progresso, id))
    navegar('/mascotes')
  }

  return (
    <EcraEscolha titulo="Escolhe o nível" voltar="/" imagem={fundoNiveis}>
      <div className={styles.botoes}>
        {NIVEIS.map(({ id, nome }, i) => (
          <motion.button
            key={id}
            type="button"
            className={`${styles.botao} ${id === atual ? styles.atual : ''}`}
            onClick={() => escolher(id)}
            aria-pressed={id === atual}
            // Cada botão aparece a crescer, um a seguir ao outro
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 18 }}
            whileTap={{ scale: 0.92 }}
          >
            {id === atual && (
              <span className={styles.estrela} aria-hidden="true">
                ⭐
              </span>
            )}
            {/* Só o círculo azul do ícone: o fundo azul-claro da imagem fica de fora */}
            <span className={styles.icone} aria-hidden="true">
              <img src={ICONES[id]} alt="" draggable="false" />
            </span>
            <span className={styles.nome}>{nome}</span>
          </motion.button>
        ))}
      </div>
    </EcraEscolha>
  )
}

export default Niveis
