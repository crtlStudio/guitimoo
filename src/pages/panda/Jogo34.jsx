import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import palavras from '../../data/palavras.json'
import { criarRondaLetra, quantidadeDeLetras } from '../../games/panda/letras'
import { proximaPalavra } from '../../games/panda/memoria'
import BalaoMascote from '../../components/BalaoMascote'
import Festa from '../../components/Festa'
import styles from './Jogo34.module.css'

const LISTA = palavras['3-4'] // [{ palavra: 'GATO', emoji: '🐱' }, ...]
const TODAS = LISTA.map((p) => p.palavra) // ['GATO', ...]
const ESPERA_DEPOIS_DE_ACERTAR = 1300 // milissegundos até à ronda seguinte

/**
 * Jogo dos 3–4 anos: o Panda mostra uma letra e a criança toca na igual.
 * Props: aoAcertar() e aoErrar() — avisam a página (sons e estrelas)
 */
function Jogo34({ aoAcertar, aoErrar }) {
  // A ronda atual: { palavra, emoji, alvo, opcoes } (null enquanto carrega)
  const [ronda, setRonda] = useState(null)
  // Quantas rondas a criança já acertou (faz a fila crescer de 4 para 6)
  const [acertos, setAcertos] = useState(0)
  // A última letra tocada: { letra, certa, vez } (null = ainda nada nesta ronda)
  const [resposta, setResposta] = useState(null)

  const temporizador = useRef(null)
  const jaComecou = useRef(false)

  /** Tira a próxima palavra do saco e prepara a ronda. */
  async function novaRonda(acertosAteAgora) {
    const palavra = await proximaPalavra('3-4', TODAS)
    const { emoji } = LISTA.find((p) => p.palavra === palavra)
    setRonda({ palavra, emoji, ...criarRondaLetra(palavra, quantidadeDeLetras(acertosAteAgora)) })
    setResposta(null)
  }

  // Primeira ronda ao abrir o jogo. O jaComecou evita tirar duas palavras
  // do saco quando o React corre este efeito duas vezes (modo de desenvolvimento).
  useEffect(() => {
    if (jaComecou.current) return
    jaComecou.current = true
    novaRonda(0)
  }, [])

  // Ao sair do jogo, cancela a passagem automática para a ronda seguinte
  useEffect(() => () => clearTimeout(temporizador.current), [])

  function tocarNaLetra(letra) {
    if (!ronda || resposta?.certa) return // já acertou: espera pela ronda seguinte

    if (letra === ronda.alvo) {
      const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
      setResposta({ letra, certa: true })
      const novosAcertos = acertos + 1
      setAcertos(novosAcertos)
      if (!acabou) temporizador.current = setTimeout(() => novaRonda(novosAcertos), ESPERA_DEPOIS_DE_ACERTAR)
    } else {
      aoErrar?.()
      // `vez` conta os erros, para a animação de abanar repetir mesmo na mesma letra
      setResposta((anterior) => ({ letra, certa: false, vez: (anterior?.vez ?? 0) + 1 }))
    }
  }

  if (!ronda) return null // ainda a carregar a primeira palavra

  // Acertar a letra é acabar a ronda: mensagem de fim e festa
  const mensagem = resposta && { tipo: resposta.certa ? 'fim' : 'erro', vez: resposta.vez }

  return (
    <>
      {/* Balão de fala do Panda, com a letra a encontrar */}
      <AnimatePresence mode="wait">
        <motion.div
          key={ronda.palavra}
          className={styles.balao}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <span className={styles.letraGrande} aria-label={`Letra ${ronda.alvo}`}>
            {ronda.alvo}
          </span>
          <span className={styles.exemplo}>
            <span aria-hidden="true">{ronda.emoji}</span>{' '}
            <span className={styles.destaque}>{ronda.palavra[0]}</span>
            {ronda.palavra.slice(1)}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Reação do Panda depois de cada toque */}
      <BalaoMascote emoji="🐼" mensagem={mensagem} textos={{ fim: 'Boa!' }} className={styles.mensagem} />

      {/* Festa a partir da fila de letras */}
      {resposta?.certa && <Festa semente={ronda.palavra} origem={{ x: 34, y: 80 }} />}

      {/* Fila de letras para escolher */}
      <div className={styles.fila} key={ronda.palavra}>
        {ronda.opcoes.map((letra, i) => {
          const tocada = resposta?.letra === letra
          const certa = tocada && resposta.certa
          const errada = tocada && !resposta.certa

          return (
            <motion.button
              // Na letra errada, a chave muda a cada erro para repetir o abanão
              key={errada ? `${letra}-${resposta.vez}` : letra}
              type="button"
              className={`${styles.letra} ${certa ? styles.certa : ''}`}
              onClick={() => tocarNaLetra(letra)}
              aria-label={`Letra ${letra}`}
              initial={errada ? false : { opacity: 0, y: 20 }}
              animate={
                certa
                  ? { opacity: 1, y: 0, scale: [1, 1.3, 1] }
                  : errada
                    ? { opacity: 1, y: 0, x: [0, -10, 10, -7, 7, 0] }
                    : { opacity: 1, y: 0 }
              }
              transition={errada || certa ? { duration: 0.45 } : { delay: i * 0.06 }}
              whileTap={{ scale: 0.9 }}
            >
              {letra}
            </motion.button>
          )
        })}
      </div>
    </>
  )
}

export default Jogo34
