import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { PECAS_POR_COR } from '../games/progresso/config'
import { pecasEmFalta, pecasNovas } from '../games/progresso/progresso'
import { useMascoteAtiva, useProgresso } from './useProgresso'
import styles from './BotaoConstrucao.module.css'

/**
 * Botão redondo para ver a construção da mascote ativa: o ícone do projeto
 * (🏠) dentro de um anel que se vai enchendo com as peças (como uma barra
 * de progresso redonda).
 * Se há peças novas por ver, o botão pulsa e aparece uma seta a apontar
 * para ele (sem texto: as crianças pequenas ainda não leem).
 *
 * Props:
 * - className: a posição em cada ecrã
 * - seta: de que lado aparece a seta ('esquerda' 👉 ou 'direita' 👈)
 */
function BotaoConstrucao({ className = '', seta = 'esquerda' }) {
  const navegar = useNavigate()
  const progresso = useProgresso()
  const mascote = useMascoteAtiva()
  if (!progresso || !mascote) return null

  const { porCor, total: faltam } = pecasEmFalta(progresso)
  const precisa = Object.keys(porCor).length * PECAS_POR_COR
  const fracao = precisa > 0 ? (precisa - faltam) / precisa : 0
  const novas = pecasNovas(progresso)
  const haNovidades = novas.total > 0 || novas.projetosNovos > 0

  return (
    <div className={`${styles.sitio} ${className}`}>
      {haNovidades && (
        <span className={`${styles.seta} ${styles[seta]}`} aria-hidden="true">
          {seta === 'esquerda' ? '👉' : '👈'}
        </span>
      )}
      <motion.button
        type="button"
        className={styles.botao}
        style={{ '--fracao': fracao }}
        onClick={() => navegar('/construcao')}
        aria-label={`Ver ${mascote.projeto}${haNovidades ? ' (há peças novas!)' : ''}`}
        whileTap={{ scale: 0.88 }}
        animate={haNovidades ? { scale: [1, 1.1, 1] } : undefined}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className={styles.icone} aria-hidden="true">
          {mascote.iconeProjeto}
        </span>
        {haNovidades && <span className={styles.ponto} aria-hidden="true" />}
      </motion.button>
    </div>
  )
}

export default BotaoConstrucao
