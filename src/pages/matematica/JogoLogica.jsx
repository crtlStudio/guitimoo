import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import BalaoMascote from '../../components/BalaoMascote'
import DedoFantasma from '../../components/DedoFantasma'
import Festa from '../../components/Festa'
import { criarPergunta, respostaCertaLogica } from '../../games/matematica/logica'
import { entreOsDoMeio } from './ajuda'
import { DesenhoCubinho } from './Cubinho'
import styles from './JogoLogica.module.css'

/** Tempo a festejar antes da pergunta seguinte (milissegundos). */
const ESPERA_DEPOIS_DE_ACERTAR = 2600

/** Diz se o ponto (onde o dedo largou) está por cima do elemento. */
function estaPorCima(ponto, elemento) {
  const caixa = elemento?.getBoundingClientRect()
  if (!caixa) return false
  const x = ponto.x - window.scrollX
  const y = ponto.y - window.scrollY
  return x >= caixa.left && x <= caixa.right && y >= caixa.top && y <= caixa.bottom
}

/**
 * Jogo da Lógica (dentro da Matemática, sem balança): uma fila de cubinhos
 * com um padrão de cores e um "?". A criança arrasta para o "?" o cubinho
 * que falta (ou toca nele). Uma pergunta só: no fim chama aoProxima().
 *
 * Props:
 * - escalao: '3-4', '5-6' ou '7-8' (as regras de cada um estão em logica.js)
 * - aoAcertar(), aoErrar(): avisam a página (sons e estrelas)
 * - aoProxima(): passar à pergunta seguinte (a página sorteia o jogo)
 */
function JogoLogica({ escalao, aoAcertar, aoErrar, aoProxima }) {
  const [pergunta] = useState(() => criarPergunta(escalao))
  const [erradas, setErradas] = useState([]) // cores já tentadas e erradas
  const [certa, setCerta] = useState(false)
  const [mensagem, setMensagem] = useState(null) // { tipo: 'erro' | 'fim', vez }
  const [abana, setAbana] = useState(null) // { cor, vez }: a opção errada que abana

  const buraco = useRef(null)
  const temporizador = useRef(null)

  // Ao sair, cancela a passagem para a pergunta seguinte
  useEffect(() => () => clearTimeout(temporizador.current), [])

  /** A criança pôs (ou tocou) um cubinho no "?". */
  function tentar(cor) {
    if (certa || erradas.includes(cor)) return
    const vez = (m) => (m?.vez ?? 0) + 1
    if (respostaCertaLogica(pergunta, cor)) {
      setCerta(true)
      setMensagem((m) => ({ tipo: 'fim', vez: vez(m) }))
      const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
      if (!acabou) temporizador.current = setTimeout(() => aoProxima?.(), ESPERA_DEPOIS_DE_ACERTAR)
    } else {
      aoErrar?.()
      setErradas((e) => [...e, cor])
      setAbana((a) => ({ cor, vez: vez(a) }))
      setMensagem((m) => ({ tipo: 'erro', vez: vez(m) }))
    }
  }

  /** Largou o cubinho: só conta se for por cima do "?" (senão volta, sem erro). */
  function largar(cor, ponto) {
    if (estaPorCima(ponto, buraco.current)) tentar(cor)
  }

  // A ajuda (3 s parada): o dedo vai da fila de baixo até ao "?". Mostra o
  // gesto, não qual é o certo: parte do ESPAÇO entre dois cubinhos do meio
  // (nunca de cima de um cubinho, que pareceria uma dica).
  const gesto = certa
    ? null
    : {
        chave: 'logica',
        tipo: 'arrastar',
        de: () => entreOsDoMeio('[data-opcoes-logica]'),
        para: () => buraco.current,
      }

  const grandes = pergunta.fila.length <= 6 // com menos cubinhos, ficam maiores

  return (
    <>
      <DedoFantasma gesto={gesto} />

      {/* A fila com o padrão, numa prateleira */}
      <div className={`${styles.fila} ${grandes ? styles.grandes : ''}`} aria-label="Que cubinho falta?">
        {pergunta.fila.map((cor, i) =>
          cor ? (
            <motion.span
              key={i}
              className={styles.lugar}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <DesenhoCubinho cor={cor} className={styles.cubo} />
            </motion.span>
          ) : (
            <span key={i} ref={buraco} className={`${styles.lugar} ${styles.buraco} ${certa ? styles.buracoCheio : ''}`}>
              {certa ? (
                <motion.span initial={{ scale: 0.3 }} animate={{ scale: [0.3, 1.25, 1] }} transition={{ duration: 0.45 }}>
                  <DesenhoCubinho cor={pergunta.resposta} className={styles.cubo} />
                </motion.span>
              ) : (
                <motion.span
                  className={styles.interrogacao}
                  aria-hidden="true"
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ?
                </motion.span>
              )}
            </span>
          ),
        )}
      </div>

      <BalaoMascote mensagem={mensagem} textos={{ fim: 'Boa!' }} className={styles.mensagem} />

      {certa && <Festa semente={`logica-${pergunta.padrao}-${pergunta.resposta}`} origem={{ x: 50, y: 35 }} />}

      {/* Os cubinhos para escolher: arrastar até ao "?" (ou tocar) */}
      <div className={styles.opcoes} data-opcoes-logica role="group" aria-label="Escolhe o cubinho">
        {pergunta.opcoes.map((cor) => {
          const errada = erradas.includes(cor)
          const usada = certa && cor === pergunta.resposta // já está no "?"
          if (usada) return <span key={cor} className={styles.opcaoVazia} />
          return (
            <motion.button
              key={abana?.cor === cor ? `${cor}-${abana.vez}` : cor}
              type="button"
              className={`${styles.opcao} ${errada ? styles.opcaoErrada : ''}`}
              aria-label={`Cubinho ${cor}`}
              disabled={errada || certa}
              drag={!errada && !certa}
              dragSnapToOrigin
              dragElastic={1}
              dragMomentum={false}
              whileDrag={{ scale: 1.15, zIndex: 5 }}
              onDragEnd={(evento, info) => largar(cor, info.point)}
              onTap={() => tentar(cor)}
              initial={abana?.cor === cor ? false : { opacity: 0, y: 20 }}
              animate={abana?.cor === cor ? { x: [0, -10, 10, -6, 6, 0] } : { opacity: 1, y: 0 }}
              transition={abana?.cor === cor ? { duration: 0.45 } : { delay: 0.5 }}
            >
              <DesenhoCubinho cor={cor} className={styles.cubo} />
            </motion.button>
          )
        })}
      </div>
    </>
  )
}

export default JogoLogica
