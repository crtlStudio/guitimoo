import { motion } from 'motion/react'
import { useMemo } from 'react'
import styles from './Festa.module.css'

const CORES = ['#7ed957', '#5ec8f2', '#ffb347', '#c39bf0', '#ff8fab', '#f5c96a', '#ffd84d']
const EMOJIS = ['⭐', '🎉', '✨', '🌟']
const QUANTAS = 30

/**
 * Números "ao calhas" mas sempre iguais para a mesma semente.
 * O React pede que um componente dê sempre o mesmo resultado para os mesmos
 * dados, por isso não usamos Math.random aqui: cada festa tem a sua semente
 * (ex.: a palavra da ronda) e os confetes saem diferentes de festa para festa.
 */
function geradorDe(semente) {
  // Converte o texto da semente num número
  let h = 2166136261
  for (const letra of String(semente)) h = Math.imul(h ^ letra.charCodeAt(0), 16777619)
  // Gerador "mulberry32": cada chamada dá um número entre 0 e 1
  return () => {
    h = (h + 0x6d2b79f5) | 0
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Cria a lista de confetes: para onde vão, quanto rodam, cor ou emoji. */
function criarConfetes(semente) {
  const aleatorio = geradorDe(semente)
  return Array.from({ length: QUANTAS }, (_, i) => {
    const angulo = aleatorio() * Math.PI * 2
    const distancia = 10 + aleatorio() * 18 // em cqw
    const x = Math.cos(angulo) * distancia
    const y = Math.sin(angulo) * distancia - 8 // um pouco para cima
    const emoji = aleatorio() < 0.3 ? EMOJIS[Math.floor(aleatorio() * EMOJIS.length)] : null
    return {
      id: i,
      x,
      y,
      queda: 12 + aleatorio() * 14, // quanto cai no fim, em cqw
      rodar: (aleatorio() - 0.5) * 720,
      duracao: 1.3 + aleatorio() * 0.7,
      cor: CORES[Math.floor(aleatorio() * CORES.length)],
      redondo: aleatorio() < 0.4,
      emoji,
    }
  })
}

/**
 * Explosão de confetes e estrelas, para festejar.
 * Mostra-se uma vez quando aparece no ecrã (o jogo decide quando a pôr).
 *
 * Props:
 * - semente: muda a cada festa (ex.: a palavra da ronda), para variar os confetes
 * - origem: de onde rebentam, em % da imagem (ex.: { x: 50, y: 50 })
 */
function Festa({ semente, origem = { x: 50, y: 50 } }) {
  const confetes = useMemo(() => criarConfetes(semente), [semente])

  return (
    <div className={styles.festa} aria-hidden="true">
      <div className={styles.origem} style={{ left: `${origem.x}%`, top: `${origem.y}%` }}>
        {confetes.map((c) => (
          <motion.span
            key={c.id}
            className={c.emoji ? styles.emoji : `${styles.papel} ${c.redondo ? styles.redondo : ''}`}
            style={c.emoji ? undefined : { backgroundColor: c.cor }}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
            animate={{
              // Sai disparado para fora, depois cai e desaparece
              x: ['0cqw', `${c.x}cqw`, `${c.x * 1.15}cqw`],
              y: ['0cqw', `${c.y}cqw`, `${c.y + c.queda}cqw`],
              scale: [0, 1.2, 1],
              rotate: [0, c.rodar / 2, c.rodar],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: c.duracao, times: [0, 0.3, 1], ease: 'easeOut' }}
          >
            {c.emoji}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

export default Festa
