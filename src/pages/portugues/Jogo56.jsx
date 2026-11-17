import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import palavras from '../../data/palavras.json'
import { gerarGrelha } from '../../games/portugues/grelha'
import { proximaPalavra } from '../../games/portugues/memoria'
import BalaoMascote from '../../components/BalaoMascote'
import Festa from '../../components/Festa'
import ImagemPalavra from '../../components/ImagemPalavra'
import Grelha from './Grelha'
import styles from './Jogo56.module.css'

const LISTA = palavras['5-6'] // [{ palavra: 'GATO', emoji: '🐱' }, ...]
const TODAS = LISTA.map((p) => p.palavra)
const ESPERA_DEPOIS_DE_ACERTAR = 1800 // milissegundos até à palavra seguinte

/**
 * Jogo dos 5–6 anos: encontrar a palavra (mostrada com emoji) na grelha 6x6.
 * Uma ronda só (uma grelha): no fim chama aoProxima().
 * Props: aoAcertar() e aoErrar() — avisam a página (sons e estrelas);
 * aoProxima() — passar à ronda seguinte (a página sorteia o jogo);
 * contador — o contador de estrelas, que fica por baixo do cartão da palavra.
 */
function Jogo56({ aoAcertar, aoErrar: avisarErro, aoProxima, contador }) {
  // A ronda: { palavra, emoji, letras } (null enquanto carrega)
  const [ronda, setRonda] = useState(null)
  // Palavras encontradas nesta ronda: [{ palavra, celulas }]
  const [encontradas, setEncontradas] = useState([])
  // Mensagem da mascote: null ou { tipo: 'erro' | 'fim', vez }
  const [mensagem, setMensagem] = useState(null)

  const temporizador = useRef(null)
  const jaComecou = useRef(false)

  // Tira a palavra do saco e gera a grelha (o jaComecou evita gastar duas
  // palavras em desenvolvimento)
  useEffect(() => {
    if (jaComecou.current) return
    jaComecou.current = true
    proximaPalavra('5-6', TODAS).then((palavra) => {
      const { emoji } = LISTA.find((p) => p.palavra === palavra)
      const { letras } = gerarGrelha({ tamanho: 6, palavras: [palavra], direcoes: ['horizontal'] })
      setRonda({ palavra, emoji, letras })
    })
  }, [])

  // Ao sair do jogo, cancela a passagem automática para a ronda seguinte
  useEffect(() => () => clearTimeout(temporizador.current), [])

  function aoEncontrar(palavra, celulas) {
    const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
    setEncontradas([{ palavra, celulas }])
    setMensagem((anterior) => ({ tipo: 'fim', vez: (anterior?.vez ?? 0) + 1 }))
    if (!acabou) temporizador.current = setTimeout(() => aoProxima?.(), ESPERA_DEPOIS_DE_ACERTAR)
  }

  function aoErrar() {
    avisarErro?.()
    setMensagem((anterior) => ({ tipo: 'erro', vez: (anterior?.vez ?? 0) + 1 }))
  }

  if (!ronda) return null // ainda a carregar

  const acabou = encontradas.length > 0

  return (
    <>
      {/* Grelha à esquerda, a usar a altura quase toda */}
      <div className={styles.zonaGrelha}>
        <Grelha
          key={ronda.palavra}
          letras={ronda.letras}
          porEncontrar={acabou ? [] : [ronda.palavra]}
          encontradas={encontradas}
          aoEncontrar={aoEncontrar}
          aoErrar={aoErrar}
          bloqueada={acabou}
        />
      </div>

      {/* À direita: o que procurar */}
      <div className={styles.lado}>
        <BalaoMascote
          mensagem={mensagem}
          textos={{ fim: 'Boa! Encontraste!' }}
          className={styles.mensagem}
        />

        {/* Cartão e contador numa coluna com a largura do cartão */}
        <div className={styles.cartaoEContador}>
          <AnimatePresence mode="wait">
            <motion.div
              key={ronda.palavra}
              className={styles.cartao}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: acabou ? [1, 1.12, 1] : 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            >
              <ImagemPalavra palavra={ronda.palavra} emoji={ronda.emoji} className={styles.emoji} />
              {/* A palavra, letra a letra; ficam verdes quando é encontrada */}
              <span className={styles.palavra} aria-label={`Procura: ${ronda.palavra}`}>
                {[...ronda.palavra].map((letra, i) => (
                  <span key={i} className={`${styles.letra} ${acabou ? styles.letraCerta : ''}`}>
                    {letra}
                  </span>
                ))}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* O contador de estrelas, por baixo do cartão e da mesma largura (vem da página) */}
          {contador}
        </div>
      </div>

      {/* Festa a partir do cartão com a palavra */}
      {acabou && <Festa semente={ronda.palavra} origem={{ x: 81, y: 68 }} />}
    </>
  )
}

export default Jogo56
