import { motion } from 'motion/react'
import { useState } from 'react'
import { perguntaMedio } from '../../games/detetive/regras'
import EscolherPessoa from './EscolherPessoa'
import Lupa from './Lupa'
import { usePergunta } from './usePergunta'
import Pista from './Pista'
import styles from './Jogo56.module.css'

/**
 * Nível médio (5–6): "Quem é?"
 * Em cima, 3 lupas: a 1.ª já mostra uma pista; as outras têm um "?" e
 * destapam-se com um toque (uma de cada vez). Em baixo, 4 pessoas.
 * A criança pode responder quando quiser: ver mais pistas não tira estrelas.
 * Ao acertar, as pistas que faltavam destapam-se todas.
 * Props: aoAcertar() e aoErrar() — avisam a página (sons e estrelas)
 */
function Jogo56({ aoAcertar, aoErrar }) {
  const { pergunta, resposta, numero, tocar } = usePergunta('5-6', perguntaMedio, aoAcertar, aoErrar)
  // Quantas pistas estão destapadas, e em que pergunta (numa pergunta nova volta a 1)
  const [destapadas, setDestapadas] = useState({ numero: 0, quantas: 1 })

  if (!pergunta) return null // ainda a ler do telemóvel

  const acertou = resposta?.certa
  const quantas = acertou
    ? pergunta.pistas.length
    : destapadas.numero === numero
      ? destapadas.quantas
      : 1

  function destapar() {
    setDestapadas({ numero, quantas: Math.min(quantas + 1, pergunta.pistas.length) })
  }

  return (
    <>
      {/* As 3 lupas das pistas, em cima */}
      <div className={styles.pistas} key={numero}>
        {pergunta.pistas.map((pista, i) => {
          const vista = i < quantas
          const proxima = i === quantas // só a seguinte se pode destapar

          return (
            <motion.div
              key={i}
              className={styles.sitio}
              initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 16, delay: i * 0.12 }}
            >
              {vista ? (
                // A pista destapada "vira" para a frente
                <motion.div
                  initial={i === 0 ? false : { rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Lupa className={styles.lupa} quieta={i > 0}>
                    <span role="img" aria-label={`Pista ${i + 1}`}>
                      <Pista emoji={pista} />
                    </span>
                  </Lupa>
                </motion.div>
              ) : (
                <motion.button
                  type="button"
                  className={styles.tapada}
                  onClick={proxima ? destapar : undefined}
                  disabled={!proxima}
                  aria-label="Ver mais uma pista"
                  animate={proxima ? { scale: [1, 1.07, 1] } : undefined}
                  transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                  whileTap={proxima ? { scale: 0.9 } : undefined}
                >
                  <Lupa className={styles.lupa} quieta>
                    <span className={styles.interrogacao} aria-hidden="true">
                      ?
                    </span>
                  </Lupa>
                </motion.button>
              )}
            </motion.div>
          )
        })}
      </div>

      <EscolherPessoa
        opcoes={pergunta.opcoes}
        resposta={resposta}
        pista={pergunta.pistas[0]}
        numero={numero}
        aoTocar={tocar}
      />
    </>
  )
}

export default Jogo56
